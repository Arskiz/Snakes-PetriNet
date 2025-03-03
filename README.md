# Snakes-PetriNet

SNAKESCPN is a web-based visualization tool for Colored Petri Nets (CPN) built using Django and the SNAKES library.

## Description
This project provides an interactive web interface for creating, editing and visualizing Colored Petri Nets. It leverages the powerful SNAKES library for the underlying Petri net functionality and Django for the web framework.

## Installation

1. Clone this repository
2. Run `install-dependencies.bat` to install required Python packages:
   ```
   cd mysite
   python -m pip install -r requirements.txt
   ```

## Usage

1. Run `runserver.bat` to start the Django development server:
   ```
   cd mysite
   python manage.py runserver
   ```
2. Open your web browser and navigate to `http://localhost:8000`

3. To clean up temporary files, run `cleanup-files.bat`:
   ```
   cd mysite
   python manage.py cleanup_files
   ```
   This will remove any temporary files created during usage.

## Features

- Interactive CPN visualization
- Create and edit Petri nets through web interface
- Support for colored tokens and transitions
- Real-time simulation capabilities

## Requirements

- Python 3.11+
- Django
- SNAKES library
- Other dependencies listed in requirements.txt
