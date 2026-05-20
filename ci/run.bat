@echo off
REM ci/run.bat — Lance le pipeline CI/CD local (Windows CMD)
REM Usage:
REM   ci\run.bat
REM   ci\run.bat quick
REM   ci\run.bat cd

setlocal
cd /d "%~dp0.."
set PYTHONIOENCODING=utf-8

set ARGS=ci\local_pipeline.py
if /i "%1"=="quick" set ARGS=%ARGS% --quick
if /i "%1"=="cd"    set ARGS=%ARGS% --with-cd
if /i "%1"=="full"  goto run
if /i "%1"=="quick" goto run
if /i "%1"=="cd"    goto run
if not "%1"=="" (
    echo Usage: ci\run.bat [quick^|cd]
    exit /b 1
)

:run
echo.
echo Lancement CI/CD local...
python %ARGS%
exit /b %ERRORLEVEL%
