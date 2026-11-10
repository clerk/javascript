import * as React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { BigTileArt } from '@/components/marketing/big-tile-wall';
import { PALETTE } from '@/lib/brand/tile-palettes';

const SIZE = 1024;

function Sheet({ design }: { design: string }) {
  const palette = PALETTE;
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 200 200'
      width={SIZE}
      height={SIZE}
    >
      <rect
        width='200'
        height='200'
        fill={palette.paper}
      />
      <BigTileArt
        design={design}
        id='texture'
      />
    </svg>
  );
}

export async function renderDesign(design: string): Promise<HTMLCanvasElement> {
  await new Promise<void>(resolve => setTimeout(resolve, 0));
  const host = document.createElement('div');
  const root = createRoot(host);
  flushSync(() => root.render(<Sheet design={design} />));
  const markup = host.innerHTML;
  root.unmount();
  const image = new Image();
  image.decoding = 'async';
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('Tile texture failed to load'));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  });
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  canvas.getContext('2d')?.drawImage(image, 0, 0, SIZE, SIZE);
  return canvas;
}
