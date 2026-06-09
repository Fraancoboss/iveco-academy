#!/bin/sh
set -e

echo "==> Setting up database..."
./node_modules/.bin/tsx scripts/db-setup.ts

echo "==> Starting API..."
exec pnpm --filter api start
