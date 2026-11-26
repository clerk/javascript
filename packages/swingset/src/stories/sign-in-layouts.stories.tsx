import { Card } from '@clerk/mosaic/components/card';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { StoryMosaicProvider } from '@/components/ChaosProvider';
import { CodeBlock } from '@/components/CodeBlock';
import type { StoryMeta } from '@/lib/types';

import type { AuthConfig } from './fixtures/auth-config';
import { AuthConfigContext, DEFAULT_AUTH_CONFIG, hasFinishStep } from './fixtures/auth-config';
import { PasskeyPromptHarness } from './fixtures/passkey-prompt';
import { ManyMethodsContext, WorkingExample as SignInWorkingExample } from './sign-in.stories';
import { WorkingExample as SignUpWorkingExample } from './sign-up.stories';
import { TaskChooseOrganizationHarness } from './task-choose-organization.stories';
import { TaskSetupMfaHarness } from './task-setup-mfa.stories';

export const meta: StoryMeta = {
  group: 'Authentication',
  title: 'SignInLayouts',
  label: 'Sign-in layouts',
  status: 'wip',
  substatus: 'needs design',
  layout: 'wide',
  source: 'packages/mosaic/src/features/sign-in/sign-in.view.tsx',
};

type Flow = 'sign-in' | 'sign-up';

type JourneyStage = 'auth' | 'mfa' | 'passkey' | 'choose' | 'create' | 'done';

const JOURNEY: ReadonlyArray<{ value: JourneyStage; label: string }> = [
  { value: 'auth', label: 'Sign in or sign up' },
  { value: 'mfa', label: 'Set up MFA' },
  { value: 'passkey', label: 'Offer a passkey' },
  { value: 'choose', label: 'Organizations to join' },
  { value: 'create', label: 'Nothing to join' },
];
type Layout = 'centered' | 'split' | 'brand' | 'app';
type Surface = 'card' | 'flush';
type CardHeight = 'auto' | 'minimum';

const CARD_HEIGHT_CLASS: Record<CardHeight, string> = {
  auto: '',
  minimum: '[&_.cl-card-root:not(.cl-card-root_.cl-card-root)]:!min-h-[475px]',
};

const LAYOUTS: Record<Layout, { label: string; description: string; defaultSurface: Surface }> = {
  centered: {
    label: 'Centered',
    description: 'The hosted-page default: one card centered on a quiet page.',
    defaultSurface: 'card',
  },
  split: {
    label: 'Split screen',
    description: 'The form on one half, the brand on the other. The form usually sits flush on the page.',
    defaultSurface: 'flush',
  },
  brand: {
    label: 'Brand background',
    description: 'A card floating over a full-bleed brand color or image.',
    defaultSurface: 'card',
  },
  app: {
    label: 'Inside an app shell',
    description: 'A top bar from the host app, with sign-in in the content area.',
    defaultSurface: 'flush',
  },
};

const JOURNEY_TRANSITION = `
.journey-stage .cl-card-root { view-transition-name: journey-card; }
.journey-stage .cl-auth-mark { view-transition-name: journey-mark; }
.journey-stage .cl-card-root > :has(> .cl-branding) { view-transition-name: journey-branding; }
.journey-stage .cl-card-root > .cl-card-footer { view-transition-name: journey-signout; }
::view-transition-group(journey-card),
::view-transition-group(journey-mark),
::view-transition-group(journey-branding),
::view-transition-group(journey-signout) {
  animation-duration: 250ms;
  animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
}
:root[data-journey-shrink]::view-transition-group(journey-card),
:root[data-journey-shrink]::view-transition-group(journey-mark),
:root[data-journey-shrink]::view-transition-group(journey-branding),
:root[data-journey-shrink]::view-transition-group(journey-signout) {
  animation-timing-function: cubic-bezier(0.645, 0.045, 0.355, 1);
}
::view-transition-group(journey-card) {
  background: var(--journey-surface-bg, transparent);
  box-shadow: var(--journey-surface-shadow, none);
  border-radius: var(--journey-surface-radius, 0);
}
::view-transition-image-pair(journey-card) { overflow: clip; border-radius: var(--journey-surface-radius, 0); }
::view-transition-old(journey-card),
::view-transition-new(journey-card) {
  height: 100%;
  object-fit: none;
  object-position: top;
  mix-blend-mode: normal;
}
::view-transition-old(journey-card),
::view-transition-old(journey-signout):only-child {
  animation: 100ms cubic-bezier(0.55, 0.085, 0.68, 0.53) both journey-out;
}
::view-transition-new(journey-card),
::view-transition-new(journey-signout):only-child {
  animation: 150ms cubic-bezier(0, 0, 0.2, 1) 100ms both journey-in;
}
::view-transition-old(journey-mark),
::view-transition-new(journey-mark),
::view-transition-old(journey-branding),
::view-transition-new(journey-branding),
::view-transition-old(journey-signout),
::view-transition-new(journey-signout) { animation: none; }
::view-transition-old(journey-mark),
::view-transition-old(journey-branding),
::view-transition-old(journey-signout) { opacity: 0; }
::view-transition-old(root),
::view-transition-new(root) { animation: none; }
@keyframes journey-out { to { opacity: 0; } }
@keyframes journey-in { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
`;

const PIN_TO_TOP_CSS = `/* Your page wrapper */
.auth-page {
  align-items: start;
  padding-block-start: max(2rem, 15vh);
}`;

const HIDE_BRANDING_CSS = '.cl-card-root > :has(> .cl-branding) { display: none !important; }';

type CardPosition = 'centered' | 'pinned';

function journeyCard() {
  return document.querySelector<HTMLElement>('.journey-stage .cl-card-root');
}

function withViewTransition(update: () => void) {
  if (typeof document.startViewTransition !== 'function') {
    update();
    return;
  }
  const root = document.documentElement;
  const before = journeyCard();
  const beforeHeight = before?.getBoundingClientRect().height ?? 0;
  if (before) {
    const surface = getComputedStyle(before);
    root.style.setProperty('--journey-surface-bg', surface.backgroundColor);
    root.style.setProperty('--journey-surface-shadow', surface.boxShadow);
    root.style.setProperty('--journey-surface-radius', surface.borderRadius);
  }
  const transition = document.startViewTransition(() => {
    flushSync(update);
    const afterHeight = journeyCard()?.getBoundingClientRect().height ?? 0;
    root.toggleAttribute('data-journey-shrink', afterHeight < beforeHeight);
  });
  void transition.finished.finally(() => root.removeAttribute('data-journey-shrink'));
}

function Journey({ start, organizations }: { start: Flow; organizations: boolean }) {
  const [stage, setStage] = useState<JourneyStage>('auth');
  const [isNew, setIsNew] = useState(start === 'sign-up');
  const [runId, setRunId] = useState(0);
  const { requireMfa, offerPasskey, organizationRequired, identifier, combined } = useContext(AuthConfigContext);
  const toDone = () => withViewTransition(() => setStage('done'));
  const afterPasskey = (created: boolean): JourneyStage => (organizations && created ? 'choose' : 'done');
  const afterMfa = (created: boolean): JourneyStage => (created && offerPasskey ? 'passkey' : afterPasskey(created));
  const finish = (created: boolean) =>
    withViewTransition(() => {
      setIsNew(created);
      setStage(created && requireMfa ? 'mfa' : afterMfa(created));
    });
  const stages = JOURNEY.filter(item =>
    item.value === 'mfa'
      ? requireMfa
      : item.value === 'passkey'
        ? offerPasskey
        : item.value === 'auth' || organizations,
  );
  const restart = () =>
    withViewTransition(() => {
      setStage('auth');
      setRunId(current => current + 1);
    });
  return (
    <div className='journey-stage grid justify-items-center gap-6'>
      <style>{JOURNEY_TRANSITION}</style>
      {stage === 'auth' ? (
        start === 'sign-in' || combined ? (
          <SignInWorkingExample
            key={runId}
            newAccount={start === 'sign-up'}
            onComplete={outcome => finish(outcome.kind === 'signed-up')}
          />
        ) : (
          <SignUpWorkingExample
            key={runId}
            onComplete={() => finish(true)}
          />
        )
      ) : stage === 'mfa' ? (
        <TaskSetupMfaHarness
          key={runId}
          knownPhones={
            identifier === 'phone' ? [{ id: 'phone_signup', phoneNumber: '+15555550101', verified: true }] : []
          }
          onComplete={() => withViewTransition(() => setStage(afterMfa(true)))}
        />
      ) : stage === 'passkey' ? (
        <PasskeyPromptHarness
          key={runId}
          onComplete={() => withViewTransition(() => setStage(afterPasskey(true)))}
        />
      ) : stage === 'choose' ? (
        <TaskChooseOrganizationHarness
          key={runId}
          optional={!organizationRequired}
          onComplete={toDone}
        />
      ) : stage === 'create' ? (
        <TaskChooseOrganizationHarness
          key={runId}
          empty
          optional={!organizationRequired}
          onComplete={toDone}
        />
      ) : (
        <div className='grid gap-3 text-center'>
          <p className='text-lg font-semibold'>{isNew ? 'Sign-up complete' : 'Signed in'}</p>
          <p className='text-muted-foreground text-sm'>
            {!organizations
              ? 'Organizations are off, so the app opens next.'
              : isNew
                ? 'The app opens in the organization they chose.'
                : 'The app opens in the organization they used last.'}
          </p>
          <button
            type='button'
            onClick={restart}
            className='hover:bg-muted mx-auto rounded-md border px-3 py-1.5 text-[13px] font-medium'
          >
            Start over
          </button>
        </div>
      )}
      {stages.length > 1 ? (
        <nav
          aria-label='Journey'
          className='bg-background/80 fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border p-1 text-[12px] shadow-sm backdrop-blur-sm'
        >
          {stages.map((item, index) => (
            <button
              key={item.value}
              type='button'
              aria-current={stage === item.value ? 'step' : undefined}
              onClick={() =>
                withViewTransition(() => {
                  setStage(item.value);
                  setRunId(current => current + 1);
                })
              }
              className='text-muted-foreground aria-[current=step]:bg-foreground aria-[current=step]:text-background whitespace-nowrap rounded-full px-3 py-1 font-medium'
            >
              {index + 1}. {item.value === 'auth' ? (start === 'sign-in' ? 'Sign in' : 'Sign up') : item.label}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

function AuthForm({
  flow,
  surface,
  manyMethods,
  organizations,
}: {
  flow: Flow;
  surface: Surface;
  manyMethods: boolean;
  organizations: boolean;
}) {
  const form = (
    <Journey
      start={flow}
      organizations={organizations}
    />
  );
  const { branding } = useContext(AuthConfigContext);
  return (
    <StoryMosaicProvider>
      {branding ? null : <style>{HIDE_BRANDING_CSS}</style>}
      <ManyMethodsContext.Provider value={manyMethods}>
        {surface === 'flush' ? (
          <Card.Root
            elevation='flush'
            renderBranding={false}
          >
            {form}
          </Card.Root>
        ) : (
          form
        )}
      </ManyMethodsContext.Provider>
    </StoryMosaicProvider>
  );
}

function AcmeMark({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className='flex items-center gap-2'>
      <div
        className={`grid size-7 place-items-center rounded-lg ${inverted ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'}`}
      >
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='none'
          aria-hidden
        >
          <path
            d='M5 19L12 5l7 14'
            stroke='currentColor'
            strokeWidth='2.6'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
      <span className={`text-sm font-semibold ${inverted ? 'text-white' : ''}`}>Acme</span>
    </div>
  );
}

function Page({
  layout,
  flow,
  surface,
  manyMethods,
  organizations,
  cardHeight,
  cardPosition,
}: {
  layout: Layout;
  flow: Flow;
  surface: Surface;
  manyMethods: boolean;
  organizations: boolean;
  cardHeight: CardHeight;
  cardPosition: CardPosition;
}) {
  const heightClass = CARD_HEIGHT_CLASS[cardHeight];
  const place = 'auth-page [place-items:safe_center]';
  const form = (
    <>
      {cardPosition === 'pinned' ? <style>{PIN_TO_TOP_CSS}</style> : null}
      <AuthForm
        flow={flow}
        surface={surface}
        manyMethods={manyMethods}
        organizations={organizations}
      />
    </>
  );

  if (layout === 'split') {
    return (
      <div className='bg-background grid h-full grid-cols-1 md:grid-cols-2'>
        <div className='flex flex-col'>
          <div className='px-8 pt-6'>
            <AcmeMark />
          </div>
          <div className={`grid flex-1 grid-cols-[minmax(0,1fr)] px-6 py-10 ${place} ${heightClass}`}>{form}</div>
        </div>
        <div className='relative hidden overflow-hidden bg-[radial-gradient(120%_90%_at_20%_10%,#6c47ff_0%,#2a1a8a_45%,#0b0b1a_100%)] md:block'>
          <div className='absolute inset-x-12 bottom-12 grid gap-4 text-white'>
            <p className='text-2xl font-semibold leading-snug tracking-tight'>
              “We shipped auth in an afternoon and never thought about it again.”
            </p>
            <p className='text-sm text-white/70'>Ada Lovelace · Head of Platform, Analytical Engines</p>
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'brand') {
    return (
      <div
        className={`grid h-full grid-cols-[minmax(0,1fr)] overflow-auto bg-[radial-gradient(100%_80%_at_50%_0%,#6c47ff_0%,#1d1250_55%,#0b0b1a_100%)] px-6 py-10 ${place} ${heightClass}`}
      >
        <div className='grid justify-items-center gap-6'>
          <AcmeMark inverted />
          {form}
        </div>
      </div>
    );
  }

  if (layout === 'app') {
    return (
      <div className='bg-background flex h-full flex-col'>
        <header className='flex h-14 shrink-0 items-center justify-between border-b px-6'>
          <AcmeMark />
          <nav className='text-muted-foreground hidden gap-6 text-sm sm:flex'>
            <span>Product</span>
            <span>Pricing</span>
            <span>Docs</span>
          </nav>
        </header>
        <div className={`grid flex-1 grid-cols-[minmax(0,1fr)] overflow-auto px-6 py-10 ${place} ${heightClass}`}>
          {form}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-muted/40 grid h-full grid-cols-[minmax(0,1fr)] overflow-auto px-6 py-10 dark:bg-neutral-950 ${place} ${heightClass}`}
    >
      {form}
    </div>
  );
}

function BrowserFrame({
  flow,
  toolbar,
  children,
}: {
  flow: Flow;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className='bg-background flex h-full flex-col overflow-hidden rounded-xl border shadow-xl dark:border-white/15 dark:shadow-black'>
      <div className='bg-muted/60 flex h-10 shrink-0 items-center gap-3 border-b px-4 dark:border-white/10 dark:bg-black'>
        <div className='flex gap-1.5'>
          <span className='size-3 rounded-full bg-[#ff5f57]' />
          <span className='size-3 rounded-full bg-[#febc2e]' />
          <span className='size-3 rounded-full bg-[#28c840]' />
        </div>
        <div className='bg-background text-muted-foreground mx-auto w-full max-w-md truncate rounded-md border px-3 py-1 text-center text-xs dark:border-white/10 dark:bg-neutral-900'>
          accounts.acme.com/{flow}
        </div>
        <div className='flex w-24 justify-end'>{toolbar}</div>
      </div>
      <div className='relative min-h-0 flex-1 [container-type:size] [transform:translateZ(0)]'>{children}</div>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className='grid gap-1.5'>
      <span className='text-muted-foreground text-xs font-medium'>{label}</span>
      <div className='bg-muted flex w-fit max-w-full flex-wrap rounded-lg p-0.5'>
        {options.map(option => (
          <button
            key={option.value}
            type='button'
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className='text-muted-foreground aria-pressed:bg-background aria-pressed:text-foreground rounded-md px-3 py-1 text-[13px] font-medium aria-pressed:shadow-sm'
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const STORAGE_PREFIX = 'swingset-sign-in-layouts-v2:';

function useStoredState<T>(name: string, initial: T, restore: (stored: T) => T = stored => stored) {
  const [value, setValue] = useState<T>(initial);
  const [restored, setRestored] = useState(false);
  const restoreRef = useRef(restore);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + name);
      if (raw !== null) {
        setValue(restoreRef.current(JSON.parse(raw) as T));
      }
    } catch {
      localStorage.removeItem(STORAGE_PREFIX + name);
    }
    setRestored(true);
  }, [name]);
  useEffect(() => {
    if (restored) {
      localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(value));
    }
  }, [name, restored, value]);
  return [value, setValue] as const;
}

type SettingsTab = 'dashboard' | 'component' | 'scenario';

const SETTINGS_TABS: ReadonlyArray<{ value: SettingsTab; label: string; description: string }> = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    description: 'Configured for the instance in the Clerk Dashboard.',
  },
  {
    value: 'component',
    label: 'Component',
    description: 'Props and page setup a developer controls.',
  },
  {
    value: 'scenario',
    label: 'Scenario',
    description: 'Who is signing in and what they did before.',
  },
];

export function Layouts() {
  const [flow, setFlow] = useStoredState<Flow>('flow', 'sign-in');
  const [layout, setLayout] = useStoredState<Layout>('layout', 'centered');
  const [surface, setSurface] = useStoredState<Surface>('surface', LAYOUTS.centered.defaultSurface);
  const [fullScreen, setFullScreen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useStoredState<SettingsTab>('tab', 'dashboard');
  const [manyMethods, setManyMethods] = useStoredState('manyMethods', false);
  const [cardPosition, setCardPosition] = useStoredState<CardPosition>('cardPosition', 'centered');
  const [showPositionCss, setShowPositionCss] = useState(false);
  const [organizations, setOrganizations] = useStoredState('organizations', true);
  const [authConfig, setAuthConfig] = useStoredState<AuthConfig>('authConfig', DEFAULT_AUTH_CONFIG, stored => ({
    ...DEFAULT_AUTH_CONFIG,
    ...stored,
  }));
  const scenarioConfig: AuthConfig = flow === 'sign-up' ? { ...authConfig, lastUsed: 'none' } : authConfig;
  const configKey = JSON.stringify(scenarioConfig);

  useEffect(() => {
    if (!fullScreen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullScreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullScreen]);

  const chooseLayout = (next: Layout) => {
    setLayout(next);
    setSurface(LAYOUTS[next].defaultSurface);
  };

  const set =
    <K extends keyof AuthConfig>(key: K) =>
    (value: AuthConfig[K]) =>
      setAuthConfig(current => ({ ...current, [key]: value }));

  const page = (suffix: string) => (
    <Page
      key={`${flow}-${layout}-${surface}-${manyMethods}-${organizations}-${configKey}${suffix}`}
      layout={layout}
      flow={flow}
      surface={surface}
      manyMethods={manyMethods}
      organizations={organizations}
      cardHeight='minimum'
      cardPosition={cardPosition}
    />
  );

  const reset = () => {
    setAuthConfig(DEFAULT_AUTH_CONFIG);
    setOrganizations(true);
    setManyMethods(false);
    setFlow('sign-in');
    chooseLayout('centered');
    setCardPosition('centered');
  };

  return (
    <AuthConfigContext.Provider value={scenarioConfig}>
      <div className='not-prose grid gap-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <p className='text-muted-foreground me-auto text-sm'>
            {LAYOUTS[layout].description} <span className='text-foreground'>Sign-up: {signUpSteps(authConfig)}</span>
          </p>
          <button
            type='button'
            onClick={() => setFullScreen(true)}
            className='hover:bg-muted rounded-md border px-3 py-1.5 text-[13px] font-medium'
          >
            Full screen
          </button>
        </div>
        <div className='relative h-[760px]'>
          {fullScreen ? null : (
            <BrowserFrame
              flow={flow}
              toolbar={
                <button
                  type='button'
                  aria-pressed={panelOpen}
                  onClick={() => setPanelOpen(open => !open)}
                  className='bg-background hover:bg-muted aria-pressed:bg-muted rounded-md border px-2.5 py-1 text-xs font-medium dark:border-white/10'
                >
                  Settings
                </button>
              }
            >
              {page('')}
            </BrowserFrame>
          )}
          {panelOpen ? (
            <aside
              aria-label='Prototype settings'
              className='bg-background absolute bottom-3 end-3 top-[3.25rem] z-20 flex w-[320px] flex-col overflow-hidden rounded-lg border shadow-xl'
            >
              <div className='grid gap-2 border-b p-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-[13px] font-medium'>Settings</span>
                  <button
                    type='button'
                    aria-label='Close settings'
                    onClick={() => setPanelOpen(false)}
                    className='text-muted-foreground hover:text-foreground hover:bg-muted grid size-6 place-items-center rounded-md text-[15px] leading-none'
                  >
                    ×
                  </button>
                </div>
                <div
                  role='tablist'
                  aria-label='Setting groups'
                  className='bg-muted grid grid-cols-3 rounded-lg p-0.5'
                >
                  {SETTINGS_TABS.map(item => (
                    <button
                      key={item.value}
                      type='button'
                      role='tab'
                      aria-selected={tab === item.value}
                      onClick={() => setTab(item.value)}
                      className='text-muted-foreground aria-selected:bg-background aria-selected:text-foreground rounded-md px-2 py-1 text-[13px] font-medium aria-selected:shadow-sm'
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className='text-muted-foreground text-xs'>
                  {SETTINGS_TABS.find(item => item.value === tab)?.description}
                </p>
              </div>
              <div
                role='tabpanel'
                className='grid flex-1 content-start gap-4 overflow-y-auto p-3'
              >
                {tab === 'dashboard' ? (
                  <DashboardSettings
                    config={authConfig}
                    set={set}
                    organizations={organizations}
                    onOrganizationsChange={setOrganizations}
                  />
                ) : tab === 'component' ? (
                  <>
                    <Segmented
                      label='Sign-in screen'
                      value={authConfig.combined ? 'combined' : 'separate'}
                      options={[
                        { value: 'combined', label: 'Combined' },
                        { value: 'separate', label: 'Single' },
                      ]}
                      onChange={value => set('combined')(value === 'combined')}
                    />
                    <Segmented
                      label='Page layout'
                      value={layout}
                      options={(Object.keys(LAYOUTS) as Layout[]).map(key => ({
                        value: key,
                        label: LAYOUTS[key].label,
                      }))}
                      onChange={chooseLayout}
                    />
                    <Segmented
                      label='Surface'
                      value={surface}
                      options={[
                        { value: 'card', label: 'Card' },
                        { value: 'flush', label: 'Flush' },
                      ]}
                      onChange={setSurface}
                    />
                    <Segmented
                      label='Logo'
                      value={authConfig.showLogo ? authConfig.logoStyle : 'hide'}
                      options={[
                        { value: 'icon', label: 'Icon' },
                        { value: 'wordmark', label: 'Wordmark' },
                        { value: 'hide', label: 'Hide' },
                      ]}
                      onChange={value =>
                        setAuthConfig(current =>
                          value === 'hide'
                            ? { ...current, showLogo: false }
                            : { ...current, showLogo: true, logoStyle: value },
                        )
                      }
                    />
                    <SettingsGroup title='Customization'>
                      <Segmented
                        label='Card position'
                        value={cardPosition}
                        options={[
                          { value: 'centered', label: 'Centered' },
                          { value: 'pinned', label: 'Pinned to top' },
                        ]}
                        onChange={setCardPosition}
                      />
                      <p className='text-muted-foreground text-xs'>
                        Pinned keeps the top edge still, so the form only grows downward as steps change. Add it with a
                        CSS override on your page.
                      </p>
                      <button
                        type='button'
                        aria-expanded={showPositionCss}
                        onClick={() => setShowPositionCss(current => !current)}
                        className='hover:bg-muted w-fit rounded-md border px-2.5 py-1 text-[12px] font-medium'
                      >
                        {showPositionCss ? 'Hide CSS' : 'View CSS'}
                      </button>
                      {showPositionCss ? <CodeBlock className='language-css'>{PIN_TO_TOP_CSS}</CodeBlock> : null}
                    </SettingsGroup>
                  </>
                ) : (
                  <>
                    <Segmented
                      label='Flow'
                      value={flow}
                      options={[
                        { value: 'sign-in', label: 'Sign in' },
                        { value: 'sign-up', label: 'Sign up' },
                      ]}
                      onChange={setFlow}
                    />
                    {flow === 'sign-in' ? (
                      <Segmented
                        label='Last used'
                        value={authConfig.lastUsed}
                        options={[
                          { value: 'none', label: 'None' },
                          { value: 'google', label: 'Google' },
                          { value: 'passkey', label: 'Passkey' },
                          { value: 'identifier', label: 'Email' },
                        ]}
                        onChange={set('lastUsed')}
                      />
                    ) : null}
                    {flow === 'sign-in' ? (
                      <Segmented
                        label='Sign-in outcome'
                        value={authConfig.outcome}
                        options={[
                          { value: 'normal', label: 'Normal' },
                          { value: 'blocked', label: 'Blocked' },
                          { value: 'compromised', label: 'Compromised' },
                          { value: 'no-methods', label: "Can't sign in" },
                        ]}
                        onChange={set('outcome')}
                      />
                    ) : null}
                    {flow === 'sign-in' ? (
                      <Segmented
                        label='Other methods on the password step'
                        value={authConfig.methodsLayout}
                        options={[
                          { value: 'inline', label: 'Show up front' },
                          { value: 'button', label: 'One button' },
                        ]}
                        onChange={set('methodsLayout')}
                      />
                    ) : null}
                    {flow === 'sign-in' ? (
                      <Segmented
                        label='Several emails or numbers'
                        value={authConfig.addressChoice}
                        options={[
                          { value: 'ask', label: 'Ask which first' },
                          { value: 'primary', label: 'Send to primary' },
                        ]}
                        onChange={set('addressChoice')}
                      />
                    ) : null}
                    <Segmented
                      label='Sign-in methods'
                      value={manyMethods ? 'many' : 'typical'}
                      options={[
                        { value: 'typical', label: 'Typical' },
                        { value: 'many', label: 'Stress test' },
                      ]}
                      onChange={value => setManyMethods(value === 'many')}
                    />
                  </>
                )}
              </div>
              <div className='border-t p-3'>
                <button
                  type='button'
                  onClick={reset}
                  className='text-muted-foreground hover:text-foreground text-[13px] font-medium'
                >
                  Reset all
                </button>
              </div>
            </aside>
          ) : null}
        </div>
        {fullScreen ? (
          <div className='bg-background fixed inset-0 z-50 [container-type:size]'>
            {page('-full')}
            <button
              type='button'
              onClick={() => setFullScreen(false)}
              className='bg-background/80 text-muted-foreground hover:text-foreground fixed end-3 top-3 rounded-md border px-2.5 py-1 text-[12px] font-medium opacity-40 backdrop-blur-sm transition-opacity hover:opacity-100'
            >
              Exit full screen (Esc)
            </button>
          </div>
        ) : null}
      </div>
    </AuthConfigContext.Provider>
  );
}

function signUpSteps(config: AuthConfig): string {
  if (config.mode === 'restricted') {
    return 'Sign-up is closed: invitations only';
  }
  if (config.mode === 'waitlist') {
    return 'Sign-up is closed: join the waitlist';
  }
  const identifier = {
    email: 'Email',
    phone: 'Phone number',
    'email-or-phone': 'Email or phone',
    username: 'Email',
  }[config.identifier];
  const verify =
    config.identifier === 'phone' ? 'Text code' : config.verification === 'link' ? 'Email link' : 'Email code';
  const finish = [
    config.names === 'off' ? null : config.names === 'optional' ? 'Name (optional)' : 'Name',
    config.identifier === 'username' ? 'Username' : null,
    config.password ? 'Password' : null,
  ].filter(Boolean);
  const steps = [identifier, verify];
  if (hasFinishStep(config)) {
    steps.push(finish.join(' + '));
  }
  if (config.requireMfa) {
    steps.push('Set up MFA');
  }
  if (config.offerPasskey) {
    steps.push('Offer a passkey');
  }
  return steps.join('  →  ');
}

function DashboardSettings({
  config,
  set,
  organizations,
  onOrganizationsChange,
}: {
  config: AuthConfig;
  set: <K extends keyof AuthConfig>(key: K) => (value: AuthConfig[K]) => void;
  organizations: boolean;
  onOrganizationsChange: (value: boolean) => void;
}) {
  return (
    <>
      <SettingsGroup title='User & authentication'>
        <Segmented
          label='Identifier'
          value={config.identifier}
          options={[
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
            { value: 'email-or-phone', label: 'Either' },
            { value: 'username', label: '+ username' },
          ]}
          onChange={set('identifier')}
        />
        <Segmented
          label='Email verification'
          value={config.verification}
          options={[
            { value: 'code', label: 'Code' },
            { value: 'link', label: 'Link' },
          ]}
          onChange={set('verification')}
        />
        <Segmented
          label='Password'
          value={config.password ? 'on' : 'off'}
          options={[
            { value: 'on', label: 'Required' },
            { value: 'off', label: 'Passwordless' },
          ]}
          onChange={value => set('password')(value === 'on')}
        />
        <Segmented
          label='Password policy'
          value={config.passwordPolicy}
          options={[
            { value: 'basic', label: 'Length only' },
            { value: 'standard', label: '+ number, symbol' },
            { value: 'strict', label: '12+ mixed' },
          ]}
          onChange={set('passwordPolicy')}
        />
        <Segmented
          label='Passkeys'
          value={config.passkey ? 'on' : 'off'}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'on', label: 'On' },
          ]}
          onChange={value => set('passkey')(value === 'on')}
        />
        <Segmented
          label='Social providers'
          value={String(config.socialProviders) as '0' | '1' | '2' | '3' | '5'}
          options={[
            { value: '0', label: 'None' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
            { value: '5', label: '5' },
          ]}
          onChange={value => set('socialProviders')(Number(value) as AuthConfig['socialProviders'])}
        />
      </SettingsGroup>
      <SettingsGroup title='Multi-factor'>
        <Segmented
          label='Two-step verification'
          value={config.twoStep ? 'on' : 'off'}
          options={[
            { value: 'on', label: 'On' },
            { value: 'off', label: 'Off' },
          ]}
          onChange={value => set('twoStep')(value === 'on')}
        />
        <Segmented
          label='Require MFA on sign-up'
          value={config.requireMfa ? 'on' : 'off'}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'on', label: 'Required' },
          ]}
          onChange={value => set('requireMfa')(value === 'on')}
        />
        <Segmented
          label='Offer a passkey after sign-up'
          value={config.offerPasskey ? 'on' : 'off'}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'on', label: 'On' },
          ]}
          onChange={value => set('offerPasskey')(value === 'on')}
        />
      </SettingsGroup>
      <SettingsGroup title='Sign-up'>
        <Segmented
          label='Sign-up mode'
          value={config.mode}
          options={[
            { value: 'public', label: 'Public' },
            { value: 'restricted', label: 'Restricted' },
            { value: 'waitlist', label: 'Waitlist' },
          ]}
          onChange={set('mode')}
        />
        <Segmented
          label='First and last name'
          value={config.names}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'optional', label: 'Optional' },
            { value: 'required', label: 'Required' },
          ]}
          onChange={set('names')}
        />
        <Segmented
          label='Legal consent'
          value={config.legalConsent ? 'on' : 'off'}
          options={[
            { value: 'off', label: 'Off' },
            { value: 'on', label: 'Required' },
          ]}
          onChange={value => set('legalConsent')(value === 'on')}
        />
      </SettingsGroup>
      <SettingsGroup title='Organizations'>
        <Segmented
          label='Organizations'
          value={organizations ? 'on' : 'off'}
          options={[
            { value: 'on', label: 'Enabled' },
            { value: 'off', label: 'Disabled' },
          ]}
          onChange={value => onOrganizationsChange(value === 'on')}
        />
        {organizations ? (
          <Segmented
            label='Membership required'
            value={config.organizationRequired ? 'yes' : 'no'}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            onChange={value => set('organizationRequired')(value === 'yes')}
          />
        ) : null}
      </SettingsGroup>
      <SettingsGroup title='Customization'>
        <Segmented
          label='Clerk branding'
          value={config.branding ? 'show' : 'hide'}
          options={[
            { value: 'show', label: 'Show' },
            { value: 'hide', label: 'Hide' },
          ]}
          onChange={value => set('branding')(value === 'show')}
        />
      </SettingsGroup>
    </>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='grid gap-3'>
      <h3 className='text-[11px] font-semibold uppercase tracking-wide text-neutral-500'>{title}</h3>
      {children}
    </section>
  );
}
