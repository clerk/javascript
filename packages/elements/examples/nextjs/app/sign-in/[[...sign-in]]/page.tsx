'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import Link from 'next/link';
import { type ComponentProps, useState } from 'react';

import { H1, H3, P } from '@/components/design';
import { CustomField } from '@/components/form';
import { Spinner } from '@/components/spinner';

function CustomSamlConnection({ children }: { children: string }) {
  return (
    <Clerk.Loading scope='provider:saml'>
      {isLoading => (
        <Clerk.Connection
          className='relative flex h-14 w-full cursor-pointer items-center justify-center text-xs text-[rgb(243,243,243)] transition-all duration-150'
          disabled={isLoading}
          name='saml'
          type='button'
        >
          <span className='inline-flex items-center justify-center leading-loose'>
            {isLoading ? (
              <>
                <Spinner /> Loading...
              </>
            ) : (
              children
            )}
          </span>
        </Clerk.Connection>
      )}
    </Clerk.Loading>
  );
}

function CustomProvider({
  children,
  provider,
}: {
  children: string;
  provider: ComponentProps<typeof Clerk.Connection>['name'];
}) {
  return (
    <Clerk.Loading scope={`provider:${provider}`}>
      {isLoading => (
        <Clerk.Connection
          name={provider}
          className='relative flex h-14 w-full cursor-pointer items-center justify-center rounded-lg border border-[rgb(37,37,37)] bg-[rgb(22,22,22)] text-sm text-[rgb(243,243,243)] transition-all duration-150 hover:border-[rgb(50,50,50)] hover:bg-[rgb(22,22,30)] [&>img]:opacity-80 [&>img]:grayscale [&>img]:hover:opacity-100 [&>img]:hover:grayscale-0'
          disabled={isLoading}
        >
          <Clerk.Icon
            className={`absolute left-4 transition-all duration-200${provider === 'github' ? 'invert' : ''}`}
          />
          <span className='inline-flex items-center justify-center leading-loose'>
            {isLoading ? (
              <>
                <Spinner /> Loading...
              </>
            ) : (
              children
            )}
          </span>
        </Clerk.Connection>
      )}
    </Clerk.Loading>
  );
}

function TextButton({ children, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type='button'
      className='m-0 w-full px-6 py-3 text-center text-sm font-medium text-zinc-400 transition-colors duration-150 hover:text-[rgb(204,204,204)]'
      {...props}
    >
      {children}
    </button>
  );
}

function Button({ children, ...props }: ComponentProps<'button'>) {
  return (
    <button
      type='button'
      className='relative flex h-14 w-full cursor-pointer items-center justify-center rounded-lg border border-[rgb(37,37,37)] bg-[rgb(22,22,22)] text-sm text-[rgb(243,243,243)] transition-all duration-150 hover:border-[rgb(50,50,50)] hover:bg-[rgb(22,22,30)] [&>img]:opacity-80 [&>img]:grayscale [&>img]:hover:opacity-100 [&>img]:hover:grayscale-0'
      {...props}
    >
      {children}
    </button>
  );
}

function CustomSubmit({ children }: { children: string }) {
  return (
    <SignIn.Action
      className='inline-flex w-full select-none items-center justify-center space-x-1.5 rounded-lg border border-[rgb(37,37,37)] bg-[rgb(22,22,22)] px-7 py-3 text-sm text-[rgb(160,160,160)] transition duration-300 hover:border-[rgb(50,50,50)] hover:bg-[rgb(22,22,30)] hover:text-[rgb(243,243,243)] focus:!border-[rgb(37,37,37)] focus:text-[rgb(255,255,255)] focus:outline-none disabled:bg-[rgb(12,12,12)] disabled:text-[rgb(100,100,100)]'
      submit
    >
      <Clerk.Loading>{isLoading => (isLoading ? <Spinner /> : children)}</Clerk.Loading>
    </SignIn.Action>
  );
}

function ResendableFallback({ resendableAfter }: { resendableAfter: number }) {
  return <P className='text-sm'>Didn&apos;t recieve a code? Retry in {resendableAfter} seconds.</P>;
}

function CustomResendable() {
  return (
    <SignIn.Action
      fallback={ResendableFallback}
      resend
    >
      Didn&apos;t recieve a code? <strong className='text-blue-400'>Retry Now</strong>
    </SignIn.Action>
  );
}

export default function SignInPage() {
  const [continueWithEmail, setContinueWithEmail] = useState(false);

  return (
    <SignIn.Root
      fallback={
        <div className='flex h-dvh flex-col items-center justify-center gap-10 bg-zinc-950 text-white'>
          <div className='text-center'>
            <H1>Sign In</H1>
            <p className='text-base text-zinc-400'>
              Don&apos;t have an account?{' '}
              <Link
                href='/sign-up'
                className='no-underline hover:underline'
              >
                Sign Up
              </Link>
            </p>
          </div>
          <div className='flex w-96 flex-col items-center gap-12'>
            <Clerk.GlobalError className='block font-mono text-red-400' />

            <div className='flex flex-col gap-2 self-stretch'>
              <CustomProvider provider='github'>Continue with GitHub</CustomProvider>
              <CustomProvider provider='google'>Continue with Google</CustomProvider>
            </div>

            {continueWithEmail ? (
              <>
                <Clerk.Field
                  className='flex w-full flex-col gap-4'
                  name='identifier'
                >
                  {fieldState => (
                    <>
                      <Clerk.Label className='sr-only'>Email</Clerk.Label>
                      <Clerk.Input
                        className={`w-full rounded border border-[rgb(37,37,37)] bg-[rgb(12,12,12)] px-4 py-2 placeholder-[rgb(100,100,100)] ${
                          fieldState === 'error' && 'border-red-500'
                        }`}
                        placeholder='Enter your email address'
                      />
                      <Clerk.FieldError className='block w-full font-mono text-red-400' />
                    </>
                  )}
                </Clerk.Field>

                <div className='flex w-full justify-between'>
                  <CustomSubmit>Sign in with Email</CustomSubmit>
                  <CustomSamlConnection>Continue with SAML</CustomSamlConnection>
                </div>
              </>
            ) : (
              <TextButton onClick={() => setContinueWithEmail(true)}>Continue with Email</TextButton>
            )}
          </div>
        </div>
      }
    >
      <div className='flex h-dvh flex-col items-center justify-center gap-10 bg-zinc-950 text-white'>
        <div className='text-center'>
          <H1>Sign In</H1>
          <p className='text-base text-zinc-400'>
            Don&apos;t have an account?{' '}
            <Link
              href='/sign-up'
              className='no-underline hover:underline'
            >
              Sign Up
            </Link>
          </p>
        </div>

        <div className='absolute right-4 top-4'>
          <Clerk.Loading>{isLoading => <span>Loading: {JSON.stringify(isLoading, null, 2)}</span>}</Clerk.Loading>
        </div>

        <SignIn.Step name='start'>
          <div className='flex w-96 flex-col items-center gap-12'>
            <Clerk.GlobalError className='block font-mono text-red-400' />

            <div className='flex flex-col gap-2 self-stretch'>
              <CustomProvider provider='github'>Continue with GitHub</CustomProvider>
              <CustomProvider provider='google'>Continue with Google</CustomProvider>
            </div>

            <SignIn.Passkey className='inline-flex w-full select-none items-center justify-center space-x-1.5 rounded-lg border border-[rgb(37,37,37)] bg-[rgb(22,22,22)] px-7 py-3 text-sm text-[rgb(160,160,160)] transition duration-300 hover:border-[rgb(50,50,50)] hover:bg-[rgb(22,22,30)] hover:text-[rgb(243,243,243)] focus:!border-[rgb(37,37,37)] focus:text-[rgb(255,255,255)] focus:outline-none disabled:bg-[rgb(12,12,12)] disabled:text-[rgb(100,100,100)]'>
              <Clerk.Loading>{isLoading => (isLoading ? <Spinner /> : 'Use passkey instead')}</Clerk.Loading>
            </SignIn.Passkey>

            {continueWithEmail ? (
              <>
                <Clerk.Field
                  className='flex w-full flex-col gap-4'
                  name='identifier'
                >
                  {fieldState => (
                    <>
                      <Clerk.Label className='sr-only'>Email</Clerk.Label>
                      <Clerk.Input
                        className={`w-full rounded border border-[rgb(37,37,37)] bg-[rgb(12,12,12)] px-4 py-2 placeholder-[rgb(100,100,100)] ${
                          fieldState === 'error' && 'border-red-500'
                        }`}
                        placeholder='Enter your email address'
                        type='email'
                      />
                      <Clerk.FieldError className='block w-full font-mono text-red-400' />
                    </>
                  )}
                </Clerk.Field>

                <div className='flex w-full justify-between'>
                  <CustomSubmit>Sign in with Email</CustomSubmit>
                  <CustomSamlConnection>Continue with SAML</CustomSamlConnection>
                </div>
              </>
            ) : (
              <TextButton onClick={() => setContinueWithEmail(true)}>Continue with Email</TextButton>
            )}
          </div>
        </SignIn.Step>

        <SignIn.Step
          name='choose-session'
          className='flex w-96 flex-col items-center gap-6'
        >
          <H3>CHOOSE SESSION:</H3>

          <SignIn.SessionList asChild>
            <section>
              <SignIn.SessionListItem asChild>
                {({ session }) => (
                  <p>
                    {session.identifier} | <SignIn.Action setActiveSession>Switch...</SignIn.Action>{' '}
                  </p>
                )}
              </SignIn.SessionListItem>
            </section>
          </SignIn.SessionList>
        </SignIn.Step>
        <SignIn.Step
          name='choose-strategy'
          className='flex w-96 flex-col items-center gap-6'
        >
          <H3>CHOOSE STRATEGY:</H3>

          <CustomProvider provider='github'>Continue with GitHub</CustomProvider>
          <CustomProvider provider='google'>Continue with Google</CustomProvider>

          <SignIn.SupportedStrategy
            asChild
            name='password'
          >
            <Button>Password</Button>
          </SignIn.SupportedStrategy>

          <SignIn.SupportedStrategy
            asChild
            name='phone_code'
          >
            <Button>Send a code to your phone</Button>
          </SignIn.SupportedStrategy>

          <SignIn.SupportedStrategy
            asChild
            name='backup_code'
          >
            <Button>Use a backup code</Button>
          </SignIn.SupportedStrategy>

          <SignIn.SupportedStrategy
            asChild
            name='totp'
          >
            <Button>MFA</Button>
          </SignIn.SupportedStrategy>

          <SignIn.SupportedStrategy
            asChild
            name='passkey'
          >
            <Button>use passkey</Button>
          </SignIn.SupportedStrategy>

          <SignIn.SupportedStrategy
            asChild
            name='email_code'
          >
            <Button>Send a code to your email</Button>
          </SignIn.SupportedStrategy>

          <SignIn.Action
            asChild
            navigate='previous'
          >
            <TextButton>Go back</TextButton>
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step
          name='forgot-password'
          className='flex w-96 flex-col items-center gap-6'
        >
          <H3>FORGOT PASSWORD:</H3>

          <SignIn.SupportedStrategy
            asChild
            name='reset_password_email_code'
          >
            <Button>Reset your password via Email</Button>
          </SignIn.SupportedStrategy>

          <SignIn.SupportedStrategy
            asChild
            name='reset_password_phone_code'
          >
            <Button>Reset your password via Phone</Button>
          </SignIn.SupportedStrategy>

          <p>Or</p>

          <CustomProvider provider='github'>Continue with GitHub</CustomProvider>
          <CustomProvider provider='google'>Continue with Google</CustomProvider>

          <SignIn.Action
            asChild
            navigate='previous'
          >
            <TextButton>Go back</TextButton>
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step name='verifications'>
          <div className='flex flex-col gap-6'>
            <Clerk.GlobalError className='block font-mono text-red-400' />

            <SignIn.Strategy name='passkey'>
              <P className='text-sm'>
                Welcome back <SignIn.Salutation />!
              </P>

              <CustomSubmit>Continue with Passkey</CustomSubmit>
            </SignIn.Strategy>

            <SignIn.Strategy name='password'>
              <P className='text-sm'>
                Welcome back <SignIn.Salutation />!
              </P>

              <CustomField
                label='Password'
                name='password'
              />

              <CustomSubmit>Verify</CustomSubmit>

              <SignIn.Action
                asChild
                navigate='forgot-password'
              >
                <TextButton>Forgot Password</TextButton>
              </SignIn.Action>
            </SignIn.Strategy>

            <SignIn.Strategy name='email_code'>
              <P className='text-sm'>
                Welcome back! We&apos;ve sent a temporary code to <SignIn.SafeIdentifier />
              </P>

              <CustomResendable />

              <CustomField
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                autoSubmit
                label='Email Code'
                name='code'
              />

              <CustomSubmit>Verify</CustomSubmit>
            </SignIn.Strategy>

            <SignIn.Strategy name='phone_code'>
              <P className='text-sm'>
                Welcome back! We&apos;ve sent a temporary code to <SignIn.SafeIdentifier />
              </P>

              <CustomResendable />

              <CustomField
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                autoSubmit
                label='Phone Code'
                name='code'
              />

              <CustomSubmit>Verify</CustomSubmit>
            </SignIn.Strategy>

            <SignIn.Strategy name='totp'>
              <P className='text-sm'>Please enter your authenticator code...</P>

              <CustomField
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                label='Authenticator Code'
                name='code'
              />

              <Clerk.FieldError className='block w-full font-mono text-red-400' />

              <CustomSubmit>Verify</CustomSubmit>
            </SignIn.Strategy>

            <SignIn.Strategy name='backup_code'>
              <P className='text-sm'>Please enter your backup code...</P>

              <CustomField
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                label='Backup Code'
                name='backup_code'
              />

              <Clerk.FieldError className='block w-full font-mono text-red-400' />

              <CustomSubmit>Verify</CustomSubmit>
            </SignIn.Strategy>

            <SignIn.Strategy name='reset_password_email_code'>
              <H3>Verify your email</H3>

              <P className='text-sm'>
                We&apos;ve sent a verification code to <SignIn.SafeIdentifier />
              </P>

              <CustomField
                label='Code'
                name='code'
              />

              <CustomSubmit>Continue</CustomSubmit>
            </SignIn.Strategy>

            <SignIn.Strategy name='reset_password_phone_code'>
              <H3>Verify your phone number</H3>

              <P className='text-sm'>
                We&apos;ve sent a verification code to <SignIn.SafeIdentifier />
              </P>

              <CustomField
                label='Code'
                name='code'
              />

              <CustomSubmit>Continue</CustomSubmit>
            </SignIn.Strategy>
          </div>

          <SignIn.Action
            asChild
            navigate='choose-strategy'
          >
            <TextButton>Use another method</TextButton>
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step name='reset-password'>
          <div className='flex w-96 flex-col items-center gap-6'>
            <H3>Reset your password</H3>

            <P className='text-sm'>Please reset your password to continue:</P>

            <CustomField
              label='New Password'
              name='password'
            />
            <CustomSubmit>Update Password</CustomSubmit>
          </div>
        </SignIn.Step>
        <SignIn.Step name='sso-callback'></SignIn.Step>
      </div>
    </SignIn.Root>
  );
}
