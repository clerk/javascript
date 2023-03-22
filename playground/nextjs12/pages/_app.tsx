import '../styles/globals.css';
import type { AppProps } from 'next/app';

import { ClerkProvider, OrganizationSwitcher, SignInButton, UserButton } from '@clerk/nextjs';
import { dark, neobrutalism, shadesOfPurple } from '@clerk/themes';
import Link from 'next/link';
import React, { useState } from 'react';
import { useColorScheme } from '../hooks/useColorScheme';

const themes = { default: undefined, dark, neobrutalism, shadesOfPurple };

function MyApp({ Component, pageProps }: AppProps) {
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>('default');
  const { scheme } = useColorScheme();

  const onToggleDark = () => {
    if (window.document.body.classList.contains('dark-mode')) {
      setSelectedTheme('default');
      window.document.body.classList.remove('dark-mode');
    } else {
      setSelectedTheme('dark');
      window.document.body.classList.add('dark-mode');
    }
  };

  return (
    <ClerkProvider
      appearance={{
        baseTheme: scheme === 'dark' ? themes.dark : themes[selectedTheme],
        variables: { colorPrimary: '#f85656' },
      }}
      {...pageProps}
    >
      <AppBar
        onChangeTheme={e => setSelectedTheme(e.target.value as any)}
        onToggleDark={onToggleDark}
      />
      <Component {...pageProps} />
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
      <OrganizationSwitcher organizationProfileMode={'navigation'} />
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
      <SignInButton mode={'modal'} />
    </div>
  );
};

export default MyApp;
