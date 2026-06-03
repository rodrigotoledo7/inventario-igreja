#!/bin/bash
set -e

# Espera apenas quando a URL aponta para MySQL/MariaDB.
if [[ -z "$DATABASE_URL" ]] || [[ $DATABASE_URL == sqlite* ]]; then
  echo "Usando SQLite ou URL vazia - pulando verificacao de conexao externa."
else
  db_target=${DATABASE_URL#*://}
  db_target=${db_target#*@}
  db_target=${db_target%%/*}
  DB_HOST=${db_target%%:*}
  if [[ "$db_target" == *:* ]]; then
    DB_PORT=${db_target##*:}
  else
    DB_PORT=3306
  fi

  echo "Aguardando o banco de dados (${DB_HOST}:${DB_PORT})..."
  while ! nc -z "$DB_HOST" "$DB_PORT"; do
    sleep 1
  done
  echo "Banco de dados pronto!"
fi

python - <<'PYCODE'
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
PYCODE

echo "Populando banco de dados..."
python -m app.seed

echo "Iniciando Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
