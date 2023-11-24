import { authAuthHeaderMissing } from '../../server/errors';
import { buildClerkProps, createGetAuth } from '../../server/getAuth';
import { buildRequestLike } from './utils';

export const auth = <Role extends string = string, Permission extends string = string>() => {
  return createGetAuth<Role, Permission>({
    debugLoggerName: 'auth()',
    noAuthStatusMessage: authAuthHeaderMissing(),
  })(buildRequestLike());
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
