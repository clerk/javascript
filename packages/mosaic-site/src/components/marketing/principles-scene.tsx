'use client';

import { Panel } from '@clerk/mosaic/components/panel';
import { Radio } from '@clerk/mosaic/components/radio';
import { SegmentedControl } from '@clerk/mosaic/components/segmented-control';
import { UserProfileView } from '@clerk/mosaic/features/user-profile/user-profile.view';
import { UserProfileConnectedAccountsSectionView } from '@clerk/mosaic/features/user-profile/user-profile-connected-accounts-section/user-profile-connected-accounts-section.view';
import { UserProfileEmailSectionView } from '@clerk/mosaic/features/user-profile/user-profile-email-section/user-profile-email-section.view';
import { UserProfilePhoneSectionView } from '@clerk/mosaic/features/user-profile/user-profile-phone-section/user-profile-phone-section.view';
import { UserProfileProfileSectionView } from '@clerk/mosaic/features/user-profile/user-profile-profile-section/user-profile-profile-section.view';
import { PortalProvider } from '@clerk/mosaic/primitives/portal';
import { inertProps } from '@clerk/shared/inert';
import { useUserProfileFixture } from '@swingset/stories/fixtures/user-profile';
import {
  connectedAccount,
  useConnectedAccountsFixture,
} from '@swingset/stories/fixtures/user-profile-connected-accounts';
import { useUserProfileEmailsFixture } from '@swingset/stories/fixtures/user-profile-emails';
import { useUserProfilePhonesFixture } from '@swingset/stories/fixtures/user-profile-phones';
import { useUserProfileProfileFixture } from '@swingset/stories/fixtures/user-profile-profile';
import clsx from 'clsx';
import { Reorder, useDragControls } from 'motion/react';
import * as React from 'react';

import { ClerkOutline } from '@/components/marketing/clerk-outline';
import { useMode } from '@/components/use-mode';
import { withoutUserComingSoon } from '@/lib/components/pages';
import { SCENE_THEME_CSS, SCENE_THEMES, type SceneThemeChoice } from '@/lib/components/scene-themes';

export type SceneId = 'composable' | 'agent' | 'theme' | 'clerk';

type SectionId = 'profile' | 'email' | 'phone' | 'connected';

const FOLDERS: Record<SectionId, string> = {
  profile: 'profile-section',
  email: 'email-section',
  phone: 'phone-section',
  connected: 'connected-accounts-section',
};

const FILES = ['model.ts', 'controller.ts', 'view.tsx'];

const FAST = 'var(--cl-duration-fast, 0.1s)';
const BASE = 'var(--cl-duration-base, 0.15s)';
const SLOW = 'var(--cl-duration-slow, 0.25s)';
const EASE_IN_OUT = 'var(--cl-ease-in-out, cubic-bezier(0.645, 0.045, 0.355, 1))';
const EASE_DEFAULT = 'var(--cl-ease-default, cubic-bezier(0.175, 0.885, 0.32, 1.1))';
const EASE_ENTER = 'var(--cl-ease-enter, cubic-bezier(0, 0, 0.2, 1))';
const EASE_EXIT = 'var(--cl-ease-exit, cubic-bezier(0.55, 0.085, 0.68, 0.53))';
const REFLOW = { duration: 0.15, ease: [0, 0, 0.2, 1] } as const;
const SNAP = { duration: 0 } as const;
const POP_SCALE = 0.95;
const GRIP_SPRING =
  'linear(0, 0.032, 0.115, 0.231, 0.365, 0.503, 0.637, 0.758, 0.864, 0.951, 1.019, 1.069, 1.102, 1.12, 1.126, 1.123, 1.113, 1.099, 1.083, 1.065, 1.048, 1.032, 1.019, 1.007, 0.999, 0.992, 0.988, 0.985, 0.984, 0.984, 0.985, 0.987, 0.989, 0.991, 0.994, 0.996, 1)';
const GRIP_INTRO_MS = 1800;
const SCROLL_SETTLE_MS = 250;

const RIM_TOP_DARK = 'oklch(0.97 0.006 84 / 0.12)';
const RIM_BOTTOM_DARK = 'oklch(0.97 0.006 84 / 0.04)';
const HOT = 'oklch(0.97 0.006 84';
const INSET_DARK = [
  `inset 0 1px 0 ${HOT} / 0.05)`,
  `inset 0 0.25px 0 ${HOT} / 0.2)`,
  `inset 0 -1px 0 ${HOT} / 0.03)`,
  'inset 0 -0.25px 0 oklch(0.8 0.04 292 / 0.08)',
].join(', ');
const CUTOUT_DARK = '0 0 0 var(--rim-width, 1px) light-dark(transparent, #000)';
const SHADOW_DARK = [
  'var(--shadow-x, 0px) 6px 10px -4px oklch(0.1 0.015 282 / 0.4)',
  'calc(var(--shadow-x, 0px) * 0.5) 2px 4px -1px oklch(0.08 0.02 278 / 0.24)',
  '0 1px 1px -0.5px oklch(0.05 0.02 275 / 0.32)',
].join(', ');
const RIM = `
  --rim-top: light-dark(oklch(0.25 0.007 65 / 0.06), ${RIM_TOP_DARK});
  --rim-bottom: light-dark(oklch(0.25 0.007 65 / 0.12), ${RIM_BOTTOM_DARK});
  --rim-fill: var(--cl-color-page, #fff);
  border: var(--rim-width, 1px) solid transparent !important;
  background: linear-gradient(var(--rim-fill), var(--rim-fill)) padding-box,
    linear-gradient(var(--light-angle, 180deg), var(--rim-top), var(--rim-bottom)) border-box,
    linear-gradient(var(--rim-fill), var(--rim-fill)) border-box !important;
  box-shadow: inset 0 var(--rim-width, 1px) 0 0 light-dark(transparent, oklch(0.97 0.006 84 / 0.06)),
    0 0 0 var(--rim-width, 1px) light-dark(transparent, #000),
    var(--shadow-x, 0px) 6px 10px -4px light-dark(oklch(0.45 0.03 290 / 0.1), oklch(0.1 0.015 282 / 0.4)),
    calc(var(--shadow-x, 0px) * 0.5) 2px 4px -1px light-dark(oklch(0.35 0.035 285 / 0.06), oklch(0.08 0.02 278 / 0.24)),
    0 1px 1px -0.5px light-dark(oklch(0.25 0.04 280 / 0.1), oklch(0.05 0.02 275 / 0.32)),
    var(--ambient-shadow, 0 0 #0000) !important;
`;
const FOCUS_CSS = `
[data-outlined] .cl-panel-sections {
  gap: 3.75rem !important;
}
.scene-outline {
  opacity: 0;
  transition: opacity var(--cl-duration-fast, 0.1s) var(--cl-ease-exit, ease-in);
}
[data-outlined] .scene-outline {
  opacity: 1;
  transition-timing-function: var(--cl-ease-enter, ease-out);
}
[data-section] .cl-section-body {
  position: relative;
}
[data-section] .cl-section-body::after {
  content: '';
  position: absolute;
  inset: -1px;
  border: 1px solid light-dark(#bebebe, #525252);
  border-radius: inherit;
  box-shadow: 0 0 0 calc(3px / var(--scene-scale)) light-dark(color-mix(in oklab, var(--color-purple-500) 16%, transparent), color-mix(in oklab, var(--color-purple-400) 28%, transparent));
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--cl-duration-base, 0.15s) linear;
}
[data-section][data-active] .cl-section-body::after {
  opacity: 1;
  transition-duration: 0s;
}
`;
const GRIP_CSS = `
@keyframes grip-pull {
  from {
    translate: calc(12px / var(--scene-scale)) 0;
    scale: 0.6;
  }
}
@keyframes grip-fade {
  from {
    opacity: 0;
  }
}
[data-grip-intro] .scene-grip > button {
  transform-origin: right center;
  animation: grip-pull 540ms ${GRIP_SPRING} both, grip-fade 180ms ${EASE_ENTER} both;
  animation-delay: calc(var(--grip-index) * 70ms + 150ms);
}
@keyframes section-tug {
  0% {
    animation-timing-function: ${EASE_ENTER};
  }
  18% {
    scale: 1.02;
    translate: 0 0;
    animation-timing-function: ${EASE_IN_OUT};
  }
  40% {
    scale: 1.02;
    translate: 0 calc(8px / var(--scene-scale));
    animation-timing-function: ${GRIP_SPRING};
  }
}
[data-grip-intro] [data-grip-lead] {
  z-index: 1;
  animation: section-tug 900ms 700ms both;
}
@media (prefers-reduced-motion: reduce) {
  [data-grip-intro] .scene-grip > button,
  [data-grip-intro] [data-grip-lead] {
    animation: none;
  }
}
`;
const STRIP_CSS = `
@media (pointer: coarse), (max-width: 1023px) {
  [data-scene-rim] .cl-profile-content-viewport {
    overflow-y: hidden !important;
    overscroll-behavior: auto !important;
  }
}
.scene-strip .cl-segmented-control-indicator {
  background: var(--strip-indicator) !important;
  box-shadow: none !important;
  border-radius: 0.5rem !important;
}
@supports (corner-shape: superellipse(2)) {
  .scene-strip .cl-segmented-control-indicator {
    corner-shape: superellipse(2);
    border-radius: 0.8125rem !important;
  }
}
`;
const RIM_CSS = `
.scene-rim {${RIM}}
.scene-rim-right {
  --light-angle: 160deg;
  --shadow-x: 1px;
}
.scene-rim-dark {
  --rim-top: ${RIM_TOP_DARK};
  --rim-bottom: ${RIM_BOTTOM_DARK};
  --rim-fill: #181613;
  box-shadow: ${INSET_DARK}, ${CUTOUT_DARK}, ${SHADOW_DARK} !important;
  position: relative;
  border-width: 0 !important;
  background: var(--rim-fill) !important;
}
.scene-rim-dark::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid transparent;
  border-radius: inherit;
  background: linear-gradient(var(--light-angle, 180deg), var(--rim-top), var(--rim-bottom)) border-box;
  mask: linear-gradient(#000 0 0) padding-box exclude, linear-gradient(#000 0 0);
  pointer-events: none;
}
@media (max-width: 639px) {
  [data-scene-rim] .cl-profile-layout {
    border-radius: var(--cl-radius-xl) !important;
  }
}
[data-scene-rim] .cl-profile-layout {${RIM}  --rim-width: calc(1px / var(--scene-scale));
  --ambient-shadow: 0 calc(8px / var(--scene-scale)) calc(24px / var(--scene-scale)) light-dark(oklch(0.42 0.035 288 / 0.08), oklch(0.08 0.02 280 / 0.45)),
    0 calc(1px / var(--scene-scale)) calc(2px / var(--scene-scale)) light-dark(oklch(0.3 0.04 282 / 0.05), oklch(0.05 0.02 275 / 0.3));
}
`;
const LAYOUT_CSS = `
.scene-root {
  container-type: inline-size;
  --gutter: 24px;
  --card-w: calc(100cqw - 48px);
  --scale: 0.8;
  --stage-h: 29rem;
  --overhang: 0px;
  --scene-scale: var(--scale);
}
@media (min-width: 640px) {
  .scene-root {
    --scale: 0.75;
    --stage-h: 34rem;
  }
}
@media (min-width: 768px) {
  .scene-root {
    --gutter: calc((100cqw - 44rem) / 2);
    --card-w: 44rem;
  }
}
@media (min-width: 1024px) {
  .scene-root {
    --gutter: calc((100cqw - 59rem) / 2);
    --card-w: 900px;
    --overhang: calc(var(--gutter) - 16px);
  }
}
@media (min-width: 1280px) {
  .scene-root {
    --gutter: 32px;
    --overhang: 16px;
  }
}
@media (min-width: 1536px) {
  .scene-root {
    --gutter: 24px;
    --overhang: 0px;
  }
}
@supports (corner-shape: superellipse(2)) {
  .scene-squircle,
  .scene-squircle::after {
    corner-shape: superellipse(2);
  }
  .scene-squircle {
    border-radius: 1.25rem !important;
  }
}
`;
const SATELLITE_LEFT =
  'min(calc(var(--gutter) + var(--card-w) - 48px), calc(100% - var(--gutter) + var(--overhang) - 256px))';
const BLUR_LAYERS = [
  { blur: 1, mask: 'linear-gradient(to bottom, transparent 0%, black 25%, black 50%, transparent 75%)' },
  { blur: 2, mask: 'linear-gradient(to bottom, transparent 25%, black 50%, black 75%, transparent 100%)' },
  { blur: 4, mask: 'linear-gradient(to bottom, transparent 50%, black 75%, black 100%)' },
];
const SECTION_COMPONENTS: Record<SectionId, string> = {
  profile: 'UserProfileProfileSection',
  email: 'UserProfileEmailSection',
  phone: 'UserProfilePhoneSection',
  connected: 'UserProfileConnectedAccountsSection',
};
const SECTION_HOOKS = ['useUser', 'useClerk', 'useReverificationFlow'];
const px = (value: number) => `calc(${value}px / var(--scene-scale))`;
const REVEAL_MARGIN = 96;
const REVEAL_TOP = 160;
const COVER_GAP = 12;

function Grip({ controls, onGrab }: { controls: ReturnType<typeof useDragControls>; onGrab: () => void }) {
  return (
    <button
      type='button'
      tabIndex={-1}
      aria-label='Drag to reorder'
      onPointerDown={event => {
        onGrab();
        controls.start(event);
      }}
      className='absolute -left-9 top-0 grid size-7 cursor-grab touch-none place-items-center rounded-md text-gray-500 before:absolute before:-inset-2 hover:bg-gray-200 hover:text-gray-950 active:cursor-grabbing max-sm:-left-6 max-sm:size-6 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
    >
      <svg
        viewBox='0 0 16 16'
        className='size-4'
        fill='currentColor'
        aria-hidden='true'
      >
        {[4, 8, 12].flatMap(y =>
          [6, 10].map(x => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={1.25}
            />
          )),
        )}
      </svg>
    </button>
  );
}

function SectionOutline({ id }: { id: SectionId }) {
  return (
    <div
      aria-hidden='true'
      className='scene-outline pointer-events-none absolute z-[5] border-solid'
      style={{
        inset: `${px(-8)} ${px(-8)} ${px(-28)}`,
        borderWidth: px(1),
        borderRadius: px(10),
        borderColor: 'var(--color-sky-500)',
      }}
    >
      <span
        className='mono-2 absolute flex items-center whitespace-nowrap font-[560]'
        style={{
          right: px(2),
          bottom: px(2),
          height: px(20),
          gap: px(6),
          paddingInline: px(6),
          fontSize: px(11),
          borderRadius: `${px(3)} ${px(3)} ${px(7)} ${px(3)}`,
          backgroundColor: 'light-dark(var(--color-sky-400), var(--color-sky-800))',
          color: 'light-dark(#0f0d0b, #ffffff)',
        }}
      >
        {SECTION_COMPONENTS[id]}
        <span className='font-[460] max-sm:hidden'>{SECTION_HOOKS.join(' · ')}</span>
      </span>
    </div>
  );
}

function SectionItem({
  id,
  index,
  draggable,
  highlighted,
  reflow,
  onGrab,
  onRelease,
  onSelect,
  children,
}: {
  id: SectionId;
  index: number;
  draggable: boolean;
  highlighted: boolean;
  reflow: boolean;
  onGrab: () => void;
  onRelease: () => void;
  onSelect?: () => void;
  children: React.ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      tabIndex={-1}
      dragListener={false}
      dragControls={controls}
      data-section={id}
      data-grip-lead={index === 0 ? '' : undefined}
      className='relative'
      data-active={highlighted ? '' : undefined}
      onDragEnd={onRelease}
      onClick={onSelect}
      style={onSelect ? { cursor: 'pointer' } : undefined}
      whileDrag={{ scale: 1.02, zIndex: 10 }}
      transition={reflow ? REFLOW : SNAP}
    >
      <div
        className='scene-grip'
        style={
          {
            '--grip-index': index,
            opacity: draggable ? 1 : 0,
            transition: `opacity ${FAST} ${draggable ? EASE_ENTER : EASE_EXIT}`,
          } as React.CSSProperties
        }
        {...(draggable ? {} : { inert: true })}
      >
        <Grip
          controls={controls}
          onGrab={onGrab}
        />
      </div>
      <div
        className='contents'
        {...inertProps(true)}
      >
        {children}
      </div>
      <SectionOutline id={id} />
    </Reorder.Item>
  );
}

function FileTree({
  order,
  selected,
  onSelect,
}: {
  order: SectionId[];
  selected: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <div className='scene-rim scene-rim-dark scene-rim-right scene-squircle mono-2 w-64 overflow-clip rounded-xl text-[#9a9793]'>
      <div className='flex h-10 items-center gap-1.5 border-b border-white/[0.06] px-4'>
        {[0, 1, 2].map(dot => (
          <span
            key={dot}
            className='size-2 rounded-full bg-white/15'
          />
        ))}
        <span className='ml-2 text-[#71717a]'>user-profile/</span>
      </div>
      <ul className='flex flex-col gap-px p-1'>
        {order.map(id => {
          const open = id === selected;
          return (
            <li key={id}>
              <button
                type='button'
                tabIndex={-1}
                aria-expanded={open}
                onClick={() => onSelect(id)}
                className={clsx(
                  'flex h-8 w-full items-center gap-2 rounded-md px-3 text-left',
                  open
                    ? 'bg-[oklch(0.97_0.006_84/0.12)] text-white'
                    : 'hover:bg-[oklch(0.97_0.006_84/0.08)] hover:text-white',
                )}
              >
                <span
                  aria-hidden='true'
                  className='w-2.5 text-[#71717a]'
                >
                  {open ? '▾' : '▸'}
                </span>
                <span className='truncate'>{FOLDERS[id]}</span>
              </button>
              <div
                className='grid motion-reduce:transition-none'
                style={{
                  gridTemplateRows: open ? '1fr' : '0fr',
                  transition: `grid-template-rows ${SLOW} ${EASE_IN_OUT}`,
                }}
                {...(open ? {} : { inert: true })}
              >
                <div className='min-h-0 overflow-clip [mask-image:linear-gradient(to_bottom,black_calc(100%-0.75rem),transparent)]'>
                  <ul className='flex flex-col gap-px pb-3 pl-[1.375rem] pt-px'>
                    {FILES.map(file => (
                      <li
                        key={file}
                        className='flex h-8 items-center gap-2 px-3 motion-reduce:transition-none'
                        style={{
                          opacity: open ? FILE_OPACITY[file] : 0,
                          transition: open ? `opacity ${BASE} ${EASE_ENTER} ${FAST}` : `opacity ${FAST} ${EASE_EXIT}`,
                        }}
                      >
                        <span className={clsx('size-1.5 rounded-full', FILE_DOTS[file])} />
                        <span className='text-[#f6f5f4]'>{file}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const FILE_OPACITY: Record<string, number> = {
  'model.ts': 0.4,
  'controller.ts': 0.4,
  'view.tsx': 1,
};

function FileStrip({ selected }: { selected: SectionId }) {
  return (
    <div className='scene-rim scene-rim-dark scene-squircle mono-2 overflow-clip rounded-xl text-[#9a9793]'>
      <div className='flex h-8 items-center border-b border-white/[0.06] px-3'>
        <span className='text-[#71717a]'>user-profile/</span>
        <span className='truncate text-white'>{FOLDERS[selected]}/</span>
      </div>
      <ul className='flex h-8 items-center gap-4 px-3'>
        {FILES.map(file => (
          <li
            key={file}
            className='flex items-center gap-1.5'
            style={{ opacity: FILE_OPACITY[file] }}
          >
            <span className={clsx('size-1.5 rounded-full', FILE_DOTS[file])} />
            <span className='text-[#f6f5f4]'>{file}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const FILE_DOTS: Record<string, string> = {
  'model.ts': 'bg-sky-400',
  'controller.ts': 'bg-amber-400',
  'view.tsx': 'bg-violet-400',
};

const THEME_CHOICES: { id: ThemeChoice; label: string; description: string }[] = [
  { id: 'default', label: 'Default', description: 'Mosaic as it ships' },
  ...SCENE_THEMES,
];

const PICKER_TOKENS = {
  colorScheme: 'dark',
  '--cl-color-brand': 'var(--color-purple-400, #9c83fd)',
  '--cl-color-brand-foreground': '#ffffff',
  '--cl-color-border': 'oklch(0.97 0.006 84 / 0.32)',
} as React.CSSProperties;

function ThemePicker({ value, onChange }: { value: ThemeChoice; onChange: (value: ThemeChoice) => void }) {
  return (
    <div
      className='scene-rim scene-rim-dark scene-rim-right scene-squircle w-48 overflow-clip rounded-xl'
      style={PICKER_TOKENS}
    >
      <Radio.Group<ThemeChoice>
        aria-label='Theme'
        value={value}
        onValueChange={onChange}
      >
        <div className='flex flex-col p-1'>
          {THEME_CHOICES.map(choice => (
            <label
              key={choice.id}
              className='label-3 flex h-8 cursor-pointer items-center gap-2.5 rounded-md px-3 text-[#f6f5f4] hover:bg-[oklch(0.97_0.006_84/0.08)]'
            >
              <Radio.Item
                value={choice.id}
                tabIndex={-1}
                size='sm'
              />
              {choice.label}
            </label>
          ))}
        </div>
      </Radio.Group>
    </div>
  );
}

function ThemeStrip({ value, onChange }: { value: ThemeChoice; onChange: (value: ThemeChoice) => void }) {
  const dark = useMode() === 'dark';
  return (
    <div
      className={clsx('scene-rim scene-strip scene-squircle rounded-xl p-0.5', dark && 'scene-rim-dark')}
      style={
        {
          colorScheme: dark ? 'dark' : 'light',
          '--cl-color-surface-subtle': 'transparent',
          '--strip-indicator': dark ? '#fff' : 'var(--color-gray-800)',
          '--cl-color-foreground': dark ? 'var(--color-gray-950)' : '#fff',
          '--cl-color-foreground-secondary': dark ? 'var(--color-gray-400)' : 'var(--color-gray-600)',
        } as React.CSSProperties
      }
    >
      <SegmentedControl.Root
        aria-label='Theme'
        value={value}
        onValueChange={next => onChange(next as ThemeChoice)}
      >
        {THEME_CHOICES.map(choice => (
          <SegmentedControl.Item
            key={choice.id}
            value={choice.id}
            tabIndex={-1}
          >
            {choice.label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl.Root>
    </div>
  );
}

const keepAccount = () => {};

const scrollerOf = (element: Element, boundary: Element) => {
  let node = element.parentElement;
  while (node && node !== boundary) {
    const { overflowY } = getComputedStyle(node);
    const scrollable = overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden';
    if (scrollable && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

function firstSectionInView(surface: HTMLElement | null): SectionId | null {
  const sections = surface ? [...surface.querySelectorAll<HTMLElement>('[data-section]')] : [];
  const scroller = surface && sections[0] ? scrollerOf(sections[0], surface) : null;
  if (!scroller) {
    return null;
  }
  const top = scroller.getBoundingClientRect().top - 1;
  const first = sections.find(section => section.getBoundingClientRect().top >= top) ?? sections[0];
  return (first?.dataset.section as SectionId | undefined) ?? null;
}

function revealSection(
  surface: HTMLElement | null,
  stage: HTMLElement | null,
  id: SectionId | null,
  cover: HTMLElement | null,
) {
  const section = id && surface?.querySelector(`[data-section='${id}']`);
  const anchor = section || surface?.querySelector('[data-section]');
  const scroller = surface && anchor ? scrollerOf(anchor, surface) : null;
  if (!surface || !stage || !scroller) {
    return;
  }
  if (!section) {
    scroller.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const scale = surface && surface.offsetWidth ? surface.getBoundingClientRect().width / surface.offsetWidth : 1;
  const covering = cover && cover.offsetParent !== null ? cover : null;
  const coverTop = covering ? covering.getBoundingClientRect().top - COVER_GAP : Infinity;
  const visibleBottom = Math.min(stage.getBoundingClientRect().bottom - REVEAL_MARGIN, coverTop);
  const scrollerTop = scroller.getBoundingClientRect().top;
  const rect = section.getBoundingClientRect();
  if (rect.bottom <= visibleBottom && rect.top >= scrollerTop) {
    return;
  }
  const offset = (rect.top - scrollerTop) / scale;
  const fit = covering ? Math.max(0, (visibleBottom - scrollerTop - rect.height) / scale) : REVEAL_TOP;
  scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + offset - Math.min(REVEAL_TOP, fit)), behavior: 'smooth' });
}

type ThemeChoice = SceneThemeChoice;

const DEX = { firstName: 'Dex', lastName: '', username: 'dex_67', imageUrl: '/marketing/avatar.svg' };
const DEX_EMAILS = [
  { id: 'email_1', value: 'dex@clerk.com', isDefault: true, isVerified: true },
  { id: 'email_2', value: 'dex+agents@clerk.com', isDefault: false, isVerified: true },
];
const DEX_PHONES = [
  { id: 'phone_1', value: '+1 415-555-0339', isDefault: true, isVerified: true },
  { id: 'phone_2', value: '+14155550133', isDefault: false, isVerified: true },
];
const DEX_ACCOUNTS = [{ ...connectedAccount, identifier: 'dex@clerk.com' }];

export function PrinciplesScene({ scene }: { scene: SceneId }) {
  const fixture = useUserProfileFixture();
  const profile = useUserProfileProfileFixture(DEX);
  const emails = useUserProfileEmailsFixture({ initialEmails: DEX_EMAILS, username: DEX.username });
  const phones = useUserProfilePhonesFixture({ initialPhones: DEX_PHONES });
  const connections = useConnectedAccountsFixture({ initialAccounts: DEX_ACCOUNTS });
  const [order, setOrder] = React.useState<SectionId[]>(['profile', 'email', 'phone', 'connected']);
  const [selected, setSelected] = React.useState<SectionId>('profile');

  const [theme, setTheme] = React.useState<ThemeChoice>('default');
  const appliedTheme = theme;
  const [reflow, setReflow] = React.useState(false);
  const settleTimer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(settleTimer.current), []);
  const grab = React.useCallback(() => {
    window.clearTimeout(settleTimer.current);
    setReflow(true);
  }, []);
  const release = React.useCallback(() => {
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => setReflow(false), 400);
  }, []);
  const [surface, setSurface] = React.useState<HTMLDivElement | null>(null);
  const portalRef = React.useRef<HTMLDivElement>(null);
  const satellitesRef = React.useRef<HTMLDivElement>(null);
  const [inView, setInView] = React.useState(false);
  const [gripIntro, setGripIntro] = React.useState(false);

  React.useEffect(() => {
    const element = portalRef.current;
    if (!element || inView) {
      return;
    }
    let visible = false;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      if (visible) {
        timer = window.setTimeout(() => {
          setInView(true);
          setGripIntro(true);
        }, SCROLL_SETTLE_MS);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        arm();
      },
      { threshold: 0.95 },
    );
    observer.observe(element);
    window.addEventListener('scroll', arm, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', arm);
      window.clearTimeout(timer);
    };
  }, [inView]);

  React.useEffect(() => {
    if (!gripIntro) {
      return;
    }
    const timer = window.setTimeout(() => setGripIntro(false), GRIP_INTRO_MS);
    return () => window.clearTimeout(timer);
  }, [gripIntro]);

  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const attachSurface = React.useCallback((element: HTMLDivElement | null) => {
    surfaceRef.current = element;
    setSurface(element);
  }, []);

  React.useEffect(() => {
    if (!surface) {
      return;
    }
    const disable = () => {
      surface.querySelectorAll<HTMLElement>('.cl-profile-nav, .cl-profile-nav-trigger').forEach(element => {
        element.inert = true;
      });
      surface
        .querySelectorAll<HTMLElement>('.cl-profile-content-panel, .cl-profile-content-viewport')
        .forEach(element => {
          element.tabIndex = -1;
        });
    };
    disable();
    const observer = new MutationObserver(disable);
    observer.observe(surface, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [surface]);

  const freezeTransitions = React.useCallback(() => {
    const elements = [portalRef.current, surfaceRef.current].filter(element => element !== null);
    if (elements.length === 0) {
      return () => {};
    }
    elements.forEach(element => (element.dataset.themeSwitching = ''));
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => elements.forEach(element => delete element.dataset.themeSwitching));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  React.useLayoutEffect(() => freezeTransitions(), [appliedTheme, freezeTransitions]);

  React.useEffect(() => {
    const element = portalRef.current;
    if (!element) {
      return;
    }
    let width = element.clientWidth;
    const observer = new ResizeObserver(() => {
      if (element.clientWidth !== width) {
        width = element.clientWidth;
        freezeTransitions();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [freezeTransitions]);

  const previousScene = React.useRef(scene);
  React.useEffect(() => {
    const entering = scene === 'agent' && previousScene.current !== 'agent';
    previousScene.current = scene;
    if (entering) {
      const first = firstSectionInView(surfaceRef.current);
      if (first && first !== selected) {
        setSelected(first);
        return;
      }
    }
    revealSection(surfaceRef.current, portalRef.current, scene === 'agent' ? selected : null, satellitesRef.current);
  }, [scene, selected]);

  React.useEffect(() => {
    const observer = new MutationObserver(() => freezeTransitions());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
    return () => observer.disconnect();
  }, [freezeTransitions]);

  const sections: Record<SectionId, React.ReactNode> = {
    profile: <UserProfileProfileSectionView {...profile} />,
    email: <UserProfileEmailSectionView {...emails} />,
    phone: <UserProfilePhoneSectionView {...phones} />,
    connected: <UserProfileConnectedAccountsSectionView {...connections} />,
  };

  const account = (
    <div className='pb-36 lg:pb-80'>
      <Panel.Root>
        <Panel.Title>Account</Panel.Title>
        <Panel.Sections
          render={
            <Reorder.Group
              axis='y'
              values={order}
              onReorder={setOrder}
            />
          }
        >
          {order.map((id, index) => (
            <SectionItem
              key={id}
              id={id}
              index={index}
              draggable={scene === 'composable' && inView}
              highlighted={scene === 'agent' && selected === id}
              reflow={reflow}
              onGrab={grab}
              onRelease={release}
              onSelect={scene === 'agent' ? () => setSelected(id) : undefined}
            >
              {sections[id]}
            </SectionItem>
          ))}
        </Panel.Sections>
      </Panel.Root>
    </div>
  );

  const centered = scene === 'composable' || scene === 'clerk';
  const satellite = (id: SceneId) => ({
    opacity: scene === id ? 1 : 0,
    scale: scene === id ? 1 : POP_SCALE,
    transition:
      scene === id
        ? `opacity ${FAST} ${EASE_ENTER} ${FAST}, scale ${BASE} ${EASE_DEFAULT} ${FAST}`
        : `opacity ${FAST} ${EASE_EXIT}, scale ${FAST} ${EASE_EXIT}`,
  });

  return (
    <div
      ref={portalRef}
      aria-hidden='true'
      className='scene-root absolute inset-x-0 -top-16 bottom-0'
    >
      <style>{`${LAYOUT_CSS}${SCENE_THEME_CSS}${RIM_CSS}${STRIP_CSS}${FOCUS_CSS}${GRIP_CSS}[data-theme-switching]:not(#\\#), [data-theme-switching] *:not(#\\#) { transition: none !important; } @media (prefers-reduced-motion: reduce) { .scene-pop { scale: 1 !important; } .scene-travel { transition: none !important; } }`}</style>
      <PortalProvider container={portalRef}>
        <div className='absolute inset-0 overflow-clip'>
          <div
            className='scene-travel pointer-events-none absolute inset-x-0 bottom-0 top-2'
            style={{
              translate: centered ? 'calc(50% - var(--card-w) / 2 - var(--gutter))' : '0',
              transition: `translate ${SLOW} ${EASE_ENTER}`,
            }}
          >
            <div
              className='pointer-events-auto absolute inset-y-0'
              style={{ left: 'var(--gutter)', width: 'var(--card-w)' }}
            >
              <div
                ref={attachSurface}
                data-scene-rim=''
                data-theme-switching=''
                data-scene-theme={appliedTheme}
                data-outlined={scene === 'clerk' ? '' : undefined}
                data-grip-intro={gripIntro ? '' : undefined}
                className='origin-top-left [&_.cl-profile-layout]:!h-[var(--scene-layout-h)]'
                style={
                  {
                    width: 'calc(var(--card-w) / var(--scale))',
                    scale: 'var(--scale)',
                    '--scene-layout-h': 'calc((var(--stage-h) + 2.5rem) / var(--scale))',
                  } as React.CSSProperties
                }
              >
                <UserProfileView
                  activePage='account'
                  pages={{ ...withoutUserComingSoon(fixture.pages), account }}
                  onPageChange={keepAccount}
                />
              </div>
              <ClerkOutline
                target={surface}
                active={scene === 'clerk'}
              />
            </div>
          </div>

          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-8 bottom-0 z-10 h-6'
          >
            {BLUR_LAYERS.map(layer => (
              <div
                key={layer.blur}
                className='absolute inset-0'
                style={{
                  backdropFilter: `blur(${layer.blur}px)`,
                  WebkitBackdropFilter: `blur(${layer.blur}px)`,
                  maskImage: layer.mask,
                  WebkitMaskImage: layer.mask,
                }}
              />
            ))}
          </div>
        </div>
        <div
          className='absolute top-44 z-20 hidden flex-col items-end lg:flex'
          style={{ left: SATELLITE_LEFT }}
        >
          <div
            className='scene-pop origin-left'
            style={satellite('agent')}
            {...(scene === 'agent' ? {} : { inert: true })}
          >
            <FileTree
              order={order}
              selected={selected}
              onSelect={setSelected}
            />
          </div>
          <div
            className='scene-pop absolute left-3 top-0 origin-left'
            style={satellite('theme')}
            {...(scene === 'theme' ? {} : { inert: true })}
          >
            <ThemePicker
              value={theme}
              onChange={setTheme}
            />
          </div>
        </div>
        <div
          ref={satellitesRef}
          className='absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 translate-y-1/2 flex-col items-center lg:hidden'
        >
          <div
            className='scene-pop origin-bottom'
            style={satellite('agent')}
            {...(scene === 'agent' ? {} : { inert: true })}
          >
            <FileStrip selected={selected} />
          </div>
          <div
            className='scene-pop absolute inset-x-0 bottom-0 flex origin-bottom justify-center'
            style={satellite('theme')}
            {...(scene === 'theme' ? {} : { inert: true })}
          >
            <ThemeStrip
              value={theme}
              onChange={setTheme}
            />
          </div>
        </div>
      </PortalProvider>
    </div>
  );
}
