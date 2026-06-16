'use client';

import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';
import { Layers2Icon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { generateKnobs, initKnobValues } from '@/lib/generateKnobs';
import type { StoryModule } from '@/lib/types';

import type { CompositionPiece } from './Composition';
import { CompositionPanel } from './Composition';

interface StoryEmbedProps {
  name: string;
  storyModule: StoryModule;
  /** When provided, a collapsible "Composition" footer is attached to the example card. */
  composition?: CompositionPiece[];
}

export function StoryEmbed({ name, storyModule, composition }: StoryEmbedProps) {
  const StoryComp = storyModule[name] as React.ComponentType<Record<string, unknown>>;
  const [compositionOpen, setCompositionOpen] = useState(false);

  if (!StoryComp) {
    return <div className='rounded bg-red-50 p-3 text-sm text-red-500'>Story &quot;{name}&quot; not found</div>;
  }

  const knobs = generateKnobs(storyModule.meta);
  const defaultValues = initKnobValues(knobs);

  const preview = (
    <div className='flex min-h-20 items-center justify-center p-6'>
      <MosaicProvider>
        <StoryComp {...defaultValues} />
      </MosaicProvider>
    </div>
  );

  if (!composition) {
    return <div className='not-prose border-border bg-background my-4 rounded-lg border'>{preview}</div>;
  }

  return (
    <Collapsible
      open={compositionOpen}
      onOpenChange={setCompositionOpen}
      className='not-prose border-border bg-background my-4 overflow-hidden rounded-lg border'
    >
      {preview}

      <div className='flex items-center justify-start gap-1 border-t px-2 py-1.5'>
        <CollapsibleTrigger className='text-muted-foreground hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground flex items-center gap-1 rounded px-2 py-1 text-xs'>
          <Layers2Icon className='size-3' />
          Composition
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className='border-t'>
        <CompositionPanel pieces={composition} />
      </CollapsibleContent>
    </Collapsible>
  );
}
