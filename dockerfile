# Käytetään Pythonin virallista imagea
FROM python:3.13.2

# Asetetaan työhakemisto
WORKDIR /app

# Kopioidaan riippuvuuksien tiedosto ja asennetaan ne
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Kopioidaan muu koodi konttiin
COPY . .

# Asetetaan Django palvelu käyttämään 0.0.0.0:8000 (ei vain localhost)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
