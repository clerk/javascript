import type { UserResource } from '@clerk/types';
import * as LocalAuthentication from 'expo-local-authentication';
import type { PropsWithChildren } from 'react';
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
// eslint-disable-next-line import/namespace
import { AppState } from 'react-native';
import { MMKV } from 'react-native-mmkv';

import { getClerkInstance } from '../singleton';

export const UserInactivityStore = new MMKV({
  id: 'UserInactivity',
});

// Utility type to check if a type is a function
type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

// Main utility type to exclude function properties
type ExcludeFunctions<T> = {
  [K in keyof T]: IsFunction<T[K]> extends true ? never : T[K];
};

export const UserInactivityContext = createContext<{
  localAuthUser: ExcludeFunctions<UserResource> | null;
}>({
  localAuthUser: null,
});

type LocalAuthProviderProps = {
  lockTimeout?: number;
  // onLockTimeOutReached?: () => void;
  // inactiveScreen?: React.ReactNode;
  lockTimeOutScreen?: React.FunctionComponent<{
    authenticateWithBiometrics: () => Promise<boolean>;
    localAuthUser: ExcludeFunctions<UserResource>;
  }>;
};
// export const useUserInactivity = () => useContext(UserInactivityContext);

export function LocalAuthProvider(props: PropsWithChildren<LocalAuthProviderProps>): JSX.Element {
  const {
    children,
    lockTimeout = 1000 * 10,
    // onLockTimeOutReached,
    lockTimeOutScreen: LockTimeOutScreen,
  } = props;
  const lockTimeoutRef = useRef(lockTimeout);
  // const onLockTimeOutReachedRef = useRef(onLockTimeOutReached);
  const appState = useRef(AppState.currentState);
  const [localUser, setLocalUser] = useState<ExcludeFunctions<UserResource> | null>(null);
  const getElapsed = useCallback(() => {
    const hasUser = !!JSON.parse(UserInactivityStore.getString('user') || '')?.id;
    const elapsed = Date.now() - (UserInactivityStore.getNumber('startTime') || 0);

    if (!hasUser) {
      return false;
    }

    return elapsed >= lockTimeoutRef.current;
  }, []);

  const [isLocked, setLocked] = useState(getElapsed());
  // const [isInactive, setInactive] = useState(false);

  const authenticateWithBiometrics = useCallback(async () => {
    const { success } = await LocalAuthentication.authenticateAsync();
    setLocked(!success);
    return success;
  }, []);

  const handleActiveState = useCallback(
    async (skipElapsed = false) => {
      if (!skipElapsed && !getElapsed()) {
        return;
      }

      console.log('is ellapsed');
      setLocked(true);
      // router.replace('/(modals)/lock');
      // if (typeof onLockTimeOutReachedRef.current === 'function') {
      //   onLockTimeOutReachedRef.current();
      // } else {
      await authenticateWithBiometrics();
    },
    [authenticateWithBiometrics, getElapsed],
  );

  useEffect(() => {
    setLocalUser(JSON.parse(UserInactivityStore.getString('user') || '') || {});
    void handleActiveState(true);
  }, [handleActiveState]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'inactive') {
        console.log('--- to inactive');
        // setInactive(true);
        UserInactivityStore.set('user', JSON.stringify(getClerkInstance().user || ''));
      } else {
        // setInactive(false);
      }

      if (nextAppState === 'background') {
        console.log('--- to background');
        UserInactivityStore.set('user', JSON.stringify(getClerkInstance().user || ''));
        recordStartTime();
      } else if (nextAppState === 'active' && appState.current.match(/background/i)) {
        console.log('--- active');

        setLocalUser(JSON.parse(UserInactivityStore.getString('user') || '') || {});
        void handleActiveState();
      }

      appState.current = nextAppState;
    });

    return () => {
      sub.remove();
    };
  }, [handleActiveState]);

  const recordStartTime = () => {
    UserInactivityStore.set('startTime', Date.now());
  };

  return (
    <UserInactivityContext.Provider
      value={{
        localAuthUser: localUser,
      }}
    >
      {LockTimeOutScreen && isLocked ? (
        <LockTimeOutScreen
          authenticateWithBiometrics={authenticateWithBiometrics}
          localAuthUser={localUser!}
        />
      ) : (
        children
      )}
    </UserInactivityContext.Provider>
  );
}
