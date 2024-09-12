'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { AppearanceProvider } from '@clerk/ui/contexts';
import { cx } from 'cva';
import * as React from 'react';

import { useAppearanceLayoutStore } from '../stores/appearance-layout-store';
import { useThemeBuilderStore } from '../stores/theme-builder-store';
import type { StoreWithPersist } from '../stores/utils';
import { withStorageDOMEvents } from '../stores/utils';

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  const appearance = useThemeBuilderStore(state => state.appearance);
  const direction = useThemeBuilderStore(state => state.direction);
  const animations = useAppearanceLayoutStore(state => state.animations);
  const devMode = useAppearanceLayoutStore(state => state.devMode);

  React.useEffect(() => {
    const cleanupStorageEvents = () => {
      withStorageDOMEvents(useThemeBuilderStore as StoreWithPersist);
      withStorageDOMEvents(useAppearanceLayoutStore as StoreWithPersist);
    };
    return () => {
      cleanupStorageEvents();
    };
  }, []);

  return (
    <ClerkProvider>
      <AppearanceProvider
        appearance={{
          layout: {
            unsafe_disableDevelopmentModeWarnings: devMode === 'off',
            animations: animations === 'on' ? true : false,
          },
        }}
      >
        <div
          data-dev-mode={devMode}
          data-animations={animations}
          dir={direction}
          className={cx('relative flex flex-1 items-center justify-center p-8', {
            'bg-white': appearance === 'light',
            'dark bg-black': appearance === 'dark',
          })}
          style={
            appearance === 'light'
              ? ({ '--cl-light': 'initial', '--cl-dark': ' ' } as React.CSSProperties)
              : ({
                  '--cl-light': ' ',
                  '--cl-dark': 'initial',
                } as React.CSSProperties)
          }
        >
          <div
            className={cx(
              'pointer-events-none absolute inset-0 isolate [background-image:linear-gradient(to_bottom,transparent_calc(56px-1px),var(--line-color)),linear-gradient(to_right,transparent_calc(56px-1px),_var(--line-color))] [background-size:56px_56px] [mask-image:repeating-linear-gradient(to_right,transparent,black_1px_1px,transparent_1px_4px),repeating-linear-gradient(to_bottom,transparent,black_1px_1px,transparent_1px_4px)]',
              {
                '[--line-color:theme(colors.neutral.400)]': appearance === 'light',
                '[--line-color:theme(colors.neutral.600)]': appearance === 'dark',
              },
            )}
            aria-hidden='true'
          />
          {children}
        </div>
      </AppearanceProvider>
    </ClerkProvider>
  );
}
