import { beforeEach, describe, expect, it, vi } from "vitest";

const insertedRows: unknown[] = [];
let recentCount = 0;

vi.mock("@/db", () => ({
  getDb: () => ({
    insert: () => ({
      values: (row: unknown) => ({
        returning: async () => {
          insertedRows.push(row);
          return [{ id: insertedRows.length, ...(row as object) }];
        },
      }),
    }),
  }),
}));

vi.mock("@/db/queries", () => ({
  countPoemsSince: async () => recentCount,
  getRecentPoems: async () => ({ poems: [], hasMore: false }),
}));

vi.mock("@/lib/poetry", () => ({
  generatePoem: async () => ({ content: "un vers", source: "maison" }),
}));

const { POST } = await import("./route");

function generate(ip: string) {
  return POST(
    new Request("https://poems.test/api/poems", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ language: "fr", theme: "tendre", structure: "vers_libre", length: "moyen" }),
    }),
  );
}

beforeEach(() => {
  insertedRows.length = 0;
  recentCount = 0;
  delete process.env.POEM_GLOBAL_HOURLY_LIMIT;
});

describe("POST /api/poems : protection contre l'abus", () => {
  it("génère et publie un poème dans le cas normal", async () => {
    const response = await generate("203.0.113.10");
    expect(response.status).toBe(201);
    expect(insertedRows).toHaveLength(1);
  });

  it("bloque une même adresse après 8 générations, avec Retry-After", async () => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      expect((await generate("203.0.113.20")).status).toBe(201);
    }
    const blocked = await generate("203.0.113.20");
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(insertedRows).toHaveLength(8);

    expect((await generate("203.0.113.21")).status).toBe(201);
  });

  it("applique un plafond global horaire quelle que soit l'adresse", async () => {
    recentCount = 120;
    const response = await generate("203.0.113.30");
    expect(response.status).toBe(429);
    expect(insertedRows).toHaveLength(0);
  });

  it("lit le plafond global dans POEM_GLOBAL_HOURLY_LIMIT", async () => {
    process.env.POEM_GLOBAL_HOURLY_LIMIT = "5";
    recentCount = 5;
    expect((await generate("203.0.113.40")).status).toBe(429);
    recentCount = 4;
    expect((await generate("203.0.113.41")).status).toBe(201);
  });

  it("rejette une entrée invalide sans consommer de quota", async () => {
    const response = await POST(
      new Request("https://poems.test/api/poems", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: "xx" }),
      }),
    );
    expect(response.status).toBe(400);
  });
});
