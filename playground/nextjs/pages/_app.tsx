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
import { dark, experimental__simple, neobrutalism, shadesOfPurple } from '@clerk/themes';
import Link from 'next/link';
import React, { FunctionComponent, useEffect, useState } from 'react';

const themes = { default: undefined, dark, neobrutalism, shadesOfPurple };

function MyApp({ Component, pageProps }: AppProps) {
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>('default');
  const [selectedSmoothing, setSelectedSmoothing] = useState<boolean>(true);
  const [styleReset, setStyleReset] = useState<boolean>(false);
  const [animations, setAnimations] = useState<boolean>(true);
  const [primaryColor, setPrimaryColor] = useState<string | undefined>(undefined);
  const [disableDevMode, setDisableDevMode] = useState<boolean>(false);

  const onToggleDark = () => {
    if (window.document.body.classList.contains('dark-mode')) {
      setSelectedTheme('default');
      window.document.body.classList.remove('dark-mode');
    } else {
      setSelectedTheme('dark');
      window.document.body.classList.add('dark-mode');
    }
  };

  const onToggleAnimations = () => {
    setAnimations(s => !s);
  };

  const onToggleDevMode = () => {
    setDisableDevMode(s => !s);
  }

  const onToggleSmooth = () => {
    if (window.document.body.classList.contains('font-smoothing')) {
      setSelectedSmoothing(false);
      window.document.body.classList.remove('font-smoothing');
    } else {
      setSelectedSmoothing(true);
      window.document.body.classList.add('font-smoothing');
    }
  };

  useEffect(() => {
    window.document.body.classList.add('font-smoothing');
  }, []);

  const C = Component as FunctionComponent;

  return (
    <>
      {/* @ts-ignore */}
      <ClerkProvider
        appearance={{
          theme: styleReset ? [experimental__simple, themes[selectedTheme]] : themes[selectedTheme],
          variables: {
            colorPrimary: primaryColor,
          },
          layout: {
            animations,
            unsafe_disableDevelopmentModeWarnings: disableDevMode,
          },
        }}
        {...pageProps}
        waitlistUrl='/waitlist'
      >
        <AppBar
          onChangeTheme={e => setSelectedTheme(e.target.value as any)}
          onToggleDark={onToggleDark}
          onToggleSmooth={onToggleSmooth}
          onResetStyles={() => setStyleReset(s => !s)}
          onToggleAnimations={onToggleAnimations}
          devMode={disableDevMode}
          onToggleDevMode={onToggleDevMode}
          animations={animations}
          styleReset={styleReset}
          smooth={selectedSmoothing}
          onPrimaryColorChange={setPrimaryColor}
        />
        <C {...pageProps} />
      </ClerkProvider>
    </>
  );
}

type AppBarProps = {
  onChangeTheme: React.ChangeEventHandler<HTMLSelectElement>;
  onToggleDark: React.MouseEventHandler<HTMLButtonElement>;
  onToggleSmooth: React.MouseEventHandler<HTMLButtonElement>;
  onResetStyles: React.MouseEventHandler<HTMLButtonElement>;
  onToggleAnimations: React.MouseEventHandler<HTMLButtonElement>;
  onToggleDevMode: React.MouseEventHandler<HTMLButtonElement>;
  smooth: boolean;
  styleReset: boolean;
  animations: boolean;
  devMode: boolean;
  onPrimaryColorChange: (primaryColor: string | undefined) => void;
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
      <button onClick={props.onToggleDark} type='button'>toggle dark mode</button>
      <button onClick={props.onToggleSmooth} type='button'>font-smoothing: {props.smooth ? 'On' : 'Off'}</button>
      <div style={{ position: 'fixed', left: '10px', bottom: '10px', display: 'inline-flex', gap: '10px' }}>
        <button onClick={props.onResetStyles} type='button'>simple styles: {props.styleReset ? 'On' : 'Off'}</button>
        <button onClick={props.onToggleAnimations} type='button'>animations: {props.animations ? 'On' : 'Off'}</button>
        <button onClick={props.onToggleDevMode} type='button'>dev mode: {props.devMode ? 'On' : 'Off'}</button>
      </div>
      <input
        type='color'
        onChange={e => props.onPrimaryColorChange(e.target.value)}
      />
      <UserButton />

      {/* @ts-ignore */}
      <SignedIn>
        <SignOutButton />
      </SignedIn>

      {/* @ts-ignore */}
      <SignedOut>
        <SignInButton mode={'modal'} />
      </SignedOut>
    </div>
  );
};

export default MyApp;
