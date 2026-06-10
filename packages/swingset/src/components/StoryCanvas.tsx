'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { MosaicProvider } from '@clerk/ui/mosaic/MosaicProvider';
import type { MosaicVariables } from '@clerk/ui/mosaic/variables';

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

  const [knobs, setKnobs] = useState<KnobRecord>(() => (found ? generateKnobs(found.mod.meta) : {}));
  const [knobValues, setKnobValues] = useState<KnobValues>(() => initKnobValues(knobs));
  const [variables, setVariables] = useState<MosaicVariables>({});

  useEffect(() => {
    if (!found) return;
    const nextKnobs = generateKnobs(found.mod.meta);
    setKnobs(nextKnobs);
    setKnobValues(initKnobValues(nextKnobs));
  }, [componentSlug, storySlug]);

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
