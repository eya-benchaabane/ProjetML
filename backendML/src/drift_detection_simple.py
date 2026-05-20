"""
drift_detection_simple.py — Simplified drift detection without evidently
========================================================================
This is a fallback version that tests drift detection using only KS-test
without requiring evidently. Useful for testing when evidently is not yet installed.

Usage:
    python src/drift_detection_simple.py [--seuil 0.30] [--noise 0.3]
"""

import pandas as pd
import numpy as np
import mlflow
import os
import json
from datetime import datetime
from scipy.stats import ks_2samp
import warnings
warnings.filterwarnings("ignore")

from data_loader import load_data


def simulate_drift(df_test, noise_level=0.3):
    """Simule un drift sur les données de test."""
    df_drifted = df_test.copy()
    numeric_cols = df_drifted.select_dtypes(include=[np.number]).columns.tolist()
    
    print(f"Simulation de drift sur {len(numeric_cols)} variables numériques...")
    
    for col in numeric_cols:
        std_dev = df_drifted[col].std()
        noise = np.random.normal(loc=std_dev * 1.5, scale=std_dev * noise_level, size=len(df_drifted))
        df_drifted[col] = df_drifted[col] + noise
        
    return df_drifted


def detect_drift_ks(df_train, df_test_drifted, p_value_threshold=0.05):
    """Détecte le drift via KS-Test."""
    numeric_cols = df_train.select_dtypes(include=[np.number]).columns.tolist()
    drifted_columns = []
    ks_details = {}
    
    for col in numeric_cols:
        stat, p_value = ks_2samp(df_train[col].dropna(), df_test_drifted[col].dropna())
        ks_details[col] = {
            "stat": float(stat),
            "p_value": float(p_value),
            "drifted": p_value < p_value_threshold
        }
        
        if p_value < p_value_threshold:
            drifted_columns.append(col)
    
    drift_share = len(drifted_columns) / len(numeric_cols) if numeric_cols else 0
    return drifted_columns, drift_share, ks_details


def main(seuil_drift=0.30, noise_level=0.3):
    """Pipeline simplifié sans Evidently."""
    print("="*70)
    print("   🔍 SIMPLIFIED DRIFT DETECTION (KS-Test Only)")
    print("="*70)
    
    # Load data
    print("\n[1️⃣] Chargement des données...")
    X_train, X_test, y_train, y_test = load_data()
    
    # Simulate drift
    print(f"\n[2️⃣] Simulation du drift (noise={noise_level})...")
    X_current = simulate_drift(X_test, noise_level=noise_level)
    print(f"   ✅ {X_current.shape[0]} samples modifiés")
    
    # Detect drift via KS-Test
    print("\n[3️⃣] Détection du drift (KS-Test)...")
    drifted_cols_ks, drift_share_ks, ks_details = detect_drift_ks(X_train, X_current)
    
    total_features = len(X_train.select_dtypes(include=[np.number]).columns)
    print(f"   📊 Features driftées: {len(drifted_cols_ks)}/{total_features}")
    print(f"   📈 Drift share: {drift_share_ks:.1%}")
    
    if drifted_cols_ks:
        cols_display = ", ".join(drifted_cols_ks[:3])
        remaining = f"... +{len(drifted_cols_ks)-3}" if len(drifted_cols_ks) > 3 else ""
        print(f"   🔴 Colonnes: {cols_display}{remaining}")
    
    # Log to MLflow
    print("\n[4️⃣] Enregistrement MLflow...")
    mlflow.set_experiment("Data_Drift_Monitoring")
    
    try:
        with mlflow.start_run(run_name=f"Drift_Simple_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):
            mlflow.log_param("simulation_noise", noise_level)
            mlflow.log_param("ks_p_value_threshold", 0.05)
            mlflow.log_param("drift_threshold", seuil_drift)
            mlflow.log_param("method", "ks_test_only")
            
            mlflow.log_metric("drift_share_ks", drift_share_ks)
            mlflow.log_metric("drifted_features_count", len(drifted_cols_ks))
            mlflow.log_metric("total_features", total_features)
            
            # Save KS details
            os.makedirs("reports", exist_ok=True)
            ks_path = "reports/ks_test_details_simple.json"
            with open(ks_path, "w") as f:
                json.dump(ks_details, f, indent=2)
            mlflow.log_artifact(ks_path)
            
            print(f"   ✅ MLflow enregistré (Run: {mlflow.active_run().info.run_id})")
    except Exception as e:
        print(f"   ⚠️  Erreur MLflow: {e}")
    
    # Decision
    print(f"\n[5️⃣] Vérification seuil ({seuil_drift:.0%})...")
    
    if drift_share_ks >= seuil_drift:
        print(f"   ⚠️  ALERTE: Drift {drift_share_ks:.1%} ≥ {seuil_drift:.0%}")
        print(f"   ℹ️  Ré-entraînement automatique désactivé en mode simplifié")
    else:
        print(f"   ✅ Données stables: {drift_share_ks:.1%} < {seuil_drift:.0%}")
    
    print("\n" + "="*70)
    print("   ✨ Détection simple terminée!")
    print("="*70)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Simplified Drift Detection")
    parser.add_argument("--seuil", type=float, default=0.30)
    parser.add_argument("--noise", type=float, default=0.3)
    
    args = parser.parse_args()
    main(seuil_drift=args.seuil, noise_level=args.noise)
