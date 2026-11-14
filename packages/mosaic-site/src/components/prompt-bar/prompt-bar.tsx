'use client';

import clsx from 'clsx';
import { motion, spring, useMotionTemplate, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { type CSSProperties, type RefObject, useEffect, useId, useReducer, useRef, useState } from 'react';
import { Button } from 'react-aria-components';

import { GLASS_EDGES, GLASS_PRISM, GLASS_SCHEME, glassStyle, type GlassTone } from '@/components/glass';

import { CopyCheckIcon } from './copy-check-icon';

const BAR_HEIGHT = 2.75;
const PAD = 0.4375;
const BUBBLE = BAR_HEIGHT - 2 * PAD;

const EASE = {
  compress: String(spring({ keyframes: [0, 1], stiffness: 1406, damping: 78 })),
  release: String(spring(0.144, 0.18)),
};

const increment = (n: number) => n + 1;

const PROMPT_FADE = 32;

function PromptScroller({ scrollerRef: ref, children }: { scrollerRef: RefObject<HTMLSpanElement>; children: string }) {
  const { scrollX } = useScroll({ container: ref, axis: 'x' });
  const before = useTransform(scrollX, x => Math.min(x, PROMPT_FADE));
  const after = useTransform(scrollX, x => {
    const el = ref.current;
    if (!el) {
      return PROMPT_FADE;
    }
    return Math.min(Math.max(el.scrollWidth - el.clientWidth - x, 0), PROMPT_FADE);
  });
  const mask = useMotionTemplate`linear-gradient(to right, transparent, #000 ${before}px, #000 calc(100% - ${after}px), transparent)`;

  return (
    <motion.span
      ref={ref}
      style={{ maskImage: mask }}
      className={clsx(
        'code-1 text-(--glass-ink) flex min-w-0 flex-1 items-center overflow-x-scroll whitespace-nowrap pl-1.5 pr-3 text-left',
        'scrollbar-none',
      )}
      tabIndex={-1}
    >
      <span className='trim-cap'>{children}</span>
    </motion.span>
  );
}

export function PromptBar({
  command,
  align = 'start',
  className,
  tone = { light: 'gray-50', dark: 'gray-950' },
}: {
  command: string;
  align?: 'center' | 'start';
  className?: string;
  tone?: GlassTone | { light: GlassTone; dark: GlassTone };
}) {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copyTimer.current), []);
  function showCopied() {
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 2000);
  }
  const [copies, countCopy] = useReducer(increment, 0);
  const scrollerRef = useRef<HTMLSpanElement>(null);
  const promptTextId = useId();
  const reduce = useReducedMotion();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(command);
      showCopied();
      countCopy();
    } catch (err) {
      console.error('Failed to copy command: ', err);
    }
  }

  return (
    <div className={clsx('flex w-full', align === 'start' ? 'justify-start' : 'justify-center', className)}>
      <div
        className={clsx(
          'motion-reduce:transition-none! motion-reduce:**:transition-none! w-[18.375rem] max-w-full',
          GLASS_SCHEME,
        )}
        style={
          {
            ...glassStyle(tone),
            '--bar-h': `${BAR_HEIGHT}rem`,
            '--glass-pad': `${PAD}rem`,
            '--glass-r': 'calc(var(--bar-h) / 2)',
            '--bubble': `${BUBBLE}rem`,
          } as CSSProperties
        }
      >
        <Button
          aria-label='Copy command'
          aria-describedby={promptTextId}
          onPress={() => void handleCopy()}
          onKeyDown={e => {
            const scroller = scrollerRef.current;
            if (!scroller || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) {
              e.continuePropagation();
              return;
            }
            e.preventDefault();
            scroller.scrollBy({
              left: (e.key === 'ArrowLeft' ? -0.5 : 0.5) * scroller.clientWidth,
              behavior: reduce ? 'instant' : 'smooth',
            });
          }}
          className='data-focus-visible:outline-focus rounded-(--glass-r) block w-full cursor-pointer'
        >
          {({ isPressed }) => (
            <span className={clsx('h-(--bar-h) rounded-(--glass-r) relative isolate flex min-w-0', GLASS_EDGES)}>
              <span
                aria-hidden
                className='bg-(--glass-fill) absolute inset-0 -z-20 rounded-[inherit] backdrop-blur-md [box-shadow:var(--glass-shadow)]'
              />
              <span
                aria-hidden
                className={GLASS_PRISM}
              />

              <span className='rounded-l-(--glass-r) relative flex min-w-0 flex-1 overflow-hidden pl-[calc(var(--glass-pad)+0.75rem)]'>
                <span
                  aria-hidden
                  className='code-1 text-(--glass-ink) flex items-center opacity-50'
                >
                  <span className='trim-cap'>$</span>
                </span>
                <span className='flex min-w-0 flex-1'>
                  <PromptScroller scrollerRef={scrollerRef}>{command}</PromptScroller>
                </span>
              </span>

              <span className='py-(--glass-pad) pr-(--glass-pad) flex flex-none items-center'>
                <span
                  className='size-(--bubble) bg-(--glass-action-bg) text-(--glass-action-ink) grid place-items-center rounded-full [scale:var(--prompt-press)]'
                  style={
                    {
                      '--prompt-press': isPressed ? 0.94 : 1,
                      transition: `--prompt-press ${isPressed ? EASE.compress : EASE.release}`,
                    } as CSSProperties
                  }
                >
                  <span className='grid [scale:calc((1_+_(1_-_var(--prompt-press))_*_1.2)_/_var(--prompt-press))]'>
                    <CopyCheckIcon copied={copied} />
                  </span>
                </span>
              </span>
            </span>
          )}
        </Button>

        <span
          id={promptTextId}
          className='sr-only'
        >
          {command}
        </span>
        <span
          className='sr-only'
          aria-live='polite'
        >
          {copied && <span key={copies}>Command copied</span>}
        </span>
      </div>
    </div>
  );
}
