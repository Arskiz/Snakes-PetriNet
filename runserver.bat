@echo off

echo Starting Django development server...
echo --------------------------------------------------------
echo Checking for Python...
where python >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH!
    pause
    exit /b 1
)

echo Checking if we're in the correct directory...
if not exist manage.py (
    echo Error: manage.py not found! Make sure you're in the correct directory.
    pause
    exit /b 1
)

echo Starting server...
echo --------------------------------------------------------
python manage.py runserver
if errorlevel 1 (
    echo Error: Server failed to start!
    pause
    exit /b 1
)
