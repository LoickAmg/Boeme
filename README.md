# Poèmes — générateur de poésie

Un générateur de poèmes chic, simple et cosy : on choisit une langue, un
thème, une structure et une longueur, et le poème s'écrit tout seul. Chaque
poème généré rejoint une galerie publique, partagée avec tout le monde,
sans compte ni connexion.

## Stack

- **Next.js 16** (App Router) + TypeScript, Tailwind CSS v4
- **Drizzle ORM** + Postgres (`pg`), migration écrite à la main (pas de CLI
  externe requise — voir plus bas)
- Polices auto-hébergées via `@fontsource` (Cormorant Garamond pour les
  poèmes, Manrope pour l'interface) : aucun appel à Google Fonts, ni au
  build, ni à l'exécution
- **Vitest** pour les tests

## Le générateur

Deux moteurs, avec un ordre de priorité clair :

1. **Générateur maison** (par défaut, toujours actif) — recombine des vers
   écrits à la main, par thème et par langue, plutôt que de générer du
   texte "de zéro" (une approche façon Oulipo/cut-up). Garantit une
   qualité et une correction grammaticale constantes, sans dépendance
   externe ni coût, quel que soit l'environnement de déploiement.
2. **API LLM** (optionnelle) — si une clé est configurée (`POEM_LLM_API_KEY`),
   elle est utilisée en priorité, avec repli automatique et silencieux sur
   le générateur maison en cas d'échec (clé invalide, quota, timeout,
   réseau). La génération ne casse donc jamais, avec ou sans clé.

Le thème envoyé au modèle (LLM) vient toujours d'une liste prédéfinie de 5
ambiances, jamais d'un texte libre saisi par un visiteur — la galerie étant
publique et sans modération manuelle, c'est ce qui évite toute surface
d'abus côté prompt.

## Installation

```bash
npm install
cp .env.example .env
# renseigner DATABASE_URL dans .env (Postgres local ou distant)
npm run db:migrate
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Variables d'environnement

Voir `.env.example` pour la liste complète. En résumé :

| Variable | Requise | Description |
| --- | --- | --- |
| `DATABASE_URL` | oui | Connexion Postgres (locale en dev, fournie par Vercel/Neon en prod) |
| `POEM_LLM_API_KEY` | non | Active le moteur LLM si présente |
| `POEM_LLM_API_URL` | non | API compatible "chat completions" (défaut : OpenAI) |
| `POEM_LLM_MODEL` | non | Modèle à utiliser (défaut : `gpt-4o-mini`) |

## Tests, lint, build

```bash
npm test      # Vitest — générateur, validation, pagination, LLM/fallback
npm run lint  # ESLint
npm run build # build de production (ne nécessite pas DATABASE_URL)
```

Les pages d'accueil et de galerie sont rendues dynamiquement (`export const
dynamic = "force-dynamic"`) : le build ne dépend jamais d'une base de
données accessible au moment de la compilation.

## Base de données

Le schéma (`src/db/schema.ts`) et la migration SQL (`drizzle/0000_init.sql`)
sont écrits à la main plutôt que générés par un CLI (`drizzle-kit`, Prisma) :
le schéma est trivial (une seule table), et cela évite une dépendance
supplémentaire au build. La migration est idempotente
(`CREATE TABLE ... IF NOT EXISTS`) et s'applique avec :

```bash
DATABASE_URL=postgresql://... npm run db:migrate
```

## Architecture et décisions

L’interface et les routes serveur vivent dans l’App Router Next.js. Le générateur maison est le chemin nominal : il permet une démonstration locale déterministe, sans clé API, sans quota et sans dépendance à un fournisseur externe. Le moteur LLM est une extension optionnelle, appelée uniquement côté serveur lorsque `POEM_LLM_API_KEY` est configurée ; cette séparation évite d’exposer la clé au navigateur et garantit un repli fonctionnel lorsque le fournisseur est indisponible.

Le catalogue public stocke les poèmes générés afin de former une galerie partagée. Il faut donc considérer tout texte envoyé à la galerie comme public et ne jamais y placer de donnée personnelle, de secret ou de contenu confidentiel. Les thèmes sont sélectionnés dans une liste contrôlée ; cela réduit les abus de prompt mais ne constitue pas une modération complète.

## Coût, confidentialité et limites

Le générateur maison n’occasionne aucun appel externe. Le mode LLM peut générer des coûts, dépend des quotas et transmet le prompt au fournisseur configuré selon ses propres conditions. En production, renseigner les variables uniquement côté serveur, limiter les quotas par utilisateur ou par adresse IP, journaliser les erreurs sans enregistrer les clés et ajouter une modération avant publication si la galerie est ouverte au public.

Le projet est un **prototype démonstratif**, et non un service de génération audité. La qualité stylistique dépend du corpus embarqué ou du modèle choisi ; aucune métrique de qualité littéraire n’est prétendue. La base Postgres est nécessaire pour la galerie en production, tandis que le build reste indépendant de la disponibilité de la base.

## Démonstration reproductible

Pour une démonstration sans clé LLM, laisser `POEM_LLM_API_KEY` vide, appliquer la migration et générer plusieurs poèmes avec les mêmes langue, thème, structure et longueur. Le moteur maison permet de vérifier le comportement sans réseau ni quota. Pour tester le fallback, configurer volontairement une URL LLM indisponible et vérifier que la requête revient au moteur maison sans exposer l’erreur interne à l’utilisateur.

## Identité visuelle

Typographie auto-hébergée via `@fontsource` (aucun Google Fonts, aucun appel réseau) :

- **Cormorant Garamond** (`--font-serif`) pour les titres et le ton éditorial poétique ;
- **Manrope** (`--font-sans`) pour le corps de texte et l’interface.

Couleurs déclarées comme variables CSS dans `app/globals.css` (palette papier/encre/rose, `linen`, `ivory`, `ink`, `rose`) — aucun code hex en dur dans les composants. Pas de motif « dot grid » ni dégradé générique en fond.

## Pages légales et erreurs

- `src/app/mentions-legales/`, `src/app/confidentialite/`, `src/app/contact/` — pages publiques, contenus bilingues (fr/en) via `src/lib/i18n/dictionary.ts` ;
- `src/app/not-found.tsx` — page d’erreur 404 internationale, public ;
- Liens légaux dans le footer de `src/app/layout.tsx`.

Les champs organisés autour de `[À compléter]` (éditeur, adresse, directeur de publication, hébergeur, responsable de traitement) et l’adresse `contact@exemple.fr` sont à personnaliser avant mise en production.
