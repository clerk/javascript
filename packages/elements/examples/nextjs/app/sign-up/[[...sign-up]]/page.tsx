'use client';

import { GlobalError } from '@clerk/elements/common';
import {
  Continue,
  SignUp,
  SocialProvider,
  SocialProviderIcon,
  Start,
  Verification,
  Verify,
} from '@clerk/elements/sign-up';

import { H1, HR as Hr } from '@/components/design';
import { CustomField, CustomSubmit } from '@/components/form';

export default function SignUpPage() {
  return (
    <SignUp>
      <div className='m-auto w-max text-sm'>
        <Start>
          <div className='flex flex-col items-center justify-center gap-12'>
            <H1>Sign Up</H1>

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

            <GlobalError className='block text-red-400 font-mono' />

            <div className='flex gap-6 flex-col'>
              <CustomField
                label='Email'
                name='emailAddress'
              />

              <CustomField
                label='Password'
                name='password'
              />
              <CustomSubmit>Sign Up</CustomSubmit>
            </div>
          </div>
        </Start>

        <Continue>
          <H1>Please enter additional information:</H1>

          <GlobalError className='block text-red-400 font-mono' />

          <CustomField
            label='Phone Number'
            name='phoneNumber'
          />

          <CustomSubmit>Sign Up</CustomSubmit>
        </Continue>

        <Verify>
          <H1>Verify your information:</H1>

          <GlobalError className='block text-red-400 font-mono' />

          <Verification name='code'>
            <CustomField
              label='Code'
              name='code'
            />

            <CustomSubmit>Verify</CustomSubmit>
          </Verification>

          <Verification name='email_link'>Please check your email for a link to verify your account.</Verification>
        </Verify>
      </div>

      {/* <SignUpDebug /> */}
    </SignUp>
  );
}
