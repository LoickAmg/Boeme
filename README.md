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

## Déploiement (Vercel)

1. Pousser le projet sur GitHub.
2. Importer le repo dans Vercel.
3. Ajouter une base Postgres (intégration Vercel Postgres, ou Neon /
   Supabase / autre — il suffit que `DATABASE_URL` soit renseignée dans les
   variables d'environnement du projet).
4. Lancer la migration une fois (`npm run db:migrate` en local avec
   `DATABASE_URL` pointée sur la base de prod, ou via un script one-off).
5. (Optionnel) Renseigner `POEM_LLM_API_KEY` pour activer le moteur LLM.
6. Déployer.

Aucune autre configuration n'est nécessaire — le site fonctionne
entièrement avec le générateur maison si aucune clé LLM n'est fournie.
