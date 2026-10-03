import type { ReactNode, RefObject } from 'react';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';
import { Linking, StyleSheet, View } from 'react-native';

export type UserProfileCustomPageIcon =
  | 'user'
  | 'profile'
  | 'security'
  | 'settings'
  | 'billing'
  | 'key'
  | 'lock'
  | 'email'
  | 'phone'
  | 'add'
  | 'switch'
  | 'users'
  | 'warning'
  | 'info'
  | 'globe'
  | 'folder'
  | 'book';

export type UserProfileSection = 'profile' | 'account';

export type UserProfileRow = 'manageAccount' | 'security' | 'switchAccount' | 'addAccount' | 'signOut';

export type UserProfileCustomPagePlacement =
  | { type: 'sectionStart'; section: UserProfileSection }
  | { type: 'sectionEnd'; section: UserProfileSection }
  | { type: 'before'; row: UserProfileRow }
  | { type: 'after'; row: UserProfileRow };

interface UserProfileCustomDestinationBase {
  /** Unique path used to identify and navigate to the page. */
  path: string;

  /** Text displayed in the native navigation title and, for root pages, the profile row. */
  label: string;
}

interface UserProfileCustomPageBase extends UserProfileCustomDestinationBase {
  /** Icon displayed in the native user profile row. */
  icon?: UserProfileCustomPageIcon;

  /** Where the row is inserted relative to Clerk's built-in rows. */
  placement?: UserProfileCustomPagePlacement;
}

/** A custom page rendered from the root of the native user profile. */
export type UserProfileCustomPage = UserProfileCustomPageBase &
  (
    | {
        /** React Native content rendered when the row is selected. */
        content: ReactNode;
        href?: never;
      }
    | {
        /** URL opened when the row is selected. */
        href: string;
        content?: never;
      }
  );

/** A custom destination reached by pushing from another custom user profile page. */
export type UserProfileCustomDestination = UserProfileCustomDestinationBase & {
  /** React Native content rendered when the destination is pushed. */
  content: ReactNode;
};

type UserProfileCustomRoute = UserProfileCustomPage | UserProfileCustomDestination;

export type UserProfileCustomPageEvent = Readonly<{
  type: 'presented' | 'dismissed';
  path: string;
}>;

/** Navigation available to content rendered by a custom user profile page. */
export interface UserProfileCustomPageNavigation {
  /** Navigates back one screen in the native user profile. */
  navigateBack: () => Promise<void>;

  /** Returns to the root user profile screen. */
  popToRoot: () => Promise<void>;

  /**
   * Pushes another registered custom page or custom destination by path.
   * Rejects when that path is already active in the navigation stack.
   */
  push: (path: string) => Promise<void>;
}

export interface NativeUserProfileNavigationHandle {
  navigateCustomPage: (action: 'back' | 'popToRoot' | 'push', path?: string) => Promise<void>;
}

const UserProfileCustomPageNavigationContext = createContext<UserProfileCustomPageNavigation | null>(null);

/** Returns navigation actions for the currently rendered custom user profile destination. */
export function useUserProfileCustomPageNavigation(): UserProfileCustomPageNavigation {
  const navigation = useContext(UserProfileCustomPageNavigationContext);

  if (!navigation) {
    throw new Error('useUserProfileCustomPageNavigation must be used inside a custom user profile page.');
  }

  return navigation;
}

export function serializeUserProfileCustomPages(
  customPages: UserProfileCustomPage[],
  customDestinations: UserProfileCustomDestination[] = [],
): string {
  const paths = new Set<string>();

  for (const { path } of [...customPages, ...customDestinations]) {
    if (paths.has(path)) {
      throw new Error(`User profile custom page path "${path}" must be unique.`);
    }

    paths.add(path);
  }

  return JSON.stringify([
    ...customPages.map(page => ({
      path: page.path,
      label: page.label,
      icon: page.icon ?? 'settings',
      placement: page.placement ?? { type: 'sectionEnd', section: 'profile' },
    })),
    ...customDestinations.map(destination => ({
      path: destination.path,
      label: destination.label,
      icon: 'settings',
      placement: { type: 'sectionEnd', section: 'profile' },
      showAsRow: false,
    })),
  ]);
}

export function useUserProfileCustomPages(
  customRoutes: UserProfileCustomRoute[],
  navigationHandleRef: RefObject<NativeUserProfileNavigationHandle | null>,
) {
  const [presentedPaths, setPresentedPaths] = useState<ReadonlySet<string>>(() => new Set());
  const presentedPathStack = useRef<string[]>([]);
  const isPoppingToRoot = useRef(false);
  const openingPaths = useRef(new Set<string>());

  const updatePresentedPaths = useCallback((update: (paths: string[]) => string[]) => {
    const currentPaths = presentedPathStack.current;
    const nextPaths = update(currentPaths);

    if (nextPaths === currentPaths) {
      return;
    }

    presentedPathStack.current = nextPaths;
    setPresentedPaths(new Set(nextPaths));
  }, []);

  const onCustomPageEvent = useCallback(
    (event: NativeSyntheticEvent<UserProfileCustomPageEvent>) => {
      const { path, type } = event.nativeEvent;

      if (type === 'dismissed') {
        updatePresentedPaths(currentPaths => {
          const pathIndex = currentPaths.lastIndexOf(path);
          if (pathIndex === -1) {
            return currentPaths;
          }

          if (isPoppingToRoot.current) {
            isPoppingToRoot.current = false;
            return [];
          }

          // Native navigation stops rendering pages that are covered by a push. Keep
          // those pages mounted until they are actually removed from the back stack.
          if (pathIndex !== currentPaths.length - 1) {
            return currentPaths;
          }

          return currentPaths.slice(0, pathIndex);
        });
        return;
      }

      const page = customRoutes.find(candidate => candidate.path === path);
      if (!page) {
        return;
      }

      updatePresentedPaths(currentPaths => (currentPaths.includes(path) ? currentPaths : [...currentPaths, path]));

      if ('href' in page && page.href) {
        if (openingPaths.current.has(path)) {
          return;
        }

        openingPaths.current.add(path);
        void Linking.openURL(page.href)
          .catch(error => {
            console.warn(`Could not open custom user profile page "${path}".`, error);
          })
          .finally(() => {
            openingPaths.current.delete(path);
            void navigationHandleRef.current?.navigateCustomPage('back');
          });
        return;
      }
    },
    [customRoutes, navigationHandleRef, updatePresentedPaths],
  );

  const navigation = useMemo<UserProfileCustomPageNavigation>(
    () => ({
      navigateBack: () => navigationHandleRef.current?.navigateCustomPage('back') ?? Promise.resolve(),
      popToRoot: () => {
        const navigationHandle = navigationHandleRef.current;
        if (!navigationHandle) {
          return Promise.resolve();
        }

        isPoppingToRoot.current = presentedPathStack.current.length > 0;
        return navigationHandle.navigateCustomPage('popToRoot').catch(error => {
          isPoppingToRoot.current = false;
          throw error;
        });
      },
      push: path => {
        const navigationHandle = navigationHandleRef.current;
        if (!navigationHandle) {
          return Promise.resolve();
        }

        if (!customRoutes.some(route => route.path === path)) {
          return Promise.reject(
            new Error(`No custom user profile page or destination is registered for path "${path}".`),
          );
        }

        if (presentedPathStack.current.includes(path)) {
          return Promise.reject(
            new Error(`Custom user profile page or destination "${path}" is already in the navigation stack.`),
          );
        }

        updatePresentedPaths(currentPaths => [...currentPaths, path]);

        return navigationHandle.navigateCustomPage('push', path).catch(error => {
          updatePresentedPaths(currentPaths =>
            currentPaths[currentPaths.length - 1] === path ? currentPaths.slice(0, -1) : currentPaths,
          );
          throw error;
        });
      },
    }),
    [customRoutes, navigationHandleRef, updatePresentedPaths],
  );

  return { navigation, presentedPaths, onCustomPageEvent };
}

export function UserProfileCustomPageHosts({
  customRoutes,
  presentedPaths,
  navigation,
  style,
}: {
  customRoutes: UserProfileCustomRoute[];
  presentedPaths: ReadonlySet<string>;
  navigation: UserProfileCustomPageNavigation;
  style?: StyleProp<ViewStyle>;
}) {
  return customRoutes.map(page => (
    <View
      key={page.path}
      collapsable={false}
      style={[styles.destination, style]}
    >
      <UserProfileCustomPageNavigationContext.Provider value={navigation}>
        {presentedPaths.has(page.path) && 'content' in page ? page.content : null}
      </UserProfileCustomPageNavigationContext.Provider>
    </View>
  ));
}

const styles = StyleSheet.create({
  destination: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
