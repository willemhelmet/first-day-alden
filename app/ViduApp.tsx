"use client";

import { Game } from "./components/Game";
import { ViduS2AvatarProvider } from "./lib/model";
import { SessionProvider } from "./lib/session";

// The memoized token resolver handed to <ViduS2AvatarProvider jwtToken>.
//
// The token is memoized in module scope, not the browser's HTTP cache (the
// route is no-store). A session can only be operated by the exact token
// that created it, and the SDK calls the resolver again on every later hop
// the session makes — so the resolver must return the SAME token for the
// token's whole life, and only re-mint close to expiry.
const TOKEN_REFRESH_SKEW_MS = 60_000;
let cachedToken: { jwt: string; expiresAtMs: number } | null = null;
let inflightToken: Promise<string> | null = null;

async function fetchToken(): Promise<string> {
  if (
    cachedToken &&
    Date.now() < cachedToken.expiresAtMs - TOKEN_REFRESH_SKEW_MS
  ) {
    return cachedToken.jwt;
  }
  if (inflightToken) return inflightToken;
  inflightToken = (async () => {
    try {
      const response = await fetch("/api/reactor/token", { cache: "no-store" });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `Token fetch failed: ${response.status}`);
      }
      const { jwt, expires_at } = (await response.json()) as {
        jwt: string;
        expires_at: number;
      };
      cachedToken = { jwt, expiresAtMs: expires_at * 1000 };
      return jwt;
    } finally {
      inflightToken = null;
    }
  })();
  return inflightToken;
}

// Optional override for a non-default coordinator. The SDK calls this `apiUrl`.
// Unset means the published Reactor coordinator.
const coordinatorUrl = process.env.NEXT_PUBLIC_COORDINATOR_URL;

// No autoConnect. Talking to someone connects, because that is when the
// session has work to do. A connected session bills, so the flow still
// drops it after two quiet minutes.
export function ViduApp() {
  return (
    <ViduS2AvatarProvider
      jwtToken={fetchToken}
      {...(coordinatorUrl ? { apiUrl: coordinatorUrl } : {})}
    >
      <SessionProvider>
        <Game />
      </SessionProvider>
    </ViduS2AvatarProvider>
  );
}
