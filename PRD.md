# PRD — Booking Stampante 3D FabLab

## Problema

I membri del FabLab prenotano le stampanti 3D a voce, con foglietti, o su un Google Sheet condiviso. Risultato: sovrapposizioni, slot fantasma, nessuno sa se la macchina è libera.

## Soluzione

API REST per prenotare slot temporali sulle stampanti 3D. Gestione conflitti, validazione, cancellazione.

## Cosa il sistema È

- API per creare, leggere, aggiornare e cancellare prenotazioni
- Validazione rigorosa degli slot (durata, sovrapposizioni, orari)
- Un database locale SQLite per persistenza
- Pensato per un singolo FabLab con più stampanti

## Cosa il sistema NON È

- Non è un sistema di autenticazione utenti (no login, no password)
- Non gestisce pagamenti o fatturazione
- Non monitora lo stato fisico della stampante (filamento, temperatura)
- Non ha frontend/UI (solo API)
- Non invia notifiche (email, SMS, push)
- Non gestisce prenotazioni ricorrenti

## Utenti target

Membri del FabLab che devono prenotare tempo-macchina. Identificati solo per nome (stringa).

## Entità principali

### Stampante
- `id`: identificativo unico
- `name`: nome leggibile (es. "Prusa MK4 #1")
- `status`: active | maintenance

### Prenotazione
- `id`: identificativo unico
- `printer_id`: riferimento alla stampante
- `user_name`: chi ha prenotato
- `start_time`: inizio slot (ISO 8601)
- `end_time`: fine slot (ISO 8601)
- `notes`: note opzionali (es. "stampa PLA grande")
- `created_at`: timestamp creazione

## Regole di business critiche

1. Due prenotazioni sulla stessa stampante NON possono sovrapporsi
2. Slot minimo: 30 minuti
3. Slot massimo: 8 ore
4. Non si può prenotare nel passato
5. Una stampante in `maintenance` non accetta prenotazioni
6. Cancellazione possibile solo se mancano più di 15 minuti all'inizio
