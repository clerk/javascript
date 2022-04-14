import type { Session, User } from '@clerk/backend-core';
import type { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { ServerGetToken } from '@clerk/types';

export type WithEdgeMiddlewareAuthOptions = {
  loadUser?: boolean;
  loadSession?: boolean;
  authorizedParties?: string[];
  jwtKey?: string;
};

export type WithEdgeMiddlewareAuthCallback<Return, Options> = (
  req: RequestWithAuth<Options>,
  event: NextFetchEvent,
) => Return;

export type WithEdgeMiddlewareAuthMiddlewareResult<CallbackReturn, Options> = (
  req: RequestWithAuth<Options>,
  event: NextFetchEvent,
) => Promise<Awaited<CallbackReturn>>;
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

export type RequestWithAuth<Options extends WithEdgeMiddlewareAuthOptions = any> = NextRequest & {
  auth: EdgeMiddlewareAuth;
} & (Options extends { loadSession: true } ? { session: Session | null } : {}) &
  (Options extends { loadUser: true } ? { user: User | null } : {});

type NextMiddlewareReturnOptions = NextResponse | Response | null | undefined;
export type NextMiddlewareResult = NextMiddlewareReturnOptions;

export type WithAuthNextMiddlewareHandler<Options> = (
  req: RequestWithAuth<Options>,
  event: NextFetchEvent,
) => NextMiddlewareResult | Promise<NextMiddlewareResult>;

export type EdgeMiddlewareAuth = {
  sessionId: string | null;
  userId: string | null;
  getToken: ServerGetToken;
};

export type AuthData = {
  sessionId: string | null;
  session: Session | undefined | null;
  userId: string | null;
  user: User | undefined | null;
  getToken: ServerGetToken;
};
