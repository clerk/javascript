'use client';

import {
  ClerkError,
  SignIn,
  SignInContinue,
  SignInFactorOne,
  SignInFactorTwo,
  SignInSocialProvider,
  SignInStart,
  SignInStrategy,
  Submit,
} from '@clerk/elements';

import { H1, H2, H3, HR as Hr, P } from '@/components/design';
import { CustomField, CustomSubmit } from '@/components/form';
import { SignInDebug } from '@/components/sign-in-debug';
import { SocialProviderIcon } from '@/components/social-providers';

export default function SignInPage() {
  return (
    <SignIn>
      <div className='m-auto w-max text-sm'>
        <SignInStart>
          <div className='flex flex-col items-center justify-center  gap-12'>
            <H1>START</H1>

            <ClerkError className='block text-red-400 font-mono' />

            <div className='flex flex-col items-stretch justify-center gap-2'>
              <SignInSocialProvider
                name='github'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#171717] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon className='invert' />
                Sign In with GitHub
              </SignInSocialProvider>

              <SignInSocialProvider
                name='google'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#333f61] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon />
                Sign In with Google
              </SignInSocialProvider>

              <SignInSocialProvider
                name='metamask'
                className='flex items-center justify-center gap-4 text-[#161616] rounded bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon />
                Sign In with Metamask
              </SignInSocialProvider>
            </div>

            <Hr />

            <div className='flex gap-6 flex-col'>
              <CustomField
                label='Email'
                name='identifier'
              />

              {/* <Hr />

              <CustomField
                label='Phone'
                name='identifier'
              /> */}

              <CustomSubmit>Sign In</CustomSubmit>
            </div>
          </div>
        </SignInStart>

        <SignInContinue>
          <div className='flex gap-6 flex-col'>
            <H1>STRATEGIES (FIRST/SECOND FACTOR)</H1>

            <H2>
              Current Factor: <SignInFactorOne>First</SignInFactorOne>
              <SignInFactorTwo>Second</SignInFactorTwo>
            </H2>

            <SignInStrategy name='password'>
              <CustomField
                label='Password'
                name='password'
              />

              <CustomSubmit>Sign In</CustomSubmit>
            </SignInStrategy>

            <SignInStrategy name='email_code'>
              <CustomField
                label='Email Code'
                name='code'
              />

              <CustomSubmit>Sign In</CustomSubmit>
            </SignInStrategy>

            <SignInStrategy name='phone_code'>
              {/* <Field
                name='code'
                className='flex flex-col gap-4'
              >
                <div className='flex gap-4 justify-between items-center'>
                  <Label>Phone Code</Label>
                  <Input
                    type='otp'
                    className='flex'
                    render={OTPInputSegment}
                  />
                </div>

                <ClerkError className='block text-red-400 font-mono' />
              </Field> */}

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Sign In
              </Submit>
            </SignInStrategy>

            <SignInStrategy name='reset_password_email_code'>
              <H3>Verify your email</H3>

              <P>Please check your email for a verification code...</P>

              {/* <Field
                name='code'
                className='flex flex-col gap-4'
              >
                <div className='flex gap-4 justify-between items-center'>
                  <Label>Email Code</Label>
                  <Input
                    type='otp'
                    className='flex'
                    render={OTPInputSegment}
                  />
                </div>
                <ClerkError className='block text-red-400 font-mono' />
              </Field> */}

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Verify
              </Submit>
            </SignInStrategy>
          </div>
        </SignInContinue>
      </div>

      <SignInDebug />
    </SignIn>
  );
}
