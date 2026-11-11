'use client';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { XRAY_LAYERS, XRAY_RULES, type XrayLayer } from '@/lib/xray/rules';
import { createSweep, type Sweep } from '@/lib/xray/sweep';
const DURATION = 1100;
const END = 1.15;
type Region = {
  id: string;
  layer: XrayLayer;
  name: string;
  hooks: string[];
  top: number;
  left: number;
  width: number;
  height: number;
};
type Clip = { top: number; right: number; bottom: number; left: number };
const scrollerOf = (element: Element, boundary: Element) => {
  let node: Element | null = element.parentElement;
  while (node && node !== boundary) {
    const overflow = getComputedStyle(node).overflowY;
    if (overflow === 'auto' || overflow === 'scroll') {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};
function measure(container: HTMLElement): { regions: Region[]; clip: Clip | null } {
  const base = container.getBoundingClientRect();
  const regions: Region[] = [];
  let clip: Clip | null = null;
  XRAY_RULES.forEach((rule, ruleIndex) => {
    container.querySelectorAll(rule.selector).forEach((element, index) => {
      const meta = rule.resolve(element);
      if (!meta) {
        return;
      }
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }
      if (!clip) {
        const scroller = scrollerOf(element, container);
        const bounds = scroller?.getBoundingClientRect();
        if (bounds) {
          clip = {
            top: bounds.top - base.top,
            left: bounds.left - base.left,
            right: base.right - bounds.right,
            bottom: base.bottom - bounds.bottom,
          };
        }
      }
      regions.push({
        id: `${ruleIndex}-${index}`,
        ...meta,
        top: rect.top - base.top,
        left: rect.left - base.left,
        width: rect.width,
        height: rect.height,
      });
    });
  });
  return { regions, clip };
}
export function XrayOverlay({ target, active }: { target: HTMLElement | null; active: boolean }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const [scan, setScan] = React.useState<{ regions: Region[]; clip: Clip | null }>({ regions: [], clip: null });
  const [progress, setProgress] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const progressRef = React.useRef(0);
  const sweepRef = React.useRef<Sweep | null>(null);
  if (active && !mounted) {
    setMounted(true);
  }
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!mounted || !canvas || !root) {
      return;
    }
    const sweep = createSweep(canvas);
    sweepRef.current = sweep;
    const fit = () => {
      sweep?.resize(root.clientWidth, root.clientHeight);
      setHeight(root.clientHeight);
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    return () => {
      observer.disconnect();
      sweep?.dispose();
      sweepRef.current = null;
    };
  }, [mounted]);
  React.useEffect(() => {
    if (!mounted) {
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = progressRef.current;
    const to = active ? END : 0;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = reduced ? 1 : Math.min(1, (now - start) / DURATION);
      const eased = 1 - (1 - t) ** 3;
      const value = from + (to - from) * eased;
      progressRef.current = value;
      sweepRef.current?.draw(value);
      setProgress(value);
      if (t < 1) {
        frame = requestAnimationFrame(step);
      } else if (!active) {
        setMounted(false);
      }
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, mounted]);
  React.useEffect(() => {
    if (!mounted || !target) {
      return;
    }
    let frame = 0;
    let last = '';
    const tick = () => {
      const next = measure(target);
      const key = JSON.stringify(next);
      if (key !== last) {
        last = key;
        setScan(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mounted, target]);
  if (!mounted) {
    return null;
  }
  const swept = progress * height;
  const { clip } = scan;
  return (
    <div
      ref={rootRef}
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-20'
      style={
        clip
          ? { clipPath: `inset(${clip.top}px ${clip.right}px ${clip.bottom}px ${clip.left}px round 8px)` }
          : undefined
      }
    >
      <canvas
        ref={canvasRef}
        className='absolute inset-0 size-full'
      />
      {scan.regions.map(region => {
        const { color } = XRAY_LAYERS[region.layer];
        if (region.top > swept) {
          return null;
        }
        return (
          <div
            key={region.id}
            className='absolute rounded-[10px] border'
            style={{
              top: region.top,
              left: region.left,
              width: region.width,
              height: region.height,
              borderColor: color,
              backgroundColor: `${color}12`,
            }}
          >
            <div
              className={cn(
                'absolute flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium leading-none text-white',
                region.layer === 'all-in-one' ? 'left-2 top-0 -translate-y-1/2' : 'bottom-0 right-2 translate-y-1/2',
              )}
              style={{ backgroundColor: color }}
            >
              {region.name}
              {region.hooks.length > 0 ? (
                <span className='font-mono opacity-80'>{region.hooks.join(' · ')}</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export function XrayLegend() {
  return (
    <div className='flex items-center gap-3 px-2 text-xs'>
      {Object.values(XRAY_LAYERS).map(layer => (
        <span
          key={layer.label}
          className='flex items-center gap-1.5'
        >
          <span
            className='size-2 rounded-full'
            style={{ backgroundColor: layer.color }}
          />
          {layer.label}
        </span>
      ))}
    </div>
  );
}
