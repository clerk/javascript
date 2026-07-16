'use client';

import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';
import { Layers2Icon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toUsageSnippet } from '@/lib/exampleSnippet';
import { extractStorySource } from '@/lib/extractStorySource';
import { generateKnobs, initKnobValues } from '@/lib/generateKnobs';
import type { StoryModule } from '@/lib/types';

import { CodeFooter } from './CodeFooter';
import type { CompositionPiece } from './Composition';
import { CompositionPanel } from './Composition';

interface StoryEmbedProps {
  name: string;
  storyModule: StoryModule;
  /** When provided, a collapsible "Composition" footer is attached to the example card. */
  composition?: CompositionPiece[];
}

/** A collapsible "Composition" footer listing the lower-layer pieces an example composes. */
function CompositionFooter({ composition }: { composition: CompositionPiece[] }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='border-t'
    >
      <div className='flex items-center justify-start gap-1 px-2 py-1.5'>
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

export function StoryEmbed({ name, storyModule, composition }: StoryEmbedProps) {
  const StoryComp = storyModule[name] as React.ComponentType<Record<string, unknown>>;

  if (!StoryComp) {
    return <div className='rounded bg-red-50 p-3 text-sm text-red-500'>Story &quot;{name}&quot; not found</div>;
  }

  const knobs = generateKnobs(storyModule.meta);
  const defaultValues = initKnobValues(knobs);
  // Present only for modules that expose `__source` (see `StoryModule.__source`). The raw
  // story function is a knob harness, so reduce it to a clean usage snippet for the footer.
  const rawSource = extractStorySource(storyModule.__source, name);
  const source = rawSource ? toUsageSnippet(rawSource) : null;

  return (
    <div className='not-prose border-border bg-background my-4 overflow-hidden rounded-lg border'>
      <div className='flex min-h-20 items-center justify-center p-6'>
        <MosaicProvider>
          <StoryComp {...defaultValues} />
        </MosaicProvider>
      </div>

      {source ? <CodeFooter source={source} /> : null}
      {composition ? <CompositionFooter composition={composition} /> : null}
    </div>
  );
}
