import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

import { getAuthEdge } from '../server/getAuthEdge';
import { buildClerkProps } from '../server/utils/getAuth';

const buildRequestLike = () => {
  return new NextRequest('https://placeholder.com', { headers: headers() });
};

export const auth = () => {
  return getAuthEdge(buildRequestLike());
};

export const initialState = () => {
  return buildClerkProps(buildRequestLike());
};
