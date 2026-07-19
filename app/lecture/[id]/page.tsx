import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LectureDetailPlayer from "@/components/public/LectureDetailPlayer";

export default async function LectureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the lecture with its sourate and recitant
  const { data: lecture } = await supabase
    .from("lectures")
    .select("*, sourates(id, nom_francais, nom_arabe), recitants(id, nom, prenom, photo_url, nationalite)")
    .eq("id", id)
    .single();

  if (!lecture) {
    notFound();
  }

  // Fetch related lectures (same recitant, excluding this one)
  const { data: relatedByRecitant } = await supabase
    .from("lectures")
    .select("*, sourates(id, nom_francais, nom_arabe), recitants(id, nom, prenom, photo_url)")
    .eq("recitant_id", lecture.recitant_id)
    .neq("id", id)
    .order("nombre_ecoutes", { ascending: false })
    .limit(5);

  // Fetch related lectures (same sourate by different recitants)
  const { data: relatedBySourate } = lecture.sourate_id
    ? await supabase
        .from("lectures")
        .select("*, sourates(id, nom_francais, nom_arabe), recitants(id, nom, prenom, photo_url)")
        .eq("sourate_id", lecture.sourate_id)
        .neq("id", id)
        .neq("recitant_id", lecture.recitant_id)
        .order("nombre_ecoutes", { ascending: false })
        .limit(5)
    : { data: [] };

  const recitantNom = lecture.recitants
    ? `${lecture.recitants.prenom ?? ""} ${lecture.recitants.nom ?? ""}`.trim()
    : "Récitant";

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Back link */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Link
          href={lecture.recitants ? `/recitant/${lecture.recitants.id}` : "/"}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à {recitantNom}
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <LectureDetailPlayer
          lecture={lecture}
          recitantNom={recitantNom}
          recitantPhoto={lecture.recitants?.photo_url}
          relatedByRecitant={relatedByRecitant ?? []}
          relatedBySourate={relatedBySourate ?? []}
        />
      </main>
    </div>
  );
}
