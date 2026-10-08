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
import { AuthView, useAuthViewState } from '@clerk/expo/native';
import { tokenCache } from '@clerk/expo/token-cache';
import { type ReactElement, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CustomSignIn } from '../screens/CustomSignIn';
import { CustomSignUp } from '../screens/CustomSignUp';
import { type Destination, homeLinksFor } from '../screens/destinations';
import { EmbeddedProfile } from '../screens/EmbeddedProfile';
import { Home } from '../screens/Home';
import { NativeModules } from '../screens/NativeModules';
import { readClientTokenKept, TokenCache } from '../screens/TokenCache';
import { publishableKeyFailure, type VerifyFailure, type VerifyLaunch } from './launch';
import { type VerifyState, verifyStateJson, type VerifyTicket } from './state';

type HostProps = { launch: VerifyLaunch };
type RoutedHostProps = HostProps & { clientTokenKeptAtLaunch: Promise<boolean> };

export function VerifyHost({ launch }: HostProps): ReactElement {
  const [clientTokenKeptAtLaunch] = useState(readClientTokenKept);
  const failure = publishableKeyFailure(launch.publishableKey);
  if (failure) {
    return (
      <ConfigurationFailure
        launch={launch}
        failure={failure}
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
        clientTokenKeptAtLaunch={clientTokenKeptAtLaunch}
      />
    </ClerkProvider>
  );
}

export function logRequests(): void {
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

function useClerkStatus(): ReturnType<typeof useClerk>['status'] {
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

function useVerifyLog(state: VerifyState): void {
  const json = verifyStateJson(state);

  useEffect(() => {
    console.log(`[verify] ${json}`);
  }, [json]);
}

function RoutedHost({ launch, clientTokenKeptAtLaunch }: RoutedHostProps): ReactElement {
  const status = useClerkStatus();
  const { isLoaded, isSignedIn, orgId } = useAuth();
  const { user } = useUser();
  const { session } = useSession();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const authView = useAuthViewState();
  const [opened, setOpened] = useState<Destination | null>(null);
  const goHome = useCallback(() => setOpened(null), []);
  const [ticket, setTicket] = useState<VerifyTicket>(launch.signInTicket ? 'pending' : 'none');
  const [failure, setFailure] = useState<VerifyFailure | null>(null);
  const ticketStarted = useRef(false);

  useEffect(() => {
    if (status !== 'error') {
      return;
    }
    setFailure({ code: 'environment_load_failed', message: 'Clerk failed to load the environment.' });
    setTicket(current => (current === 'pending' ? 'failed' : current));
  }, [status]);

  useEffect(() => {
    const signInTicket = launch.signInTicket;
    if (!signInTicket || !isLoaded || ticketStarted.current) {
      return;
    }
    ticketStarted.current = true;

    const signInWithTicket = async (): Promise<void> => {
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
        setFailure(failureFrom(error, 'ticket_sign_in_failed'));
        setTicket('failed');
      },
    );
  }, [isLoaded, launch.signInTicket, signIn]);

  const showsAuthView = opened === 'auth' || opened === 'nativeAuth';
  const finished = showsAuthView
    ? authView.isAuthFlowComplete
    : !homeLinksFor(Boolean(isSignedIn)).some(link => link.opens === opened);
  const left = opened !== null && finished;

  useEffect(() => {
    if (left) {
      goHome();
    }
  }, [goHome, left]);

  const screen = ((): Destination | 'home' | 'loading' => {
    if (!isLoaded || ticket === 'pending') {
      return 'loading';
    }
    if (opened === null || left) {
      return 'home';
    }
    return showsAuthView && !authView.isLoaded ? 'loading' : opened;
  })();

  useVerifyLog({
    runId: launch.runId,
    launchId: launch.launchId,
    screen: failure ? 'error' : screen === 'loading' ? 'launching' : screen,
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
    lastError: failure,
    extra: { authViewLoaded: authView.isLoaded, authFlowComplete: authView.isAuthFlowComplete },
  });

  if (failure) {
    return <LaunchError failure={failure} />;
  }

  switch (screen) {
    case 'loading':
      return <ActivityIndicator style={styles.fill} />;
    case 'home':
      return (
        <Home
          authMode={launch.authMode}
          onOpen={setOpened}
        />
      );
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
          onDismiss={goHome}
        />
      );
    case 'customSignIn':
      return <CustomSignIn />;
    case 'customSignUp':
      return <CustomSignUp />;
    case 'tokenCache':
      return <TokenCache keptAtLaunch={clientTokenKeptAtLaunch} />;
    case 'embeddedProfile':
      return <EmbeddedProfile onHostBack={goHome} />;
    case 'nativeModules':
      return <NativeModules />;
  }
}

function ConfigurationFailure({ launch, failure }: HostProps & { failure: VerifyFailure }): ReactElement {
  useVerifyLog({
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
    ticket: launch.signInTicket ? 'failed' : 'none',
    lastError: failure,
    extra: {},
  });

  return <LaunchError failure={failure} />;
}

function LaunchError({ failure }: { failure: VerifyFailure }): ReactElement {
  return (
    <View style={styles.centered}>
      <Text
        testID='e2e.launch.error'
        style={styles.error}
      >
        <Text style={styles.errorTitle}>Something went wrong</Text>
        {`\n${failure.message}`}
      </Text>
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
  error: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  errorTitle: {
    fontWeight: '600',
  },
  fill: {
    flex: 1,
  },
});
