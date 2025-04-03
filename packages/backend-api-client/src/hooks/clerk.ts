import {
  AfterErrorContext,
  AfterErrorHook,
  BeforeRequestContext,
  BeforeRequestHook,
} from './types.js';

export const SUPPORTED_BAPI_VERSION = '2024-10-01';
export const USER_AGENT = '@clerk/backend-api-client@0.0.0-test'; // TODO: Replace with the actual user agent: `${PACKAGE_NAME}@${PACKAGE_VERSION}`

const SKIP_SECRET_KEY_OPERATION_IDS = new Set([
  'CreateAccountlessApplication',
  'CompleteAccountlessApplication',
]);

export class BeforeRequest implements BeforeRequestHook {
  beforeRequest(ctx: BeforeRequestContext, req: Request): Request {
    const secretKeyRequired = this.assertSecretKeyIsRequired(ctx);

    if (secretKeyRequired) {
      this.assertSecretKeyIsPresent(req);
    } else {
      req.headers.delete('Authorization');
    }

    req.headers.set('Clerk-API-Version', SUPPORTED_BAPI_VERSION);
    req.headers.set('User-Agent', USER_AGENT); // TODO: Set appropriate user agent

    return req;
  }

  private assertSecretKeyIsPresent(req: Request) {
    const secretKey = req.headers?.get('Authorization')?.split(' ')[1];
    
    if (!secretKey || typeof secretKey !== 'string') {
      throw Error('Missing Clerk Secret Key. Go to https://dashboard.clerk.com and get your key for your instance.');
    }
  }

  private assertSecretKeyIsRequired(ctx: BeforeRequestContext) {
    return !SKIP_SECRET_KEY_OPERATION_IDS.has(ctx.operationID);
  }
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
