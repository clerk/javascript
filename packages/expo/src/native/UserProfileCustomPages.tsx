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

interface UserProfileCustomPageBase {
  /** Unique path used to identify and navigate to the page. */
  path: string;

  /** Text displayed in the native user profile row. */
  label: string;

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

  /** Pushes another custom page by path. */
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

export function serializeUserProfileCustomPages(customPages: UserProfileCustomPage[]): string {
  return JSON.stringify(
    customPages.map(page => ({
      path: page.path,
      label: page.label,
      icon: page.icon ?? 'settings',
      placement: page.placement ?? { type: 'sectionEnd', section: 'profile' },
    })),
  );
}

export function useUserProfileCustomPages(
  customPages: UserProfileCustomPage[],
  navigationHandleRef: RefObject<NativeUserProfileNavigationHandle | null>,
) {
  const [activePath, setActivePath] = useState<string>();
  const openingPaths = useRef(new Set<string>());

  const onCustomPageEvent = useCallback(
    (event: NativeSyntheticEvent<UserProfileCustomPageEvent>) => {
      const { path, type } = event.nativeEvent;

      if (type === 'dismissed') {
        setActivePath(currentPath => (currentPath === path ? undefined : currentPath));
        return;
      }

      const page = customPages.find(candidate => candidate.path === path);
      if (!page) {
        return;
      }

      if ('href' in page && page.href) {
        if (openingPaths.current.has(path)) {
          return;
        }

        openingPaths.current.add(path);
        void Linking.openURL(page.href)
          .catch(() => undefined)
          .finally(() => {
            openingPaths.current.delete(path);
            void navigationHandleRef.current?.navigateCustomPage('back');
          });
        return;
      }

      setActivePath(path);
    },
    [customPages, navigationHandleRef],
  );

  return { activePath, onCustomPageEvent };
}

export function UserProfileCustomPageHosts({
  customPages,
  activePath,
  navigationHandleRef,
  style,
}: {
  customPages: UserProfileCustomPage[];
  activePath?: string;
  navigationHandleRef: RefObject<NativeUserProfileNavigationHandle | null>;
  style?: StyleProp<ViewStyle>;
}) {
  const navigation = useMemo<UserProfileCustomPageNavigation>(
    () => ({
      navigateBack: () => navigationHandleRef.current?.navigateCustomPage('back') ?? Promise.resolve(),
      popToRoot: () => navigationHandleRef.current?.navigateCustomPage('popToRoot') ?? Promise.resolve(),
      push: path => navigationHandleRef.current?.navigateCustomPage('push', path) ?? Promise.resolve(),
    }),
    [navigationHandleRef],
  );

  return customPages.map(page => (
    <View
      key={page.path}
      collapsable={false}
      style={[styles.destination, style]}
    >
      <UserProfileCustomPageNavigationContext.Provider value={navigation}>
        {activePath === page.path && 'content' in page ? page.content : null}
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
