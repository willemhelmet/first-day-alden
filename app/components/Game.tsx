"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  characterForVisit,
  PERIODS,
  ROOMS,
  placementFor,
  type RoomId,
} from "../lib/campus";
import { characterById } from "../lib/characters";
import { SELLER_SCRIPT } from "../lib/demo";
import { callActive } from "../lib/call";
import { useSession } from "../lib/session";
import { CampusMap } from "./CampusMap";
import { Conversation } from "./Conversation";
import { RoomPanel } from "./RoomPanel";

export function Game() {
  const session = useSession();
  const [periodIndex, setPeriodIndex] = useState(0);
  const [roomId, setRoomId] = useState<RoomId | null>(null);
  const [talkId, setTalkId] = useState<string | null>(null);
  const [met, setMet] = useState<Record<string, string[]>>({});
  const [quizStep, setQuizStep] = useState(0);
  const [pendingTalk, setPendingTalk] = useState<string | null>(null);

  const period = PERIODS[periodIndex];
  const placement =
    talkId && roomId
      ? placementFor(period.id, roomId, talkId)
      : undefined;
  const talking = talkId ? characterById(talkId) : undefined;

  useEffect(() => {
    if (session.phase !== "live" || !talkId) return;
    setMet((current) => {
      const seen = current[period.id] ?? [];
      if (seen.includes(talkId)) return current;
      return { ...current, [period.id]: [...seen, talkId] };
    });
  }, [session.phase, talkId, period.id]);

  function openTalk(characterId: string) {
    if (!roomId) return;
    setPendingTalk(characterId);
    if (callActive(session.phase)) void session.endCall();
  }

  useEffect(() => {
    if (!pendingTalk || !roomId) return;
    if (callActive(session.phase) || session.busy === "ending") return;
    const nextPlacement = placementFor(period.id, roomId, pendingTalk);
    const character = characterById(pendingTalk);
    if (!nextPlacement || !character) return;
    session.chooseCharacter(characterForVisit(character, nextPlacement));
    setTalkId(pendingTalk);
    setPendingTalk(null);
  }, [
    pendingTalk,
    roomId,
    period.id,
    session.phase,
    session.busy,
    session.chooseCharacter,
  ]);

  function leaveTalk() {
    setTalkId(null);
  }

  function shiftPeriod(next: number) {
    if (callActive(session.phase)) void session.endCall();
    setTalkId(null);
    setPendingTalk(null);
    setRoomId(null);
    setPeriodIndex(next);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-[#3a4a3c] px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#d7c7a2]/70">
            First day · North House
          </p>
          <h1 className="font-display text-2xl leading-none text-[#f4ecd9]">
            Alden Hall
          </h1>
        </div>
        <Image
          src="/brand/reactor-logo-white.png"
          alt="Reactor"
          width={1600}
          height={184}
          className="hidden h-auto w-32 sm:block"
          priority
        />
        <Image
          src="/brand/reactor-symbol-white.svg"
          alt="Reactor"
          width={512}
          height={362}
          className="h-7 w-auto sm:hidden"
          priority
        />
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-4 sm:px-6">
        <PeriodRail
          index={periodIndex}
          onEarlier={() => shiftPeriod(Math.max(0, periodIndex - 1))}
          onBell={() =>
            shiftPeriod(Math.min(PERIODS.length - 1, periodIndex + 1))
          }
        />
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-300">
          {period.narration}
        </p>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <CampusMap
            periodId={period.id}
            selected={roomId}
            onSelect={(id) => setRoomId(id)}
          />
          {roomId ? (
            <RoomPanel
              periodId={period.id}
              roomId={roomId}
              metIds={met[period.id] ?? []}
              onTalk={openTalk}
              onClose={() => setRoomId(null)}
            />
          ) : (
            <aside className="rounded-2xl border border-[#3a4a3c] bg-[#101814]/80 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#d7c7a2]/70">
                You
              </p>
              <p className="mt-1 font-display text-lg text-[#f4ecd9]">
                New student, just in.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Choose a room. Whoever is there will take a live call — mic or
                typed — with their own face and voice. The day has five bells.
              </p>
              <ul className="mt-4 flex flex-col gap-2 lg:hidden">
                {ROOMS.map((room) => (
                  <li key={room.id}>
                    <button
                      type="button"
                      onClick={() => setRoomId(room.id)}
                      className="w-full rounded-lg border border-[#3a4a3c] px-3 py-2 text-left text-sm text-[#f4ecd9]"
                    >
                      {room.name}
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
        <details className="rounded-xl border border-[#3a4a3c] bg-black/20 px-4 py-3">
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.16em] text-[#d7c7a2]/80">
            Seller notes
          </summary>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-300">
            {SELLER_SCRIPT}
          </p>
        </details>
      </main>

      {talking && placement && (
        <Conversation
          key={`${period.id}:${talking.id}`}
          character={talking}
          placement={placement}
          quizStep={quizStep}
          onQuizStep={setQuizStep}
          onLeave={leaveTalk}
        />
      )}
    </div>
  );
}

function PeriodRail({
  index,
  onEarlier,
  onBell,
}: {
  index: number;
  onEarlier: () => void;
  onBell: () => void;
}) {
  const period = PERIODS[index];
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[11px] text-brand">{period.time}</p>
        <h2 className="font-display text-xl text-[#f4ecd9]">{period.label}</h2>
      </div>
      <ol className="flex flex-wrap gap-1.5">
        {PERIODS.map((entry, entryIndex) => (
          <li
            key={entry.id}
            className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
              entryIndex === index
                ? "bg-brand text-brand-fg"
                : entryIndex < index
                  ? "bg-[#24352c] text-[#d7c7a2]"
                  : "bg-black/30 text-zinc-500"
            }`}
          >
            {entry.label}
          </li>
        ))}
      </ol>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEarlier}
          disabled={index === 0}
          className="rounded-md border border-[#3a4a3c] px-3 py-1.5 text-xs text-zinc-300 disabled:opacity-30"
        >
          Earlier
        </button>
        <button
          type="button"
          onClick={onBell}
          disabled={index === PERIODS.length - 1}
          className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-brand-fg disabled:opacity-30"
        >
          The bell
        </button>
      </div>
    </div>
  );
}
