import type { AuthObject } from '@clerk/backend';
import { makeAuthObjectSerializable, stripPrivateDataFromObject } from '@clerk/backend/internal';
import type { InitialState } from '@clerk/shared/types';
import type { H3Event } from 'h3';
import { getRequestHeaders, getRequestProtocol } from 'h3';

/**
 * Converts an H3 event into a Fetch Request object.
 */
export function toWebRequest(event: H3Event) {
  const headers = getRequestHeaders(event) as HeadersInit;
  const protocol = getRequestProtocol(event);
  const dummyOriginReqUrl = new URL(event.node.req.url || '', `${protocol}://clerk-dummy`);
  return new Request(dummyOriginReqUrl, {
    method: event.method,
    headers: new Headers(headers),
  });
}

export function createInitialState(auth: AuthObject) {
  const initialState = makeAuthObjectSerializable(stripPrivateDataFromObject(auth));
  return initialState as unknown as InitialState;
}
