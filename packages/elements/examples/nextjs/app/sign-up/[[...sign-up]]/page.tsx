'use client';

import { GlobalError } from '@clerk/elements/common';
import { Github, Google, Metamask } from '@clerk/elements/icons';
import { SignUp, SocialProvider, Step, Verification } from '@clerk/elements/sign-up';

import { H1, HR as Hr } from '@/components/design';
import { CustomField, CustomSubmit } from '@/components/form';

export default function SignUpPage() {
  return (
    <SignUp>
      <div className='m-auto w-max text-sm'>
        <Step name='start'>
          <div className='flex flex-col items-center justify-center gap-12'>
            <H1>Sign Up</H1>

            <div className='flex flex-col items-stretch justify-center gap-2'>
              <SocialProvider
                name='github'
                className='relative flex items-center justify-center gap-4 text-white rounded bg-[#171717] [&>svg]:absolute [&>svg]:left-4 px-20 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Github className='invert' />
                Sign In with GitHub
              </SocialProvider>

              <SocialProvider
                name='google'
                className='relative flex items-center justify-center gap-4 text-white rounded bg-[#333f61] [&>svg]:absolute [&>svg]:left-4 px-20 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Google />
                Sign In with Google
              </SocialProvider>

              <SocialProvider
                name='metamask'
                className='relative flex items-center justify-center gap-4 text-[#161616] rounded bg-white [&>svg]:absolute [&>svg]:left-4 px-20 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <Metamask />
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
                label='Phone Number'
                name='phoneNumber'
              />
              <CustomSubmit>Sign Up</CustomSubmit>
            </div>
          </div>
        </Step>

        <Step name='continue'>
          <H1>Please enter additional information:</H1>

          <GlobalError className='block text-red-400 font-mono' />

          <CustomField
            label='Password'
            name='password'
          />

          <CustomField
            alwaysShow
            label='Phone Number'
            name='phoneNumber'
          />

          <CustomSubmit>Sign Up</CustomSubmit>
        </Step>

        <Step name='verifications'>
          <H1>Verify your information:</H1>

          <GlobalError className='block text-red-400 font-mono' />

          <Verification name='phone_code'>
            <CustomField
              label='SMS Code'
              name='code'
            />

            <CustomSubmit>Verify</CustomSubmit>
          </Verification>

          <Verification name='email_code'>
            <CustomField
              label='Email Code'
              name='code'
            />

            <CustomSubmit>Verify</CustomSubmit>
          </Verification>

          <Verification name='email_link'>Please check your email for a link to verify your account.</Verification>
        </Step>
      </div>
    </SignUp>
  );
}
