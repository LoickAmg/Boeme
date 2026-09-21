export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  max: number;
  now?: () => number;
}

/**
 * Limiteur à fenêtre fixe, en mémoire. Sur un hébergement serverless chaque
 * instance a son propre compteur : c'est un frein contre un script lancé
 * depuis une seule machine, pas une garantie globale (voir le plafond
 * horaire en base dans `src/app/api/poems/route.ts`). Aucune adresse n'est
 * conservée au-delà de la fenêtre.
 */
export function createRateLimiter({ windowMs, max, now = Date.now }: RateLimiterOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  function sweep(at: number) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= at) hits.delete(key);
    }
  }

  return function check(key: string): RateLimitResult {
    const at = now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= at) {
      sweep(at);
      hits.set(key, { count: 1, resetAt: at + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    entry.count += 1;
    if (entry.count > max) {
      return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - at) / 1000) };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  };
}
