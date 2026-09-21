import { describe, expect, it } from "vitest";

import { clientIpFrom } from "./clientIp";

describe("clientIpFrom", () => {
  it("prend la première adresse de X-Forwarded-For", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
    expect(clientIpFrom(headers)).toBe("203.0.113.7");
  });

  it("se rabat sur X-Real-IP puis sur une valeur neutre", () => {
    expect(clientIpFrom(new Headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    expect(clientIpFrom(new Headers())).toBe("unknown");
  });
});
