import type { DefaultBodyType, HttpResponseResolver, PathParams } from 'msw';
import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const globalHandlers: any[] = [];

export const server = setupServer(...globalHandlers);

// A higher-order response resolver that validates the request headers before proceeding
export function validateHeaders(resolver: HttpResponseResolver): HttpResponseResolver<PathParams, DefaultBodyType> {
  return input => {
    const { request } = input;

    if (!request.headers.get('Authorization')) {
      return HttpResponse.json(
        {
          error: 'Unauthorized',
          message: 'Missing Authorization header',
        },
        { status: 401 },
      );
    }
    if (!request.headers.get('Clerk-API-Version')) {
      return HttpResponse.json(
        {
          error: 'Bad request',
          message: 'Missing Clerk-API-Version header',
        },
        { status: 400 },
      );
    }
    if (!request.headers.get('User-Agent') || request.headers.get('User-Agent') !== '@clerk/backend@0.0.0-test') {
      return HttpResponse.json(
        {
          error: 'Bad request',
          message: 'Missing or invalid User-Agent header',
        },
        { status: 400 },
      );
    }

    return resolver(input);
  };
}
