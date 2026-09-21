/**
 * Adresse du client derrière le proxy de l'hébergeur : la première valeur
 * de X-Forwarded-For (Vercel la renseigne lui-même), sinon X-Real-IP.
 */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}
