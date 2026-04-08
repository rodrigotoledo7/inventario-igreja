#!/bin/bash
set -e

echo "Aguardando o banco de dados (db:3306)..."
while ! nc -z db 3306; do
  sleep 1
done
echo "Banco de dados pronto!"

python -c "import app.models; from app.database import Base, engine; Base.metadata.create_all(bind=engine)"

echo "Populando banco de dados..."
python -m app.seed

echo "Iniciando Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
