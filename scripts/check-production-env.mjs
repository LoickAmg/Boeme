// Bloque un déploiement de production dont la configuration est incomplète ou dangereuse.
const production = process.env.VERCEL_ENV === "production" || process.env.CHECK_PRODUCTION_ENV === "1";
if (!production) process.exit(0);

const env = (name) => process.env[name]?.trim() ?? "";
const problems = [];

for (const name of ["DATABASE_URL", "APP_SECRET", "ADMIN_EMAIL"]) {
  if (!env(name)) problems.push(`${name} est obligatoire en production.`);
}
if (env("APP_SECRET") && env("APP_SECRET").length < 32) problems.push("APP_SECRET doit faire au moins 32 caractères.");

if (problems.length > 0) {
  console.error("Configuration de production incomplète :\n- " + problems.join("\n- "));
  process.exit(1);
}
