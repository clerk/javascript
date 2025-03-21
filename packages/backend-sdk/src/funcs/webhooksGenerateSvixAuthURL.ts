/*
 * Code generated by Speakeasy (https://speakeasy.com). DO NOT EDIT.
 */

import { ClerkCore } from '../core.js';
import * as M from '../lib/matchers.js';
import { compactMap } from '../lib/primitives.js';
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
import { APICall, APIPromise } from '../types/async.js';
import { Result } from '../types/fp.js';

/**
 * Create a Svix Dashboard URL
 *
 * @remarks
 * Generate a new url for accessing the Svix's management dashboard for that particular instance
 */
export function webhooksGenerateSvixAuthURL(
  client: ClerkCore,
  options?: RequestOptions,
): APIPromise<
  Result<
    components.SvixURL,
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
  return new APIPromise($do(client, options));
}

async function $do(
  client: ClerkCore,
  options?: RequestOptions,
): Promise<
  [
    Result<
      components.SvixURL,
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
  const path = pathToFunc('/webhooks/svix_url')();

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
    operationID: 'GenerateSvixAuthURL',
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
      method: 'POST',
      baseURL: options?.serverURL,
      path: path,
      headers: headers,
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
    errorCodes: ['400', '4XX', '5XX'],
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
    components.SvixURL,
    | errors.ClerkErrors
    | APIError
    | SDKValidationError
    | UnexpectedClientError
    | InvalidRequestError
    | RequestAbortedError
    | RequestTimeoutError
    | ConnectionError
  >(
    M.json(200, components.SvixURL$inboundSchema),
    M.jsonErr(400, errors.ClerkErrors$inboundSchema),
    M.fail('4XX'),
    M.fail('5XX'),
  )(response, { extraFields: responseFields });
  if (!result.ok) {
    return [result, { status: 'complete', request: req, response }];
  }

  return [result, { status: 'complete', request: req, response }];
}
