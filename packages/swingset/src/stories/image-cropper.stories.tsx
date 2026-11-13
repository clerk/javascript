import { type Crop, cropImage, ImageCropper, INITIAL_CROP } from '@clerk/mosaic/primitives/image-cropper';
import { useEffect, useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Primitives',
  status: 'stable',
  title: 'ImageCropper',
  label: 'Image Cropper',
  source: 'packages/mosaic/src/primitives/image-cropper/index.ts',
};

const SAMPLE = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6c47ff"/><stop offset="1" stop-color="#ffb547"/></linearGradient></defs>
    <rect width="640" height="400" fill="url(#g)"/>
    <circle cx="320" cy="200" r="90" fill="#fff" fill-opacity="0.85"/>
    <text x="320" y="214" font-family="sans-serif" font-size="40" text-anchor="middle">top</text>
  </svg>`,
)}`;

export function Default() {
  const [crop, setCrop] = useState<Crop>(INITIAL_CROP);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (result) {
        URL.revokeObjectURL(result);
      }
    };
  }, [result]);

  return (
    <div>
      <ImageCropper.Root
        src={SAMPLE}
        value={crop}
        onValueChange={setCrop}
      >
        <ImageCropper.Viewport
          aria-label='Crop. Drag or use the arrow keys to move, plus and minus to zoom.'
          style={{ position: 'relative', overflow: 'hidden', width: 240, height: 240 }}
        >
          <ImageCropper.Image />
        </ImageCropper.Viewport>
        <div>
          <ImageCropper.ZoomOut aria-label='Zoom out'>−</ImageCropper.ZoomOut>
          <ImageCropper.Zoom aria-label='Zoom' />
          <ImageCropper.ZoomIn aria-label='Zoom in'>+</ImageCropper.ZoomIn>
          <ImageCropper.Rotate>Rotate</ImageCropper.Rotate>
          <ImageCropper.Reset>Reset</ImageCropper.Reset>
          <button
            type='button'
            onClick={() => {
              void cropImage(SAMPLE, crop, { type: 'image/png', size: () => 128 }).then(blob =>
                setResult(URL.createObjectURL(blob)),
              );
            }}
          >
            Crop
          </button>
        </div>
      </ImageCropper.Root>
      {result ? (
        <img
          src={result}
          alt='Cropped result'
          width={128}
          height={128}
        />
      ) : null}
    </div>
  );
}
