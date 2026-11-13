import { Stepper } from '@clerk/mosaic/components/stepper';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './stepper.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  status: 'wip',
  title: 'Stepper',
  source: 'packages/mosaic/src/components/stepper/stepper.tsx',
};

export function Primary() {
  return (
    <Stepper
      value={1}
      max={3}
    />
  );
}

export function Progress() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Stepper
        value={1}
        max={3}
      />
      <Stepper
        value={2}
        max={3}
      />
      <Stepper
        value={3}
        max={3}
      />
    </div>
  );
}

export function Clickable() {
  const [step, setStep] = useState(1);
  return (
    <Stepper
      value={step}
      max={4}
      onValueChange={setStep}
    />
  );
}
