'use client';
import clsx from 'clsx';
import { useState } from 'react';

// Primitives
import { Button } from '../../dist/button';
import * as Card from '../../dist/card';
import * as Connection from '../../dist/connection';
import { Field } from '../../dist/field';
import { Input } from '../../dist/input';
import { Label } from '../../dist/label';
import { Seperator } from '../../dist/seperator';
import { ColorPicker } from './color-picker';
import { generateTheme } from './utils';

const colorPrimaryDefault = { h: 233, s: 8, l: 20 };
const colorNeutralDefault = { h: 0, s: 0, l: 0 };
const colorBackgroundDefault = { h: 0, s: 0, l: 100 };
const colorForegroundDefault = { h: 240, s: 7, l: 14 };
const colorInputBackgroundDefault = { h: 0, s: 0, l: 100 };
const colorInputForegroundDefault = { h: 233, s: 8, l: 20 };

export function ThemeBuilder() {
  const [activePane, setActivePane] = useState<'editor' | 'theme'>('editor');
  const [colorPrimary, setColorPrimary] = useState(colorPrimaryDefault);
  const [colorNeutral, setColorNeutral] = useState(colorNeutralDefault);
  const [colorBackground, setColorBackground] = useState(colorBackgroundDefault);
  const [colorForeground, setColorForeground] = useState(colorForegroundDefault);
  const [colorInputBackground, setColorInputBackground] = useState(colorInputBackgroundDefault);
  const [colorInputForeground, setColorInputForeground] = useState(colorInputForegroundDefault);
  const [copied, setCopied] = useState(false);
  const { rawCss, highlightedCss } = generateTheme([
    ['color-primary', colorPrimary],
    ['color-neutral', colorNeutral],
    ['color-background', colorBackground],
    ['color-foreground', colorForeground],
    ['color-input-background', colorInputBackground],
    ['color-input-foreground', colorInputForeground],
  ]);
  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(rawCss);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  const handleReset = () => {
    setColorPrimary(colorPrimaryDefault);
    setColorNeutral(colorNeutralDefault);
    setColorBackground(colorBackgroundDefault);
    setColorForeground(colorForegroundDefault);
    setColorInputBackground(colorInputBackgroundDefault);
    setColorInputForeground(colorInputForegroundDefault);
  };
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: rawCss,
        }}
      />
      <div className={clsx(`grid min-h-dvh w-full grid-cols-[20rem,1fr]`)}>
        <aside className='flex flex-col p-4'>
          <div
            className='mb-4 grid grid-cols-2 gap-x-2'
            role='tablist'
          >
            <button
              role='tab'
              aria-selected={activePane === 'editor'}
              aria-controls='editor'
              onClick={() => setActivePane('editor')}
              className='rounded border bg-white p-1.5 text-xs'
            >
              Editor
            </button>
            <button
              role='tab'
              aria-selected={activePane === 'theme'}
              aria-controls='theme'
              onClick={() => setActivePane('theme')}
              className='rounded border bg-white p-1.5 text-xs'
            >
              Theme
            </button>
          </div>
          {activePane === 'editor' ? (
            <div
              className='flex h-full flex-col'
              id='editor'
            >
              <div className='space-y-4'>
                <ColorPicker
                  label='Color primary'
                  description='The primary color used throughout the components.'
                  color={colorPrimary}
                  onChange={setColorPrimary}
                />
                <ColorPicker
                  label='Color neutral'
                  description='The color that will be used for all to generate the neutral shades the components use. This option applies to borders, backgrounds for hovered elements, hovered dropdown options.'
                  color={colorNeutral}
                  onChange={setColorNeutral}
                />
                <ColorPicker
                  label='Color background'
                  description='The background color for the card container.'
                  color={colorBackground}
                  onChange={setColorBackground}
                />
                <ColorPicker
                  label='Color foreground'
                  description='The color used for text.'
                  color={colorForeground}
                  onChange={setColorForeground}
                />
                <ColorPicker
                  label='Input background color'
                  description='The background color used for input fields.'
                  color={colorInputBackground}
                  onChange={setColorInputBackground}
                />
                <ColorPicker
                  label='Input foreground color'
                  description='The color used for text in input fields.'
                  color={colorInputForeground}
                  onChange={setColorInputForeground}
                />
              </div>
              <div className='mt-auto'>
                <button
                  className='w-full rounded border bg-white p-1.5 text-xs'
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <div
              className='relative h-full rounded bg-neutral-800 p-4 text-neutral-100'
              id='theme'
              hidden={activePane !== 'theme'}
            >
              <button
                className='absolute right-2 top-2'
                onClick={handleCopy}
              >
                <span className='sr-only'>Copy to clipboard</span>
                {copied ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='1.5'
                    stroke='currentColor'
                    className='size-4'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='m4.5 12.75 6 6 9-13.5'
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='1.5'
                    stroke='currentColor'
                    className='size-4'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184'
                    />
                  </svg>
                )}
              </button>
              <pre className='overflow-auto overflow-x-scroll text-xs [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlightedCss,
                  }}
                />
              </pre>
            </div>
          )}
        </aside>
        <figure className='relative flex flex-col p-4'>
          <div className='relative grid h-full place-content-center rounded border bg-neutral-50 p-4'>
            <div
              className='absolute inset-0 isolate [background-image:linear-gradient(to_bottom,transparent_calc(56px-1px),theme(colors.gray.400)),linear-gradient(to_right,transparent_calc(56px-1px),_theme(colors.gray.400))] [background-size:56px_56px] [mask-image:repeating-linear-gradient(to_right,transparent,black_1px_1px,transparent_1px_4px),repeating-linear-gradient(to_bottom,transparent,black_1px_1px,transparent_1px_4px)]'
              aria-hidden='true'
            />
            <Card.Root>
              <Card.Content>
                <Card.Header>
                  <Card.Title>Sign in to Acme Co</Card.Title>
                  <Card.Description>Welcome back! Please sign in to continue</Card.Description>
                </Card.Header>
                <Card.Body>
                  <Connection.Root>
                    <Connection.Button>Google</Connection.Button>
                    <Connection.Button>GitHub</Connection.Button>
                  </Connection.Root>
                  <Seperator>or</Seperator>
                  <Field>
                    <Label>Email address</Label>
                    <Input />
                  </Field>
                  <Button>Continue</Button>
                </Card.Body>
              </Card.Content>
              <Card.Footer>
                <Card.FooterAction>
                  <Card.FooterActionText>
                    Don&apos;t have an account? <Card.FooterActionLink href='/sign-up'>Sign up</Card.FooterActionLink>
                  </Card.FooterActionText>
                </Card.FooterAction>
              </Card.Footer>
            </Card.Root>
          </div>
        </figure>
      </div>
    </>
  );
}
