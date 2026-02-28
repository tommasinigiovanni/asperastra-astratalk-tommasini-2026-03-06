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
- Seed di 2 stampanti di default ("Prusa MK4 #1", "Prusa MK4 #2")
- **Verifica:** test che il database si crea e le tabelle esistono

Commit: `feat(db): add SQLite schema and migration`

## Step 3: Modelli Zod

- `src/models/printer.ts` — schema per creare/aggiornare stampante
- `src/models/booking.ts` — schema per creare prenotazione con:
  - validazione ISO 8601 per date
  - validazione start < end
  - validazione durata minima 30 min e massima 8 ore
  - user_name non vuoto
- **Verifica:** test che schema accetta input valido e rifiuta invalido

Commit: `feat(models): add Zod schemas with duration validation`

## Step 4: Service stampanti

- `src/services/printer.service.ts`
- Funzioni: `listPrinters()`, `createPrinter()`, `updatePrinterStatus()`
- **Verifica:** test CRUD base

Commit: `feat(printer): add printer service with CRUD`

## Step 5: Service prenotazioni — CUORE DEL PROGETTO

- `src/services/booking.service.ts`
- Funzioni:
  - `createBooking()` — con validazione overlap, status stampante, no passato
  - `listBookings()` — con filtri opzionali per stampante e range date
  - `cancelBooking()` — con regola 15 minuti
  - `getAvailability()` — slot liberi per stampante e data
- Funzione interna `validateNoOverlap()` — controlla conflitti nel DB
- **Verifica CRITICA:** test overlap (totale, parziale inizio, parziale fine, adiacenza OK)
- **Verifica:** test cancellazione con regola 15 min
- **Verifica:** test rifiuto prenotazione su stampante in maintenance

Commit: `feat(booking): add booking service with overlap validation`
Commit: `test(booking): add comprehensive overlap and edge case tests`

## Step 6: Route handlers

- `src/routes/printer.routes.ts` — mount su `/api/printers`
- `src/routes/booking.routes.ts` — mount su `/api/bookings`
- Handler sottili: validano con Zod, delegano al service, restituiscono response
- Error handling: 400 validazione, 404 non trovato, 409 conflitto
- `src/index.ts` — monta le route, avvia Express su porta 3000
- **Verifica:** `npm test` completa, `npm run build` pulito

Commit: `feat(api): add REST endpoints for printers and bookings`

## Step 7: Verifica finale

- Esegui `npm test` — tutti i test verdi
- Esegui `npm run build` — zero errori
- Test manuale con curl:
  1. GET /api/printers → lista stampanti
  2. POST /api/bookings → crea prenotazione
  3. POST /api/bookings → tenta overlap → 409
  4. DELETE /api/bookings/:id → cancella
- **Se tutto verde:** progetto completato

Commit: `chore(docs): finalize project setup`
