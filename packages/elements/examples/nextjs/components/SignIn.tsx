'use client';

import {
  Field,
  FieldError,
  Input,
  Label,
  SignIn as ClerkSignIn,
  SignInContinue,
  SignInSocialProvider,
  SignInStart,
  SignInStrategy,
  Submit,
} from '@clerk/elements';
import type { OAuthProvider } from '@clerk/types';
import Link from 'next/link';

export const SignIn = () => {
  return (
    <div className='h-dvh flex items-center justify-center font-sans bg-black/25'>
      <div
        style={{
          boxShadow: `
            0 3px 3px 1px var(--tw-shadow-color),
            0 6px 6px 2px var(--tw-shadow-color),
            0 12px 12px 4px var(--tw-shadow-color),
            0 24px 24px 8px var(--tw-shadow-color)
          `,
        }}
        className='bg-gray-100 rounded-xl bg-clip-padding border border-black/[0.06] shadow-black/[0.04] overflow-hidden max-w-[25rem] w-full'
      >
        <ClerkSignIn>
          <SignInStart>
            <div
              style={{
                boxShadow: `
                  0 1px 0 var(--tw-shadow-color),
                  0 1px 1px var(--tw-shadow-color)
                `,
              }}
              className='bg-white rounded-xl shadow-black/[0.06] p-8 text-center'
            >
              <div className='space-y-6'>
                <div className='size-8 rounded-lg bg-gray-900 flex items-center justify-center before:block before:size-4 before:rounded-full before:bg-white mx-auto' />
                <div className=''>
                  <h1 className='font-semibold text-lg'>Sign in to Acme Co</h1>
                  <p className='text-gray-600 text-sm'>Welcome back! Please sign in to continue</p>
                </div>
              </div>

              <div className='space-y-6 mt-8'>
                <div className='grid gap-2 grid-cols-3'>
                  <SocialButton provider='google'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      height='1em'
                      viewBox='0 0 600 600'
                      width='1em'
                    >
                      <path
                        d='M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z'
                        fill='currentColor'
                      />
                      <path
                        d='M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z'
                        fill='currentColor'
                      />
                      <path
                        d='M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z'
                        fill='currentColor'
                      />
                      <path
                        d='M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z'
                        fill='currentColor'
                      />
                    </svg>
                  </SocialButton>
                  <SocialButton provider='facebook'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      height='1em'
                      stroke='none'
                      viewBox='0 0 24 24'
                      width='1em'
                    >
                      <path
                        d='M12 23.9999C18.6274 23.9999 24 18.6273 24 11.9999C24 5.37256 18.6274 0 12 0C5.37258 0 0 5.37256 0 11.9999C0 18.6273 5.37258 23.9999 12 23.9999Z'
                        fill='currentColor'
                      />
                      <path
                        d='M16.6717 15.4696L17.2033 12H13.8755V9.74886C13.8755 8.80047 14.3396 7.87402 15.8313 7.87402H17.345V4.92085C17.345 4.92085 15.9714 4.68628 14.6585 4.68628C11.918 4.68628 10.1258 6.34681 10.1258 9.35567V12H7.07812V15.4696H10.1258V23.8549C10.7367 23.9511 11.3628 24 12.0006 24C12.6385 24 13.2646 23.9494 13.8755 23.8549V15.4696H16.6717Z'
                        fill='white'
                      />
                    </svg>
                  </SocialButton>
                  <SocialButton provider='github'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      height='1em'
                      viewBox='0 0 1024 1024'
                      width='1em'
                    >
                      <path
                        clipRule='evenodd'
                        d='M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z'
                        fill='currentColor'
                        fillRule='evenodd'
                        transform='scale(64)'
                      />
                    </svg>
                  </SocialButton>
                </div>

                <div className='flex items-center gap-3'>
                  <hr className='flex-1 border-gray-100' />
                  <span className='text-gray-600 text-sm'>or</span>
                  <hr className='flex-1 border-gray-100' />
                </div>
              </div>

              <div className='space-y-6'>
                <Field
                  name='identifier'
                  className='text-left space-y-1.5 mt-4'
                >
                  <Label className='text-sm font-medium'>Username</Label>
                  <Input
                    style={{
                      boxShadow: `
                      0 1px 0 -1px var(--tw-shadow-color),
                      0 1px 1px var(--tw-shadow-color)
                    `,
                    }}
                    className='block w-full bg-white rounded-md bg-clip-padding border border-black/[0.06] shadow-black/[0.03] py-1 px-2'
                  />
                  <FieldError />
                </Field>

                <Submit className='text-sm text-white rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 w-full py-1.5 font-medium'>
                  Continue
                </Submit>
              </div>
            </div>

            <div className='divide-y divide-gray-150 text-xs'>
              <div className='text-center text-gray-600 text-sm p-4'>
                Don&apos;t have an account?{' '}
                <Link
                  href='/'
                  className='font-medium text-gray-700'
                >
                  Sign in
                </Link>
              </div>
              <div className='text-center text-gray-600 text-sm p-4'>Secured by Clerk</div>
            </div>
          </SignInStart>

          <SignInContinue>
            <SignInStrategy name='password'>
              <Field name='password'>
                <Label>Password</Label>
                <Input />
                <FieldError />
              </Field>
            </SignInStrategy>
            <SignInStrategy name='phone_code'>
              <Field name='code'>
                <Label>Phone code</Label>
                <Input
                  type='otp'
                  render={({ value }) => <span>{value}</span>}
                />
                <FieldError />
              </Field>
            </SignInStrategy>
            <SignInStrategy name='email_code'>
              <Field name='code'>
                <Label>Email code</Label>
                <Input
                  type='otp'
                  render={({ value }) => <span>{value}</span>}
                />
                <FieldError />
              </Field>
            </SignInStrategy>
          </SignInContinue>
        </ClerkSignIn>
      </div>
    </div>
  );
};

const SocialButton = (props: { children: React.ReactNode; provider: OAuthProvider | 'metamask' }) => {
  return (
    <SignInSocialProvider
      name={props.provider}
      style={{
        boxShadow: `
          0 1px 0 -1px var(--tw-shadow-color),
          0 1px 1px var(--tw-shadow-color)
        `,
      }}
      className='bg-white rounded-md bg-clip-padding border border-black/[0.06] shadow-black/[0.04] flex items-center justify-center py-1.5'
    >
      {props.children}
    </SignInSocialProvider>
  );
};
