import { authAuthHeaderMissing } from '../../server/errors';
import { buildClerkProps, createGetAuth } from '../../server/getAuth';
import { buildRequestLike } from './utils';

export const auth = () => {
  return createGetAuth({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(),
  })(buildRequestLike());
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
