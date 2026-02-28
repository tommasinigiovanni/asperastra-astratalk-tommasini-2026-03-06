# CLAUDE.md — Booking Stampante 3D FabLab

## Identità progetto

Sistema di prenotazione slot per stampanti 3D di un FabLab.
Backend API REST. Niente frontend in questo scope.

## Regola zero: pensa prima di scrivere

Non iniziare a scrivere codice prima di aver letto e compreso tutti i file di specifica.
Questo è il tuo ordine di lettura obbligatorio:

1. `PRD.md` → capisci cosa il sistema È e cosa NON È
2. `ARCHITECTURE.md` → capisci dove va ogni pezzo di codice
3. `AI_RULES.md` → capisci le regole operative non negoziabili
4. `PLAN.md` → capisci in che ordine lavorare

Se non hai letto tutti e 4 i file, non hai contesto sufficiente per procedere.

## Workflow: Test-Driven Development

Segui il ciclo RED → GREEN → REFACTOR per ogni feature:

1. **RED** — Scrivi il test che descrive il comportamento atteso. Eseguilo. DEVE fallire.
2. **GREEN** — Scrivi il codice minimo per far passare il test. Niente di più.
3. **REFACTOR** — Pulisci il codice mantenendo i test verdi.

Non scrivere mai codice di implementazione prima del test corrispondente.
Se ti ritrovi con codice senza test, fermati e scrivi il test.

## Loop di verifica obbligatorio

Dopo ogni modifica significativa, esegui il loop completo:

```
npm test          → tutti i test devono passare
npm run lint      → zero errori, zero warning
npm run build     → compilazione TypeScript pulita
```

Se un qualsiasi step fallisce, correggi PRIMA di procedere al passo successivo del piano.
Non andare avanti con test rotti. Mai.

## Commit atomici

Ogni commit riguarda UNA singola unità di lavoro completata e verificata.
Formato messaggio: `tipo(scope): descrizione`

Tipi ammessi: `feat`, `fix`, `test`, `refactor`, `chore`

Esempi:
- `feat(booking): add overlap validation in service layer`
- `test(booking): add rejection test for overlapping slots`
- `chore(setup): initialize project with TypeScript and Vitest`

Committa solo dopo che il loop di verifica è passato.

## Struttura del codice

Rispetta la struttura definita in `ARCHITECTURE.md`. Se hai dubbi su dove mettere qualcosa, rileggi quel file.

Regole di base:
- Logica di business → `src/services/` (mai nei route handler)
- Validazione input → Zod schemas in `src/models/`
- Route handlers → sottili, delegano ai services
- Test → `src/tests/`, uno per ogni service

## Cosa NON fare

- Non aggiungere feature non presenti nel PRD.md
- Non installare dipendenze non previste dall'architettura
- Non creare UI/frontend (fuori scope)
- Non saltare step del PLAN.md
- Non ignorare test falliti per andare avanti
- Non fare commit con test rotti

## Quando sei bloccato

Se un test continua a fallire dopo 3 tentativi di fix:
1. Rileggi il PRD e le AI_RULES per confermare che il test è corretto
2. Se il test è corretto, il bug è nel codice — non modificare il test
3. Se dopo analisi il test è sbagliato, spiegami perché prima di cambiarlo
