# ARCHITECTURE — Booking Stampante 3D FabLab

## Stack tecnologico

| Layer | Tecnologia | Motivo |
|-------|-----------|--------|
| Runtime | Node.js + TypeScript | Type safety, ecosystem maturo |
| HTTP | Express | Semplicità, veloce da implementare |
| Database | SQLite (better-sqlite3) | Zero config, file singolo, perfetto per FabLab |
| Validazione | Zod | Schema-first, inferenza tipi automatica |
| Test | Vitest | Veloce, compatibile TypeScript nativo |
| Build | tsup | Bundle TypeScript senza config complessa |

## Struttura folder

```
printer-booking/
├── CLAUDE.md
├── PRD.md
├── ARCHITECTURE.md
├── AI_RULES.md
├── PLAN.md
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts              ← entry point, avvia Express
│   ├── db.ts                 ← setup SQLite + migrazioni
│   ├── models/
│   │   ├── printer.ts        ← Zod schema stampante
│   │   └── booking.ts        ← Zod schema prenotazione
│   ├── services/
│   │   ├── printer.service.ts    ← CRUD stampanti
│   │   └── booking.service.ts    ← CRUD prenotazioni + validazione overlap
│   ├── routes/
│   │   ├── printer.routes.ts     ← endpoint /api/printers
│   │   └── booking.routes.ts     ← endpoint /api/bookings
│   └── tests/
│       ├── booking.service.test.ts   ← test logica prenotazioni
│       ├── printer.service.test.ts   ← test logica stampanti
│       └── helpers.ts                ← factory e utility test
└── data/
    └── fablab.db             ← file SQLite (gitignored)
```

## Convenzioni

- Ogni service espone funzioni pure che ricevono i parametri e il db connection
- I route handler NON contengono logica di business — delegano ai service
- Errori di validazione → 400 con messaggio leggibile
- Errori di conflitto (overlap) → 409 Conflict
- Risorsa non trovata → 404
- Successo creazione → 201 con oggetto creato
- Successo lettura → 200

## Schema database

```sql
CREATE TABLE printers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'maintenance'))
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  printer_id TEXT NOT NULL REFERENCES printers(id),
  user_name TEXT NOT NULL,
  start_time TEXT NOT NULL,  -- ISO 8601
  end_time TEXT NOT NULL,    -- ISO 8601
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK(start_time < end_time)
);

CREATE INDEX idx_bookings_printer_time ON bookings(printer_id, start_time, end_time);
```

## Endpoint API

| Metodo | Path | Descrizione |
|--------|------|-------------|
| GET | /api/printers | Lista stampanti |
| POST | /api/printers | Crea stampante |
| PATCH | /api/printers/:id | Aggiorna status |
| GET | /api/bookings | Lista prenotazioni (filtro per stampante e data) |
| POST | /api/bookings | Crea prenotazione (con validazione overlap) |
| DELETE | /api/bookings/:id | Cancella prenotazione (con regola 15 min) |
| GET | /api/bookings/availability/:printerId | Slot liberi per una data |
