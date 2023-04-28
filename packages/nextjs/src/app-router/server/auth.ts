import { buildClerkProps, getAuth } from '../../server/getAuth';
import { buildRequestLike } from './utils';

export const auth = () => {
  return getAuth(buildRequestLike());
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
