'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import Link from 'next/link';

import { DEMOS } from '@/components/gallery/demos';
import { ScaledFrame } from '@/components/gallery/scaled-frame';
import { COMPONENT_META } from '@/lib/components/meta';
const featured = COMPONENT_META.filter(item => item.group === 'Features');
export function FeaturedComponents() {
  return (
    <MosaicProvider>
      <section className='mx-auto flex max-w-[1120px] flex-col gap-10 px-6 pb-24'>
        <h2
          className='max-w-[620px] text-[clamp(32px,4.5vw,52px)] font-semibold leading-[1.02] tracking-[-0.04em]'
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Whole surfaces, ready to rearrange
        </h2>
        <div className='grid gap-5 md:grid-cols-3'>
          {featured.map(item => {
            const Demo = DEMOS[item.slug];
            return (
              <Link
                key={item.slug}
                href={`/components/${item.slug}`}
                className='border-foreground/10 bg-foreground/[0.03] hover:border-foreground/25 group flex flex-col gap-1 rounded-3xl border p-2 transition-colors'
              >
                <ScaledFrame
                  width={item.thumbWidth}
                  center={item.center}
                  className='border-foreground/10 aspect-[4/3] rounded-2xl border bg-[var(--cl-color-page,#fff)]'
                >
                  <Demo />
                </ScaledFrame>
                <span className='px-3 py-2.5 text-[15px] font-medium'>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </MosaicProvider>
  );
}
