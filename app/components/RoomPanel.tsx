"use client";

import {
  occupants,
  roomById,
  type PeriodId,
  type RoomId,
} from "../lib/campus";
import { characterById } from "../lib/characters";

export function RoomPanel({
  periodId,
  roomId,
  metIds,
  onTalk,
  onClose,
}: {
  periodId: PeriodId;
  roomId: RoomId;
  metIds: ReadonlyArray<string>;
  onTalk: (characterId: string) => void;
  onClose: () => void;
}) {
  const room = roomById(roomId);
  const people = occupants(periodId, roomId);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[#3a4a3c] bg-[#101814]/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#d7c7a2]/70">
            This period
          </p>
          <h2 className="font-display text-xl text-[#f4ecd9]">{room.name}</h2>
          <p className="mt-1 text-sm text-zinc-400">{room.blurb}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[#3a4a3c] px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-100"
        >
          Map
        </button>
      </div>
      {people.length === 0 ? (
        <p className="text-sm text-zinc-300">
          Nobody from your day is here. Pick another room on the map — someone
          is always on the grounds.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {people.map((placement) => {
            const character = characterById(placement.characterId);
            if (!character) return null;
            const met = metIds.includes(character.id);
            return (
              <li key={character.id}>
                <button
                  type="button"
                  onClick={() => onTalk(character.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#3a4a3c] bg-black/30 p-2 text-left hover:border-brand/70"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={character.portrait}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-[#f4ecd9]">
                        {character.name}
                      </span>
                      {met && (
                        <span className="rounded-full bg-brand/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-brand">
                          Spoken
                        </span>
                      )}
                    </span>
                    <span className="block text-[11px] text-[#d7c7a2]/80">
                      {character.role}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-400">
                      {placement.presence}
                    </span>
                  </span>
                  <span className="pr-1 text-[11px] text-brand">Talk</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
