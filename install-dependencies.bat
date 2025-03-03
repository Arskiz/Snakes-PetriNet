@echo off

echo Installing dependencies...
echo --------------------------------------------------------

echo Checking for Python...
where python >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH!
    pause
    exit /b 1
)

echo Checking if requirements.txt exists...
cd mysite
if not exist requirements.txt (
    echo Error: requirements.txt not found! Make sure you're in the correct directory.
    pause
    exit /b 1
)

echo Installing required packages...
echo --------------------------------------------------------
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Package installation failed!
    pause
    exit /b 1
)

echo --------------------------------------------------------
echo Dependencies installed successfully!
pause
