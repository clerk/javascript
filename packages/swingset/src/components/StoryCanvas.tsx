'use client';

import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';
import type { MosaicVariables } from '@clerk/ui/mosaic/variables';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateKnobs, initKnobValues } from '@/lib/generateKnobs';
import { findStory } from '@/lib/registry';
import type { KnobRecord, KnobValues } from '@/lib/types';

import { KnobPanel } from './KnobPanel';
import { VariablesPanel } from './VariablesPanel';

interface StoryCanvasProps {
  componentSlug: string;
  storySlug: string;
}

export function StoryCanvas({ componentSlug, storySlug }: StoryCanvasProps) {
  const found = findStory(componentSlug, storySlug);

  // Derive knobs from the slug primitives — `found` is a fresh object every render, so depending
  // on it (in the effect below) would reset state on every render and loop until React bails out.
  const knobs = useMemo<KnobRecord>(() => {
    const entry = findStory(componentSlug, storySlug);
    return entry ? generateKnobs(entry.mod.meta) : {};
  }, [componentSlug, storySlug]);

  const [knobValues, setKnobValues] = useState<KnobValues>(() => initKnobValues(knobs));
  const [variables, setVariables] = useState<MosaicVariables>({});

  // Reset knob values when the active story (and therefore its knobs) changes.
  useEffect(() => {
    setKnobValues(initKnobValues(knobs));
  }, [knobs]);

  if (!found) {
    return <div className='text-muted-foreground p-8 text-sm'>Story not found.</div>;
  }

  const StoryComp = found.mod[found.storyName] as React.ComponentType<Record<string, unknown>>;

  return (
    <div className='flex h-full'>
      <div className='flex flex-1 flex-col overflow-hidden'>
        <div className='flex flex-1 items-center justify-center overflow-auto p-12'>
          <MosaicProvider variables={variables}>
            <StoryComp {...knobValues} />
          </MosaicProvider>
        </div>
      </div>

      <div className='flex w-72 shrink-0 flex-col overflow-hidden border-l'>
        <Tabs
          defaultValue='knobs'
          className='flex flex-1 flex-col overflow-hidden'
        >
          <TabsList
            variant='line'
            className='h-10 w-full rounded-none border-b px-3'
          >
            <TabsTrigger value='knobs'>Knobs</TabsTrigger>
            <TabsTrigger value='variables'>Variables</TabsTrigger>
          </TabsList>
          <TabsContent
            value='knobs'
            className='overflow-y-auto'
          >
            <KnobPanel
              knobs={knobs}
              values={knobValues}
              onChange={setKnobValues}
            />
          </TabsContent>
          <TabsContent
            value='variables'
            className='overflow-y-auto'
          >
            <VariablesPanel
              variables={variables}
              onChange={setVariables}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
