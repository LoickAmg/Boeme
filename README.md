# Boème

Site en ligne : <https://boeme.vercel.app>

Lire, écrire et partager de la poésie.

- **Bibliothèque** : des poèmes du domaine public (Charles d'Orléans, Ronsard, Du Bellay, La Fontaine, Lamartine, Hugo, Nerval, Baudelaire, Verlaine, Rimbaud, Apollinaire…), chacun avec son recueil, son année, son thème et un lien vers sa source (Wikisource). Les poèmes encore protégés ne sont pas reproduits : seulement leur titre, leur auteur et un lien.
- **Écrire** : comptes, éditeur, brouillons privés, publication, modification, suppression. **Import d'un poème déjà écrit** : photo d'un carnet, capture d'écran (reconnaissance de texte Tesseract.js en français, titre et strophes retrouvés d'après la position des lignes), ou document `.docx`, `.odt`, `.pdf`, `.txt`. Tout est lu **dans le navigateur** : rien n'est envoyé avant l'enregistrement. Les fichiers du moteur (≈ 4 Mo téléchargés une fois, seulement à la première image) sont servis par le site lui-même depuis `public/ocr`, copiés à l'installation par `scripts/copy-reader-assets.mjs` ; les données du français y sont décompressées, car certains filtres réseau bloquent les fichiers `.gz`.
- **Communauté** : flux des poèmes publiés par les membres (tri récents, plus aimés, plus lus), bouton « J'aime », pages de membres. Provenance toujours affichée : « Écrit sur Boème » pour les membres, « Domaine public · Wikisource » ou « Lien externe » pour la bibliothèque.
- **Mon espace** : les 6 derniers poèmes avec leur couverture, puis « Tous mes poèmes » (grille ou liste, filtres publiés / brouillons, recherche) ; lectures et lecteurs par poème ; poèmes aimés ; changement de mot de passe. **Couverture** facultative : la photo importée ou une image choisie, réduite dans le navigateur (900 px, JPEG, métadonnées effacées), vérifiée côté serveur sur ses octets (JPEG, PNG, WebP) et servie par `/api/poemes/:id/couverture` ; sans image, une couverture est composée à partir du titre et du premier vers.
- **Poèmes du jour** : chaque jour un classique et un poème de la communauté (tirage reproductible dans la journée, chaque favori donnant une chance de plus, plafonnée) ; la vedette de l'accueil alterne d'un jour à l'autre ; un administrateur peut « mettre à l'honneur » un poème de membre, programmé au premier jour libre (liste dans la modération).
- **La poésie autrement** :
  - **cadavre exquis** (`/cadavre-exquis`) : poème collectif écrit vers par vers ; chacun ne voit que le dernier vers ; le poème se révèle quand il atteint sa longueur (8 à 20 vers) ; au plus un quart des vers par membre, jamais deux d'affilée ; rang unique en base (deux vers simultanés ne se marchent pas dessus) ; un administrateur retire un vers ou supprime le poème ;
  - **constellation** (`/constellation`) : carte du ciel de tous les poèmes (une constellation par thème, une étoile par poème placée de façon stable, plus vive selon les favoris), à parcourir à la souris ou aux doigts ;
  - **poème vivant** (sur chaque poème, et `/poeme-vivant` pour en choisir un) : écriture à l'encre vers par vers, lecture par la voix française de l'appareil, ambiances (pluie, vagues, feu, nappe) synthétisées par le navigateur, sans fichier son ;
  - **carte-poème** (sur chaque poème, et `/carte-poeme`) : vers choisis dessinés en image (story, carré, paysage ; 4 styles), téléchargée ou partagée par le téléphone.
- **Accueil** : pile de feuillets qui se rebat toute seule (pause au survol, inclinaison au curseur, flèches), poèmes du jour scellés d'un cachet de cire, et **« La Gazette de Boème »** : chronique mondaine façon Régence (papier, filets dorés, lettrine) nourrie des chiffres réels de la semaine (`src/server/gazette.ts`). Les animations s'arrêtent si l'appareil demande moins de mouvement.
- **Aperçu des liens** : image Open Graph du site et de chaque poème (titre, premiers vers, provenance), générée par `next/og` avec les polices du site (`assets/og`, licence OFL).
- **Retours des lecteurs** : bouton flottant « Un avis ? » sur chaque page et page `/avis` (suggestion, problème, idée, avis ; page d'origine jointe ; nom et e-mail facultatifs pour un visiteur ; champ piège anti-robots, 10 envois par heure). L'administrateur les lit et les classe dans `/admin/retours` (compteur des nouveaux dans l'en-tête) et les reçoit par e-mail si le SMTP est configuré (`FEEDBACK_EMAIL`, sinon `ADMIN_EMAIL`).
- **Pages d'erreur** : 404 « lettre égarée » (recherche et rubriques), erreur de page « Un vers s'est brisé » (réessayer, signaler, référence technique) et page de panne générale « Le salon est fermé un instant », affichée même si la base de données ne répond plus.
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
4. **E-mails** (facultatif, pour « Mot de passe oublié ») : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` — par exemple Gmail avec un mot de passe d'application. Sans eux, l'administrateur crée le lien de réinitialisation depuis la page Modération et le transmet lui-même.

## La bibliothèque

`data/classics.json` est produit par `npm run corpus:fetch` à partir de la liste éditoriale `scripts/classics-list.mjs` : le script interroge l'API de Wikisource, extrait le texte des poèmes, et vérifie les liens des références. **Le fichier se relit avant d'être versionné** (`node scripts/check-classics.mjs` affiche des échantillons et les anomalies). Pour ajouter un poème, ajoutez une ligne à la liste, relancez le script, relisez, puis redéployez : le chargement en base est idempotent (une entrée déjà présente n'est pas modifiée).

Ne sont retenus que des auteurs morts depuis plus de 70 ans. Les textes viennent de Wikisource (domaine public) ; leur mise en page éditoriale est sous licence CC BY-SA, d'où le lien de source conservé sur chaque poème.

Limites connues : quelques poèmes de Wikisource perdent leurs sauts de strophe ou leurs retraits (la mise en forme du wikitexte n'est pas toujours reprise) ; la bibliothèque est francophone.

## Sécurité et confidentialité

- Mots de passe hachés en `scrypt` (jamais chiffrés ni stockés en clair : on ne peut pas les retrouver, seulement les vérifier), sessions à jeton haché, un seul cookie de session, aucun traceur.
- Changement de mot de passe depuis « Mon espace » (mot de passe actuel exigé, autres appareils déconnectés) ; « Mot de passe oublié » par lien e-mail à usage unique valable une heure (seule son empreinte est stockée, réponse identique que le compte existe ou non, limitation par IP et par adresse).
- Lectures des poèmes de membres : une par lecteur, par poème et par jour, sans l'auteur ni les robots ; le lecteur n'est qu'une empreinte salée (aucune IP stockée).
- Limitation de débit atomique en base (connexion, inscription, publication, signalement, génération), par empreinte salée de l'adresse IP : l'IP n'est jamais stockée.
- Actions de modération revérifiées côté serveur (`requireAdmin`), pas seulement masquées.
- Un membre ne peut modifier ou supprimer que ses propres poèmes ; les poèmes de la bibliothèque sont intouchables, même signalés.
- Droit à l'effacement en libre-service : la suppression du compte efface le compte, les poèmes (et leurs couvertures et lectures), les brouillons, les poèmes aimés et les sessions.
- L'e-mail n'apparaît jamais publiquement ; seul le nom d'auteur est affiché.
- Pages légales : mentions légales, confidentialité, charte de publication, contact. L'identité de l'éditeur vient de `SITE_PUBLISHER` et `CONTACT_EMAIL` (valeurs par défaut de l'éditeur actuel).

## Générateur

Deux moteurs : un générateur maison qui recombine des vers écrits à la main (toujours actif, sans dépendance), et une API LLM optionnelle (`POEM_LLM_API_KEY`) avec repli automatique sur le maison. Le thème envoyé au modèle vient toujours d'une liste prédéfinie, jamais d'un texte libre.

## Licence

MIT (code). Les textes de la bibliothèque relèvent du domaine public ; voir plus haut pour Wikisource.
