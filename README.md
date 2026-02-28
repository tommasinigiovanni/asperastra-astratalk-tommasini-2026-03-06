# AstraTalk — Sistema prenotazione stampante 3D FabLab

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[![Made with AI](https://img.shields.io/badge/Made%20with-AI%20%E2%9D%A4%EF%B8%8F-ff69b4)](https://evoseed.io)
[![Giovanni Tommasini](https://img.shields.io/badge/Giovanni%20Tommasini-AI%20Developer-blue)](https://giovannitommasini.it/)

[![Hackathon](https://img.shields.io/badge/Event-Oltre%20Lovable%20Agent%20AI%20per%20sviluppare%20app-red?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDJMNiAxMmg0djEwaDRWMTJoNHoiLz48L3N2Zz4=)](https://www.eventbrite.it/e/oltre-lovable-agent-ai-per-sviluppare-app-giovanni-tommasini-astratalk-tickets-1983083190205)
[![Location](https://img.shields.io/badge/Location-Trieste%20🇮🇹-green)](https://asperastra.com)


**Demo AstraTalk** — Sistema prenotazione stampante 3D FabLab. Esempio pratico di sviluppo AI-driven con framework 5 file.

## Il progetto

Sistema di prenotazione slot per stampanti 3D di un FabLab. I membri prenotano le stampanti 3D tramite un'interfaccia web, con validazione automatica di sovrapposizioni, durata e disponibilità.

Due ruoli: **admin** (staff Asperastra) gestisce stampanti e utenti, **user** (membri FabLab) prenota slot e gestisce le proprie prenotazioni.

## Stack tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Frontend | React + Refine + Ant Design |
| Auth | JWT + bcrypt |
| Infra | Docker Compose (3 servizi: db, backend, frontend) |
| Test | Vitest + React Testing Library |

## Quick start

```bash
# Clona il repo
git clone https://github.com/tommasinigiovanni/asperastra-astratalk-tommasini-2026-03-06.git
cd asperastra-astratalk-tommasini-2026-03-06

# Copia e configura le variabili d'ambiente
cp .env.example .env

# Avvia tutto con Docker Compose
docker compose up --build
```

Servizi disponibili:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## Documentazione

Il progetto segue un framework di specifica a 5 file:

| File | Contenuto |
|------|-----------|
| [`PRD.md`](PRD.md) | Requisiti di prodotto, regole di business, entità |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Stack, struttura folder, schema DB, endpoint API |
| [`AI_RULES.md`](AI_RULES.md) | Regole operative non negoziabili (validazione, testing, stile) |
| [`PLAN.md`](PLAN.md) | Step-by-step di implementazione |
| [`CLAUDE.md`](CLAUDE.md) | Istruzioni per lo sviluppo AI-driven |

---

## Licenza

Apache 2.0 - Usa, modifica e condividi liberamente!

---

Made with ❤️ by [Giovanni Tommasini](https://giovannitommasini.it/) per l'evento **Oltre Lovable Agent AI per sviluppare app**