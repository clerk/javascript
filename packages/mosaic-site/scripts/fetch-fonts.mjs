import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FONTS = [{ blob: 'fonts/timeless-sans.woff2', file: 'public/fonts/timeless-sans.woff2' }];
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const missing = FONTS.filter(font => !existsSync(path.join(root, font.file)));
if (missing.length === 0) {
  process.exit(0);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.warn(
    `Skipping licensed fonts (${missing.map(font => font.file).join(', ')}): BLOB_READ_WRITE_TOKEN is not set, so the site falls back to the system font.`,
  );
  process.exit(0);
}

const { get } = await import('@vercel/blob');
for (const font of missing) {
  const result = await get(font.blob, { access: 'private' });
  if (!result) {
    throw new Error(`Font ${font.blob} is missing from the Blob store`);
  }
  const target = path.join(root, font.file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await new Response(result.stream).arrayBuffer()));
  console.log(`Fetched ${font.file}`);
}
