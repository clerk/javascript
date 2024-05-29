'use client';
import { useState } from 'react';

import { SignIn } from '../../dist/components/sign-in';
import { SignUp } from '../../dist/components/sign-up';
import { ColorPicker } from './color-picker';
import { generateColors, getPreviewStyles } from './generate-colors';
import { ThemeDialog } from './theme-dialog';

const accentDefault = '#2F3037';
const grayDefault = '#2f3037';
const backgroundDefault = '#fff';

const componnents = {
  SignIn: <SignIn />,
  SignUp: <SignUp />,
};

type Component = keyof typeof componnents;

export function ThemeBuilder() {
  const [accent, setAccent] = useState(accentDefault);
  const [gray, setGray] = useState(grayDefault);
  const [background, setBackground] = useState(backgroundDefault);
  const [selectedComponent, setSelectedComponent] = useState<Component>('SignIn');
  const handleReset = () => {
    setAccent(accentDefault);
    setGray(grayDefault);
    setBackground(backgroundDefault);
  };
  const result = generateColors({
    appearance: 'light',
    accent,
    gray,
    background,
  });
  const css = getPreviewStyles({
    lightColors: result,
    darkColors: result,
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
              <ColorPicker
                label='Accent'
                description='The accent color used for interactive elements.'
                color={accent}
                onChange={setAccent}
              />
              <ColorPicker
                label='Gray'
                description='The accent color used for interactive elements.'
                color={gray}
                onChange={setGray}
              />
              <ColorPicker
                label='Background'
                description='The accent color used for interactive elements.'
                color={background}
                onChange={setBackground}
              />
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
          <figure className='relative isolate w-full flex-1 overflow-y-auto bg-neutral-50'>
            <div className='relative grid h-full place-content-center bg-neutral-50 p-4'>
              <div
                className='absolute inset-0 isolate [background-image:linear-gradient(to_bottom,transparent_calc(56px-1px),theme(colors.gray.400)),linear-gradient(to_right,transparent_calc(56px-1px),_theme(colors.gray.400))] [background-size:56px_56px] [mask-image:repeating-linear-gradient(to_right,transparent,black_1px_1px,transparent_1px_4px),repeating-linear-gradient(to_bottom,transparent,black_1px_1px,transparent_1px_4px)]'
                aria-hidden='true'
              />
              {componnents[selectedComponent]}
            </div>
          </figure>
        </div>
      </div>
    </>
  );
}
