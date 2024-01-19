'use client';

import {
  GlobalError,
  SignUp,
  SignUpContinue,
  SignUpSocialProvider,
  SignUpStart,
  SignUpStrategy,
  SignUpVerify,
} from '@clerk/elements';

import { H1, HR as Hr } from '@/components/design';
import { CustomField, CustomSubmit } from '@/components/form';
import { SignUpDebug } from '@/components/sign-up-debug';
import { SocialProviderIcon } from '@/components/social-providers';

export default function SignUpPage() {
  return (
    <SignUp>
      <div className='m-auto w-max text-sm'>
        <SignUpStart>
          <div className='flex flex-col items-center justify-center gap-12'>
            <H1>SIGN UP - START</H1>

            <div className='flex flex-col items-stretch justify-center gap-2'>
              <SignUpSocialProvider
                name='github'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#171717] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon className='invert' />
                Sign In with GitHub
              </SignUpSocialProvider>

              <SignUpSocialProvider
                name='google'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#333f61] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon />
                Sign In with Google
              </SignUpSocialProvider>

              <SignUpSocialProvider
                name='metamask'
                className='flex items-center justify-center gap-4 text-[#161616] rounded bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon />
                Sign In with Metamask
              </SignUpSocialProvider>
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
        </SignUpStart>

        <SignUpContinue>
          <div className='flex flex-col items-center justify-center gap-12'>
            <H1>SIGN UP - CONTINUE</H1>

            <GlobalError className='block text-red-400 font-mono' />

            <div className='flex gap-6 flex-col'>
              <CustomField
                label='First Name'
                name='firstName'
              />
              <CustomField
                label='Last Name'
                name='lastName'
              />
              <CustomField
                label='Username'
                name='username'
              />
              <CustomField
                label='Phone'
                name='phoneNumber'
              />

              <CustomSubmit>Submit</CustomSubmit>
            </div>
          </div>
        </SignUpContinue>

        <SignUpVerify>
          <H1>SIGN UP - VERIFY</H1>

          <SignUpStrategy name='code'>
            <CustomField
              label='Code'
              name='code'
            />

            <CustomSubmit>Verify</CustomSubmit>
          </SignUpStrategy>

          <SignUpStrategy name='email_link'>Please check your email for a link to verify your account.</SignUpStrategy>
        </SignUpVerify>
      </div>

      <SignUpDebug />
    </SignUp>
  );
}
