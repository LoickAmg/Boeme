import { describe, expect, it } from "vitest";

import { sslOptionFor } from "./index";

describe("sslOptionFor", () => {
  it("désactive TLS uniquement pour une base locale", () => {
    expect(sslOptionFor("postgresql://user:pw@localhost:5432/poems")).toBe(false);
    expect(sslOptionFor("postgresql://user:pw@127.0.0.1/poems")).toBe(false);
    expect(sslOptionFor("postgresql://localhost/poems")).toBe(false);
  });

  it("active TLS avec vérification du certificat pour une base distante", () => {
    expect(sslOptionFor("postgresql://user:pw@ep-cool-123.eu-west-2.aws.neon.tech/poems?sslmode=require")).toBe(true);
    expect(sslOptionFor("postgresql://user:pw@evil-localhost.example.com/poems")).toBe(true);
  });

  it("reste prudent sur une URL illisible", () => {
    expect(sslOptionFor("pas une url")).toBe(true);
  });
});
