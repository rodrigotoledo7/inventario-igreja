#!/bin/bash
set -e

# Detecta se é SQLite
if [[ $DATABASE_URL == sqlite* ]]; then
  echo "Usando SQLite - pulando verificação de conexão externa."
else
  echo "Aguardando o banco de dados (db:3306)..."
  while ! nc -z db 3306; do
    sleep 1
  done
  echo "Banco de dados pronto!"
fi

python - <<'PY'
import app.models  # noqa: F401
from sqlalchemy import inspect

from app.database import Base, engine

inspector = inspect(engine)
existing = set(inspector.get_table_names())
expected = set(Base.metadata.tables.keys())
missing = expected - existing

if missing:
    print("Criando tabelas ausentes:", ", ".join(sorted(missing)))
    Base.metadata.create_all(bind=engine)
else:
    print("Estrutura do banco ja existe; pulando create_all.")
PY

echo "Populando banco de dados..."
python -m app.seed

echo "Iniciando Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000