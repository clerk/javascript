import { useAuth } from '@clerk/react';
import type { Clerk } from '@clerk/shared/types';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';
import { connectNativeResources } from './nativeResourceConnection';

export function NativeCoreConnection({ clerk }: { clerk: Clerk | null }) {
  const { isLoaded } = useAuth();
  useEffect(() => {
    if (!isLoaded || !clerk?.loaded || !NativeClerkModule) return;
    let cancelled = false;
    let connection: ReturnType<typeof connectNativeResources> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;
    const start = () => {
      if (cancelled || connection) return;
      const next = connectNativeResources(clerk, NativeClerkModule);
      connection = next;
      void (async () => {
        try {
          await next.ready;
          const connectedAt = Date.now();
          await next.closed;
          failures = Date.now() - connectedAt >= 30_000 ? 0 : failures + 1;
        } catch {
          failures++;
        }
        if (cancelled || connection !== next) return;
        connection = undefined;
        if (failures < 3) timer = setTimeout(start, 1000 * 2 ** failures);
        else
          console.error(
            'Clerk native views could not attach to the Expo Clerk instance. Check that the JavaScript and native SDK versions match.',
          );
      })();
    };
    start();
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active' || connection) return;
      if (timer) clearTimeout(timer);
      failures = 0;
      start();
    });
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      subscription.remove();
      connection?.dispose();
    };
  }, [clerk, isLoaded]);
  return null;
}
