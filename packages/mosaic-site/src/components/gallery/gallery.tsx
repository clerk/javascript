'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';
import Link from 'next/link';
import type * as React from 'react';

import { AppWireframe, WIREFRAME_WIDTH } from '@/components/gallery/app-wireframe';
import { DEMOS } from '@/components/gallery/demos';
import { ScaledFrame } from '@/components/gallery/scaled-frame';
import { Address, ToolbarIcon } from '@/components/marketing/browser-frame';
import { COMPONENT_META, GROUP_LABELS, GROUP_ORDER } from '@/lib/components/meta';
function BrowserThumb({ children }: { children: React.ReactNode }) {
  return (
    <div className='ring-foreground/10 group-hover:ring-foreground/30 bg-foreground/[0.04] relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 transition-shadow'>
      <div className='bg-foreground/[0.07] ring-foreground/15 absolute -bottom-[8%] right-[6%] h-[92%] w-[84%] rounded-[14px] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 backdrop-blur-xl transition-transform duration-500 ease-out group-hover:-translate-x-[4%] group-hover:-translate-y-[6%] motion-reduce:transition-none'>
        <div className='bg-background flex h-full flex-col overflow-hidden rounded-[10px]'>
          <div className='border-foreground/10 flex h-6 shrink-0 items-center gap-2.5 border-b px-3 text-neutral-500'>
            <ToolbarIcon
              path='M3 5h18v14H3zM9 5v14'
              className='size-2.5'
            />
            <ToolbarIcon
              path='M15 18l-6-6 6-6'
              className='size-2.5'
            />
            <ToolbarIcon
              path='M9 18l6-6-6-6'
              className='size-2.5 opacity-40'
            />
            <ToolbarIcon
              path='M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5'
              className='size-2.5'
            />
            <Address
              url='app.acme.com/dashboard'
              className='text-[9px]'
            />
          </div>
          <ScaledFrame
            width={WIREFRAME_WIDTH}
            center={false}
            className='min-h-0 flex-1'
          >
            <AppWireframe
              width={WIREFRAME_WIDTH}
              modal={false}
            >
              {children}
            </AppWireframe>
          </ScaledFrame>
        </div>
      </div>
    </div>
  );
}
export function Gallery() {
  return (
    <MosaicProvider>
      <main className='mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-6 py-10 md:px-10'>
        {GROUP_ORDER.map(group => {
          const items = COMPONENT_META.filter(item => item.group === group);
          return (
            <section
              key={group}
              className='flex flex-col gap-5'
            >
              <h2
                className='flex items-baseline gap-3 text-2xl font-semibold tracking-[-0.02em]'
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {GROUP_LABELS[group]}
                <span className='text-base font-normal text-neutral-500'>{items.length}</span>
              </h2>
              <div className='grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3'>
                {items.map(item => {
                  const Demo = DEMOS[item.slug];
                  return (
                    <div
                      key={item.slug}
                      className='group relative flex flex-col gap-3'
                    >
                      <Link
                        href={`/components/${item.slug}`}
                        aria-label={item.title}
                        className='absolute inset-0 z-10 rounded-2xl'
                      />
                      {item.group === 'Features' && item.frame !== false ? (
                        <BrowserThumb>
                          <Demo />
                        </BrowserThumb>
                      ) : (
                        <ScaledFrame
                          width={item.thumbWidth}
                          center={item.center}
                          className='ring-foreground/10 group-hover:ring-foreground/30 aspect-[16/10] rounded-2xl bg-[var(--cl-color-page,#fff)] ring-1 transition-shadow'
                        >
                          <Demo />
                        </ScaledFrame>
                      )}
                      <span className='text-[15px]'>{item.title}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </MosaicProvider>
  );
}
