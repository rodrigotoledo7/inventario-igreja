# Inventario Igreja

Aplicacao de inventario patrimonial da Primeira IPB de Porto Velho.

## Deploy com MariaDB

A composicao principal agora sobe um container MariaDB e aponta o backend para ele via `DATABASE_URL=mysql+pymysql://...@db:3306/...`.

- O backend espera o banco ficar pronto antes de iniciar o Uvicorn.
- O frontend continua acessando a API pelo caminho relativo `/api`.
- O build do frontend deve usar `VITE_API_URL=/api` quando for empacotado para producao.

## Variaveis principais

- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS`
- `VITE_API_URL`

## Execucao local com Docker

```bash
docker compose up --build
```

A interface fica em `http://localhost` e a API em `http://localhost/api`.
