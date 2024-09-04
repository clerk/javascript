'use client';
import { ClerkProvider } from '@clerk/nextjs';
import { AppearanceProvider } from '@clerk/ui/contexts';
import { cx } from 'cva';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ColorPicker } from './color-picker';
import { AppearanceOptions } from './components/appearance-options';
import { Logo } from './components/logo';
import { generateColors, getPreviewStyles } from './generate-colors';
import { useAppearanceStore } from './stores/appearance-store';
import { ThemeDialog } from './theme-dialog';

const lightAccentDefault = '#6C47FF';
const lightGrayDefault = '#2f3037';
const lightBackgroundDefault = '#fff';

const darkAccentDefault = '#6C47FF';
const darkGrayDefault = '#2f3037';
const darkBackgroundDefault = '#111';

const radiusDefault = '0.375rem';
const spacingUnitDefault = '1rem';
const fontSizeDefault = '0.8125rem';

export function ThemeBuilder({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const appearance = useAppearanceStore(state => state.appearance);
  const direction = useAppearanceStore(state => state.direction);
  const devMode = useAppearanceStore(state => state.devMode);
  const animations = useAppearanceStore(state => state.animations);
  const reset = useAppearanceStore(state => state.reset);

  const [lightAccent, setLightAccent] = useState(lightAccentDefault);
  const [lightGray, setLightGray] = useState(lightGrayDefault);
  const [lightBackground, setLightBackground] = useState(lightBackgroundDefault);
  const [darkAccent, setDarkAccent] = useState(darkAccentDefault);
  const [darkGray, setDarkGray] = useState(darkGrayDefault);
  const [darkBackground, setDarkBackground] = useState(darkBackgroundDefault);
  const [radius, setRadius] = useState(radiusDefault);
  const [spacingUnit, setSpacingUnit] = useState(spacingUnitDefault);
  const [fontSize, setFontSize] = useState(fontSizeDefault);

  const handleReset = () => {
    setLightAccent(lightAccentDefault);
    setLightGray(lightGrayDefault);
    setLightBackground(lightBackgroundDefault);
    setDarkAccent(darkAccentDefault);
    setDarkGray(darkGrayDefault);
    setDarkBackground(darkBackgroundDefault);
    setRadius(radiusDefault);
    setSpacingUnit(spacingUnitDefault);
    setFontSize(fontSizeDefault);
    reset();
  };

  const lightResult = generateColors({
    appearance: 'light',
    accent: lightAccent,
    gray: lightGray,
    background: lightBackground,
  });
  const darkResult = generateColors({
    appearance: 'dark',
    accent: darkAccent,
    gray: darkGray,
    background: darkBackground,
  });
  const css = getPreviewStyles({
    lightColors: lightResult,
    darkColors: darkResult,
    radius,
    spacingUnit,
    fontSize,
  });

  // A unique key for the ClerkProvider to force a re-render when the appearance changes
  const CLERK_PROVIDER_KEY = `${devMode}-${animations}`;

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  return (
    <ClerkProvider key={CLERK_PROVIDER_KEY}>
      <AppearanceProvider
        appearance={{
          layout: {
            unsafe_disableDevelopmentModeWarnings: devMode === 'off',
            animations: animations === 'on' ? true : false,
          },
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: css,
          }}
        />
        <div className='z-1 pointer-events-none fixed inset-x-0 top-0 z-50 h-[calc(theme(size.1)-theme(ringWidth.1))] bg-neutral-100' />
        <div
          className={cx(
            'm-1 mb-0 grid h-[calc(100dvh-theme(size.1))] grid-cols-[min-content,minmax(0,1fr)] grid-rows-[min-content,minmax(0,1fr)] overflow-hidden rounded-t-xl bg-white ring-1 ring-neutral-900/[0.075]',
            'shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(32,42,54,0.04),0_24px_68px_rgba(47,48,56,0.15),0_2px_3px_rgba(0,0,0,0.09)]',
          )}
        >
          <header className='col-span-full flex shrink-0 items-center justify-between border-b p-4'>
            <h1 className='inline-flex items-center gap-3'>
              <Logo className='h-4 text-neutral-950' />
              <span className='mt-0.5 bg-gradient-to-r from-[#6C47FF] to-[#056D99] bg-clip-text text-sm font-medium text-transparent'>
                Theme Builder
              </span>
            </h1>

            <div className='inline-flex items-center gap-x-2 text-xs'>
              <label htmlFor='component'>Component</label>
              <div className='relative'>
                <select
                  name='component'
                  id='component'
                  value={pathname}
                  onChange={e => router.push(e.target.value)}
                  className='relative appearance-none rounded border bg-neutral-100 py-1 pl-1.5 pr-5 text-xs after:absolute after:right-1.5 after:top-1 after:size-2 after:bg-red-200'
                >
                  <option
                    value='/'
                    disabled
                  >
                    Select
                  </option>
                  <option value='/sign-in'>Sign In</option>
                  <option value='/sign-up'>Sign Up</option>
                </select>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='user-select-none pointer-events-none absolute right-1.5 top-1/2 size-2.5 -translate-y-1/2'
                  aria-hidden
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='m19.5 8.25-7.5 7.5-7.5-7.5'
                  />
                </svg>
              </div>
            </div>
          </header>

          <aside className='relative isolate flex h-full w-[17rem] flex-col justify-between gap-8 overflow-y-auto border-e bg-white p-4'>
            <div className='space-y-4'>
              <AppearanceOptions />
              {appearance === 'light' ? (
                <>
                  <ColorPicker
                    label='Accent'
                    description='The accent color used for interactive elements.'
                    color={lightAccent}
                    onChange={setLightAccent}
                  />
                  <ColorPicker
                    label='Gray'
                    description='The accent color used for interactive elements.'
                    color={lightGray}
                    onChange={setLightGray}
                  />
                  <ColorPicker
                    label='Background'
                    description='The accent color used for interactive elements.'
                    color={lightBackground}
                    onChange={setLightBackground}
                  />
                </>
              ) : (
                <>
                  <ColorPicker
                    label='Accent'
                    description='The accent color used for interactive elements.'
                    color={darkAccent}
                    onChange={setDarkAccent}
                  />
                  <ColorPicker
                    label='Gray'
                    description='The accent color used for interactive elements.'
                    color={darkGray}
                    onChange={setDarkGray}
                  />
                  <ColorPicker
                    label='Background'
                    description='The accent color used for interactive elements.'
                    color={darkBackground}
                    onChange={setDarkBackground}
                  />
                </>
              )}
              <div className='flex flex-col gap-1'>
                <label
                  htmlFor='radius'
                  className='text-xs font-medium text-neutral-700'
                >
                  Radius
                </label>
                <input
                  id='radius'
                  value={radius}
                  onChange={e => setRadius(e.target.value)}
                  className='w-full rounded border p-2 text-xs'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <label
                  htmlFor='spacing-unit'
                  className='text-xs font-medium text-neutral-700'
                >
                  Spacing unit
                </label>
                <input
                  id='spacing-unit'
                  value={spacingUnit}
                  onChange={e => setSpacingUnit(e.target.value)}
                  className='w-full rounded border p-2 text-xs'
                />
              </div>
              <div className='flex flex-col gap-1'>
                <label
                  htmlFor='font-size'
                  className='text-xs font-medium text-neutral-700'
                >
                  Font size
                </label>
                <input
                  id='font-size'
                  value={fontSize}
                  onChange={e => setFontSize(e.target.value)}
                  className='w-full rounded border p-2 text-xs'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <button
                type='button'
                className='w-full rounded border bg-white p-1.5 text-xs font-medium hover:bg-neutral-50 active:bg-neutral-100'
                onClick={handleReset}
              >
                Reset
              </button>
              <ThemeDialog
                trigger={
                  <button
                    type='button'
                    className='w-full rounded border bg-white p-1.5 text-xs font-medium hover:bg-neutral-50 active:bg-neutral-100'
                  >
                    View CSS
                  </button>
                }
              >
                {css}
              </ThemeDialog>
            </div>
          </aside>

          <figure
            className={cx('relative isolate grid items-center overflow-y-auto p-8', {
              'bg-white': appearance === 'light',
              'dark bg-neutral-950': appearance === 'dark',
            })}
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
          </figure>
        </div>
      </AppearanceProvider>
    </ClerkProvider>
  );
}
