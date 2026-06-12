'use client';

import type { MosaicVariables } from '@clerk/ui/mosaic/variables';
import type React from 'react';
import { createContext, useContext, useMemo, useState } from 'react';

import { generateKnobs, initKnobValues } from '@/lib/generateKnobs';
import type { KnobRecord, KnobValues, StoryMeta } from '@/lib/types';

interface PlaygroundContextValue {
  /** Knob definitions derived from the component's CVA `_variants`. */
  knobs: KnobRecord;
  /** Current value for each knob (props passed into the live preview). */
  values: KnobValues;
  setValue: (key: string, value: KnobValues[string]) => void;
  /** Live Mosaic design-token overrides applied via `MosaicProvider`. */
  variables: MosaicVariables;
  setVariables: (variables: MosaicVariables) => void;
  /** Restore every knob to its default and clear variable overrides. */
  reset: () => void;
}

const PlaygroundContext = createContext<PlaygroundContextValue | null>(null);

/**
 * Holds the shared playground state for a single component's overview page. The
 * `<Preview>` reads it to render the live component while `<PropTable>` renders the
 * matching interactive controls, so editing a prop's value updates the preview.
 */
export function PlaygroundProvider({ meta, children }: { meta?: StoryMeta; children: React.ReactNode }) {
  const knobs = useMemo(() => (meta ? generateKnobs(meta) : {}), [meta]);
  const [values, setValues] = useState<KnobValues>(() => initKnobValues(knobs));
  const [variables, setVariables] = useState<MosaicVariables>({});

  const value = useMemo<PlaygroundContextValue>(
    () => ({
      knobs,
      values,
      setValue: (key, v) => setValues(prev => ({ ...prev, [key]: v })),
      variables,
      setVariables,
      reset: () => {
        setValues(initKnobValues(knobs));
        setVariables({});
      },
    }),
    [knobs, values, variables],
  );

  return <PlaygroundContext.Provider value={value}>{children}</PlaygroundContext.Provider>;
}

export function usePlayground(): PlaygroundContextValue | null {
  return useContext(PlaygroundContext);
}
