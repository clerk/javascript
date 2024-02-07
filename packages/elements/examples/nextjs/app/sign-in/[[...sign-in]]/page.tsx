'use client';

import { GlobalError, Submit } from '@clerk/elements/common';
import { SignIn, SocialProvider, Start, Verification, Verify } from '@clerk/elements/sign-in';

import { H1, H3, HR as Hr, P } from '@/components/design';
import { CustomField, CustomSubmit } from '@/components/form';
import { SocialProviderIcon } from '@/components/social-providers';

export default function SignInPage() {
  return (
    <SignIn>
      <div className='m-auto w-max text-sm'>
        <Start>
          <div className='flex flex-col items-center justify-center  gap-12'>
            <H1>START</H1>

            <GlobalError className='block text-red-400 font-mono' />

            <div className='flex flex-col items-stretch justify-center gap-2'>
              <SocialProvider
                name='github'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#171717] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon className='invert' />
                Sign In with GitHub
              </SocialProvider>

              <SocialProvider
                name='google'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#333f61] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon />
                Sign In with Google
              </SocialProvider>

              <SocialProvider
                name='metamask'
                className='flex items-center justify-center gap-4 text-[#161616] rounded bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon />
                Sign In with Metamask
              </SocialProvider>
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
        </Start>

        <Verify>
          <div className='flex gap-6 flex-col'>
            <H1>VERFIY</H1>

            <Verification name='password'>
              <CustomField
                label='Password'
                name='password'
              />

              <CustomSubmit>Sign In</CustomSubmit>
            </Verification>

            <Verification name='email_code'>
              <CustomField
                label='Email Code'
                name='code'
              />

              <CustomSubmit>Sign In</CustomSubmit>
            </Verification>

            <Verification name='phone_code'>
              <CustomField
                label='Phone Code'
                name='code'
              />

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Sign In
              </Submit>
            </Verification>

            <Verification name='reset_password_email_code'>
              <H3>Verify your email</H3>

              <P>Please check your email for a verification code...</P>

              <Submit className='px-4 py-2 b-1 bg-blue-950 bg-opacity-20 hover:bg-opacity-10 active:bg-opacity-5 rounded-md dark:bg-opacity-100 dark:hover:bg-opacity-80 dark:active:bg-opacity-50 transition'>
                Verify
              </Submit>
            </Verification>
          </div>
        </Verify>
      </div>

      {/* <SignInDebug /> */}
    </SignIn>
  );
}
