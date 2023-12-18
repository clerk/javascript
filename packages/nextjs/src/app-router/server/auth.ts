import type { AuthObject } from '@clerk/backend/internal';

import { authAuthHeaderMissing } from '../../server/errors';
import { buildClerkProps, createGetAuth } from '../../server/getAuth';
import type { AuthProtect } from './protect';
import { createProtect } from './protect';
import { buildRequestLike } from './utils';

export const auth = (): AuthObject & { protect: AuthProtect } => {
  const authObject = createGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(),
  })(buildRequestLike());

  return Object.assign(authObject, { protect: createProtect(authObject) });
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
