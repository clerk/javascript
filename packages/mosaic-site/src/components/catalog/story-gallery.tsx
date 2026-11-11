'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import * as React from 'react';

import { STORY_LOADERS } from '@/components/catalog/story-loaders';
import { BrowserChrome } from '@/components/marketing/browser-frame';

type Story = { name: string; Component: React.ComponentType<Record<string, unknown>> };
const humanize = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
export function StoryGallery({ file, url }: { file: string; url?: string }) {
  const [stories, setStories] = React.useState<Story[] | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    void STORY_LOADERS[file]?.().then(module => {
      if (cancelled) {
        return;
      }
      setStories(
        Object.entries(module)
          .filter(([name, value]) => name !== 'meta' && name !== '__source' && typeof value === 'function')
          .map(([name, value]) => ({ name, Component: value as Story['Component'] })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [file]);
  if (!stories) {
    return <div className='bg-foreground/[0.03] mt-10 h-72 animate-pulse rounded-2xl' />;
  }
  if (!url) {
    const core = stories.find(story => story.name === 'Default' || story.name === 'Primary') ?? stories[0];
    const rest = stories.filter(story => story !== core);
    const Core = core?.Component;
    return (
      <MosaicProvider>
        <div className='mt-10 flex flex-col gap-12'>
          <div className='border-foreground/10 flex min-h-64 items-center justify-center overflow-x-auto rounded-2xl border bg-[var(--cl-color-page,#fff)] p-10'>
            {Core ? <Core /> : null}
          </div>
          {rest.length > 0 ? (
            <section>
              <h2 className='text-foreground text-xl font-semibold tracking-tight'>States</h2>
              <p className='mt-2 text-sm text-neutral-500'>The other states this can be in.</p>
              <ul className='border-foreground/10 divide-foreground/10 mt-4 divide-y rounded-xl border'>
                {rest.map(({ name }) => (
                  <li
                    key={name}
                    className='text-foreground px-4 py-3 text-sm'
                  >
                    {humanize(name)}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </MosaicProvider>
    );
  }
  return (
    <MosaicProvider>
      <div className='mt-10 flex flex-col gap-8'>
        {stories.map(({ name, Component }) => (
          <section key={name}>
            <h2 className='mb-3 text-sm font-medium text-neutral-500'>{humanize(name)}</h2>
            {url ? (
              <BrowserChrome url={url}>
                <div className='flex min-h-[420px] items-center justify-center overflow-x-auto bg-[var(--cl-color-page,#fff)] p-10'>
                  <Component />
                </div>
              </BrowserChrome>
            ) : (
              <div className='border-foreground/10 flex min-h-40 items-center justify-center overflow-x-auto rounded-2xl border bg-[var(--cl-color-page,#fff)] p-10'>
                <Component />
              </div>
            )}
          </section>
        ))}
      </div>
    </MosaicProvider>
  );
}
