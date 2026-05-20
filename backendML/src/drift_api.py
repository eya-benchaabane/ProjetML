"""
drift_api.py — API REST pour exposer les métriques de drift
===========================================================
Fournit des endpoints pour le frontend pour consulter 
les résultats du monitoring et de la détection de drift.

Usage:
    python src/drift_api.py
"""

import json
import os
from datetime import datetime
from pathlib import Path
import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS

from drift_detection import detect_drift_ks, detect_drift_evidently, simulate_drift
from data_loader import load_data


app = Flask(__name__)
CORS(app)


# ============================================================================
# Endpoints
# ============================================================================

@app.route("/api/drift/latest", methods=["GET"])
def get_latest_drift():
    """Retourne les dernières métriques de drift détectées."""
    try:
        X_train, X_test, y_train, y_test = load_data()
        X_current = simulate_drift(X_test)
        
        # Détection KS
        drifted_cols_ks, drift_share_ks, ks_details = detect_drift_ks(X_train, X_current)
        
        # Détection Evidently
        report_path = "reports/evidently_drift_report.html"
        ev_metrics = detect_drift_evidently(X_train, X_current, report_path)
        
        return jsonify({
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "ks_test": {
                "drift_share": float(drift_share_ks),
                "drifted_features_count": len(drifted_cols_ks),
                "drifted_features": drifted_cols_ks
            },
            "evidently": {
                "drift_share": float(ev_metrics.get("drift_share", 0)),
                "is_drifted": bool(ev_metrics.get("is_drifted", False)),
                "drifted_features_count": int(ev_metrics.get("drifted_features_count", 0))
            },
            "report_path": ev_metrics.get("report_path")
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/drift/history", methods=["GET"])
def get_drift_history():
    """Retourne l'historique du monitoring."""
    try:
        history_file = "monitoring_history.json"
        if os.path.exists(history_file):
            with open(history_file, "r") as f:
                history = json.load(f)
            return jsonify({
                "status": "success",
                "count": len(history),
                "history": history
            })
        else:
            return jsonify({
                "status": "success",
                "count": 0,
                "history": [],
                "message": "Aucun historique disponible"
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/drift/ks-details", methods=["GET"])
def get_ks_details():
    """Retourne les détails du test KS pour chaque feature."""
    try:
        X_train, X_test, y_train, y_test = load_data()
        X_current = simulate_drift(X_test)
        
        drifted_cols_ks, drift_share_ks, ks_details = detect_drift_ks(X_train, X_current)
        
        # Formater les détails
        details_formatted = []
        for col, metrics in ks_details.items():
            details_formatted.append({
                "feature": col,
                "ks_statistic": float(metrics["stat"]),
                "p_value": float(metrics["p_value"]),
                "is_drifted": bool(metrics["drifted"]),
                "significance_level": 0.05
            })
        
        # Trier par p-value (features les plus driftées en premier)
        details_formatted.sort(key=lambda x: x["p_value"])
        
        return jsonify({
            "status": "success",
            "total_features": len(details_formatted),
            "drifted_features": len(drifted_cols_ks),
            "drift_share": float(drift_share_ks),
            "details": details_formatted
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/drift/stats", methods=["GET"])
def get_drift_statistics():
    """Retourne des statistiques de comparaison train/test."""
    try:
        X_train, X_test, y_train, y_test = load_data()
        X_current = simulate_drift(X_test)
        
        numeric_cols = X_train.select_dtypes(include=[np.number]).columns.tolist()
        
        stats = []
        for col in numeric_cols[:10]:  # Top 10 features
            train_stats = {
                "mean": float(X_train[col].mean()),
                "std": float(X_train[col].std()),
                "min": float(X_train[col].min()),
                "max": float(X_train[col].max()),
                "median": float(X_train[col].median())
            }
            
            current_stats = {
                "mean": float(X_current[col].mean()),
                "std": float(X_current[col].std()),
                "min": float(X_current[col].min()),
                "max": float(X_current[col].max()),
                "median": float(X_current[col].median())
            }
            
            stats.append({
                "feature": col,
                "train": train_stats,
                "current": current_stats,
                "mean_shift": float(current_stats["mean"] - train_stats["mean"]),
                "std_ratio": float(current_stats["std"] / (train_stats["std"] + 1e-8))
            })
        
        return jsonify({
            "status": "success",
            "statistics": stats
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/drift/report", methods=["GET"])
def get_drift_report_path():
    """Retourne le chemin du rapport HTML Evidently."""
    try:
        report_path = "reports/evidently_drift_report.html"
        if os.path.exists(report_path):
            return jsonify({
                "status": "success",
                "report_path": report_path,
                "exists": True
            })
        else:
            return jsonify({
                "status": "success",
                "report_path": report_path,
                "exists": False,
                "message": "Rapport non généré, exécutez drift_detection.py d'abord"
            })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Drift Detection API"
    })


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    port = int(os.getenv("DRIFT_API_PORT", 5001))
    debug = os.getenv("DRIFT_API_DEBUG", "True").lower() == "true"
    
    print("="*70)
    print("   🚀 DRIFT DETECTION API")
    print("="*70)
    print(f"Port: {port}")
    print(f"Debug: {debug}")
    print("-"*70)
    print("Endpoints disponibles:")
    print("  GET  /api/drift/latest        - Dernières métriques de drift")
    print("  GET  /api/drift/history       - Historique du monitoring")
    print("  GET  /api/drift/ks-details    - Détails test KS")
    print("  GET  /api/drift/stats         - Statistiques train/current")
    print("  GET  /api/drift/report        - Chemin rapport Evidently")
    print("  GET  /api/health              - Health check")
    print("="*70)
    
    app.run(host="0.0.0.0", port=port, debug=debug)
