// Récupère sur Wikisource le texte des poèmes listés dans classics-list.mjs et
// écrit data/classics.json. À relire avant de le charger en base.
//   node scripts/fetch-classics.mjs
// Wikisource : textes du domaine public ; la mise en page éditoriale est sous
// CC BY-SA, d'où le lien de source conservé sur chaque poème.

import { mkdirSync, writeFileSync } from "node:fs";

import { AUTHORS, CLASSICS, REFERENCES } from "./classics-list.mjs";

const API = "https://fr.wikisource.org/w/api.php";
const UA = "Boeme/0.1 (mahounaamg@gmail.com)";
const norm = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/[’‘]/g, "'").toLowerCase();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", formatversion: "2", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const ENTITIES = { "&#160;": " ", "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#32;": " " };

function htmlToText(html) {
  return html
    .replace(/\r?\n/g, "")
    .replace(/<sup[\s\S]*?<\/sup>/g, "")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/p>\s*<p[^>]*>/g, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#\d+;|&\w+;/g, (m) => ENTITIES[m] ?? (m.startsWith("&#") ? String.fromCodePoint(Number(m.slice(2, -1))) : m))
    .replace(/[﻿​]/g, "")
    .split("\n")
    .map((line) => line.trim())
    .join("\n");
}

// Un poème peut être coupé en plusieurs blocs (changement de page dans l'édition) :
// on les recolle, et un bloc qui commence par une ligne vide reste une nouvelle strophe.
function extractPoem(html) {
  const blocks = [];
  const re = /<div[^>]*class="[^"]*\bpoem\b[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(html))) blocks.push(htmlToText(m[1]));
  return blocks.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

const results = [];
const failures = [];

for (const item of CLASSICS) {
  try {
    let hit;
    if (item.page) hit = { title: item.page };
    else {
      const found = await api({ action: "query", list: "search", srsearch: item.q, srlimit: "15", srnamespace: "0" });
      hit = found.query.search.find((r) => norm(r.title).startsWith(norm(item.prefix)) && norm(r.title).includes(norm(item.title.replace(/…$/, "").slice(0, 14))));
    }
    if (!hit) throw new Error("aucune page correspondante");
    const parsed = await api({ action: "parse", page: hit.title, prop: "text", disableeditsection: "1" });
    const body = extractPoem(parsed.parse.text);
    if (body.length < 60) throw new Error(`texte trop court (${body.length})`);
    if (body.length > 6000) throw new Error(`texte trop long (${body.length})`);
    results.push({ ...item, body, wikisourceTitle: hit.title, url: `https://fr.wikisource.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, "_"))}` });
    console.log("ok  ", item.author, "—", item.title, `(${body.length} car.) ←`, hit.title);
  } catch (error) {
    failures.push({ title: item.title, author: item.author, error: String(error.message ?? error) });
    console.log("FAIL", item.author, "—", item.title, ":", error.message ?? error);
  }
  await sleep(250);
}

const refs = [];
for (const ref of REFERENCES) {
  const res = await fetch(ref.url, { method: "HEAD", redirect: "follow", headers: { "User-Agent": UA } }).catch(() => null);
  if (res?.ok) { refs.push(ref); console.log("ok   ref", ref.title); }
  else { failures.push({ title: ref.title, author: ref.author, error: `lien ${res?.status ?? "injoignable"}` }); console.log("FAIL ref", ref.title, res?.status); }
  await sleep(250);
}

mkdirSync("data", { recursive: true });
writeFileSync("data/classics.json", JSON.stringify({ authors: AUTHORS, classics: results, references: refs, fetchedAt: new Date().toISOString() }, null, 1) + "\n");
console.log(`\n${results.length}/${CLASSICS.length} poèmes, ${refs.length}/${REFERENCES.length} références ; ${failures.length} échecs.`);
