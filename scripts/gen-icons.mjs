// Rasterize brand SVGs → PNG icons for Android/iOS launchers.
// Run: node scripts/gen-icons.mjs
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
import { mkdir } from "fs/promises";

const PUB = new URL("../public/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

await mkdir(`${PUB}icons`, { recursive: true });

const anySvg = `${PUB}icon.svg`; // rounded-square, transparent corners
const maskSvg = `${PUB}icon-maskable.svg`; // full-bleed, art in 80% safe zone

const jobs = [
  { in: anySvg, size: 192, out: `${PUB}icons/icon-192.png` },
  { in: anySvg, size: 512, out: `${PUB}icons/icon-512.png` },
  { in: maskSvg, size: 192, out: `${PUB}icons/icon-maskable-192.png` },
  { in: maskSvg, size: 512, out: `${PUB}icons/icon-maskable-512.png` },
  { in: maskSvg, size: 180, out: `${PUB}icons/apple-touch-icon.png` }, // iOS: opaque, square
];

for (const j of jobs) {
  await sharp(j.in, { density: 300 })
    .resize(j.size, j.size)
    .png()
    .toFile(j.out);
  console.log("wrote", j.out, `${j.size}x${j.size}`);
}
console.log("done");
