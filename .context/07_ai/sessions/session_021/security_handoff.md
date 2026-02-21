# Security Handoff — Session 021
## Structural Optimization & Pre-Deployment Audit

**Date:** 2026-02-21
**Agent:** Security Agent
**Scope:** Background Sync Task, Deployment Vectors (Vultr/Dokploy), Rate Limiting

---

## Executive Summary

| Area | Status | Severity |
|---|---|---|
| Background Task Session Management | ✅ PASS | — |
| Race Condition (CalendarBlock vs Reservation) | ⚠️ CONDITIONAL PASS | LOW |
| DB Indices — Deadlock Risk (SQLite) | ⚠️ WARNING | MEDIUM |
| Docker Secrets Leakage | ✅ PASS | — |
| `dev.db` at root not gitignored | ✅ PATCHED (SEC-021-05) | MEDIUM |
| PostgreSQL port 5432 publicly exposed | ✅ PATCHED (SEC-021-02) | HIGH |
| Dokploy port 3000 unprotected | ⚠️ MANUAL ACTION REQUIRED | HIGH |
| `--reload` flag in production docker-compose | ✅ PATCHED (SEC-021-04) | MEDIUM |
| Rate Limiting on `/sync` endpoint | ✅ PATCHED (SEC-021-01) | HIGH |
| `.env.docker.example` naming anomaly | ⚠️ WARNING | LOW |

**Overall Verdict: 🟡 CONDITIONAL CLEAR — Code patches applied. One manual action required: configure Vultr Cloud Firewall before going live (see section 3.5).**

---

## Audit Objective 1: Background Task Integrity

### 1.1 — `do_sync` Closure — Session Management

**Finding: ✅ PASS**

```python
# router.py — do_sync closure (post-patch, lines ~155–159)
def do_sync():
    with Session(engine) as session:
        import_service = ICalImportService(session)
        import_service.sync_property(property_id)
```

**Analysis:**
- The `with Session(engine) as session:` pattern uses SQLModel's context manager, which guarantees `session.close()` is called on both successful completion and any raised exception. There is **no connection leak**.
- The `engine` is correctly imported from `app.db` — the same singleton used by the rest of the application. A fresh session is created per invocation, which is the correct pattern for background tasks.
- The `property_id` is captured by closure from the outer request scope. This is safe — `uuid.UUID` is immutable and cannot be mutated by a concurrent request.
- FastAPI `BackgroundTasks` run in the same event loop's threadpool after the response is sent. The session lifecycle is fully contained within `do_sync()`.

**No action required.**

---

### 1.2 — Race Condition: CalendarBlock vs. Reservation Creation

**Finding: ⚠️ CONDITIONAL PASS**

**Analysis:**
The `ICalImportService._sync_single_calendar()` uses a **replace-by-source** strategy:
```
DELETE all CalendarBlocks WHERE property_id=X AND source='airbnb'
→ INSERT fresh CalendarBlocks
→ commit()
```

A guest creating a reservation concurrently reads from **two tables**: `Reservation` and `CalendarBlock`. The reservation creation endpoint does **not** enforce an availability pre-check at the database level (no `SELECT FOR UPDATE` or unique constraint on date ranges). The risk scenario is:

```
T1: Sync task deletes Airbnb blocks (window of false availability)
T2: Guest reads availability — sees no blocks — creates reservation
T1: Sync task re-inserts Airbnb blocks — now overlapping with T2's reservation
```

**Risk Level: LOW** — The window is narrow (microseconds between DELETE and INSERT in `_delete_existing_blocks` + `db.flush()`) and `flush()` is used before the commit, minimizing the gap. However, this is not zero.

**The current system uses SQLite** where the WAL journal mode and locking reduce (but do not eliminate) this risk. On PostgreSQL (the production target), this is more relevant.

**Recommendation for Backend Agent (non-blocking for Session 021, required before production):**
- Wrap the delete+insert cycle in a single explicit transaction with `SERIALIZABLE` isolation for the sync operation.
- Add an overlapping-date constraint check on the `Reservation` creation service as a validation guard (not a DB constraint, since date ranges can't be expressed as `UNIQUE`).

---

## Audit Objective 2: Database Performance vs. Availability

### 2.1 — Index Sufficiency

**Finding: ✅ PASS**

The Session 021 handoff confirms indices on:
- `CalendarBlock.property_id`, `.start_date`, `.end_date`, `.source`, `.external_uid`
- `Reservation.property_id`, `.start_date`, `.end_date`

The `EXISTS` subqueries in the availability engine filter by `property_id` first (high selectivity) then by date range. The B-tree indices on these columns are sufficient for the query pattern.

---

### 2.2 — Deadlock Risk During Heavy iCal Sync

**Finding: ⚠️ WARNING (MEDIUM)**

**On SQLite (current dev environment):**
SQLite uses database-level locking. Running multiple background sync tasks simultaneously (e.g., `POST /sync` fired for multiple properties at once) will cause tasks to queue and serialize at the write lock. This prevents deadlocks but creates latency spikes and potential request timeouts for concurrent operations.

**On PostgreSQL (production target):**
PostgreSQL uses row-level locking. True deadlocks are possible if:
- Sync task A holds a lock on rows for property X and tries to lock rows for property Y.
- Sync task B holds a lock on property Y and tries to lock property X.

Since `_delete_existing_blocks` only touches rows scoped to a single `property_id + source`, **cross-property deadlocks are NOT possible with the current implementation.** Each sync is fully isolated by property.

**Intra-property risk:** A single sync task deleting + inserting while a concurrent read occurs is safe — reads do not acquire heavy locks in PostgreSQL.

**Verdict:** No deadlock risk with current implementation if only one background task runs per property at a time. The rate limiting patch (Objective 4) naturally mitigates concurrent sync spam per property.

---

## Audit Objective 3: Deployment Vectors (Vultr Pre-Audit)

### 3.1 — Docker Secrets Leakage

**Finding: ✅ PASS — Sensitive variables are NOT hardcoded**

`docker-compose.yml` correctly uses `${VAR}` substitution for all secrets:
```yaml
POSTGRES_PASSWORD: ${DB_PASSWORD}
SECRET_KEY: ${SECRET_KEY}
```

`.env.docker.example` contains only placeholder tokens (`your_secret_key_here_generate_with_openssl_rand_hex_32`). No real values.

`.gitignore` correctly excludes:
```
.env
.env.*
!.env.example
```

The `.env.docker.example` file is tracked by git (intentionally, as a template). **No secrets are tracked.** ✅

---

### 3.2 — `dev.db` at Project Root Not Gitignored

**Finding: ✅ PATCHED (SEC-021-05)**

The `.gitignore` contained `backend/dev.db` but a `dev.db` file was found at the **project root** (`d:\Proyectos\element-rentals\dev.db`). This root-level database file could be accidentally committed, exposing all customer and financial data in the git history.

**Patch applied to `.gitignore`:**
```
# SEC-021-05: Cover dev.db at any location (root or backend/)
dev.db
backend/dev.db
```

> ⚠️ **Remaining manual action:** Run `git status dev.db` to verify the root `dev.db` is NOT already tracked. If it appears as tracked, run `git rm --cached dev.db` to purge it from git history before the next commit.

---

### 3.3 — PostgreSQL Port 5432 Publicly Exposed

**Finding: ✅ PATCHED (SEC-021-02)**

`docker-compose.yml` previously mapped port 5432 to the host network. On a Vultr VPS with a public IP, this would have exposed the database directly to the internet.

**Patch applied to `docker-compose.yml`:** The `ports: - "5432:5432"` block has been removed from the postgres service. The backend accesses it exclusively via the internal `elemnt_network` Docker network.

```yaml
# postgres service — current state (port binding removed):
# SEC-021-02: Port 5432 intentionally NOT mapped to host.
# The backend accesses Postgres via the internal elemnt_network.
# Use: docker exec -it elemnt_postgres psql -U elemnt_user -d elemnt_rentals
```

---

### 3.4 — Uvicorn `--reload` Flag in Production `docker-compose.yml`

**Finding: ✅ PATCHED (SEC-021-04)**

`docker-compose.yml` previously had a `command:` override with `--reload` and a source-code bind mount (`./backend/app:/app/app`). This was a development shortcut left in the shared compose file.

**Patch applied to `docker-compose.yml`:**
- Removed the `command: uvicorn ... --reload` override. The `backend/Dockerfile` CMD (`uvicorn app.main:app --host 0.0.0.0 --port 8000`, no reload) now takes effect in production.
- Removed the `./backend/app:/app/app` bind mount from the backend `volumes`. Only the `uploads` volume is persisted.

```yaml
# backend service — current state:
volumes:
  # SEC-021-04: Only persist uploads. Source bind-mount removed (was dev-only).
  - ./backend/uploads:/app/uploads
# SEC-021-04: No command override — Dockerfile CMD is used (production uvicorn, no --reload).
```

---

### 3.5 — Strategy for Securing Dokploy Management Port (Port 3000)

**Finding: ❌ FAIL (HIGH) — No current strategy documented**

Dokploy's default management panel runs on port 3000 on the Vultr VPS. This port is currently assumed to be publicly accessible.

**Recommended Mitigation Strategy (layered):**

**Tier 1 — Vultr Firewall (Required):**
Configure the Vultr Cloud Firewall to:
- Allow port 22 (SSH) only from known IPs (admin machine IPs).
- Allow port 80 and 443 only (public HTTP/S).
- **Block port 3000** from all public IPs. Grant access only to specific admin IP addresses.

```
# Vultr Firewall Rules:
ACCEPT  TCP  22    FROM  [your-admin-ip]
ACCEPT  TCP  80    FROM  0.0.0.0/0
ACCEPT  TCP  443   FROM  0.0.0.0/0
DROP    TCP  3000  FROM  0.0.0.0/0  # Block Dokploy globally
DROP    TCP  5432  FROM  0.0.0.0/0  # Block Postgres globally
```

**Tier 2 — SSH Tunnel for Dokploy Access (Recommended):**
Admin accesses Dokploy via a local SSH tunnel instead of opening the port:
```bash
ssh -L 3000:localhost:3000 root@[vultr-vps-ip]
# Then open: http://localhost:3000 in local browser
```
This means Dokploy's port never needs to be public.

**Tier 3 — Change Dokploy Default Port (Optional hardening):**
If the firewall allows, change Dokploy's listening port from 3000 to a non-standard port to reduce automated scanner exposure.

---

## Audit Objective 4: Rate Limiting on `/sync` Endpoint

### 4.1 — Attack Vector

**Finding: ❌ FAIL (HIGH)**

`POST /{property_id}/sync` is protected by `get_current_staff_user` (correct ✅). However, an attacker with valid staff credentials (compromised account, insider threat, or session hijacking) could:

```python
while True:
    requests.post(f"/api/v1/properties/{property_id}/sync", headers=auth)
```

Each request spawns a new background thread running `_fetch_ical()` which:
1. Opens an outbound HTTPS connection (network resource exhaustion).
2. Creates a new database session (connection pool exhaustion).
3. Executes a DELETE + bulk INSERT transaction (DB write amplification).

FastAPI's `BackgroundTasks` does **not** have a built-in queue limit. Thousands of concurrent background threads would cause OOM or DB connection pool exhaustion.

There is currently **no rate limiting library installed** (`slowapi` not found in the codebase).

---

### 4.2 — Mitigation Applied: In-Memory Rate Limit ✅ PATCHED (SEC-021-01)

A lightweight, zero-dependency rate limiter using Python's standard library was applied to `router.py`. It limits each authenticated user to **1 sync request per 30 seconds per property**.

**What was added to `router.py`:**
```python
# Module-level cooldown store (top of file)
_sync_last_called: Dict[Tuple[str, str], datetime] = {}
SYNC_COOLDOWN_SECONDS = 30

# Inside sync_property_calendars(), before background_tasks.add_task():
rate_key = (str(current_user.id), str(property_id))
now = datetime.utcnow()
last_called = _sync_last_called.get(rate_key)
if last_called is not None:
    elapsed = (now - last_called).total_seconds()
    if elapsed < SYNC_COOLDOWN_SECONDS:
        remaining = int(SYNC_COOLDOWN_SECONDS - elapsed)
        raise HTTPException(
            status_code=429,
            detail=f"Sync rate limit exceeded. Try again in {remaining} seconds.",
            headers={"Retry-After": str(remaining)},
        )
_sync_last_called[rate_key] = now
```

**Behaviour:** Returns `HTTP 429 Too Many Requests` with a `Retry-After` header. The rate key is scoped per `(user_id, property_id)` — staff can still sync different properties without interference.

**Acknowledged limitations:**
- State lives in process memory and resets on server restart. Acceptable for the current single-process Vultr deployment.
- For multi-worker / Docker Swarm scale-out: replace with a Redis-backed `slowapi` limiter.

**Production-grade recommendation:** Install `slowapi` + Redis, or enable Cloudflare rate limiting at the edge (free tier covers burst protection).

---

## Summary of Actions

### ✅ PATCHED IN THIS SESSION

| ID | Severity | Issue | File | Applied Fix |
|---|---|---|---|---|
| SEC-021-01 | 🔴 HIGH | Rate limiting absent on `/sync` | `backend/app/properties/router.py` | In-memory cooldown dict, 30s per user+property, HTTP 429 + `Retry-After` |
| SEC-021-02 | 🔴 HIGH | PostgreSQL port 5432 exposed publicly | `docker-compose.yml` | Removed `ports: - "5432:5432"` from postgres service |
| SEC-021-04 | 🟡 MEDIUM | `--reload` + source bind-mount in prod compose | `docker-compose.yml` | Removed `command:` override and `./backend/app:/app/app` volume |
| SEC-021-05 | 🟡 MEDIUM | `dev.db` at project root not gitignored | `.gitignore` | Added `dev.db` rule above `backend/dev.db` |

### ⚠️ REQUIRES MANUAL ACTION (cannot be patched in code)

| ID | Severity | Issue | Where | Action |
|---|---|---|---|---|
| SEC-021-03 | 🔴 HIGH | Dokploy port 3000 has no firewall protection | Vultr Cloud Console | Apply firewall rules + SSH tunnel (see section 3.5) |

### 🟡 DEFERRED — Required Before Production Go-Live

| ID | Issue | File | Recommended Fix |
|---|---|---|---|
| SEC-021-06 | Race window in CalendarBlock replace strategy | `ical_service.py` | `SERIALIZABLE` transaction isolation on PostgreSQL sync operations |

### 🟢 PASSED — No Action Required

- `do_sync` closure session management ✅
- Sensitive secrets not hardcoded in compose or example files ✅
- SSRF protection in `_fetch_ical` ✅
- File size limit (5MB) in `_fetch_ical` ✅
- RBAC: `/sync` correctly requires `get_current_staff_user` ✅
- Frontend Dockerfile: runs as non-root `nextjs` user ✅
- No cross-property deadlock risk in sync operations ✅

---

## Remaining Instructions for Next Session

1. **⚠️ User action (Vultr):** Configure the Cloud Firewall per section 3.5 before DNS is pointed at the VPS. This cannot wait.
2. **⚠️ User action (git):** Run `git status dev.db` — if the file appears as tracked, run `git rm --cached dev.db` and commit.
3. **Future (post-MVP):** Install `slowapi` + Redis for a distributed rate limiter when scaling beyond a single-process deployment.
4. **Future (pre-PostgreSQL migration):** Wrap `_sync_single_calendar` delete+insert in `SERIALIZABLE` isolation (SEC-021-06).
