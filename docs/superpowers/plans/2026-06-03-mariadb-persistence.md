# MariaDB Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist all application data in MariaDB/MySQL in both backend and frontend deployment flows.

**Architecture:** Keep the existing FastAPI + SQLAlchemy backend, but make MariaDB the default runtime database in Docker and environment examples. Preserve the current React API contract and Nginx proxy path so the frontend continues to talk to `/api` without code changes to data submission logic.

**Tech Stack:** FastAPI, SQLAlchemy, PyMySQL, MariaDB, React, Vite, Nginx, Docker Compose

---

### Task 1: Align environment and compose defaults

**Files:**
- Modify: `docker-compose.yml`
- Modify: `.env.example`
- Review: `back/docker-compose.yml`

- [ ] **Step 1: Write the failing test**

No new automated test is required for this configuration-only step; verify by inspecting the compose model after the edit.

- [ ] **Step 2: Run verification**

Run: `docker compose config`
Expected: the backend service uses a `mysql+pymysql://...@db:3306/...` URL and a MariaDB service is defined.

- [ ] **Step 3: Write minimal implementation**

Update the root compose file to add MariaDB, wire `DATABASE_URL` to the DB service, and remove SQLite-specific volume wiring.

- [ ] **Step 4: Run verification**

Run: `docker compose config`
Expected: valid YAML with backend -> db dependency and no SQLite database path in the root composition.

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml .env.example
git commit -m "feat: switch deployment to mariadb"
```

### Task 2: Keep backend startup compatible with MariaDB

**Files:**
- Modify: `back/entrypoint.sh`
- Review: `back/app/database.py`
- Review: `back/app/core/config.py`

- [ ] **Step 1: Write the failing test**

No unit test is required for the shell wait loop; verify startup behavior in container logs.

- [ ] **Step 2: Run verification**

Run: `docker compose up --build`
Expected: backend waits for MariaDB, creates tables, seeds the admin user, and serves `/healthz`.

- [ ] **Step 3: Write minimal implementation**

Make the entrypoint wait for the database when `DATABASE_URL` points at MySQL/MariaDB and keep the existing bootstrap logic.

- [ ] **Step 4: Run verification**

Run: `docker compose logs backend`
Expected: database readiness, schema creation, seed completion, and uvicorn startup messages.

- [ ] **Step 5: Commit**

```bash
git add back/entrypoint.sh
git commit -m "feat: harden backend startup for mariadb"
```

### Task 3: Validate frontend deployment path

**Files:**
- Review: `front/Dockerfile`
- Review: `front/nginx.conf`
- Modify: `README.md`

- [ ] **Step 1: Write the failing test**

No code test needed; verify the built frontend still proxies API calls through `/api`.

- [ ] **Step 2: Run verification**

Run: `npm --prefix front run build`
Expected: production build succeeds with the existing `/api` base path.

- [ ] **Step 3: Write minimal implementation**

Update documentation to describe the MariaDB-backed deployment and the `VITE_API_URL=/api` build-time setting.

- [ ] **Step 4: Run verification**

Run: `docker compose config`
Expected: frontend build args still pass `/api` and Nginx keeps the proxy route.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update deployment notes for mariadb"
```

