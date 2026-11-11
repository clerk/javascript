'use client';
import * as React from 'react';

import { cn } from '@/lib/utils';
export type PreviewViewport = 'desktop' | 'mobile';
const PANEL =
  'col-start-1 row-start-1 flex w-full flex-col items-center transition-[opacity,translate,scale,visibility] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none';
export function ViewPanel({
  active,
  from,
  children,
}: {
  active: boolean;
  from: 'left' | 'right';
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        PANEL,
        active
          ? 'visible translate-x-0 scale-100 opacity-100'
          : cn(
              'pointer-events-none invisible absolute inset-x-0 top-0 scale-[0.97] opacity-0',
              from === 'left' ? '-translate-x-12' : 'translate-x-12',
            ),
      )}
    >
      {children}
    </div>
  );
}
export function ViewSwitcher({
  viewport,
  desktop,
  mobile,
  mountMobile,
}: {
  viewport: PreviewViewport;
  desktop: React.ReactNode;
  mobile: React.ReactNode;
  mountMobile: boolean;
}) {
  return (
    <div
      data-preview-stage=''
      className='relative grid w-full overflow-x-clip'
    >
      <ViewPanel
        active={viewport === 'desktop'}
        from='left'
      >
        {desktop}
      </ViewPanel>
      {mountMobile || viewport === 'mobile' ? (
        <ViewPanel
          active={viewport === 'mobile'}
          from='right'
        >
          {mobile}
        </ViewPanel>
      ) : null}
    </div>
  );
}
