# ARCHITECTURE — Booking Stampante 3D FabLab

## Stack tecnologico

### Backend

| Layer | Tecnologia | Motivo |
|-------|-----------|--------|
| Runtime | Node.js + TypeScript | Type safety, ecosystem maturo |
| HTTP | Express | Semplicità, veloce da implementare |
| Database | SQLite (better-sqlite3) | Zero config, file singolo, perfetto per FabLab |
| Validazione | Zod | Schema-first, inferenza tipi automatica |
| Test | Vitest | Veloce, compatibile TypeScript nativo |
| Build | tsup | Bundle TypeScript senza config complessa |

### Frontend

| Layer | Tecnologia | Motivo |
|-------|-----------|--------|
| Framework | React | Ecosystem, community, compatibilità Refine |
| Admin framework | Refine | CRUD scaffolding, data provider, routing incluso |
| Build | Vite | Dev server veloce, HMR istantaneo |
| UI library | Ant Design | Componenti pronti (tabelle, form, layout) |
| Date handling | dayjs | Leggero, usato da Ant Design DatePicker e calendario |
| Test | Vitest + React Testing Library | Consistenza con backend, testing componenti React |

## Struttura folder — Monorepo

```
printer-booking/
├── CLAUDE.md
├── PRD.md
├── ARCHITECTURE.md
├── AI_RULES.md
├── PLAN.md
├── package.json              ← script root (dev, test, build per entrambi)
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── src/
│   │   ├── index.ts              ← entry point, avvia Express
│   │   ├── db.ts                 ← setup SQLite + migrazioni
│   │   ├── models/
│   │   │   ├── printer.ts        ← Zod schema stampante
│   │   │   └── booking.ts        ← Zod schema prenotazione
│   │   ├── services/
│   │   │   ├── printer.service.ts    ← CRUD stampanti
│   │   │   └── booking.service.ts    ← CRUD prenotazioni + validazione overlap
│   │   ├── routes/
│   │   │   ├── printer.routes.ts     ← endpoint /api/printers
│   │   │   └── booking.routes.ts     ← endpoint /api/bookings
│   │   └── tests/
│   │       ├── booking.service.test.ts   ← test logica prenotazioni
│   │       ├── printer.service.test.ts   ← test logica stampanti
│   │       └── helpers.ts                ← factory e utility test
│   └── data/
│       └── fablab.db             ← file SQLite (gitignored)
│
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    ├── src/
    │   ├── App.tsx               ← Refine app con risorse e routing
    │   ├── main.tsx              ← entry point React
    │   ├── providers/
    │   │   └── dataProvider.ts       ← config REST data provider per Refine
    │   ├── pages/
    │   │   ├── printers/
    │   │   │   ├── list.tsx          ← tabella stampanti
    │   │   │   ├── create.tsx        ← form creazione stampante
    │   │   │   └── edit.tsx          ← form modifica stato stampante
    │   │   └── bookings/
    │   │       ├── list.tsx          ← tabella prenotazioni con filtri
    │   │       ├── create.tsx        ← form creazione prenotazione
    │   │       ├── calendar.tsx      ← vista calendario per stampante
    │   │       └── show.tsx          ← dettaglio prenotazione
    │   ├── components/
    │   │   └── calendar/
    │   │       └── BookingCalendar.tsx  ← componente calendario slot
    │   └── tests/
    │       ├── pages/                ← test pagine CRUD
    │       └── components/           ← test componenti (calendario)
    └── public/
```

## Compatibilità Refine

Il backend deve essere compatibile con il Refine REST data provider (`@refinedev/simple-rest`):

- **CORS**: il backend deve abilitare CORS per permettere richieste dal dev server Vite (default `http://localhost:5173`)
- **Header `x-total-count`**: le response delle liste (`GET /api/printers`, `GET /api/bookings`) devono includere l'header `x-total-count` con il numero totale di record, per la paginazione Refine
- **Filtri query string**: il data provider invia filtri come `?_sort=field&_order=asc&_start=0&_end=10`. Il backend deve supportare questi parametri per liste paginate e ordinate
- **Response format**: le liste restituiscono un array JSON diretto (non wrappato). Il totale va nell'header, non nel body

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
