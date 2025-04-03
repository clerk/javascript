// const myHook = new ExampleHook();
// hooks.registerBeforeRequestHook(myHook);

// import { HTTPClient } from "../lib/http";
import {
  AfterErrorContext,
  AfterErrorHook,
  // Awaitable,
  // AfterSuccessContext,
  // AfterSuccessHook,
  BeforeRequestContext,
  BeforeRequestHook,
  // SDKInitHook,
  // SDKInitOptions,
} from './types.js';

export const API_URL = 'https://api.clerk.com';
export const API_VERSION = 'v1';
export const SUPPORTED_BAPI_VERSION = '2024-10-01';
export const USER_AGENT = '@clerk/backend@0.0.0-test'; // TODO: Replace with the actual user agent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`

export class BeforeRequest implements BeforeRequestHook {
  beforeRequest(ctx: BeforeRequestContext, req: Request): Request {
    if (this.assertSecretKeyIsRequired(ctx, req)) {
      // TODO: Do we need to remove Authorization header if /accountless_applications?
      // this.assertSecretKeyIsPresent(ctx);
      // console.log('assertSecretKeyIsPresent');
    }

    req.headers.set('Clerk-API-Version', SUPPORTED_BAPI_VERSION);
    req.headers.set('User-Agent', USER_AGENT); // TODO: Set appropriate user agent

    return req;
  }

  private assertSecretKeyIsRequired(_ctx: BeforeRequestContext, req: Request) {
    // ALT: if (ctx.operationID === "createAccountlessApplication")
    return !new URL(req.url).pathname.startsWith('/v1/accountless_applications');
  }

  // private assertSecretKeyIsPresent(ctx: BeforeRequestContext) {
  //   // ctx.operationID = "assertSecretKeyIsPresent";

  //   const secretKey =
  //     ctx.resolvedSecurity?.oauth2.type === "secret_key"
  //       ? ctx.resolvedSecurity?.oauth2.secretKey
  //       : undefined;

  //   if (!secretKey || typeof secretKey !== "string") {
  //     throw Error(
  //       "Missing Clerk Secret Key. Go to https://dashboard.clerk.com and get your key for your instance."
  //     );
  //   }
  // }
}

export class AfterError implements AfterErrorHook {
  afterError(
    _ctx: AfterErrorContext,
    response: Response | null,
    error: unknown,
  ): { response: Response | null; error: unknown } {
    return {
      response,
      error: {
        status: response?.status || 500,
        statusText: response?.statusText || '',
        clerkTraceId: this.getTraceId(error, response?.headers),
        retryAfter: this.getRetryAfter(response?.headers),
      },
    };
  }

  private getTraceId(data: unknown, headers?: Headers): string {
    if (data && typeof data === 'object' && 'clerk_trace_id' in data && typeof data.clerk_trace_id === 'string') {
      return data.clerk_trace_id;
    }

    const cfRay = headers?.get('cf-ray');
    return cfRay || '';
  }

  private getRetryAfter(headers?: Headers): number | undefined {
    const retryAfter = headers?.get('Retry-After');
    if (!retryAfter) return;
  
    const value = parseInt(retryAfter, 10);
    if (isNaN(value)) return;
  
    return value;
  }
}
