import type { AuthObject } from '@clerk/backend/internal';
import { notFound, redirect } from 'next/navigation';

import { authAuthHeaderMissing } from '../../server/errors';
import { buildClerkProps, createGetAuth } from '../../server/getAuth';
import type { AuthProtect } from '../../server/protect';
import { createProtect } from '../../server/protect';
import { buildRequestLike } from './utils';

export const auth = (): AuthObject & { protect: AuthProtect } => {
  const authObject = createGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(),
  })(buildRequestLike());

  return Object.assign(authObject, { protect: createProtect({ notFound, redirect, authObject }) });
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
