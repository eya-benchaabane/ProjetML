"""
retrain.py — Ré-entraînement rapide déclenché par la détection de drift
========================================================================
Entraîne un modèle XGBoost (config fixe) et logue les métriques dans MLflow.
Utilisé par drift_detection.py au lieu de train.py (trop long : toutes les grilles).
"""

import warnings

warnings.filterwarnings("ignore")

import mlflow
import mlflow.sklearn
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from xgboost import XGBClassifier

from data_loader import load_data


def retrain(trigger_reason: str = "data_drift") -> dict:
    X_train, X_test, y_train, y_test = load_data()

    model = XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
    )

    mlflow.set_experiment("Churn_Prediction")

    with mlflow.start_run(run_name=f"AutoRetrain_Drift_{trigger_reason}"):
        mlflow.set_tag("trigger", "drift_auto_retrain")
        mlflow.set_tag("trigger_reason", trigger_reason)
        mlflow.log_param("algorithm", "XGBoost")
        mlflow.log_param("n_estimators", 200)
        mlflow.log_param("max_depth", 5)
        mlflow.log_param("learning_rate", 0.1)

        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        metrics = {
            "accuracy": accuracy_score(y_test, y_pred),
            "precision": precision_score(y_test, y_pred),
            "recall": recall_score(y_test, y_pred),
            "f1_score": f1_score(y_test, y_pred),
        }

        for name, value in metrics.items():
            mlflow.log_metric(name, value)

        mlflow.sklearn.log_model(model, "model")

    return metrics


if __name__ == "__main__":
    print("=" * 55)
    print("   RÉ-ENTRAÎNEMENT AUTOMATIQUE (post-drift)")
    print("=" * 55)
    result = retrain()
    print(
        f"  Modèle ré-entraîné — "
        f"Accuracy={result['accuracy']:.4f} | F1={result['f1_score']:.4f}"
    )
