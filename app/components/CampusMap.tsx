"use client";

import { occupants, ROOMS, type PeriodId, type RoomId } from "../lib/campus";
import { characterById } from "../lib/characters";

export function CampusMap({
  periodId,
  selected,
  onSelect,
}: {
  periodId: PeriodId;
  selected: RoomId | null;
  onSelect: (id: RoomId) => void;
}) {
  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-[#3a4a3c] bg-[#14211b] shadow-[inset_0_0_80px_rgba(0,0,0,0.35)] sm:aspect-[16/10]">
      <svg
        viewBox="0 0 900 560"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <rect width="900" height="560" fill="#173026" />
        <ellipse cx="450" cy="300" rx="210" ry="120" fill="#234233" />
        <path
          d="M40 300 H860 M450 40 V520 M120 140 Q450 220 780 140 M140 430 Q450 360 760 440"
          fill="none"
          stroke="#cbb892"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.45"
        />
        <circle cx="180" cy="120" r="26" fill="#1c3a2c" />
        <circle cx="720" cy="150" r="22" fill="#1c3a2c" />
        <circle cx="160" cy="450" r="20" fill="#1c3a2c" />
        <circle cx="760" cy="470" r="28" fill="#1c3a2c" />
        <rect x="250" y="70" width="18" height="70" fill="#d7c7a2" opacity="0.7" />
        <polygon points="241,70 277,70 259,46" fill="#efe6d2" />
        <text
          x="48"
          y="40"
          fill="#d7c7a2"
          fontSize="14"
          fontFamily="Georgia, serif"
          letterSpacing="2"
        >
          ALDEN HALL
        </text>
      </svg>
      {ROOMS.map((room) => {
        const people = occupants(periodId, room.id);
        const names = people
          .map((placement) => characterById(placement.characterId)?.name.split(" ")[0])
          .filter(Boolean)
          .join(", ");
        const active = selected === room.id;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            style={{
              left: `${room.x}%`,
              top: `${room.y}%`,
              width: `${room.w}%`,
              height: `${room.h}%`,
            }}
            className={`absolute flex flex-col items-start justify-end rounded-xl border px-3 py-2 text-left transition ${
              active
                ? "border-brand bg-brand/20 shadow-[0_0_0_1px_rgba(214,184,106,0.45)]"
                : "border-[#d7c7a2]/30 bg-[#0e1914]/75 hover:border-brand/70 hover:bg-[#0e1914]/90"
            }`}
          >
            <span className="font-display text-sm text-[#f4ecd9] sm:text-base">
              {room.name}
            </span>
            <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[#d7c7a2]/80 sm:text-[11px]">
              {names || "Quiet"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
