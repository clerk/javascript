import { getAuth } from './getAuth';
import { buildRequestLike } from './utils';

export const auth = () => {
  return getAuth(buildRequestLike());
};
