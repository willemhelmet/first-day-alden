"use client";

import { useEffect, useRef, useState } from "react";
import {
  QUIZ,
  isQuizScene,
  type Placement,
} from "../lib/campus";
import { callActive, callLive, callStartable, clock, LIMITS } from "../lib/call";
import type { Character } from "../lib/characters";
import { useSession } from "../lib/session";
import { CommandError } from "./CommandError";
import { Stage } from "./Stage";
import { StatusBadge } from "./StatusBadge";
import { Transcript } from "./Transcript";

export function Conversation({
  character,
  placement,
  quizStep,
  onQuizStep,
  onLeave,
}: {
  character: Character;
  placement: Placement;
  quizStep: number;
  onQuizStep: (step: number) => void;
  onLeave: () => void;
}) {
  const {
    phase,
    snapshot,
    setup,
    voices,
    photo,
    busy,
    micMuted,
    say,
    interrupt,
    toggleMic,
    startCall,
    endCall,
  } = useSession();
  const [draft, setDraft] = useState("");
  const startedFor = useRef<string | null>(null);
  const live = callLive(snapshot);
  const question = isQuizScene(placement) ? QUIZ[quizStep] : undefined;
  const visitKey = `${placement.periodId}:${character.id}`;

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

  function sendDraft() {
    const line = draft.trim();
    if (!line || !live) return;
    say(line);
    setDraft("");
  }

  const left =
    snapshot?.call_max_seconds && snapshot.call_elapsed_seconds !== null
      ? snapshot.call_max_seconds - snapshot.call_elapsed_seconds
      : null;

  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-[#0c1210]/95 backdrop-blur-sm">
      <header className="flex items-center gap-3 border-b border-[#3a4a3c] px-4 py-3 sm:px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.portrait}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg text-[#f4ecd9]">
            {character.name}
          </h2>
          <p className="truncate text-[11px] text-[#d7c7a2]/80">
            {character.role}
            {left !== null && (
              <span className="ml-2 font-mono text-zinc-400">
                {clock(left)} left
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void leave()}
          className="rounded-md border border-[#3a4a3c] px-3 py-1.5 text-xs text-zinc-200 hover:border-brand"
        >
          Back
        </button>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:p-6">
        <div className="flex flex-col gap-3">
          <StatusBadge />
          <CommandError />
          <Stage />
          <div className="flex flex-wrap gap-2 text-[11px] text-zinc-400">
            <Signal
              on={snapshot?.mic_forwarding === true}
              label="Mic reaching them"
            />
            <Signal
              on={snapshot?.audio_receiving === true}
              label="They're speaking"
            />
            <Signal
              on={snapshot?.video_receiving === true}
              label="Video"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <section className="rounded-xl border border-[#3a4a3c] bg-black/30 p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#d7c7a2]/70">
              You can say
            </p>
            {!live && (
              <p className="mt-2 text-xs text-zinc-400">
                {busy === "connecting" || phase === "preparing_avatar"
                  ? "Binding their portrait and voice. The call starts on its own."
                  : phase === "failed"
                    ? "The call did not start."
                    : "Waiting until the call is live. Then the lines below, the mic, or the box."}
              </p>
            )}
            <div className="mt-2 flex flex-col gap-2">
              {question && (
                <p className="text-[10px] uppercase tracking-wider text-brand">
                  {question.prompt}
                </p>
              )}
              {question &&
                question.choices.map((choice) => (
                  <button
                    key={choice.label}
                    type="button"
                    disabled={!live}
                    onClick={() => {
                      speak(choice.say);
                      onQuizStep(quizStep + 1);
                    }}
                    className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-left text-sm text-[#f4ecd9] disabled:opacity-40"
                  >
                    {choice.label}
                  </button>
                ))}
              {isQuizScene(placement) && quizStep >= QUIZ.length && (
                <button
                  type="button"
                  disabled={!live}
                  onClick={() =>
                    speak("How did I place, after those three answers?")
                  }
                  className="rounded-lg border border-[#3a4a3c] px-3 py-2 text-left text-sm text-zinc-200 disabled:opacity-40"
                >
                  Ask how you placed
                </button>
              )}
              {placement.choices.map((choice) => (
                <button
                  key={choice.label}
                  type="button"
                  disabled={!live}
                  onClick={() => speak(choice.say)}
                  className="rounded-lg border border-[#3a4a3c] px-3 py-2 text-left text-sm text-zinc-200 hover:border-[#d7c7a2]/50 disabled:opacity-40"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </section>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendDraft();
            }}
            className="flex flex-col gap-2"
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendDraft();
                }
              }}
              maxLength={LIMITS.say}
              rows={2}
              disabled={!live}
              placeholder={
                live ? "Or say something of your own" : "The call is not live yet"
              }
              className="resize-none rounded-lg border border-[#3a4a3c] bg-black/40 p-2 text-sm text-zinc-100 placeholder:text-zinc-600 disabled:opacity-50"
            />
            <div className="grid grid-cols-3 gap-2">
              <button
                type="submit"
                disabled={!live || !draft.trim()}
                className="rounded-md bg-brand px-2 py-1.5 text-xs font-medium text-brand-fg disabled:opacity-40"
              >
                Say
              </button>
              <button
                type="button"
                onClick={interrupt}
                disabled={!live}
                className="rounded-md border border-[#3a4a3c] px-2 py-1.5 text-xs text-zinc-200 disabled:opacity-40"
              >
                Interrupt
              </button>
              <button
                type="button"
                onClick={toggleMic}
                disabled={!live}
                className="rounded-md border border-[#3a4a3c] px-2 py-1.5 text-xs text-zinc-200 disabled:opacity-40"
              >
                {micMuted ? "Unmute" : "Mute"}
              </button>
            </div>
          </form>
          {(phase === "failed" || phase === "ended") && (
            <button
              type="button"
              onClick={() => void startCall()}
              className="rounded-md border border-brand/50 px-3 py-2 text-xs text-brand"
            >
              Call again
            </button>
          )}
          <Transcript />
        </div>
      </div>
    </div>
  );
}

function Signal({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-1.5 w-1.5 rounded-full ${on ? "bg-active" : "bg-zinc-600"}`}
      />
      {label}
    </span>
  );
}
