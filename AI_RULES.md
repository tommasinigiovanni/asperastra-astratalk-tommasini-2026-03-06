# AI_RULES — Regole operative non negoziabili

## Validazione input

- Ogni input dall'esterno DEVE passare attraverso uno schema Zod
- Mai fidarsi dei dati in ingresso: validare tipo, range, formato
- Date in formato ISO 8601 — rifiutare qualsiasi altro formato
- `user_name` non può essere stringa vuota o solo spazi
- `printer_id` deve esistere nel database prima di creare una prenotazione

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
  - User name vuoto
- Usa database in-memory per i test (`:memory:`)
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

## Logging

- Log strutturato su operazioni: creazione, cancellazione, rifiuto overlap
- Formato: `[BOOKING] action=create printer=prusa-1 user=mario slot=2026-03-06T10:00/14:00`
- No log di debug lasciati nel codice finale
