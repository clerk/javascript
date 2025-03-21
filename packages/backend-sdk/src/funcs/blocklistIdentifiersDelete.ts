/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { ClerkCore } from '../core.js';
import { encodeSimple } from '../lib/encodings.js';
import * as M from '../lib/matchers.js';
import { compactMap } from '../lib/primitives.js';
import { safeParse } from '../lib/schemas.js';
import { RequestOptions } from '../lib/sdks.js';
import { extractSecurity, resolveGlobalSecurity } from '../lib/security.js';
import { pathToFunc } from '../lib/url.js';
import * as components from '../models/components/index.js';
import { APIError } from '../models/errors/apierror.js';
import {
  ConnectionError,
  InvalidRequestError,
  RequestAbortedError,
  RequestTimeoutError,
  UnexpectedClientError,
} from '../models/errors/httpclienterrors.js';
import * as errors from '../models/errors/index.js';
import { SDKValidationError } from '../models/errors/sdkvalidationerror.js';
import * as operations from '../models/operations/index.js';
import { APICall, APIPromise } from '../types/async.js';
import { Result } from '../types/fp.js';

/**
 * Delete identifier from block-list
 *
 * @remarks
 * Delete an identifier from the instance block-list
 */
export function blocklistIdentifiersDelete(
  client: ClerkCore,
  request: operations.DeleteBlocklistIdentifierRequest,
  options?: RequestOptions,
): APIPromise<
  Result<
    components.DeletedObject,
    | errors.ClerkErrors
    | APIError
    | SDKValidationError
    | UnexpectedClientError
    | InvalidRequestError
    | RequestAbortedError
    | RequestTimeoutError
    | ConnectionError
  >
> {
  return new APIPromise($do(client, request, options));
}

async function $do(
  client: ClerkCore,
  request: operations.DeleteBlocklistIdentifierRequest,
  options?: RequestOptions,
): Promise<
  [
    Result<
      components.DeletedObject,
      | errors.ClerkErrors
      | APIError
      | SDKValidationError
      | UnexpectedClientError
      | InvalidRequestError
      | RequestAbortedError
      | RequestTimeoutError
      | ConnectionError
    >,
    APICall,
  ]
> {
  const parsed = safeParse(
    request,
    value => operations.DeleteBlocklistIdentifierRequest$outboundSchema.parse(value),
    'Input validation failed',
  );
  if (!parsed.ok) {
    return [parsed, { status: 'invalid' }];
  }
  const payload = parsed.value;
  const body = null;

  const pathParams = {
    identifier_id: encodeSimple('identifier_id', payload.identifier_id, {
      explode: false,
      charEncoding: 'percent',
    }),
  };

  const path = pathToFunc('/blocklist_identifiers/{identifier_id}')(pathParams);

  const headers = new Headers(
    compactMap({
      Accept: 'application/json',
    }),
  );

  const secConfig = await extractSecurity(client._options.bearerAuth);
  const securityInput = secConfig == null ? {} : { bearerAuth: secConfig };
  const requestSecurity = resolveGlobalSecurity(securityInput);

  const context = {
    baseURL: options?.serverURL ?? client._baseURL ?? '',
    operationID: 'DeleteBlocklistIdentifier',
    oAuth2Scopes: [],

    resolvedSecurity: requestSecurity,

    securitySource: client._options.bearerAuth,
    retryConfig: options?.retries ||
      client._options.retryConfig || {
        strategy: 'backoff',
        backoff: {
          initialInterval: 500,
          maxInterval: 60000,
          exponent: 1.5,
          maxElapsedTime: 3600000,
        },
        retryConnectionErrors: true,
      } || { strategy: 'none' },
    retryCodes: options?.retryCodes || ['5XX'],
  };

  const requestRes = client._createRequest(
    context,
    {
      security: requestSecurity,
      method: 'DELETE',
      baseURL: options?.serverURL,
      path: path,
      headers: headers,
      body: body,
      timeoutMs: options?.timeoutMs || client._options.timeoutMs || -1,
    },
    options,
  );
  if (!requestRes.ok) {
    return [requestRes, { status: 'invalid' }];
  }
  const req = requestRes.value;

  const doResult = await client._do(req, {
    context,
    errorCodes: ['402', '404', '4XX', '5XX'],
    retryConfig: context.retryConfig,
    retryCodes: context.retryCodes,
  });
  if (!doResult.ok) {
    return [doResult, { status: 'request-error', request: req }];
  }
  const response = doResult.value;

  const responseFields = {
    HttpMeta: { Response: response, Request: req },
  };

  const [result] = await M.match<
    components.DeletedObject,
    | errors.ClerkErrors
    | APIError
    | SDKValidationError
    | UnexpectedClientError
    | InvalidRequestError
    | RequestAbortedError
    | RequestTimeoutError
    | ConnectionError
  >(
    M.json(200, components.DeletedObject$inboundSchema),
    M.jsonErr([402, 404], errors.ClerkErrors$inboundSchema),
    M.fail('4XX'),
    M.fail('5XX'),
  )(response, { extraFields: responseFields });
  if (!result.ok) {
    return [result, { status: 'complete', request: req, response }];
  }

  return [result, { status: 'complete', request: req, response }];
}
