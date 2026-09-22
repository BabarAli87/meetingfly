@echo off
REM Generate icons for MeetingFly
REM Run this script to generate PNG and ICO files from SVG

echo Generating MeetingFly app icons...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python not found. Please install Python 3 from https://python.org
    echo.
    pause
    exit /b 1
)

REM Check if required packages are installed
python -c "import cairosvg; import PIL" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing required Python packages...
    python -m pip install cairosvg pillow
    if %errorlevel% neq 0 (
        echo Error: Failed to install packages
        pause
        exit /b 1
    )
)

REM Run the icon generator
python generate-icons.py
if %errorlevel% neq 0 (
    echo.
    echo Error: Failed to generate icons
    pause
    exit /b 1
)

echo.
echo Successfully generated icons!
echo.
pause
