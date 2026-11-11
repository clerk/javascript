'use client';
import clsx from 'clsx';
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { BigTileGrid } from '@/components/marketing/big-tile-wall';
import { useTileTune } from '@/components/marketing/tile-settings';
import { Tray } from '@/components/marketing/tile-tray';

const EASE = [0.22, 1, 0.36, 1] as const;
const COLUMNS = 6;
const INTERACTIVE = 'a,button,input,select,textarea,[role="button"]';

type Focus = { index: number; left: number; top: number; size: number; nudgeX: number; nudgeY: number };
const EDGE = 16;
const TRAY_ROOM = 72;

export function TileQuilt({ designs }: { designs: string[] }) {
  const reduced = Boolean(useReducedMotion());
  const tune = useTileTune();
  const FOCUS_SCALE = tune.focusScale;
  const lift = reduced ? 0.2 : tune.focusDuration;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [current, setCurrent] = React.useState(designs);
  const [built, setBuilt] = React.useState(false);
  const [focus, setFocus] = React.useState<Focus | null>(null);
  const [lifted, setLifted] = React.useState<number | null>(null);
  const rows = Math.ceil(designs.length / COLUMNS);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const smoothX = useSpring(pointerX, { stiffness: tune.lightStiffness, damping: tune.lightDamping, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: tune.lightStiffness, damping: tune.lightDamping, mass: 0.6 });
  const lightX = useTransform(smoothX, value => `${(tune.lightFollow ? value : tune.lightX / 100) * 100}%`);
  const lightY = useTransform(smoothY, value => `${(tune.lightFollow ? value : tune.lightY / 100) * 100}%`);
  const [rootWidth, setRootWidth] = React.useState(0);
  const lightPx = (tune.lightRadius / 100) * rootWidth;
  const light = useMotionTemplate`radial-gradient(circle ${lightPx}px at ${lightX} ${lightY}, rgba(255,255,255,${tune.lightIntensity}) 0%, rgba(255,255,255,0) 100%)`;

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const close = React.useCallback(() => {
    tiltX.set(0);
    tiltY.set(0);
    setLifted(null);
    setFocus(null);
  }, [tiltX, tiltY]);
  const springX = useSpring(tiltX, { stiffness: 160, damping: 22, mass: 0.5 });
  const springY = useSpring(tiltY, { stiffness: 160, damping: 22, mass: 0.5 });
  const rotateY = useTransform(springX, value => value * tune.focusTilt);
  const rotateX = useTransform(springY, value => value * -tune.focusTilt);
  const edge = useTransform([springX, springY], ([x, y]: number[]) =>
    [
      `0 0 0 1px color-mix(in srgb, ${tune.grout} 78%, black)`,
      ...Array.from(
        { length: tune.focusDepth },
        (_, step) =>
          `${-x * (step + 1) * 0.7}px ${-y * (step + 1) * 0.7}px 0 color-mix(in srgb, ${tune.grout} ${100 - (step + 1) * 6}%, black)`,
      ),
      `${-x * 14}px ${24 - y * 14}px 60px -18px rgba(30,18,80,${tune.focusShadow})`,
    ].join(', '),
  );
  const tileRef = React.useRef<HTMLDivElement>(null);
  const specX = useMotionValue('50%');
  const specY = useMotionValue('50%');
  const specular = useMotionTemplate`radial-gradient(circle ${lightPx / tune.focusScale}px at ${specX} ${specY}, rgba(255,255,255,${tune.lightIntensity}) 0%, rgba(255,255,255,0) 100%)`;

  useAnimationFrame(() => {
    const root = rootRef.current?.getBoundingClientRect();
    const tile = tileRef.current?.getBoundingClientRect();
    if (!root || !tile) {
      return;
    }
    const x = root.left + (tune.lightFollow ? smoothX.get() : tune.lightX / 100) * root.width;
    const y = root.top + (tune.lightFollow ? smoothY.get() : tune.lightY / 100) * root.height;
    specX.set(`${(x - tile.left) / tune.focusScale}px`);
    specY.set(`${(y - tile.top) / tune.focusScale}px`);
  });

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const measure = () => setRootWidth(root.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setBuilt(true), tune.startDelay * 1000);
    return () => window.clearTimeout(timer);
  }, [tune.startDelay]);

  React.useEffect(() => {
    if (reduced) {
      return;
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        return;
      }
      const root = rootRef.current;
      if (!root) {
        return;
      }
      const rect = root.getBoundingClientRect();
      pointerX.set(Math.min(1.4, Math.max(-0.4, (event.clientX - rect.left) / rect.width)));
      pointerY.set(Math.min(1.4, Math.max(-0.4, (event.clientY - rect.top) / rect.height)));
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, pointerX, pointerY]);

  React.useEffect(() => {
    if (!focus) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = 'hidden';
    const centerX = focus.left + focus.size / 2 + focus.nudgeX;
    const centerY = focus.top + focus.size / 2 + focus.nudgeY;
    const reach = (focus.size * FOCUS_SCALE) / 2;
    const onMove = (event: PointerEvent) => {
      tiltX.set(Math.min(1, Math.max(-1, (event.clientX - centerX) / reach)));
      tiltY.set(Math.min(1, Math.max(-1, (event.clientY - centerY) / reach)));
    };
    tiltX.set(0);
    tiltY.set(0);
    window.addEventListener('keydown', onKey);
    if (!reduced) {
      window.addEventListener('pointermove', onMove);
    }
    return () => {
      html.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointermove', onMove);
    };
  }, [focus, reduced, tiltX, tiltY, FOCUS_SCALE, close]);

  const open = (index: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const half = (rect.width * FOCUS_SCALE) / 2;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const towardX = centerX + (window.innerWidth / 2 - centerX) * tune.focusNudge;
    const towardY = centerY + (window.innerHeight / 2 - centerY) * tune.focusNudge;
    const x = Math.min(Math.max(towardX, half + EDGE), window.innerWidth - half - EDGE);
    const y = Math.min(Math.max(towardY, half + EDGE), window.innerHeight - half - EDGE - TRAY_ROOM);
    setLifted(index);
    setFocus({
      index,
      left: rect.left,
      top: rect.top,
      size: rect.width,
      nudgeX: x - centerX,
      nudgeY: y - centerY,
    });
  };

  return (
    <div
      ref={rootRef}
      className='absolute inset-0'
    >
      <div className='absolute inset-0'>
        <BigTileGrid
          designs={current}
          bigColumns={COLUMNS}
          built={built}
          fromOpener
          run={0}
          stagger={{ kind: 'column', span: tune.columnSpan }}
          appear={reduced ? 'fade' : 'scatter'}
          lightFrom='bottom'
          matte
        />
        {reduced || !tune.lightOn ? null : (
          <motion.div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0'
            style={{ background: light, mixBlendMode: tune.lightBlend as React.CSSProperties['mixBlendMode'] }}
            initial={{ opacity: 0 }}
            animate={{ opacity: focus || !built ? 0 : 1 }}
            transition={
              focus || !built
                ? { duration: focus ? lift : 0, ease: EASE }
                : { duration: 0.9, delay: tune.columnSpan + tune.tileDuration * 0.7, ease: EASE }
            }
          />
        )}
        <div
          className='absolute inset-0 grid'
          style={{ gridTemplate: `repeat(${rows}, minmax(0, 1fr)) / repeat(${COLUMNS}, minmax(0, 1fr))` }}
        >
          {current.map((design, index) => (
            <button
              key={index}
              type='button'
              aria-label={`Open the ${design} tile`}
              onClick={event => open(index, event.currentTarget)}
              className={clsx(
                'focus-visible:outline-focus cursor-pointer rounded-[3%]',
                lifted === index && 'bg-background',
              )}
            />
          ))}
        </div>
      </div>
      {createPortal(
        <AnimatePresence>
          {focus ? (
            <>
              <motion.div
                key='scrim'
                className='fixed inset-0 z-40'
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: lift }}
                onClick={event => {
                  if (!(event.target instanceof Element && event.target.closest(INTERACTIVE))) {
                    close();
                  }
                }}
              >
                <motion.div
                  className='absolute inset-0'
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--background) ${tune.scrimOpacity * 100}%, transparent)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: lift, ease: EASE }}
                />
                <motion.div
                  className='absolute inset-0'
                  initial={{ backdropFilter: 'blur(0px)' }}
                  animate={{
                    backdropFilter: `blur(${tune.scrimBlur}px)`,
                  }}
                  exit={{ backdropFilter: 'blur(0px)' }}
                  transition={{ duration: lift, ease: EASE }}
                />
                {tune.tiltShift > 0
                  ? [0.5, 1].map((step, layer) => {
                      const center = ((focus.top + focus.size / 2 + focus.nudgeY) / window.innerHeight) * 100;
                      const band = ((focus.size * FOCUS_SCALE) / 2 / window.innerHeight) * 100 + tune.tiltShiftBand;
                      const start = band + layer * 22;
                      const mask = `linear-gradient(to bottom, #000 ${Math.max(0, center - start - 22)}%, transparent ${Math.max(0, center - start)}%, transparent ${Math.min(100, center + start)}%, #000 ${Math.min(100, center + start + 22)}%)`;
                      return (
                        <motion.div
                          key={step}
                          className='absolute inset-0'
                          style={{ maskImage: mask, WebkitMaskImage: mask }}
                          initial={{ backdropFilter: 'blur(0px)' }}
                          animate={{
                            backdropFilter: `blur(${tune.tiltShift * step}px)`,
                          }}
                          exit={{ backdropFilter: 'blur(0px)' }}
                          transition={{ duration: lift, ease: EASE }}
                        />
                      );
                    })
                  : null}
              </motion.div>
              <motion.div
                key='tile'
                className='pointer-events-none fixed z-50'
                style={{ left: focus.left, top: focus.top, width: focus.size, height: focus.size }}
                initial={{ x: 0, y: 0, scale: 1 }}
                animate={{ x: focus.nudgeX, y: focus.nudgeY, scale: FOCUS_SCALE }}
                exit={{ x: 0, y: 0, scale: 1 }}
                transition={{ duration: lift, ease: EASE }}
              >
                <motion.div
                  ref={tileRef}
                  className='relative size-full'
                  style={{
                    transformPerspective: 900,
                    rotateX,
                    rotateY,
                  }}
                  transition={{ duration: lift, ease: EASE }}
                >
                  <motion.div
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-0 rounded-[1.5%]'
                    style={{ boxShadow: edge }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: lift, ease: EASE }}
                  />
                  <BigTileGrid
                    designs={[current[focus.index]]}
                    bigColumns={1}
                    built
                    fromOpener={false}
                    run={0}
                    appear='static'
                    lightFrom='bottom'
                    matte
                    seedOrigin={{ column: focus.index % COLUMNS, row: Math.floor(focus.index / COLUMNS) }}
                  />
                  {reduced || !tune.lightOn ? null : (
                    <motion.div
                      aria-hidden='true'
                      className='pointer-events-none absolute inset-0'
                      style={{
                        background: specular,
                        mixBlendMode: tune.lightBlend as React.CSSProperties['mixBlendMode'],
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: lift, ease: EASE }}
                    />
                  )}
                </motion.div>
              </motion.div>
              <motion.div
                key='tray'
                className='fixed z-50'
                style={{
                  left: Math.min(Math.max(focus.left + focus.size / 2 + focus.nudgeX, 190), window.innerWidth - 190),
                  top: focus.top + focus.size / 2 + focus.nudgeY + (focus.size * FOCUS_SCALE) / 2 + 14,
                  x: '-50%',
                }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.35, delay: 0.15, ease: EASE }}
              >
                <Tray
                  current={current[focus.index]}
                  onPick={design =>
                    setCurrent(items => items.map((item, position) => (position === focus.index ? design : item)))
                  }
                />
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
