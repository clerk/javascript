import { useClerk, useUser } from '@clerk/react';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CLERK_CLIENT_JWT_KEY } from '../constants';
import { tokenCache } from '../token-cache';
import { ClerkExpoModule as ClerkExpo, isNativeSupported } from '../utils/native-module';

// Raw result from native module (may vary by platform)
interface NativeSessionResult {
  sessionId?: string;
  session?: { id: string };
  user?: { id: string; firstName?: string; lastName?: string; imageUrl?: string; primaryEmailAddress?: string };
}

function getInitials(user: { firstName?: string; lastName?: string } | null): string {
  if (user?.firstName) {
    const first = user.firstName.charAt(0).toUpperCase();
    const last = user.lastName?.charAt(0).toUpperCase() || '';
    return first + last;
  }
  return 'U';
}

interface NativeUser {
  id: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  primaryEmailAddress?: string;
}

/**
 * Props for the UserButton component.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserButtonProps {}

/**
 * A pre-built native button component that displays the user's avatar and opens their profile.
 *
 * `UserButton` renders a circular button showing the user's profile image (or initials if
 * no image is available). When tapped, it presents the native profile management modal.
 *
 * Sign-out is detected automatically and synced with the JS SDK, causing `useAuth()` to
 * update reactively. Use `useAuth()` in a `useEffect` to react to sign-out.
 *
 * @example Basic usage in a header
 * ```tsx
 * import { UserButton } from '@clerk/expo/native';
 *
 * export default function Header() {
 *   return (
 *     <View style={styles.header}>
 *       <Text style={styles.title}>My App</Text>
 *       <UserButton />
 *     </View>
 *   );
 * }
 * ```
 *
 * @example Reacting to sign-out
 * ```tsx
 * import { UserButton } from '@clerk/expo/native';
 * import { useAuth } from '@clerk/expo';
 *
 * export default function Header() {
 *   const { isSignedIn } = useAuth();
 *
 *   useEffect(() => {
 *     if (!isSignedIn) router.replace('/sign-in');
 *   }, [isSignedIn]);
 *
 *   return <UserButton style={{ width: 40, height: 40 }} />;
 * }
 * ```
 *
 * @see {@link UserProfileView} The profile view that opens when tapped
 * @see {@link https://clerk.com/docs/components/user/user-button} Clerk UserButton Documentation
 */
export function UserButton(_props: UserButtonProps) {
  const [nativeUser, setNativeUser] = useState<NativeUser | null>(null);
  const presentingRef = useRef(false);
  const clerk = useClerk();
  // Use the reactive user hook from clerk-react to observe sign-out state changes
  const { user: clerkUser } = useUser();

  // Fetch native user data on mount and when clerk user changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!isNativeSupported || !ClerkExpo?.getSession) {
        return;
      }

      try {
        const result = (await ClerkExpo.getSession()) as NativeSessionResult | null;
        const hasSession = !!(result?.sessionId || result?.session?.id);
        if (hasSession && result?.user) {
          setNativeUser(result.user);
        } else {
          // Clear local state if no native session
          setNativeUser(null);
        }
      } catch (err) {
        if (__DEV__) {
          console.error('[UserButton] Error fetching user:', err);
        }
      }
    };

    void fetchUser();
  }, [clerkUser?.id]); // Re-fetch when clerk user changes (including sign-out)

  // Derive the user to display - prefer native data, fall back to clerk-react data
  const user: NativeUser | null =
    nativeUser ??
    (clerkUser
      ? {
          id: clerkUser.id,
          firstName: clerkUser.firstName ?? undefined,
          lastName: clerkUser.lastName ?? undefined,
          imageUrl: clerkUser.imageUrl ?? undefined,
          primaryEmailAddress: clerkUser.primaryEmailAddress?.emailAddress,
        }
      : null);

  const handlePress = async () => {
    if (presentingRef.current) {
      return;
    }

    if (!isNativeSupported || !ClerkExpo?.presentUserProfile) {
      return;
    }

    presentingRef.current = true;
    try {
      // Track whether native had a session before the modal, so we can distinguish
      // "user signed out from within the modal" from "native never had a session".
      let hadNativeSessionBefore = false;

      // If native doesn't have a session but JS does (e.g. user signed in via custom form),
      // sync the JS SDK's bearer token to native and wait for it before presenting.
      if (clerkUser && ClerkExpo?.getSession && ClerkExpo?.configure) {
        const preCheck = (await ClerkExpo.getSession()) as NativeSessionResult | null;
        hadNativeSessionBefore = !!(preCheck?.sessionId || preCheck?.session?.id);

        if (__DEV__) {
          console.log('[UserButton] handlePress - preCheck:', JSON.stringify(preCheck));
          console.log('[UserButton] handlePress - hadNativeSessionBefore:', hadNativeSessionBefore);
        }

        if (!hadNativeSessionBefore) {
          const bearerToken = (await tokenCache?.getToken(CLERK_CLIENT_JWT_KEY)) ?? null;
          if (__DEV__) {
            console.log(
              '[UserButton] handlePress - bearerToken:',
              bearerToken ? `present(${bearerToken.length} chars)` : 'null',
            );
          }
          if (bearerToken) {
            if (__DEV__) {
              console.log('[UserButton] handlePress - calling configure()...');
            }
            await ClerkExpo.configure(clerk.publishableKey, bearerToken);
            if (__DEV__) {
              console.log('[UserButton] handlePress - configure() done');
            }

            // Re-check if configure produced a session
            const postConfigure = (await ClerkExpo.getSession()) as NativeSessionResult | null;
            hadNativeSessionBefore = !!(postConfigure?.sessionId || postConfigure?.session?.id);
            if (__DEV__) {
              console.log('[UserButton] handlePress - post-configure session:', JSON.stringify(postConfigure));
              console.log('[UserButton] handlePress - hadNativeSessionBefore (updated):', hadNativeSessionBefore);
            }
          }
        }
      }

      if (__DEV__) {
        console.log('[UserButton] handlePress - calling presentUserProfile()...');
      }
      await ClerkExpo.presentUserProfile({
        dismissable: true,
      });
      if (__DEV__) {
        console.log('[UserButton] handlePress - presentUserProfile() returned');
      }

      // Check if native session still exists after modal closes.
      // Only sign out the JS SDK if the native SDK HAD a session before the modal
      // and now it's gone (meaning the user signed out from within the native UI).
      // If native never had a session (e.g. force refresh didn't work), don't sign out JS.
      const sessionCheck = (await ClerkExpo.getSession?.()) as NativeSessionResult | null;
      const hasNativeSession = !!(sessionCheck?.sessionId || sessionCheck?.session?.id);
      if (__DEV__) {
        console.log('[UserButton] handlePress - post-modal sessionCheck:', JSON.stringify(sessionCheck));
        console.log(
          '[UserButton] handlePress - hasNativeSession:',
          hasNativeSession,
          'hadBefore:',
          hadNativeSessionBefore,
        );
      }

      if (!hasNativeSession && hadNativeSessionBefore) {
        if (__DEV__) {
          console.log('[UserButton] handlePress - native session LOST during modal, signing out JS SDK');
        }
        // Clear local state immediately for instant UI feedback
        setNativeUser(null);

        // Clear native session explicitly (may already be cleared, but ensure it)
        try {
          await ClerkExpo.signOut?.();
        } catch (e) {
          if (__DEV__) {
            console.warn('[UserButton] Native signOut error (may already be signed out):', e);
          }
        }

        // Sign out from JS SDK to update isSignedIn state
        if (clerk?.signOut) {
          try {
            await clerk.signOut();
          } catch (e) {
            if (__DEV__) {
              console.warn('[UserButton] JS SDK signOut error:', e);
            }
          }
        }
      } else if (!hasNativeSession) {
        if (__DEV__) {
          console.log('[UserButton] handlePress - native never had session, NOT signing out JS SDK');
        }
      } else {
        if (__DEV__) {
          console.log('[UserButton] handlePress - native session still exists, keeping JS SDK signed in');
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[UserButton] presentUserProfile failed:', error);
      }
    } finally {
      presentingRef.current = false;
    }
  };

  // Show fallback when native modules aren't available
  if (!isNativeSupported || !ClerkExpo) {
    return (
      <View style={styles.button}>
        <Text style={styles.text}>?</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => void handlePress()}
      style={styles.button}
    >
      {user?.imageUrl ? (
        <Image
          source={{ uri: user.imageUrl }}
          style={styles.avatarImage}
        />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  avatar: {
    flex: 1,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
});
