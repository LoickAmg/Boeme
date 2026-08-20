import { describe, expect, it } from "vitest";

import { parseGeneratePoemInput } from "./validate";

describe("parseGeneratePoemInput", () => {
  it("accepts a fully valid payload", () => {
    const result = parseGeneratePoemInput({
      language: "fr",
      theme: "tendre",
      structure: "haiku",
      length: "court",
    });
    expect(result).toEqual({
      language: "fr",
      theme: "tendre",
      structure: "haiku",
      length: "court",
    });
  });

  it("rejects a non-object body", () => {
    expect(parseGeneratePoemInput(null)).toBeNull();
    expect(parseGeneratePoemInput("fr")).toBeNull();
    expect(parseGeneratePoemInput(42)).toBeNull();
    expect(parseGeneratePoemInput(undefined)).toBeNull();
  });

  it("rejects an unknown language", () => {
    expect(
      parseGeneratePoemInput({ language: "de", theme: "tendre", structure: "haiku", length: "court" }),
    ).toBeNull();
  });

  it("rejects an unknown theme (not from the curated list — abuse prevention)", () => {
    expect(
      parseGeneratePoemInput({
        language: "fr",
        theme: "<script>alert(1)</script>",
        structure: "haiku",
        length: "court",
      }),
    ).toBeNull();
  });

  it("rejects an unknown structure", () => {
    expect(
      parseGeneratePoemInput({ language: "fr", theme: "tendre", structure: "sonnet", length: "court" }),
    ).toBeNull();
  });

  it("rejects an unknown length", () => {
    expect(
      parseGeneratePoemInput({ language: "fr", theme: "tendre", structure: "haiku", length: "epic" }),
    ).toBeNull();
  });

  it("rejects a payload missing a field", () => {
    expect(parseGeneratePoemInput({ language: "fr", theme: "tendre", structure: "haiku" })).toBeNull();
  });
});
