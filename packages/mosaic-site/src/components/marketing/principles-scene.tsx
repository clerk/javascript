'use client';

import { Panel } from '@clerk/mosaic/components/panel';
import { Radio } from '@clerk/mosaic/components/radio';
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

const RENDER_W = 1200;
const SCALE = 0.75;

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
[data-section] .cl-section-body {
  transition-property: border-color, box-shadow !important;
  transition-timing-function: linear !important;
  transition-duration: var(--cl-duration-base, 0.15s) !important;
}
[data-section][data-active] .cl-section-body {
  border-color: light-dark(#bebebe, #525252) !important;
  box-shadow: 0 0 0 calc(3px / ${SCALE}) color-mix(in oklab, var(--cl-color-neutral) 8%, transparent) !important;
  transition-duration: 0s !important;
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
[data-scene-rim] .cl-profile-layout {${RIM}  --rim-width: calc(1px / ${SCALE});
  --ambient-shadow: 0 calc(8px / ${SCALE}) calc(24px / ${SCALE}) light-dark(oklch(0.42 0.035 288 / 0.08), oklch(0.08 0.02 280 / 0.45)),
    0 calc(1px / ${SCALE}) calc(2px / ${SCALE}) light-dark(oklch(0.3 0.04 282 / 0.05), oklch(0.05 0.02 275 / 0.3));
}
`;
const CARD_W = RENDER_W * SCALE;
const GUTTER = 24;
const BLUR_LAYERS = [
  { blur: 1, mask: 'linear-gradient(to bottom, transparent 0%, black 25%, black 50%, transparent 75%)' },
  { blur: 2, mask: 'linear-gradient(to bottom, transparent 25%, black 50%, black 75%, transparent 100%)' },
  { blur: 4, mask: 'linear-gradient(to bottom, transparent 50%, black 75%, black 100%)' },
];
const REVEAL_MARGIN = 96;
const REVEAL_TOP = 160;

function Grip({ controls, onGrab }: { controls: ReturnType<typeof useDragControls>; onGrab: () => void }) {
  return (
    <button
      type='button'
      aria-label='Drag to reorder'
      onPointerDown={event => {
        onGrab();
        controls.start(event);
      }}
      className='absolute -left-9 top-0 grid size-7 cursor-grab touch-none place-items-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-950 active:cursor-grabbing dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
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

function SectionItem({
  id,
  draggable,
  highlighted,
  reflow,
  onGrab,
  onRelease,
  children,
}: {
  id: SectionId;
  draggable: boolean;
  highlighted: boolean;
  reflow: boolean;
  onGrab: () => void;
  onRelease: () => void;
  children: React.ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      data-section={id}
      className='relative'
      data-active={highlighted ? '' : undefined}
      onDragEnd={onRelease}
      whileDrag={{ scale: 1.02, zIndex: 10 }}
      transition={reflow ? REFLOW : SNAP}
    >
      <div
        style={{
          opacity: draggable ? 1 : 0,
          transition: `opacity ${FAST} ${draggable ? EASE_ENTER : EASE_EXIT}`,
        }}
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
    <div className='scene-rim scene-rim-dark scene-rim-right mono-2 w-64 overflow-clip rounded-xl text-[#9a9793]'>
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
                          opacity: open ? 1 : 0,
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
      className='scene-rim scene-rim-dark scene-rim-right w-48 overflow-clip rounded-xl'
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

const keepAccount = () => {};

const scrollerOf = (element: Element, boundary: Element) => {
  let node = element.parentElement;
  while (node && node !== boundary) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return node;
    }
    node = node.parentElement;
  }
  return null;
};

function revealSection(surface: HTMLElement | null, stage: HTMLElement | null, id: SectionId | null) {
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
  const visibleBottom = stage.getBoundingClientRect().bottom - REVEAL_MARGIN;
  const rect = section.getBoundingClientRect();
  if (rect.bottom <= visibleBottom && rect.top >= scroller.getBoundingClientRect().top) {
    return;
  }
  const offset = (rect.top - scroller.getBoundingClientRect().top) / SCALE;
  scroller.scrollTo({ top: Math.max(0, scroller.scrollTop + offset - REVEAL_TOP), behavior: 'smooth' });
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
  const [selected, setSelected] = React.useState<SectionId>('email');

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

  const surfaceRef = React.useRef<HTMLDivElement | null>(null);
  const attachSurface = React.useCallback((element: HTMLDivElement | null) => {
    surfaceRef.current = element;
    setSurface(element);
  }, []);

  React.useEffect(() => {
    const nav = surface?.querySelector<HTMLElement>('.cl-profile-nav');
    if (nav) {
      nav.inert = true;
    }
  }, [surface]);

  const freezeTransitions = React.useCallback(() => {
    const element = surfaceRef.current;
    if (!element) {
      return () => {};
    }
    element.dataset.themeSwitching = '';
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => delete element.dataset.themeSwitching);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  React.useLayoutEffect(() => freezeTransitions(), [appliedTheme, freezeTransitions]);

  React.useEffect(() => {
    revealSection(surfaceRef.current, portalRef.current, scene === 'agent' ? selected : null);
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
    <div className='pb-80'>
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
          {order.map(id => (
            <SectionItem
              key={id}
              id={id}
              draggable={scene === 'composable'}
              highlighted={scene === 'agent' && selected === id}
              reflow={reflow}
              onGrab={grab}
              onRelease={release}
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
      className='absolute inset-x-0 -top-16 bottom-0 overflow-clip'
    >
      <style>{`${SCENE_THEME_CSS}${RIM_CSS}${FOCUS_CSS}[data-theme-switching]:not(#\\#), [data-theme-switching] *:not(#\\#) { transition: none !important; } @media (prefers-reduced-motion: reduce) { .scene-pop { scale: 1 !important; } .scene-travel { transition: none !important; } }`}</style>
      <PortalProvider container={portalRef}>
        <div
          className='scene-travel absolute bottom-0 top-2'
          style={{
            left: centered ? `calc(50% - ${CARD_W / 2}px)` : GUTTER,
            width: CARD_W,
            transition: `left ${SLOW} ${EASE_ENTER}`,
          }}
        >
          <div
            ref={attachSurface}
            data-scene-rim=''
            data-theme-switching=''
            data-scene-theme={appliedTheme}
            data-outlined={scene === 'clerk' ? '' : undefined}
            className='origin-top-left [&_.cl-profile-layout]:!h-[60rem]'
            style={{ width: RENDER_W, scale: SCALE }}
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
        <div
          className='absolute top-44 flex flex-col items-end'
          style={{ right: GUTTER }}
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
      </PortalProvider>
    </div>
  );
}
