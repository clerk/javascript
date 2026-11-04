'use client';

import type { SwitcherTriggerVariant } from '@clerk/mosaic/features/switcher/switcher.view';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';

import { usePrototype } from '@/stories/fixtures/switcher';

import type { Showcase } from '../types';
import { Spec } from './spec';

type State = Record<string, never>;
type Mode = 'combined' | 'user';
type Trigger = { label: string; variant: SwitcherTriggerVariant; showLabel: boolean };

const robert = {
  name: 'Robert Paulson',
  identifier: 'robert@paulson.dev',
  imageUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
};

const modes: Mode[] = ['combined', 'user'];
const triggers: Trigger[] = [
  { label: 'full', variant: 'full', showLabel: true },
  { label: 'condensed', variant: 'condensed', showLabel: true },
  { label: 'avatar only', variant: 'condensed', showLabel: false },
];

function Cell({ mode, trigger }: { mode: Mode; trigger: Trigger }) {
  const prototype = usePrototype({ hidePersonal: mode === 'combined' });
  return (
    <SwitcherView
      {...prototype}
      activeSession={{ ...prototype.activeSession, ...robert }}
      mode={mode}
      triggerVariant={trigger.variant}
      showTriggerLabel={trigger.showLabel}
    />
  );
}

function View() {
  return (
    <Spec
      axis='mode · trigger'
      rows={modes}
      columns={triggers}
      rowLabel={mode => mode}
      columnLabel={trigger => trigger.label}
      cell={(mode, trigger) => (
        <Cell
          mode={mode}
          trigger={trigger}
        />
      )}
      align='start'
      style={{ columnGap: 64 }}
    />
  );
}

export const userButtonMatrix: Showcase<State> = {
  slug: 'user-button-matrix',
  title: 'UserButton variations',
  summary: 'Every UserButton mode and trigger display, labeled like a spec sheet.',
  cellPadding: 48,
  plain: true,
  initialState: {},
  View,
  steps: [{ label: 'Variations', layout: 'component', duration: 4 }],
};
