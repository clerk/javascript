'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import Link from 'next/link';
import * as React from 'react';

import { StoryGallery } from '@/components/catalog/story-gallery';
import { PART_DEMOS } from '@/components/gallery/part-demos';
import { SegmentedControl } from '@/components/gallery/segmented-control';
import { findPart } from '@/lib/components/catalog';
import { STORY_PARTS } from '@/lib/components/stories';

export function PartDetail({ slug }: { slug: string }) {
  const found = findPart(slug);
  const entry = PART_DEMOS[slug];
  const [modeId, setModeId] = React.useState(entry?.modes?.[0]?.id);
  const file = STORY_PARTS[slug];
  if (!found || (!entry && !file)) {
    return null;
  }
  const { parent, item } = found;
  const mode = entry?.modes?.find(candidate => candidate.id === modeId) ?? entry?.modes?.[0];
  const shown = mode ?? entry;
  return (
    <main className='mx-auto w-full max-w-[880px] px-6 pb-24 pt-14 md:px-10'>
      <nav
        aria-label='Breadcrumb'
        className='flex items-center gap-2 text-sm text-neutral-500'
      >
        <Link
          href='/blocks'
          className='hover:text-foreground transition-colors'
        >
          Blocks
        </Link>
        <span aria-hidden='true'>/</span>
        <Link
          href={`/blocks/${parent.slug}`}
          className='hover:text-foreground transition-colors'
        >
          {parent.title}
        </Link>
        <span aria-hidden='true'>/</span>
        <span className='text-foreground'>{item.title}</span>
      </nav>
      <h1 className='text-foreground mt-4 text-4xl font-bold tracking-tight'>{item.title}</h1>
      <p className='mt-3 max-w-xl text-base text-neutral-500'>{item.description}</p>
      <p className='mt-4 text-sm text-neutral-500'>
        Part of{' '}
        <Link
          href={`/blocks/${parent.slug}`}
          className='text-foreground underline underline-offset-4'
        >
          {parent.title}
        </Link>
        . Use it on its own to build a custom account page.
      </p>
      {entry?.modes ? (
        <div className='mt-8'>
          <SegmentedControl
            label='Mode'
            options={entry.modes.map(({ id, label }) => ({ id, label }))}
            value={mode?.id ?? entry.modes[0].id}
            onChange={setModeId}
          />
        </div>
      ) : null}
      {shown ? (
        <>
          <div className='ring-foreground/10 mt-10 overflow-hidden rounded-2xl bg-[var(--cl-color-page,#fff)] p-6 ring-1 md:p-10'>
            <MosaicProvider>
              <div className='mx-auto w-full max-w-[640px]'>
                <shown.Demo />
              </div>
            </MosaicProvider>
          </div>
          <h2 className='text-foreground mt-12 text-xl font-semibold tracking-tight'>Usage</h2>
          <pre className='bg-foreground/[0.04] ring-foreground/10 mt-4 overflow-x-auto rounded-xl p-5 text-[13px] leading-6 ring-1'>
            <code>{shown.snippet}</code>
          </pre>
        </>
      ) : (
        <StoryGallery file={file} />
      )}
    </main>
  );
}
