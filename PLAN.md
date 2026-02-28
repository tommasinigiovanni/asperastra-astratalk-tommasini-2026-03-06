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

---

## Step 8: Ristrutturazione monorepo

- Spostare tutto il codice backend esistente nella cartella `/backend`
- Creare `/frontend` con Vite + React + Refine + Ant Design (`npm create refine-app` o setup manuale)
- Aggiungere CORS al backend Express (pacchetto `cors`)
- Aggiungere header `x-total-count` alle response delle liste nel backend
- Creare `package.json` root con script per avviare entrambi (`dev`, `test`, `build`)
- **Verifica:** `cd backend && npm test` passa, `cd frontend && npm run build` compila

Commit: `chore(monorepo): restructure project into backend and frontend`
Commit: `feat(backend): add CORS and x-total-count header for Refine compatibility`

## Step 9: Data provider e layout base

- Configurare Refine REST data provider (`@refinedev/simple-rest`) puntato a `http://localhost:3000/api`
- Layout Ant Design con sidebar navigation (Stampanti, Prenotazioni, Calendario)
- Pagine placeholder per ogni risorsa
- **Verifica:** `npm run dev` parte, sidebar visibile, navigazione funziona

Commit: `feat(provider): configure Refine REST data provider`
Commit: `feat(ui): add Ant Design layout with sidebar navigation`

## Step 10: CRUD Stampanti (UI)

- Pagina lista stampanti: tabella Ant Design con colonne nome e status
- Pagina creazione stampante: form con campo nome
- Pagina modifica stampante: form per cambiare status (active/maintenance)
- **Verifica:** test rendering tabella, test submit form

Commit: `feat(ui): add printer CRUD pages`
Commit: `test(ui): add tests for printer pages`

## Step 11: CRUD Prenotazioni (UI)

- Pagina lista prenotazioni: tabella con filtri per stampante, data, utente
- Pagina creazione prenotazione: form con select stampante, DatePicker per start/end, campo utente e note
- Pagina dettaglio prenotazione: mostra tutti i campi
- Gestione errori dal backend: 409 (overlap) → notifica "Slot già occupato", 400 → notifica con messaggio
- **Verifica:** test rendering, test gestione errori

Commit: `feat(ui): add booking CRUD pages with error handling`
Commit: `test(ui): add tests for booking pages`

## Step 12: Vista Calendario

- Componente `BookingCalendar` con vista giornaliera/settimanale per stampante
- Slot occupati visualizzati come blocchi colorati
- Slot liberi cliccabili per avviare creazione prenotazione
- Selector per stampante in cima alla pagina
- **Verifica:** test rendering calendario, test click su slot

Commit: `feat(calendar): add booking calendar with day view`
Commit: `test(calendar): add calendar component tests`

## Step 13: Cancellazione e feedback

- Bottone cancella nella lista prenotazioni e nel dettaglio, con dialog di conferma
- Gestione errore 409 "troppo tardi per cancellare" → notifica Ant Design chiara
- Notifiche di successo per tutte le operazioni CRUD
- **Verifica:** test cancellazione con conferma, test gestione errore 409

Commit: `feat(ui): add booking cancellation with confirmation and error feedback`
Commit: `test(ui): add cancellation and notification tests`

## Step 14: Verifica finale fullstack

- Avviare backend (`cd backend && npm run dev`) e frontend (`cd frontend && npm run dev`)
- Test E2E manuale del flusso completo:
  1. Creare una stampante
  2. Visualizzare lista stampanti
  3. Creare una prenotazione via form
  4. Verificare che appare nel calendario
  5. Tentare prenotazione sovrapposta → errore 409 visibile
  6. Cancellare prenotazione
  7. Mettere stampante in maintenance → prenotazione rifiutata
- Eseguire `npm test` in entrambe le cartelle
- Eseguire `npm run build` in entrambe le cartelle
- **Se tutto verde:** progetto fullstack completato

Commit: `chore(docs): finalize fullstack project`
