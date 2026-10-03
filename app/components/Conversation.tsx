"use client";

import { useEffect, useRef } from "react";
import {
  QUIZ,
  isQuizScene,
  type Placement,
} from "../lib/campus";
import { callActive, callLive, callStartable, phaseLine } from "../lib/call";
import type { Character } from "../lib/characters";
import { ViduS2AvatarMainVideoView } from "../lib/model";
import { useSession } from "../lib/session";

export function Conversation({
  character,
  placement,
  roomLabel,
  quizStep,
  onQuizStep,
  onLeave,
}: {
  character: Character;
  placement: Placement;
  roomLabel: string;
  quizStep: number;
  onQuizStep: (step: number) => void;
  onLeave: () => void;
}) {
  const { phase, snapshot, setup, voices, photo, busy, status, say, startCall, endCall } =
    useSession();
  const startedFor = useRef<string | null>(null);
  const live = callLive(snapshot);
  const question = isQuizScene(placement) ? QUIZ[quizStep] : undefined;
  const visitKey = `${placement.periodId}:${character.id}`;
  const atCarrel =
    placement.roomId === "library" && character.id === "priya-nayak";
  const still =
    character.id === "priya-nayak"
      ? "/scenes/priya-seated.jpg"
      : character.portrait;

  useEffect(() => {
    if (startedFor.current === visitKey) return;
    if (busy) return;
    if (photo?.key !== character.id) return;
    if (!callStartable(phase)) return;
    if (!setup.persona.trim()) return;
    if (voices && character.voice && setup.voice === "") return;
    startedFor.current = visitKey;
    void startCall();
  }, [
    visitKey,
    busy,
    photo?.key,
    character.id,
    character.voice,
    phase,
    setup.persona,
    setup.voice,
    voices,
    startCall,
  ]);

  async function leave() {
    if (callActive(phase)) await endCall();
    onLeave();
  }

  function speak(line: string) {
    if (!live) return;
    say(line);
  }

  function answerQuiz(line: string) {
    if (!live) return;
    say(line);
    onQuizStep(quizStep + 1);
  }

  const showVideo =
    status === "ready" &&
    (phase === "starting" ||
      phase === "warming_up" ||
      phase === "live" ||
      phase === "unknown") &&
    snapshot?.video_receiving === true;

  const caption =
    busy === "connecting" || status === "connecting" || status === "waiting"
      ? status === "waiting"
        ? "Waiting for capacity…"
        : "Connecting…"
      : phase === "preparing_avatar" || busy === "preparing"
        ? "Preparing the character…"
        : phase === "starting" || phase === "warming_up"
          ? phaseLine(snapshot)
          : phase === "failed"
            ? "The call failed to start."
            : null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-[#0c1210]">
      <div className="relative min-h-0 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={still}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover ${showVideo ? "invisible" : ""}`}
        />
        {status === "ready" && (
          <ViduS2AvatarMainVideoView
            audioTrack="main_audio"
            videoObjectFit="cover"
            className={`absolute inset-0 h-full w-full ${showVideo ? "" : "invisible"}`}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#0c1210] via-[#0c1210]/92 to-transparent" />

        <button
          type="button"
          onClick={() => void leave()}
          className="absolute left-5 top-6 z-10 text-left"
        >
          <span className="block text-[10px] uppercase tracking-[0.22em] text-[#f4ecd9]/80">
            {roomLabel}
          </span>
          {atCarrel && (
            <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-[#d7c7a2]/70">
              The carrel
            </span>
          )}
        </button>

        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-8">
          <h2 className="font-display text-[2.35rem] leading-none text-[#f6f0e4]">
            {character.name}
          </h2>
          {caption && (
            <p className="mt-3 text-[12px] text-[#d7c7a2]/80">{caption}</p>
          )}
          {phase === "failed" && (
            <button
              type="button"
              onClick={() => {
                startedFor.current = null;
                void startCall();
              }}
              className="mt-2 text-[12px] text-[#e4d2a8] underline decoration-[#e4d2a8]/40 underline-offset-4"
            >
              The call failed to start.
            </button>
          )}

          <div className="mt-6">
            {atCarrel && (
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#d7c7a2]/70">
                Across the table
              </p>
            )}
            {question && (
              <p className="mt-2 font-display text-[1.05rem] italic leading-snug text-[#f4ecd9]/90">
                {question.prompt}
              </p>
            )}
            <div className="mt-3 flex flex-col gap-2.5">
              {question &&
                question.choices.map((choice) => (
                  <Choice
                    key={choice.label}
                    label={choice.label}
                    live={live}
                    onSpeak={() => answerQuiz(choice.say)}
                  />
                ))}
              {isQuizScene(placement) && quizStep >= QUIZ.length && (
                <Choice
                  label="Ask how you placed"
                  live={live}
                  onSpeak={() =>
                    speak("How did I place, after those three answers?")
                  }
                />
              )}
              {placement.choices.map((choice) => (
                <Choice
                  key={choice.label}
                  label={choice.label}
                  live={live}
                  onSpeak={() => speak(choice.say)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Choice({
  label,
  live,
  onSpeak,
}: {
  label: string;
  live: boolean;
  onSpeak: () => void;
}) {
  return (
    <button
      type="button"
      aria-disabled={!live}
      onClick={onSpeak}
      className="w-full rounded-2xl border border-[#3a4a3c] bg-[#121816]/92 px-4 py-3.5 text-left text-[15px] text-[#f4ecd9] backdrop-blur-sm"
    >
      {label}
    </button>
  );
}
