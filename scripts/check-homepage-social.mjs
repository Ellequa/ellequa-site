import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';
import sharp from 'sharp';

// Check published HTML and asset bytes, not just the Astro source.
const root = resolve('dist');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
assert.ok(head, 'Homepage must contain a server-rendered head');
const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) =>
  Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value])));
function meta(key) {
  const matches = tags.filter(tag => tag.name === key || tag.property === key);
  assert.equal(matches.length, 1, `Expected exactly one ${key}`);
  assert.ok(matches[0].content, `${key} must not be empty`);
  assert.ok(head.includes(`${key}"`), `${key} must be in initial head`);
  return matches[0].content;
}
assert.equal(meta('twitter:card'), 'summary_large_image');
assert.equal(meta('og:url'), 'https://ellequa.com/');
assert.equal(meta('og:title'), meta('twitter:title'));
assert.equal(meta('og:description'), meta('twitter:description'));
const image = new URL(meta('og:image'));
assert.equal(image.href, meta('twitter:image'), 'Social image URLs must match');
assert.equal(image.origin, 'https://ellequa.com');
const file = resolve(root, '.' + decodeURIComponent(image.pathname));
const path = relative(root, file);
assert.ok(!path.startsWith('..') && !isAbsolute(path), 'Image must be inside dist');
const bytes = await readFile(file);
assert.ok(bytes.length < 5_000_000, 'Social image must stay below 5 MB');
const imageInfo = await sharp(bytes).metadata();
assert.equal(imageInfo.format, 'jpeg');
assert.equal(imageInfo.width, Number(meta('og:image:width')));
assert.equal(imageInfo.height, Number(meta('og:image:height')));
assert.ok(imageInfo.width >= 600 && imageInfo.height >= 314, 'Social image is too small');
await sharp(bytes).raw().toBuffer(); // Fully decode to catch corrupt/truncated image data.
console.log(`Homepage social checks passed: ${imageInfo.width} × ${imageInfo.height} JPEG, ${bytes.length} bytes. This does not verify X ingestion.`);
