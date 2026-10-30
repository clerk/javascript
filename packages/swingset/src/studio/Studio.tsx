'use client';

import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Stage } from './Stage';
import type { Showcase, StudioBadges, StudioFormat, StudioScheme } from './types';
import { useCursor } from './useCursor';

const LOOP_HOLD = 1.2;

export interface StudioOptions {
  step?: number;
  hold?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  cursor?: boolean;
  badges?: StudioBadges;
  format?: StudioFormat;
  scheme?: StudioScheme;
}

export function resolveSteps<State>(showcase: Showcase<State>) {
  let state = showcase.initialState;
  let code = showcase.code?.(state) ?? '';
  return showcase.steps.map(step => {
    if (step.state) {
      state = { ...state, ...step.state };
      code = showcase.code?.(state) ?? code;
    }
    if (step.code !== undefined) {
      code = step.code;
    }
    return { state, code };
  });
}

export function Studio<State>({ showcase, options = {} }: { showcase: Showcase<State>; options?: StudioOptions }) {
  const format = options.format ?? showcase.format ?? 'landscape';
  const scheme = options.scheme ?? showcase.scheme ?? 'light';
  const steps = showcase.steps;
  const resolved = useMemo(() => resolveSteps(showcase), [showcase]);

  const [index, setIndexState] = useState(() => Math.min(Math.max((options.step ?? 1) - 1, 0), steps.length - 1));
  const [cycle, setCycle] = useState(0);
  const [done, setDone] = useState(false);
  const indexRef = useRef(index);
  const stepStart = useRef(0);
  const playing = useRef(options.autoplay !== false && !options.hold);

  const { cursor, play, cancel, stageRef, viewRef, scaleRef } = useCursor();

  const setIndex = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), steps.length - 1);
      indexRef.current = clamped;
      stepStart.current = performance.now() / 1000;
      setIndexState(clamped);
    },
    [steps.length],
  );

  const restart = useCallback(() => {
    setCycle(c => c + 1);
    setDone(false);
    setIndex(0);
  }, [setIndex]);

  useEffect(() => {
    stepStart.current = performance.now() / 1000;
    let frame = 0;
    const tick = () => {
      const elapsed = performance.now() / 1000 - stepStart.current;
      const current = indexRef.current;
      const duration = steps[current].duration;
      if (playing.current) {
        if (current < steps.length - 1 && elapsed >= duration) {
          setIndex(current + 1);
        } else if (current === steps.length - 1 && elapsed >= duration + LOOP_HOLD) {
          if (options.loop === false) {
            playing.current = false;
            setDone(true);
          } else {
            restart();
          }
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [steps, setIndex, restart, options.loop]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === ' ') {
        playing.current = !playing.current;
        event.preventDefault();
      } else if (event.key === 'ArrowRight') {
        setIndex(indexRef.current + 1);
      } else if (event.key === 'ArrowLeft') {
        setIndex(indexRef.current - 1);
      } else if (event.key === 'r') {
        playing.current = true;
        restart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setIndex, restart]);

  useEffect(() => {
    play(options.cursor === false ? [] : (steps[index].cursor ?? []), `${showcase.slug}:${index}`);
    return cancel;
  }, [index, cycle, steps, showcase.slug, options.cursor, play, cancel]);

  const step = steps[index];
  const { state, code } = resolved[index];
  const View = showcase.View;

  return (
    <Stage
      layout={step.layout}
      format={format}
      scheme={scheme}
      title={showcase.title}
      badges={options.badges}
      code={code}
      lang={showcase.lang}
      file={showcase.file}
      focus={showcase.focus}
      view={
        View && (
          <MosaicProvider key={cycle}>
            <View state={state} />
          </MosaicProvider>
        )
      }
      cursor={cursor}
      stageRef={stageRef}
      viewRef={viewRef}
      scaleRef={scaleRef}
      data-step={index + 1}
      data-steps={steps.length}
      data-done={done || undefined}
    />
  );
}
