import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { ClerkProvider, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { dark, neobrutalism, shadesOfPurple } from '@clerk/themes';
import Link from 'next/link';
import { useState } from 'react';

const themes = { default: undefined, dark, neobrutalism, shadesOfPurple };

function MyApp({ Component, pageProps }: AppProps) {
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>('default');
  return (
    <ClerkProvider
      appearance={{ baseTheme: themes[selectedTheme] }}
      // frontendApi={'clerk.touching.camel-78.dev.lclclerk.com'}
      // clerkJSUrl={'https://js.lclclerk.com/npm/clerk.browser.js'}
      {...pageProps}
    >
      <AppBar
        onChangeTheme={e => {
          setSelectedTheme(e.target.value as any);
        }}
      />
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

const AppBar = (props: { onChangeTheme: React.ChangeEventHandler<HTMLSelectElement> }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid black',
        marginBottom: '2rem',
      }}
    >
      <Link href={'/'}>
        <h2>Nextjs Playground</h2>
      </Link>
      <select
        name='theme'
        id='theme'
        onChange={props.onChangeTheme}
      >
        <option value='default'>default</option>
        <option value='dark'>dark</option>
        <option value='neobrutalism'>neobrutalism</option>
        <option value='shadesOfPurple'>shadesOfPurple</option>
      </select>
      <UserButton />
      <SignedOut>
        <SignInButton mode={'modal'} />
      </SignedOut>
    </div>
  );
};

export default MyApp;
