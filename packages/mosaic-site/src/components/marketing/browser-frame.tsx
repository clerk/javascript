'use client';
import { Button } from '@clerk/mosaic/components/button';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import * as React from 'react';

import { AppWireframe, Header, PageSkeleton, Rail, WIREFRAME_WIDTH } from '@/components/gallery/app-wireframe';
import { DEMOS } from '@/components/gallery/demos';
import { EdgeGrid } from '@/components/gallery/edge-grid';
import { ScaledFrame } from '@/components/gallery/scaled-frame';
import { Chip, LabShell, PanelLabel, SliderField, TextField } from '@/components/marketing/lab-ui';
import { MosaicLoader } from '@/components/marketing/mosaic-loader';
import { DEFAULT_FRAME, FRAME_SLIDERS, type FrameConfig } from '@/lib/components/frame';
import { COMPONENT_META, getComponentMeta } from '@/lib/components/meta';
import { cn } from '@/lib/utils';
export function ToolbarIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      className={cn('size-[18px]', className)}
      fill='none'
      stroke='currentColor'
      strokeWidth='1.75'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d={path} />
    </svg>
  );
}
export function Address({ url, className }: { url: string; className?: string }) {
  const bare = url.replace(/^https?:\/\//, '');
  const slash = bare.indexOf('/');
  const host = slash === -1 ? bare : bare.slice(0, slash);
  const path = slash === -1 ? '' : bare.slice(slash + 1);
  return (
    <span className={cn('truncate text-[15px] text-neutral-500', className)}>
      http://<span className='text-foreground'>{host}</span>
      {path ? ` / ${path}` : ''}
    </span>
  );
}
export function BrowserFrame({
  config,
  interactive = false,
  embed,
  className,
}: {
  config: FrameConfig;
  interactive?: boolean;
  embed?: { src: string; title: string };
  className?: string;
}) {
  const meta = getComponentMeta(config.slug);
  const Demo = DEMOS[config.slug];
  const [closed, setClosed] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    if (embed) {
      return;
    }
    const timer = window.setTimeout(() => setReady(true), 500);
    return () => window.clearTimeout(timer);
  }, [embed]);
  if (!meta || !Demo) {
    return null;
  }
  return (
    <MosaicProvider>
      <div
        className={cn(
          'bg-foreground/[0.07] ring-foreground/15 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 backdrop-blur-xl',
          className,
        )}
        style={{ borderRadius: config.radius + 6 }}
      >
        <div
          className='bg-background flex flex-col overflow-hidden'
          style={{ borderRadius: config.radius }}
        >
          <div className='border-foreground/10 flex h-12 shrink-0 items-center gap-5 border-b px-5 text-neutral-500'>
            <ToolbarIcon path='M3 5h18v14H3zM9 5v14' />
            <ToolbarIcon path='M15 18l-6-6 6-6' />
            <ToolbarIcon
              path='M9 18l6-6-6-6'
              className='opacity-40'
            />
            <ToolbarIcon path='M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5' />
            <Address url={config.url} />
          </div>
          <div className='relative'>
            <MosaicLoader visible={!ready} />
            {embed ? (
              <iframe
                src={embed.src}
                title={embed.title}
                onLoad={() => setReady(true)}
                className='aspect-[16/10] w-full border-0'
              />
            ) : (
              <ScaledFrame
                width={
                  (meta.group === 'Features' && meta.frame !== false ? WIREFRAME_WIDTH : meta.thumbWidth) / config.zoom
                }
                center={meta.center}
                interactive={interactive}
                className='aspect-[16/10] w-full bg-[var(--cl-color-page,#fff)]'
              >
                {config.mode === 'fullscreen' && meta.modal ? (
                  <div
                    className='overflow-y-auto bg-[var(--cl-color-page,#fff)] [scrollbar-width:thin]'
                    style={{ width: WIREFRAME_WIDTH / config.zoom, height: (WIREFRAME_WIDTH / config.zoom) * 0.625 }}
                  >
                    {closed ? (
                      <div className='flex h-full'>
                        <Rail />
                        <div className='flex min-w-0 flex-1 flex-col'>
                          <Header
                            action={
                              <Button onClick={() => setClosed(false)}>
                                {config.slug === 'organization-profile' ? 'Manage organization' : 'Manage account'}
                              </Button>
                            }
                          />
                          <PageSkeleton />
                        </div>
                      </div>
                    ) : (
                      <div className='[&_.cl-profile-layout]:m-0! [&_.cl-profile-layout]:w-full! [&_.cl-profile-layout]:max-w-none! [&_.cl-profile-layout]:justify-between! px-10 pb-8 pt-6'>
                        <button
                          type='button'
                          onClick={() => setClosed(true)}
                          className='text-foreground hover:bg-foreground/[0.07] mb-6 flex items-center gap-1.5 rounded-lg py-1.5 pl-1.5 pr-3 text-sm transition-colors'
                        >
                          <ToolbarIcon
                            path='M15 18l-6-6 6-6'
                            className='size-4'
                          />
                          Back to app
                        </button>
                        <Demo />
                      </div>
                    )}
                  </div>
                ) : meta.group === 'Features' && meta.frame !== false ? (
                  <AppWireframe
                    width={WIREFRAME_WIDTH / config.zoom}
                    modal={config.mode === 'modal' && Boolean(meta.modal)}
                    scroll={interactive}
                  >
                    <Demo />
                  </AppWireframe>
                ) : (
                  <div className='px-8 pt-6'>
                    <Demo />
                  </div>
                )}
              </ScaledFrame>
            )}
          </div>
        </div>
      </div>
    </MosaicProvider>
  );
}
export function BrowserFrameTool() {
  const [config, setConfig] = React.useState<FrameConfig>(DEFAULT_FRAME);
  const [copied, setCopied] = React.useState(false);
  const patch = <K extends keyof FrameConfig>(key: K, value: FrameConfig[K]) =>
    setConfig(current => ({ ...current, [key]: value }));
  const copy = () => {
    void navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <LabShell
      title='Browser frame'
      stage={
        <div className='relative isolate flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 pb-6'>
          <EdgeGrid className='absolute inset-0 -z-10' />
          <BrowserFrame
            config={config}
            interactive
            className='w-[min(100%,calc((100svh-11rem)*1.6))]'
          />
        </div>
      }
      panel={
        <>
          <p className='text-sm leading-5 text-neutral-600 dark:text-neutral-400'>
            A minimal browser window around a component: a light bezel, a plain toolbar and a text address.
          </p>
          <div className='flex flex-col gap-3'>
            <PanelLabel>Component</PanelLabel>
            <select
              aria-label='Component'
              value={config.slug}
              onChange={event => patch('slug', event.target.value)}
              className='border-foreground/15 text-foreground bg-background rounded-lg border px-3 py-2 text-sm outline-none'
            >
              {COMPONENT_META.map(meta => (
                <option
                  key={meta.slug}
                  value={meta.slug}
                >
                  {meta.title}
                </option>
              ))}
            </select>
          </div>
          <TextField
            label='Address'
            value={config.url}
            onChange={value => patch('url', value)}
          />
          {FRAME_SLIDERS.map(slider => (
            <SliderField
              key={slider.key}
              label={slider.label}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              value={config[slider.key]}
              onChange={value => patch(slider.key, value)}
            />
          ))}
          <div className='flex flex-col gap-3'>
            <PanelLabel>Mode</PanelLabel>
            <div className='flex gap-2'>
              <Chip
                active={config.mode === 'flush'}
                onClick={() => patch('mode', 'flush')}
              >
                Flush
              </Chip>
              <Chip
                active={config.mode === 'modal'}
                onClick={() => patch('mode', 'modal')}
              >
                Modal
              </Chip>
            </div>
          </div>
          <div className='mt-auto flex gap-2'>
            <button
              type='button'
              onClick={copy}
              className='bg-foreground text-background flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-transform hover:scale-[1.02]'
            >
              {copied ? 'Copied' : 'Copy settings'}
            </button>
            <button
              type='button'
              onClick={() => setConfig(DEFAULT_FRAME)}
              className='border-foreground/15 hover:border-foreground/40 rounded-lg border px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300'
            >
              Reset
            </button>
          </div>
        </>
      }
    />
  );
}
