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

Open First Day and frame it as a new student's first hours at Alden Hall, an East Coast boarding school — not a video widget. Every person on the map is a separate Vidu S2 avatar: their own portrait, voice, and persona, on a live Reactor session. Walk the morning quad, tap Sloane Vickers, and let the call connect; talk with the mic or the Say box and the lip-synced video answers. Leave, go to the classroom, and run Dr. Ward's placement as dialogue choices, which is still just talking to her. Then open a second room and a second character. The point for the room is that Reactor can carry several distinct conversational characters inside one navigable scene, which is the shape of a social sim or a narrative game, not a single floating head.

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

The app is a Next.js 15 project and deploys on Vercel with no extra config.

1. Import the repo as a Next.js project (root directory is the app).
2. Set `REACTOR_API_KEY` for Production and Preview. Do not use a
   `NEXT_PUBLIC_` name for that key.
3. Redeploy. Guests open the URL and play; there is no GitHub or other login.

If the key is missing, the page explains how to add it instead of erroring.

## What a player does

Morning arrival, mid-morning class, lunch, afternoon gym, evening dorm. The
bell moves the day. In the classroom, Dr. Ward's placement is three spoken
questions with dialogue choices — still a call, not a separate quiz engine.
A connected session with nobody on the line disconnects after two minutes.
