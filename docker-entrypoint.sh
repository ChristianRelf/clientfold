#!/bin/sh
set -eu

mkdir -p /data /app/.storage

echo "Applying database schema..."
./node_modules/.bin/prisma db push --schema=prisma/schema.prisma --skip-generate

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  echo "Loading demo data..."
  ./node_modules/.bin/tsx prisma/seed.ts
fi

exec "$@"
