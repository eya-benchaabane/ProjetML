import pandas as pd
import numpy as np
import mlflow
import os
import subprocess
import sys
from pathlib import Path
from scipy.stats import ks_2samp
import json
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

from data_loader import load_data

BACKEND_ROOT = Path(__file__).resolve().parent.parent

try:
    from evidently.report import Report
    from evidently.metric_preset import DataDriftPreset
except ImportError:
    print("Veuillez installer evidently : pip install evidently")
    print("Installation: pip install evidently")
    exit(1)

def simulate_drift(df_test, noise_level=0.3, mean_shift_factor=1.5, random_state=42):
    """
    Simule un drift sur les données de test : décalage de moyenne + bruit gaussien.
    Les colonnes continues (tenure, charges) reçoivent un drift plus fort ;
    les colonnes binaires encodées reçoivent une perturbation légère.
    """
    if random_state is not None:
        np.random.seed(random_state)

    df_drifted = df_test.copy()
    numeric_cols = df_drifted.select_dtypes(include=[np.number]).columns.tolist()
    continuous_hint = {"tenure", "MonthlyCharges", "TotalCharges"}

    print(f"Simulation de drift sur {len(numeric_cols)} variables numériques...")

    for col in numeric_cols:
        std_dev = float(df_drifted[col].std()) or 1.0
        is_continuous = col in continuous_hint or df_drifted[col].nunique() > 15

        if is_continuous:
            mean_shift = std_dev * mean_shift_factor
            noise = np.random.normal(
                loc=mean_shift,
                scale=std_dev * noise_level,
                size=len(df_drifted),
            )
        else:
            noise = np.random.normal(
                loc=std_dev * 0.3,
                scale=std_dev * noise_level * 0.5,
                size=len(df_drifted),
            )

        df_drifted[col] = df_drifted[col] + noise

    return df_drifted

def detect_drift_ks(df_train, df_test_drifted, p_value_threshold=0.05):
    """
    Détecte le drift via le test de Kolmogorov-Smirnov.
    Retourne la liste des colonnes qui ont drifté, la part de drift, 
    et les statistiques détaillées.
    """
    numeric_cols = df_train.select_dtypes(include=[np.number]).columns.tolist()
    drifted_columns = []
    ks_details = {}
    
    for col in numeric_cols:
        # Test KS
        stat, p_value = ks_2samp(df_train[col].dropna(), df_test_drifted[col].dropna())
        ks_details[col] = {"stat": float(stat), "p_value": float(p_value), "drifted": bool(p_value < p_value_threshold)}
        
        if p_value < p_value_threshold:
            drifted_columns.append(col)
            
    drift_share = len(drifted_columns) / len(numeric_cols) if numeric_cols else 0
    return drifted_columns, drift_share, ks_details

def detect_drift_evidently(df_train, df_test_drifted, output_path="reports/drift_report.html"):
    """
    Génère un rapport de drift HTML avec Evidently.
    Retourne les métriques de drift détaillées.
    """
    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    
    try:
        report = Report(metrics=[DataDriftPreset()])
        report.run(reference_data=df_train, current_data=df_test_drifted)
        report.save_html(output_path)
        
        # Extraire les métriques du dictionnaire Evidently
        report_dict = report.as_dict()
        metrics = report_dict["metrics"][0]["result"]
        
        drifted_features_count = int(metrics.get("number_of_drifted_columns", 0))
        total_columns = int(metrics.get("number_of_columns", 0)) or 1
        dataset_drifted = bool(metrics.get("dataset_drift", False))

        # Evidently >= 0.4 : share_of_drifted_columns ou drift_share
        drift_share = float(
            metrics.get("share_of_drifted_columns")
            or metrics.get("drift_share")
            or (drifted_features_count / total_columns)
        )
        
        return {
            "drift_share": drift_share,
            "is_drifted": dataset_drifted,
            "drifted_features_count": drifted_features_count,
            "report_path": output_path
        }
    except Exception as e:
        print(f"⚠️ Erreur lors de la génération du rapport Evidently : {e}")
        return {
            "drift_share": 0,
            "is_drifted": False,
            "drifted_features_count": 0,
            "report_path": None,
            "error": str(e)
        }

def main(seuil_drift=0.30, noise_level=0.3, trigger_retraining=True):
    """
    Pipeline complet de détection de drift et ré-entraînement automatique.
    
    Args:
        seuil_drift: Seuil de drift share pour déclencher le ré-entraînement (défaut: 30%)
        noise_level: Niveau de bruit pour la simulation de drift (défaut: 0.3)
        trigger_retraining: Déclencher automatiquement le ré-entraînement si True
    """
    print("="*70)
    print("    MLOps PIPELINE — DÉTECTION DE DATA DRIFT ET RÉ-ENTRAÎNEMENT")
    print("="*70)
    
    # 1. Charger les données de référence
    print("\n[1] Chargement des données de référence...")
    X_train, X_test, y_train, y_test = load_data()
    
    # 2. Simuler le drift sur le jeu de test
    print(f"\n[2] Simulation du Data Drift (noise_level={noise_level})...")
    X_current = simulate_drift(X_test, noise_level=noise_level)
    print(f"   Données simulées : {X_current.shape}")
    
    # 3. Détecter le drift avec le test KS
    print("\n[3] Détection par KS-Test (Kolmogorov-Smirnov)...")
    drifted_cols_ks, drift_share_ks, ks_details = detect_drift_ks(X_train, X_current)
    print(f"    Colonnes avec drift: {len(drifted_cols_ks)}/{len(X_train.select_dtypes(include=[np.number]).columns)}")
    print(f"    Part de drift (KS): {drift_share_ks:.1%}")
    
    if drifted_cols_ks:
        print(f"    Colonnes driftées: {', '.join(drifted_cols_ks[:5])}" + 
              (f"... et {len(drifted_cols_ks)-5} autres" if len(drifted_cols_ks) > 5 else ""))
    
    # 4. Générer le rapport Evidently
    print("\n[4] Génération du rapport Evidently (HTML)...")
    report_path = "reports/evidently_drift_report.html"
    evidently_metrics = detect_drift_evidently(X_train, X_current, report_path)
    
    if "error" not in evidently_metrics:
        print(f"    Rapport sauvegardé: {report_path}")
        print(f"    Part de drift (Evidently): {evidently_metrics['drift_share']:.1%}")
        print(f"    Dataset drifté: {'OUI' if evidently_metrics['is_drifted'] else 'NON'}")
        print(f"    Colonnes driftées: {evidently_metrics['drifted_features_count']}")
    else:
        print(f"    Erreur: {evidently_metrics.get('error')}")
    
    # 5. Logger dans MLflow
    print("\n[5] Enregistrement dans MLflow...")
    mlflow.set_experiment("Data_Drift_Monitoring")
    
    try:
        with mlflow.start_run(run_name=f"Drift_Detection_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):
            # Log paramètres de la détection
            mlflow.log_param("simulation_noise", noise_level)
            mlflow.log_param("ks_p_value_threshold", 0.05)
            mlflow.log_param("drift_threshold", seuil_drift)
            
            # Log métriques de drift (KS)
            mlflow.log_metric("drift_share_ks", drift_share_ks)
            mlflow.log_metric("drifted_features_count_ks", len(drifted_cols_ks))
            mlflow.log_metric("drift_share", drift_share_ks)

            drifted_cols_path = "reports/drifted_columns.json"
            with open(drifted_cols_path, "w", encoding="utf-8") as f:
                json.dump(
                    {"ks": drifted_cols_ks, "threshold": seuil_drift},
                    f,
                    indent=2,
                )
            mlflow.log_artifact(drifted_cols_path)
            
            # Log métriques de drift (Evidently)
            mlflow.log_metric("drift_share_evidently", evidently_metrics.get("drift_share", 0))
            mlflow.log_metric("drifted_features_count_evidently", 
                            evidently_metrics.get("drifted_features_count", 0))
            mlflow.log_metric("is_dataset_drifted", 
                            float(evidently_metrics.get("is_drifted", False)))
            
            # Log artefacts détaillés
            ks_details_path = "reports/ks_test_details.json"
            os.makedirs(os.path.dirname(ks_details_path) or ".", exist_ok=True)
            with open(ks_details_path, "w") as f:
                json.dump(ks_details, f, indent=2)
            mlflow.log_artifact(ks_details_path)
            
            # Log le rapport HTML si généré
            if evidently_metrics.get("report_path") and os.path.exists(report_path):
                mlflow.log_artifact(report_path, artifact_path="evidently_reports")
            
            print(f"    Métriques et artefacts enregistrés dans MLflow")
            print(f"   Run ID: {mlflow.active_run().info.run_id}")
    except Exception as e:
        print(f"    Erreur lors du logging MLflow: {e}")
        mlflow.end_run()
    
    # 6. Décider si ré-entraînement est nécessaire
    print(f"\n[6] Analyse du seuil de drift (seuil: {seuil_drift:.0%})...")
    
    drift_share_evidently = evidently_metrics.get("drift_share", 0)
    # Seuil basé sur le % de features driftées (KS), complété par Evidently
    drift_share_final = max(drift_share_ks, drift_share_evidently)

    print(f"   KS drift share: {drift_share_ks:.1%} | Evidently: {drift_share_evidently:.1%}")

    if drift_share_final >= seuil_drift:
        print(f"     ALERTE DRIFT DÉTECTÉ!")
        print(f"    Drift détecté: {drift_share_final:.1%} (seuil: {seuil_drift:.0%})")
        
        if trigger_retraining:
            print(f"\n    Déclenchement du ré-entraînement automatique...")
            print("   " + "-" * 60)
            
            try:
                retrain_script = BACKEND_ROOT / "src" / "retrain.py"
                result = subprocess.run(
                    [sys.executable, str(retrain_script)],
                    cwd=str(BACKEND_ROOT),
                    capture_output=False,
                )
                
                if result.returncode == 0:
                    print("   " + "-" * 60)
                    print(f"    Ré-entraînement terminé avec succès")
                    print(f"    Un nouveau modèle a été entraîné et testé")
                else:
                    print(f"    Erreur lors du ré-entraînement (exit code: {result.returncode})")
                    
            except Exception as e:
                print(f"    Erreur lors du ré-entraînement: {e}")
        else:
            print(f"    Ré-entraînement automatique désactivé")
    else:
        print(f"    Données stables")
        print(f"    Drift détecté: {drift_share_final:.1%} (seuil: {seuil_drift:.0%})")
        print(f"     Aucun ré-entraînement nécessaire")
    
    print("\n" + "="*70)
    print("   ✨ Détection de drift terminée!")
    print("="*70)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Détection de Data Drift et ré-entraînement automatique"
    )
    parser.add_argument(
        "--seuil", 
        type=float, 
        default=0.30,
        help="Seuil de drift share pour déclencher le ré-entraînement (défaut: 0.30)"
    )
    parser.add_argument(
        "--noise",
        type=float,
        default=0.3,
        help="Niveau de bruit pour la simulation (défaut: 0.3)"
    )
    parser.add_argument(
        "--no-retrain",
        action="store_true",
        help="Désactiver le ré-entraînement automatique"
    )
    
    args = parser.parse_args()
    
    main(
        seuil_drift=args.seuil,
        noise_level=args.noise,
        trigger_retraining=not args.no_retrain
    )
