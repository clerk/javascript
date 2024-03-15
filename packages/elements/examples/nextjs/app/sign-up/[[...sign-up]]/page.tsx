'use client';

import { GlobalError } from '@clerk/elements/common';
import { Loading, SignUp, SocialProvider, SocialProviderIcon, Step, Verification } from '@clerk/elements/sign-up';

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
                className='flex items-center justify-center gap-4 text-white rounded bg-[#171717] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon className='invert' />
                <Loading scope='provider:github'>
                  {({ isLoading }) => (isLoading ? 'Loading...' : 'Sign In with GitHub')}
                </Loading>
              </SocialProvider>

              <SocialProvider
                name='google'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#333f61] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon />
                <Loading scope='provider:google'>
                  {({ isLoading }) => (isLoading ? 'Loading...' : 'Sign In with Google')}
                </Loading>
              </SocialProvider>

              <SocialProvider
                name='metamask'
                className='flex items-center justify-center gap-4 text-[#161616] rounded bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <SocialProviderIcon />
                <Loading scope='provider:metamask'>
                  {({ isLoading }) => (isLoading ? 'Loading...' : 'Sign In with Metamask')}
                </Loading>
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
              <CustomSubmit>
                <Loading scope='step:start'>{({ isLoading }) => (isLoading ? 'Loading...' : 'Sign Up')}</Loading>
              </CustomSubmit>
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

          <CustomSubmit>
            <Loading scope='step:continue'>{({ isLoading }) => (isLoading ? 'Loading...' : 'Sign Up')}</Loading>
          </CustomSubmit>
        </Step>

        <Step name='verifications'>
          <H1>Verify your information:</H1>

          <GlobalError className='block text-red-400 font-mono' />

          <Verification name='phone_code'>
            <CustomField
              label='SMS Code'
              name='code'
            />

            <CustomSubmit>
              <Loading scope='step:verifications'>{({ isLoading }) => (isLoading ? 'Loading...' : 'Verify')}</Loading>
            </CustomSubmit>
          </Verification>

          <Verification name='email_code'>
            <CustomField
              label='Email Code'
              name='code'
            />

            <CustomSubmit>
              <Loading scope='step:verifications'>{({ isLoading }) => (isLoading ? 'Loading...' : 'Verify')}</Loading>
            </CustomSubmit>
          </Verification>

          <Verification name='email_link'>Please check your email for a link to verify your account.</Verification>
        </Step>
      </div>
    </SignUp>
  );
}
