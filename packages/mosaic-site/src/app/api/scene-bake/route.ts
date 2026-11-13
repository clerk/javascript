import { mkdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

import { NextResponse } from 'next/server';

type Sharp = (
  input: Buffer,
  options: { raw: { width: number; height: number; channels: 1 | 2 | 3 | 4 } },
) => { webp: (options: Record<string, number | boolean>) => { toBuffer: () => Promise<Buffer> } };

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, 'public', 'mosaic');
const META_FILE = join(ROOT, 'src', 'components', 'marketing', 'mosaic-bake.json');
const FILES = new Set(['mask.webp', 'surface.webp', 'skeleton.webp', 'reveal.webp', 'meta']);

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(bytes: Buffer) {
  let c = 0xffffffff;
  for (const byte of bytes) {
    c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(data: Uint8Array, width: number, height: number, channels: number) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = { 1: 0, 2: 4, 3: 2, 4: 6 }[channels] ?? 6;
  const rowBytes = width * channels;
  const raw = Buffer.alloc((rowBytes + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (rowBytes + 1);
    raw[row] = 1;
    for (let x = 0; x < rowBytes; x += 1) {
      const left = x >= channels ? data[y * rowBytes + x - channels] : 0;
      raw[row + 1 + x] = (data[y * rowBytes + x] - left) & 0xff;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function encodeWebp(data: Uint8Array, width: number, height: number, channels: 1 | 2 | 3 | 4, lossless: boolean) {
  const moduleApi = process.getBuiltinModule('node:module');
  const fromSite = moduleApi.createRequire(join(ROOT, 'package.json'));
  const fromNext = moduleApi.createRequire(fromSite.resolve('next/package.json'));
  const sharp = fromNext('sharp') as Sharp;
  return sharp(Buffer.from(data), { raw: { width, height, channels } })
    .webp(
      lossless ? { lossless: true, effort: 6 } : { quality: 92, smartSubsample: true, alphaQuality: 100, effort: 6 },
    )
    .toBuffer();
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not found', { status: 404 });
  }
  const params = new URL(request.url).searchParams;
  const file = params.get('file') ?? '';
  if (!FILES.has(file)) {
    return new NextResponse('Unknown file', { status: 400 });
  }
  if (file === 'meta') {
    await writeFile(META_FILE, `${await request.text()}\n`);
    return NextResponse.json({ file: META_FILE, bytes: (await stat(META_FILE)).size });
  }
  const width = Number(params.get('width'));
  const height = Number(params.get('height'));
  const requested = Number(params.get('channels'));
  const channels = requested === 1 || requested === 2 || requested === 3 ? requested : 4;
  const data = new Uint8Array(await request.arrayBuffer());
  if (data.length !== width * height * channels) {
    return new NextResponse('Size mismatch', { status: 400 });
  }
  await mkdir(PUBLIC_DIR, { recursive: true });
  const target = join(PUBLIC_DIR, file);
  const bytes = file.endsWith('.png')
    ? encodePng(data, width, height, channels)
    : await encodeWebp(data, width, height, channels, file === 'mask.webp' || file === 'skeleton.webp');
  await writeFile(target, bytes);
  return NextResponse.json({ file: target, bytes: bytes.length });
}
