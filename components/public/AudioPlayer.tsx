"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lecture } from "@/types/lecture";

export default function AudioPlayer({
  lecture,
  hideImage = false,
  variant = "card",
}: {
  lecture: Lecture;
  hideImage?: boolean;
  variant?: "card" | "bare";
}) {
  const [hasCountedListen, setHasCountedListen] = useState(false);

  const handlePlay = () => {
    if (!hasCountedListen) {
      setHasCountedListen(true);
      fetch(`/api/lectures/${lecture.id}/ecoute`, { method: "POST" }).catch(
        () => {},
      );
    }
  };

  const handleDownload = () => {
    fetch(`/api/lectures/${lecture.id}/telechargement`, {
      method: "POST",
    }).catch(() => {});
  };

  const content = (
    <div className="flex items-start gap-4">
      {!hideImage && lecture.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={lecture.image_url}
          alt={lecture.titre ?? "Couverture"}
          className="w-16 h-16 object-cover rounded flex-shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            {lecture.sourates && (
              <Badge variant="secondary" className="mb-1">
                {lecture.sourates.nom_francais}
              </Badge>
            )}
            {lecture.titre && <p className="font-medium">{lecture.titre}</p>}
          </div>

          <a href={lecture.audio_url} download onClick={handleDownload}>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </a>
        </div>

        <audio
          controls
          preload="none"
          src={lecture.audio_url}
          onPlay={handlePlay}
          className="w-full mt-2"
        />
      </div>
    </div>
  );

  if (variant === "bare") {
    return content;
  }

  return (
    <Card>
      <CardContent className="py-4 space-y-3">{content}</CardContent>
    </Card>
  );
}