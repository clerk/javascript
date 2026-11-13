'use client';

import { inertProps } from '@clerk/shared/inert';
import clsx from 'clsx';
import { motion, spring, useInView, useMotionTemplate, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { type CSSProperties, type RefObject, useEffect, useId, useReducer, useRef, useState } from 'react';
import { useFocusVisible } from 'react-aria';
import { Button } from 'react-aria-components';

import { GLASS_EDGES, GLASS_PRISM, GLASS_SCHEME, glassStyle, type GlassTone } from '@/components/glass';

import { AGENT_BRAND, BUBBLE_SHADOW_SM, CLUSTER_WIDE } from './agent-brand';
import { CopyCheckIcon } from './copy-check-icon';

// In rem.
const BAR_HEIGHT = 2.75;
const PAD = 0.4375;
const BUBBLE = BAR_HEIGHT - 2 * PAD;

const ICON_TRAVEL = 12;
const ICON_SQUASH = { scaleX: 0.88, scaleY: 1.04 };

const COMPRESS = { stiffness: 1406, damping: 78 };
const RELEASE = { visualDuration: 0.144, bounce: 0.18 };

const EASE = {
  compress: String(spring({ keyframes: [0, 1], ...COMPRESS })),
  release: String(spring(RELEASE.visualDuration, RELEASE.bounce)),
  stretch: String(spring({ keyframes: [0, 1], stiffness: 812, damping: 62 })),
  snapBack: String(spring(0.176, 0.18)),
  fade: String(spring(0.15, 0)),
  slide: String(spring(0.22, 0.075)),
};

const SLIDE = ['translate', 'opacity', 'scale'].map(p => `${p} ${EASE.slide}`).join(', ');

const SPILL = [
  { x: 0, y: 0, rotate: 0, scale: 1 },
  { x: 3, y: -2, rotate: 12, scale: 0.92 },
  { x: 1.5, y: 2.5, rotate: -18, scale: 0.86 },
  { x: -2, y: -1, rotate: 25, scale: 0.8 },
];

const UNSTACK = SPILL.map((_, i) => String(spring(RELEASE.visualDuration + i * 0.026, RELEASE.bounce + i * 0.025)));

const increment = (n: number) => n + 1;

function AgentCycle({ agents, visible, stacked }: { agents: typeof CLUSTER_WIDE; visible: number; stacked: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const reduce = useReducedMotion();
  const [step, advance] = useReducer(increment, 0);

  useEffect(() => {
    if (!inView || reduce || stacked) {
      return;
    }
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      advance();
      interval = window.setInterval(advance, 6000);
    }, 3000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [inView, reduce, stacked]);

  const n = agents.length;

  return (
    <span
      ref={ref}
      className='grid flex-none'
      style={{ width: `calc(${visible - 1} * var(--bubble-step) + var(--bubble))` }}
      aria-hidden
    >
      {agents.map(({ name, Logo }, k) => {
        const coord = (((k - step) % n) + n) % n;
        // The one leaving parks off the left edge, so it doesn't slide across while fading.
        const pos = coord === n - 1 ? -1 : coord;
        const shown = pos >= 0 && pos < visible;
        const brand = AGENT_BRAND[name];
        const spill = SPILL[pos] ?? SPILL[0];
        return (
          <span
            key={name}
            className='size-(--bubble) [grid-area:1/1]'
            style={{
              translate: `calc(${pos} * var(--bubble-step))`,
              opacity: shown ? 1 : 0,
              scale: shown ? 1 : 0.8,
              zIndex: n - pos,
              transition: SLIDE,
            }}
          >
            <span
              className='grid size-full place-items-center rounded-full'
              style={{
                background: brand.bg,
                boxShadow: `${BUBBLE_SHADOW_SM[brand.tone]}, var(--glass-shadow)`,
                transform: stacked
                  ? `translate(calc(${-pos} * var(--bubble-step) + ${spill.x}px), ${spill.y}px) rotate(${spill.rotate}deg) scale(${spill.scale})`
                  : 'translate(0px, 0px) rotate(0deg) scale(1)',
                transition: `transform ${stacked ? EASE.compress : (UNSTACK[pos] ?? EASE.release)}`,
              }}
            >
              <Logo className={clsx('size-[calc(0.6*var(--bubble))]', brand.logo)} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

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
      // Chrome gives a scroll container its own tab stop, which would add a second focus stop
      // inside the button.
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
  variant = 'prompt',
}: {
  command: string;
  align?: 'center' | 'start';
  className?: string;
  tone?: GlassTone | { light: GlassTone; dark: GlassTone };
  variant?: 'prompt' | 'command';
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
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { isFocusVisible } = useFocusVisible();
  const isCommand = variant === 'command';
  const engaged = isCommand || hovered || (focused && isFocusVisible) || copied;
  const noun = isCommand ? 'command' : 'prompt';
  const reduce = useReducedMotion();

  const foldEase = engaged ? EASE.compress : EASE.release;
  const fade = (shown: boolean) => ({ opacity: shown ? 1 : 0, filter: shown ? 'blur(0px)' : 'blur(4px)' });

  useEffect(() => {
    if (engaged) {
      scrollerRef.current?.scrollTo({ left: 0 });
    }
  }, [engaged]);

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
          'w-(--bar-w) motion-reduce:transition-none! motion-reduce:**:transition-none! max-w-full',
          GLASS_SCHEME,
        )}
        style={
          {
            '--bar-w': engaged ? '18.375rem' : '14.95rem',
            transition: `width ${engaged ? EASE.stretch : EASE.snapBack}`,
            ...glassStyle(tone),
            '--bar-h': `${BAR_HEIGHT}rem`,
            '--glass-pad': `${PAD}rem`,
            '--glass-r': 'calc(var(--bar-h) / 2)',
            '--bubble': `${BUBBLE}rem`,
            '--bubble-step': 'calc(0.66 * var(--bubble))',
            '--stack-spill': '3px',
          } as CSSProperties
        }
      >
        <Button
          aria-label={`Copy ${noun}`}
          // `aria-label` suppresses the command rendered inside, so the description carries it.
          aria-describedby={promptTextId}
          onPress={() => void handleCopy()}
          onHoverChange={setHovered}
          onFocusChange={setFocused}
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
              {/* The shadow is cast by the fill, not the bar: the fill's backdrop blur makes Safari
                  snap the bar's edge rings to device pixels, and a shadow painted by the bar at a
                  fractional position sits a hairline off them. */}
              <span
                aria-hidden
                className='bg-(--glass-fill) absolute inset-0 -z-20 rounded-[inherit] backdrop-blur-md [box-shadow:var(--glass-shadow)]'
              />
              <span
                aria-hidden
                className={GLASS_PRISM}
              />

              <span
                className={clsx(
                  'rounded-l-(--glass-r) relative flex min-w-0 flex-1 overflow-hidden',
                  isCommand
                    ? 'pl-[calc(var(--glass-pad)+0.75rem)]'
                    : 'pl-[calc(var(--glass-pad)+0.125rem+var(--bubble)+var(--stack-spill))]',
                )}
              >
                {isCommand && (
                  <span
                    aria-hidden
                    className='code-1 text-(--glass-ink) flex items-center opacity-50'
                  >
                    <span className='trim-cap'>$</span>
                  </span>
                )}
                <span
                  className='flex min-w-0 flex-1'
                  {...inertProps(!engaged)}
                  style={{ opacity: engaged ? 1 : 0, transition: `opacity ${EASE.fade} ${engaged ? '80ms' : '0ms'}` }}
                >
                  <PromptScroller scrollerRef={scrollerRef}>{command}</PromptScroller>
                </span>
              </span>

              {!isCommand && (
                <span className='pointer-events-none absolute inset-y-0 left-[calc(var(--glass-pad)+0.125rem)] z-10 flex items-center'>
                  <AgentCycle
                    agents={CLUSTER_WIDE}
                    visible={4}
                    stacked={engaged}
                  />
                </span>
              )}

              <span className='py-(--glass-pad) pr-(--glass-pad) flex flex-none items-center'>
                <motion.span
                  className={clsx(
                    'h-(--bubble) relative grid items-center justify-end overflow-hidden rounded-full [scale:var(--prompt-press)]',
                    'bg-(--glass-action-bg) text-(--glass-action-ink)',
                  )}
                  initial={false}
                  // A length, not var(--bubble): Motion can measure from auto, but not toward a variable.
                  animate={{ width: engaged ? `${BUBBLE}rem` : 'auto' }}
                  transition={{
                    width: reduce ? { duration: 0 } : { type: 'spring', ...(engaged ? COMPRESS : RELEASE) },
                  }}
                  style={
                    {
                      '--prompt-press': isPressed ? 0.94 : 1,
                      transition: `--prompt-press ${isPressed ? EASE.compress : EASE.release}`,
                    } as CSSProperties
                  }
                >
                  <span
                    className='body-3 grid origin-right whitespace-nowrap'
                    style={{
                      transform: `translateX(${engaged ? ICON_TRAVEL : 0}px) scaleX(${engaged ? 0.95 : 1})`,
                      transition: `transform ${foldEase}`,
                    }}
                  >
                    {/* Safari sizes this fade's compositor layer to the trimmed box and clips the
                        descenders hanging below it. The padding, canceled by the negative margin,
                        covers them; will-change keeps the layer from being rebuilt between states. */}
                    <span
                      className='-my-1 px-4 py-1 will-change-[opacity,filter] [grid-area:1/1]'
                      style={{ ...fade(!engaged), transition: `opacity ${EASE.fade}, filter ${EASE.fade}` }}
                    >
                      <span className='trim-cap'>Copy {noun}</span>
                    </span>
                  </span>
                  <span
                    className='w-(--bubble) absolute inset-y-0 right-0 grid origin-right place-items-center'
                    style={{
                      ...fade(engaged),
                      transform: engaged
                        ? 'translateX(0px) scale(1, 1)'
                        : `translateX(${-ICON_TRAVEL}px) scale(${ICON_SQUASH.scaleX}, ${ICON_SQUASH.scaleY})`,
                      transition: `opacity ${EASE.fade}, filter ${EASE.fade}, transform ${foldEase}`,
                    }}
                  >
                    {/* Undoes the pill's press scale, then swells past it. */}
                    <span className='grid [scale:calc((1_+_(1_-_var(--prompt-press))_*_1.2)_/_var(--prompt-press))]'>
                      <CopyCheckIcon copied={copied} />
                    </span>
                  </span>
                </motion.span>
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
          {/* Remounted per copy: an unchanged message isn't re-announced. */}
          {copied && <span key={copies}>{isCommand ? 'Command copied' : 'Prompt copied'}</span>}
        </span>
      </div>
    </div>
  );
}
