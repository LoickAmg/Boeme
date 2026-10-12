import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // PGlite (base embarquée du développement) charge ses fichiers WebAssembly par URL : il ne doit pas être empaqueté.
  serverExternalPackages: ["@electric-sql/pglite"],
  // La bibliothèque est lue depuis data/classics.json au chargement de la base.
  // Les images d'aperçu des liens lisent leurs polices dans assets/og.
  outputFileTracingIncludes: { "/*": ["./data/classics.json"], "/**": ["./assets/og/*.woff"] },
  turbopack: { root: path.resolve(import.meta.dirname) },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
