import { useClerk } from '@clerk/expo';
import { useAuthenticatedWebView } from '@clerk/expo/native-to-web';
import { type ReactElement, useRef, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

type WebUser = { status: 'loading' } | { status: 'signedIn'; userId: string } | { status: 'signedOut' };
type WebSession = WebUser | { status: 'failed'; code: string };
type WebUserReport = { load: number; userId: string | null };
type ClerkWithEnvironment = { __internal_environment?: { displayConfig: { homeUrl: string } } | null };

function readWebUser(load: number): string {
  return `(async () => {
    const deadline = Date.now() + 15000;
    while (!window.Clerk?.loaded && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({ load: ${load}, userId: window.Clerk?.user?.id ?? null }));
  })();
  true;`;
}

function accountPortalUserPage(clerk: unknown): string {
  const homeUrl = (clerk as ClerkWithEnvironment).__internal_environment?.displayConfig.homeUrl;
  return homeUrl ? `${new URL(homeUrl).origin}/user` : '';
}

export function NativeToWeb({ onDone }: { onDone: () => void }): ReactElement {
  const clerk = useClerk();
  const webView = useRef<WebView>(null);
  const latestLoad = useRef(0);
  const [webUser, setWebUser] = useState<WebUser>({ status: 'loading' });
  const web = useAuthenticatedWebView({
    destination: accountPortalUserPage(clerk),
    onLoadEnd: () => {
      latestLoad.current += 1;
      webView.current?.injectJavaScript(readWebUser(latestLoad.current));
    },
  });
  const session: WebSession = web.status === 'error' ? { status: 'failed', code: web.error.code } : webUser;

  const onMessage = (event: WebViewMessageEvent): void => {
    const report = JSON.parse(event.nativeEvent.data) as WebUserReport;
    if (report.load !== latestLoad.current) {
      return;
    }
    setWebUser(report.userId === null ? { status: 'signedOut' } : { status: 'signedIn', userId: report.userId });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Native to Web SSO</Text>
        <Button
          testID='verify.nativeToWeb.done'
          title='Done'
          onPress={onDone}
        />
      </View>
      <View style={styles.status}>
        <WebSessionStatus session={session} />
      </View>
      {web.webViewProps && (
        <WebView
          {...web.webViewProps}
          ref={webView}
          incognito
          onMessage={onMessage}
          style={styles.webView}
        />
      )}
    </View>
  );
}

function WebSessionStatus({ session }: { session: WebSession }): ReactElement {
  switch (session.status) {
    case 'loading':
      return <Text style={styles.statusText}>Loading the Account Portal</Text>;
    case 'signedIn':
      return (
        <View style={styles.detail}>
          <Text style={styles.statusText}>Web user ID</Text>
          <Text
            testID='verify.nativeToWeb.webUserId'
            style={styles.statusText}
          >
            {session.userId}
          </Text>
        </View>
      );
    case 'signedOut':
      return <Text style={styles.statusText}>Signed out on the web</Text>;
    case 'failed':
      return (
        <View style={styles.detail}>
          <Text style={styles.statusText}>Transfer failed</Text>
          <Text
            testID='verify.nativeToWeb.error'
            style={[styles.statusText, styles.error]}
          >
            {session.code}
          </Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  detail: {
    flexDirection: 'row',
    gap: 4,
  },
  error: {
    color: '#D92D20',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  screen: {
    flex: 1,
    gap: 8,
    paddingTop: 64,
  },
  status: {
    paddingHorizontal: 16,
  },
  statusText: {
    fontSize: 13,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
});
