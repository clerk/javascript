'use client';
import clsx from 'clsx';
import { useState } from 'react';

import { Button } from '../../dist/button';
import * as Card from '../../dist/card';
import * as Connection from '../../dist/connection';
import * as Field from '../../dist/field';
import { Seperator } from '../../dist/seperator';
import { ColorPicker } from './color-picker';
import { generateColors, getPreviewStyles } from './generate-colors';
import { ThemeDialog } from './theme-dialog';

const accentDefault = '#2F3037';
const grayDefault = '#2f3037';
const backgroundDefault = '#fff';

export function ThemeBuilder() {
  const [accent, setAccent] = useState(accentDefault);
  const [gray, setGray] = useState(grayDefault);
  const [background, setBackground] = useState(backgroundDefault);
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
      <div className={clsx(`grid min-h-dvh w-full grid-cols-[20rem,1fr]`)}>
        <div className='flex flex-col p-4 h-dvh sticky top-0'>
          <div className='flex h-full flex-col'>
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
          </div>
        </div>
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
                  <Field.Root>
                    <Field.Label>Email address</Field.Label>
                    <Field.Input />
                    <Field.Message>Identifier is invalid.</Field.Message>
                  </Field.Root>
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
