import React from 'react';

import { auth } from './auth';

export function SignedIn(props: React.PropsWithChildren<{}>) {
  const { children } = props;
  const { userId } = auth();
  return userId ? <div>RSC:SignedIn{children}</div> : null;
}

export function SignedOut(props: React.PropsWithChildren<{}>) {
  const { children } = props;
  const { userId } = auth();
  return userId ? null : <div>RSC:SignedOut{children}</div>;
}
