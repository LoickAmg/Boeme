import type { Language, LengthId, StructureId, ThemeId } from "@/lib/poetry/types";
import type { UiLocale } from "./locale";

interface LabeledHint {
  label: string;
  hint: string;
}

export interface Dictionary {
  metaTitle: string;
  metaDescription: string;
  nav: { brand: string; generator: string; gallery: string };
  footer: string;
  home: { title: string; subtitle: string; recent: string; viewGallery: string };
  gallery: {
    title: string;
    subtitle: string;
    empty: string;
    loadMore: string;
    loading: string;
    loadError: string;
  };
  generator: {
    poemLanguage: string;
    theme: string;
    structure: string;
    length: string;
    generate: string;
    generating: string;
    genError: string;
  };
  languages: Record<Language, string>;
  themes: Record<ThemeId, LabeledHint>;
  structures: Record<StructureId, LabeledHint>;
  lengths: Record<LengthId, string>;
  sources: Record<"maison" | "llm", string>;
  /** Passé à Intl.DateTimeFormat pour la date sous chaque poème. */
  dateLocale: string;
}

export const DICTIONARIES: Record<UiLocale, Dictionary> = {
  fr: {
    metaTitle: "Poèmes — générateur de poésie",
    metaDescription:
      "Un générateur de poèmes chic et cosy : thème, structure et longueur au choix, en français ou en anglais, publiés dans une galerie partagée.",
    nav: { brand: "Poèmes", generator: "Générateur", gallery: "Galerie" },
    footer: "Généré à la main, sans compte ni suivi — juste des poèmes.",
    home: {
      title: "Un poème, sur demande.",
      subtitle:
        "Choisis une langue, un thème, une structure et une longueur — le reste s'écrit tout seul. Chaque poème rejoint ensuite la galerie publique, partagée avec tout le monde.",
      recent: "Récemment publiés",
      viewGallery: "Voir la galerie →",
    },
    gallery: {
      title: "La galerie",
      subtitle: "Tous les poèmes générés, publics, du plus récent au plus ancien.",
      empty: "Aucun poème publié pour l'instant — reviens après en avoir généré un.",
      loadMore: "Charger plus",
      loading: "Chargement…",
      loadError: "Le chargement a échoué.",
    },
    generator: {
      poemLanguage: "Langue du poème",
      theme: "Thème",
      structure: "Structure",
      length: "Longueur",
      generate: "Générer un poème",
      generating: "Génération…",
      genError: "La génération a échoué. Réessaie dans un instant.",
    },
    languages: { fr: "Français", en: "English" },
    themes: {
      tendre: { label: "Tendre", hint: "douceur, gestes discrets" },
      melancolique: { label: "Mélancolique", hint: "pluie, nostalgie douce" },
      reveur: { label: "Rêveur", hint: "nuages, songes, étoiles" },
      lumineux: { label: "Lumineux", hint: "matin clair, espérance" },
      apaisant: { label: "Apaisant", hint: "thé chaud, silence cosy" },
    },
    structures: {
      haiku: { label: "Haïku", hint: "3 vers, 5-7-5" },
      vers_libre: { label: "Vers libre", hint: "sans rimes, phrasé naturel" },
      forme_courte_rimee: { label: "Forme courte rimée", hint: "distiques rimés" },
    },
    lengths: { court: "Court", moyen: "Moyen", long: "Long" },
    sources: { maison: "générateur maison", llm: "IA" },
    dateLocale: "fr-FR",
  },
  en: {
    metaTitle: "Poems — a poetry generator",
    metaDescription:
      "A chic, cozy poem generator: pick a theme, structure and length, in French or English, published to a shared gallery.",
    nav: { brand: "Poems", generator: "Generator", gallery: "Gallery" },
    footer: "Handwritten, no account, no tracking — just poems.",
    home: {
      title: "A poem, on demand.",
      subtitle:
        "Pick a language, a theme, a structure and a length — the rest writes itself. Every poem then joins the public gallery, shared with everyone.",
      recent: "Recently published",
      viewGallery: "View the gallery →",
    },
    gallery: {
      title: "The gallery",
      subtitle: "Every generated poem, public, newest first.",
      empty: "No poems published yet — come back after generating one.",
      loadMore: "Load more",
      loading: "Loading…",
      loadError: "Loading failed.",
    },
    generator: {
      poemLanguage: "Poem language",
      theme: "Theme",
      structure: "Structure",
      length: "Length",
      generate: "Generate a poem",
      generating: "Generating…",
      genError: "Generation failed. Try again in a moment.",
    },
    languages: { fr: "French", en: "English" },
    themes: {
      tendre: { label: "Tender", hint: "softness, quiet gestures" },
      melancolique: { label: "Wistful", hint: "rain, gentle nostalgia" },
      reveur: { label: "Dreamy", hint: "clouds, dreams, stars" },
      lumineux: { label: "Luminous", hint: "bright morning, hope" },
      apaisant: { label: "Soothing", hint: "warm tea, cozy silence" },
    },
    structures: {
      haiku: { label: "Haiku", hint: "3 lines, 5-7-5" },
      vers_libre: { label: "Free verse", hint: "no rhyme, natural phrasing" },
      forme_courte_rimee: { label: "Short rhymed form", hint: "rhyming couplets" },
    },
    lengths: { court: "Short", moyen: "Medium", long: "Long" },
    sources: { maison: "homemade generator", llm: "AI" },
    dateLocale: "en-US",
  },
};

export function getDictionary(locale: UiLocale): Dictionary {
  return DICTIONARIES[locale];
}
