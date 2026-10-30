'use client';

import type { SwitcherTriggerVariant } from '@clerk/mosaic/features/switcher/switcher.view';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';

import { usePrototype } from '@/stories/fixtures/switcher';

import type { Showcase } from '../types';

type State = {
  mode: 'combined' | 'user';
  triggerVariant: SwitcherTriggerVariant;
  label: boolean;
};

const trigger = '[data-studio="user-button"] button';

function View({ state }: { state: State }) {
  const prototype = usePrototype({ hidePersonal: state.mode === 'combined' });
  return (
    <div
      data-studio='user-button'
      data-studio-surface={state.label || undefined}
    >
      <SwitcherView
        {...prototype}
        mode={state.mode}
        triggerVariant={state.triggerVariant}
        showTriggerLabel={state.label}
      />
    </div>
  );
}

function code(state: State) {
  return [
    `import { UserButton } from '@clerk/mosaic';`,
    ``,
    `export function Header() {`,
    `  return (`,
    `    <header>`,
    `      <UserButton`,
    `        mode='${state.mode}'`,
    `        triggerVariant='${state.triggerVariant}'`,
    `        showTriggerLabel={${state.label}}`,
    `      />`,
    `    </header>`,
    `  );`,
    `}`,
  ].join('\n');
}

export const userButtonDisplay: Showcase<State> = {
  slug: 'user-button-display',
  title: 'UserButton display types',
  summary: 'The UserButton trigger from full to condensed to avatar only, then the account-only mode.',
  file: 'app/components/header.tsx',
  focus: { width: 350, height: 450 },
  initialState: { mode: 'combined', triggerVariant: 'full', label: true },
  View,
  code,
  steps: [
    {
      label: 'Open the menu',
      layout: 'component',
      duration: 4,
      cursor: [
        { at: 0.6, target: trigger, click: true },
        { at: 2.8, target: trigger, click: true },
      ],
    },
    { label: 'The code', layout: 'split', duration: 2.5, cursor: [{ at: 0, hide: true }] },
    { label: 'Condensed', layout: 'split', duration: 2.5, state: { triggerVariant: 'condensed' } },
    { label: 'Avatar only', layout: 'split', duration: 2.5, state: { label: false } },
    { label: 'Accounts only', layout: 'split', duration: 2.5, state: { mode: 'user' } },
    {
      label: 'Open it again',
      layout: 'component',
      duration: 4,
      cursor: [
        { at: 0.6, target: trigger, click: true },
        { at: 2.8, target: trigger, click: true },
      ],
    },
  ],
};
