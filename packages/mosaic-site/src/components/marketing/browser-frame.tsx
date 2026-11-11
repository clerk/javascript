'use client';
import { Button } from '@clerk/mosaic/components/button';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import * as React from 'react';

import { AppWireframe, Header, PageSkeleton, Rail, WIREFRAME_WIDTH } from '@/components/gallery/app-wireframe';
import { DEMOS } from '@/components/gallery/demos';
import { ScaledFrame } from '@/components/gallery/scaled-frame';
import { MosaicLoader } from '@/components/marketing/mosaic-loader';
import { type FrameConfig } from '@/lib/components/frame';
import { getComponentMeta } from '@/lib/components/meta';
import { cn } from '@/lib/utils';
export function ToolbarIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      className={cn('size-4', className)}
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
    <span className={cn('truncate text-[13px] text-neutral-500', className)}>
      http://<span className='text-foreground'>{host}</span>
      {path ? ` / ${path}` : ''}
    </span>
  );
}
export function BrowserChrome({
  url,
  radius = 16,
  className,
  children,
}: {
  url: string;
  radius?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'bg-foreground/[0.07] ring-foreground/15 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 backdrop-blur-xl',
        className,
      )}
      style={{ borderRadius: radius + 6 }}
    >
      <div
        className='bg-background flex flex-col overflow-hidden'
        style={{ borderRadius: radius }}
      >
        <div className='border-foreground/10 flex h-10 shrink-0 items-center gap-4 border-b px-4 text-neutral-500'>
          <ToolbarIcon path='M3 5h18v14H3zM9 5v14' />
          <ToolbarIcon path='M15 18l-6-6 6-6' />
          <ToolbarIcon
            path='M9 18l6-6-6-6'
            className='opacity-40'
          />
          <ToolbarIcon path='M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5' />
          <Address url={url} />
        </div>
        {children}
      </div>
    </div>
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
      <BrowserChrome
        url={config.url}
        radius={config.radius}
        className={className}
      >
        <div className='relative'>
          <MosaicLoader visible={!ready} />
          {embed ? (
            <ScaledFrame
              width={WIREFRAME_WIDTH / config.zoom}
              center={false}
              interactive
              className='aspect-[16/10] w-full'
            >
              <iframe
                ref={frame => {
                  if (
                    frame?.contentDocument?.readyState === 'complete' &&
                    frame.contentDocument.body?.childElementCount
                  ) {
                    setReady(true);
                  }
                }}
                src={embed.src}
                title={embed.title}
                onLoad={() => setReady(true)}
                className='border-0'
                style={{ width: WIREFRAME_WIDTH / config.zoom, height: (WIREFRAME_WIDTH / config.zoom) * 0.625 }}
              />
            </ScaledFrame>
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
                  className='overflow-y-auto bg-[var(--cl-color-page,#fff)] [scrollbar-gutter:stable] [scrollbar-width:thin]'
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
      </BrowserChrome>
    </MosaicProvider>
  );
}
