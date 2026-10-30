'use client';

import { Button } from '@clerk/mosaic/components/button';

import type { Showcase } from '../types';

type State = {
  label: string;
  variant: 'filled' | 'outline' | 'ghost';
  color: 'primary' | 'neutral' | 'negative';
};

function View({ state }: { state: State }) {
  return (
    <Button
      data-studio='button'
      variant={state.variant}
      color={state.color}
    >
      {state.label}
    </Button>
  );
}

function code(state: State) {
  return [
    `import { Button } from '@clerk/mosaic/components/button';`,
    ``,
    `export function Save() {`,
    `  return (`,
    `    <Button`,
    `      variant='${state.variant}'`,
    `      color='${state.color}'`,
    `    >`,
    `      ${state.label}`,
    `    </Button>`,
    `  );`,
    `}`,
  ].join('\n');
}

export const buttonVariants: Showcase<State> = {
  slug: 'button-variants',
  title: 'Button variants',
  summary: 'Template demo: a click in the component layout, the code on its own, then edits shown side by side.',
  file: 'app/components/save.tsx',
  initialState: { label: 'Save changes', variant: 'filled', color: 'primary' },
  View,
  code,
  steps: [
    {
      label: 'Click the button',
      layout: 'component',
      duration: 3,
      cursor: [{ at: 0.6, target: '[data-studio="button"]', click: true }],
    },
    { label: 'Show the code', layout: 'code', duration: 3, cursor: [{ at: 0, hide: true }] },
    { label: 'Side by side', layout: 'split', duration: 2.5 },
    { label: 'Outline variant', layout: 'split', duration: 2.5, state: { variant: 'outline' } },
    { label: 'Negative color', layout: 'split', duration: 2.5, state: { color: 'negative', label: 'Delete project' } },
    {
      label: 'Click it again',
      layout: 'component',
      duration: 3,
      cursor: [{ at: 1, target: '[data-studio="button"]', click: true }],
    },
  ],
};
