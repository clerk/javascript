'use client';

import './motion-explorer.css';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { springCurve } from '@/lib/motion';
import * as ActionBar from '@/stories/action-bar.stories';
import * as Combobox from '@/stories/combobox.stories';
import * as CardDialog from '@/stories/dialog.component.stories';
import * as Drawer from '@/stories/drawer.component.stories';
import * as Menu from '@/stories/menu.component.stories';
import * as Popover from '@/stories/popover.component.stories';
import * as Select from '@/stories/select.component.stories';
import * as TaskSetupMfa from '@/stories/task-setup-mfa.stories';
import * as Toast from '@/stories/toast.stories';
import * as Tooltip from '@/stories/tooltip.component.stories';
import * as UserProfile from '@/stories/user-profile.stories';

import { CURVE_PRESETS, parseBezier, type Recipe, RECIPES, sampleCurve, TARGETS } from './recipes';

const DEMOS: Record<string, React.ComponentType> = {
  flow: TaskSetupMfa.Default,
  menu: Menu.Default,
  select: Select.Default,
  combobox: Combobox.Default,
  popover: Popover.Default,
  tooltip: Tooltip.Default,
  drawer: Drawer.Default,
  actionbar: ActionBar.Default,
  dialog: CardDialog.CardSurface,
  profile: UserProfile.Overlay,
  toast: Toast.Default,
};

const VARS = [
  '--m-slow',
  '--m-fade',
  '--m-move',
  '--m-exit',
  '--m-height',
  '--m-grow-wait',
  '--m-ease',
  '--m-ease-exit',
  '--m-from-opacity',
  '--m-from-filter',
  '--m-closed-display',
];

function Plot({ ease, exitEase }: { ease: string; exitEase: string }) {
  const path = (css: string) =>
    sampleCurve(css)
      .map(
        (value, index, all) =>
          `${index === 0 ? 'M' : 'L'}${10 + (index / (all.length - 1)) * 180},${110 - value * 100}`,
      )
      .join(' ');
  return (
    <svg
      viewBox='0 0 200 120'
      className='bg-muted/40 w-full max-w-60 rounded-md border'
      role='img'
      aria-label='Easing curve'
    >
      <line
        x1='10'
        y1='110'
        x2='190'
        y2='110'
        stroke='currentColor'
        strokeOpacity='0.25'
      />
      <line
        x1='10'
        y1='10'
        x2='190'
        y2='10'
        stroke='currentColor'
        strokeOpacity='0.15'
        strokeDasharray='2 3'
      />
      <path
        d={path(exitEase)}
        fill='none'
        stroke='currentColor'
        strokeOpacity='0.45'
        strokeDasharray='4 3'
      />
      <path
        d={path(ease)}
        fill='none'
        stroke='var(--brand, #6c47ff)'
        strokeWidth='2'
      />
    </svg>
  );
}

function Dot({ ms, ease }: { ms: number; ease: string }) {
  const [phase, setPhase] = React.useState(false);
  React.useEffect(() => {
    const id = setInterval(() => setPhase(value => !value), Math.max(ms, 100) + 700);
    return () => clearInterval(id);
  }, [ms]);
  return (
    <div className='bg-muted/40 relative h-6 w-full max-w-60 rounded-full border'>
      <span
        className='absolute left-1 top-1 size-4 rounded-full bg-[var(--brand,#6c47ff)]'
        style={{
          transform: phase ? 'translateX(calc(15rem - 1.5rem - 0.25rem))' : 'translateX(0)',
          transitionProperty: 'transform',
          transitionDuration: `${ms}ms`,
          transitionTimingFunction: ease,
        }}
      />
    </div>
  );
}

export function MotionExplorer() {
  const [targetId, setTargetId] = React.useState('flow');
  const [recipeId, setRecipeId] = React.useState('morph');
  const [edits, setEdits] = React.useState<Record<string, Recipe>>({});
  const [preview, setPreview] = React.useState(1);
  const [reducedChoice, setReducedChoice] = React.useState(false);
  const stage = React.useRef<HTMLDivElement>(null);

  const target = TARGETS.find(entry => entry.id === targetId) ?? TARGETS[0];
  const Demo = DEMOS[target.id];
  const base = RECIPES.find(entry => entry.id === recipeId) ?? RECIPES[0];
  const applied = edits[recipeId] ?? base;

  React.useEffect(() => {
    const root = document.documentElement;
    const reduced = reducedChoice || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.setAttribute('data-motion-explorer', '');
    root.setAttribute('data-m-target', targetId);
    const values: Record<string, string> = {
      '--m-slow': String(1 / preview),
      '--m-fade': `${applied.fadeMs}ms`,
      '--m-move': `${applied.moveMs}ms`,
      '--m-exit': `${applied.exitMs}ms`,
      '--m-height': reduced ? '0s' : `${applied.moveMs}ms`,
      '--m-grow-wait': reduced ? '0ms' : `${applied.growWaitMs}ms`,
      '--m-ease': applied.ease,
      '--m-ease-exit': applied.exitEase,
      '--m-from-opacity': applied.opacity,
      '--m-from-filter': reduced ? 'none' : applied.filter,
      '--m-closed-display': applied.id === 'none' ? 'none' : 'flex',
    };
    Object.entries(values).forEach(([name, value]) => root.style.setProperty(name, value));
    return () => {
      root.removeAttribute('data-motion-explorer');
      root.removeAttribute('data-m-target');
      VARS.forEach(name => root.style.removeProperty(name));
    };
  }, [targetId, applied, preview, reducedChoice]);

  React.useEffect(() => {
    if (targetId !== 'toast') {
      return;
    }
    const stageElement = stage.current;
    if (!stageElement) {
      return;
    }
    const names = [
      'inset',
      'position',
      'top',
      'left',
      'width',
      'height',
      'overflow',
      'border-radius',
      'pointer-events',
    ];
    let frame = 0;
    const place = () => {
      const viewport = document.querySelector<HTMLElement>('.cl-toast-viewport');
      if (viewport) {
        const rect = stageElement.getBoundingClientRect();
        const set = (name: string, value: string) => viewport.style.setProperty(name, value, 'important');
        set('inset', 'auto');
        set('position', 'fixed');
        set('top', `${rect.top}px`);
        set('left', `${rect.left}px`);
        set('width', `${rect.width}px`);
        set('height', `${rect.height}px`);
        set('overflow', 'clip');
        set('border-radius', '0.75rem');
        set('pointer-events', 'none');
      }
      frame = requestAnimationFrame(place);
    };
    place();
    return () => {
      cancelAnimationFrame(frame);
      const viewport = document.querySelector<HTMLElement>('.cl-toast-viewport');
      names.forEach(name => viewport?.style.removeProperty(name));
    };
  }, [targetId]);

  const poseReduced =
    reducedChoice || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const poseCss = `html[data-motion-explorer] :is(.cl-flow-step, .cl-menu-popup, .cl-select-popup, .cl-combobox-popup, .cl-popover-popup, .cl-tooltip-popup, .cl-dialog-popup, .cl-drawer-popup, .cl-toast-root, .cl-action-bar) { --m-from-transform: ${poseReduced ? 'none' : applied.transform}; --m-exit-transform: ${poseReduced ? 'none' : (applied.exitTransform ?? applied.transform)}; }`;

  const play = React.useCallback(() => {
    const buttons = Array.from(stage.current?.querySelectorAll('button') ?? []);
    if (targetId === 'tooltip') {
      buttons[0]?.focus();
      window.setTimeout(() => buttons[0]?.blur(), 1500);
      return;
    }
    const back = buttons.find(button => button.textContent?.trim() === 'Back');
    (back ?? buttons[0])?.click();
  }, [targetId]);

  const apply = (id: string) => {
    setRecipeId(id);
    window.setTimeout(play, 250);
  };

  const chooseTarget = (id: string) => {
    setTargetId(id);
    setRecipeId(TARGETS.find(entry => entry.id === id)?.defaultRecipe ?? 'fade');
  };

  const edit = (patch: Partial<Recipe>) =>
    setEdits(previous => ({ ...previous, [recipeId]: { ...(previous[recipeId] ?? base), ...patch } }));
  const resetEdits = () =>
    setEdits(previous => {
      const next = { ...previous };
      delete next[recipeId];
      return next;
    });
  const bezier = applied.spring ? null : parseBezier(applied.ease);
  const blur = Number.parseFloat(/blur\(([\d.]+)px\)/.exec(applied.filter)?.[1] ?? '0');
  const scaleMatch = /^scale\(([\d.]+)\)$/.exec(applied.transform);
  const pushDistance = /^translateX\(calc\(var\(--cl-flow-transition-direction, 1\) \* ([\d.]+)(rem|px|%)\)\)$/.exec(
    applied.transform,
  );
  const distanceUnit = pushDistance?.[2] ?? 'rem';
  const distanceMax = distanceUnit === 'px' ? 120 : distanceUnit === '%' ? 100 : 6;
  const distanceStep = distanceUnit === 'px' ? 2 : distanceUnit === '%' ? 5 : 0.25;
  const setDistance = (value: number) =>
    edit({
      transform: `translateX(calc(var(--cl-flow-transition-direction, 1) * ${value}${distanceUnit}))`,
      exitTransform: `translateX(calc(var(--cl-flow-transition-direction, 1) * -${value}${distanceUnit}))`,
    });
  const scalable = applied.transform === 'none' || Boolean(scaleMatch);
  const scale = scaleMatch ? Number(scaleMatch[1]) : 1;
  const curveChoice = applied.spring
    ? '__spring'
    : (CURVE_PRESETS.find(curve => curve.value === applied.ease)?.value ?? '');
  const tuneRows = [
    ['fadeMs', 'Fade in', 0, 1000, 10],
    ['moveMs', 'Move and resize', 0, 1000, 10],
    ['exitMs', 'Exit', 0, 1000, 10],
    ['growWaitMs', 'Grow wait', 0, 300, 5],
  ] as const;
  const input = 'border-input bg-background h-7 rounded-md border px-1.5 text-xs';

  return (
    <div className='flex w-full flex-col gap-4'>
      <style>{poseCss}</style>
      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='text-muted-foreground mr-1 text-[11px] font-medium uppercase tracking-wide'>Component</span>
        {TARGETS.map(entry => (
          <Button
            key={entry.id}
            size='sm'
            variant={targetId === entry.id ? 'default' : 'outline'}
            onClick={() => chooseTarget(entry.id)}
          >
            {entry.label}
          </Button>
        ))}
        <p className='text-muted-foreground basis-full text-xs'>{target.note}</p>
      </div>

      <div
        ref={stage}
        className='bg-muted/40 grid min-h-[34rem] place-items-center rounded-xl border p-6'
      >
        <Demo key={target.id} />
      </div>

      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='text-muted-foreground mr-1 text-[11px] font-medium uppercase tracking-wide'>Recipes</span>
        {RECIPES.map(entry => (
          <button
            key={entry.id}
            type='button'
            title={entry.summary}
            onClick={() => apply(entry.id)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${recipeId === entry.id ? 'border-primary bg-primary/10' : 'bg-background hover:bg-muted'}`}
          >
            {entry.label}
          </button>
        ))}
        <p className='text-muted-foreground basis-full text-xs'>{applied.summary}</p>
      </div>

      <div className='grid gap-4 rounded-xl border p-4 md:grid-cols-[auto_1fr]'>
        <div className='flex flex-col gap-2'>
          <p className='text-muted-foreground text-[11px] font-medium uppercase tracking-wide'>The curve</p>
          <Plot
            ease={applied.ease}
            exitEase={applied.exitEase}
          />
          <Dot
            ms={applied.moveMs / (1 / preview)}
            ease={applied.ease}
          />
          <p className='text-muted-foreground max-w-60 text-xs'>
            Time runs left to right and progress runs bottom to top. A steep start means a fast start. The dashed line
            is the exit curve.
          </p>
        </div>
        <div className='flex flex-col gap-3 text-xs'>
          <div>
            <p className='text-muted-foreground mb-1 text-[11px] font-medium uppercase tracking-wide'>
              What a recipe is
            </p>
            <ul className='text-muted-foreground list-disc space-y-1 pl-4'>
              <li>
                <span className='text-foreground font-medium'>A starting pose.</span> Where the element is before it
                appears: opacity {applied.opacity}, transform {applied.transform}, filter {applied.filter}.
              </li>
              <li>
                <span className='text-foreground font-medium'>A timing.</span> Fade {applied.fadeMs}ms, move{' '}
                {applied.moveMs}ms, exit {applied.exitMs}ms, grow wait {applied.growWaitMs}ms.
              </li>
              <li>
                <span className='text-foreground font-medium'>A curve.</span> How progress is spread across that time.
              </li>
            </ul>
          </div>

          {recipeId === 'none' ? (
            <p className='text-muted-foreground'>None has nothing to tune.</p>
          ) : (
            <div className='flex flex-col gap-2'>
              <div className='grid grid-cols-[6.5rem_1fr_3.5rem] items-center gap-x-2 gap-y-1.5'>
                {tuneRows.map(([key, label, min, max, step]) => (
                  <React.Fragment key={key}>
                    <label htmlFor={`ex-${key}`}>{label}</label>
                    <input
                      id={`ex-${key}`}
                      type='range'
                      className='accent-brand w-full'
                      min={min}
                      max={max}
                      step={step}
                      value={applied[key]}
                      onChange={event => edit({ [key]: Number(event.target.value) })}
                    />
                    <output className='text-muted-foreground text-right tabular-nums'>{applied[key]}ms</output>
                  </React.Fragment>
                ))}
                <label htmlFor='ex-blur'>Blur</label>
                <input
                  id='ex-blur'
                  type='range'
                  className='accent-brand w-full'
                  min={0}
                  max={12}
                  step={0.5}
                  value={blur}
                  onChange={event => {
                    const value = Number(event.target.value);
                    edit({ filter: value > 0 ? `blur(${value}px)` : 'none' });
                  }}
                />
                <output className='text-muted-foreground text-right tabular-nums'>{blur}px</output>
                {pushDistance ? (
                  <>
                    <label htmlFor='ex-distance'>Distance</label>
                    <input
                      id='ex-distance'
                      type='range'
                      className='accent-brand w-full'
                      min={0}
                      max={distanceMax}
                      step={distanceStep}
                      value={Number(pushDistance[1])}
                      onChange={event => setDistance(Number(event.target.value))}
                    />
                    <output className='text-muted-foreground text-right tabular-nums'>
                      {pushDistance[1]}
                      {distanceUnit}
                    </output>
                  </>
                ) : null}
                {scalable ? (
                  <>
                    <label htmlFor='ex-scale'>Scale from</label>
                    <input
                      id='ex-scale'
                      type='range'
                      className='accent-brand w-full'
                      min={0.8}
                      max={1}
                      step={0.01}
                      value={scale}
                      onChange={event => {
                        const value = Number(event.target.value);
                        edit({ transform: value === 1 ? 'none' : `scale(${value})` });
                      }}
                    />
                    <output className='text-muted-foreground text-right tabular-nums'>{scale}</output>
                  </>
                ) : null}
                <label htmlFor='ex-preset'>Curve</label>
                <select
                  id='ex-preset'
                  className={`${input} col-span-2`}
                  value={curveChoice}
                  onChange={event => {
                    const value = event.target.value;
                    if (value === '__spring') {
                      edit({ spring: { dur: 0.3, bounce: 0 }, ease: springCurve(0.3, 0).css });
                    } else if (value) {
                      edit({ spring: undefined, ease: value });
                    }
                  }}
                >
                  <option value='__spring'>Spring</option>
                  {CURVE_PRESETS.filter(curve => curve.label !== 'Spring').map(curve => (
                    <option
                      key={curve.label}
                      value={curve.value}
                    >
                      {curve.label}
                    </option>
                  ))}
                  <option value=''>Your own</option>
                </select>
                {applied.spring ? (
                  <>
                    <label htmlFor='ex-spring-dur'>Spring length</label>
                    <input
                      id='ex-spring-dur'
                      type='range'
                      className='accent-brand w-full'
                      min={0.15}
                      max={0.6}
                      step={0.01}
                      value={applied.spring.dur}
                      onChange={event => {
                        const spring = { dur: Number(event.target.value), bounce: applied.spring?.bounce ?? 0 };
                        edit({ spring, ease: springCurve(spring.dur, spring.bounce).css });
                      }}
                    />
                    <output className='text-muted-foreground text-right tabular-nums'>{applied.spring.dur}s</output>
                    <label htmlFor='ex-spring-bounce'>Bounce</label>
                    <input
                      id='ex-spring-bounce'
                      type='range'
                      className='accent-brand w-full'
                      min={0}
                      max={0.4}
                      step={0.01}
                      value={applied.spring.bounce}
                      onChange={event => {
                        const spring = { dur: applied.spring?.dur ?? 0.3, bounce: Number(event.target.value) };
                        edit({ spring, ease: springCurve(spring.dur, spring.bounce).css });
                      }}
                    />
                    <output className='text-muted-foreground text-right tabular-nums'>{applied.spring.bounce}</output>
                    <p className='text-muted-foreground col-span-3'>
                      This spring settles in {springCurve(applied.spring.dur, applied.spring.bounce).ms}ms. Set Fade in
                      and Move and resize to match.
                    </p>
                  </>
                ) : null}
                {bezier
                  ? (['x1', 'y1', 'x2', 'y2'] as const).map((label, index) => (
                      <React.Fragment key={label}>
                        <label htmlFor={`ex-${label}`}>{label}</label>
                        <input
                          id={`ex-${label}`}
                          type='range'
                          className='accent-brand w-full'
                          min={index % 2 === 0 ? 0 : -0.5}
                          max={index % 2 === 0 ? 1 : 1.5}
                          step={0.01}
                          value={bezier[index]}
                          onChange={event => {
                            const next = [...bezier];
                            next[index] = Number(event.target.value);
                            edit({ ease: `cubic-bezier(${next.join(', ')})` });
                          }}
                        />
                        <output className='text-muted-foreground text-right tabular-nums'>{bezier[index]}</output>
                      </React.Fragment>
                    ))
                  : null}
                <label htmlFor='ex-ease'>Your own</label>
                <input
                  id='ex-ease'
                  className={`${input} col-span-2 font-mono`}
                  value={applied.ease.length > 60 ? 'a spring curve' : applied.ease}
                  readOnly={Boolean(applied.spring)}
                  onChange={event => {
                    if (CSS.supports('transition-timing-function', event.target.value)) {
                      edit({ spring: undefined, ease: event.target.value });
                    }
                  }}
                />
                <label htmlFor='ex-exit-ease'>Exit curve</label>
                <select
                  id='ex-exit-ease'
                  className={`${input} col-span-2`}
                  value={CURVE_PRESETS.find(curve => curve.value === applied.exitEase)?.value ?? ''}
                  onChange={event => event.target.value && edit({ exitEase: event.target.value })}
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
              <details
                key={recipeId}
                open={recipeId === 'custom'}
              >
                <summary className='text-muted-foreground cursor-pointer'>Starting pose</summary>
                <div className='mt-1.5 grid grid-cols-[6.5rem_1fr] items-center gap-x-2 gap-y-1.5'>
                  {(['opacity', 'transform', 'filter'] as const).map(key => (
                    <React.Fragment key={key}>
                      <label htmlFor={`ex-${key}`}>From {key}</label>
                      <input
                        id={`ex-${key}`}
                        className={`${input} font-mono`}
                        value={applied[key]}
                        onChange={event => edit({ [key]: event.target.value })}
                      />
                    </React.Fragment>
                  ))}
                </div>
              </details>
              <div>
                <Button
                  size='xs'
                  variant='outline'
                  disabled={!edits[recipeId]}
                  onClick={resetEdits}
                >
                  Reset this recipe
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-1.5'>
        <span className='text-muted-foreground mr-1 text-[11px] font-medium uppercase tracking-wide'>
          Preview speed
        </span>
        {[1, 0.5, 0.25, 0.1].map(value => (
          <Button
            key={value}
            size='sm'
            variant={preview === value ? 'default' : 'outline'}
            onClick={() => setPreview(value)}
          >
            {value}×
          </Button>
        ))}
        <label
          htmlFor='ex-reduced'
          className='ml-3 flex items-center gap-2 text-xs'
        >
          <input
            id='ex-reduced'
            type='checkbox'
            checked={reducedChoice}
            onChange={event => setReducedChoice(event.target.checked)}
          />
          Reduced motion
        </label>
      </div>
    </div>
  );
}
