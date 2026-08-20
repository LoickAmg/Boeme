import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateLlmPoem, isLlmConfigured } from "./llm";
import type { GeneratePoemInput } from "./types";

const INPUT: GeneratePoemInput = {
  language: "fr",
  theme: "tendre",
  structure: "vers_libre",
  length: "court",
};

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...originalEnv };
});

afterEach(() => {
  vi.unstubAllGlobals();
  process.env = { ...originalEnv };
});

describe("isLlmConfigured", () => {
  it("is false when no API key is set", () => {
    delete process.env.POEM_LLM_API_KEY;
    expect(isLlmConfigured()).toBe(false);
  });

  it("is true when an API key is set", () => {
    process.env.POEM_LLM_API_KEY = "test-key";
    expect(isLlmConfigured()).toBe(true);
  });
});

describe("generateLlmPoem", () => {
  it("throws immediately when no API key is configured (never calls fetch)", async () => {
    delete process.env.POEM_LLM_API_KEY;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(generateLlmPoem(INPUT)).rejects.toThrow(/POEM_LLM_API_KEY/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns cleaned content with source 'llm' on a successful call", async () => {
    process.env.POEM_LLM_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: '"  Un poème généré.  "' } }],
        }),
      }),
    );

    const poem = await generateLlmPoem(INPUT);
    expect(poem.source).toBe("llm");
    expect(poem.content).toBe("Un poème généré.");
  });

  it("strips a markdown code fence if the model wraps its answer in one", async () => {
    process.env.POEM_LLM_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "```\nLigne un\nLigne deux\n```" } }],
        }),
      }),
    );

    const poem = await generateLlmPoem(INPUT);
    expect(poem.content).toBe("Ligne un\nLigne deux");
  });

  it("throws when the HTTP response is not ok", async () => {
    process.env.POEM_LLM_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));

    await expect(generateLlmPoem(INPUT)).rejects.toThrow(/HTTP 401/);
  });

  it("throws when the response has no usable content", async () => {
    process.env.POEM_LLM_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [] }) }),
    );

    await expect(generateLlmPoem(INPUT)).rejects.toThrow(/sans contenu/);
  });

  it("throws when fetch itself rejects (network error) — caller can fall back", async () => {
    process.env.POEM_LLM_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(generateLlmPoem(INPUT)).rejects.toThrow(/network down/);
  });
});
