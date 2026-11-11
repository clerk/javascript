'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useInView } from 'motion/react';
import * as React from 'react';

import { STORY_LOADERS } from '@/components/catalog/story-loaders';
import { ScaledFrame } from '@/components/gallery/scaled-frame';

const PREFERRED = ['Default', 'Primary', 'Colors'];
type StoryComponent = React.ComponentType<Record<string, unknown>>;
export function StoryThumb({ file, className }: { file: string; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '200px' });
  const [Story, setStory] = React.useState<StoryComponent | null>(null);
  React.useEffect(() => {
    if (!seen) {
      return;
    }
    let cancelled = false;
    void STORY_LOADERS[file]?.().then(module => {
      if (cancelled) {
        return;
      }
      const names = Object.keys(module).filter(
        name => name !== 'meta' && name !== '__source' && typeof module[name] === 'function',
      );
      const name = PREFERRED.find(preferred => names.includes(preferred)) ?? names[0];
      if (name) {
        setStory(() => module[name] as StoryComponent);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [file, seen]);
  return (
    <div
      ref={ref}
      className={className}
    >
      <MosaicProvider>
        <ScaledFrame
          width={560}
          center
          className='aspect-[16/10] w-full bg-[var(--cl-color-page,#fff)]'
        >
          {Story ? <Story /> : null}
        </ScaledFrame>
      </MosaicProvider>
    </div>
  );
}
