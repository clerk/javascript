'use client';
import { SignIn } from '@clerk/ui/components/sign-in';
import { SignUp } from '@clerk/ui/components/sign-up';
import cn from 'clsx';
import { useState } from 'react';

import { AppearanceToggle } from './appearance-toggle';
import { ColorPicker } from './color-picker';
import { generateColors, getPreviewStyles } from './generate-colors';
import { ThemeDialog } from './theme-dialog';

const lightAccentDefault = '#2F3037';
const lightGrayDefault = '#2f3037';
const lightBackgroundDefault = '#fff';

const darkAccentDefault = '#2F3037';
const darkGrayDefault = '#2f3037';
const darkBackgroundDefault = '#111';

const componnents = {
  SignIn: <SignIn />,
  SignUp: <SignUp />,
};
type Component = keyof typeof componnents;

export function ThemeBuilder() {
  const [appearance, setAppearance] = useState('light');
  const [lightAccent, setLightAccent] = useState(lightAccentDefault);
  const [lightGray, setLightGray] = useState(lightGrayDefault);
  const [lightBackground, setLightBackground] = useState(lightBackgroundDefault);
  const [darkAccent, setDarkAccent] = useState(darkAccentDefault);
  const [darkGray, setDarkGray] = useState(darkGrayDefault);
  const [darkBackground, setDarkBackground] = useState(darkBackgroundDefault);
  const [selectedComponent, setSelectedComponent] = useState<Component>('SignIn');
  const handleReset = () => {
    setLightAccent(lightAccentDefault);
    setLightGray(lightGrayDefault);
    setLightBackground(lightBackgroundDefault);
    setDarkAccent(darkAccentDefault);
    setDarkGray(darkGrayDefault);
    setDarkBackground(darkBackgroundDefault);
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
  });
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: css,
        }}
      />
      <div className='flex h-dvh flex-col overflow-hidden'>
        <header className='flex shrink-0 h-16 justify-end border-b items-center px-4'>
          <div className='inline-flex items-center gap-x-2 text-xs'>
            <label htmlFor='component'>Component</label>
            <div className='relative'>
              <select
                name='component'
                id='component'
                onChange={e => setSelectedComponent(e.target.value as Component)}
                className='relative bg-neutral-100 border rounded py-1 text-xs pl-1.5 pr-5 appearance-none after:absolute after:right-1.5 after:size-2 after:bg-red-200 after:top-1'
              >
                <option value='SignIn'>Sign In</option>
                <option value='SignUp'>Sign Up</option>
              </select>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='size-2.5 absolute top-1/2 right-1.5 -translate-y-1/2 pointer-events-none user-select-none'
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
        <div className='flex flex-1'>
          <aside className='relative isolate flex h-full w-[17rem] p-4 shrink-0 flex-col border-r bg-white'>
            <div className='space-y-4'>
              <AppearanceToggle
                items={[
                  {
                    label: 'Light',
                    value: 'light',
                  },
                  {
                    label: 'Dark',
                    value: 'dark',
                  },
                ]}
                value={appearance}
                onValueChange={setAppearance}
              />
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
            </div>
            <div className='mt-auto space-y-2'>
              <button
                type='button'
                className='w-full rounded border bg-white p-1.5 text-xs'
                onClick={handleReset}
              >
                Reset
              </button>
              <ThemeDialog
                trigger={
                  <button
                    type='button'
                    className='w-full rounded border bg-white p-1.5 text-xs'
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
            className={cn('relative isolate w-full flex-1 overflow-y-auto grid place-content-center', {
              'bg-neutral-50': appearance === 'light',
              'bg-neutral-950 dark': appearance === 'dark',
            })}
          >
            <div
              className={cn(
                'absolute inset-0 isolate [background-image:linear-gradient(to_bottom,transparent_calc(56px-1px),var(--line-color)),linear-gradient(to_right,transparent_calc(56px-1px),_var(--line-color))] [background-size:56px_56px] [mask-image:repeating-linear-gradient(to_right,transparent,black_1px_1px,transparent_1px_4px),repeating-linear-gradient(to_bottom,transparent,black_1px_1px,transparent_1px_4px)]',
                {
                  '[--line-color:theme(colors.neutral.400)]': appearance === 'light',
                  '[--line-color:theme(colors.neutral.600)]': appearance === 'dark',
                },
              )}
              aria-hidden='true'
            />
            {componnents[selectedComponent]}
          </figure>
        </div>
      </div>
    </>
  );
}
