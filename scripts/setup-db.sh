#!/bin/bash

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Seed database
echo "Seeding database..."
npx ts-node prisma/seed.ts

echo "Database setup complete!"
