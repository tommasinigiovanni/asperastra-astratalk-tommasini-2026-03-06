# PLAN — Step-by-step implementazione

## Step 1: Setup progetto

- Inizializza `package.json` con TypeScript, Express, better-sqlite3, Zod, Vitest, tsup
- Configura `tsconfig.json` con strict mode
- Configura `vitest.config.ts`
- Crea struttura folder come da ARCHITECTURE.md
- Aggiungi script npm: `test`, `lint`, `build`, `dev`
- **Verifica:** `npm install` senza errori, `npm run build` compila

Commit: `chore(setup): initialize project with TypeScript and Vitest`

## Step 2: Database e schema

- Implementa `src/db.ts` con setup SQLite e funzione di migrazione
- Crea tabelle `printers` e `bookings` come da ARCHITECTURE.md
- Funzione `createDb()` che accetta path (o `:memory:` per test)
- Crea tabella `users` con ruoli admin/user come da ARCHITECTURE.md
- Seed di un admin di default (email/password da env o fallback)
- Seed di 2 stampanti di default ("Prusa MK4 #1", "Prusa MK4 #2")
- **Verifica:** test che il database si crea e le tabelle esistono

Commit: `feat(db): add SQLite schema and migration`

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

- Spostare tutto il codice backend esistente nella cartella `/backend`
- Creare `/frontend` con Vite + React + Refine + Ant Design (`npm create refine-app` o setup manuale)
- Aggiungere CORS al backend Express (pacchetto `cors`)
- Aggiungere header `x-total-count` alle response delle liste nel backend
- Creare `package.json` root con script per avviare entrambi (`dev`, `test`, `build`)
- **Verifica:** `cd backend && npm test` passa, `cd frontend && npm run build` compila

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

- Avviare backend (`cd backend && npm run dev`) e frontend (`cd frontend && npm run dev`)
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
- Eseguire `npm test` in entrambe le cartelle
- Eseguire `npm run build` in entrambe le cartelle
- **Se tutto verde:** progetto fullstack completato

Commit: `chore(docs): finalize fullstack project`
