'use client';

import * as React from 'react';

import { XRAY_LAYERS, XRAY_RULES, type XrayMeta } from '@/lib/xray/rules';

type Region = XrayMeta & { id: string; top: number; left: number; width: number; height: number };

const LAYER_COLORS: Partial<Record<XrayMeta['layer'], { fill: string; border: string }>> = {
  'all-in-one': {
    fill: 'light-dark(var(--color-purple-300), var(--color-purple-700))',
    border: 'light-dark(var(--color-purple-500), var(--color-purple-400))',
  },
  blocks: {
    fill: 'light-dark(var(--color-sky-400), var(--color-sky-800))',
    border: 'var(--color-sky-500)',
  },
};

const RADIUS = 10;
const BORDER = 1;
const INSET = 2;
const LABEL_HEIGHT = 20;
const LABEL_RADIUS = RADIUS - BORDER - INSET;
const TARGETS = [{ rule: '.cl-profile', element: '.cl-profile-layout', pad: 0, padBottom: 0 }];

function measure(container: HTMLElement, target: HTMLElement): Region[] {
  const base = container.getBoundingClientRect();
  const regions: Region[] = [];
  for (const { rule: selector, element, pad, padBottom } of TARGETS) {
    const rule = XRAY_RULES.find(item => item.selector === selector);
    target.querySelectorAll(selector).forEach((node, index) => {
      const meta = rule?.resolve(node);
      const box = (node.matches(element) ? node : node.querySelector(element)) ?? node;
      const rect = box.getBoundingClientRect();
      if (!meta || rect.width === 0) {
        return;
      }
      regions.push({
        ...meta,
        id: `${selector}-${index}`,
        top: rect.top - base.top - pad,
        left: rect.left - base.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad + padBottom,
      });
    });
  }
  return regions;
}

export function ClerkOutline({ target, active }: { target: HTMLElement | null; active: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [regions, setRegions] = React.useState<Region[]>([]);

  React.useEffect(() => {
    const container = ref.current;
    if (!active || !container || !target) {
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setRegions(measure(container, target)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(target);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, target]);

  return (
    <div
      ref={ref}
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-[5]'
      style={{
        opacity: active ? 1 : 0,
        transition: `opacity var(--cl-duration-fast, 0.1s) ${active ? 'var(--cl-ease-enter, ease-out)' : 'var(--cl-ease-exit, ease-in)'}`,
      }}
    >
      {regions.map(region => {
        const fallback = XRAY_LAYERS[region.layer].color;
        const colors = LAYER_COLORS[region.layer] ?? { fill: fallback, border: fallback };
        const root = region.layer === 'all-in-one';
        return (
          <div
            key={region.id}
            className='absolute border'
            style={{
              top: region.top,
              left: region.left,
              width: region.width,
              height: region.height,
              borderColor: colors.border,
              borderWidth: BORDER,
              borderRadius: RADIUS,
            }}
          >
            <span
              className='mono-2 absolute flex items-center gap-1.5 whitespace-nowrap px-1.5 text-[11px] font-[560]'
              style={{
                backgroundColor: colors.fill,
                color: 'light-dark(#0f0d0b, #ffffff)',
                height: LABEL_HEIGHT,
                right: INSET,
                ...(root
                  ? { top: INSET, borderRadius: `3px ${LABEL_RADIUS}px 3px 3px` }
                  : { bottom: INSET, borderRadius: `3px 3px ${LABEL_RADIUS}px 3px` }),
              }}
            >
              {region.name}
              {region.hooks.length > 0 && <span className='font-[460] max-sm:hidden'>{region.hooks.join(' · ')}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
