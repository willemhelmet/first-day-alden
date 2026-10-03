# First Day

A vertical slice of a first day at Alden Hall, an East Coast boarding school.
The player walks a campus — quad, classroom, gymnasium, dorm, library — and
every person they meet is a live [Vidu S2](https://reactor.inc) avatar on
Reactor: their own portrait, voice, and persona, lip-synced on a call.

This is day one only. Who stands where is a fixed schedule in
`app/lib/campus.ts` (`PLACEMENTS`). A later day can replace that list with a
generated one of the same shape without touching the map or the call flow.

Guests play with no login. The browser never sees `REACTOR_API_KEY`. The
server route `app/api/reactor/token/route.ts` mints a short-lived JWT scoped
to `reactor/vidu-s2-avatar`.

## Seller script

Open First Day and frame it as a new student's first hours at Alden Hall, an East Coast boarding school — not a video widget. The morning opens on the grounds. Step into the library, sit across from Priya Nayak, and let the call connect. The only way to speak is the two lines under Across the table. She answers on a live Vidu S2 call, her own portrait and voice. The other places on the grounds still hold the rest of the day. The point for the room is that Reactor can carry several distinct conversational characters inside one navigable scene, which is the shape of a social sim or a narrative game, not a single floating head.

## Run locally

```bash
cp .env.example .env.local
# REACTOR_API_KEY=rk_... from https://www.reactor.inc/account/api-keys
pnpm install
pnpm dev
```

Optional: `NEXT_PUBLIC_COORDINATOR_URL` is forwarded to the SDK as `apiUrl`
when you need a non-default coordinator. Leave it unset for production Reactor.

## Deploy

The Next.js app is at the repository root. `package.json` lists `next` in
`dependencies` (currently `^15.5.0`). Vercel’s Root Directory for this
project is that same root — leave it empty in the dashboard. A parent folder
with no `package.json`, or a Root Directory that does not contain this file,
fails the build with “No Next.js version detected”.

`pnpm build` succeeds locally. Set `REACTOR_API_KEY` on the Vercel project
for Production (and Preview, if you use it). Do not use a `NEXT_PUBLIC_`
name for that key, and do not commit it. Guests open the production URL and
play. There is no GitHub login. If the key is missing at build time, the
page explains how to add it instead of crashing.

## What a player does

Morning arrival, mid-morning class, lunch, afternoon gym, evening dorm. The
bell moves the day. In the classroom, Dr. Ward's placement is three spoken
questions with dialogue choices — still a call, not a separate quiz engine.
A connected session with nobody on the line disconnects after two minutes.

<!-- Redeploy so production reads the project REACTOR_API_KEY. -->
