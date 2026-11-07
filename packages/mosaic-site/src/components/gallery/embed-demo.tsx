'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';

import { MobileShell } from '@/components/gallery/app-wireframe';
import { DEMOS } from '@/components/gallery/demos';
import { RemixReceiver } from '@/components/gallery/remix';
import { EmbedScrollBridge } from '@/components/gallery/scroll-bridge';
import { TouchMode, useQueryParam, useTouchParam } from '@/components/gallery/touch-mode';
import { MobileUserButton } from '@/components/gallery/user-button-stage';
import { frameUrlFor } from '@/lib/components/frame';
import { COMPONENT_META } from '@/lib/components/meta';
import { cn } from '@/lib/utils';
export function EmbedDemo({ slug }: { slug: string }) {
  const Demo = DEMOS[slug];
  const meta = COMPONENT_META.find(item => item.slug === slug);
  const touch = useTouchParam();
  const buttonType = useQueryParam('type');
  const buttonSize = useQueryParam('size');
  return (
    <MosaicProvider>
      <EmbedScrollBridge />
      <RemixReceiver />
      <TouchMode />
      {touch && slug === 'user-button' ? (
        <MobileUserButton
          type={buttonType}
          size={buttonSize}
          url={frameUrlFor(slug)}
        />
      ) : touch && meta?.group === 'Features' ? (
        <MobileShell url={frameUrlFor(slug)}>
          <Demo />
        </MobileShell>
      ) : (
        <div className='text-foreground flex min-h-svh bg-[var(--cl-color-page,#fff)] px-4 pb-10 pt-16'>
          <div className={cn('m-auto w-full', meta?.group === 'Primitives' && 'flex items-center justify-center')}>
            <Demo />
          </div>
        </div>
      )}
    </MosaicProvider>
  );
}
