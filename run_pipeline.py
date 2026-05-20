#!/usr/bin/env python3
"""
run_pipeline.py — CLI helper for drift detection pipeline
========================================================
Easy-to-use interface for running drift detection workflows.

Usage:
    python run_pipeline.py detection [--seuil 0.3] [--noise 0.2]
    python run_pipeline.py monitoring --interval 3600 --noise 0.3
    python run_pipeline.py api
    python run_pipeline.py test
"""

import os
import sys
import subprocess
import argparse
import json
from pathlib import Path
from datetime import datetime


class DriftPipelineRunner:
    """CLI runner for drift detection pipeline."""
    
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_root = self.project_root / "backendML"
        self.src_dir = self.backend_root / "src"
        self.reports_dir = self.backend_root / "reports"
        
        # Create reports directory if needed
        self.reports_dir.mkdir(exist_ok=True)
        
        # Change to backend directory
        os.chdir(self.backend_root)
    
    def run_detection(self, seuil=0.30, noise=0.3, no_retrain=False):
        """Run single drift detection."""
        print("\n" + "="*70)
        print("   🔍 DRIFT DETECTION (SINGLE RUN)")
        print("="*70)
        
        cmd = [
            sys.executable,
            str(self.src_dir / "drift_detection.py"),
            "--seuil", str(seuil),
            "--noise", str(noise)
        ]
        
        if no_retrain:
            cmd.append("--no-retrain")
        
        print(f"Command: {' '.join(cmd)}\n")
        
        try:
            result = subprocess.run(cmd, check=False)
            return result.returncode
        except Exception as e:
            print(f"❌ Error: {e}")
            return 1
    
    def run_monitoring(self, interval=3600, noise=0.3, iterations=None):
        """Run continuous monitoring."""
        print("\n" + "="*70)
        print("   📊 CONTINUOUS MONITORING")
        print("="*70)
        
        cmd = [
            sys.executable,
            str(self.src_dir / "monitoring.py"),
            "--interval", str(interval),
            "--noise", str(noise)
        ]
        
        if iterations:
            cmd.extend(["--iterations", str(iterations)])
        
        print(f"Command: {' '.join(cmd)}\n")
        print(f"Interval: {interval}s ({interval/3600:.1f}h)")
        print(f"Noise level: {noise}")
        print(f"Iterations: {iterations if iterations else 'infinite'}")
        print("\nPress Ctrl+C to stop monitoring\n")
        
        try:
            result = subprocess.run(cmd, check=False)
            return result.returncode
        except KeyboardInterrupt:
            print("\n✅ Monitoring stopped by user")
            return 0
        except Exception as e:
            print(f"❌ Error: {e}")
            return 1
    
    def run_api(self, port=5001):
        """Run REST API."""
        print("\n" + "="*70)
        print("   🚀 DRIFT DETECTION API")
        print("="*70)
        print(f"Starting API on http://localhost:{port}\n")
        
        cmd = [sys.executable, str(self.src_dir / "drift_api.py")]
        env = os.environ.copy()
        env["DRIFT_API_PORT"] = str(port)
        
        try:
            result = subprocess.run(cmd, env=env, check=False)
            return result.returncode
        except Exception as e:
            print(f"❌ Error: {e}")
            return 1
    
    def run_ci(self, quick=False, with_cd=False, skip_setup=False, stage=None):
        """Run local CI/CD pipeline."""
        print("\n" + "=" * 70)
        print("   CI/CD LOCAL")
        print("=" * 70)

        cmd = [sys.executable, str(self.project_root / "ci" / "local_pipeline.py")]
        if quick:
            cmd.append("--quick")
        if with_cd:
            cmd.append("--with-cd")
        if skip_setup:
            cmd.append("--skip-setup")
        if stage:
            cmd.extend(["--stage", stage])

        print(f"Command: {' '.join(cmd)}\n")
        try:
            return subprocess.run(cmd, cwd=self.project_root, check=False).returncode
        except Exception as e:
            print(f"Error: {e}")
            return 1

    def run_test(self):
        """Run complete test workflow."""
        print("\n" + "="*70)
        print("   🧪 COMPLETE TEST WORKFLOW")
        print("="*70)
        
        tests = [
            ("1. Installing dependencies", self._install_deps),
            ("2. Running drift detection", self._test_detection),
            ("3. Checking reports", self._check_reports),
            ("4. Checking MLflow", self._check_mlflow),
        ]
        
        passed = 0
        failed = 0
        
        for step_name, step_func in tests:
            print(f"\n[{step_name}]")
            try:
                if step_func():
                    print(f"  ✅ {step_name} passed")
                    passed += 1
                else:
                    print(f"  ❌ {step_name} failed")
                    failed += 1
            except Exception as e:
                print(f"  ❌ Error: {e}")
                failed += 1
        
        print("\n" + "="*70)
        print(f"   📊 TEST RESULTS: {passed} passed, {failed} failed")
        print("="*70)
        
        if failed == 0:
            print("\n✅ All tests passed!\n")
            print("Next steps:")
            print("  1. View reports: backendML/reports/evidently_drift_report.html")
            print("  2. Check MLflow: mlflow ui")
            print("  3. Start monitoring: python run_pipeline.py monitoring")
            print("  4. Start API: python run_pipeline.py api\n")
            return 0
        else:
            return 1
    
    def _install_deps(self):
        """Install dependencies."""
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "-q", "-r", "requirements_drift.txt"],
                check=True,
                cwd=self.backend_root
            )
            return True
        except subprocess.CalledProcessError:
            return False
    
    def _test_detection(self):
        """Test drift detection."""
        try:
            subprocess.run(
                [sys.executable, str(self.src_dir / "drift_detection.py"), 
                 "--seuil", "1.0", "--no-retrain"],
                check=True,
                cwd=self.backend_root
            )
            return True
        except subprocess.CalledProcessError:
            return False
    
    def _check_reports(self):
        """Check if reports were generated."""
        reports = [
            self.reports_dir / "evidently_drift_report.html",
            self.reports_dir / "ks_test_details.json"
        ]
        
        for report in reports:
            if report.exists():
                print(f"  ✓ {report.name}")
            else:
                print(f"  ✗ {report.name} (not found)")
        
        return all(r.exists() for r in reports)
    
    def _check_mlflow(self):
        """Check MLflow logging."""
        try:
            import mlflow
            experiment = mlflow.get_experiment_by_name("Data_Drift_Monitoring")
            if experiment:
                runs = mlflow.search_runs(experiment_ids=[experiment.experiment_id])
                print(f"  ✓ MLflow experiment exists with {len(runs)} run(s)")
                return True
            else:
                print(f"  ✗ MLflow experiment not found")
                return False
        except Exception as e:
            print(f"  ✗ Error checking MLflow: {e}")
            return False
    
    def show_help(self):
        """Show help menu."""
        print("""
╔════════════════════════════════════════════════════════════════════════════╗
║          Data Drift Detection & Auto-Retraining Pipeline                   ║
╚════════════════════════════════════════════════════════════════════════════╝

USAGE:
    python run_pipeline.py <command> [options]

COMMANDS:

  detection [OPTIONS]
      Run single drift detection
      
      Options:
        --seuil FLOAT    Drift threshold for retraining (default: 0.30)
        --noise FLOAT    Noise level for simulation (default: 0.3)
        --no-retrain     Disable automatic retraining
      
      Examples:
        python run_pipeline.py detection
        python run_pipeline.py detection --seuil 0.25 --noise 0.2
        python run_pipeline.py detection --seuil 1.0 --no-retrain

  monitoring [OPTIONS]
      Start continuous monitoring
      
      Options:
        --interval INT    Interval in seconds (default: 3600 = 1h)
        --noise FLOAT     Noise level (default: 0.3)
        --iterations INT  Max iterations (default: infinite)
      
      Examples:
        python run_pipeline.py monitoring
        python run_pipeline.py monitoring --interval 300 --noise 0.2
        python run_pipeline.py monitoring --interval 60 --iterations 10

  api [OPTIONS]
      Start REST API server
      
      Options:
        --port INT  Port number (default: 5001)
      
      Examples:
        python run_pipeline.py api
        python run_pipeline.py api --port 8000

  test
      Run complete test workflow
      
      Examples:
        python run_pipeline.py test

  help
      Show this help message

╔════════════════════════════════════════════════════════════════════════════╗
║          WORKFLOW EXAMPLES                                                 ║
╚════════════════════════════════════════════════════════════════════════════╝

1. QUICK TEST:
   $ python run_pipeline.py test

2. SINGLE RUN (no retraining):
   $ python run_pipeline.py detection --seuil 1.0

3. CONTINUOUS MONITORING:
   $ python run_pipeline.py monitoring --interval 300 --iterations 20

4. START API:
   $ python run_pipeline.py api

5. CI/CD LOCAL (avant commit / merge):
   $ python run_pipeline.py ci --quick
   $ python run_pipeline.py ci
   $ python run_pipeline.py ci --with-cd

6. FULL WORKFLOW:
   # Terminal 1: Continuous monitoring
   $ python run_pipeline.py monitoring

   # Terminal 2: API for frontend
   $ python run_pipeline.py api

   # Terminal 3: Check reports
   $ mlflow ui

╔════════════════════════════════════════════════════════════════════════════╗
║          DOCUMENTATION                                                     ║
╚════════════════════════════════════════════════════════════════════════════╝

See backendML/DRIFT_DETECTION_README.md for detailed documentation.

        """)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Drift Detection Pipeline CLI",
        add_help=True
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Detection command
    detection_parser = subparsers.add_parser("detection", help="Run drift detection")
    detection_parser.add_argument("--seuil", type=float, default=0.30)
    detection_parser.add_argument("--noise", type=float, default=0.3)
    detection_parser.add_argument("--no-retrain", action="store_true")
    
    # Monitoring command
    monitoring_parser = subparsers.add_parser("monitoring", help="Start monitoring")
    monitoring_parser.add_argument("--interval", type=int, default=3600)
    monitoring_parser.add_argument("--noise", type=float, default=0.3)
    monitoring_parser.add_argument("--iterations", type=int, default=None)
    
    # API command
    api_parser = subparsers.add_parser("api", help="Start API server")
    api_parser.add_argument("--port", type=int, default=5001)
    
    # Test command
    subparsers.add_parser("test", help="Run test workflow")

    # CI/CD local command
    ci_parser = subparsers.add_parser("ci", help="Run local CI/CD pipeline")
    ci_parser.add_argument("--quick", action="store_true", help="Fast CI (setup, lint, smoke)")
    ci_parser.add_argument("--with-cd", action="store_true", help="Include deploy stage (retrain)")
    ci_parser.add_argument("--skip-setup", action="store_true", help="Skip pip install")
    ci_parser.add_argument("--stage", type=str, default=None, help="Run single stage")
    
    # Help command
    subparsers.add_parser("help", help="Show help")
    
    args = parser.parse_args()
    
    if not args.command or args.command == "help":
        DriftPipelineRunner().show_help()
        return 0
    
    runner = DriftPipelineRunner()
    
    if args.command == "detection":
        return runner.run_detection(
            seuil=args.seuil,
            noise=args.noise,
            no_retrain=args.no_retrain
        )
    elif args.command == "monitoring":
        return runner.run_monitoring(
            interval=args.interval,
            noise=args.noise,
            iterations=args.iterations
        )
    elif args.command == "api":
        return runner.run_api(port=args.port)
    elif args.command == "test":
        return runner.run_test()
    elif args.command == "ci":
        return runner.run_ci(
            quick=args.quick,
            with_cd=args.with_cd,
            skip_setup=args.skip_setup,
            stage=args.stage,
        )
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
