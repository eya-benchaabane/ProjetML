# 🔍 Data Drift Detection & Auto-Retraining Pipeline

Documentation complète du pipeline MLOps de détection de drift et ré-entraînement automatique.

## 📊 Vue d'ensemble

Ce pipeline implémente une boucle MLOps complète:

```
┌─────────────────────────────────────────────────────────┐
│  1. Simulation du Drift                                 │
│     (modification artificielle des données de test)     │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. Détection Multi-Approches                           │
│     ✓ KS-Test (Kolmogorov-Smirnov) - Test statistique   │
│     ✓ Evidently - Rapport HTML visuel avec drift share  │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. Logging MLflow                                      │
│     ✓ Métriques: drift_share, drifted_features_count   │
│     ✓ Artefacts: rapports HTML, détails KS             │
│     ✓ Paramètres: seuils, niveaux de bruit             │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. Décision Automatique                                │
│     IF drift_share > seuil (ex: 30%)                    │
│        THEN déclencher ré-entraînement                  │
│     ELSE signaler: données stables                      │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. Ré-entraînement (si déclenché)                      │
│     ✓ Exécution train.py                               │
│     ✓ Entraînement de nouveaux modèles                 │
│     ✓ Evaluation et logging MLflow                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Utilisation Rapide

### 1. Installation des dépendances

```bash
pip install -r requirements_drift.txt
```

**Packages requis:**
- `evidently` — Rapports visuels de drift
- `scipy` — Tests statistiques KS
- `mlflow` — Logging des métriques
- `flask` — API REST pour monitoring
- `flask-cors` — CORS pour frontend

### 2. Exécution unique de la détection

```bash
# Mode par défaut (seuil: 30%, noise: 0.3)
python src/drift_detection.py

# Avec paramètres personnalisés
python src/drift_detection.py --seuil 0.25 --noise 0.2 --no-retrain

# Seuil très élevé (pour tester sans ré-entraîner)
python src/drift_detection.py --seuil 1.0
```

**Paramètres:**
- `--seuil` : Seuil de drift share pour déclencher ré-entraînement (défaut: 0.30)
- `--noise` : Niveau de bruit simulation (défaut: 0.3)
- `--no-retrain` : Désactiver ré-entraînement automatique

### 3. Monitoring continu

```bash
# Vérifier le drift toutes les heures (3600 secondes)
python src/monitoring.py --interval 3600 --noise 0.3

# Vérifier toutes les 5 minutes (test)
python src/monitoring.py --interval 300 --noise 0.2 --iterations 10

# Arrêter avec Ctrl+C
```

**Paramètres:**
- `--interval` : Intervalle en secondes (défaut: 3600 = 1h)
- `--noise` : Niveau de bruit (défaut: 0.3)
- `--iterations` : Max itérations (défaut: infini)

### 4. API REST pour le Frontend

```bash
# Démarrer l'API (écoute sur http://localhost:5001)
python src/drift_api.py

# Ou avec port personnalisé
DRIFT_API_PORT=5001 python src/drift_api.py
```

---

## 📌 Approches de Détection

### KS-Test (Kolmogorov-Smirnov)

```
Principe: Compare les distributions des features entre train et current
Sortie: p-value pour chaque feature (p-value < 0.05 = drift détecté)

Avantages:
✓ Rapide et simple
✓ Fournit statistiques par feature
✓ No dependencies complexes

Limitations:
✗ 1D (teste chaque feature indépendamment)
✗ Ne détecte pas les drifts multivariés
```

**Exemple de sortie:**
```json
{
  "feature_1": {
    "ks_statistic": 0.325,
    "p_value": 0.0001,
    "is_drifted": true
  },
  "feature_2": {
    "ks_statistic": 0.045,
    "p_value": 0.8234,
    "is_drifted": false
  }
}
```

### Evidently (Visual Report)

```
Principe: Analyse complète du drift dataset avec visualisations
Sortie: Rapport HTML + drift_share (0-1)

Avantages:
✓ Détection multivariée
✓ Visualisations HTML interactives
✓ Détecte différents types de drifts (target, prediction, feature)

Limitations:
✗ Plus lent (génère HTML complexe)
✗ Requiert plus de mémoire
```

**Métadonnées rapportées:**
```json
{
  "drift_share": 0.35,           // % de dataset drifté
  "is_drifted": true,            // Drift détecté?
  "drifted_features_count": 7    // Nombre de features driftées
}
```

---

## 📊 Fichiers Générés

```
backendML/
├── reports/
│   ├── evidently_drift_report.html      ← Rapport visuel HTML
│   └── ks_test_details.json             ← Détails test KS
├── monitoring_history.json              ← Historique monitoring
├── mlruns/                              ← Runs MLflow
│   └── 1/Data_Drift_Monitoring/...     ← Expérience drift
└── src/
    ├── drift_detection.py               ← Main pipeline
    ├── monitoring.py                    ← Monitoring continu
    └── drift_api.py                     ← API REST
```

---

## 📈 Métriques Loggées dans MLflow

### Paramètres
```
- simulation_noise        : Niveau de bruit appliqué
- ks_p_value_threshold   : Seuil p-value KS (0.05)
- drift_threshold        : Seuil pour ré-entraînement (0.30)
```

### Métriques
```
- drift_share_ks                 : % features driftées (KS-Test)
- drifted_features_count_ks      : Nombre features driftées (KS)
- drift_share_evidently          : Drift share Evidently
- drifted_features_count_evidently: Nombre features driftées (Evidently)
- is_dataset_drifted             : Boolean (0/1) = drift détecté?
```

### Artefacts
```
- evidently_reports/evidently_drift_report.html
- ks_test_details.json
```

---

## 🔄 Boucle Automatique

### Scénario 1: Drift Détecté (drift_share ≥ 30%)

```
drift_detection.py
  ↓
[Détection: drift_share = 35%]
  ↓
[Seuil 30% DÉPASSÉ] ⚠️
  ↓
🔄 Appel automatique: train.py
  ↓
[Entraînement nouveaux modèles]
  ↓
[Logging MLflow + évaluation]
  ↓
✅ Pipeline complété
```

### Scénario 2: Pas de Drift (drift_share < 30%)

```
drift_detection.py
  ↓
[Détection: drift_share = 15%]
  ↓
[Seuil 30% NON dépassé] ✅
  ↓
✔️ Aucun ré-entraînement
  ↓
📊 Données stables
```

---

## 🛠️ API Endpoints

### GET /api/drift/latest
Retourne les dernières métriques de drift

```bash
curl http://localhost:5001/api/drift/latest
```

Response:
```json
{
  "status": "success",
  "timestamp": "2024-05-19T14:30:00",
  "ks_test": {
    "drift_share": 0.35,
    "drifted_features_count": 7,
    "drifted_features": ["age", "monthly_charges", ...]
  },
  "evidently": {
    "drift_share": 0.38,
    "is_drifted": true,
    "drifted_features_count": 8
  }
}
```

### GET /api/drift/history
Historique du monitoring

```bash
curl http://localhost:5001/api/drift/history
```

### GET /api/drift/ks-details
Détails test KS par feature

```bash
curl http://localhost:5001/api/drift/ks-details
```

### GET /api/drift/stats
Statistiques train vs current

```bash
curl http://localhost:5001/api/drift/stats
```

### GET /api/drift/report
Chemin du rapport HTML Evidently

```bash
curl http://localhost:5001/api/drift/report
```

### GET /api/health
Health check

```bash
curl http://localhost:5001/api/health
```

---

## 📝 Simulation du Drift

Le drift est simulé en modifiant les données de test:

```python
def simulate_drift(df_test, noise_level=0.3):
    """
    1. Décale la moyenne: mean += std_dev * 1.5
    2. Ajoute du bruit: noise ~ N(mean=std*1.5, sigma=std*noise_level)
    
    Résultat: Distribution shift + variance augmentée
    """
```

**Exemple avec age:**
```
Train:  age ~ N(40, 15)           [mean=40, std=15]
Current: age ~ N(63, 19.5)        [mean=40+23, std=15*1.3]
         ↑                          ↑
         Décalage de 23 ans         Bruit augmenté
```

---

## 🔍 Interprétation des Résultats

### KS-Test
```
p-value < 0.05  → Drift significatif (rejeter H0)
p-value ≥ 0.05  → Pas de drift statistique (H0 non rejetée)

Interprétation:
- KS-stat proche de 0   → Distributions similaires
- KS-stat proche de 1   → Distributions très différentes
```

### Evidently Drift Share
```
drift_share = 0.0  → Aucun drift
drift_share = 0.5  → 50% du dataset drifté
drift_share = 1.0  → Drift critique

Seuil recommandé: 0.25-0.30 pour déclencher action
```

---

## ⚙️ Configuration Avancée

### Modifier le seuil de drift

```bash
# Seuil plus strict (ré-entraîner plus souvent)
python src/drift_detection.py --seuil 0.15

# Seuil plus laxiste (ré-entraîner moins souvent)  
python src/drift_detection.py --seuil 0.50
```

### Monitoring avec intervalle court (test)

```bash
# Vérifier toutes les 30 secondes (test local)
python src/monitoring.py --interval 30 --noise 0.2 --iterations 5
```

### Désactiver le ré-entraînement

```bash
# Détection seulement, sans ré-entraîner
python src/drift_detection.py --no-retrain
```

---

## 🧪 Test Complet

Exécutez ce workflow pour tester:

```bash
# 1. Détection unique (drift seuil = 100% = pas de retrain)
python src/drift_detection.py --seuil 1.0
# Résultat: Rapports générés, métriques loggées, AUCUN ré-entraînement

# 2. Vérifier les rapports
open reports/evidently_drift_report.html

# 3. Consulter MLflow
mlflow ui
# Accès: http://localhost:5000

# 4. API test
python src/drift_api.py &
curl http://localhost:5001/api/drift/latest

# 5. Monitoring avec limit
python src/monitoring.py --interval 10 --iterations 2
```

---

## 📚 Fichiers Connexes

- `backendML/src/train.py` — Entraînement des modèles
- `backendML/src/data_loader.py` — Chargement données
- `backendML/src/preprocessing.py` — Prétraitement
- `backendML/src/evaluate.py` — Analyse des runs MLflow

---

## 🐛 Troubleshooting

### "ModuleNotFoundError: No module named 'evidently'"
```bash
pip install evidently
```

### "No such file: data/processed/churn_cleaned.csv"
```bash
# Assurez-vous que preprocessing.py a été exécuté
python src/preprocessing.py
```

### "MLflow experiment not found"
```bash
# MLflow crée l'expérience automatiquement au premier run
# Vérifier: mlflow ui → http://localhost:5000
```

### Rapport HTML vide
```bash
# Relancer la détection pour régénérer
python src/drift_detection.py
```

---

## 📌 Bonnes Pratiques

✅ **À faire:**
- Exécuter drift_detection.py régulièrement (monitoring)
- Surveiller les métriques MLflow
- Analyser les rapports HTML Evidently
- Garder l'API active pour le frontend
- Logger des niveaux de bruit réalistes

❌ **À éviter:**
- Seuils de drift trop bas (trop de ré-entraînements)
- Ignorer les alertes drift prolongées
- Modifier directement les données sans logging
- Exécuter plusieurs instances monitoring simultanément

---

## 📞 Support

Pour questions/bugs:
1. Vérifier les logs terminal
2. Consulter les rapports Evidently
3. Vérifier MLflow UI pour les métriques
4. Vérifier monitoring_history.json pour l'historique

---

**Dernière mise à jour:** 2024-05-19
**Version:** 1.0
