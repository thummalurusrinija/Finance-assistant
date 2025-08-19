# Money Coach (C++ / JS / ML)

An AI-powered personal finance assistant built with:
- JS: Express server + static web UI
- C++: Budgeting/allocation engine (optional CLI; JS fallback if not compiled)
- ML: Python FastAPI microservice for insight scoring and tips

## Quick Start

1) Start the JS server (serves the web UI):
```
cd apps/server
npm install
npm start
```
Open `http://localhost:3000`

2) (Optional) Run the ML service:
```
cd services/ml
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
The JS server will call it at `http://localhost:8000`.

3) (Optional) Build the C++ engine (improves speed; server falls back to JS if absent):
```
cd packages/engine
make
```
This produces `engine`. The server will use it automatically if present.

## Architecture

- `apps/web`: Static UI (HTML/CSS/JS) calling the server APIs
- `apps/server`: Node.js Express API; orchestrates budget planning and ML tips
- `packages/engine`: C++ CLI engine that reads JSON on stdin, writes JSON to stdout
- `services/ml`: FastAPI service providing risk scores and suggestions

## API Overview

- POST `/api/plan`
  - Input: `{ income: number, fixed: { name, amount }[], variable: { name, cap }[], goals: { name, target, current?, priority }[] }`
  - Output: `{ allocations, safeToSpend, notes, source, tips }`

- GET `/api/report/monthly`
  - Output: simple aggregates; extend as needed

## Notes
- Privacy-first: no persistence by default. Add a DB when ready.
- Keep categories minimal and editable. Guardrails > hard blocks.
- The JS fallback allocator uses a transparent 50/30/20 baseline and adjusts for dues and goals.