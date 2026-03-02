#!/bin/sh
set -e

echo "[STARTUP] Running migrations..."
node dist/db/migrate.js

echo "[STARTUP] Running seed..."
node dist/db/seed.js

echo "[STARTUP] Starting server..."
exec node dist/index.js
