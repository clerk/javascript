import type { AppProps } from 'next/app';
import '../styles/globals.css';

import {
  ClerkProvider,
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from '@clerk/nextjs';
import { dark, neobrutalism, shadesOfPurple } from '@clerk/themes';
import Link from 'next/link';
import React, { FunctionComponent, useState } from 'react';

const themes = { default: undefined, dark, neobrutalism, shadesOfPurple };

function MyApp({ Component, pageProps }: AppProps) {
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>('default');

  const onToggleDark = () => {
    if (window.document.body.classList.contains('dark-mode')) {
      setSelectedTheme('default');
      window.document.body.classList.remove('dark-mode');
    } else {
      setSelectedTheme('dark');
      window.document.body.classList.add('dark-mode');
    }
  };

  const C = Component as FunctionComponent;

  return (
    <ClerkProvider
      appearance={{
        baseTheme: themes[selectedTheme],
        layout: {
          shimmer: true,
          helpPageUrl:'/help',
          privacyPageUrl:'/privacy',
          termsPageUrl:'/terms'
        },
      }}
      {...pageProps}
    >
      <AppBar
        onChangeTheme={e => setSelectedTheme(e.target.value as any)}
        onToggleDark={onToggleDark}
      />
      <C {...pageProps} />
    </ClerkProvider>
  );
}

type AppBarProps = {
  onChangeTheme: React.ChangeEventHandler<HTMLSelectElement>;
  onToggleDark: React.MouseEventHandler<HTMLButtonElement>;
};

const AppBar = (props: AppBarProps) => {
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
      <OrganizationSwitcher afterCreateOrganizationUrl={'https://www.google.com'} />
      <OrganizationSwitcher
        hidePersonal
        afterLeaveOrganizationUrl={'https://www.google.com'}
      />
      <OrganizationSwitcher
        organizationProfileMode={'navigation'}
        organizationProfileUrl={'/organization'}
      />
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
      <button onClick={props.onToggleDark}>toggle dark mode</button>
      <UserButton />

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <SignedOut>
        <SignInButton mode={'modal'} />
      </SignedOut>
    </div>
  );
};

export default MyApp;
