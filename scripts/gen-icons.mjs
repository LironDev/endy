/**
 * Generates icon-192.png and icon-512.png from public/favicon.svg
 * Run with: node scripts/gen-icons.mjs
 * Requires: npm install --save-dev sharp
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const svgBuffer = readFileSync(join(root, 'public', 'favicon.svg'));

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

for (const { size, name } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(root, 'public', name));
  console.log(`✅ Generated public/${name} (${size}×${size})`);
}

console.log('🎉 All icons generated!');
