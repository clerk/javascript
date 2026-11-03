import { useEffect, useState } from 'react';

export function useResendSeconds(resendAvailableAt: number | undefined, maxSeconds: number): number {
  const [now, setNow] = useState(() => Date.now());
  // We clamp this to the cooldown because the first render after locking resend
  // will have the old `now` state set, which would result in a value above it.
  // There are other solutions like reading Date.now() in render and letting the
  // interval only retrigger render, but that makes the render impure which is
  // something the React compiler would warn about.
  // useSyncExternalStore feels unnecessarily complex here
  const seconds =
    resendAvailableAt === undefined
      ? 0
      : Math.min(maxSeconds, Math.max(0, Math.ceil((resendAvailableAt - now) / 1000)));
  const countingDown = seconds > 0;

  useEffect(() => {
    if (!countingDown) {
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [countingDown, resendAvailableAt]);

  return seconds;
}
