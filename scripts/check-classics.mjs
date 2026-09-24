// Contrôle rapide de data/classics.json : échantillons et anomalies de nettoyage.
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("data/classics.json", "utf8"));

for (const title of ["Le temps a laissé son manteau", "Mignonne, allons voir si la rose", "Chanson d'automne", "Le Pont Mirabeau"]) {
  const poem = data.classics.find((p) => p.title === title);
  console.log(`=== ${title}\n${poem?.body.slice(0, 420) ?? "(absent)"}\n`);
}

const suspects = data.classics.filter((p) => /[<>]|&\w+;|\[\d+\]|\{\{/.test(p.body));
console.log("suspects :", suspects.map((p) => p.title));
console.log("plus longs :", data.classics.map((p) => p.body.length).sort((a, b) => b - a).slice(0, 4));
