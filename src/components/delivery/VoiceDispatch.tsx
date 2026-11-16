import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ChevronDown,
  Pause,
  Play,
  RotateCcw,
  Upload,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Parcel } from "@/lib/delivery-data";

const WAVE = Array.from({ length: 46 }, (_, index) =>
  Math.round(18 + Math.abs(Math.sin(index * 1.63)) * 74),
);

function buildTranscript(parcel: Parcel) {
  if (parcel.gig) {
    return `Evening dispatch confirmed for parcel ${parcel.id}. ${parcel.gig.rider} from ${parcel.gig.partner}, bike ${parcel.gig.plate}, will collect your ${parcel.weightKg} kilogram parcel from ${parcel.hub} and reach your doorstep by ${parcel.gig.eta}, inside the ${parcel.slot} window. Your four digit doorstep OTP is ${parcel.deliveryOtp}. Share it only after the parcel is in your hands. Thank you for choosing Favourable Delivery.`;
  }
  return `Parcel ${parcel.id} from ${parcel.carrier} is currently held at ${parcel.hub} in ${parcel.city}. The daytime delivery attempt was missed, so the parcel is waiting for your instructions. Open the intercept panel to choose an evening window and a hyperlocal rider. A full rider briefing, including your pickup and doorstep OTP, will be generated the moment you confirm.`;
}

export function VoiceDispatch({ parcel }: { parcel: Parcel }) {
  const transcript = buildTranscript(parcel);
  const [playing, setPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  function stopPlayback() {
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
  }

  useEffect(() => {
    stopPlayback();
    // Rebuilding the script means any in-flight briefing is stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, [audioSrc]);

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  async function togglePlayback() {
    if (playing) {
      stopPlayback();
      return;
    }
    setAudioError(null);

    if (audioSrc) {
      const audio = audioRef.current ?? new Audio(audioSrc);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setAudioError("That clip could not play. Check the MP3 link and try again.");
      }
      return;
    }

    const synth = window.speechSynthesis;
    if (!synth) {
      setAudioError("This browser has no speech engine. Paste an MP3 link instead.");
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.rate = 1.02;
    utterance.pitch = 1;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    synth.speak(utterance);
    setPlaying(true);
  }

  function applyUrl() {
    const trimmed = urlDraft.trim();
    if (!/^(https?:\/\/|blob:|data:)/i.test(trimmed)) {
      setAudioError("Paste a direct audio link starting with https://");
      return;
    }
    stopPlayback();
    setAudioSrc(trimmed);
    setSourceName("Custom ElevenLabs clip");
    setAudioError(null);
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    stopPlayback();
    setAudioSrc(url);
    setSourceName(file.name);
    setAudioError(null);
  }

  function resetSource() {
    stopPlayback();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setAudioSrc(null);
    setSourceName(null);
    setUrlDraft("");
    setAudioError(null);
  }

  return (
    <section className="relative flex flex-col overflow-hidden border border-ink bg-ink text-paper lg:sticky lg:top-24">
      <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-route/10 blur-3xl" />
      <div className="relative border-b border-white/10 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="size-3.5 text-route" strokeWidth={1.6} />
            <p className="text-[9px] uppercase tracking-[0.22em] text-white/50">
              ElevenLabs · voice dispatch
            </p>
          </div>
          <span className="border border-white/15 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-white/55">
            AI voice
          </span>
        </div>
        <h3 className="mt-4 font-display text-[27px] leading-tight text-paper">
          Live Voice Dispatch Alert
        </h3>
        <p className="mt-1.5 text-[12px] text-white/50">
          Automated briefing · rider, arrival window and OTP
        </p>
      </div>

      <div className="relative p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={playing ? "Pause voice briefing" : "Play voice briefing"}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-route text-ink transition-transform hover:scale-[1.04] active:scale-95"
          >
            {playing ? (
              <Pause className="size-4" fill="currentColor" strokeWidth={0} />
            ) : (
              <Play
                className="ml-0.5 size-4"
                fill="currentColor"
                strokeWidth={0}
              />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/70">
                {playing ? "Playing briefing" : "Play voice briefing"}
              </p>
              <p className="text-[10px] tabular-nums text-white/40">0:24</p>
            </div>
            <div
              className="mt-2.5 flex h-8 items-center justify-between gap-[2px]"
              aria-hidden="true"
            >
              {WAVE.map((height, index) => (
                <span
                  key={index}
                  className={cn(
                    "w-[2px] shrink-0 rounded-full bg-route",
                    playing ? "wave-bar" : "opacity-35",
                  )}
                  style={{
                    height: `${playing ? height : Math.max(14, height * 0.45)}%`,
                    animationDelay: `${(index % 9) * 0.08}s`,
                    animationDuration: `${0.9 + (index % 5) * 0.12}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">
              Transcript
            </p>
            <p className="text-[9px] uppercase tracking-[0.14em] text-route/80">
              Live parcel state
            </p>
          </div>
          <p className="mt-2.5 max-h-44 overflow-y-auto pr-1 text-[12.5px] leading-6 text-white/70 chat-scroll">
            {transcript}
          </p>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowSource((open) => !open)}
            className="flex w-full items-center justify-between gap-3 text-[10px] uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-white/75"
          >
            <span>Use real ElevenLabs audio</span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                showSource && "rotate-180",
              )}
            />
          </button>

          {showSource && (
            <div className="animate-rise mt-3 border border-white/10 bg-white/[0.03] p-3.5">
              <label
                htmlFor="voice-url"
                className="text-[9px] uppercase tracking-[0.18em] text-white/40"
              >
                Paste a public MP3 URL
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="voice-url"
                  value={urlDraft}
                  onChange={(event) => setUrlDraft(event.target.value)}
                  placeholder="https://…/briefing.mp3"
                  spellCheck={false}
                  className="h-9 min-w-0 flex-1 border border-white/15 bg-transparent px-2.5 text-[12px] text-paper outline-none placeholder:text-white/25 focus:border-route/60"
                />
                <button
                  type="button"
                  onClick={applyUrl}
                  className="h-9 shrink-0 border border-route/40 px-3 text-[10px] uppercase tracking-[0.12em] text-route transition-colors hover:bg-route/10"
                >
                  Load
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                <label className="flex cursor-pointer items-center gap-2 border border-white/15 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] text-white/65 transition-colors hover:border-white/30 hover:text-white">
                  <Upload className="size-3" />
                  Upload MP3
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/*"
                    onChange={handleFile}
                    className="sr-only"
                  />
                </label>
                {sourceName ? (
                  <span className="flex min-w-0 items-center gap-2 text-[10px] text-route/90">
                    <span className="truncate">{sourceName}</span>
                    <button
                      type="button"
                      onClick={resetSource}
                      aria-label="Reset to simulated voice"
                      className="shrink-0 text-white/45 transition-colors hover:text-white"
                    >
                      <RotateCcw className="size-3" />
                    </button>
                  </span>
                ) : (
                  <span className="text-[10px] text-white/35">
                    Falls back to the browser voice narrator
                  </span>
                )}
              </div>

              {audioError && (
                <p className="mt-2 text-[11px] text-hub">{audioError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-auto flex items-center justify-between border-t border-white/10 px-6 py-3 text-[9px] uppercase tracking-[0.16em] text-white/35 sm:px-7">
        <span>ElevenLabs Flash v2.1</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1 rounded-full bg-route" />
          {audioSrc ? "Custom clip loaded" : "Simulated narrator"}
        </span>
      </div>
    </section>
  );
}
