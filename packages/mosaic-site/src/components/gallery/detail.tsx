'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import * as React from 'react';

import { Skeleton } from '@/components/gallery/app-wireframe';
import { DEMOS } from '@/components/gallery/demos';
import { ComponentDocs } from '@/components/gallery/docs';
import { EdgeGrid } from '@/components/gallery/edge-grid';
import { OptionPicker, RemixIcon, ThemeIcon } from '@/components/gallery/option-picker';
import { PropertiesMenu, type Property } from '@/components/gallery/properties-menu';
import { useApplyRemix } from '@/components/gallery/remix';
import { useEmbedScrollReceiver } from '@/components/gallery/scroll-bridge';
import { SegmentedControl } from '@/components/gallery/segmented-control';
import { ThemeStyles, useApplyTheme } from '@/components/gallery/theme';
import {
  BUTTON_CONFIG_MESSAGE,
  userButtonProperties,
  type UserButtonSize,
  UserButtonStage,
  type UserButtonType,
} from '@/components/gallery/user-button-stage';
import { ViewSwitcher } from '@/components/gallery/view-switcher';
import { XrayLegend, XrayOverlay } from '@/components/gallery/xray';
import { BrowserFrame } from '@/components/marketing/browser-frame';
import { ThemeToggle } from '@/components/theme-toggle';
import { DEFAULT_FRAME, frameUrlFor } from '@/lib/components/frame';
import { COMPONENT_META } from '@/lib/components/meta';
import { REMIX_MESSAGE, REMIXES_BY_SLUG, type RemixId } from '@/lib/components/remix';
import { THEME_MESSAGE, type ThemeId, THEMES } from '@/lib/components/theme';
import { cn } from '@/lib/utils';
const viewports = [
  {
    id: 'desktop',
    label: 'Desktop',
    width: '100%',
    path: 'M21 13H3M21 13V15C21 16.1046 20.1046 17 19 17H14M21 13V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V13M3 13V15C3 16.1046 3.89543 17 5 17H10M10 17H14M10 17V21H14V17',
  },
  {
    id: 'mobile',
    label: 'Mobile',
    width: '390px',
    path: 'M10 19H14M8 22H16C17.1046 22 18 21.1046 18 20V4C18 2.89543 17.1046 2 16 2H8C6.89543 2 6 2.89543 6 4V20C6 21.1046 6.89543 22 8 22Z',
  },
] as const;
function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      className={cn('size-4', className)}
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d={path} />
    </svg>
  );
}
function Fade({ active, className, children }: { active: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('absolute inset-0', className, active ? 'visible' : 'pointer-events-none hidden')}>
      {children}
    </div>
  );
}
function Stage({
  fill = false,
  tall = false,
  children,
}: {
  fill?: boolean;
  tall?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      data-preview-stage=''
      className={cn(
        'relative flex w-full flex-col items-center overflow-hidden transition-[min-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        tall ? 'justify-start' : 'justify-center',
        fill ? 'px-0 py-0' : tall ? 'px-4 pb-6 pt-2 md:px-8' : 'px-4 py-12 md:px-8',
        tall ? 'min-h-[min(calc(100svh+4rem),896px)]' : 'min-h-svh',
      )}
    >
      <EdgeGrid className='absolute inset-0' />
      <div className='pointer-events-none relative flex w-full flex-col items-center [&>*]:pointer-events-auto'>
        {children}
      </div>
    </div>
  );
}
const NARROW_QUERY = '(max-width: 767px)';
const subscribeNarrow = (listener: () => void) => {
  const query = window.matchMedia(NARROW_QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};
function useNarrow() {
  return React.useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW_QUERY).matches,
    () => false,
  );
}
function FitWidth({ width, children }: { width: number; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = React.useState(1);
  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(() => setZoom(Math.min(1, element.clientWidth / width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);
  return (
    <div
      ref={ref}
      className='flex w-full justify-center'
    >
      <div style={{ zoom }}>{children}</div>
    </div>
  );
}
function PhoneSkeleton({ visible }: { visible: boolean }) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 top-14 flex flex-col bg-[var(--cl-color-page,#fff)] transition-opacity duration-300 motion-reduce:transition-none',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div className='border-foreground/10 flex h-14 shrink-0 items-center justify-between border-b px-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='size-6' />
          <Skeleton className='h-3 w-20' />
        </div>
        <Skeleton className='size-7 rounded-full' />
      </div>
      <div className='flex flex-1 flex-col gap-5 px-4 pt-6'>
        <Skeleton className='h-6 w-44' />
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-3 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
      </div>
      <div className='border-foreground/10 flex h-16 shrink-0 items-center justify-around border-t px-4'>
        {[0, 1, 2, 3].map(item => (
          <div
            key={item}
            className='flex flex-col items-center gap-1.5'
          >
            <Skeleton className='size-5' />
            <Skeleton className='h-1.5 w-8' />
          </div>
        ))}
      </div>
      <div className='border-foreground/10 h-[6.25rem] shrink-0 border-t px-5 pt-2.5'>
        <Skeleton className='h-9 w-full rounded-full' />
      </div>
    </div>
  );
}
function PhoneFrame({
  src,
  modalSrc,
  showModal,
  title,
  message,
}: {
  src: string;
  modalSrc?: string;
  showModal: boolean;
  title: string;
  message?: Record<string, string> | Record<string, string>[];
}) {
  const container = React.useRef<HTMLDivElement>(null);
  const latest = React.useRef(message);
  const messageKey = message ? JSON.stringify(message) : '';
  const [loaded, setLoaded] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => {
    latest.current = message;
    if (!message) {
      return;
    }
    container.current?.querySelectorAll('iframe').forEach(frame => {
      [message].flat().forEach(item => frame.contentWindow?.postMessage(item, window.location.origin));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageKey]);
  return (
    <div className='relative'>
      <span className='absolute -left-[3px] top-24 h-7 w-[3px] rounded-l bg-[#d4d4d4] dark:bg-[#2a2a2a]' />
      <span className='absolute -left-[3px] top-40 h-12 w-[3px] rounded-l bg-[#d4d4d4] dark:bg-[#2a2a2a]' />
      <span className='absolute -left-[3px] top-56 h-12 w-[3px] rounded-l bg-[#d4d4d4] dark:bg-[#2a2a2a]' />
      <span className='absolute -right-[3px] top-44 h-20 w-[3px] rounded-r bg-[#d4d4d4] dark:bg-[#2a2a2a]' />
      <div className='ring-foreground/15 rounded-[58px] bg-[#ececec] p-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 dark:bg-[#1a1a1a]'>
        <div
          ref={container}
          className='text-foreground relative h-[min(calc(100svh-9rem),780px)] min-h-[760px] w-[390px] overflow-hidden rounded-[48px] bg-[var(--cl-color-page,#fff)]'
        >
          <div
            aria-hidden='true'
            className='pointer-events-none absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between px-9'
          >
            <span className='text-[15px] font-semibold tabular-nums'>9:41</span>
            <span className='absolute left-1/2 top-[11px] h-[34px] w-[120px] -translate-x-1/2 rounded-full bg-neutral-900 dark:bg-[#0b0b0d]' />
            <span className='flex items-center gap-1.5'>
              <svg
                viewBox='0 0 18 12'
                className='h-3 w-[18px]'
                fill='currentColor'
              >
                <rect
                  y='8'
                  width='3'
                  height='4'
                  rx='1'
                />
                <rect
                  x='5'
                  y='5.5'
                  width='3'
                  height='6.5'
                  rx='1'
                />
                <rect
                  x='10'
                  y='3'
                  width='3'
                  height='9'
                  rx='1'
                />
                <rect
                  x='15'
                  width='3'
                  height='12'
                  rx='1'
                />
              </svg>
              <svg
                viewBox='0 0 27 13'
                className='h-[13px] w-[27px]'
                fill='none'
              >
                <rect
                  x='.5'
                  y='.5'
                  width='22'
                  height='12'
                  rx='3.8'
                  stroke='currentColor'
                  opacity='.4'
                />
                <rect
                  x='2'
                  y='2'
                  width='19'
                  height='9'
                  rx='2.5'
                  fill='currentColor'
                />
                <path
                  d='M24.5 4.5v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2z'
                  fill='currentColor'
                  opacity='.4'
                />
              </svg>
            </span>
          </div>
          {[
            { url: src, label: title, active: !showModal },
            ...(modalSrc ? [{ url: modalSrc, label: `${title} in a dialog`, active: showModal }] : []),
          ].map(frame => (
            <iframe
              key={frame.url}
              src={`${frame.url}${frame.url.includes('?') ? '&' : '?'}touch=1`}
              title={`${frame.label} on a phone`}
              onLoad={event => {
                setLoaded(current => ({ ...current, [frame.url]: true }));
                const target = event.currentTarget.contentWindow;
                const send = () =>
                  [latest.current].flat().forEach(item => item && target?.postMessage(item, window.location.origin));
                send();
                [300, 1000, 2500].forEach(delay => window.setTimeout(send, delay));
              }}
              className={cn(
                'absolute inset-x-0 top-14 h-[calc(100%-3.5rem)] w-full border-0 transition-opacity duration-300 motion-reduce:transition-none',
                frame.active ? 'visible' : 'invisible',
                loaded[frame.url] ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}
          <PhoneSkeleton visible={!loaded[showModal && modalSrc ? modalSrc : src]} />
          <span className='bg-foreground/80 pointer-events-none absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full' />
        </div>
      </div>
    </div>
  );
}
function PageTitle({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className='flex w-full max-w-[780px] flex-col items-center gap-3 px-4 pb-10 pt-14 text-center md:px-0'>
      <h1
        className='text-[44px] font-semibold leading-[1.05] tracking-[-0.04em]'
        style={{ fontFamily: 'var(--font-heading)' }}
      >
        {title}
      </h1>
      <p className='text-[19px] leading-8 text-neutral-600 dark:text-neutral-400'>{description}</p>
      {children ? <div className='mt-2'>{children}</div> : null}
    </div>
  );
}
const VIEW_OPTIONS = [
  { id: 'flush' as const, label: 'flush' },
  { id: 'modal' as const, label: 'modal' },
  { id: 'fullscreen' as const, label: 'full screen' },
];
const pill =
  'flex items-center gap-1 rounded-full bg-white p-1 shadow-[0_0_0_1px_--theme(--color-gray-950/0.06),0_8px_24px_-8px_--theme(--color-gray-950/0.18)] dark:bg-gray-900 dark:shadow-[0_0_0_1px_--theme(--color-white/0.08),0_8px_24px_-8px_--theme(--color-black/0.6)]';
export function ComponentDetail({ slug }: { slug: string }) {
  const index = COMPONENT_META.findIndex(item => item.slug === slug);
  const meta = COMPONENT_META[index];
  const Demo = DEMOS[slug];
  useEmbedScrollReceiver();
  const [chosenViewport, setViewport] = React.useState<(typeof viewports)[number]['id']>('desktop');
  const narrow = useNarrow();
  const viewport = narrow ? 'mobile' : chosenViewport;
  const [warm, setWarm] = React.useState(false);
  const stageSlug = slug === 'user-button' || slug === 'organization-switcher';
  const [buttonType, setButtonType] = React.useState<UserButtonType>(
    slug === 'organization-switcher' ? 'org' : 'combined',
  );
  const [buttonSize, setButtonSize] = React.useState<UserButtonSize>('full');
  const [initialButton, setInitialButton] = React.useState<{ type: string; size: string }>({
    type: 'combined',
    size: 'full',
  });
  const [chosenMode, setMode] = React.useState<'flush' | 'modal' | 'fullscreen'>('flush');
  const [theme, setTheme] = React.useState<ThemeId>('default');
  const [remix, setRemix] = React.useState<RemixId>('default');
  const [source, setSource] = React.useState<'component' | 'blocks'>('component');
  const [xray, setXray] = React.useState(false);
  const [flushTarget, setFlushTarget] = React.useState<HTMLElement | null>(null);
  const remixOptions = REMIXES_BY_SLUG[slug];
  const blocks = Boolean(remixOptions) && source === 'blocks';
  const themable = !blocks;
  const mode = blocks ? 'flush' : chosenMode;
  const activeTheme = themable ? theme : 'default';
  const activeRemix = blocks ? remix : 'default';
  useApplyTheme(activeTheme);
  useApplyRemix(activeRemix);
  const appearanceMessages: Record<string, string>[] = themable
    ? [
        { type: THEME_MESSAGE, theme: activeTheme },
        { type: REMIX_MESSAGE, remix: activeRemix },
      ]
    : [];
  const showModal = Boolean(meta.modal) && mode === 'modal';
  const xrayAvailable = slug === 'user-profile' && viewport === 'desktop' && mode === 'flush';
  const xrayActive = xray && xrayAvailable;
  const properties: Property[] = [
    ...(meta.modal && !blocks
      ? [
          {
            id: 'view',
            label: 'view',
            value: mode,
            options: VIEW_OPTIONS,
            onChange: (value: string) => setMode(value as typeof mode),
          },
        ]
      : []),
    ...(stageSlug
      ? userButtonProperties({
          type: buttonType,
          size: buttonSize,
          onType: setButtonType,
          onSize: setButtonSize,
          ...(slug === 'organization-switcher' ? { types: [] } : {}),
        })
      : []),
  ];
  const sourceToggle = remixOptions ? (
    <div className={pill}>
      <SegmentedControl
        label='Source'
        value={source}
        cellWidth={96}
        options={[
          { id: 'component', label: 'Component' },
          { id: 'blocks', label: 'Blocks' },
        ]}
        onChange={id => {
          setSource(id);
          if (id === 'blocks' && remix === 'default') {
            setRemix(remixOptions.find(option => option.id !== 'default')?.id ?? 'default');
          }
        }}
      />
    </div>
  ) : null;
  const frameUrl = frameUrlFor(slug);
  const heroText = stageSlug && viewport !== 'mobile';
  React.useEffect(() => {
    const timer = window.setTimeout(() => setWarm(true), 150);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <MosaicProvider>
      <ThemeStyles />
      <div className='flex flex-col items-center pb-28'>
        {meta.modal ? (
          <div className='relative flex w-full flex-col items-center'>
            <EdgeGrid
              variant='sides'
              className='absolute inset-0'
            />
            <PageTitle
              title={meta.title}
              description={meta.description}
            >
              {sourceToggle}
            </PageTitle>
            <ViewSwitcher
              viewport={viewport}
              mountMobile={warm}
              desktop={
                <div className='relative h-[820px] w-full overflow-hidden'>
                  <Fade
                    active={mode === 'flush'}
                    className='flex items-center justify-center px-4 md:px-8'
                  >
                    <div
                      ref={setFlushTarget}
                      className='relative w-[min(100%,1170px)] max-w-full'
                    >
                      <BrowserFrame
                        config={{ ...DEFAULT_FRAME, slug, url: frameUrl }}
                        interactive
                        className='w-full'
                      />
                      <XrayOverlay
                        target={flushTarget}
                        active={xrayActive}
                      />
                    </div>
                  </Fade>
                  <Fade
                    active={mode === 'fullscreen'}
                    className='flex items-center justify-center px-4 md:px-8'
                  >
                    <div className='relative w-[min(100%,1170px)] max-w-full'>
                      <BrowserFrame
                        config={{ ...DEFAULT_FRAME, slug, url: frameUrl, mode: 'fullscreen' }}
                        interactive
                        className='w-full'
                      />
                    </div>
                  </Fade>
                  <Fade
                    active={showModal}
                    className='flex items-center justify-center px-4 md:px-8'
                  >
                    <div className='relative w-[min(100%,1170px)] max-w-full'>
                      <BrowserFrame
                        config={{ ...DEFAULT_FRAME, slug, url: frameUrl }}
                        embed={{
                          src: `/embed/${slug}/modal?theme=${activeTheme}&remix=${activeRemix}`,
                          title: `${meta.title} in a dialog`,
                        }}
                        className='w-full'
                      />
                    </div>
                  </Fade>
                </div>
              }
              mobile={
                <div className='flex min-h-[820px] w-full items-center justify-center'>
                  <FitWidth width={410}>
                    <PhoneFrame
                      src={`/embed/${slug}`}
                      modalSrc={`/embed/${slug}/modal`}
                      message={appearanceMessages.length > 0 ? appearanceMessages : undefined}
                      showModal={showModal}
                      title={meta.title}
                    />
                  </FitWidth>
                </div>
              }
            />
          </div>
        ) : (
          <>
            {heroText ? null : (
              <PageTitle
                title={meta.title}
                description={meta.description}
              >
                {sourceToggle}
              </PageTitle>
            )}
            <Stage
              fill={heroText}
              tall={stageSlug}
            >
              {heroText ? (
                <PageTitle
                  title={meta.title}
                  description={meta.description}
                >
                  {sourceToggle}
                </PageTitle>
              ) : null}
              <ViewSwitcher
                viewport={viewport}
                mountMobile={warm}
                desktop={
                  <div className={cn('w-full', stageSlug ? 'flex h-[820px] items-center' : 'max-w-[1100px]')}>
                    <div className={cn('w-full', !stageSlug && meta.center && 'flex items-center justify-center')}>
                      {stageSlug ? (
                        <UserButtonStage
                          type={buttonType}
                          size={buttonSize}
                        />
                      ) : (
                        <Demo />
                      )}
                    </div>
                  </div>
                }
                mobile={
                  stageSlug ? (
                    <div className='flex h-[820px] w-full items-center justify-center'>
                      <FitWidth width={410}>
                        <PhoneFrame
                          src={
                            stageSlug
                              ? `/embed/${slug}?type=${initialButton.type}&size=${initialButton.size}`
                              : `/embed/${slug}`
                          }
                          message={
                            stageSlug
                              ? [{ type: BUTTON_CONFIG_MESSAGE, buttonType, size: buttonSize }, ...appearanceMessages]
                              : appearanceMessages.length > 0
                                ? appearanceMessages
                                : undefined
                          }
                          showModal={false}
                          title={meta.title}
                        />
                      </FitWidth>
                    </div>
                  ) : (
                    <PhoneFrame
                      src={
                        stageSlug
                          ? `/embed/${slug}?type=${initialButton.type}&size=${initialButton.size}`
                          : `/embed/${slug}`
                      }
                      message={
                        stageSlug
                          ? [{ type: BUTTON_CONFIG_MESSAGE, buttonType, size: buttonSize }, ...appearanceMessages]
                          : appearanceMessages.length > 0
                            ? appearanceMessages
                            : undefined
                      }
                      showModal={false}
                      title={meta.title}
                    />
                  )
                }
              />
            </Stage>
          </>
        )}
        <div className='pointer-events-none sticky bottom-5 z-20 mt-6 flex w-full justify-center'>
          <div className='pointer-events-auto flex flex-wrap items-center justify-center gap-2'>
            {xrayAvailable ? (
              <div className={pill}>
                <button
                  type='button'
                  aria-pressed={xray}
                  onClick={() => setXray(value => !value)}
                  className={cn(
                    'flex h-8 items-center gap-2 rounded-full px-3 text-sm transition-colors',
                    xray ? 'bg-foreground text-background' : 'hover:bg-foreground/[0.06]',
                  )}
                >
                  X-ray
                </button>
                {xrayActive ? <XrayLegend /> : null}
              </div>
            ) : null}
            <div className={pill}>
              {narrow ? null : (
                <SegmentedControl
                  label='Preview size'
                  value={viewport}
                  options={viewports.map(item => ({
                    id: item.id,
                    label: item.label,
                    icon: <Icon path={item.path} />,
                  }))}
                  onChange={id => {
                    setViewport(id);
                    if (id === 'mobile') {
                      setInitialButton({ type: buttonType, size: buttonSize });
                    }
                  }}
                />
              )}
              <ThemeToggle className='border-0' />
              {properties.length > 0 ? (
                <PropertiesMenu
                  properties={properties}
                  pillClass={pill}
                  embedded
                />
              ) : null}
            </div>
            {themable ? (
              <OptionPicker
                label='Theme'
                slug={slug}
                options={THEMES}
                value={theme}
                onChange={value => setTheme(value as ThemeId)}
                previewQuery={id => `theme=${id}&remix=default`}
                icon={() => <ThemeIcon />}
                pillClass={pill}
              />
            ) : null}
            {blocks && remixOptions ? (
              <OptionPicker
                label='Remix'
                slug={slug}
                options={remixOptions.filter(option => option.id !== 'default')}
                value={remix}
                onChange={value => setRemix(value as RemixId)}
                previewQuery={id => `remix=${id}&theme=default`}
                icon={active => <RemixIcon active={active} />}
                pillClass={pill}
              />
            ) : null}
          </div>
        </div>
        <div className='flex w-full flex-col items-center px-4 md:px-8'>
          <ComponentDocs
            slug={slug}
            fallback={meta.snippet}
          />
        </div>
      </div>
    </MosaicProvider>
  );
}
