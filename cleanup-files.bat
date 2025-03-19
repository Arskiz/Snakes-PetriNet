@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo =               File Cleanup Utility                   =
echo ========================================================

:menu
echo.
echo Please select an option:
echo 1. Clean files from expired sessions only
echo 2. Clean all files in extracted_nets directory
echo 3. Clean files older than X days in extracted_nets
echo 4. Clean specific file types in extracted_nets
echo 5. Perform dry run (show what would be deleted)
echo 6. Exit
echo.
set /p choice="Enter choice (1-6): "

if "%choice%"=="1" goto session_cleanup
if "%choice%"=="2" goto all_files
if "%choice%"=="3" goto older_than
if "%choice%"=="4" goto file_types
if "%choice%"=="5" goto dry_run
if "%choice%"=="6" goto end

echo Invalid option. Please try again.
goto menu

:session_cleanup
echo.
echo --------------------------------------------------------
echo Running session-based cleanup...
python manage.py cleanup_files
if errorlevel 1 (
    echo Error: Cleanup failed!
    pause
    goto menu
)
echo Cleanup completed successfully!
pause
goto menu

:all_files
echo.
echo --------------------------------------------------------
echo Cleaning all files in extracted_nets directory...
python manage.py cleanup_files --all-files
if errorlevel 1 (
    echo Error: Cleanup failed!
    pause
    goto menu
)
echo Cleanup completed successfully!
pause
goto menu

:older_than
echo.
set /p days="Delete files older than how many days? "
echo --------------------------------------------------------
echo Cleaning files older than %days% days...
python manage.py cleanup_files --all-files --older-than=%days%
if errorlevel 1 (
    echo Error: Cleanup failed!
    pause
    goto menu
)
echo Cleanup completed successfully!
pause
goto menu

:file_types
echo.
set /p extensions="Enter file extensions to delete (e.g. .pnml,.xml): "
echo --------------------------------------------------------
echo Cleaning files with extensions: %extensions%
python manage.py cleanup_files --all-files --extensions="%extensions%"
if errorlevel 1 (
    echo Error: Cleanup failed!
    pause
    goto menu
)
echo Cleanup completed successfully!
pause
goto menu

:dry_run
echo.
echo --------------------------------------------------------
echo Performing dry run (showing what would be deleted)...
python manage.py cleanup_files --all-files --dry-run
if errorlevel 1 (
    echo Error: Dry run failed!
    pause
    goto menu
)
echo Dry run completed successfully!
pause
goto menu

:end
echo Exiting...
endlocal
exit /b 0