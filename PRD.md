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

## Interfaccia utente

### Vista Dashboard
- Lista stampanti con stato corrente (active/maintenance)
- Accesso rapido alla prenotazione per ogni stampante

### Vista Calendario
- Calendario per stampante con slot occupati e liberi
- Click su uno slot libero per avviare la prenotazione

### Vista Prenotazioni
- Tabella CRUD con tutte le prenotazioni
- Filtri per stampante, data, utente
- Dettaglio prenotazione con possibilità di cancellazione

### Vista Gestione Stampanti
- Tabella CRUD per admin: crea stampante, cambia stato (active/maintenance)

### Comportamento UI
- Feedback visuale su errori: overlap (409), stampante in maintenance (400), cancellazione troppo tardi (409)
- Notifiche chiare per operazioni riuscite e fallite
- Form con validazione client-side coerente con le regole di business
