'use client';
import cn from 'clsx';
import { useState } from 'react';

import { SignIn } from '../../dist/components/sign-in';
import { SignUp } from '../../dist/components/sign-up';
import { AppearanceToggle } from './appearance-toggle';
import { ColorPicker } from './color-picker';
import { generateColors, getPreviewStyles } from './generate-colors';
import { ThemeDialog } from './theme-dialog';

const lightAccentDefault = '#2F3037';
const lightGrayDefault = '#2f3037';
const lightBackgroundDefault = '#fff';
const lightVariablesDefault = undefined;

const darkAccentDefault = '#2F3037';
const darkGrayDefault = '#2f3037';
const darkBackgroundDefault = '#111';
const darkVariablesDefault = undefined;

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
  const [lightButtonBackgroundPrimary, setLightButtonBackgroundPrimary] = useState(lightVariablesDefault);
  const [lightButtonBackgroundPrimaryHover, setLightButtonBackgroundPrimaryHover] = useState(lightVariablesDefault);
  const [darkAccent, setDarkAccent] = useState(darkAccentDefault);
  const [darkGray, setDarkGray] = useState(darkGrayDefault);
  const [darkBackground, setDarkBackground] = useState(darkBackgroundDefault);
  const [darkButtonBackgroundPrimary, setDarkButtonBackgroundPrimary] = useState(darkVariablesDefault);
  const [darkButtonBackgroundPrimaryHover, setDarkButtonBackgroundPrimaryHover] = useState(darkVariablesDefault);
  const [selectedComponent, setSelectedComponent] = useState<Component>('SignIn');
  const handleReset = () => {
    setLightAccent(lightAccentDefault);
    setLightGray(lightGrayDefault);
    setLightBackground(lightBackgroundDefault);
    setLightButtonBackgroundPrimary(lightVariablesDefault);
    setLightButtonBackgroundPrimaryHover(lightVariablesDefault);
    setDarkAccent(darkAccentDefault);
    setDarkGray(darkGrayDefault);
    setDarkBackground(darkBackgroundDefault);
    setDarkButtonBackgroundPrimary(darkVariablesDefault);
    setDarkButtonBackgroundPrimaryHover(darkVariablesDefault);
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
      <style
        dangerouslySetInnerHTML={{
          __html: [
            `:root {
              ${[
                lightButtonBackgroundPrimary && `--cl-button-background-primary: ${lightButtonBackgroundPrimary};`,
                lightButtonBackgroundPrimaryHover &&
                  `--cl-button-background-primary-hover: ${lightButtonBackgroundPrimaryHover};`,
              ]
                .filter(Boolean)
                .join('\n')}
            }`,
            `.dark, .dark-theme {
              ${[
                darkButtonBackgroundPrimary && `--cl-button-background-primary: ${darkButtonBackgroundPrimary};`,
                darkButtonBackgroundPrimaryHover &&
                  `--cl-button-background-primary-hover: ${darkButtonBackgroundPrimaryHover};`,
              ]
                .filter(Boolean)
                .join('\n')}
            }`,
          ].join('\n'),
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
                <ul className='text-xs flex flex-col gap-2'>
                  <li>
                    <ColorPicker
                      label='Accent'
                      description='The accent color used for interactive elements.'
                      color={lightAccent}
                      onChange={setLightAccent}
                    />
                  </li>
                  <li>
                    <ColorPicker
                      label='Gray'
                      description='The accent color used for interactive elements.'
                      color={lightGray}
                      onChange={setLightGray}
                    />
                  </li>
                  <li>
                    <ColorPicker
                      label='Background'
                      description='The accent color used for interactive elements.'
                      color={lightBackground}
                      onChange={setLightBackground}
                    />
                  </li>
                  <li className='flex flex-col gap-2 mt-2'>
                    <span className='font-medium'>Variables</span>
                    <ul className='flex flex-col gap-2'>
                      <li>
                        <ColorPicker
                          label='--cl-button-background-primary'
                          color={lightButtonBackgroundPrimary}
                          onChange={setLightButtonBackgroundPrimary}
                        />
                      </li>
                      <li>
                        <ColorPicker
                          label='--cl-button-background-primary-hover'
                          color={lightButtonBackgroundPrimaryHover}
                          onChange={setLightButtonBackgroundPrimaryHover}
                        />
                      </li>
                    </ul>
                  </li>
                </ul>
              ) : (
                <ul className='text-xs flex flex-col gap-2'>
                  <li>
                    <ColorPicker
                      label='Accent'
                      description='The accent color used for interactive elements.'
                      color={darkAccent}
                      onChange={setDarkAccent}
                    />
                  </li>
                  <li>
                    <ColorPicker
                      label='Gray'
                      description='The accent color used for interactive elements.'
                      color={darkGray}
                      onChange={setDarkGray}
                    />
                  </li>
                  <li>
                    <ColorPicker
                      label='Background'
                      description='The accent color used for interactive elements.'
                      color={darkBackground}
                      onChange={setDarkBackground}
                    />
                  </li>
                  <li className='flex flex-col gap-2 mt-2'>
                    <span className='font-medium'>Variables</span>
                    <ul className='flex flex-col gap-2'>
                      <li>
                        <ColorPicker
                          label='Button Color Background Primary'
                          color={darkButtonBackgroundPrimary}
                          onChange={setDarkButtonBackgroundPrimary}
                        />
                      </li>
                      <li>
                        <ColorPicker
                          label='Button Color Background Primary Hover'
                          color={darkButtonBackgroundPrimaryHover}
                          onChange={setDarkButtonBackgroundPrimaryHover}
                        />
                      </li>
                    </ul>
                  </li>
                </ul>
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
