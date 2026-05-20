#!/usr/bin/env python3
"""
ci/local_pipeline.py — Pipeline CI/CD local pour ProjetML
=========================================================
Exécute les étapes de validation et (optionnel) de déploiement local
sans dépendre de GitHub Actions.

Usage:
    python ci/local_pipeline.py              # pipeline CI complet
    python ci/local_pipeline.py --quick      # setup + lint + smoke (~1 min)
    python ci/local_pipeline.py --with-cd    # CI + ré-entraînement + manifeste
    python ci/local_pipeline.py --stage lint # une seule étape
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable


PROJECT_ROOT = Path(__file__).resolve().parent.parent
BACKEND_ROOT = PROJECT_ROOT / "backendML"
SRC_DIR = BACKEND_ROOT / "src"
REPORTS_DIR = BACKEND_ROOT / "reports"
CI_REPORTS_DIR = PROJECT_ROOT / "ci" / "reports"
REQUIREMENTS = BACKEND_ROOT / "requirements_drift.txt"
DATA_FILE = BACKEND_ROOT / "data" / "processed" / "churn_cleaned.csv"
DATA_FIXTURE = PROJECT_ROOT / "ci" / "fixtures" / "churn_cleaned_sample.csv"
DEPLOY_MANIFEST = BACKEND_ROOT / "models" / "ci_deploy_manifest.json"


@dataclass
class StageResult:
    name: str
    status: str  # passed | failed | skipped
    duration_seconds: float
    message: str = ""


@dataclass
class PipelineReport:
    status: str = "pending"
    started_at: str = ""
    finished_at: str = ""
    duration_seconds: float = 0.0
    python: str = ""
    stages: list[StageResult] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "status": self.status,
            "started_at": self.started_at,
            "finished_at": self.finished_at,
            "duration_seconds": round(self.duration_seconds, 2),
            "python": self.python,
            "stages": [
                {
                    "name": s.name,
                    "status": s.status,
                    "duration_seconds": round(s.duration_seconds, 2),
                    "message": s.message,
                }
                for s in self.stages
            ],
        }


class LocalCIPipeline:
    def __init__(
        self,
        *,
        quick: bool = False,
        with_cd: bool = False,
        skip_setup: bool = False,
    ):
        self.quick = quick
        self.with_cd = with_cd
        self.skip_setup = skip_setup
        self.report = PipelineReport(python=sys.executable)
        self._env = os.environ.copy()
        self._env.setdefault("PYTHONIOENCODING", "utf-8")

    def _run_stage(self, name: str, fn: Callable[[], None]) -> bool:
        print(f"\n{'=' * 60}")
        print(f"  [{name.upper()}]")
        print("=" * 60)
        t0 = time.perf_counter()
        try:
            fn()
            elapsed = time.perf_counter() - t0
            self.report.stages.append(
                StageResult(name, "passed", elapsed, "OK")
            )
            print(f"  -> {name} : OK ({elapsed:.1f}s)")
            return True
        except Exception as exc:
            elapsed = time.perf_counter() - t0
            msg = str(exc)
            self.report.stages.append(
                StageResult(name, "failed", elapsed, msg)
            )
            print(f"  -> {name} : ECHEC ({elapsed:.1f}s)")
            print(f"     {msg}")
            return False

    def _run_cmd(
        self,
        args: list[str],
        *,
        cwd: Path | None = None,
        timeout: int | None = None,
    ) -> None:
        cwd = cwd or BACKEND_ROOT
        result = subprocess.run(
            args,
            cwd=str(cwd),
            env=self._env,
            timeout=timeout,
        )
        if result.returncode != 0:
            raise RuntimeError(
                f"Commande échouée (code {result.returncode}): {' '.join(args)}"
            )

    def stage_setup(self) -> None:
        if not REQUIREMENTS.exists():
            raise FileNotFoundError(f"Requirements introuvable: {REQUIREMENTS}")
        self._run_cmd(
            [sys.executable, "-m", "pip", "install", "-q", "-r", str(REQUIREMENTS)],
            cwd=BACKEND_ROOT,
            timeout=600,
        )

    def stage_lint(self) -> None:
        py_files = sorted(SRC_DIR.glob("*.py"))
        if not py_files:
            raise FileNotFoundError(f"Aucun fichier Python dans {SRC_DIR}")
        for path in py_files:
            self._run_cmd(
                [sys.executable, "-m", "py_compile", str(path)],
                cwd=BACKEND_ROOT,
            )

    def stage_data_check(self) -> None:
        if not DATA_FILE.exists():
            if DATA_FIXTURE.exists():
                DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy(DATA_FIXTURE, DATA_FILE)
                print(f"  Dataset restauré depuis fixture CI: {DATA_FIXTURE.name}")
            else:
                raise FileNotFoundError(
                    f"Dataset manquant: {DATA_FILE}\n"
                    "Exécutez preprocessing.py ou ajoutez ci/fixtures/churn_cleaned_sample.csv"
                )

    def stage_smoke(self) -> None:
        self._run_cmd(
            [sys.executable, str(SRC_DIR / "drift_detection_minimal.py")],
            cwd=BACKEND_ROOT,
            timeout=180,
        )

    def stage_integration(self) -> None:
        self._run_cmd(
            [
                sys.executable,
                str(SRC_DIR / "drift_detection.py"),
                "--seuil",
                "1.0",
                "--no-retrain",
            ],
            cwd=BACKEND_ROOT,
            timeout=300,
        )

    def stage_artifacts(self) -> None:
        required = [
            REPORTS_DIR / "evidently_drift_report.html",
            REPORTS_DIR / "ks_test_details.json",
        ]
        missing = [p for p in required if not p.exists()]
        if missing:
            names = ", ".join(p.name for p in missing)
            raise FileNotFoundError(f"Artefacts manquants: {names}")

    def stage_mlflow(self) -> None:
        check_script = """
import mlflow
exp = mlflow.get_experiment_by_name("Data_Drift_Monitoring")
if exp is None:
    raise SystemExit("Experiment Data_Drift_Monitoring not found")
runs = mlflow.search_runs(experiment_ids=[exp.experiment_id], max_results=1)
if runs.empty:
    raise SystemExit("No drift monitoring runs in MLflow")
print(f"MLflow OK — {len(runs)} run(s) visible")
"""
        self._run_cmd(
            [sys.executable, "-c", check_script],
            cwd=BACKEND_ROOT,
        )

    def stage_cd_deploy(self) -> None:
        """CD local : ré-entraînement rapide + manifeste de déploiement."""
        self._run_cmd(
            [sys.executable, str(SRC_DIR / "retrain.py")],
            cwd=BACKEND_ROOT,
            timeout=300,
        )

        manifest_script = f"""
import json
import mlflow
from pathlib import Path

mlflow.set_tracking_uri("sqlite:///{(BACKEND_ROOT / "mlflow.db").as_posix()}")
experiment = mlflow.get_experiment_by_name("Churn_Prediction")
if experiment is None:
    raise SystemExit("Churn_Prediction not found")
runs = mlflow.search_runs(
    experiment_ids=[experiment.experiment_id],
    order_by=["start_time DESC"],
    max_results=1,
)
if runs.empty:
    raise SystemExit("No MLflow runs after retrain")
row = runs.iloc[0]
manifest = {{
    "deployed_at": "{datetime.now(timezone.utc).isoformat()}",
    "run_id": str(row.get("run_id", "")),
    "run_name": str(row.get("tags.mlflow.runName", "")),
    "metrics": {{
        "accuracy": float(row.get("metrics.accuracy", 0) or 0),
        "f1_score": float(row.get("metrics.f1_score", 0) or 0),
    }},
    "source": "ci/local_pipeline.py --with-cd",
}}
path = Path(r"{DEPLOY_MANIFEST}")
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print("Manifest written:", path)
"""
        self._run_cmd(
            [sys.executable, "-c", manifest_script],
            cwd=BACKEND_ROOT,
        )

    def run(self, only_stage: str | None = None) -> int:
        started = datetime.now(timezone.utc)
        self.report.started_at = started.isoformat()

        print("\n" + "=" * 60)
        print("  CI/CD LOCAL — ProjetML MLOps")
        print("=" * 60)
        print(f"  Racine projet : {PROJECT_ROOT}")
        print(f"  Mode          : {'quick' if self.quick else 'complet'}"
              f"{' + CD' if self.with_cd else ''}")

        stage_map = {
            "setup": (not self.skip_setup, self.stage_setup),
            "data": (True, self.stage_data_check),
            "lint": (True, self.stage_lint),
            "smoke": (True, self.stage_smoke),
            "integration": (not self.quick, self.stage_integration),
            "artifacts": (not self.quick, self.stage_artifacts),
            "mlflow": (not self.quick, self.stage_mlflow),
            "deploy": (self.with_cd and not only_stage, self.stage_cd_deploy),
        }

        if only_stage:
            if only_stage not in stage_map:
                print(f"Étape inconnue: {only_stage}. Valides: {', '.join(stage_map)}")
                return 2
            enabled, fn = stage_map[only_stage]
            if not enabled:
                print(f"Étape '{only_stage}' désactivée dans ce mode.")
                return 2
            ok = self._run_stage(only_stage, fn)
            self._finalize(started, success=ok)
            return 0 if ok else 1

        all_ok = True
        for name, (enabled, fn) in stage_map.items():
            if not enabled:
                self.report.stages.append(
                    StageResult(name, "skipped", 0.0, "désactivé")
                )
                continue
            if not self._run_stage(name, fn):
                all_ok = False
                break

        return self._finalize(started, success=all_ok)

    def _finalize(self, started: datetime, success: bool) -> int:
        finished = datetime.now(timezone.utc)
        self.report.finished_at = finished.isoformat()
        self.report.duration_seconds = (finished - started).total_seconds()
        self.report.status = "success" if success else "failed"

        CI_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        report_path = CI_REPORTS_DIR / "last_run.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(self.report.to_dict(), f, indent=2)

        print("\n" + "=" * 60)
        print(f"  RESULTAT CI/CD : {'SUCCES' if success else 'ECHEC'}")
        print(f"  Duree totale   : {self.report.duration_seconds:.1f}s")
        print(f"  Rapport        : {report_path}")
        print("=" * 60 + "\n")

        for stage in self.report.stages:
            icon = {"passed": "+", "failed": "x", "skipped": "-"}.get(
                stage.status, "?"
            )
            print(
                f"  [{icon}] {stage.name:<14} "
                f"{stage.status:<8} ({stage.duration_seconds:.1f}s)"
            )
            if stage.message and stage.status == "failed":
                print(f"       {stage.message}")

        return 0 if success else 1


def main() -> int:
    parser = argparse.ArgumentParser(description="CI/CD local ProjetML")
    parser.add_argument(
        "--quick",
        action="store_true",
        help="setup + data + lint + smoke uniquement",
    )
    parser.add_argument(
        "--with-cd",
        action="store_true",
        help="Ajoute l'étape deploy (retrain + manifeste)",
    )
    parser.add_argument(
        "--skip-setup",
        action="store_true",
        help="Ne pas réinstaller les dépendances",
    )
    parser.add_argument(
        "--stage",
        type=str,
        default=None,
        help="Exécuter une seule étape",
    )
    args = parser.parse_args()

    pipeline = LocalCIPipeline(
        quick=args.quick,
        with_cd=args.with_cd,
        skip_setup=args.skip_setup,
    )
    return pipeline.run(only_stage=args.stage)


if __name__ == "__main__":
    sys.exit(main())
