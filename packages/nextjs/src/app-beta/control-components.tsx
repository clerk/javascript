import React from 'react';

import { auth } from './auth';

export function SignedIn({ children }) {
  const { userId } = auth();
  return userId ? <>{children}</> : null;
}

export function SignedOut({ children }) {
  const { userId } = auth();
  return userId ? null : <>{children}</>;
}
