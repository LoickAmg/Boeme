import { afterEach, describe, expect, it, vi } from "vitest";

import type { GeneratePoemInput } from "./types";

const INPUT: GeneratePoemInput = {
  language: "fr",
  theme: "apaisant",
  structure: "haiku",
  length: "court",
};

vi.mock("./llm", () => ({
  isLlmConfigured: vi.fn(),
  generateLlmPoem: vi.fn(),
}));

afterEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe("generatePoem (orchestrator)", () => {
  it("uses the homemade generator directly when the LLM is not configured", async () => {
    const llm = await import("./llm");
    vi.mocked(llm.isLlmConfigured).mockReturnValue(false);

    const { generatePoem } = await import("./index");
    const poem = await generatePoem(INPUT);

    expect(poem.source).toBe("maison");
    expect(llm.generateLlmPoem).not.toHaveBeenCalled();
  });

  it("uses the LLM result when configured and successful", async () => {
    const llm = await import("./llm");
    vi.mocked(llm.isLlmConfigured).mockReturnValue(true);
    vi.mocked(llm.generateLlmPoem).mockResolvedValue({ content: "Poème IA.", source: "llm" });

    const { generatePoem } = await import("./index");
    const poem = await generatePoem(INPUT);

    expect(poem).toEqual({ content: "Poème IA.", source: "llm" });
  });

  it("falls back to the homemade generator when the LLM call fails", async () => {
    const llm = await import("./llm");
    vi.mocked(llm.isLlmConfigured).mockReturnValue(true);
    vi.mocked(llm.generateLlmPoem).mockRejectedValue(new Error("boom"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { generatePoem } = await import("./index");
    const poem = await generatePoem(INPUT);

    expect(poem.source).toBe("maison");
    expect(warnSpy).toHaveBeenCalled();
  });
});
