export function SetupRequired() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c1210] p-6">
      <div className="w-full max-w-lg rounded-2xl border border-[#3a4a3c] bg-[#101814] p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#d7c7a2]/70">
          Alden Hall · First Day
        </p>
        <h1 className="mt-2 font-display text-2xl text-[#f4ecd9]">
          The grounds are locked
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          This demo mints a short-lived session token on the server. The
          Reactor key never reaches the browser, and there is no account to
          sign in with — add the key and the day opens.
        </p>
        <ol className="mt-4 space-y-3 text-sm text-zinc-300">
          <li>
            <span className="text-[#d7c7a2]">1.</span> Create a key at{" "}
            <a
              href="https://www.reactor.inc/account/api-keys"
              className="text-brand underline"
            >
              reactor.inc/account/api-keys
            </a>
            .
          </li>
          <li>
            <span className="text-[#d7c7a2]">2.</span> Locally, put it in{" "}
            <code className="font-mono text-xs text-zinc-200">.env.local</code>.
            On Vercel, set the same name under project environment variables.
            <pre className="mt-2 overflow-x-auto rounded-md border border-[#3a4a3c] bg-black/50 p-3 font-mono text-xs text-zinc-300">
              REACTOR_API_KEY=rk_...
            </pre>
          </li>
          <li>
            <span className="text-[#d7c7a2]">3.</span> Restart, or redeploy.
            Guests play with no login.
          </li>
        </ol>
      </div>
    </div>
  );
}
