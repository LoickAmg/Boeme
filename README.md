# Boème

Lire, écrire et partager de la poésie.

- **Bibliothèque** : des poèmes du domaine public (Charles d'Orléans, Ronsard, Du Bellay, La Fontaine, Lamartine, Hugo, Nerval, Baudelaire, Verlaine, Rimbaud, Apollinaire…), chacun avec son recueil, son année, son thème et un lien vers sa source (Wikisource). Les poèmes encore protégés ne sont pas reproduits : seulement leur titre, leur auteur et un lien.
- **Écrire** : comptes, éditeur, brouillons privés, publication, modification, suppression.
- **Communauté** : flux des poèmes publiés par les membres, favoris, pages de membres.
- **Modération légère** : signalement par les lecteurs ; un poème de membre est masqué à partir de 3 signalements de lecteurs différents, puis un administrateur le rétablit ou le supprime.
- **Générateur** : une proposition de premier jet (langue, ambiance, structure, longueur), à retravailler dans l'éditeur. Il n'écrit en base que si le membre choisit de garder le poème.

## Stack

Next.js 16 (App Router, Server Actions), TypeScript strict, Postgres avec Drizzle (Neon en production, PGlite embarqué en local et en test), Zod, Tailwind CSS v4, polices auto-hébergées (Cormorant Garamond, Manrope). Tests Vitest sur un **vrai Postgres en mémoire**.

## Démarrer en local

```bash
npm install
npm run dev        # http://localhost:3000
```

Sans `DATABASE_URL`, une base embarquée est créée dans `.pglite/`, migrée et garnie de la bibliothèque au premier accès. Pour tester la modération, créez `.env.local` avec `ADMIN_EMAIL=vous@exemple.test` puis inscrivez-vous avec cette adresse : le compte devient administrateur (une seule fois, atomiquement).

Autres commandes : `npm test`, `npm run lint`, `npm run typecheck`, `npm run db:generate` (après un changement de `src/db/schema.ts`).

## Déployer sur Vercel (gratuit)

1. **Base de données** : projet [Neon](https://neon.tech) gratuit, ou intégration Neon depuis le tableau de bord Vercel (elle renseigne `DATABASE_URL`).
2. **Projet** : importez le dépôt dans Vercel. `vercel-build` applique les migrations, charge la bibliothèque si elle est absente (idempotent), puis construit le site.
3. **Variables d'environnement** obligatoires en production, sans quoi le build échoue volontairement : `DATABASE_URL`, `APP_SECRET` (32 caractères aléatoires au moins), `ADMIN_EMAIL`. Voir `.env.example`.

## La bibliothèque

`data/classics.json` est produit par `npm run corpus:fetch` à partir de la liste éditoriale `scripts/classics-list.mjs` : le script interroge l'API de Wikisource, extrait le texte des poèmes, et vérifie les liens des références. **Le fichier se relit avant d'être versionné** (`node scripts/check-classics.mjs` affiche des échantillons et les anomalies). Pour ajouter un poème, ajoutez une ligne à la liste, relancez le script, relisez, puis redéployez : le chargement en base est idempotent (une entrée déjà présente n'est pas modifiée).

Ne sont retenus que des auteurs morts depuis plus de 70 ans. Les textes viennent de Wikisource (domaine public) ; leur mise en page éditoriale est sous licence CC BY-SA, d'où le lien de source conservé sur chaque poème.

Limites connues : quelques poèmes de Wikisource perdent leurs sauts de strophe ou leurs retraits (la mise en forme du wikitexte n'est pas toujours reprise) ; la bibliothèque est francophone.

## Sécurité et confidentialité

- Mots de passe hachés en `scrypt`, sessions à jeton haché, un seul cookie de session, aucun traceur.
- Limitation de débit atomique en base (connexion, inscription, publication, signalement, génération), par empreinte salée de l'adresse IP : l'IP n'est jamais stockée.
- Actions de modération revérifiées côté serveur (`requireAdmin`), pas seulement masquées.
- Un membre ne peut modifier ou supprimer que ses propres poèmes ; les poèmes de la bibliothèque sont intouchables, même signalés.
- Droit à l'effacement en libre-service : la suppression du compte efface le compte, les poèmes, les brouillons, les favoris et les sessions.
- L'e-mail n'apparaît jamais publiquement ; seul le nom d'auteur est affiché.
- Pages légales : mentions légales, confidentialité, charte de publication, contact. L'identité de l'éditeur vient de `SITE_PUBLISHER` et `CONTACT_EMAIL` (valeurs par défaut de l'éditeur actuel).

## Générateur

Deux moteurs : un générateur maison qui recombine des vers écrits à la main (toujours actif, sans dépendance), et une API LLM optionnelle (`POEM_LLM_API_KEY`) avec repli automatique sur le maison. Le thème envoyé au modèle vient toujours d'une liste prédéfinie, jamais d'un texte libre.

## Licence

MIT (code). Les textes de la bibliothèque relèvent du domaine public ; voir plus haut pour Wikisource.
