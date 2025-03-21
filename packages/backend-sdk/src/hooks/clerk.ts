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
  SDKInitHook,
  SDKInitOptions,
} from './types.js';

export const API_URL = 'https://api.clerk.com';
export const API_VERSION = 'v1';
export const SUPPORTED_BAPI_VERSION = '2024-10-01';
export const USER_AGENT = 'clerk-sdk-ts@0.0.1'; // TODO: Replace with the actual user agent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`

export class BeforeRequest implements BeforeRequestHook {
  beforeRequest(ctx: BeforeRequestContext, req: Request): Request {
    if (this.assertSecretKeyIsRequired(ctx, req)) {
      // TODO: Do we need to remove Authorization header if /accountless_applications?
      // this.assertSecretKeyIsPresent(ctx);

      console.log('assertSecretKeyIsPresent');
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
    // TODO: Remap error to ClerkError?

    return { response, error };
  }
}

export class InitSDK implements SDKInitHook {
  // beforeRequest(
  //   hookCtx: BeforeRequestContext,
  //   request: Request
  // ): Promise<Request> {
  //   request.headers.set("X-Example-Header", "example-value");
  //   return Promise.resolve(request);
  // }

  // beforeRequest(hookCtx: BeforeRequestContext, request: Request): Request {
  //   request.headers.set("Clerk-API-Version", SUPPORTED_BAPI_VERSION);
  //   request.headers.set("User-Agent", USER_AGENT);

  //   // Set the Authorization header, if secret key is passed
  //   const authHeader = `Bearer ${process.env["CLERK_SECRET_KEY"]}`;
  //   request.headers.set("Authorization", authHeader);

  //   return request;
  // }

  sdkInit(opts: SDKInitOptions): SDKInitOptions {
    const { baseURL, client } = opts;

    // modify the baseURL or wrap the client used by the SDK here and return the updated values
    return { baseURL: baseURL, client: client };
  }
}

// export class ExampleHook
//   implements SDKInitHook, BeforeRequestHook, AfterSuccessHook, AfterErrorHook
// {
//   sdkInit(opts: SDKInitOptions): SDKInitOptions {
//     const { baseURL, client } = opts;

//     // modify the baseURL or wrap the client used by the SDK here and return the updated values
//     return { baseURL: baseURL, client: client };
//   }

//   beforeRequest(hookCtx: BeforeRequestContext, request: Request): Request {
//     // modify the request object before it is sent, such as adding headers or query parameters, or throw an error to stop the request from being sent
//     return request;
//   }

//   afterSuccess(hookCtx: AfterSuccessContext, response: Response): Response {
//     // modify the response object before deserialization or throw an error to stop the response from being deserialized
//     return response;
//   }

//   afterError(
//     hookCtx: AfterErrorContext,
//     response: Response | null,
//     error: unknown,
//   ): { response: Response | null; error: unknown } {
//     // modify the response before it is deserialized as a custom error or the error object before it is returned or throw an error to stop processing of other error hooks and return early
//     return { response, error };
//   }
// }
