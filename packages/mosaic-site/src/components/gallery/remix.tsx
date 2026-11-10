'use client';
import * as React from 'react';

import { useQueryParam } from '@/components/gallery/touch-mode';
import { parseRemix, REMIX_MESSAGE, type RemixId } from '@/lib/components/remix';

const subscribeRemix = (listener: () => void) => {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-remix'] });
  return () => observer.disconnect();
};
export function useRemixValue(): RemixId {
  return React.useSyncExternalStore(
    subscribeRemix,
    () => parseRemix(document.documentElement.dataset.remix),
    () => 'default',
  );
}
export function useApplyRemix(remix: RemixId) {
  React.useEffect(() => {
    const root = document.documentElement;
    if (remix === 'default') {
      delete root.dataset.remix;
    } else {
      root.dataset.remix = remix;
    }
    return () => {
      delete root.dataset.remix;
    };
  }, [remix]);
}
export function RemixReceiver() {
  const initial = parseRemix(useQueryParam('remix'));
  const [override, setOverride] = React.useState<RemixId | null>(null);
  const remix = override ?? initial;
  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== REMIX_MESSAGE) {
        return;
      }
      setOverride(parseRemix(event.data.remix));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  useApplyRemix(remix);
  return null;
}
