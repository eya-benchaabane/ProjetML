# CI/CD local — ProjetML

Pipeline d’intégration et de déploiement **exécutable sur votre machine**, sans GitHub Actions.

## Étapes du pipeline

| Étape | Description | Mode `--quick` |
|-------|-------------|----------------|
| `setup` | `pip install -r requirements_drift.txt` | oui |
| `data` | Vérifie `data/processed/churn_cleaned.csv` | oui |
| `lint` | `py_compile` sur tous les scripts `src/` | oui |
| `smoke` | `drift_detection_minimal.py` | oui |
| `integration` | `drift_detection.py --seuil 1.0 --no-retrain` | non |
| `artifacts` | Rapports HTML + JSON présents | non |
| `mlflow` | Expérience `Data_Drift_Monitoring` | non |
| `deploy` | `retrain.py` + manifeste (avec `--with-cd`) | option CD |

## Commandes

### PowerShell (recommandé Windows)

```powershell
cd d:\ProjetML
.\ci\run.ps1                 # CI complet (~3-5 min)
.\ci\run.ps1 -Quick           # rapide (~1 min)
.\ci\run.ps1 -WithCD          # CI + ré-entraînement + manifeste
.\ci\run.ps1 -Stage smoke     # une seule étape
```

### Python (toutes plateformes)

```bash
python ci/local_pipeline.py
python ci/local_pipeline.py --quick
python ci/local_pipeline.py --with-cd
python ci/local_pipeline.py --skip-setup
python ci/local_pipeline.py --stage lint
```

### CMD

```cmd
ci\run.bat
ci\run.bat quick
ci\run.bat cd
```

### Via run_pipeline.py

```bash
python run_pipeline.py ci
python run_pipeline.py ci --quick
python run_pipeline.py ci --with-cd
```

## Rapport de run

Après chaque exécution :

- `ci/reports/last_run.json` — statut par étape, durées, message d’erreur

## CD local (`--with-cd`)

1. Ré-entraîne un XGBoost via `retrain.py`
2. Écrit `backendML/models/ci_deploy_manifest.json` (run_id, métriques, horodatage)

## GitHub Actions (CI distant)

Le workflow `.github/workflows/mlops-ci.yml` reprend les mêmes étapes sur `ubuntu-latest` lors d’un push/PR.

## Quand lancer quoi ?

| Situation | Commande |
|-----------|----------|
| Avant chaque commit | `.\ci\run.ps1 -Quick` |
| Avant merge / release | `.\ci\run.ps1` |
| Après drift détecté en prod | `.\ci\run.ps1 -WithCD` |
