'use client';

import { Button } from '@clerk/mosaic/components/button';
import { SegmentedControl } from '@clerk/mosaic/components/segmented-control';
import { Text } from '@clerk/mosaic/components/text';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import { type PointerEvent, useEffect, useRef, useState } from 'react';

import { type CursorPath, type CursorPathKind, type CursorSample, normalize } from './cursorPath';
import { FORMATS } from './Stage';

const { width: BOARD_W, height: BOARD_H } = FORMATS.landscape;
const SIZES = [24, 32, 40, 56, 80, 120];
const MARGIN = 80;
const STORAGE_KEY = 'studio-cursor-paths';

interface Dot {
  x: number;
  y: number;
  size: number;
}

function randomDot(from?: Dot): Dot {
  for (;;) {
    const size = SIZES[Math.floor(Math.random() * SIZES.length)];
    const dot = {
      x: MARGIN + Math.random() * (BOARD_W - 2 * MARGIN),
      y: MARGIN + Math.random() * (BOARD_H - 2 * MARGIN),
      size,
    };
    if (!from || Math.hypot(dot.x - from.x, dot.y - from.y) > 120) {
      return dot;
    }
  }
}

function load(): CursorPath[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(paths: CursorPath[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  } catch {
    return;
  }
}

function toFile(paths: CursorPath[]) {
  return [
    `import type { CursorPath } from './cursorPath';`,
    ``,
    `export const recordedPaths: CursorPath[] = [`,
    ...paths.map(path => `  ${JSON.stringify(path)},`),
    `];`,
    ``,
  ].join('\n');
}

export function Recorder() {
  const boardRef = useRef<HTMLDivElement>(null);
  const samples = useRef<CursorSample[]>([]);
  const down = useRef<CursorSample | null>(null);
  const [kind, setKind] = useState<CursorPathKind>('move');
  const [from, setFrom] = useState<Dot | null>(null);
  const [to, setTo] = useState<Dot>(() => ({ x: BOARD_W / 2, y: BOARD_H / 2, size: 56 }));
  const [paths, setPaths] = useState<CursorPath[]>([]);
  const [trail, setTrail] = useState<CursorSample[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => setPaths(load()), []);

  const update = (next: CursorPath[]) => {
    setPaths(next);
    save(next);
  };

  const toBoard = (event: { clientX: number; clientY: number; timeStamp: number }): CursorSample => {
    const box = boardRef.current?.getBoundingClientRect() ?? new DOMRect(0, 0, BOARD_W, BOARD_H);
    const scale = box.width / BOARD_W;
    return { t: event.timeStamp, x: (event.clientX - box.left) / scale, y: (event.clientY - box.top) / scale };
  };

  const inside = (sample: CursorSample, dot: Dot) => Math.hypot(sample.x - dot.x, sample.y - dot.y) <= dot.size / 2;

  const landOn = (sample: CursorSample, dot: Dot): [number, number] => [
    Math.max(-1, Math.min(1, (sample.x - dot.x) / (dot.size / 2))),
    Math.max(-1, Math.min(1, (sample.y - dot.y) / (dot.size / 2))),
  ];

  const reset = (next: CursorPathKind) => {
    setKind(next);
    setFrom(null);
    setTrail([]);
    samples.current = [];
    down.current = null;
    setTo(randomDot());
  };

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const events = event.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const raw of events.length ? events : [event.nativeEvent]) {
      samples.current.push(toBoard(raw));
    }
  };

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    const sample = toBoard(event);
    if (kind === 'drag') {
      if (!inside(sample, from ?? to)) {
        return;
      }
      if (!from) {
        setFrom(to);
        setTo(randomDot(to));
      }
      down.current = sample;
      samples.current = [sample];
      return;
    }
    if (!inside(sample, to)) {
      return;
    }
    down.current = sample;
  };

  const onUp = (event: PointerEvent<HTMLDivElement>) => {
    const sample = toBoard(event);
    const pressed = down.current;
    down.current = null;
    if (!pressed) {
      return;
    }
    if (kind === 'drag') {
      if (inside(sample, to)) {
        const path = normalize('drag', samples.current, sample, to.size, landOn(sample, to), 0);
        if (path) {
          update([...paths, path]);
        }
        setTrail(samples.current);
        setFrom(to);
        setTo(randomDot(to));
      }
      samples.current = [];
      return;
    }
    if (from) {
      const recorded = samples.current.filter(s => s.t <= pressed.t);
      const path = normalize('move', recorded, pressed, to.size, landOn(pressed, to), sample.t - pressed.t);
      if (path) {
        update([...paths, path]);
      }
      setTrail(recorded);
    }
    samples.current = [sample];
    setFrom(to);
    setTo(randomDot(to));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(toFile(paths));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const counts = {
    move: paths.filter(p => p.kind === 'move').length,
    drag: paths.filter(p => p.kind === 'drag').length,
  };

  return (
    <MosaicProvider>
      <div className='studio-recorder'>
        <nav className='studio-recorder-bar'>
          <SegmentedControl.Root
            aria-label='Kind'
            value={kind}
            onValueChange={value => reset(value as CursorPathKind)}
          >
            <SegmentedControl.Item value='move'>Click</SegmentedControl.Item>
            <SegmentedControl.Item value='drag'>Drag</SegmentedControl.Item>
          </SegmentedControl.Root>
          <Text
            render={<span />}
            color='foreground-secondary'
          >
            {kind === 'move' ? 'Click the solid dot, then the next one.' : 'Drag from the ring to the solid dot.'}{' '}
            {counts.move} clicks · {counts.drag} drags
          </Text>
          <Button
            variant='outline'
            size='sm'
            disabled={!paths.length}
            onClick={() => update(paths.slice(0, -1))}
          >
            Undo
          </Button>
          <Button
            variant='outline'
            size='sm'
            disabled={!paths.length}
            onClick={() => update([])}
          >
            Clear
          </Button>
          <Button
            size='sm'
            disabled={!paths.length}
            onClick={() => void copy()}
          >
            {copied ? 'Copied' : 'Copy cursor-paths.ts'}
          </Button>
        </nav>
        <div
          ref={boardRef}
          className='studio-recorder-board'
          onPointerMove={onMove}
          onPointerDown={onDown}
          onPointerUp={onUp}
        >
          <svg
            viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
            aria-hidden
          >
            {trail.length > 1 && <polyline points={trail.map(s => `${s.x},${s.y}`).join(' ')} />}
            {from && (
              <circle
                data-role={kind === 'drag' ? 'grab' : 'previous'}
                cx={from.x}
                cy={from.y}
                r={from.size / 2}
              />
            )}
            <circle
              data-role='target'
              cx={to.x}
              cy={to.y}
              r={to.size / 2}
            />
          </svg>
        </div>
      </div>
    </MosaicProvider>
  );
}
