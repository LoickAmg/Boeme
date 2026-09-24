// Liste éditoriale de la bibliothèque : ce qu'on va chercher sur Wikisource.
// Uniquement des œuvres du domaine public (auteurs morts depuis plus de 70 ans).
// `q` est la recherche Wikisource, `prefix` le début attendu du titre de page
// (il départage les éditions), `theme` un identifiant de src/lib/themes.ts.

export const AUTHORS = [
  { slug: "pierre-de-ronsard", name: "Pierre de Ronsard", born: 1524, died: 1585, wiki: "Pierre_de_Ronsard", bio: "Prince des poètes du XVIe siècle, chef de file de la Pléiade, il renouvelle la poésie française par l'ode et le sonnet." },
  { slug: "joachim-du-bellay", name: "Joachim du Bellay", born: 1522, died: 1560, wiki: "Joachim_du_Bellay", bio: "Poète de la Pléiade, auteur de la Défense et illustration de la langue française et des Regrets, écrits pendant son séjour à Rome." },
  { slug: "charles-d-orleans", name: "Charles d'Orléans", born: 1394, died: 1465, wiki: "Charles_d%27Orl%C3%A9ans_(po%C3%A8te)", bio: "Prince et poète, prisonnier vingt-cinq ans en Angleterre, maître du rondeau et de la ballade à la fin du Moyen Âge." },
  { slug: "jean-de-la-fontaine", name: "Jean de La Fontaine", born: 1621, died: 1695, wiki: "Jean_de_La_Fontaine", bio: "Fabuliste du siècle de Louis XIV, il met en vers libres des histoires d'animaux qui disent les travers des hommes." },
  { slug: "alphonse-de-lamartine", name: "Alphonse de Lamartine", born: 1790, died: 1869, wiki: "Alphonse_de_Lamartine", bio: "Poète romantique des Méditations poétiques, il chante l'amour, la nature et la fuite du temps." },
  { slug: "victor-hugo", name: "Victor Hugo", born: 1802, died: 1885, wiki: "Victor_Hugo", bio: "Chef de file du romantisme, poète, romancier et dramaturge, exilé sous le Second Empire, auteur des Contemplations et de La Légende des siècles." },
  { slug: "alfred-de-vigny", name: "Alfred de Vigny", born: 1797, died: 1863, wiki: "Alfred_de_Vigny", bio: "Poète romantique au pessimisme stoïque, auteur des Destinées, où il médite sur la souffrance et le silence de Dieu." },
  { slug: "alfred-de-musset", name: "Alfred de Musset", born: 1810, died: 1857, wiki: "Alfred_de_Musset", bio: "Enfant terrible du romantisme, poète de la passion et du désenchantement, auteur des Nuits." },
  { slug: "gerard-de-nerval", name: "Gérard de Nerval", born: 1808, died: 1855, wiki: "G%C3%A9rard_de_Nerval", bio: "Poète et conteur du rêve, il laisse peu de sonnets, mais parmi les plus énigmatiques de la langue : Les Chimères." },
  { slug: "marceline-desbordes-valmore", name: "Marceline Desbordes-Valmore", born: 1786, died: 1859, wiki: "Marceline_Desbordes-Valmore", bio: "Poétesse de l'élégie amoureuse, admirée de Verlaine, qui la compte parmi les « poètes maudits »." },
  { slug: "theophile-gautier", name: "Théophile Gautier", born: 1811, died: 1872, wiki: "Th%C3%A9ophile_Gautier", bio: "Théoricien de l'art pour l'art, poète des Émaux et Camées, dédicataire des Fleurs du mal." },
  { slug: "charles-baudelaire", name: "Charles Baudelaire", born: 1821, died: 1867, wiki: "Charles_Baudelaire", bio: "Poète des Fleurs du mal, il fait de la ville moderne et du spleen la matière d'une beauté nouvelle." },
  { slug: "leconte-de-lisle", name: "Leconte de Lisle", born: 1818, died: 1894, wiki: "Leconte_de_Lisle", bio: "Chef de file du Parnasse, il cherche dans les mondes antiques et exotiques une poésie impersonnelle et marmoréenne." },
  { slug: "paul-verlaine", name: "Paul Verlaine", born: 1844, died: 1896, wiki: "Paul_Verlaine", bio: "Poète de la musique avant toute chose, de la mélancolie et de la nuance, auteur des Poèmes saturniens et de Sagesse." },
  { slug: "arthur-rimbaud", name: "Arthur Rimbaud", born: 1854, died: 1891, wiki: "Arthur_Rimbaud", bio: "Adolescent prodige, il écrit toute son œuvre entre quinze et vingt ans avant de renoncer à la poésie." },
  { slug: "stephane-mallarme", name: "Stéphane Mallarmé", born: 1842, died: 1898, wiki: "St%C3%A9phane_Mallarm%C3%A9", bio: "Maître du symbolisme, il cherche « donner un sens plus pur aux mots de la tribu »." },
  { slug: "jose-maria-de-heredia", name: "José-Maria de Heredia", born: 1842, died: 1905, wiki: "Jos%C3%A9-Maria_de_Heredia", bio: "Parnassien, auteur d'un seul recueil, Les Trophées, sonnets ciselés d'histoire et de voyages." },
  { slug: "guillaume-apollinaire", name: "Guillaume Apollinaire", born: 1880, died: 1918, wiki: "Guillaume_Apollinaire", bio: "Poète de la modernité, inventeur du mot « surréalisme », auteur d'Alcools et de Calligrammes." },
];

// kind: "classic" (texte intégral, Wikisource) — les entrées « reference »
// (poèmes encore protégés, simple lien vers la source) sont dans REFERENCES.
export const CLASSICS = [
  // Ronsard
  { author: "pierre-de-ronsard", q: "Mignonne, allons voir si la rose Ronsard", prefix: "Mignonne, allons voir", page: "Les Odes (Ronsard)/« Mignonne, allons voir si la rose »", title: "Mignonne, allons voir si la rose", collection: "Odes", year: 1553, theme: "amour" },
  { author: "pierre-de-ronsard", q: "Quand vous serez bien vieille Ronsard Sonnets pour Hélène", prefix: "Sonnets pour Hélène", page: "Le second livre des Sonnets pour Hélène/Quand vous serez bien vieille", title: "Quand vous serez bien vieille", collection: "Sonnets pour Hélène", year: 1578, theme: "temps" },
  // Du Bellay
  { author: "joachim-du-bellay", q: "Heureux qui, comme Ulysse Du Bellay Les Regrets", prefix: "Les Regrets", page: "Le Livre des sonnets/Heureux qui, comme Ulysse, a fait un beau voyage", title: "Heureux qui, comme Ulysse", collection: "Les Regrets", year: 1558, theme: "exil" },
  // Charles d'Orléans
  { author: "charles-d-orleans", q: "Le temps a laissé son manteau Charles d'Orléans rondeau", prefix: "Rondeau", page: "Le temps a laissié son manteau", title: "Le temps a laissé son manteau", collection: "Rondeaux", year: 1450, theme: "nature" },
  // La Fontaine
  { author: "jean-de-la-fontaine", q: "La Cigale et la Fourmi La Fontaine Fables", prefix: "Fables de La Fontaine", title: "La Cigale et la Fourmi", collection: "Fables", year: 1668, theme: "sagesse" },
  { author: "jean-de-la-fontaine", q: "Le Corbeau et le Renard La Fontaine Fables", prefix: "Fables de La Fontaine", title: "Le Corbeau et le Renard", collection: "Fables", year: 1668, theme: "sagesse" },
  { author: "jean-de-la-fontaine", q: "Le Loup et l'Agneau La Fontaine Fables", prefix: "Fables de La Fontaine", title: "Le Loup et l'Agneau", collection: "Fables", year: 1668, theme: "sagesse" },
  // Lamartine
  { author: "alphonse-de-lamartine", q: "Le Lac Lamartine Méditations poétiques", prefix: "Méditations poétiques", title: "Le Lac", collection: "Méditations poétiques", year: 1820, theme: "temps" },
  { author: "alphonse-de-lamartine", q: "L'Isolement Lamartine Méditations poétiques", prefix: "Méditations poétiques", title: "L'Isolement", collection: "Méditations poétiques", year: 1820, theme: "melancolie" },
  { author: "alphonse-de-lamartine", q: "L'Automne Lamartine Méditations poétiques", prefix: "Méditations poétiques", title: "L'Automne", collection: "Méditations poétiques", year: 1820, theme: "nature" },
  { author: "alphonse-de-lamartine", q: "Le Vallon Lamartine Méditations poétiques", prefix: "Méditations poétiques", title: "Le Vallon", collection: "Méditations poétiques", year: 1820, theme: "nature" },
  // Hugo
  { author: "victor-hugo", q: "Demain, dès l'aube Hugo Les Contemplations", prefix: "Les Contemplations", title: "Demain, dès l'aube", collection: "Les Contemplations", year: 1856, theme: "mort" },
  { author: "victor-hugo", q: "Oceano nox Hugo Les Rayons et les Ombres", prefix: "Les Rayons et les Ombres", title: "Oceano nox", collection: "Les Rayons et les Ombres", year: 1840, theme: "mer" },
  { author: "victor-hugo", q: "Booz endormi Hugo La Légende des siècles", prefix: "La Légende des siècles", title: "Booz endormi", collection: "La Légende des siècles", year: 1859, theme: "spiritualite" },
  { author: "victor-hugo", q: "Les Djinns Hugo Les Orientales", prefix: "Les Orientales", title: "Les Djinns", collection: "Les Orientales", year: 1829, theme: "nuit" },
  { author: "victor-hugo", q: "Mors Hugo Les Contemplations", prefix: "Les Contemplations", title: "Mors", collection: "Les Contemplations", year: 1856, theme: "mort" },
  { author: "victor-hugo", q: "Aux feuillantines Hugo Les Contemplations", prefix: "Les Contemplations", title: "Aux Feuillantines", collection: "Les Contemplations", year: 1856, theme: "enfance" },
  // Vigny
  { author: "alfred-de-vigny", q: "La Mort du loup Vigny Les Destinées", prefix: "Les Destinées", title: "La Mort du loup", collection: "Les Destinées", year: 1843, theme: "sagesse" },
  { author: "alfred-de-vigny", q: "Le Cor Vigny Poèmes antiques et modernes", prefix: "Poèmes antiques et modernes", title: "Le Cor", collection: "Poèmes antiques et modernes", year: 1826, theme: "nature" },
  // Musset
  { author: "alfred-de-musset", q: "Tristesse Musset Poésies nouvelles", prefix: "Poésies nouvelles", title: "Tristesse", collection: "Poésies nouvelles", year: 1840, theme: "melancolie" },
  { author: "alfred-de-musset", q: "Ballade à la lune Musset Contes d'Espagne et d'Italie", prefix: "Contes d'Espagne et d'Italie", page: "Premières Poésies (Musset, éd. 1863)/Ballade à la Lune", title: "Ballade à la lune", collection: "Contes d'Espagne et d'Italie", year: 1830, theme: "nuit" },
  { author: "alfred-de-musset", q: "Chanson de Fortunio Musset", prefix: "Poésies nouvelles", title: "Chanson de Fortunio", collection: "Poésies nouvelles", year: 1835, theme: "amour" },
  // Nerval
  { author: "gerard-de-nerval", q: "El Desdichado Nerval Les Chimères", prefix: "Les Chimères", title: "El Desdichado", collection: "Les Chimères", year: 1854, theme: "melancolie" },
  { author: "gerard-de-nerval", q: "Artémis Nerval Les Chimères", prefix: "Les Chimères", title: "Artémis", collection: "Les Chimères", year: 1854, theme: "temps" },
  { author: "gerard-de-nerval", q: "Vers dorés Nerval Les Chimères", prefix: "Les Chimères", title: "Vers dorés", collection: "Les Chimères", year: 1854, theme: "spiritualite" },
  // Desbordes-Valmore
  { author: "marceline-desbordes-valmore", q: "Les Roses de Saadi Desbordes-Valmore", prefix: "Poésies inédites", title: "Les Roses de Saadi", collection: "Poésies inédites", year: 1860, theme: "amour" },
  { author: "marceline-desbordes-valmore", q: "Les Séparés Desbordes-Valmore", prefix: "Poésies inédites", page: "Les Séparés", title: "Les Séparés", collection: "Poésies inédites", year: 1860, theme: "amour" },
  // Gautier
  { author: "theophile-gautier", q: "Symphonie en blanc majeur Gautier Émaux et Camées", prefix: "Émaux et Camées", title: "Symphonie en blanc majeur", collection: "Émaux et Camées", year: 1852, theme: "nature" },
  { author: "theophile-gautier", q: "L'Art Gautier Émaux et Camées", prefix: "Émaux et Camées", title: "L'Art", collection: "Émaux et Camées", year: 1857, theme: "art" },
  // Baudelaire
  { author: "charles-baudelaire", q: "L'Albatros Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "L'Albatros", collection: "Les Fleurs du mal", year: 1857, theme: "art" },
  { author: "charles-baudelaire", q: "Correspondances Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "Correspondances", collection: "Les Fleurs du mal", year: 1857, theme: "art" },
  { author: "charles-baudelaire", q: "Harmonie du soir Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "Harmonie du soir", collection: "Les Fleurs du mal", year: 1857, theme: "nuit" },
  { author: "charles-baudelaire", q: "L'Invitation au voyage Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "L'Invitation au voyage", collection: "Les Fleurs du mal", year: 1857, theme: "voyage" },
  { author: "charles-baudelaire", q: "Recueillement Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "Recueillement", collection: "Les Fleurs du mal", year: 1861, theme: "nuit" },
  { author: "charles-baudelaire", q: "À une passante Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "À une passante", collection: "Les Fleurs du mal", year: 1860, theme: "amour" },
  { author: "charles-baudelaire", q: "Les Chats Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "Les Chats", collection: "Les Fleurs du mal", year: 1847, theme: "nuit" },
  { author: "charles-baudelaire", q: "Élévation Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "Élévation", collection: "Les Fleurs du mal", year: 1857, theme: "spiritualite" },
  { author: "charles-baudelaire", q: "Le Balcon Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "Le Balcon", collection: "Les Fleurs du mal", year: 1857, theme: "amour" },
  { author: "charles-baudelaire", q: "L'Ennemi Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "L'Ennemi", collection: "Les Fleurs du mal", year: 1857, theme: "temps" },
  { author: "charles-baudelaire", q: "Chant d'automne Baudelaire Les Fleurs du mal 1868", prefix: "Les Fleurs du mal (1868)", title: "Chant d'automne", collection: "Les Fleurs du mal", year: 1859, theme: "temps" },
  // Leconte de Lisle
  { author: "leconte-de-lisle", q: "Midi Leconte de Lisle Poèmes antiques", prefix: "Poèmes antiques", title: "Midi", collection: "Poèmes antiques", year: 1852, theme: "nature" },
  { author: "leconte-de-lisle", q: "Les Éléphants Leconte de Lisle Poèmes barbares", prefix: "Poèmes barbares", page: "Les Éléphants", title: "Les Éléphants", collection: "Poèmes barbares", year: 1862, theme: "voyage" },
  // Verlaine
  { author: "paul-verlaine", q: "Chanson d'automne Verlaine Poèmes saturniens", prefix: "Poèmes saturniens", title: "Chanson d'automne", collection: "Poèmes saturniens", year: 1866, theme: "temps" },
  { author: "paul-verlaine", q: "Mon rêve familier Verlaine Poèmes saturniens", prefix: "Poèmes saturniens", title: "Mon rêve familier", collection: "Poèmes saturniens", year: 1866, theme: "reve" },
  { author: "paul-verlaine", q: "Il pleure dans mon cœur Verlaine Romances sans paroles", prefix: "Romances sans paroles", title: "Il pleure dans mon cœur", collection: "Romances sans paroles", year: 1874, theme: "melancolie" },
  { author: "paul-verlaine", q: "Green Verlaine Romances sans paroles", prefix: "Romances sans paroles", title: "Green", collection: "Romances sans paroles", year: 1874, theme: "amour" },
  { author: "paul-verlaine", q: "Le ciel est, par-dessus le toit Verlaine Sagesse", prefix: "Sagesse", title: "Le ciel est, par-dessus le toit", collection: "Sagesse", year: 1881, theme: "melancolie" },
  { author: "paul-verlaine", q: "Clair de lune Verlaine Fêtes galantes", prefix: "Fêtes galantes", title: "Clair de lune", collection: "Fêtes galantes", year: 1869, theme: "nuit" },
  { author: "paul-verlaine", q: "Colloque sentimental Verlaine Fêtes galantes", prefix: "Fêtes galantes", title: "Colloque sentimental", collection: "Fêtes galantes", year: 1869, theme: "amour" },
  { author: "paul-verlaine", q: "Art poétique Verlaine Jadis et naguère", prefix: "Jadis et naguère", title: "Art poétique", collection: "Jadis et naguère", year: 1874, theme: "art" },
  // Rimbaud
  { author: "arthur-rimbaud", q: "Le Dormeur du val Rimbaud", prefix: "Poésies (Rimbaud)", title: "Le Dormeur du val", collection: "Poésies", year: 1870, theme: "mort" },
  { author: "arthur-rimbaud", q: "Ma Bohème Rimbaud", prefix: "Poésies (Rimbaud)", title: "Ma Bohème", collection: "Poésies", year: 1870, theme: "voyage" },
  { author: "arthur-rimbaud", q: "Sensation Rimbaud Poésies", prefix: "Poésies (Rimbaud)", title: "Sensation", collection: "Poésies", year: 1870, theme: "nature" },
  { author: "arthur-rimbaud", q: "Voyelles Rimbaud", prefix: "Poésies (Rimbaud)", title: "Voyelles", collection: "Poésies", year: 1871, theme: "art" },
  { author: "arthur-rimbaud", q: "Le Bateau ivre Rimbaud", prefix: "Poésies (Rimbaud)", title: "Le Bateau ivre", collection: "Poésies", year: 1871, theme: "mer" },
  { author: "arthur-rimbaud", q: "Ophélie Rimbaud Poésies", prefix: "Poésies (Rimbaud)", title: "Ophélie", collection: "Poésies", year: 1870, theme: "mort" },
  { author: "arthur-rimbaud", q: "Au Cabaret-Vert Rimbaud", prefix: "Poésies (Rimbaud)", title: "Au Cabaret-Vert", collection: "Poésies", year: 1870, theme: "voyage" },
  { author: "arthur-rimbaud", q: "Rêvé pour l'hiver Rimbaud", prefix: "Poésies (Rimbaud)", title: "Rêvé pour l'hiver", collection: "Poésies", year: 1870, theme: "amour" },
  // Mallarmé
  { author: "stephane-mallarme", q: "Brise marine Mallarmé Poésies", prefix: "Poésies (Mallarmé)", page: "Brise marine (Stéphane Mallarmé)", title: "Brise marine", collection: "Poésies", year: 1865, theme: "mer" },
  { author: "stephane-mallarme", q: "Apparition Mallarmé Poésies", prefix: "Poésies (Mallarmé)", page: "Poésies (Mallarmé, 1914, 8e éd.)/Apparition", title: "Apparition", collection: "Poésies", year: 1863, theme: "amour" },
  // Heredia
  { author: "jose-maria-de-heredia", q: "Les Conquérants Heredia Les Trophées", prefix: "Les Trophées", title: "Les Conquérants", collection: "Les Trophées", year: 1893, theme: "voyage" },
  { author: "jose-maria-de-heredia", q: "Le Récif de corail Heredia Les Trophées", prefix: "Les Trophées", title: "Le Récif de corail", collection: "Les Trophées", year: 1893, theme: "mer" },
  // Apollinaire
  { author: "guillaume-apollinaire", q: "Le Pont Mirabeau Apollinaire Alcools", prefix: "Alcools", title: "Le Pont Mirabeau", collection: "Alcools", year: 1912, theme: "amour" },
  { author: "guillaume-apollinaire", q: "Automne malade Apollinaire Alcools", prefix: "Alcools", title: "Automne malade", collection: "Alcools", year: 1913, theme: "temps" },
  { author: "guillaume-apollinaire", q: "Les Colchiques Apollinaire Alcools", prefix: "Alcools", title: "Les Colchiques", collection: "Alcools", year: 1908, theme: "nature" },
  { author: "guillaume-apollinaire", q: "Marie Apollinaire Alcools", prefix: "Alcools", title: "Marie", collection: "Alcools", year: 1912, theme: "amour" },
];

// Poèmes encore protégés : pas de texte, seulement une notice et un lien
// vérifié vers une source (Wikipédia ou éditeur). `url` est testé par le script.
export const REFERENCES = [
  { author: "Jacques Prévert", title: "Barbara", collection: "Paroles", year: 1946, theme: "amour", url: "https://fr.wikipedia.org/wiki/Barbara_(po%C3%A8me)" },
  { author: "Louis Aragon", title: "Il n'y a pas d'amour heureux", collection: "La Diane française", year: 1943, theme: "amour", url: "https://fr.wikipedia.org/wiki/Il_n%27y_a_pas_d%27amour_heureux" },
  { author: "Léopold Sédar Senghor", title: "Femme noire", collection: "Chants d'ombre", year: 1945, theme: "amour", url: "https://fr.wikipedia.org/wiki/Femme_noire_(po%C3%A8me)" },
  { author: "Aimé Césaire", title: "Cahier d'un retour au pays natal", collection: "", year: 1939, theme: "liberte", url: "https://fr.wikipedia.org/wiki/Cahier_d%27un_retour_au_pays_natal" },
  { author: "David Diop", title: "Afrique", collection: "Coups de pilon", year: 1956, theme: "liberte", url: "https://fr.wikipedia.org/wiki/David_Diop_(po%C3%A8te)" },
  { author: "Birago Diop", title: "Souffles", collection: "Leurres et lueurs", year: 1960, theme: "spiritualite", url: "https://fr.wikipedia.org/wiki/Birago_Diop" },
  { author: "Paul Éluard", title: "Liberté", collection: "Poésie et vérité 1942", year: 1942, theme: "liberte", url: "https://fr.wikipedia.org/wiki/Libert%C3%A9_(%C3%89luard)" },
  { author: "Robert Desnos", title: "Le Dernier Poème", collection: "", year: 1945, theme: "amour", url: "https://fr.wikipedia.org/wiki/Robert_Desnos" },
  { author: "Jacques Prévert", title: "Pour faire le portrait d'un oiseau", collection: "Paroles", year: 1946, theme: "nature", url: "https://fr.wikipedia.org/wiki/Pour_faire_le_portrait_d%27un_oiseau" },
  { author: "Léon-Gontran Damas", title: "Pigments", collection: "Pigments", year: 1937, theme: "liberte", url: "https://fr.wikipedia.org/wiki/L%C3%A9on-Gontran_Damas" },
];
