'use client';

import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';
import type React from 'react';

import { generateKnobs, initKnobValues } from '@/lib/generateKnobs';
import type { StoryModule } from '@/lib/types';

interface StoryEmbedProps {
  name: string;
  storyModule: StoryModule;
}

export function StoryEmbed({ name, storyModule }: StoryEmbedProps) {
  const StoryComp = storyModule[name] as React.ComponentType<Record<string, unknown>>;
  if (!StoryComp) {
    return <div className='rounded bg-red-50 p-3 text-sm text-red-500'>Story &quot;{name}&quot; not found</div>;
  }

  const knobs = generateKnobs(storyModule.meta);
  const defaultValues = initKnobValues(knobs);

  return (
    <div className='not-prose border-border bg-background my-4 flex min-h-20 items-center justify-center rounded-lg border p-6'>
      <MosaicProvider>
        <StoryComp {...defaultValues} />
      </MosaicProvider>
    </div>
  );
}
