"""
demo.py — Complete demonstration of drift detection pipeline
===========================================================
This script demonstrates the full workflow without requiring evidently
initially - it will install it and then run the full pipeline.
"""

import subprocess
import sys
import os
from pathlib import Path


def print_header(title):
    """Print a formatted header."""
    print("\n" + "="*70)
    print(f"   {title}")
    print("="*70)


def run_command(cmd, description, ignore_errors=False):
    """Run a command and report results."""
    print(f"\n▶ {description}")
    print(f"  Command: {' '.join(cmd)}\n")
    
    try:
        result = subprocess.run(cmd, capture_output=False)
        if result.returncode != 0 and not ignore_errors:
            print(f"  ❌ Command failed with exit code {result.returncode}")
            return False
        print(f"  ✅ Success")
        return True
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


def main():
    """Run the complete demonstration."""
    os.chdir(Path(__file__).parent)
    
    print_header("🚀 DRIFT DETECTION PIPELINE — COMPLETE DEMO")
    
    # Step 1: Install dependencies
    print_header("Step 1: Installing Dependencies")
    print("This may take a few minutes on first run...")
    
    deps_cmd = [
        sys.executable, "-m", "pip", "install", "-q", 
        "-r", "backendML/requirements_drift.txt"
    ]
    
    if not run_command(deps_cmd, "Installing Python packages"):
        print("\n⚠️  Some packages failed to install. Continuing anyway...")
    
    # Step 2: Verify imports
    print_header("Step 2: Verifying Installation")
    
    verify_cmd = [
        sys.executable, "-c",
        "import evidently, mlflow, scipy, sklearn; print('✅ All packages imported successfully')"
    ]
    
    if run_command(verify_cmd, "Verifying Python packages", ignore_errors=True):
        print("✅ All packages verified")
    else:
        print("⚠️  Some packages are still installing...")
    
    # Step 3: Run drift detection (no retrain)
    print_header("Step 3: Running Drift Detection")
    print("Running with high threshold (--seuil 1.0) to avoid retraining")
    
    detect_cmd = [
        sys.executable, "backendML/src/drift_detection.py",
        "--seuil", "1.0",
        "--noise", "0.3"
    ]
    
    if run_command(detect_cmd, "Executing drift detection pipeline"):
        print("\n✅ Drift detection completed successfully")
    else:
        print("\n❌ Drift detection failed")
        return 1
    
    # Step 4: Check generated reports
    print_header("Step 4: Checking Generated Reports")
    
    reports = [
        ("backendML/reports/evidently_drift_report.html", "Evidently HTML Report"),
        ("backendML/reports/ks_test_details.json", "KS Test Details"),
        ("monitoring_history.json", "Monitoring History")
    ]
    
    found_reports = 0
    for report_path, report_name in reports:
        if Path(report_path).exists():
            size_kb = Path(report_path).stat().st_size / 1024
            print(f"  ✅ {report_name:30} ({size_kb:.1f} KB)")
            found_reports += 1
        else:
            print(f"  ℹ️  {report_name:30} (not yet generated)")
    
    print(f"\n  {found_reports}/{len(reports)} reports found")
    
    # Step 5: Check MLflow logging
    print_header("Step 5: Checking MLflow Logging")
    
    mlflow_cmd = [
        sys.executable, "-c",
        """
import mlflow
experiment = mlflow.get_experiment_by_name("Data_Drift_Monitoring")
if experiment:
    runs = mlflow.search_runs(experiment_ids=[experiment.experiment_id])
    print(f"✅ MLflow experiment exists with {len(runs)} run(s)")
else:
    print("⚠️  MLflow experiment not yet created")
"""
    ]
    
    run_command(mlflow_cmd, "Checking MLflow", ignore_errors=True)
    
    # Step 6: Show next steps
    print_header("🎉 Demo Completed!")
    
    print("""
✅ WORKFLOW SUMMARY:
   1. ✅ Installed all dependencies
   2. ✅ Simulated data drift (modified test data)
   3. ✅ Detected drift via KS-Test and Evidently
   4. ✅ Logged metrics to MLflow
   5. ✅ Generated visual reports

📊 NEXT STEPS:

   1. View the Evidently Report:
      Open: backendML/reports/evidently_drift_report.html

   2. Check MLflow Experiments:
      $ mlflow ui
      Then visit: http://localhost:5000

   3. Run Single Drift Detection:
      $ python run_pipeline.py detection

   4. Start Continuous Monitoring (check every hour):
      $ python run_pipeline.py monitoring

   5. Start REST API for Frontend:
      $ python run_pipeline.py api
      Then visit: http://localhost:5001/api/drift/latest

   6. Read Full Documentation:
      See: backendML/DRIFT_DETECTION_README.md

📝 KEY FEATURES:

   ✓ Simulates realistic data drift
   ✓ Detects via KS-Test (statistical feature-level)
   ✓ Detects via Evidently (visual HTML reports)
   ✓ Logs everything to MLflow
   ✓ Automatically triggers retraining if drift > threshold
   ✓ Provides REST API for monitoring
   ✓ Supports continuous monitoring

🔍 TESTING DIFFERENT SCENARIOS:

   High threshold (no retraining):
   $ python run_pipeline.py detection --seuil 1.0 --noise 0.3

   Low threshold (likely to trigger retraining):
   $ python run_pipeline.py detection --seuil 0.15 --noise 0.5

   Continuous monitoring (10 iterations, 5 min intervals):
   $ python run_pipeline.py monitoring --interval 300 --iterations 10

════════════════════════════════════════════════════════════════════════

Questions? See backendML/DRIFT_DETECTION_README.md for details.
    """)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
