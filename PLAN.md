# PLAN — Step-by-step implementazione

## Step 1: Setup progetto + Docker

- Crea `docker-compose.yml` con 3 servizi (db PostgreSQL, backend, frontend) come da ARCHITECTURE.md
- Crea `backend/Dockerfile` (multi-stage: deps → build → run)
- Crea `frontend/Dockerfile` (multi-stage: deps → build Vite → Nginx)
- Crea `.dockerignore` e `.env.example`
- Inizializza `backend/package.json` con TypeScript, Express, `drizzle-orm`, `pg`, `@types/pg`, Zod, Vitest, tsup
- Aggiungi `drizzle-kit` come devDependency
- Configura `tsconfig.json` con strict mode
- Configura `vitest.config.ts`
- Crea struttura folder come da ARCHITECTURE.md
- Aggiungi script npm: `test`, `lint`, `build`, `dev`
- **Verifica:** `npm install` senza errori, `npm run build` compila, `docker compose up -d db` avvia PostgreSQL

Commit: `chore(setup): initialize project with TypeScript, Drizzle, and Docker Compose`

## Step 2: Database Drizzle ORM + PostgreSQL

- Implementa `src/db/schema.ts` con tabelle Drizzle (users, printers, bookings) — UUID, timestamps, enum/check
- Implementa `src/db/index.ts` con connessione pg pool + Drizzle instance (usa `DATABASE_URL` da env)
- Implementa `src/db/migrate.ts` — runner migrazioni Drizzle
- Implementa `src/db/seed.ts` — seed admin di default (email/password da env) + 2 stampanti ("Prusa MK4 #1", "Prusa MK4 #2")
- Crea `drizzle.config.ts` nella root backend
- Genera prima migrazione con `npx drizzle-kit generate`
- **Verifica:** `docker compose up -d db` poi test connessione e verifica che tabelle esistono

Commit: `feat(db): add Drizzle ORM schema and PostgreSQL migration`

## Step 3: Modelli Zod

- `src/models/printer.ts` — schema per creare/aggiornare stampante
- `src/models/booking.ts` — schema per creare prenotazione con:
  - validazione ISO 8601 per date
  - validazione start < end
  - validazione durata minima 30 min e massima 8 ore
- `src/models/user.ts` — schema per creare utente e login:
  - email formato valido
  - password minimo 8 caratteri
  - role: admin | user
- **Verifica:** test che schema accetta input valido e rifiuta invalido

Commit: `feat(models): add Zod schemas with duration validation`

## Step 4: Service stampanti

- `src/services/printer.service.ts`
- Funzioni: `listPrinters()`, `createPrinter()`, `updatePrinterStatus()`
- **Verifica:** test CRUD base

Commit: `feat(printer): add printer service with CRUD`

## Step 5: Service utenti e autenticazione

- `src/services/user.service.ts`
- Funzioni: `createUser()` (hash password con bcrypt), `listUsers()`, `getUserById()`, `getUserByEmail()`
- `src/services/auth.service.ts`
- Funzioni: `login()` (verifica password, genera JWT), `verifyToken()` (decodifica e valida JWT)
- `src/middleware/auth.ts`
  - `authenticate`: middleware che estrae JWT dall'header `Authorization`, verifica e attacca `req.user`
  - `authorize(role)`: middleware factory che controlla `req.user.role`
- **Verifica:** test login corretto/errato, test generazione/verifica JWT, test middleware 401/403

Commit: `feat(auth): add user service and JWT authentication`
Commit: `test(auth): add auth and authorization tests`

## Step 6: Service prenotazioni — CUORE DEL PROGETTO

- `src/services/booking.service.ts`
- Funzioni:
  - `createBooking()` — con validazione overlap, status stampante, no passato, associata a `user_id`
  - `listBookings()` — con filtri opzionali per stampante e range date; user vede solo le proprie, admin vede tutte
  - `cancelBooking()` — con regola 15 minuti; user solo le proprie (altrimenti 403), admin qualsiasi
  - `getAvailability()` — slot liberi per stampante e data
- Funzione interna `validateNoOverlap()` — controlla conflitti nel DB
- **Verifica CRITICA:** test overlap (totale, parziale inizio, parziale fine, adiacenza OK)
- **Verifica:** test cancellazione con regola 15 min
- **Verifica:** test rifiuto prenotazione su stampante in maintenance
- **Verifica:** test ownership (user cancella solo le proprie, admin cancella qualsiasi)

Commit: `feat(booking): add booking service with overlap validation`
Commit: `test(booking): add comprehensive overlap and edge case tests`

## Step 7: Route handlers

- `src/routes/auth.routes.ts` — mount su `/api/auth` (login, me)
- `src/routes/user.routes.ts` — mount su `/api/users` (admin only, protetto da `authorize('admin')`)
- `src/routes/printer.routes.ts` — mount su `/api/printers` (GET autenticato, POST/PATCH admin only)
- `src/routes/booking.routes.ts` — mount su `/api/bookings` (autenticato, ownership check su DELETE)
- Handler sottili: validano con Zod, delegano al service, restituiscono response
- Middleware `authenticate` applicato a tutte le route tranne `/api/auth/login`
- Error handling: 400 validazione, 401 non autenticato, 403 non autorizzato, 404 non trovato, 409 conflitto
- `src/index.ts` — monta le route, avvia Express su porta 3000
- **Verifica:** `npm test` completa, `npm run build` pulito

Commit: `feat(api): add REST endpoints for printers, bookings, users and auth`

## Step 8: Verifica finale backend

- Esegui `npm test` — tutti i test verdi
- Esegui `npm run build` — zero errori
- Test manuale con curl:
  1. GET /api/printers → lista stampanti
  2. POST /api/bookings → crea prenotazione
  3. POST /api/bookings → tenta overlap → 409
  4. DELETE /api/bookings/:id → cancella
- **Se tutto verde:** progetto completato

Commit: `chore(docs): finalize backend setup`

---

## Step 9: Ristrutturazione monorepo

- Spostare tutto il codice backend esistente nella cartella `/backend` (se non già strutturato così)
- Creare `/frontend` con Vite + React + Refine + Ant Design (`npm create refine-app` o setup manuale)
- Creare `frontend/Dockerfile` se non già presente
- Aggiungere CORS al backend Express (pacchetto `cors`)
- Aggiungere header `x-total-count` alle response delle liste nel backend
- Creare `package.json` root con script per avviare entrambi (`dev`, `test`, `build`)
- Verificare che `docker-compose.yml` (creato nello Step 1) includa correttamente tutti e 3 i servizi
- **Verifica:** `cd backend && npm test` passa, `cd frontend && npm run build` compila, `docker compose build` senza errori

Commit: `chore(monorepo): restructure project into backend and frontend`
Commit: `feat(backend): add CORS and x-total-count header for Refine compatibility`

## Step 10: Data provider, auth provider e layout base

- Configurare Refine REST data provider (`@refinedev/simple-rest`) puntato a `http://localhost:3000/api`
- Configurare Refine auth provider: login (chiama `/api/auth/login`, salva JWT in localStorage), logout, check (verifica token), getIdentity (restituisce utente corrente)
- Data provider: aggiungere header `Authorization: Bearer <token>` a tutte le richieste
- Pagina login con form email/password
- Layout Ant Design con sidebar navigation (Stampanti, Prenotazioni, Calendario, Utenti solo per admin)
- Pagine placeholder per ogni risorsa
- **Verifica:** `npm run dev` parte, login funziona, sidebar visibile con voci basate su ruolo

Commit: `feat(provider): configure Refine REST and auth providers`
Commit: `feat(ui): add login page and Ant Design layout with role-based sidebar`

## Step 11: CRUD Stampanti (UI)

- Pagina lista stampanti: tabella Ant Design con colonne nome e status (visibile a tutti)
- Pagina creazione stampante: form con campo nome (admin only)
- Pagina modifica stampante: form per cambiare status active/maintenance (admin only)
- **Verifica:** test rendering tabella, test submit form, test che user non vede bottoni crea/modifica

Commit: `feat(ui): add printer CRUD pages with role-based access`
Commit: `test(ui): add tests for printer pages`

## Step 12: CRUD Prenotazioni (UI)

- Pagina lista prenotazioni: user vede solo le proprie, admin vede tutte con filtri per stampante, data, utente
- Pagina creazione prenotazione: form con select stampante, DatePicker per start/end, note (user_id impostato automaticamente dall'utente loggato)
- Pagina dettaglio prenotazione: mostra tutti i campi
- Gestione errori dal backend: 409 (overlap) → notifica "Slot già occupato", 400 → notifica con messaggio, 403 → notifica "Non autorizzato"
- **Verifica:** test rendering, test gestione errori

Commit: `feat(ui): add booking CRUD pages with error handling`
Commit: `test(ui): add tests for booking pages`

## Step 13: Gestione Utenti (UI, admin only)

- Pagina lista utenti: tabella con nome, email, ruolo (visibile solo ad admin)
- Pagina creazione utente: form con nome, email, password, ruolo (admin only)
- Sidebar mostra "Utenti" solo se l'utente loggato è admin
- **Verifica:** test rendering, test che user non può accedere alla pagina utenti

Commit: `feat(ui): add user management pages for admin`
Commit: `test(ui): add tests for user pages`

## Step 14: Vista Calendario

- Componente `BookingCalendar` con vista giornaliera/settimanale per stampante
- Slot occupati visualizzati come blocchi colorati
- Slot liberi cliccabili per avviare creazione prenotazione
- Selector per stampante in cima alla pagina
- **Verifica:** test rendering calendario, test click su slot

Commit: `feat(calendar): add booking calendar with day view`
Commit: `test(calendar): add calendar component tests`

## Step 15: Cancellazione e feedback

- Bottone cancella nella lista prenotazioni e nel dettaglio, con dialog di conferma
- User: cancella solo le proprie; admin: cancella qualsiasi
- Gestione errore 409 "troppo tardi per cancellare" → notifica Ant Design chiara
- Gestione errore 403 "non autorizzato" → notifica chiara
- Notifiche di successo per tutte le operazioni CRUD
- **Verifica:** test cancellazione con conferma, test gestione errore 409, test gestione errore 403

Commit: `feat(ui): add booking cancellation with confirmation and error feedback`
Commit: `test(ui): add cancellation and notification tests`

## Step 16: Verifica finale fullstack

- Avviare tutto con `docker compose up --build` — verificare che tutti e 3 i servizi partono senza errori
- Test E2E manuale del flusso completo:
  1. Login come admin
  2. Creare un utente con ruolo user
  3. Creare una stampante
  4. Logout, login come user
  5. Visualizzare lista stampanti
  6. Creare una prenotazione via form
  7. Verificare che appare nel calendario
  8. Tentare prenotazione sovrapposta → errore 409 visibile
  9. Cancellare prenotazione
  10. Tentare accesso a gestione stampanti → non visibile/403
  11. Login come admin, mettere stampante in maintenance → prenotazione rifiutata
- Eseguire `npm test` in entrambe le cartelle (con PostgreSQL di test attivo)
- Eseguire `npm run build` in entrambe le cartelle
- Verificare `docker compose up --build` — tutti i servizi healthy
- **Se tutto verde:** progetto fullstack completato

Commit: `chore(docs): finalize fullstack project`
