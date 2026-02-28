# AI_RULES — Regole operative non negoziabili

## Validazione input

- Ogni input dall'esterno DEVE passare attraverso uno schema Zod
- Mai fidarsi dei dati in ingresso: validare tipo, range, formato
- Date in formato ISO 8601 — rifiutare qualsiasi altro formato
- `printer_id` deve esistere nel database prima di creare una prenotazione
- `email` deve essere un formato email valido
- `password` minimo 8 caratteri al momento della registrazione

## Prenotazioni: regole di conflitto

- Due prenotazioni sulla stessa stampante NON possono sovrapporsi
- Il controllo overlap deve essere: `existing.start < new.end AND existing.end > new.start`
- Slot minimo: 30 minuti (rifiutare se `end - start < 30 min`)
- Slot massimo: 8 ore (rifiutare se `end - start > 8 ore`)
- Non si può prenotare nel passato (start_time deve essere > now)
- Stampante in `maintenance` → rifiutare con errore esplicito

## Cancellazione

- Possibile solo se mancano più di 15 minuti all'inizio dello slot
- Se mancano meno di 15 minuti → errore 409 con messaggio "troppo tardi per cancellare"
- Un user può cancellare solo le proprie prenotazioni → 403 se tenta di cancellare quelle altrui
- Un admin può cancellare qualsiasi prenotazione

## Autenticazione e autorizzazione

- Tutte le route (tranne `/api/auth/login`) richiedono un JWT valido → 401 se mancante o scaduto
- Le route admin (`POST /api/printers`, `PATCH /api/printers/:id`, `/api/users`) richiedono `role: admin` → 403 se user
- Il middleware `authenticate` estrae l'utente dal token e lo rende disponibile come `req.user`
- Il middleware `authorize('admin')` controlla il ruolo — va applicato DOPO `authenticate`
- Password mai in chiaro: usare bcrypt per hash e verifica
- JWT secret configurabile via variabile d'ambiente `JWT_SECRET` — mai hardcoded nel codice
- Il token NON deve contenere dati sensibili (no password_hash)

## Testing

- Ogni funzione del service layer DEVE avere almeno un test
- I test per l'overlap sono OBBLIGATORI e devono coprire:
  - Overlap totale (nuovo slot dentro uno esistente)
  - Overlap parziale inizio (nuovo inizia prima, finisce durante)
  - Overlap parziale fine (nuovo inizia durante, finisce dopo)
  - Adiacenza esatta (slot che finisce esattamente quando inizia l'altro → DEVE essere permesso)
- I test per la validazione devono coprire:
  - Slot troppo corto (< 30 min)
  - Slot troppo lungo (> 8 ore)
  - Start nel passato
  - Stampante in maintenance
- I test per autenticazione/autorizzazione devono coprire:
  - Login con credenziali corrette → JWT valido
  - Login con credenziali errate → 401
  - Accesso route protetta senza token → 401
  - Accesso route admin con ruolo user → 403
  - User cancella propria prenotazione → OK
  - User cancella prenotazione altrui → 403
  - Admin cancella prenotazione di un user → OK
- Usa un database di test PostgreSQL dedicato (container o DB separato via variabile d'ambiente `DATABASE_URL_TEST`)
- Ogni test suite fa setup/teardown con transazioni o truncate delle tabelle
- Ogni test deve essere indipendente: setup e teardown propri

## Stile codice

- TypeScript strict mode — no `any`, no `as` senza motivo documentato
- Funzioni piccole: una responsabilità per funzione
- Nomi descrittivi: `validateNoOverlap()` non `check()`
- Errori con messaggi leggibili da umano, non codici criptici
- Commenti solo quando il "perché" non è ovvio dal codice

## Commit

- Un commit per unità di lavoro completata
- Formato: `tipo(scope): descrizione`
- Non committare mai con test falliti
- Non committare file temporanei, .db, node_modules

## Frontend — Testing

- Componenti React testati con Vitest + React Testing Library
- Test per ogni pagina CRUD: verifica rendering tabella, submit form, gestione errori
- Test per il componente calendario: rendering slot, click su slot libero, feedback su slot occupato
- Mock del data provider Refine nei test (non fare chiamate HTTP reali)
- Ogni componente custom (non pagine Refine standard) DEVE avere almeno un test

## Frontend — Stile codice

- Componenti funzionali — no class components
- Usare hooks Refine (`useTable`, `useForm`, `useShow`, `useList`) per interazione dati
- No logica di business nei componenti: delegare a hooks custom o utility functions
- TypeScript strict mode — no `any`, props tipizzate
- Un componente per file, nome file = nome componente in lowercase

## Frontend — Commit

- Stessi tipi del backend: `feat`, `fix`, `test`, `refactor`, `chore`
- Scope `(ui)` per pagine e layout generali: `feat(ui): add printer list page`
- Scope `(calendar)` per componente calendario: `feat(calendar): add booking calendar with day view`
- Scope `(provider)` per data provider: `feat(provider): configure Refine REST data provider`

## Logging

- Log strutturato su operazioni: creazione, cancellazione, rifiuto overlap
- Formato: `[BOOKING] action=create printer=prusa-1 user=mario slot=2026-03-06T10:00/14:00`
- No log di debug lasciati nel codice finale
