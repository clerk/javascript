'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';

import { getShowcase, showcases } from './showcases';
import { FORMATS } from './Stage';
import type { StudioFormat, StudioScheme } from './types';

export function StudioIndex() {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 p-3 sm:p-8'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-xl font-semibold'>Studio</h1>
        <p className='text-muted-foreground text-sm'>
          Showcases for social video. Each one plays in a bare capture route at <code>/capture/[slug]</code>.
        </p>
        <p className='text-sm'>
          <a
            href='/template'
            className='underline underline-offset-4'
          >
            Open the template workbench
          </a>
        </p>
      </div>
      <ul className='flex flex-col divide-y rounded-lg border'>
        {showcases.map(showcase => (
          <li key={showcase.slug}>
            <Link
              href={`/studio/${showcase.slug}`}
              className='hover:bg-accent/50 flex flex-col gap-1 p-4'
            >
              <span className='text-sm font-medium'>{showcase.title}</span>
              <span className='text-muted-foreground text-xs'>{showcase.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StudioPreview({ slug }: { slug: string }) {
  const showcase = getShowcase(slug);
  const [format, setFormat] = useState<StudioFormat>(showcase?.format ?? 'landscape');
  const [scheme, setScheme] = useState<StudioScheme>(showcase?.scheme ?? 'light');
  if (!showcase) {
    notFound();
  }
  const { width, height } = FORMATS[format];
  const src = `/capture/${slug}?format=${format}&scheme=${scheme}`;

  return (
    <div className='flex flex-col gap-4 p-3 sm:p-8'>
      <div className='flex flex-wrap items-center gap-2'>
        <h1 className='mr-auto text-xl font-semibold'>{showcase.title}</h1>
        {(Object.keys(FORMATS) as StudioFormat[]).map(option => (
          <Button
            key={option}
            size='sm'
            variant={option === format ? 'secondary' : 'ghost'}
            onClick={() => setFormat(option)}
          >
            {option}
          </Button>
        ))}
        <Button
          size='sm'
          variant='ghost'
          onClick={() => setScheme(scheme === 'light' ? 'dark' : 'light')}
        >
          {scheme}
        </Button>
        <a
          href={src}
          target='_blank'
          rel='noreferrer'
          className={buttonVariants({ size: 'sm', variant: 'outline' })}
        >
          Open capture view
        </a>
      </div>
      <iframe
        key={src}
        src={src}
        title={showcase.title}
        className='w-full rounded-lg border'
        style={{ aspectRatio: `${width} / ${height}`, maxHeight: 'calc(100dvh - 10rem)' }}
      />
      <ol className='text-muted-foreground flex flex-col gap-1 text-xs'>
        {showcase.steps.map((step, i) => (
          <li key={step.label}>
            {String(i + 1).padStart(2, '0')} · {step.layout} · {step.label} · {step.duration}s
          </li>
        ))}
      </ol>
    </div>
  );
}
