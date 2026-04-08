#!/bin/bash

# Aguarda o banco de dados estar pronto
echo "Aguardando o banco de dados (db:3306)..."
while ! nc -z db 3306; do
  sleep 1
done
echo "Banco de dados pronto!"

# Inicia a aplicação
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
