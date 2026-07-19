import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LecturesList from "@/components/public/LecturesList";

export default async function RecitantPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: recitant }, { data: lectures }] = await Promise.all([
    supabase.from("recitants").select("*").eq("id", id).single(),
    supabase
      .from("lectures")
      .select("*, sourates(id, nom_francais, nom_arabe)")
      .eq("recitant_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!recitant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-white border-b py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Link>

          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={recitant.photo_url ?? undefined} />
              <AvatarFallback className="text-2xl">
                {recitant.prenom?.[0]}
                {recitant.nom?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                {recitant.prenom} {recitant.nom}
              </h1>
              {recitant.nationalite && (
                <p className="text-muted-foreground">{recitant.nationalite}</p>
              )}
            </div>
          </div>

          {recitant.biographie && (
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {recitant.biographie}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-xl font-semibold mb-4">
          Lectures ({lectures?.length ?? 0})
        </h2>
        <LecturesList
          lectures={lectures ?? []}
          recitantNom={`${recitant.prenom ?? ""} ${recitant.nom ?? ""}`.trim()}
        />
      </main>
    </div>
  );
}
