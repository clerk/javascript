'use client';

import { GlobalError } from '@clerk/elements/common';
import { Action, Loading, Provider, ProviderIcon, SignUp, Step, Strategy } from '@clerk/elements/sign-up';
import type { ComponentProps } from 'react';

import { H1, HR as Hr } from '@/components/design';
import { CustomField } from '@/components/form';
import { Spinner } from '@/components/spinner';

function CustomSubmit({ children }: ComponentProps<'button'>) {
  return (
    <Action
      className='inline-flex px-7 py-3 justify-center transition rounded-lg focus:outline-none border items-center disabled:bg-[rgb(12,12,12)] focus:text-[rgb(255,255,255)] w-full duration-300 focus:!border-[rgb(37,37,37)] text-sm space-x-1.5 text-[rgb(160,160,160)] hover:text-[rgb(243,243,243)] disabled:text-[rgb(100,100,100)] select-none bg-[rgb(22,22,22)] hover:bg-[rgb(22,22,30)] border-[rgb(37,37,37)] hover:border-[rgb(50,50,50)]'
      submit
    >
      {children}
    </Action>
  );
}

export default function SignUpPage() {
  return (
    <SignUp>
      <div className='m-auto w-max text-sm'>
        <Step name='start'>
          <div className='flex flex-col items-center justify-center gap-12'>
            <H1>Sign Up</H1>

            <div className='flex flex-col items-stretch justify-center gap-2'>
              <Provider
                name='github'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#171717] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <ProviderIcon className='invert' />
                Sign In with GitHub
              </Provider>

              <Provider
                name='google'
                className='flex items-center justify-center gap-4 text-white rounded bg-[#333f61] px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <ProviderIcon />
                Sign In with Google
              </Provider>

              <Provider
                name='metamask'
                className='flex items-center justify-center gap-4 text-[#161616] rounded bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/[0.06] transition-all hover:bg-opacity-80'
              >
                <ProviderIcon />
                Sign In with Metamask
              </Provider>
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
                <Loading>
                  {isLoading =>
                    isLoading ? (
                      <>
                        <Spinner /> Loading...
                      </>
                    ) : (
                      'Sign Up'
                    )
                  }
                </Loading>
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
            <Loading>
              {isLoading =>
                isLoading ? (
                  <>
                    <Spinner /> Loading...
                  </>
                ) : (
                  'Sign Up'
                )
              }
            </Loading>
          </CustomSubmit>
        </Step>

        <Step name='verifications'>
          <H1>Verify your information:</H1>

          <GlobalError className='block text-red-400 font-mono' />

          <Strategy name='phone_code'>
            <CustomField
              label='SMS Code'
              name='code'
            />

            <CustomSubmit>
              <Loading>
                {isLoading =>
                  isLoading ? (
                    <>
                      <Spinner /> Loading...
                    </>
                  ) : (
                    'Verify'
                  )
                }
              </Loading>
            </CustomSubmit>
          </Strategy>

          <Strategy name='email_code'>
            <CustomField
              label='Email Code'
              name='code'
            />

            <CustomSubmit>
              <Loading>
                {isLoading =>
                  isLoading ? (
                    <>
                      <Spinner /> Loading...
                    </>
                  ) : (
                    'Verify'
                  )
                }
              </Loading>
            </CustomSubmit>
          </Strategy>

          <Strategy name='email_link'>Please check your email for a link to verify your account.</Strategy>
        </Step>
      </div>
    </SignUp>
  );
}
