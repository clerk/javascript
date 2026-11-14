import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { chromium } from '@playwright/test';

const { values } = parseArgs({
  options: {
    url: { type: 'string', default: 'http://localhost:6120' },
    out: { type: 'string', default: 'public/og' },
    caption: { type: 'string', default: '' },
    loop: { type: 'string', default: '12' },
    steps: { type: 'string', default: '3' },
    gain: { type: 'string', default: '1.5' },
    ripple: { type: 'string', default: '1' },
    beta: { type: 'string', default: '1' },
    fps: { type: 'string', default: '30' },
  },
});

const IMAGES = [
  { variant: 'og', width: 1200, height: 630 },
  { variant: 'square', width: 630, height: 630 },
];
const VIDEO = { variant: 'video', width: 1280, height: 720 };
const fps = Number(values.fps);
const frames = Math.round(Number(values.loop) * fps);

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function open({ variant, width, height }) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const params = new URLSearchParams({
    variant,
    caption: values.caption,
    loop: values.loop,
    steps: values.steps,
    gain: values.gain,
    ripple: values.ripple,
    beta: values.beta,
  });
  await page.goto(`${values.url}/brand/og/frame?${params}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.ogSetPhase === 'function');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);
  return page;
}

async function shot(page, phase, file) {
  await page.evaluate(value => window.ogSetPhase(value), phase);
  await page.locator('[data-og-frame]').screenshot({ path: file });
}

await mkdir(values.out, { recursive: true });

for (const image of IMAGES) {
  const page = await open(image);
  const file = path.join(values.out, `${image.variant}.png`);
  await shot(page, 0, file);
  await page.close();
  console.log(file);
}

const page = await open(VIDEO);
const dir = await mkdtemp(path.join(tmpdir(), 'og-video-'));
for (let index = 0; index < frames; index++) {
  await shot(page, index / frames, path.join(dir, `${String(index).padStart(4, '0')}.png`));
}
await page.close();
await shot(await open(VIDEO), 0, path.join(values.out, 'video.png'));
const file = path.join(values.out, 'video.mp4');
execFileSync('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-framerate',
  String(fps),
  '-i',
  path.join(dir, '%04d.png'),
  '-c:v',
  'libx264',
  '-pix_fmt',
  'yuv420p',
  '-crf',
  '18',
  '-movflags',
  '+faststart',
  file,
]);
await rm(dir, { recursive: true });
console.log(file);

await browser.close();
