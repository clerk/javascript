'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import * as TaskSetupMfa from '@/stories/task-setup-mfa.stories';

import { CURVE_PRESETS, EASE } from './recipes';

interface CustomRecipe {
  scope: string;
  opacity: string;
  transform: string;
  filter: string;
  exitTransform: string;
  duration: number;
  ease: string;
}

const PRESETS: { label: string; recipe: Omit<CustomRecipe, 'scope'> }[] = [
  {
    label: 'Lift',
    recipe: {
      opacity: '0',
      transform: 'translateY(0.75rem) scale(0.98)',
      filter: 'blur(3px)',
      exitTransform: 'translateY(-0.5rem) scale(0.98)',
      duration: 320,
      ease: EASE.outQuint,
    },
  },
  {
    label: 'Directional nudge',
    recipe: {
      opacity: '0',
      transform: 'translateX(calc(var(--cl-flow-transition-direction, 1) * 1.5rem))',
      filter: 'blur(2px)',
      exitTransform: 'translateX(calc(var(--cl-flow-transition-direction, 1) * -1.5rem))',
      duration: 320,
      ease: EASE.outQuint,
    },
  },
  {
    label: 'Zoom',
    recipe: {
      opacity: '0',
      transform: 'scale(1.06)',
      filter: 'blur(6px)',
      exitTransform: 'scale(0.96)',
      duration: 360,
      ease: EASE.outExpo,
    },
  },
];

const engine = (scope: string) => {
  const s = scope ? `${scope} ` : '';
  return `${s}.cl-flow-root {
  transition-duration: var(--cl-motion-duration);
  transition-timing-function: var(--cl-motion-ease);
}

${s}.cl-flow-root[data-initial] {
  transition-duration: 0s;
}

${s}.cl-flow-step {
  opacity: 1;
  transform: none;
  filter: none;
  transition-property: opacity, transform, filter;
  transition-duration: var(--cl-motion-duration);
  transition-delay: 0s;
  transition-timing-function: var(--cl-motion-ease);
}

${s}.cl-flow-step:is([data-starting-style], [data-ending-style]) {
  opacity: var(--cl-from-opacity, 0);
  transform: var(--cl-from-transform, none);
  filter: var(--cl-from-filter, none);
}

${s}.cl-flow-step[data-ending-style] {
  transform: var(--cl-exit-transform, var(--cl-from-transform, none));
  transition-duration: calc(var(--cl-motion-duration) * 0.66);
}

@media (prefers-reduced-motion: reduce) {
  ${s}.cl-flow-root {
    transition-duration: 0s;
  }

  ${s}.cl-flow-step:is([data-starting-style], [data-ending-style]) {
    transform: none;
    filter: none;
  }
}`;
};

function Code({ children }: { children: string }) {
  return (
    <pre className='bg-muted overflow-auto whitespace-pre-wrap rounded-md p-3 text-[11px] leading-snug'>{children}</pre>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-2'>
      <h3 className='text-sm font-medium'>
        <span className='bg-primary text-primary-foreground mr-2 inline-grid size-5 place-items-center rounded-full text-[11px]'>
          {number}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function CustomRecipeExample() {
  const [recipe, setRecipe] = React.useState<CustomRecipe>({ scope: 'auth-page', ...PRESETS[0].recipe });
  const [mode, setMode] = React.useState<'wrapper' | 'part'>('wrapper');
  const [presetLabel, setPresetLabel] = React.useState<string | null>('Lift');
  const scope = recipe.scope.replace(/[^a-z-]/g, '') || 'auth-page';
  const input = 'border-input bg-background h-7 rounded-md border px-1.5 text-xs font-mono';

  const edit = (patch: Partial<CustomRecipe>) => {
    setRecipe(previous => ({ ...previous, ...patch }));
    setPresetLabel(null);
  };

  const shownEase = recipe.ease.length > 70 ? 'cubic-bezier(…)' : recipe.ease;
  const timing = (ease: string) => `--cl-motion-duration: ${recipe.duration}ms;\n  --cl-motion-ease: ${ease};`;
  const pose = `--cl-from-opacity: ${recipe.opacity};\n  --cl-from-transform: ${recipe.transform};\n  --cl-from-filter: ${recipe.filter};\n  --cl-exit-transform: ${recipe.exitTransform};`;

  const wrapperCss = `.${scope} {\n  ${timing(shownEase)}\n}\n\n.${scope} .cl-flow-step {\n  ${pose}\n}`;
  const partCss = `:root {\n  ${timing(shownEase)}\n}\n\n.cl-flow-step {\n  ${pose}\n}`;
  const applyCode =
    mode === 'wrapper'
      ? `<div className="${scope}">\n  <SignIn />\n</div>`
      : '<SignIn />\n\n/* nothing to add: the rules above reach every flow */';

  const running = `${engine('.cr-demo').replace(/;/g, ' !important;')}\n\n.cr-demo {\n  ${timing(recipe.ease)}\n}\n\n.cr-demo .cl-flow-step {\n  ${pose}\n}`;

  return (
    <div className='flex w-full flex-col gap-6'>
      <style>{running}</style>

      <Step
        number={1}
        title='Try it'
      >
        <p className='text-muted-foreground text-xs'>
          This is the real sign-in step, wrapped in an element with the class from the next step. Click through it and
          edit the recipe. The code in the next steps is the code that is running.
        </p>
        <div className={`cr-demo ${scope} bg-muted/40 grid min-h-[30rem] place-items-center rounded-xl border p-6`}>
          <TaskSetupMfa.Default />
        </div>
      </Step>

      <Step
        number={2}
        title='Define the recipe'
      >
        <p className='text-muted-foreground text-xs'>
          A recipe is a starting pose, a duration and a curve. The timing is declared on the wrapper, because the card
          and its steps share it. The pose is declared on the step, because it can read values that belong to one step,
          such as the direction.
        </p>
        <div className='flex flex-wrap items-center gap-1.5'>
          <span className='text-muted-foreground mr-1 text-[11px] font-medium uppercase tracking-wide'>Start from</span>
          {PRESETS.map(preset => (
            <Button
              key={preset.label}
              size='sm'
              variant={presetLabel === preset.label ? 'default' : 'outline'}
              onClick={() => {
                setRecipe(previous => ({ scope: previous.scope, ...preset.recipe }));
                setPresetLabel(preset.label);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div className='grid grid-cols-[8rem_1fr] items-center gap-x-2 gap-y-1.5 text-xs'>
          <label htmlFor='cr-scope'>Your wrapper class</label>
          <input
            id='cr-scope'
            className={input}
            value={recipe.scope}
            onChange={event => edit({ scope: event.target.value })}
          />
          <label htmlFor='cr-opacity'>From opacity</label>
          <input
            id='cr-opacity'
            className={input}
            value={recipe.opacity}
            onChange={event => edit({ opacity: event.target.value })}
          />
          <label htmlFor='cr-transform'>From transform</label>
          <input
            id='cr-transform'
            className={input}
            value={recipe.transform}
            onChange={event => edit({ transform: event.target.value })}
          />
          <label htmlFor='cr-filter'>From filter</label>
          <input
            id='cr-filter'
            className={input}
            value={recipe.filter}
            onChange={event => edit({ filter: event.target.value })}
          />
          <label htmlFor='cr-exit'>Exit transform</label>
          <input
            id='cr-exit'
            className={input}
            value={recipe.exitTransform}
            onChange={event => edit({ exitTransform: event.target.value })}
          />
          <label htmlFor='cr-duration'>Duration</label>
          <div className='flex items-center gap-2'>
            <input
              id='cr-duration'
              type='range'
              className='accent-brand w-full'
              min={0}
              max={1000}
              step={10}
              value={recipe.duration}
              onChange={event => edit({ duration: Number(event.target.value) })}
            />
            <output className='text-muted-foreground w-12 text-right tabular-nums'>{recipe.duration}ms</output>
          </div>
          <label htmlFor='cr-ease'>Curve</label>
          <select
            id='cr-ease'
            className={input}
            value={CURVE_PRESETS.find(curve => curve.value === recipe.ease)?.value ?? ''}
            onChange={event => event.target.value && edit({ ease: event.target.value })}
          >
            {CURVE_PRESETS.map(curve => (
              <option
                key={curve.label}
                value={curve.value}
              >
                {curve.label}
              </option>
            ))}
          </select>
        </div>
        <Code>{mode === 'wrapper' ? wrapperCss : partCss}</Code>
      </Step>

      <Step
        number={3}
        title='Scope it to the component'
      >
        <div className='flex flex-wrap items-center gap-1.5'>
          <span className='text-muted-foreground mr-1 text-[11px] font-medium uppercase tracking-wide'>Scope it</span>
          <Button
            size='sm'
            variant={mode === 'wrapper' ? 'default' : 'outline'}
            onClick={() => setMode('wrapper')}
          >
            With your own wrapper class
          </Button>
          <Button
            size='sm'
            variant={mode === 'part' ? 'default' : 'outline'}
            onClick={() => setMode('part')}
          >
            On the part itself
          </Button>
        </div>
        <p className='text-muted-foreground text-xs'>
          {mode === 'wrapper'
            ? 'Put a class of your own on an element around the component and write the rules under it. Everything inside it uses the recipe. This works for inline components such as a flow, and the demo above is scoped this way.'
            : 'Write the rules on the part and its stable class, with no wrapper. They apply everywhere that class appears. This is the form that reaches components in a portal, such as a dialog, a menu or a toast.'}
        </p>
        <Code>{applyCode}</Code>
      </Step>

      <Step
        number={4}
        title='What Mosaic provides'
      >
        <p className='text-muted-foreground text-xs'>
          You never write these rules. Mosaic reads the five values and moves the step between the starting pose and
          rest, and it drops movement under reduced motion. They apply to every flow. The demo scopes them to this card
          so the rest of the page is unaffected, and Swingset&apos;s development build adds <code>!important</code> to
          beat the component&apos;s own styles.
        </p>
        <details>
          <summary className='text-muted-foreground cursor-pointer text-xs'>Show the rules</summary>
          <div className='mt-2'>
            <Code>{engine('')}</Code>
          </div>
        </details>
      </Step>
    </div>
  );
}
