import { colorVars } from '@clerk/mosaic/tokens.stylex';
import { useTheme } from 'next-themes';
import * as React from 'react';

import {
  applyPreset,
  colorPresets,
  getActivePreset,
  getColorVersion,
  getOverride,
  getOverrideCount,
  probe,
  resetAll,
  resetOverride,
  setOverride,
  subscribeColors,
} from '@/lib/color-overrides';
import type { StoryMeta } from '@/lib/types';

export { default as __source } from './color-tokens.stories?raw';

export const meta: StoryMeta = {
  group: 'Styles',
  title: 'Color Tokens',
  status: 'stable',
  source: 'packages/mosaic/src/tokens.stylex.ts',
};

type Mode = 'light' | 'dark';

const seeds = [
  '--cl-color-page',
  '--cl-color-neutral',
  '--cl-color-brand',
  '--cl-color-brand-foreground',
  '--cl-color-negative',
  '--cl-color-negative-foreground',
  '--cl-color-positive',
  '--cl-color-positive-foreground',
  '--cl-color-warning',
  '--cl-color-warning-foreground',
];

const groups: Array<{ title: string; match: (name: string) => boolean }> = [
  {
    title: 'Layers and borders',
    match: n =>
      [
        '--cl-color-surface',
        '--cl-color-surface-subtle',
        '--cl-color-neutral-subtle',
        '--cl-color-border',
        '--cl-color-border-subtle',
      ].includes(n),
  },
  { title: 'Text', match: n => n.includes('-foreground') },
  { title: 'Input', match: n => ['--cl-color-input', '--cl-color-input-placeholder', '--cl-color-ring'].includes(n) },
  { title: 'Brand', match: n => n.startsWith('--cl-color-brand') },
  { title: 'Negative', match: n => n.startsWith('--cl-color-negative') },
  { title: 'Positive', match: n => n.startsWith('--cl-color-positive') },
  { title: 'Warning', match: n => n.startsWith('--cl-color-warning') },
  { title: 'Neutral washes', match: n => n.startsWith('--cl-color-neutral-alpha') },
];

function toHex(css: string): string {
  if (typeof document === 'undefined') {
    return '#000000';
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || !css) {
    return '#000000';
  }
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = css;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
}

function useResolved(name: string, token: number) {
  const [resolved, setResolved] = React.useState<Record<Mode, string>>({ light: '', dark: '' });

  React.useEffect(() => {
    setResolved({ light: probe(name, 'light'), dark: probe(name, 'dark') });
  }, [name, token]);

  return resolved;
}

function ModeCell({
  name,
  mode,
  resolved,
  value,
  editable,
}: {
  name: string;
  mode: Mode;
  resolved: string;
  value: string | undefined;
  editable: boolean;
}) {
  return (
    <div className='flex w-80 items-center gap-2'>
      <span className='relative size-8 shrink-0'>
        <span
          className='border-border absolute inset-0 rounded-md border'
          style={{ background: `var(${name})`, colorScheme: mode }}
        />
        {editable ? (
          <input
            type='color'
            aria-label={`Pick ${name} ${mode}`}
            className='absolute inset-0 size-full cursor-pointer opacity-0'
            value={toHex(resolved)}
            onChange={event => setOverride(name, mode, event.target.value)}
          />
        ) : null}
      </span>
      {editable ? (
        <>
          <input
            aria-label={`Override ${name} ${mode}`}
            className='border-input bg-background h-8 min-w-0 flex-1 rounded-md border px-2 font-mono text-xs'
            placeholder={resolved}
            value={value ?? ''}
            onChange={event => setOverride(name, mode, event.target.value)}
          />
          <button
            type='button'
            className='text-muted-foreground hover:text-foreground w-10 text-xs disabled:opacity-40'
            disabled={value === undefined}
            onClick={() => resetOverride(name, mode)}
          >
            Reset
          </button>
        </>
      ) : (
        <span className='text-muted-foreground min-w-0 flex-1 truncate font-mono text-[11px]'>{resolved}</span>
      )}
    </div>
  );
}

function TokenRow({ name, token, mode, editable }: { name: string; token: number; mode: Mode; editable: boolean }) {
  const resolved = useResolved(name, token);
  const sides = getOverride(name);

  return (
    <div className='flex items-center gap-3 py-1.5'>
      <div className='min-w-0 flex-1 truncate font-mono text-xs'>{name}</div>
      <ModeCell
        name={name}
        mode={mode}
        resolved={resolved[mode]}
        value={sides?.[mode]}
        editable={editable}
      />
    </div>
  );
}

export function Default() {
  const { resolvedTheme } = useTheme();
  const mode: Mode = resolvedTheme === 'dark' ? 'dark' : 'light';
  const count = React.useSyncExternalStore(subscribeColors, getColorVersion, () => 0);
  const activePreset = getActivePreset();
  const names = Object.keys(colorVars);
  const placed = new Set<string>();

  return (
    <div
      className='w-full'
      data-version={count}
    >
      <div className='mb-4 flex items-center justify-between'>
        <p className='text-muted-foreground text-sm'>
          Edits apply to the mode shown by the dark mode toggle; the other mode keeps its default. Overrides apply to
          the whole preview and stay while you move between pages. {getOverrideCount()} active.
        </p>
        <button
          type='button'
          className='border-input hover:bg-accent h-8 rounded-md border px-3 text-xs disabled:opacity-40'
          disabled={getOverrideCount() === 0}
          onClick={resetAll}
        >
          Reset all
        </button>
      </div>
      <section className='mb-8'>
        <h3 className='mb-1 text-sm font-medium'>Presets</h3>
        <p className='text-muted-foreground mb-2 text-xs'>
          A preset sets the page and the neutral together. Editing a token afterwards switches to Custom.
        </p>
        <div className='flex flex-wrap gap-2'>
          {colorPresets.map(preset => (
            <button
              key={preset.id}
              type='button'
              aria-pressed={activePreset === preset.id}
              className='border-input hover:bg-accent aria-pressed:bg-accent h-8 rounded-md border px-3 text-xs aria-pressed:font-medium'
              onClick={() => applyPreset(preset.id)}
            >
              {preset.label}
            </button>
          ))}
          {activePreset === 'custom' ? (
            <span className='text-muted-foreground flex h-8 items-center px-2 text-xs'>Custom</span>
          ) : null}
        </div>
      </section>
      <section className='mb-8'>
        <h3 className='mb-1 text-sm font-medium'>Set by you</h3>
        <p className='text-muted-foreground mb-2 text-xs'>The seeds. Everything below is generated from them.</p>
        {seeds
          .filter(name => names.includes(name))
          .map(name => (
            <TokenRow
              key={name}
              name={name}
              token={count}
              mode={mode}
              editable
            />
          ))}
      </section>
      <h3 className='mb-1 text-sm font-medium'>Generated</h3>
      <p className='text-muted-foreground mb-3 text-xs'>Derived from the seeds, so not editable here.</p>
      {groups.map(group => {
        const members = names.filter(name => !seeds.includes(name) && !placed.has(name) && group.match(name));
        members.forEach(name => placed.add(name));
        if (members.length === 0) {
          return null;
        }
        return (
          <section
            key={group.title}
            className='mb-5'
          >
            <h4 className='text-muted-foreground mb-1 text-xs uppercase tracking-wide'>{group.title}</h4>
            {members.map(name => (
              <TokenRow
                key={name}
                name={name}
                token={count}
                mode={mode}
                editable={false}
              />
            ))}
          </section>
        );
      })}
    </div>
  );
}
