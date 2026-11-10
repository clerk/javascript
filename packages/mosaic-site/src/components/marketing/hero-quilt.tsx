'use client';
import { motion, useReducedMotion } from 'motion/react';
import * as React from 'react';

import { BigTileGrid, QUILT } from '@/components/marketing/big-tile-wall';
import { TileStage } from '@/components/marketing/tile-stage';
import { PromptBar } from '@/components/prompt-bar/prompt-bar';
import { AGENT_PROMPT } from '@/lib/agent-prompt';

const { designs: START, bigColumns: COLUMNS } = QUILT;
const EASE = [0.22, 1, 0.36, 1] as const;
const TILE_START = 0.4;
const COLUMN_STEP = 0.07;
const LINE_COLOR = 'color-mix(in srgb, currentColor 11%, transparent)';
const PITCH = 'calc(clamp(22rem, 58vw, 50rem) / 6)';

const GRID_MASK = 'radial-gradient(ellipse 72vw 61vh at 50% 50%, black 20%, transparent 100%)';

function Grid() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden='true'
      className='pointer-events-none absolute'
      initial={{ opacity: 0, transform: reduced ? 'scale(1)' : 'scale(0.94)' }}
      animate={{ opacity: 1, transform: 'scale(1)' }}
      transition={{ duration: reduced ? 0.3 : 1.2, delay: 0.1, ease: EASE }}
      style={{
        left: `calc(${PITCH} * -24)`,
        right: `calc(${PITCH} * -24)`,
        top: `calc(${PITCH} * -14)`,
        bottom: `calc(${PITCH} * -14)`,
        backgroundImage: `linear-gradient(to right, ${LINE_COLOR} 1px, transparent 1px), linear-gradient(to bottom, ${LINE_COLOR} 1px, transparent 1px)`,
        backgroundSize: `${PITCH} ${PITCH}`,
        maskImage: GRID_MASK,
        WebkitMaskImage: GRID_MASK,
      }}
    />
  );
}

const useRise = () => {
  const reduced = useReducedMotion();
  return (delay: number) => ({
    initial: {
      opacity: 0,
      transform: reduced ? 'scale(1)' : 'scale(0.95)',
      filter: reduced ? 'blur(0px)' : 'blur(4px)',
    },
    animate: { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
    transition: { duration: reduced ? 0.3 : 0.6, delay: reduced ? 0 : delay, ease: EASE },
  });
};

export function HeroQuilt() {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [failed, setFailed] = React.useState(false);
  const onFail = React.useCallback(() => setFailed(true), []);
  const rise = useRise();
  const lightAt = TILE_START + COLUMN_STEP * COLUMNS + 0.7;
  return (
    <section className='bg-background text-foreground relative isolate flex min-h-[calc(100svh-8rem)] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-10 text-center'>
      <div
        ref={anchorRef}
        className='relative aspect-[3/1] w-[clamp(22rem,58vw,50rem)]'
      >
        <Grid />
        {failed ? (
          <div className='relative grid grid-cols-6'>
            {START.map((design, index) => (
              <div
                key={`${design}-${index}`}
                className='relative aspect-square'
              >
                <BigTileGrid
                  designs={[design]}
                  bigColumns={1}
                  built
                  fromOpener={false}
                  run={0}
                  appear='static'
                  lightFrom='bottom'
                  matte
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {failed ? null : (
        <TileStage
          anchorRef={anchorRef}
          designs={START}
          onFail={onFail}
        />
      )}
      <motion.p
        {...rise(lightAt)}
        className='mt-12 bg-gradient-to-r from-[#6c47ff] via-[#8f74ff] to-[#c4b5fd] bg-clip-text text-sm font-medium uppercase tracking-[0.22em] text-transparent'
      >
        Mosaic
      </motion.p>
      <motion.h1
        {...rise(lightAt + 0.1)}
        className='sm:text-4_5xl mt-3 max-w-3xl text-balance text-3xl/9 font-bold tracking-tight md:text-5xl lg:text-6xl'
      >
        Production-ready UI your agents can build with.
      </motion.h1>
      <motion.p
        {...rise(lightAt + 0.2)}
        className='mt-4 max-w-xl text-balance text-base/6 text-neutral-600 sm:text-lg dark:text-neutral-400'
      >
        The agent-native UI kit, powered by Clerk.
      </motion.p>
      <motion.div
        {...rise(lightAt + 0.3)}
        className='mt-8 flex w-full max-w-xl justify-center'
      >
        <PromptBar
          command={AGENT_PROMPT}
          align='center'
        />
      </motion.div>
    </section>
  );
}
