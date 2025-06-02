# Snakes-PetriNet

This tool is a web-based visualization tool for Colored Petri Nets (CPN) built using Django and the SNAKES library.

## Description
This project provides an interactive web interface for creating, editing and visualizing Colored Petri Nets. It leverages the powerful SNAKES library for the underlying Petri net functionality and Django for the web framework.

## Installation (Windows)

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
- Support for colored tokens and transitions
- Real-time simulation capabilities

## Requirements

- Python 3.11+
- Django
- Jinja2
- SNAKES library
- Other dependencies listed in requirements.txt

## Images
- Home Page:
  ![Screenshot_1](https://github.com/user-attachments/assets/87d10db3-2a08-4c2c-9f97-101d8f882a98)

- File uploaded:
  ![Screenshot_2](https://github.com/user-attachments/assets/ed8064c7-d6c5-400b-8435-ebae246b1c07)

- Advanced statistics:
  ![Screenshot_3](https://github.com/user-attachments/assets/8ac1b880-54f2-4de7-a68b-540d17bdc6e8)

- Fullscreen Capabilities with zoom in and out functionality:
  ![Screenshot_4](https://github.com/user-attachments/assets/adc33d45-224c-490b-9fef-44183c487e82)

- Settings page for tweaking the UI:
  ![Screenshot_5](https://github.com/user-attachments/assets/a54f2afc-c14f-4cf4-bb46-4c6822c5766a)

- About page for more details about the developer:
  ![Screenshot_6](https://github.com/user-attachments/assets/d2f9ccab-735d-4ac8-a780-f6ea276177af)

