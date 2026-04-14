# CLAUDE.md - Sistema de Inventário (Primeira IPB Porto Velho)

## 📌 Visão Geral

Sistema de gestão de patrimônio para a Primeira IPB de Porto Velho.

- **Linguagem:** Português Brasileiro (UI e Comentários).
- **Stack:** FastAPI (Python) + React (CRA) + SQLite/MariaDB.

## 🛠 Comandos Essenciais

### Backend (`back/`)

**Dev:** `uvicorn app.main:app --reload` (Porta 8000)
**Dependências:** `pip install -r requirements.txt`
**DB Seed:** `python -m app.seed`

### Frontend (`front/`)

**Dev:** `npm start` (Porta 3000)
**Build:** `npm run build`
**Testes:** `npm test`

### Docker (Raiz)

**Subir tudo:** `docker-compose up --build`
**Limpar volumes:** `docker-compose down -v`

## 📏 Padrões de Código (Guidelines)

### Geral

**Idioma:** Todo o código voltado ao usuário (labels, mensagens de erro) e comentários de lógica devem ser em **Português**.
**Nomenclatura:** Variáveis e funções em inglês, mas tabelas no banco de dados e termos de domínio em português (`bens`, `locais`).

### Backend (FastAPI)

**Auth:** Sempre usar o `get_current_user` como dependência em rotas protegidas.
**Schemas:** Pydantic models devem estar organizados para refletir as tabelas do banco.
**DB:** O sistema **não** usa Alembic. Alterações no `models.py` exigem recriar o banco em dev.

### Frontend (React) - Refatoração e Modularização

**Arquitetura:** Migrando de "Single-file" para **Modular**.
**Pastas:** * `src/components/`: Componentes genéricos e reutilizáveis (Botões, Tabelas, Inputs).
`src/pages/`: Componentes de página (Dashboard, Inventario, Login).
`src/layouts/`: Estruturas comuns (Sidebar, Navbar).
**DRY:** Elementos repetitivos devem ser transformados em componentes que aceitam `props`.
**Roteamento:** Utilizar `react-router-dom` para navegação.
**API:** Usar exclusivamente a instância do `api.js` para chamadas HTTP.

## 🗄 Estrutura de Banco de Dados

**Tabelas:** `users` (auth), `locais` (setores/salas), `bens` (itens do inventário).
**FK:** Todo item (`bem`) deve obrigatoriamente estar vinculado a um `local_id`.

## ⚠️ Notas de Produção & Segurança

**Secrets:** O `core/config.py` valida forças de senha e chaves JWT em produção.
**CORS:** Bloqueado para localhost em produção; configurado via `CORS_ORIGINS`.
