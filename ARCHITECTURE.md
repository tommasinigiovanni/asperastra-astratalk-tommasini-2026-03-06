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
| Auth | jsonwebtoken + bcrypt | JWT stateless, hashing password sicuro |

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
│   │   │   ├── booking.ts        ← Zod schema prenotazione
│   │   │   └── user.ts           ← Zod schema utente + login
│   │   ├── middleware/
│   │   │   └── auth.ts           ← middleware JWT: authenticate + authorize(role)
│   │   ├── services/
│   │   │   ├── printer.service.ts    ← CRUD stampanti
│   │   │   ├── booking.service.ts    ← CRUD prenotazioni + validazione overlap
│   │   │   ├── user.service.ts       ← CRUD utenti + hash password
│   │   │   └── auth.service.ts       ← login, generazione/verifica JWT
│   │   ├── routes/
│   │   │   ├── auth.routes.ts        ← endpoint /api/auth (login)
│   │   │   ├── user.routes.ts        ← endpoint /api/users (admin only)
│   │   │   ├── printer.routes.ts     ← endpoint /api/printers
│   │   │   └── booking.routes.ts     ← endpoint /api/bookings
│   │   └── tests/
│   │       ├── auth.service.test.ts      ← test login e JWT
│   │       ├── user.service.test.ts      ← test CRUD utenti
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
    │   │   ├── dataProvider.ts       ← config REST data provider per Refine
    │   │   └── authProvider.ts       ← Refine auth provider (login, logout, check, getIdentity)
    │   ├── pages/
    │   │   ├── printers/
    │   │   │   ├── list.tsx          ← tabella stampanti
    │   │   │   ├── create.tsx        ← form creazione stampante
    │   │   │   └── edit.tsx          ← form modifica stato stampante
    │   │   ├── bookings/
    │   │   │   ├── list.tsx          ← tabella prenotazioni con filtri
    │   │   │   ├── create.tsx        ← form creazione prenotazione
    │   │   │   ├── calendar.tsx      ← vista calendario per stampante
    │   │   │   └── show.tsx          ← dettaglio prenotazione
    │   │   ├── users/                ← admin only
    │   │   │   ├── list.tsx          ← tabella utenti
    │   │   │   └── create.tsx        ← form creazione utente
    │   │   └── login.tsx             ← pagina login
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
- Non autenticato → 401 Unauthorized
- Non autorizzato (ruolo insufficiente) → 403 Forbidden
- Successo creazione → 201 con oggetto creato
- Successo lettura → 200

## Autenticazione e autorizzazione

- **Auth stateless via JWT**: il backend emette un token JWT al login, il frontend lo salva e lo invia come header `Authorization: Bearer <token>`
- **Middleware `authenticate`**: verifica il JWT, estrae `userId` e `role`, li attacca a `req.user`
- **Middleware `authorize(role)`**: controlla che `req.user.role` corrisponda al ruolo richiesto
- **Password**: hashate con bcrypt (salt rounds: 10), mai salvate in chiaro
- **Seed admin**: alla prima migrazione, creare un utente admin di default (email e password configurabili via env)
- **Token payload**: `{ userId, role, email }`, scadenza configurabile (default: 24h)

## Schema database

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE printers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'maintenance'))
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  printer_id TEXT NOT NULL REFERENCES printers(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  start_time TEXT NOT NULL,  -- ISO 8601
  end_time TEXT NOT NULL,    -- ISO 8601
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK(start_time < end_time)
);

CREATE INDEX idx_bookings_printer_time ON bookings(printer_id, start_time, end_time);
CREATE INDEX idx_bookings_user ON bookings(user_id);
```

## Endpoint API

| Metodo | Path | Accesso | Descrizione |
|--------|------|---------|-------------|
| POST | /api/auth/login | pubblico | Login, restituisce JWT |
| GET | /api/auth/me | autenticato | Profilo utente corrente |
| GET | /api/users | admin | Lista utenti |
| POST | /api/users | admin | Crea utente |
| GET | /api/printers | autenticato | Lista stampanti |
| POST | /api/printers | admin | Crea stampante |
| PATCH | /api/printers/:id | admin | Aggiorna status |
| GET | /api/bookings | autenticato | Lista prenotazioni (admin: tutte, user: proprie) |
| POST | /api/bookings | autenticato | Crea prenotazione (con validazione overlap) |
| DELETE | /api/bookings/:id | autenticato | Cancella prenotazione (user: solo proprie + regola 15 min) |
| GET | /api/bookings/availability/:printerId | autenticato | Slot liberi per una data |
