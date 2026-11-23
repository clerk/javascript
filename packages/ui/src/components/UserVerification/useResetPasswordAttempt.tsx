import type { ReverificationResult } from '@clerk/shared/types';
import React, { createContext, type PropsWithChildren, useContext, useRef } from 'react';

type ResetPasswordAttempt = NonNullable<ReverificationResult['passwordReset']>;

const ResetPasswordAttemptContext = createContext<React.MutableRefObject<ResetPasswordAttempt | undefined> | null>(
  null,
);

/**
 * Holds the new password sent with the last reset password code attempt, so the
 * verification result can report it after the second factor, on another route.
 */
export const ResetPasswordAttemptProvider = ({ children }: PropsWithChildren) => {
  const ref = useRef<ResetPasswordAttempt>();
  return <ResetPasswordAttemptContext.Provider value={ref}>{children}</ResetPasswordAttemptContext.Provider>;
};

/** `null` outside the UserVerification routes, e.g. when a card renders on its own in tests. */
export const useResetPasswordAttempt = () => useContext(ResetPasswordAttemptContext);
