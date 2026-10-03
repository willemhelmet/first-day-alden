"use client";

import { useEffect, useState, type CSSProperties } from "react";
import {
  characterForVisit,
  occupants,
  PERIODS,
  roomById,
  placementFor,
  type RoomId,
} from "../lib/campus";
import { characterById, type Character } from "../lib/characters";
import { callActive } from "../lib/call";
import { useSession } from "../lib/session";
import { Conversation } from "./Conversation";

const PINS: ReadonlyArray<{
  id: RoomId;
  label: string;
  note?: string;
  cream?: boolean;
  style: CSSProperties;
}> = [
  { id: "classroom", label: "Classroom", style: { left: "6%", top: "6%" } },
  {
    id: "library",
    label: "Library",
    note: "You are here",
    cream: true,
    style: { right: "5%", top: "16%" },
  },
  { id: "quad", label: "Quad", style: { left: "36%", top: "44%" } },
  {
    id: "gym",
    label: "Gymnasium",
    style: { right: "4%", top: "50%" },
  },
  {
    id: "dorm",
    label: "North House dorm",
    note: "Your trunk, on the steps",
    style: { left: "6%", bottom: "6%" },
  },
];

export function Game() {
  const session = useSession();
  const [periodIndex] = useState(0);
  const [roomId, setRoomId] = useState<RoomId | null>(null);
  const [talkId, setTalkId] = useState<string | null>(null);
  const [met, setMet] = useState<Record<string, string[]>>({});
  const [quizStep, setQuizStep] = useState(0);
  const [pendingTalk, setPendingTalk] = useState<string | null>(null);

  const period = PERIODS[periodIndex];
  const placement =
    talkId && roomId ? placementFor(period.id, roomId, talkId) : undefined;
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

  return (
    <div className="min-h-dvh bg-[#070908] text-[#f4ecd9]">
      <div
        className={`relative mx-auto w-full max-w-[420px] bg-[#0c1210] ${
          talking ? "h-dvh overflow-hidden" : "min-h-dvh"
        }`}
      >
        {talking && placement && roomId ? (
          <Conversation
            key={`${period.id}:${talking.id}`}
            character={talking}
            placement={placement}
            roomLabel={roomId === "dorm" ? "North House dorm" : roomById(roomId).name}
            quizStep={quizStep}
            onQuizStep={setQuizStep}
            onLeave={leaveTalk}
          />
        ) : roomId ? (
          <Place
            roomId={roomId}
            periodId={period.id}
            metIds={met[period.id] ?? []}
            onBack={() => setRoomId(null)}
            onTalk={openTalk}
          />
        ) : (
          <Grounds
            time={period.time}
            label={period.label}
            narration={period.narration}
            onSelect={setRoomId}
          />
        )}
      </div>
    </div>
  );
}

function Grounds({
  time,
  label,
  narration,
  onSelect,
}: {
  time: string;
  label: string;
  narration: string;
  onSelect: (id: RoomId) => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col px-5 pb-6 pt-7">
      <header className="flex items-start justify-between gap-4">
        <p className="pt-1 text-[10px] uppercase tracking-[0.22em] text-[#d7c7a2]/75">
          First day · North House
        </p>
        <div className="text-right">
          <p className="font-mono text-[12px] tracking-wide text-[#e7d7b1]">
            {time}
          </p>
          <p className="text-[12px] text-[#d7c7a2]/80">{label}</p>
        </div>
      </header>
      <h1 className="mt-4 font-display text-[2.75rem] leading-none tracking-tight text-[#f6f0e4]">
        Alden Hall
      </h1>
      <p className="mt-4 max-w-[22rem] text-[15px] leading-relaxed text-[#f4ecd9]/92">
        {narration}
      </p>
      <div className="relative mt-5 min-h-[28rem] flex-1 overflow-hidden rounded-[1.25rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/scenes/grounds-courtyard.jpg"
          alt="The grounds at Alden Hall"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-[46%] top-[46%] z-[1] h-[34%] w-px origin-top -rotate-[24deg] bg-[#c6a56a]"
        />
        {PINS.map((pin) => (
          <button
            key={pin.id}
            type="button"
            onClick={() => onSelect(pin.id)}
            style={pin.style}
            className={`absolute z-10 max-w-[11.5rem] rounded-2xl px-3 py-2 text-left shadow-[0_8px_24px_rgba(0,0,0,0.28)] ${
              pin.cream
                ? "bg-[#f3ead7] text-[#241c12]"
                : "bg-[#16130f]/88 text-[#f4ecd9] backdrop-blur-sm"
            }`}
          >
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em]">
              {pin.label}
            </span>
            {pin.note && (
              <span
                className={`mt-0.5 block text-[12px] normal-case tracking-normal ${
                  pin.cream ? "text-[#3a3124]" : "text-[#e7d7b1]"
                }`}
              >
                {pin.note}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Place({
  roomId,
  periodId,
  metIds,
  onBack,
  onTalk,
}: {
  roomId: RoomId;
  periodId: (typeof PERIODS)[number]["id"];
  metIds: ReadonlyArray<string>;
  onBack: () => void;
  onTalk: (characterId: string) => void;
}) {
  const room = roomById(roomId);
  const people = occupants(periodId, roomId);
  const title = roomId === "dorm" ? "North House dorm" : room.name;
  const priya = people.find((entry) => entry.characterId === "priya-nayak");
  const libraryPriya = roomId === "library" && priya;
  const others = libraryPriya
    ? people.filter((entry) => entry.characterId !== "priya-nayak")
    : people;

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-8 pt-6">
      <button type="button" onClick={onBack} className="w-fit text-left">
        <span className="block text-[10px] uppercase tracking-[0.22em] text-[#d7c7a2]/80">
          Back
        </span>
        <span className="mt-0.5 block text-[10px] uppercase tracking-[0.16em] text-[#d7c7a2]/55">
          {roomId === "library"
            ? "Through the doors · grounds"
            : "Grounds"}
        </span>
      </button>
      <h1 className="mt-5 font-display text-5xl leading-none text-[#f6f0e4]">
        {title}
      </h1>
      <p className="mt-3 font-display text-[1.15rem] italic leading-snug text-[#f4ecd9]/88">
        {room.blurb}
      </p>

      {libraryPriya && (
        <PriyaInLibrary
          presence={priya.presence}
          onSit={() => onTalk("priya-nayak")}
        />
      )}

      {roomId !== "library" && (
        <div className="relative mt-5 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/scenes/grounds-courtyard.jpg"
            alt=""
            className="aspect-[5/3] w-full object-cover opacity-80"
          />
        </div>
      )}

      {others.length > 0 && (
        <ul className="mt-5 flex flex-col gap-3">
          {others.map((placement) => {
            const character = characterById(placement.characterId);
            if (!character) return null;
            return (
              <li key={character.id}>
                <PersonHere
                  character={character}
                  presence={placement.presence}
                  met={metIds.includes(character.id)}
                  onTalk={() => onTalk(character.id)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {people.length === 0 && (
        <p className="mt-6 text-sm leading-relaxed text-[#d7c7a2]/80">
          Nobody from your day is here.
        </p>
      )}
    </div>
  );
}

function PriyaInLibrary({
  presence,
  onSit,
}: {
  presence: string;
  onSit: () => void;
}) {
  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/scenes/library-carrel.jpg"
          alt="Priya Nayak seated in a library carrel"
          className="aspect-[4/5] w-full object-cover"
        />
      </div>
      <p className="mt-3 flex gap-2 text-sm text-[#f6f0e4]">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d7c7a2]" />
        <span>
          <span className="font-medium">Priya Nayak</span>
          <span className="mt-0.5 block text-[13px] text-[#d7c7a2]/75">
            Classmate
          </span>
          <span className="mt-1 block text-[14px] leading-snug text-[#f4ecd9]/88">
            {presence}
          </span>
        </span>
      </p>
      <p className="mt-5 font-display text-[1.15rem] italic text-[#f4ecd9]/90">
        The chair opposite is empty.
      </p>
      <button
        type="button"
        onClick={onSit}
        className="mt-3 w-full rounded-2xl bg-[#e4d2a8] px-4 py-3.5 text-center text-[15px] text-[#2a2416]"
      >
        Sit across from her
      </button>
    </div>
  );
}

function PersonHere({
  character,
  presence,
  met,
  onTalk,
}: {
  character: Character;
  presence: string;
  met: boolean;
  onTalk: () => void;
}) {
  return (
    <div className="rounded-2xl border border-[#3a4a3c] bg-black/25 p-3">
      <div className="flex gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.portrait}
          alt=""
          className="h-16 w-14 shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#f6f0e4]">{character.name}</p>
          <p className="text-[12px] text-[#d7c7a2]/70">{character.role}</p>
          <p className="mt-1 text-[13px] leading-snug text-[#f4ecd9]/85">
            {presence}
          </p>
          {met && (
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#c6a56a]">
              Spoken
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onTalk}
        className="mt-3 w-full rounded-2xl bg-[#e4d2a8] px-4 py-3 text-center text-[15px] text-[#2a2416]"
      >
        Talk
      </button>
    </div>
  );
}
