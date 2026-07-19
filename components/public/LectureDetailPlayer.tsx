"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  Download,
  Headphones,
  Share2,
  SkipForward,
  SkipBack,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lecture } from "@/types/lecture";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Generate a deterministic-looking waveform from a string seed */
function generateWaveform(seed: string, bars: number): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const heights: number[] = [];
  for (let i = 0; i < bars; i++) {
    hash = (hash * 16807 + 13) % 2147483647;
    // Create natural-looking peaks with sine modulation
    const base = ((hash % 100) / 100) * 0.6 + 0.2;
    const wave = Math.sin((i / bars) * Math.PI) * 0.3;
    heights.push(Math.min(1, base + wave));
  }
  return heights;
}

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Props = {
  lecture: Lecture;
  recitantNom: string;
  recitantPhoto?: string | null;
  relatedByRecitant: Lecture[];
  relatedBySourate: Lecture[];
};

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function LectureDetailPlayer({
  lecture,
  recitantNom,
  recitantPhoto,
  relatedByRecitant,
  relatedBySourate,
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasCountedListen, setHasCountedListen] = useState(false);

  const titre =
    lecture.sourates?.nom_francais ?? lecture.titre ?? "Sourate";
  const nomArabe = lecture.sourates?.nom_arabe;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const WAVEFORM_BARS = 120;
  const waveform = generateWaveform(lecture.id, WAVEFORM_BARS);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      if (!hasCountedListen) {
        setHasCountedListen(true);
        fetch(`/api/lectures/${lecture.id}/ecoute`, { method: "POST" }).catch(
          () => {}
        );
      }
    }
  }, [isPlaying, hasCountedListen, lecture.id]);

  const handleDownload = () => {
    fetch(`/api/lectures/${lecture.id}/telechargement`, {
      method: "POST",
    }).catch(() => {});
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * duration;
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration || 0, audio.currentTime + seconds)
    );
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      {/* =============== HERO PLAYER =============== */}
      <div className="rounded-xl overflow-hidden shadow-2xl bg-neutral-900 flex flex-col md:flex-row">
        {/* Left panel: info + waveform */}
        <div className="relative flex-1 flex flex-col p-6 md:p-8 min-w-0">
          {/* Top: play + info */}
          <div className="flex items-start gap-5">
            {/* Large play button */}
            <button
              onClick={togglePlay}
              className="flex-shrink-0 w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center text-white shadow-lg shadow-emerald-500/30"
              aria-label={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? (
                <Pause className="h-7 w-7" fill="currentColor" />
              ) : (
                <Play className="h-7 w-7 ml-1" fill="currentColor" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <Link
                href={
                  lecture.recitants
                    ? `/recitant/${lecture.recitants.id}`
                    : "#"
                }
                className="text-neutral-400 text-sm font-medium hover:text-emerald-400 transition-colors truncate block"
              >
                {recitantNom}
              </Link>
              <h1 className="text-white font-bold text-2xl md:text-3xl leading-tight mt-1">
                {titre}
              </h1>
              {nomArabe && (
                <p
                  className="text-neutral-500 text-lg mt-1 truncate"
                  dir="rtl"
                >
                  {nomArabe}
                </p>
              )}
            </div>
          </div>

          {/* Waveform visualizer */}
          <div className="mt-6 md:mt-auto pt-4">
            <div
              className="flex items-end gap-[2px] h-16 cursor-pointer"
              onClick={handleWaveformClick}
            >
              {waveform.map((h, i) => {
                const barProgress = (i / WAVEFORM_BARS) * 100;
                const isPast = barProgress < progress;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm transition-colors duration-75 ${
                      isPast
                        ? "bg-emerald-500"
                        : "bg-neutral-600 hover:bg-neutral-500"
                    }`}
                    style={{ height: `${h * 100}%`, minWidth: 2 }}
                  />
                );
              })}
            </div>

            {/* Time display */}
            <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
              <span className="tabular-nums">{formatTime(currentTime)}</span>
              <span className="tabular-nums">
                {duration > 0 ? formatTime(duration) : "--:--"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: large image */}
        <div className="hidden md:block w-[280px] lg:w-[320px] flex-shrink-0 relative">
          {lecture.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lecture.image_url}
              alt={titre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-800 to-emerald-950 text-emerald-300 text-5xl">
              {nomArabe ?? "﴾ ﴿"}
            </div>
          )}
        </div>
      </div>

      {/* =============== ACTION BAR =============== */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => skip(-10)}
          >
            <SkipBack className="h-4 w-4" /> -10s
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => skip(10)}
          >
            <SkipForward className="h-4 w-4" /> +10s
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <a href={lecture.audio_url} download onClick={handleDownload}>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </a>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
        </div>
      </div>

      {/* =============== STATS ROW =============== */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground border-b pb-4">
        <span className="flex items-center gap-1.5">
          <Headphones className="h-4 w-4" />
          {lecture.nombre_ecoutes.toLocaleString("fr-FR")} écoute
          {lecture.nombre_ecoutes > 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1.5">
          <Download className="h-4 w-4" />
          {lecture.nombre_telechargements.toLocaleString("fr-FR")}{" "}
          téléchargement
          {lecture.nombre_telechargements > 1 ? "s" : ""}
        </span>
      </div>

      {/* =============== BOTTOM: description + related tracks =============== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* Left: description / metadata */}
        <div className="space-y-6">
          {/* Recitant info card */}
          <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
            {recitantPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recitantPhoto}
                alt={recitantNom}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                {recitantNom[0]}
              </div>
            )}
            <div>
              <Link
                href={
                  lecture.recitants
                    ? `/recitant/${lecture.recitants.id}`
                    : "#"
                }
                className="font-semibold hover:text-emerald-600 transition-colors"
              >
                {recitantNom}
              </Link>
              {lecture.recitants?.nationalite && (
                <p className="text-sm text-muted-foreground">
                  {lecture.recitants.nationalite}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: related tracks sidebar */}
        <aside className="space-y-6">
          {/* Related by same recitant */}
          {relatedByRecitant.length > 0 && (
            <RelatedSection
              title="AUTRES SOURATES"
              subtitle={`par ${recitantNom}`}
              lectures={relatedByRecitant}
            />
          )}

          {/* Related by same sourate */}
          {relatedBySourate.length > 0 && (
            <RelatedSection
              title="MÊME SOURATE"
              subtitle="par d'autres récitants"
              lectures={relatedBySourate}
            />
          )}

          {relatedByRecitant.length === 0 &&
            relatedBySourate.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune suggestion disponible.
              </p>
            )}
        </aside>
      </div>

      {/* Hidden audio */}
      <audio
        ref={audioRef}
        src={lecture.audio_url}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={() =>
          setCurrentTime(audioRef.current?.currentTime ?? 0)
        }
        onLoadedMetadata={() =>
          setDuration(audioRef.current?.duration ?? 0)
        }
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Related tracks sidebar section                                    */
/* ------------------------------------------------------------------ */

function RelatedSection({
  title,
  subtitle,
  lectures,
}: {
  title: string;
  subtitle: string;
  lectures: Lecture[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground/70">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2">
        {lectures.map((lec) => (
          <RelatedTrackCard key={lec.id} lecture={lec} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual related track card                                     */
/* ------------------------------------------------------------------ */

function RelatedTrackCard({ lecture }: { lecture: Lecture }) {
  const titre =
    lecture.sourates?.nom_francais ?? lecture.titre ?? "Sourate";
  const recitantNom = lecture.recitants
    ? `${lecture.recitants.prenom ?? ""} ${lecture.recitants.nom ?? ""}`.trim()
    : "";
  const nomArabe = lecture.sourates?.nom_arabe;

  return (
    <Link
      href={`/lecture/${lecture.id}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/80 transition-colors group"
    >
      {/* Small thumbnail */}
      <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden bg-neutral-800">
        {lecture.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lecture.image_url}
            alt={titre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-700 to-emerald-900 text-emerald-200 text-xs">
            {nomArabe ?? "﴾﴿"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        {recitantNom && (
          <p className="text-xs text-muted-foreground truncate">
            {recitantNom}
          </p>
        )}
        <p className="text-sm font-medium truncate group-hover:text-emerald-600 transition-colors">
          {titre}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-0.5">
            <Play className="h-2.5 w-2.5" fill="currentColor" />
            {lecture.nombre_ecoutes.toLocaleString("fr-FR")}
          </span>
        </div>
      </div>
    </Link>
  );
}
