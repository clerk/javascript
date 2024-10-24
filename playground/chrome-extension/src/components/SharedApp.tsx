import { ClerkProvider, type ChromeExtensionClerkProviderProps } from '@clerk/chrome-extension';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn, SignUp } from '@clerk/chrome-extension';

import '@/assets/styles/index.css';

import { CurrentUser } from '@/components/CurrentUser';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '';

export type SharedAppProps = Pick<ChromeExtensionClerkProviderProps, 'syncHost'> & {
  className?: string;
};

export function SharedApp({ className, ...rest }: SharedAppProps) {
  const navigate = useNavigate();

  const onClick = e => {
    e.preventDefault();

    chrome.runtime.sendMessage({ greeting: 'hello' }, response => {
      console.log('MESSAGE RESPONSE', response);
    });
  };

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      routerPush={to => navigate(to)}
      routerReplace={to => navigate(to, { replace: true })}
      {...rest}
    >
      <div className='container'>
        <header>
          <svg
            alt="Clerk's logo"
            title="Clerk's logo"
            xmlns='http://www.w3.org/2000/svg'
            width={100}
            fill='none'
            viewBox='0 0 84 100'
          >
            <g clip-path='url(#a)'>
              <path
                fill='url(#b)'
                d='M79.65 13.17 67.647 25.172a2.38 2.38 0 0 1-2.919.35 28.556 28.556 0 0 0-38.196 8.146 28.614 28.614 0 0 0-1.015 31.065 2.38 2.38 0 0 1-.35 2.912L13.165 79.647a2.377 2.377 0 0 1-2.836.408 2.379 2.379 0 0 1-.765-.67 49.977 49.977 0 0 1 1.69-60.995 49.515 49.515 0 0 1 7.139-7.14A49.976 49.976 0 0 1 79.38 9.56a2.378 2.378 0 0 1 .27 3.61Z'
              />
              <path
                fill='#1F0256'
                d='M79.638 86.787 67.636 74.785a2.38 2.38 0 0 0-2.92-.35 28.558 28.558 0 0 1-29.501 0 2.38 2.38 0 0 0-2.92.35L20.293 86.787a2.377 2.377 0 0 0 .262 3.65 49.976 49.976 0 0 0 58.806 0 2.379 2.379 0 0 0 .277-3.65ZM49.99 64.26c7.886 0 14.28-6.394 14.28-14.28 0-7.886-6.394-14.279-14.28-14.279-7.886 0-14.28 6.393-14.28 14.28 0 7.885 6.394 14.278 14.28 14.278Z'
              />
            </g>
            <defs>
              <linearGradient
                id='b'
                x1='68.37'
                x2='-32.853'
                y1='-7.328'
                y2='93.902'
                gradientUnits='userSpaceOnUse'
              >
                <stop stop-color='#17CCFC' />
                <stop
                  offset='.5'
                  stop-color='#5D31FF'
                />
                <stop
                  offset='1'
                  stop-color='#F35AFF'
                />
              </linearGradient>
              <clipPath id='a'>
                <path
                  fill='#fff'
                  d='M0 0h83.333v100H0z'
                />
              </clipPath>
            </defs>
          </svg>

          <h1>Clerk Chrome Extension Starter!</h1>

          <button
            type='button'
            onClick={onClick}
            className='button invert'
          >
            Trigger Service Worker
          </button>

          <a
            href='https://clerk.dev/docs'
            target='_blank'
            className='button invert'
            rel='noreferrer'
          >
            Learn more about Clerk
          </a>
        </header>

        <main>
          <Routes>
            <Route
              path='/sign-up/*'
              element={<SignUp signInUrl='/' />}
            />
            <Route
              path='/'
              element={
                <>
                  <SignedIn>
                    <CurrentUser />
                  </SignedIn>
                  <SignedOut>
                    <SignIn
                      forceRedirectUrl='/'
                      signUpUrl='/sign-up'
                    />
                  </SignedOut>
                </>
              }
            />
          </Routes>
        </main>
      </div>
    </ClerkProvider>
  );
}
