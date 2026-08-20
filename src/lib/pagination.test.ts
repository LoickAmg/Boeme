import { describe, expect, it } from "vitest";

import { parsePaginationLimit, parsePaginationOffset } from "./pagination";

const OPTS = { defaultLimit: 12, maxLimit: 50 };

describe("parsePaginationLimit", () => {
  it("returns the default when no limit is given", () => {
    expect(parsePaginationLimit(new URLSearchParams(), OPTS)).toBe(12);
  });

  it("parses a valid limit", () => {
    expect(parsePaginationLimit(new URLSearchParams("limit=5"), OPTS)).toBe(5);
  });

  it("caps at maxLimit", () => {
    expect(parsePaginationLimit(new URLSearchParams("limit=9999"), OPTS)).toBe(50);
  });

  it("falls back to default for zero, negative, or non-numeric values", () => {
    expect(parsePaginationLimit(new URLSearchParams("limit=0"), OPTS)).toBe(12);
    expect(parsePaginationLimit(new URLSearchParams("limit=-5"), OPTS)).toBe(12);
    expect(parsePaginationLimit(new URLSearchParams("limit=abc"), OPTS)).toBe(12);
  });
});

describe("parsePaginationOffset", () => {
  it("returns 0 when no offset is given", () => {
    expect(parsePaginationOffset(new URLSearchParams())).toBe(0);
  });

  it("parses a valid offset", () => {
    expect(parsePaginationOffset(new URLSearchParams("offset=24"))).toBe(24);
  });

  it("falls back to 0 for negative or non-numeric values", () => {
    expect(parsePaginationOffset(new URLSearchParams("offset=-1"))).toBe(0);
    expect(parsePaginationOffset(new URLSearchParams("offset=abc"))).toBe(0);
  });
});
