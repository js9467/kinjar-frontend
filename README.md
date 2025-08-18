# Kinjar Frontend

## Setup
1. `npm i`
2. Copy `.env.local.example` to `.env.local` and set:
   - `KINJAR_API_BASE=https://kinjar-api.fly.dev`
   - `KINJAR_LOCAL_FAMILY=slaughterbecks` (for localhost)

## Dev
`npm run dev` then open http://localhost:3000/(app)/feed

- Public highlights at: http://localhost:3000/slaughterbecks (or any family in env)

## Deploy (Vercel)
- Add env var `KINJAR_API_BASE` in Vercel project settings.
- Deploy. Subdomains like `slaughterbecks.kinjar.com` will show that family’s public page.
- Private feed at `https://slaughterbecks.kinjar.com/(app)/feed` (you can add auth later).