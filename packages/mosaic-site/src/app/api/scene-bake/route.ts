import { mkdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { NextResponse } from 'next/server';

type Sharp = (
  input: Buffer,
  options: { raw: { width: number; height: number; channels: 1 | 2 | 3 | 4 } },
) => { webp: (options: Record<string, number | boolean>) => { toBuffer: () => Promise<Buffer> } };

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, 'public', 'mosaic');
const META_FILES: Record<string, string> = {
  meta: join(ROOT, 'src', 'components', 'marketing', 'mosaic-bake.json'),
  'meta-mobile': join(ROOT, 'src', 'components', 'marketing', 'mosaic-bake-mobile.json'),
};
const IMAGES = ['mask', 'surface', 'skeleton', 'reveal'];
const FILES = new Set([...IMAGES.flatMap(name => [`${name}.webp`, `${name}-mobile.webp`]), ...Object.keys(META_FILES)]);
const LOSSLESS = new Set(['mask.webp', 'skeleton.webp', 'mask-mobile.webp', 'skeleton-mobile.webp']);

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

function isLocalRequest(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) {
    return false;
  }
  try {
    return LOCAL_HOSTS.has(new URL(origin).hostname) && LOCAL_HOSTS.has(new URL(`http://${host}`).hostname);
  } catch {
    return false;
  }
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
  if (!isLocalRequest(request)) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  const params = new URL(request.url).searchParams;
  const file = params.get('file') ?? '';
  if (!FILES.has(file)) {
    return new NextResponse('Unknown file', { status: 400 });
  }
  const metaFile = META_FILES[file];
  if (metaFile) {
    await writeFile(metaFile, `${await request.text()}\n`);
    return NextResponse.json({ file: metaFile, bytes: (await stat(metaFile)).size });
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
  const bytes = await encodeWebp(data, width, height, channels, LOSSLESS.has(file));
  await writeFile(target, bytes);
  return NextResponse.json({ file: target, bytes: bytes.length });
}
