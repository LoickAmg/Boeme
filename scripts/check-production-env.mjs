// Bloque un déploiement de production dont la configuration est incomplète ou dangereuse.
const production = process.env.VERCEL_ENV === "production" || process.env.CHECK_PRODUCTION_ENV === "1";
if (!production) process.exit(0);

const env = (name) => process.env[name]?.trim() ?? "";
const problems = [];

for (const name of ["DATABASE_URL", "APP_SECRET", "ADMIN_EMAIL"]) {
  if (!env(name)) problems.push(`${name} est obligatoire en production.`);
}
if (env("APP_SECRET") && env("APP_SECRET").length < 32) problems.push("APP_SECRET doit faire au moins 32 caractères.");

// Facultatif : sans SMTP, « Mot de passe oublié » passe par l'administrateur.
if (!env("SMTP_HOST")) console.warn("Note : SMTP_HOST absent — « Mot de passe oublié » n'enverra pas d'e-mail (lien à créer depuis la page Modération).");
else if (!env("SMTP_USER") || !env("SMTP_PASS")) problems.push("SMTP_HOST est défini : SMTP_USER et SMTP_PASS sont alors obligatoires.");

if (problems.length > 0) {
  console.error("Configuration de production incomplète :\n- " + problems.join("\n- "));
  process.exit(1);
}
