'use client';
import { SwitcherView } from '@clerk/mosaic/features/switcher/switcher.view';
import { Building } from '@clerk/mosaic/icons/glyphs/building';
import { UserCircle } from '@clerk/mosaic/icons/glyphs/user-circle';
import { Users } from '@clerk/mosaic/icons/glyphs/users';
import { PortalProvider } from '@clerk/mosaic/primitives/portal';
import { usePrototype } from '@swingset/stories/fixtures/switcher';
import * as React from 'react';

import { MobileShell, Skeleton } from '@/components/gallery/app-wireframe';
import type { Property } from '@/components/gallery/properties-menu';
import { Address, ToolbarIcon } from '@/components/marketing/browser-frame';
import { cn } from '@/lib/utils';
export type UserButtonType = 'combined' | 'user' | 'org';
export type UserButtonSize = 'full' | 'condensed' | 'avatar';
export const TYPE_OPTIONS: { id: UserButtonType; label: string }[] = [
  { id: 'combined', label: 'combined' },
  { id: 'user', label: 'user' },
];
const ALL_TYPES: { id: UserButtonType; label: string }[] = [...TYPE_OPTIONS, { id: 'org', label: 'organization' }];
export const SIZE_OPTIONS: { id: UserButtonSize; label: string }[] = [
  { id: 'full', label: 'full' },
  { id: 'condensed', label: 'condensed' },
  { id: 'avatar', label: 'Avatar only' },
];
const TYPE_GLYPHS = { combined: Users, user: UserCircle, org: Building };
type Placement = 'top' | 'bottom' | 'left' | 'right';
const placementFor = (type: UserButtonType, size: UserButtonSize): Placement => {
  if (type === 'user') {
    return 'right';
  }
  if (size === 'avatar') {
    return 'left';
  }
  return 'top';
};
const HERO = 840;
const WINDOW = { y: 40, height: 800, maxWidth: 1280, margin: 48, minWidth: 720 };
export const ITEM_CLASS = 'flex w-max';
const ITEM_GAP = 8;
const FILL_WIDTH = 280;
const FILL_CLASS = '[&>div]:w-full [&_button]:w-full [&_button]:justify-start [&_button>:last-child]:ml-auto!';
const BOTTOM_MARGIN = 28;
const INTRO_DELAY = 700;
const SWITCH_CLOSE_DELAY = 900;
const BEZEL = 8;
const TOOLBAR = 48;
const RAIL = 250;
const RAIL_SLIM = 76;
const HEADER = 56;
const INSET = 16;
const ease = 'ease-[cubic-bezier(0.22,1,0.36,1)]';
const BG = 'var(--background)';
const fadeVeil = `radial-gradient(ellipse 85% 75% at var(--mx) var(--my), transparent 45%, color-mix(in srgb, ${BG} 70%, transparent) 100%)`;
const DOC_WIDTH = 780;
const DOC_GUTTER = 32;
const menuSide = { top: 'bottom-start', left: 'bottom-start', bottom: 'top-start', right: 'bottom-end' } as const;
export function Switcher({
  type,
  size,
  placement,
  defaultOpen,
}: {
  type: UserButtonType;
  size: UserButtonSize;
  placement: Placement;
  defaultOpen?: boolean;
}) {
  const prototype = usePrototype({ hidePersonal: true });
  const { onOpenChange } = prototype;
  const outsidePress = React.useRef(false);
  React.useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      outsidePress.current = !(event.target as Element | null)?.closest('[data-stage]');
    };
    const onKeyDown = () => {
      outsidePress.current = false;
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, []);
  React.useEffect(() => {
    if (!defaultOpen) {
      return;
    }
    const timer = setTimeout(() => onOpenChange?.(true), INTRO_DELAY);
    return () => clearTimeout(timer);
  }, [defaultOpen, onOpenChange]);
  return (
    <SwitcherView
      {...prototype}
      onOpenChange={(next: boolean) => {
        if (!next && outsidePress.current) {
          return;
        }
        onOpenChange?.(next);
      }}
      onSwitchSession={sessionId => {
        prototype.onSwitchSession?.(sessionId);
        setTimeout(() => onOpenChange?.(false), SWITCH_CLOSE_DELAY);
      }}
      mode={type === 'user' ? 'user' : type === 'combined' ? 'combined' : 'organization'}
      placement={menuSide[placement]}
      triggerVariant={size === 'condensed' ? 'condensed' : 'full'}
      {...(size === 'avatar' ? { showTriggerLabel: false } : {})}
    />
  );
}
function PopIn({ children, instant = false }: { children: React.ReactNode; instant?: boolean }) {
  const [shown, setShown] = React.useState(instant);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <div
      className={cn(
        'origin-center transition-[opacity,scale] duration-500 motion-reduce:transition-none',
        ease,
        shown ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
      )}
    >
      {children}
    </div>
  );
}
function useSize<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(() => setSize({ width: element.offsetWidth, height: element.offsetHeight }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, size] as const;
}
function NavRows({ count, item, round }: { count: number; item: { width: number; height: number }; round: string }) {
  return Array.from({ length: count }, (_, index) => (
    <Skeleton
      key={index}
      className={cn('shrink-0 transition-[width,height] duration-500', round, ease)}
      style={{ width: item.width, height: item.height }}
    />
  ));
}
function AppChrome({
  placement,
  rail,
  item,
}: {
  placement: Placement;
  rail: number;
  item: { width: number; height: number };
}) {
  const slim = placement === 'left';
  const round = slim ? 'rounded-lg' : 'rounded-xl';
  return (
    <div className='flex h-full'>
      <div
        className={cn(
          'border-foreground/10 flex shrink-0 flex-col overflow-hidden border-r transition-[width,padding] duration-500',
          ease,
          slim ? 'items-center px-0' : 'px-4',
        )}
        style={{
          width: slim ? RAIL_SLIM : rail,
          gap: ITEM_GAP,
          paddingTop: placement === 'top' || slim ? INSET + item.height + ITEM_GAP * 2 : INSET,
        }}
      >
        <NavRows
          count={5}
          item={item}
          round={round}
        />
        <div
          className='mt-auto flex flex-col'
          style={{ gap: ITEM_GAP, paddingBottom: item.height + INSET * 2 + ITEM_GAP }}
        >
          <NavRows
            count={2}
            item={item}
            round={round}
          />
        </div>
      </div>
      <div className='flex min-w-0 flex-1 flex-col'>
        <div
          className='border-foreground/10 flex items-center border-b px-6'
          style={{ height: HEADER }}
        >
          <div className='flex items-center gap-3'>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-3 w-3' />
            <Skeleton className='h-3 w-24' />
          </div>
        </div>
        <div className='flex flex-col gap-5 p-8'>
          <Skeleton className='h-6 w-56' />
          <div className='grid grid-cols-3 gap-5'>
            <Skeleton className='h-32 rounded-xl' />
            <Skeleton className='h-32 rounded-xl' />
            <Skeleton className='h-32 rounded-xl' />
          </div>
          <div className='grid grid-cols-3 gap-5'>
            <Skeleton className='h-32 rounded-xl' />
            <Skeleton className='h-32 rounded-xl' />
            <Skeleton className='h-32 rounded-xl' />
          </div>
          <Skeleton className='h-6 w-44' />
          <div className='grid grid-cols-3 gap-5'>
            <Skeleton className='h-32 rounded-xl' />
            <Skeleton className='h-32 rounded-xl' />
            <Skeleton className='h-32 rounded-xl' />
          </div>
          <Skeleton className='h-3 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
        </div>
      </div>
    </div>
  );
}
export function UserButtonStage({ type, size }: { type: UserButtonType; size: UserButtonSize }) {
  const placement = placementFor(type, size);
  const [initial] = React.useState({ type, size });
  const [intro, setIntro] = React.useState(true);
  if (intro && (type !== initial.type || size !== initial.size)) {
    setIntro(false);
  }
  const [stageRef, stage] = useSize<HTMLDivElement>();
  const [buttonRef, button] = useSize<HTMLDivElement>();
  const [settled, setSettled] = React.useState(false);
  const measured = stage.width > 0 && button.width > 0 && button.height > 0;
  React.useEffect(() => {
    if (!measured || settled) {
      return;
    }
    const timer = setTimeout(() => setSettled(true), 120);
    return () => clearTimeout(timer);
  }, [measured, settled]);
  const filled = placement === 'top' || placement === 'bottom';
  const buttonFills = filled && size !== 'avatar';
  const item =
    placement === 'right'
      ? { width: RAIL - INSET * 2, height: 40 }
      : { width: filled ? FILL_WIDTH : button.width || 250, height: filled ? 46 : button.height || 46 };
  const windowWidth = Math.max(WINDOW.minWidth, Math.min(WINDOW.maxWidth, stage.width - WINDOW.margin * 2));
  const windowHeight = WINDOW.height;
  const windowTop = placement === 'bottom' ? HERO - BOTTOM_MARGIN - WINDOW.height : WINDOW.y;
  const inWindow = {
    top: { x: BEZEL + INSET, y: BEZEL + TOOLBAR + INSET },
    bottom: { x: BEZEL + INSET, y: windowHeight - BEZEL - INSET - button.height },
    left: { x: BEZEL + (RAIL_SLIM - button.width) / 2, y: BEZEL + TOOLBAR + INSET },
    right: { x: windowWidth - BEZEL - button.width - 24, y: BEZEL + TOOLBAR + (HEADER - button.height) / 2 },
  }[placement];
  const rail = filled ? FILL_WIDTH + INSET * 2 : RAIL;
  const railNow = placement === 'left' ? RAIL_SLIM : rail;
  const clipWidth = placement === 'right' ? windowWidth : railNow - (placement === 'left' ? 12 : INSET * 2);
  const focus = { x: inWindow.x + button.width / 2, y: inWindow.y + button.height / 2 };
  const docWidth = Math.min(DOC_WIDTH, stage.width - DOC_GUTTER * 2);
  const centerShift = ((placement === 'right' ? -1 : 1) * (windowWidth - docWidth)) / 2;
  const windowLeft =
    placement === 'right' ? stage.width / 2 + docWidth / 2 - windowWidth : stage.width / 2 - docWidth / 2;
  const rightEdge = stage.width * 0.72 - windowLeft;
  const rightStart = rightEdge - stage.width * 0.26;
  const leftEdge = stage.width * 0.28 - windowLeft;
  const leftEnd = leftEdge + stage.width * 0.26;
  const clipStyle: React.CSSProperties =
    placement === 'right'
      ? { clipPath: `inset(0 0 0 ${Math.max(0, leftEdge)}px)` }
      : { clipPath: `inset(0 ${Math.max(0, windowWidth - rightEdge)}px 0 0)` };
  const cutoff = HERO - windowTop;
  const veils = [
    {
      key: 'bottom',
      on: windowHeight > cutoff,
      image: `linear-gradient(to bottom, transparent ${cutoff - 190}px, ${BG} ${cutoff - 20}px)`,
    },
    {
      key: 'top',
      on: windowTop < 0,
      image: `linear-gradient(to bottom, ${BG} ${-windowTop}px, transparent ${-windowTop + 140}px)`,
    },
    {
      key: 'right',
      on: placement !== 'right',
      image: `linear-gradient(to right, transparent ${rightStart}px, ${BG} ${rightEdge}px)`,
    },
    {
      key: 'left',
      on: placement === 'right',
      image: `linear-gradient(to right, ${BG} ${leftEdge}px, transparent ${leftEnd}px)`,
    },
  ];
  const focusStyle = {
    '--mx': `${(focus.x / windowWidth) * 100}%`,
    '--my': `${(focus.y / windowHeight) * 100}%`,
    backgroundImage: fadeVeil,
    transition: '--mx 700ms ease, --my 700ms ease',
    borderRadius: 24,
  } as React.CSSProperties;
  return (
    <div
      ref={stageRef}
      data-stage=''
      className='relative w-full overflow-hidden'
      style={{ height: HERO }}
    >
      <PortalProvider container={stageRef}>
        <div
          className={cn(
            'absolute transition-[transform,top,opacity] duration-700 motion-reduce:transition-none',
            ease,
            !settled && 'opacity-0',
          )}
          style={{
            left: '50%',
            top: windowTop,
            width: `min(${WINDOW.maxWidth}px, calc(100% - ${WINDOW.margin * 2}px))`,
            minWidth: WINDOW.minWidth,
            height: windowHeight,
            transform: `translateX(calc(-50% + ${centerShift}px))`,
          }}
        >
          <div
            aria-hidden='true'
            className='absolute inset-0 bg-[color-mix(in_srgb,var(--background)_93%,var(--foreground))] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--foreground)_15%,transparent),inset_0_1px_0_rgba(255,255,255,0.12)]'
            style={{ padding: BEZEL, borderRadius: 24, ...clipStyle }}
          >
            <div className='bg-background flex h-full flex-col overflow-hidden rounded-2xl'>
              <div
                className='border-foreground/10 flex shrink-0 items-center gap-5 border-b px-5 text-neutral-500'
                style={{ height: TOOLBAR }}
              >
                <ToolbarIcon path='M3 5h18v14H3zM9 5v14' />
                <ToolbarIcon path='M15 18l-6-6 6-6' />
                <ToolbarIcon
                  path='M9 18l6-6-6-6'
                  className='opacity-40'
                />
                <ToolbarIcon path='M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5' />
                <Address url='app.acme.com/dashboard' />
              </div>
              <div className='min-h-0 flex-1'>
                <AppChrome
                  placement={placement}
                  rail={rail}
                  item={item}
                />
              </div>
            </div>
          </div>
          {veils.map(veil => (
            <div
              key={veil.key}
              aria-hidden='true'
              className='pointer-events-none absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none'
              style={{ backgroundImage: veil.image, opacity: veil.on ? 1 : 0, borderRadius: 24, ...clipStyle }}
            />
          ))}
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-0'
            style={focusStyle}
          />
          <div
            className={cn(
              'absolute left-0 top-0 motion-reduce:transition-none',
              settled && cn('transition-[translate] duration-500', ease),
            )}
            style={{ translate: `${inWindow.x}px ${inWindow.y}px` }}
          >
            <div
              className={cn('overflow-clip transition-[max-width] duration-500 motion-reduce:transition-none', ease)}
              style={{ maxWidth: clipWidth, overflowClipMargin: 6 }}
            >
              <div
                ref={buttonRef}
                className={cn('flex', buttonFills ? FILL_CLASS : 'w-max')}
                style={buttonFills ? { width: FILL_WIDTH } : undefined}
              >
                <PopIn
                  key={size}
                  instant={intro}
                >
                  <Switcher
                    type={type}
                    size={size}
                    placement={placement}
                    defaultOpen={intro}
                  />
                </PopIn>
              </div>
            </div>
          </div>
        </div>
      </PortalProvider>
    </div>
  );
}
export function userButtonProperties({
  type,
  size,
  onType,
  onSize,
  types = TYPE_OPTIONS,
}: {
  types?: { id: UserButtonType; label: string }[];
  type: UserButtonType;
  size: UserButtonSize;
  onType: (value: UserButtonType) => void;
  onSize: (value: UserButtonSize) => void;
}): Property[] {
  const sizeProperty: Property = {
    id: 'triggerVariant',
    label: 'triggerVariant',
    value: size,
    options: SIZE_OPTIONS,
    onChange: value => onSize(value as UserButtonSize),
  };
  if (types.length === 0) {
    return [sizeProperty];
  }
  return [
    {
      id: 'mode',
      label: 'mode',
      value: type,
      options: types.map(item => {
        const Glyph = TYPE_GLYPHS[item.id];
        return { ...item, icon: <Glyph className='size-4 shrink-0' /> };
      }),
      onChange: value => onType(value as UserButtonType),
    },
    sizeProperty,
  ];
}
export const BUTTON_CONFIG_MESSAGE = 'mosaic-user-button-config';
const parseType = (value: string | null): UserButtonType => ALL_TYPES.find(item => item.id === value)?.id ?? 'combined';
const parseSize = (value: string | null): UserButtonSize => SIZE_OPTIONS.find(item => item.id === value)?.id ?? 'full';
export function StagePreview({ type }: { type: UserButtonType }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rail = FILL_WIDTH + INSET * 2;
  return (
    <div
      ref={ref}
      data-stage=''
      className='bg-background text-foreground relative h-svh w-full overflow-hidden'
    >
      <PortalProvider container={ref}>
        <div className='absolute inset-0'>
          <AppChrome
            placement='top'
            rail={rail}
            item={{ width: FILL_WIDTH, height: 46 }}
          />
        </div>
        <div
          className={cn('absolute', FILL_CLASS)}
          style={{ left: INSET, top: INSET, width: FILL_WIDTH }}
        >
          <Switcher
            type={type}
            size='full'
            placement='top'
            defaultOpen
          />
        </div>
      </PortalProvider>
    </div>
  );
}
export function MobileUserButton({ type, size, url }: { type: string | null; size: string | null; url: string }) {
  const [config, setConfig] = React.useState({ type: parseType(type), size: parseSize(size) });
  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== BUTTON_CONFIG_MESSAGE) {
        return;
      }
      setConfig({ type: parseType(event.data.buttonType), size: parseSize(event.data.size) });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  const buttonType = config.type;
  const buttonSize = config.size;
  const right = buttonType === 'user';
  const switcher = (
    <div className={ITEM_CLASS}>
      <Switcher
        type={buttonType}
        size={buttonSize}
        placement={right ? 'right' : 'top'}
      />
    </div>
  );
  return (
    <MobileShell
      url={url}
      headerLeft={right ? undefined : switcher}
      headerRight={right ? switcher : undefined}
    >
      <div className='flex flex-col gap-5 pt-2'>
        <Skeleton className='h-6 w-44' />
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-3 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
      </div>
    </MobileShell>
  );
}
