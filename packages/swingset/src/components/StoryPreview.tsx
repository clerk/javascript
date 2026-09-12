'use client';

import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';
import { RotateCcwIcon } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

import { generateKnobs, initKnobValues } from '@/lib/generateKnobs';
import type { StoryModule } from '@/lib/types';

import { usePlayground } from './PlaygroundContext';

interface StoryPreviewProps {
  name: string;
  storyModule: StoryModule;
}

/**
 * Interactive preview embedded in a component's MDX overview. Renders the named story
 * inside `MosaicProvider`; its props are driven by the shared playground state, which is
 * edited through the controls in the `<PropTable>` below it.
 */
export function StoryPreview({ name, storyModule }: StoryPreviewProps) {
  const StoryComp = storyModule[name] as React.ComponentType<Record<string, unknown>>;
  const playground = usePlayground();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!StoryComp) {
    return (
      <div className='not-prose rounded bg-red-50 p-3 text-sm text-red-500'>Story &quot;{name}&quot; not found</div>
    );
  }

  // Fall back to the story's own defaults if rendered outside a PlaygroundProvider.
  const values = playground?.values ?? initKnobValues(generateKnobs(storyModule.meta));

  return (
    <div className='not-prose border-border bg-background my-4 overflow-hidden rounded-lg border'>
      <div className='flex items-center justify-end border-b px-2 py-1.5'>
        <button
          type='button'
          onClick={() => playground?.reset()}
          disabled={!playground}
          className='text-muted-foreground hover:text-foreground flex items-center gap-1 rounded px-2 py-1 text-xs disabled:opacity-50'
        >
          <RotateCcwIcon className='size-3' />
          Reset
        </button>
      </div>

      <div className='flex min-h-40 items-center justify-center p-10'>
        {mounted && (
          <MosaicProvider>
            <StoryComp {...values} />
          </MosaicProvider>
        )}
      </div>
    </div>
  );
}
