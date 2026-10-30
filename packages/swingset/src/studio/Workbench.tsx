'use client';

import { Button } from '@clerk/mosaic/components/button';
import { Field } from '@clerk/mosaic/components/field';
import { Select } from '@clerk/mosaic/components/select';
import { Switch } from '@clerk/mosaic/components/switch';
import { Text } from '@clerk/mosaic/components/text';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { showcases } from './showcases';
import { FORMATS, Stage } from './Stage';
import { resolveSteps } from './Studio';
import type { StudioBadges, StudioFormat, StudioLayout, StudioScheme } from './types';
import { useCursor } from './useCursor';

const STEP_HOLD = 0.35;
const LAYOUTS: StudioLayout[] = ['component', 'code', 'split'];
const SCHEMES: StudioScheme[] = ['light', 'dark'];
const slugs = showcases.map(showcase => showcase.slug);
const LAYOUT_ITEMS = [
  { value: 'component', label: 'Component' },
  { value: 'code', label: 'Code' },
  { value: 'split', label: 'Split' },
];
const FORMAT_ITEMS = [
  { value: 'landscape', label: 'Landscape 16:9' },
  { value: 'square', label: 'Square 1:1' },
  { value: 'portrait', label: 'Portrait 4:5' },
];
const BADGE_ITEMS = [
  { value: 'both', label: 'Logo and install' },
  { value: 'logo', label: 'Logo only' },
  { value: 'none', label: 'No badges' },
];
const SHOWCASE_ITEMS = showcases.map(showcase => ({ value: showcase.slug, label: showcase.title }));

const LABELS: Record<StudioLayout, string> = { component: 'Component', code: 'Code', split: 'Split' };

function readParam<T extends string>(key: string, options: readonly T[], fallback: T): T {
  const value = new URLSearchParams(window.location.search).get(key);
  return options.includes(value as T) ? (value as T) : fallback;
}

export function Workbench() {
  const [slug, setSlug] = useState(slugs[0]);
  const [layout, setLayout] = useState<StudioLayout>('split');
  const [format, setFormat] = useState<StudioFormat>('landscape');
  const [scheme, setScheme] = useState<StudioScheme>('light');
  const [badges, setBadges] = useState<StudioBadges>('both');
  const [grid, setGrid] = useState(false);
  const [workspace, setWorkspace] = useState<StudioScheme>('dark');
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stepDone = useRef<Promise<void> | null>(null);
  const { cursor, play, cancel, stageRef, viewRef, scaleRef } = useCursor();

  const showcase = showcases.find(s => s.slug === slug) ?? showcases[0];
  const resolved = useMemo(() => resolveSteps(showcase), [showcase]);
  const steps = showcase.steps;

  const goTo = useCallback(
    (next: number) => {
      const i = (next + steps.length) % steps.length;
      setIndex(i);
      setLayout(steps[i].layout);
      const actions = steps[i].cursor ?? [];
      const done = play(actions, `${showcase.slug}:${i}`);
      stepDone.current = actions.some(action => !action.hide) ? done : null;
    },
    [steps, play, showcase.slug],
  );

  useEffect(() => {
    setSlug(readParam('showcase', slugs, slugs[0]));
    setFormat(readParam('format', Object.keys(FORMATS) as StudioFormat[], 'landscape'));
    setScheme(readParam('scheme', SCHEMES, 'light'));
    setWorkspace(readParam('workspace', SCHEMES, 'dark'));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ showcase: slug, format, scheme, workspace });
    window.history.replaceState(null, '', `?${params}`);
  }, [slug, format, scheme, workspace]);

  useEffect(() => {
    document.documentElement.dataset.workspace = workspace;
  }, [workspace]);

  useEffect(() => {
    cancel();
    setPlaying(false);
    setIndex(0);
    setLayout(showcase.steps[0].layout);
  }, [showcase, cancel]);

  useEffect(() => {
    if (!playing) {
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let alive = true;
    const step = steps[index];
    const advance = (seconds: number) => {
      timer = setTimeout(() => goTo(index + 1), seconds * 1000);
    };
    if (stepDone.current) {
      void stepDone.current.then(() => alive && advance(step.hold ?? STEP_HOLD));
    } else {
      advance(step.duration);
    }
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [playing, index, steps, goTo]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLSelectElement ||
        (event.key === ' ' && event.target instanceof HTMLElement && event.target.closest('button, input'))
      ) {
        return;
      }
      const layoutIndex = Number(event.key) - 1;
      if (LAYOUTS[layoutIndex]) {
        setLayout(LAYOUTS[layoutIndex]);
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(index + 1);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(index - 1);
      } else if (event.key === ' ') {
        event.preventDefault();
        setPlaying(p => !p);
      } else if (event.key === 'c') {
        play(steps[index].cursor ?? [], `${showcase.slug}:${index}`);
      } else if (event.key === 'g') {
        setGrid(g => !g);
      } else if (event.key === 'd') {
        setScheme(s => (s === 'light' ? 'dark' : 'light'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, play, steps, index, showcase.slug]);

  const { state, code } = resolved[index];
  const View = showcase.View;

  return (
    <div className='studio-workbench'>
      <MosaicProvider>
        <aside className='studio-steps'>
          <div className='studio-toolbar-group'>
            <Text
              render={<span />}
              color='foreground-secondary'
            >
              Showcase
            </Text>
            <Select.Root
              alignItemWithTrigger
              items={SHOWCASE_ITEMS}
              value={slug}
              onValueChange={value => setSlug(value)}
            >
              <Select.Trigger aria-label='Showcase' />
              <Select.Popup />
            </Select.Root>
          </div>
          <div className='studio-toolbar-group'>
            <Text
              render={<span />}
              color='foreground-secondary'
            >
              Steps
            </Text>
            <ol>
              {steps.map((step, i) => (
                <li key={step.label}>
                  <button
                    type='button'
                    aria-current={i === index ? 'step' : undefined}
                    onClick={() => {
                      setPlaying(false);
                      goTo(i);
                    }}
                  >
                    <Text
                      render={<span />}
                      color='foreground-secondary'
                    >
                      {i + 1}
                    </Text>
                    <Text render={<span />}>{step.label}</Text>
                    <Text
                      render={<span />}
                      size='xs'
                      color='foreground-secondary'
                    >
                      {LABELS[step.layout]} · {step.duration}s
                      {step.cursor?.some(action => action.click) ? ' · Click' : ''}
                    </Text>
                    {playing && i === index && (
                      <span
                        key={index}
                        className='studio-step-progress'
                        style={{ animationDuration: `${step.duration}s` }}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <Button
            size='sm'
            onClick={() => {
              if (!playing) {
                goTo(index);
              }
              setPlaying(!playing);
            }}
          >
            {playing ? 'Pause' : 'Play'}
          </Button>
          <div className='studio-toolbar-switch studio-workspace-toggle'>
            <Switch
              id='studio-workspace'
              size='sm'
              checked={workspace === 'dark'}
              onChange={event => setWorkspace(event.target.checked ? 'dark' : 'light')}
            />
            <label htmlFor='studio-workspace'>
              <Text render={<span />}>Dark workspace</Text>
            </label>
          </div>
        </aside>
      </MosaicProvider>
      <Stage
        key={slug}
        layout={layout}
        format={format}
        scheme={scheme}
        title={showcase.title}
        badges={badges}
        code={code}
        lang={showcase.lang}
        file={showcase.file}
        focus={showcase.focus}
        cellPadding={showcase.cellPadding}
        plain={showcase.plain}
        grid={grid}
        view={
          View && (
            <MosaicProvider key={slug}>
              <View state={state} />
            </MosaicProvider>
          )
        }
        cursor={cursor}
        stageRef={stageRef}
        viewRef={viewRef}
        scaleRef={scaleRef}
      />
      <MosaicProvider>
        <nav
          className='studio-toolbar'
          aria-label='Stage controls'
        >
          <div className='studio-toolbar-group'>
            <Field.Root>
              <Field.Label>Layout</Field.Label>
              <Select.Root
                alignItemWithTrigger
                items={LAYOUT_ITEMS}
                value={layout}
                onValueChange={value => setLayout(value as StudioLayout)}
              >
                <Select.Trigger />
                <Select.Popup />
              </Select.Root>
            </Field.Root>
            <Field.Root>
              <Field.Label>Format</Field.Label>
              <Select.Root
                alignItemWithTrigger
                items={FORMAT_ITEMS}
                value={format}
                onValueChange={value => setFormat(value as StudioFormat)}
              >
                <Select.Trigger />
                <Select.Popup />
              </Select.Root>
            </Field.Root>
          </div>
          <div className='studio-toolbar-group'>
            <Field.Root>
              <Field.Label>Badges</Field.Label>
              <Select.Root
                alignItemWithTrigger
                items={BADGE_ITEMS}
                value={badges}
                onValueChange={value => setBadges(value as StudioBadges)}
              >
                <Select.Trigger />
                <Select.Popup />
              </Select.Root>
            </Field.Root>
            <div className='studio-toolbar-switch'>
              <Switch
                id='studio-scheme'
                size='sm'
                checked={scheme === 'dark'}
                onChange={event => setScheme(event.target.checked ? 'dark' : 'light')}
              />
              <label htmlFor='studio-scheme'>
                <Text render={<span />}>Dark stage</Text>
              </label>
            </div>
            <div className='studio-toolbar-switch'>
              <Switch
                id='studio-grid'
                size='sm'
                checked={grid}
                onChange={event => setGrid(event.target.checked)}
              />
              <label htmlFor='studio-grid'>
                <Text render={<span />}>8px grid</Text>
              </label>
            </div>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => play(steps[index].cursor ?? [])}
          >
            Replay cursor
          </Button>
        </nav>
      </MosaicProvider>
    </div>
  );
}
