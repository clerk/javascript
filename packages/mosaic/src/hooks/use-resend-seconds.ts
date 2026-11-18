import { useNow } from './use-now';

export function useResendSeconds(resendAvailableAt: number | undefined, maxSeconds: number): number {
  const now = useNow({ updateInterval: resendAvailableAt === undefined ? undefined : 1000, until: resendAvailableAt });
  // We clamp this to the cooldown because the first render after locking resend
  // will have the old `now` state set, which would result in a value above it.
  // There are other solutions like reading Date.now() in render and letting the
  // interval only retrigger render, but that makes the render impure which is
  // something the React compiler would warn about.
  // useSyncExternalStore feels unnecessarily complex here
  return resendAvailableAt === undefined
    ? 0
    : Math.min(maxSeconds, Math.max(0, Math.ceil((resendAvailableAt - now.getTime()) / 1000)));
}
