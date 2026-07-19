import type { Recitant } from "./recitant";

export type Lecture = {
  id: string;
  recitant_id: string;
  sourate_id: number | null;
  titre: string | null;
  audio_url: string;
  image_url: string | null;
  duree_secondes: number | null;
  taille_fichier: number | null;
  nombre_ecoutes: number;
  nombre_telechargements: number;
  created_at?: string;
  recitants?: Pick<
    Recitant,
    "id" | "nom" | "prenom" | "nationalite" | "photo_url"
  >;
  sourates?: { id: number; nom_francais: string; nom_arabe: string };
};

export type Sourate = {
  id: number;
  nom_arabe: string;
  nom_francais: string;
  nombre_versets: number;
};
