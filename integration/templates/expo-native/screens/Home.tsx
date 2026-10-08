import { useAuth, useSession, useUser } from '@clerk/expo';
import { AuthView, type AuthViewMode, UserButton } from '@clerk/expo/native';
import { type ReactElement, useState } from 'react';
import { Button, Modal, StyleSheet, Text, View } from 'react-native';

import { AuthLogo } from './AuthLogo';
import { type Destination, homeLinksFor } from './destinations';

type HomeProps = { authMode: AuthViewMode; onOpen: (destination: Destination) => void };

export function Home({ authMode, onOpen }: HomeProps): ReactElement {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const { session } = useSession();
  const [authSheet, setAuthSheet] = useState<'closed' | 'plain' | 'withLogo'>('closed');
  const closeAuth = (): void => setAuthSheet('closed');

  const pending = session?.status === 'pending';
  const account = pending ? null : user;
  const activeSession = pending ? null : session;
  const emailAddress = account?.primaryEmailAddress?.emailAddress;

  return (
    <View style={styles.home}>
      {isSignedIn && <UserButton />}
      {(account || activeSession) && (
        <View style={styles.summary}>
          {account && (
            <Text
              testID='e2e.auth.signedIn'
              style={styles.heading}
            >
              {emailAddress ? `Signed in as ${emailAddress}` : 'Signed in'}
            </Text>
          )}
          {account && (
            <View style={styles.detail}>
              <Text style={styles.detailText}>User ID</Text>
              <Text
                testID='e2e.auth.userId'
                style={styles.detailText}
              >
                {account.id}
              </Text>
            </View>
          )}
          {activeSession && (
            <View style={styles.detail}>
              <Text style={styles.detailText}>Session ID</Text>
              <Text
                testID='e2e.auth.sessionId'
                style={styles.detailText}
              >
                {activeSession.id}
              </Text>
            </View>
          )}
        </View>
      )}
      {isSignedIn ? (
        <Button
          testID='e2e.auth.signOut'
          title='Sign out'
          onPress={() => void signOut()}
        />
      ) : (
        <>
          <Text
            testID='e2e.auth.signedOut'
            style={styles.heading}
          >
            Signed out
          </Text>
          <Button
            testID='e2e.auth.signIn'
            title='Sign in'
            onPress={() => setAuthSheet('plain')}
          />
        </>
      )}
      <View style={styles.links}>
        {!isSignedIn && (
          <Button
            testID='e2e.home.authLogo'
            title='Sign in with a logo'
            onPress={() => setAuthSheet('withLogo')}
          />
        )}
        {homeLinksFor(Boolean(isSignedIn)).map(link => (
          <Button
            key={link.opens}
            testID={link.testID}
            title={link.label}
            onPress={() => onOpen(link.opens)}
          />
        ))}
      </View>

      <Modal
        animationType='slide'
        visible={authSheet !== 'closed'}
        presentationStyle='pageSheet'
        onRequestClose={closeAuth}
      >
        <AuthView
          mode={authMode}
          logo={authSheet === 'withLogo' ? <AuthLogo /> : undefined}
          onDismiss={closeAuth}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  detail: {
    flexDirection: 'row',
    gap: 4,
  },
  detailText: {
    color: '#6B6B76',
    fontSize: 13,
  },
  heading: {
    fontSize: 17,
    textAlign: 'center',
  },
  home: {
    alignItems: 'center',
    flex: 1,
    gap: 24,
    justifyContent: 'center',
    padding: 24,
  },
  links: {
    alignItems: 'center',
    gap: 4,
  },
  summary: {
    alignItems: 'center',
    gap: 4,
  },
});
