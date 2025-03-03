@echo off
cd mysite
echo Starting cleanup process...
echo --------------------------------------------------------
echo Cleaning temporary files...
python manage.py cleanup_files
if errorlevel 1 (
    echo Error: Cleanup failed!
    pause
    exit /b 1
)
echo --------------------------------------------------------
echo Cleanup completed successfully!
pause
