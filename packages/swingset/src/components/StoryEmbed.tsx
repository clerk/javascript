'use client';

import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';
import { CodeIcon, Layers2Icon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { extractStorySource } from '@/lib/extractStorySource';
import { generateKnobs, initKnobValues } from '@/lib/generateKnobs';
import type { StoryModule } from '@/lib/types';

import { CodeBlock } from './CodeBlock';
import type { CompositionPiece } from './Composition';
import { CompositionPanel } from './Composition';

interface StoryEmbedProps {
  name: string;
  storyModule: StoryModule;
  /** When provided, a collapsible "Composition" footer is attached to the example card. */
  composition?: CompositionPiece[];
}

/**
 * A collapsible footer attached to an example card — the trigger row plus its revealed panel.
 * Each manages its own open state, so multiple (Code, Composition) can stack independently.
 */
function FooterPanel({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='border-t'
    >
      <div className='flex items-center justify-start gap-1 px-2 py-1.5'>
        <CollapsibleTrigger className='text-muted-foreground hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground flex items-center gap-1 rounded px-2 py-1 text-xs'>
          <Icon className='size-3' />
          {label}
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className='border-t'>{children}</CollapsibleContent>
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
  // The story module exposes its own raw source as `__source` (a `?raw` self-import); pull
  // just this example's function body out of it for the Code footer.
  const code = extractStorySource((storyModule as unknown as { __source?: string }).__source, name);

  const preview = (
    <div className='flex min-h-20 items-center justify-center p-6'>
      <MosaicProvider>
        <StoryComp {...defaultValues} />
      </MosaicProvider>
    </div>
  );

  if (!composition && !code) {
    return <div className='not-prose border-border bg-background my-4 rounded-lg border'>{preview}</div>;
  }

  return (
    <div className='not-prose border-border bg-background my-4 overflow-hidden rounded-lg border'>
      {preview}

      {code ? (
        <FooterPanel
          icon={CodeIcon}
          label='Code'
        >
          <div className='px-3'>
            <CodeBlock className='language-tsx'>{code}</CodeBlock>
          </div>
        </FooterPanel>
      ) : null}

      {composition ? (
        <FooterPanel
          icon={Layers2Icon}
          label='Composition'
        >
          <CompositionPanel pieces={composition} />
        </FooterPanel>
      ) : null}
    </div>
  );
}
