import { describe, expect, it } from "vitest";

import { createRateLimiter } from "./rateLimit";

describe("createRateLimiter", () => {
  it("autorise jusqu'au maximum puis bloque avec un délai d'attente", () => {
    let clock = 0;
    const check = createRateLimiter({ windowMs: 60_000, max: 3, now: () => clock });

    expect([1, 2, 3].map(() => check("a").allowed)).toEqual([true, true, true]);
    clock = 20_000;
    const blocked = check("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(40);
  });

  it("compte chaque clé séparément", () => {
    const check = createRateLimiter({ windowMs: 60_000, max: 1 });
    expect(check("a").allowed).toBe(true);
    expect(check("a").allowed).toBe(false);
    expect(check("b").allowed).toBe(true);
  });

  it("repart de zéro une fois la fenêtre écoulée", () => {
    let clock = 0;
    const check = createRateLimiter({ windowMs: 1000, max: 1, now: () => clock });
    check("a");
    expect(check("a").allowed).toBe(false);
    clock = 1001;
    expect(check("a").allowed).toBe(true);
  });
});
