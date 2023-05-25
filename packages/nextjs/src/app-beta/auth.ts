import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

import { buildClerkProps, getAuth } from '../server';

const buildRequestLike = () => {
  return new NextRequest('https://fooplaceholder.com', { headers: headers() });
};

export const auth = () => {
  return getAuth(buildRequestLike());
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
