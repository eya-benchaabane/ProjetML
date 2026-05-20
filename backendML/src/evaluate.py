"""
evaluate.py — Analyse et comparaison des runs MLflow
=====================================================
Usage :
    python src/evaluate.py
"""

import mlflow
import pandas as pd
import warnings
warnings.filterwarnings("ignore")


# 1. Charger tous les runs MLflow

def load_all_runs(experiment_name: str = "Churn_Prediction") -> pd.DataFrame:
    """Récupère tous les runs de l'expérience MLflow."""
    mlflow.set_experiment(experiment_name)
    experiment = mlflow.get_experiment_by_name(experiment_name)

    if experiment is None:
        raise ValueError(f"Expérience '{experiment_name}' introuvable. "
                         "Lance d'abord train.py")

    runs = mlflow.search_runs(
        experiment_ids=[experiment.experiment_id],
        order_by=["metrics.f1_score DESC"]
    )
    return runs



# 2. Nettoyer et formater le DataFrame

def format_runs(runs: pd.DataFrame) -> pd.DataFrame:
    """Sélectionne et renomme les colonnes utiles."""
    cols = {
        "tags.mlflow.runName": "Run",
        "params.algorithm":    "Algorithme",
        "metrics.accuracy":    "Accuracy",
        "metrics.precision":   "Precision",
        "metrics.recall":      "Recall",
        "metrics.f1_score":    "F1-Score",
    }

    # Garder seulement les colonnes disponibles
    available = {k: v for k, v in cols.items() if k in runs.columns}
    df = runs[list(available.keys())].rename(columns=available).copy()

    # Ajouter les hyperparamètres pertinents en une colonne lisible
    param_cols = [c for c in runs.columns
                  if c.startswith("params.") and c not in cols]

    def build_params(row):
        parts = []
        for col in param_cols:
            val = runs.loc[row.name, col]
            if pd.notna(val):
                key = col.replace("params.", "")
                if key != "algorithm":
                    parts.append(f"{key}={val}")
        return ", ".join(parts)

    df["Paramètres"] = runs.apply(build_params, axis=1)

    # Arrondir les métriques
    for m in ["Accuracy", "Precision", "Recall", "F1-Score"]:
        if m in df.columns:
            df[m] = df[m].round(4)

    return df.reset_index(drop=True)



# 3. Afficher le tableau comparatif

def print_comparison_table(df: pd.DataFrame):
    """Affiche un tableau comparatif propre dans le terminal."""
    print("\n" + "="*80)
    print("   TABLEAU COMPARATIF DES MODÈLES — Churn Prediction")
    print("="*80)

    display_cols = ["Run", "Paramètres", "Accuracy", "Precision", "Recall", "F1-Score"]
    display_cols = [c for c in display_cols if c in df.columns]

    print(df[display_cols].to_string(index=True))
    print("="*80)



# 4. Analyse critique automatique

def analyse_critique(df: pd.DataFrame):
    """Répond automatiquement aux questions d'analyse du projet."""

    print("\n" + "="*80)
    print("   ANALYSE CRITIQUE")
    print("="*80)

    # Meilleur modèle global (F1-Score)
    best_idx = df["F1-Score"].idxmax()
    best = df.loc[best_idx]
    print(f"\n Meilleur modèle (F1-Score) :")
    print(f"   -> {best['Run']}  |  F1={best['F1-Score']}  |  "
          f"Accuracy={best['Accuracy']}")

    # Meilleur par algorithme
    print("\n Meilleur run par algorithme :")
    if "Algorithme" in df.columns:
        for algo, group in df.groupby("Algorithme"):
            best_algo = group.loc[group["F1-Score"].idxmax()]
            print(f"   {algo:<25} F1={best_algo['F1-Score']:.4f}  "
                  f"Acc={best_algo['Accuracy']:.4f}  "
                  f"({best_algo['Paramètres']})")

    # PCA : améliore-t-elle les résultats ?
    print("\n Impact de la réduction de dimension (PCA) :")
    pca_runs = df[df["Run"].str.startswith("PCA")] if "Run" in df.columns else pd.DataFrame()
    rf_runs  = df[df["Run"].str.startswith("RF")]  if "Run" in df.columns else pd.DataFrame()

    if not pca_runs.empty and not rf_runs.empty:
        avg_pca = pca_runs["F1-Score"].mean()
        avg_rf  = rf_runs["F1-Score"].mean()
        diff    = avg_pca - avg_rf
        print(f"   F1 moyen Random Forest sans PCA : {avg_rf:.4f}")
        print(f"   F1 moyen PCA + Random Forest    : {avg_pca:.4f}")
        if diff > 0:
            print(f"    PCA améliore les résultats de +{diff:.4f}")
        else:
            print(f"    PCA n'améliore pas les résultats ({diff:.4f})")
    else:
        print("   (Pas assez de données pour comparer)")

    # Comparaison des méthodes de Boosting
    print("\n Comparaison des méthodes de Boosting :")
    if "Algorithme" in df.columns:
        ada_runs = df[df["Algorithme"] == "AdaBoost"]
        xgb_runs = df[df["Algorithme"] == "XGBoost"]

        if not ada_runs.empty:
            best_ada = ada_runs.loc[ada_runs["F1-Score"].idxmax()]
            print(f"   Meilleur AdaBoost : F1={best_ada['F1-Score']:.4f}  "
                  f"Acc={best_ada['Accuracy']:.4f}  ({best_ada['Paramètres']})")
        else:
            print("   AdaBoost : aucun run trouvé")

        if not xgb_runs.empty:
            best_xgb = xgb_runs.loc[xgb_runs["F1-Score"].idxmax()]
            print(f"   Meilleur XGBoost  : F1={best_xgb['F1-Score']:.4f}  "
                  f"Acc={best_xgb['Accuracy']:.4f}  ({best_xgb['Paramètres']})")
        else:
            print("   XGBoost : aucun run trouvé")

        if not ada_runs.empty and not xgb_runs.empty:
            best_ada_f1 = ada_runs["F1-Score"].max()
            best_xgb_f1 = xgb_runs["F1-Score"].max()
            if best_xgb_f1 > best_ada_f1:
                print(f"   XGBoost surpasse AdaBoost de +{best_xgb_f1 - best_ada_f1:.4f} en F1-Score")
            elif best_ada_f1 > best_xgb_f1:
                print(f"   AdaBoost surpasse XGBoost de +{best_ada_f1 - best_xgb_f1:.4f} en F1-Score")
            else:
                print(f"   AdaBoost et XGBoost ont des performances identiques")

    print("\n" + "="*80)



# 5. Sauvegarder en CSV

def save_results(df: pd.DataFrame, path: str = "models/comparison_results.csv"):
    """Sauvegarde le tableau comparatif dans un CSV."""
    import os
    os.makedirs(os.path.dirname(path), exist_ok=True)
    df.to_csv(path, index=False)
    print(f"\n Résultats sauvegardés dans : {path}")



# MAIN

if __name__ == "__main__":
    print("\n Chargement des runs MLflow...")
    runs_raw = load_all_runs("Churn_Prediction")

    if runs_raw.empty:
        print("Aucun run trouvé. Lance d'abord : python src/train.py")
    else:
        print(f" {len(runs_raw)} runs chargés.")
        df = format_runs(runs_raw)
        print_comparison_table(df)
        analyse_critique(df)
        save_results(df)
        print("\n Évaluation terminée !")