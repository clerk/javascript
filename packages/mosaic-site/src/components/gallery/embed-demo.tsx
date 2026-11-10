'use client';
import { MosaicProvider } from '@clerk/mosaic/mosaic-provider';

import { MobileShell } from '@/components/gallery/app-wireframe';
import { DEMOS } from '@/components/gallery/demos';
import { RemixReceiver } from '@/components/gallery/remix';
import { EmbedScrollBridge } from '@/components/gallery/scroll-bridge';
import { ThemeReceiver } from '@/components/gallery/theme';
import { TouchMode, useQueryParam, useTouchParam } from '@/components/gallery/touch-mode';
import { MobileUserButton, StagePreview } from '@/components/gallery/user-button-stage';
import { frameUrlFor } from '@/lib/components/frame';
import { COMPONENT_META } from '@/lib/components/meta';
export function EmbedDemo({ slug }: { slug: string }) {
  const Demo = DEMOS[slug];
  const meta = COMPONENT_META.find(item => item.slug === slug);
  const touch = useTouchParam();
  const buttonType = useQueryParam('type');
  const buttonSize = useQueryParam('size');
  const preview = useQueryParam('preview');
  return (
    <MosaicProvider>
      <EmbedScrollBridge />
      <RemixReceiver />
      <ThemeReceiver />
      <TouchMode />
      {preview && (slug === 'user-button' || slug === 'organization-switcher') ? (
        <StagePreview type={slug === 'organization-switcher' ? 'org' : 'combined'} />
      ) : touch && (slug === 'user-button' || slug === 'organization-switcher') ? (
        <MobileUserButton
          type={buttonType}
          size={buttonSize}
          url={frameUrlFor(slug)}
        />
      ) : touch && meta?.group === 'Features' && meta.frame !== false ? (
        <MobileShell url={frameUrlFor(slug)}>
          <Demo />
        </MobileShell>
      ) : (
        <div className='text-foreground flex min-h-svh bg-[var(--cl-color-page,#fff)] px-4 pb-10 pt-16'>
          <div className='m-auto w-full'>
            <Demo />
          </div>
        </div>
      )}
    </MosaicProvider>
  );
}
