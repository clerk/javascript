import {
  ClerkProvider,
  isClerkAPIResponseError,
  useAuth,
  useClerk,
  useSession,
  useSignIn,
  useSignUp,
  useUser,
} from '@clerk/expo';
import { AuthView, UserButton, UserProfileView, useAuthViewState } from '@clerk/expo/native';
import { tokenCache } from '@clerk/expo/token-cache';
import { type ReactNode, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

import { CustomSignIn } from '../screens/CustomSignIn';
import { CustomSignUp } from '../screens/CustomSignUp';
import { Sso } from '../screens/Sso';
import { TokenCache } from '../screens/TokenCache';
import { publishableKeyFailure, type VerifyFailure, type VerifyLaunch, type VerifyScreen } from './launch';
import { type VerifyState, verifyStateJson, type VerifyTicket } from './state';

type HostProps = { launch: VerifyLaunch; home: ReactNode };

export function VerifyHost({ launch, home }: HostProps) {
  const keyFailure = publishableKeyFailure(launch.publishableKey);
  if (keyFailure) {
    return (
      <ConfigurationFailure
        launch={launch}
        failure={keyFailure}
      />
    );
  }

  return (
    <ClerkProvider
      publishableKey={launch.publishableKey}
      tokenCache={tokenCache}
    >
      <RoutedHost
        launch={launch}
        home={home}
      />
    </ClerkProvider>
  );
}

export function logRequests() {
  const send = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? (input instanceof Request ? input.method : 'GET');
    const line = `[verify:network] ${method} ${url.split('?')[0]}`;
    try {
      const response = await send(input, init);
      console.log(`${line} ${response.status}`);
      return response;
    } catch (error) {
      console.log(`${line} failed`);
      throw error;
    }
  };
}

function failureFrom(error: unknown, fallbackCode: string): VerifyFailure {
  if (isClerkAPIResponseError(error) && error.errors[0]) {
    const [first] = error.errors;
    return { code: first.code, message: first.longMessage ?? first.message };
  }
  return { code: fallbackCode, message: error instanceof Error ? error.message : String(error) };
}

function useClerkStatus() {
  const clerk = useClerk();
  const subscribe = useCallback(
    (onChange: () => void) => {
      clerk.on('status', onChange);
      return () => clerk.off('status', onChange);
    },
    [clerk],
  );
  return useSyncExternalStore(subscribe, () => clerk.status);
}

function RoutedHost({ launch, home }: HostProps) {
  const status = useClerkStatus();
  const { isLoaded, orgId } = useAuth({ treatPendingAsSignedOut: false });
  const { user } = useUser();
  const { session } = useSession();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const authView = useAuthViewState();
  const [requestedScreen, setRequestedScreen] = useState<VerifyScreen>(launch.screen);
  const [ticket, setTicket] = useState<VerifyTicket>(launch.signInTicket ? 'pending' : 'none');
  const [lastError, setLastError] = useState<VerifyFailure | null>(null);
  const ticketStarted = useRef(false);

  useEffect(() => {
    if (status !== 'error') {
      return;
    }
    setLastError({ code: 'environment_load_failed', message: 'Clerk failed to load the environment.' });
    setTicket(current => (current === 'pending' ? 'failed' : current));
  }, [status]);

  useEffect(() => {
    const signInTicket = launch.signInTicket;
    if (!signInTicket || !isLoaded || ticketStarted.current) {
      return;
    }
    ticketStarted.current = true;

    const signInWithTicket = async () => {
      const created = await signIn.ticket({ ticket: signInTicket });
      if (created.error) {
        throw created.error;
      }
      const finalized = await signIn.finalize();
      if (finalized.error) {
        throw finalized.error;
      }
    };

    signInWithTicket().then(
      () => setTicket('succeeded'),
      (error: unknown) => {
        setLastError(failureFrom(error, 'ticket_sign_in_failed'));
        setTicket('failed');
      },
    );
  }, [isLoaded, launch.signInTicket, signIn]);

  const showHome = () => setRequestedScreen('home');
  const screen: VerifyScreen | null =
    ticket === 'pending' ? null : requestedScreen === 'auth' && authView.isAuthFlowComplete ? 'home' : requestedScreen;

  const state: VerifyState = {
    v: 1,
    runId: launch.runId,
    launchId: launch.launchId,
    screen: screen ?? 'launching',
    environmentLoaded: isLoaded,
    signedIn: Boolean(user),
    userId: user?.id ?? null,
    sessionId: session?.id ?? null,
    sessionStatus: session?.status === 'active' || session?.status === 'pending' ? session.status : null,
    pendingTasks: session?.tasks?.map(task => task.key) ?? [],
    orgId: orgId ?? null,
    signInStatus: signIn.id ? signIn.status : null,
    signUpStatus: signUp.id ? signUp.status : null,
    ticket,
    lastError: lastError ?? launch.screenFailure,
    extra: { authViewLoaded: authView.isLoaded, authFlowComplete: authView.isAuthFlowComplete },
  };

  return (
    <VerifyFrame state={state}>
      {screen === null ? (
        <ActivityIndicator style={styles.fill} />
      ) : (
        <Screen
          screen={screen}
          launch={launch}
          home={home}
          onShowHome={showHome}
        />
      )}
    </VerifyFrame>
  );
}

function Screen({ screen, launch, home, onShowHome }: HostProps & { screen: VerifyScreen; onShowHome: () => void }) {
  switch (screen) {
    case 'home':
      return home;
    case 'auth':
      return (
        <AuthView
          mode={launch.authMode}
          isDismissible={false}
        />
      );
    case 'nativeAuth':
      return (
        <AuthView
          mode={launch.authMode}
          onDismiss={onShowHome}
        />
      );
    case 'userButton':
      return <UserButtonScreen />;
    case 'userProfile':
      return <UserProfileView isDismissible={false} />;
    case 'customSignIn':
      return <CustomSignIn />;
    case 'customSignUp':
      return <CustomSignUp />;
    case 'sso':
      return <Sso />;
    case 'tokenCache':
      return <TokenCache />;
  }
}

function UserButtonScreen() {
  const { isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  return (
    <View style={styles.centered}>
      {isSignedIn ? <UserButton /> : <Text testID='verify.userButton.signedOut'>Signed out</Text>}
    </View>
  );
}

function ConfigurationFailure({ launch, failure }: { launch: VerifyLaunch; failure: VerifyFailure }) {
  const [ticket, setTicket] = useState<VerifyTicket>(launch.signInTicket ? 'pending' : 'none');

  useEffect(() => {
    setTicket(current => (current === 'pending' ? 'failed' : current));
  }, []);

  const state: VerifyState = {
    v: 1,
    runId: launch.runId,
    launchId: launch.launchId,
    screen: 'error',
    environmentLoaded: false,
    signedIn: false,
    userId: null,
    sessionId: null,
    sessionStatus: null,
    pendingTasks: [],
    orgId: null,
    signInStatus: null,
    signUpStatus: null,
    ticket,
    lastError: failure,
    extra: {},
  };

  return (
    <VerifyFrame state={state}>
      <View style={styles.centered}>
        <Text>{failure.message}</Text>
      </View>
    </VerifyFrame>
  );
}

function VerifyFrame({ state, children }: { state: VerifyState; children: ReactNode }) {
  const json = verifyStateJson(state);

  useEffect(() => {
    console.log(`[verify] ${json}`);
  }, [json]);

  return (
    <View style={styles.fill}>
      <View style={styles.fill}>{children}</View>
      <Text
        testID='verify.state'
        style={styles.footer}
      >{`verify ${json}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  fill: {
    flex: 1,
  },
  footer: {
    color: '#6B6B76',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    fontSize: 9,
    paddingBottom: Platform.select({ ios: 28, default: 12 }),
    paddingHorizontal: 12,
    paddingTop: 6,
  },
});
