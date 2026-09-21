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
  footerLinks: { mentionsLegales: string; confidentialite: string; contact: string };
  legal: {
    updatedLabel: string;
    contactEmail: string;
    mentions: {
      title: string;
      intro: string;
      publisherTitle: string;
      publisherName: string;
      addressNote: string;
      directorName: string;
      directorTitle: string;
      hostingTitle: string;
      hostText: string;
      ipTitle: string;
      ipBody1: string;
      ipBody2: string;
      dataTitle: string;
      dataBody: string;
    };
    privacy: {
      title: string;
      introTitle: string;
      introBody: string;
      legalBaseTitle: string;
      legalBaseBody: string;
      retentionTitle: string;
      retentionBody: string;
      rightsTitle: string;
      rightsBody: string;
      controllerTitle: string;
      controllerBody: string;
      contact: string;
    };
    contactPage: { title: string; intro: string; emailTitle: string; emailBody: string };
  };
  notFound: { title: string; body: string; back: string };
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
    footerLinks: { mentionsLegales: "Mentions légales", confidentialite: "Confidentialité", contact: "Contact" },
    legal: {
      updatedLabel: "Dernière mise à jour : septembre 2026",
      contactEmail: "mahounaamg@gmail.com",
      mentions: {
        title: "Mentions légales",
        intro: "Le site Poèmes est édité par :",
        publisherTitle: "Éditeur du site",
        publisherName: "Mahouna",
        addressNote:
          "Éditeur non professionnel : l'adresse postale n'est pas publiée et est communiquée à l'hébergeur (loi n° 2004-575 du 21 juin 2004, art. 6, III, 2°).",
        directorName: "Mahouna",
        directorTitle: "Directeur de la publication",
        hostingTitle: "Hébergement",
        hostText:
          "Le code source est publié sur GitHub (github.com/LoickAmg/Poem-Generator). Le nom de l'hébergeur du service en ligne sera indiqué ici dès sa mise en production.",
        ipTitle: "Propriété intellectuelle",
        ipBody1:
          "L'ensemble des contenus de ce site (textes, code) est protégé par le droit d'auteur. Toute reproduction, même partielle, sans autorisation préalable est interdite.",
        ipBody2:
          "Les poèmes générés sont publiés par leurs auteurs au sein de la galerie publique, sans modération manuelle.",
        dataTitle: "Données et responsabilité",
        dataBody:
          "Aucun compte ni cookie de suivi n'est utilisé. Les données de connexion éventuelles sont traitées conformément à la politique de confidentialité.",
      },
      privacy: {
        title: "Politique de confidentialité (RGPD)",
        introTitle: "Traitement des données",
        introBody:
          "Le service ne stocke aucune donnée personnelle : pas de compte, pas de cookie de suivi, pas d'outil d'analyse tiers. Seule l'adresse IP du visiteur est lue, en mémoire, pour limiter les abus.",
        legalBaseTitle: "Base légale",
        legalBaseBody:
          "L'adresse IP est utilisée sur la base de l'intérêt légitime de l'éditeur : empêcher qu'un script génère des poèmes en masse. Aucun autre traitement de données personnelles n'est réalisé. Les poèmes soumis à la galerie doivent être considérés comme publics.",
        retentionTitle: "Durée de conservation",
        retentionBody:
          "L'adresse IP n'est jamais enregistrée en base : elle reste en mémoire du serveur 10 minutes au plus, puis disparaît.",
        rightsTitle: "Vos droits",
        rightsBody:
          "En l'absence de traitement de données, aucun droit particulier ne s'exerce ; pour toute question, contactez-nous.",
        controllerTitle: "Responsable de traitement",
        controllerBody: "Mahouna, particulier (éditeur non professionnel, voir les mentions légales).",
        contact: "Pour toute question :",
      },
      contactPage: {
        title: "Contact",
        intro: "Une question, une remarque ou une suggestion ? Écrivez-nous à l'adresse suivante :",
        emailTitle: "Contact par email",
        emailBody: "Nous répondons généralement sous quelques jours ouvrés.",
      },
    },
    notFound: {
      title: "Cette page n'existe pas.",
      body: "Le poème que vous cherchez est introuvable : il a été déplacé, retiré ou l'adresse est erronée.",
      back: "Retour au générateur",
    },
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
    footerLinks: { mentionsLegales: "Legal notice", confidentialite: "Privacy", contact: "Contact" },
    legal: {
      updatedLabel: "Last updated: September 2026",
      contactEmail: "mahounaamg@gmail.com",
      mentions: {
        title: "Legal notice",
        intro: "The Poems website is published by:",
        publisherTitle: "Site publisher",
        publisherName: "Mahouna",
        addressNote:
          "Non-professional publisher: the postal address is not published and has been provided to the host (French law no. 2004-575 of 21 June 2004, art. 6, III, 2°).",
        directorName: "Mahouna",
        directorTitle: "Publication director",
        hostingTitle: "Hosting",
        hostText:
          "The source code is published on GitHub (github.com/LoickAmg/Poem-Generator). The name of the host of the live service will be stated here once it goes into production.",
        ipTitle: "Intellectual property",
        ipBody1:
          "All content on this site (text, code) is protected by copyright. Any reproduction, even partial, without prior authorisation is prohibited.",
        ipBody2:
          "Generated poems are published by their authors in the public gallery, without manual moderation.",
        dataTitle: "Data and liability",
        dataBody:
          "No account or tracking cookie is used. Any connection data is processed in accordance with the privacy policy.",
      },
      privacy: {
        title: "Privacy policy (GDPR)",
        introTitle: "Data processing",
        introBody:
          "This service stores no personal data: no account, no tracking cookie, no third-party analytics. Only the visitor's IP address is read, in memory, to limit abuse.",
        legalBaseTitle: "Legal basis",
        legalBaseBody:
          "The IP address is used on the basis of the publisher's legitimate interest: preventing scripts from generating poems in bulk. No other personal data is processed. Poems submitted to the gallery must be considered public.",
        retentionTitle: "Retention period",
        retentionBody:
          "The IP address is never written to the database: it stays in server memory for 10 minutes at most, then disappears.",
        rightsTitle: "Your rights",
        rightsBody:
          "With no data processing, no specific rights apply; for any question, please contact us.",
        controllerTitle: "Data controller",
        controllerBody: "Mahouna, individual (non-professional publisher, see the legal notice).",
        contact: "For any question:",
      },
      contactPage: {
        title: "Contact",
        intro: "A question, a note or a suggestion? Write to us at the following address:",
        emailTitle: "Contact by email",
        emailBody: "We usually reply within a few business days.",
      },
    },
    notFound: {
      title: "This page does not exist.",
      body: "The poem you are looking for cannot be found: it may have been moved, removed, or the address is incorrect.",
      back: "Back to the generator",
    },
  },
};

export function getDictionary(locale: UiLocale): Dictionary {
  return DICTIONARIES[locale];
}
