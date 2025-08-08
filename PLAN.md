## Delta-First Retrofit Plan

This plan adds a new delta-first research module (ingestion, diff, agents, UI) as an additive set of apps and packages without touching existing landing/marketing or auth. All changes are isolated and JSON-first.

### Protected files (DO NOT TOUCH)
- Landing/marketing UI
  - `frontend/src/pages/Landing.tsx`
  - Landing is routed for unauthenticated users in `frontend/src/App.tsx` (routing file is not protected, but the `Landing` page component is).
- Auth config and helpers
  - Backend auth: `backend/app/auth.py`
  - Frontend auth provider: `frontend/src/hooks/useAuth.tsx`

Notes:
- We will not modify the exported interfaces of any protected file.
- Any navigation change will be a minimal diff and is documented below.

### New module layout (additive)
- `/apps/agent` (Python, LangGraph-ready skeleton)
- `/apps/ingest` (Python worker for EDGAR fetch + diff + technical signals)
- `/packages/schemas` (shared zod + pydantic)
- Web UI (single-app React): reuse existing layout/auth session
  - New routes under existing SPA: `/delta`, `/delta/t/[ticker]/changes`, `/delta/t/[ticker]/memo`

### Backend (additive)
- New SQLAlchemy models in `backend/app/delta_models.py`
- Router in `backend/app/delta_api.py` providing:
  - `GET /api/delta/{ticker}/cards`
  - `POST /api/delta/{ticker}/memo`
- Migration utility `backend/migrate_delta.py` (creates additive tables if missing)

### Database (additive only)
New tables:
- `filings`, `filing_versions`, `delta_cards`, `evidence`, `catalysts`, `memos_delta`, `source_logs`, `runs`
Indexes:
- `delta_cards (ticker, detected_at)`
- `source_logs (url, content_hash)`

### Ingestion
- `apps/ingest/worker.py`: EDGAR fetch for last two filings, sectionizer, redliner, technical indicators. Emits `DeltaCard` + `Evidence` and logs all fetches to `SourceLog`.
- `scripts/seed.py`: seeds ≥3 `DeltaCard` for `GOOG` with real URLs.

### Agents
- `apps/agent/` skeleton with pydantic I/O models; nodes: PM_Long, Short_Seller, Risk_Manager, Auditor. System prompts in `apps/agent/prompts/*.md`.

### Web UI
- New pages under React SPA:
  - `/delta` (dashboard/watchlist)
  - `/delta/t/:ticker/changes` (Delta Tape with Evidence drawer)
  - `/delta/t/:ticker/memo` (renders `MemoDelta` JSON)
- API client at `frontend/src/lib/deltaApi.ts`.

### Navigation change (minimal diff)
- Add a single link/CTA “Try Delta” in `frontend/src/components/Layout.tsx` nav that points to `/delta`. No other marketing or auth files are changed.

### PR checklist mapping
- Landing/auth untouched (listed above)
- New migrations additive and idempotent
- `scripts/seed.py` creates ≥3 DeltaCards for GOOG
- Tests to be added incrementally: redliner + auditor, schema parity checks
- `/delta` routes are gated by existing session via `useAuth`


