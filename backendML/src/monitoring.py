"""
monitoring.py — Monitoring continu du Data Drift
================================================
Script pour surveiller le drift periodiquement et déclencher 
des ré-entraînements automatiques si nécessaire.

Usage:
    python src/monitoring.py --interval 3600 --noise 0.2
"""

import time
import argparse
import subprocess
import os
from datetime import datetime
import json
import warnings
warnings.filterwarnings("ignore")

import pandas as pd
from drift_detection import main as drift_detection_main


def run_monitoring_session(interval=3600, noise_level=0.3, max_iterations=None):
    """
    Exécute le monitoring continu du drift.
    
    Args:
        interval: Intervalle en secondes entre les vérifications (défaut: 1 heure)
        noise_level: Niveau de bruit pour la simulation
        max_iterations: Nombre max d'itérations (None = infini)
    """
    print("="*70)
    print("   📊 MONITORING CONTINU DU DATA DRIFT")
    print("="*70)
    print(f"Intervalle de vérification: {interval}s ({interval/3600:.1f}h)")
    print(f"Niveau de bruit: {noise_level}")
    print(f"Max itérations: {max_iterations if max_iterations else 'Infini'}")
    print("-"*70)
    
    iteration = 0
    monitoring_history = []
    
    try:
        while True:
            iteration += 1
            
            if max_iterations and iteration > max_iterations:
                print(f"\n✅ Max itérations ({max_iterations}) atteint. Arrêt du monitoring.")
                break
            
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"\n[Itération {iteration}] {timestamp}")
            print("="*70)
            
            # Exécuter la détection de drift
            try:
                drift_detection_main(
                    seuil_drift=0.30,
                    noise_level=noise_level,
                    trigger_retraining=True
                )
                
                monitoring_history.append({
                    "iteration": iteration,
                    "timestamp": timestamp,
                    "status": "success"
                })
                
            except Exception as e:
                print(f"\n❌ Erreur lors de la détection: {e}")
                monitoring_history.append({
                    "iteration": iteration,
                    "timestamp": timestamp,
                    "status": "error",
                    "error": str(e)
                })
            
            # Sauvegarder l'historique
            history_file = "monitoring_history.json"
            with open(history_file, "w") as f:
                json.dump(monitoring_history, f, indent=2)
            
            # Attendre avant la prochaine vérification
            if max_iterations is None or iteration < max_iterations:
                print(f"\n⏳ Prochaine vérification dans {interval}s ({interval/3600:.1f}h)...")
                time.sleep(interval)
    
    except KeyboardInterrupt:
        print("\n\n🛑 Monitoring arrêté par l'utilisateur")
    
    finally:
        print("\n" + "="*70)
        print(f"✨ Monitoring terminé après {iteration} itération(s)")
        print("="*70)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Monitoring continu du Data Drift"
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=3600,
        help="Intervalle en secondes entre les vérifications (défaut: 3600 = 1h)"
    )
    parser.add_argument(
        "--noise",
        type=float,
        default=0.3,
        help="Niveau de bruit pour la simulation (défaut: 0.3)"
    )
    parser.add_argument(
        "--iterations",
        type=int,
        default=None,
        help="Nombre max d'itérations (défaut: infini)"
    )
    
    args = parser.parse_args()
    
    run_monitoring_session(
        interval=args.interval,
        noise_level=args.noise,
        max_iterations=args.iterations
    )
