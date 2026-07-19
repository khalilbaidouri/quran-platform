"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Play, Pause, Download, Headphones } from "lucide-react";
import type { Lecture } from "@/types/lecture";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function LecturesList({
  lectures,
  recitantNom,
}: {
  lectures?: Lecture[];
  recitantNom?: string;
}) {
  const items = lectures ?? [];

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Aucune lecture disponible pour ce récitant pour l&apos;instant.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {items.map((lecture) => (
        <SoundCloudCard
          key={lecture.id}
          lecture={lecture}
          recitantNom={recitantNom}
        />
      ))}
    </div>
  );
}

function SoundCloudCard({
  lecture,
  recitantNom,
}: {
  lecture: Lecture;
  recitantNom?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasCountedListen, setHasCountedListen] = useState(false);

  const titre =
    lecture.sourates?.nom_francais ?? lecture.titre ?? "Sourate";
  const nomArabe = lecture.sourates?.nom_arabe;

  const togglePlay = () => {
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
  };

  const handleDownload = () => {
    fetch(`/api/lectures/${lecture.id}/telechargement`, {
      method: "POST",
    }).catch(() => {});
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * duration;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-neutral-900 flex flex-col sm:flex-row h-auto sm:h-[180px]">
      {/* Left: dark info panel */}
      <div className="relative flex-1 flex flex-col justify-between p-5 sm:p-6 min-w-0">
        {/* Top: play button + info */}
        <div className="flex items-start gap-4">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 transition-colors flex items-center justify-center text-white shadow-lg shadow-emerald-500/30"
            aria-label={isPlaying ? "Pause" : "Lecture"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            )}
          </button>

          {/* Title + recitant (clickable to detail page) */}
          <Link href={`/lecture/${lecture.id}`} className="min-w-0 flex-1 group/link">
            <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider mb-0.5 truncate">
              {recitantNom ?? "Récitant"}
            </p>
            <h3 className="text-white font-semibold text-lg leading-tight truncate group-hover/link:text-emerald-400 transition-colors">
              {titre}
            </h3>
            {nomArabe && (
              <p className="text-neutral-500 text-sm mt-0.5 truncate" dir="rtl">
                {nomArabe}
              </p>
            )}
          </Link>
        </div>

        {/* Bottom: progress bar + times */}
        <div className="mt-4 sm:mt-auto">
          {/* Progress bar */}
          <div
            className="h-1.5 bg-neutral-700 rounded-full cursor-pointer group/bar relative"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-emerald-500 rounded-full relative transition-all duration-100"
              style={{ width: `${progress}%` }}
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Time + stats */}
          <div className="flex items-center justify-between mt-2 text-xs text-neutral-500">
            <span className="tabular-nums">
              {formatTime(currentTime)}
              {duration > 0 && ` / ${formatTime(duration)}`}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Headphones className="h-3 w-3" />
                {lecture.nombre_ecoutes}
              </span>
              <a
                href={lecture.audio_url}
                download
                onClick={handleDownload}
                className="flex items-center gap-1 text-neutral-500 hover:text-emerald-400 transition-colors"
                title="Télécharger"
              >
                <Download className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right: image */}
      <div className="hidden sm:block w-[180px] flex-shrink-0 relative">
        {lecture.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lecture.image_url}
            alt={titre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-800 to-emerald-950 text-emerald-300 text-3xl">
            {nomArabe ?? "﴾ ﴿"}
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={lecture.audio_url}
        preload="none"
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