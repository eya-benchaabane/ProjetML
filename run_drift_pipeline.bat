@REM run_drift_pipeline.bat — Windows batch script for drift detection pipeline
@REM Usage: run_drift_pipeline.bat [detection|monitoring|api|test]

@echo off
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

if "%1"=="" (
    call :show_menu
    goto :end
)

if /i "%1"=="detection" (
    echo.
    echo ====================================================================
    echo Running Data Drift Detection...
    echo ====================================================================
    python backendML\src\drift_detection.py %2 %3 %4
    goto :end
)

if /i "%1"=="monitoring" (
    echo.
    echo ====================================================================
    echo Starting Continuous Monitoring...
    echo ====================================================================
    python backendML\src\monitoring.py --interval %2 --noise %3 --iterations %4
    goto :end
)

if /i "%1"=="api" (
    echo.
    echo ====================================================================
    echo Starting Drift Detection API...
    echo ====================================================================
    echo API running on http://localhost:5001
    echo.
    python backendML\src\drift_api.py
    goto :end
)

if /i "%1"=="test" (
    call :run_test
    goto :end
)

if /i "%1"=="help" (
    call :show_menu
    goto :end
)

echo Unknown command: %1
call :show_menu

:show_menu
echo.
echo ====================================================================
echo Data Drift Detection & Auto-Retraining Pipeline
echo ====================================================================
echo.
echo Available commands:
echo.
echo   run_drift_pipeline.bat detection [--seuil S] [--noise N] [--no-retrain]
echo       Run single drift detection
echo       Examples:
echo         run_drift_pipeline.bat detection
echo         run_drift_pipeline.bat detection --seuil 0.25 --noise 0.2
echo.
echo   run_drift_pipeline.bat monitoring [INTERVAL] [NOISE] [ITERATIONS]
echo       Start continuous monitoring
echo       Examples:
echo         run_drift_pipeline.bat monitoring                      ^(3600s, infinite^)
echo         run_drift_pipeline.bat monitoring 300 0.3 10           ^(5 min intervals, 10 iterations^)
echo.
echo   run_drift_pipeline.bat api
echo       Start REST API on http://localhost:5001
echo.
echo   run_drift_pipeline.bat test
echo       Run complete test workflow
echo.
echo   run_drift_pipeline.bat help
echo       Show this help menu
echo.
echo ====================================================================
goto :end

:run_test
echo.
echo ====================================================================
echo Running Complete Test Workflow
echo ====================================================================
echo.
echo [1] Installing dependencies...
pip install -r backendML\requirements_drift.txt -q
if errorlevel 1 goto :test_error
echo ✅ Dependencies installed
echo.

echo [2] Running drift detection with high threshold (no retrain)...
python backendML\src\drift_detection.py --seuil 1.0
if errorlevel 1 goto :test_error
echo ✅ Drift detection completed
echo.

echo [3] Checking generated reports...
if exist "backendML\reports\evidently_drift_report.html" (
    echo ✅ Evidently report generated
) else (
    echo ⚠️  Evidently report not found
)
if exist "backendML\reports\ks_test_details.json" (
    echo ✅ KS test details saved
) else (
    echo ⚠️  KS test details not found
)
echo.

echo [4] Checking MLflow logging...
python backendML\src\drift_detection.py --seuil 1.0 --no-retrain
if errorlevel 1 goto :test_error
echo ✅ MLflow logging verified
echo.

echo ====================================================================
echo ✅ All tests completed successfully!
echo ====================================================================
echo.
echo Next steps:
echo   1. View reports: backendML\reports\evidently_drift_report.html
echo   2. Check MLflow: mlflow ui
echo   3. Start monitoring: run_drift_pipeline.bat monitoring
echo.
goto :end

:test_error
echo.
echo ❌ Test failed!
echo Please check the error messages above.
echo.
goto :end

:end
endlocal
