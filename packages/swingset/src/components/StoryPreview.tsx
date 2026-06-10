'use client';

import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';
import { RotateCcwIcon, SlidersHorizontalIcon } from 'lucide-react';
import type React from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { generateKnobs, initKnobValues } from '@/lib/generateKnobs';
import type { StoryModule } from '@/lib/types';

import { usePlayground } from './PlaygroundContext';
import { VariablesPanel } from './VariablesPanel';

interface StoryPreviewProps {
  name: string;
  storyModule: StoryModule;
}

/**
 * Interactive preview embedded in a component's MDX overview. Renders the named story
 * inside `MosaicProvider`; its props are driven by the shared playground state, which is
 * edited through the controls in the `<PropTable>` below it. A collapsible `VariablesPanel`
 * attached to the preview overrides Mosaic design tokens to re-theme it live.
 */
export function StoryPreview({ name, storyModule }: StoryPreviewProps) {
  const StoryComp = storyModule[name] as React.ComponentType<Record<string, unknown>>;
  const playground = usePlayground();

  if (!StoryComp) {
    return (
      <div className='not-prose rounded bg-red-50 p-3 text-sm text-red-500'>Story &quot;{name}&quot; not found</div>
    );
  }

  // Fall back to the story's own defaults if rendered outside a PlaygroundProvider.
  const values = playground?.values ?? initKnobValues(generateKnobs(storyModule.meta));
  const variables = playground?.variables ?? {};

  return (
    <Collapsible className='not-prose border-border bg-background my-4 overflow-hidden rounded-lg border'>
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
        <MosaicProvider variables={variables}>
          <StoryComp {...values} />
        </MosaicProvider>
      </div>

      <div className='flex items-center justify-start border-t px-2 py-1.5'>
        <CollapsibleTrigger className='text-muted-foreground hover:text-foreground flex items-center gap-1 rounded px-2 py-1 text-xs'>
          <SlidersHorizontalIcon className='size-3' />
          Variables
        </CollapsibleTrigger>
      </div>

      {playground ? (
        <CollapsibleContent className='border-t'>
          <VariablesPanel
            variables={playground.variables}
            onChange={playground.setVariables}
          />
        </CollapsibleContent>
      ) : null}
    </Collapsible>
  );
}
