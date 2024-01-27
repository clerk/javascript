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
    <ClerkSignIn>
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
                  <Input className='block w-full bg-white rounded-md bg-clip-padding border shadow-[0_1px_0_-1px,0_1px_1px] border-black/[0.06] shadow-black/[0.03] py-1 px-2 focus:outline-none focus:ring-[0.1875rem] focus:ring-gray-100 transition-shadow' />
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
                  className='font-medium text-gray-800'
                >
                  Sign up
                </Link>
              </div>
              <div className='text-center text-gray-600 text-sm p-4 flex items-center gap-1 justify-center'>
                Secured by{' '}
                <span>
                  <svg
                    width='50'
                    height='14'
                    viewBox='0 0 50 14'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <ellipse
                      cx='7.88915'
                      cy='7'
                      rx='2.18749'
                      ry='2.1875'
                      fill='#747686'
                    />
                    <path
                      d='M11.8305 12.1791C12.0166 12.3652 11.9979 12.6734 11.7793 12.8198C10.6666 13.5651 9.32837 13.9998 7.88861 13.9998C6.44885 13.9998 5.11061 13.5651 3.99797 12.8198C3.77929 12.6734 3.76061 12.3652 3.94672 12.1791L5.54531 10.5805C5.6898 10.436 5.91393 10.4132 6.09579 10.5064C6.63351 10.7819 7.24291 10.9373 7.88861 10.9373C8.53431 10.9373 9.14371 10.7819 9.68144 10.5064C9.86329 10.4132 10.0874 10.436 10.2319 10.5805L11.8305 12.1791Z'
                      fill='#747686'
                    />
                    <path
                      opacity='0.5'
                      d='M11.7793 1.17994C11.9979 1.32641 12.0166 1.63454 11.8305 1.82065L10.2319 3.41926C10.0874 3.56374 9.86331 3.58656 9.68145 3.4934C9.14373 3.21792 8.53433 3.0625 7.88864 3.0625C5.71403 3.0625 3.95116 4.82538 3.95116 7C3.95116 7.6457 4.10658 8.2551 4.38206 8.79283C4.47522 8.97468 4.45239 9.19882 4.30791 9.3433L2.70932 10.9419C2.5232 11.128 2.21508 11.1093 2.0686 10.8906C1.32334 9.778 0.888672 8.43976 0.888672 7C0.888672 3.13401 4.02266 0 7.88864 0C9.32839 0 10.6666 0.434669 11.7793 1.17994Z'
                      fill='#747686'
                    />
                    <path
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M23.7485 1.42188C23.7485 1.36147 23.7975 1.3125 23.8579 1.3125H25.4985C25.5589 1.3125 25.6079 1.36147 25.6079 1.42188V12.5781C25.6079 12.6385 25.5589 12.6875 25.4985 12.6875H23.8579C23.7975 12.6875 23.7485 12.6385 23.7485 12.5781V1.42188ZM21.4332 10.3212C21.3896 10.2835 21.3244 10.2864 21.2825 10.3259C21.0268 10.5672 20.7274 10.7603 20.3992 10.895C20.0392 11.0428 19.6522 11.1172 19.2619 11.1137C18.9322 11.1235 18.604 11.0671 18.2974 10.948C17.9909 10.8289 17.7125 10.6497 17.4794 10.4213C17.056 9.98908 16.8123 9.37191 16.8123 8.63619C16.8123 7.16341 17.7921 6.15604 19.2619 6.15604C19.6561 6.15061 20.0466 6.23045 20.4056 6.38978C20.7311 6.53428 21.0234 6.74087 21.2655 6.99711C21.3069 7.04094 21.3757 7.04601 21.4213 7.00655L22.5289 6.04815C22.5741 6.00901 22.5796 5.94064 22.5397 5.89606C21.7066 4.96509 20.4014 4.48438 19.1602 4.48438C16.6612 4.48438 14.8892 6.1701 14.8892 8.65019C14.8892 9.87683 15.3296 10.9097 16.0722 11.6391C16.8149 12.3684 17.8729 12.7969 19.0938 12.7969C20.6245 12.7969 21.8566 12.2099 22.579 11.4568C22.6214 11.4126 22.6167 11.3423 22.5703 11.3023L21.4332 10.3212ZM34.6455 9.18211C34.6394 9.2369 34.5928 9.27791 34.5376 9.27791H28.7904C28.7206 9.27791 28.6686 9.34265 28.6868 9.41006C28.9727 10.47 29.8252 11.1113 30.9888 11.1113C31.381 11.1196 31.7698 11.0389 32.1251 10.8755C32.4562 10.7232 32.75 10.503 32.9866 10.23C33.0153 10.197 33.0652 10.1921 33.0987 10.2201L34.2541 11.2261C34.2984 11.2646 34.3045 11.3312 34.2666 11.3759C33.569 12.1989 32.4387 12.7969 30.8877 12.7969C28.5015 12.7969 26.7016 11.1445 26.7016 8.634C26.7016 7.40236 27.1256 6.36956 27.8324 5.64028C28.2054 5.26526 28.6526 4.96931 29.1464 4.77064C29.6402 4.57198 30.1701 4.47481 30.7035 4.48512C33.122 4.48512 34.6859 6.186 34.6859 8.53455C34.6829 8.75092 34.6694 8.96704 34.6455 9.18211ZM28.7213 7.65792C28.701 7.72542 28.7532 7.79119 28.8237 7.79119H32.6451C32.7157 7.79119 32.7679 7.72502 32.7483 7.65715C32.4878 6.75572 31.827 6.15412 30.8007 6.15412C30.4989 6.14455 30.1985 6.19919 29.92 6.31425C29.6417 6.42937 29.3917 6.60221 29.1875 6.82094C28.9728 7.06442 28.814 7.34991 28.7213 7.65792ZM40.3722 4.48558C40.4331 4.48492 40.4828 4.53408 40.4828 4.59495V6.43184C40.4828 6.4955 40.4286 6.54567 40.3651 6.54096C40.1878 6.52782 40.0202 6.51666 39.9103 6.51666C38.4792 6.51666 37.639 7.5239 37.639 8.84602V12.5781C37.639 12.6385 37.5901 12.6875 37.5297 12.6875H35.8891C35.8286 12.6875 35.7797 12.6385 35.7797 12.5781V4.70851C35.7797 4.6481 35.8286 4.59913 35.8891 4.59913H37.5297C37.5901 4.59913 37.639 4.6481 37.639 4.70851V5.81307C37.639 5.8193 37.6441 5.82435 37.6503 5.82435C37.6539 5.82435 37.6573 5.82266 37.6594 5.81981C38.3007 4.96336 39.2473 4.48693 40.2473 4.48693L40.3722 4.48558ZM44.8164 9.29639C44.8231 9.28919 44.8324 9.2851 44.8423 9.2851C44.8545 9.2851 44.8659 9.29142 44.8723 9.30181L46.9468 12.6359C46.9668 12.668 47.0019 12.6875 47.0397 12.6875L48.9047 12.6875C48.9904 12.6875 49.0428 12.5934 48.9977 12.5205L46.1517 7.92862C46.126 7.88716 46.1308 7.83369 46.1636 7.79755L48.9056 4.77223C48.9694 4.70193 48.9195 4.5894 48.8246 4.5894H46.879C46.8483 4.5894 46.8191 4.60226 46.7984 4.62484L43.6259 8.08305C43.5585 8.15654 43.4359 8.10884 43.4359 8.00911V1.42187C43.4359 1.36147 43.3869 1.3125 43.3265 1.3125H41.6859C41.6255 1.3125 41.5765 1.36147 41.5765 1.42187V12.5781C41.5765 12.6385 41.6255 12.6875 41.6859 12.6875L43.3265 12.6875C43.3869 12.6875 43.4359 12.6385 43.4359 12.5781V10.8226C43.4359 10.7949 43.4464 10.7683 43.4652 10.748L44.8164 9.29639Z'
                      fill='#747686'
                    />
                  </svg>
                </span>
              </div>
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
        </div>
      </div>
    </ClerkSignIn>
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
