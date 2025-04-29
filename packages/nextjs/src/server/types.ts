import type { AuthObject } from '@clerk/backend';
import type { SessionTokenType, TokenType } from '@clerk/backend/internal';
import type { IncomingMessage } from 'http';
import type { NextApiRequest } from 'next';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import type { NextMiddleware, NextRequest } from 'next/server';

// Request contained in GetServerSidePropsContext, has cookies but not query
type GsspRequest = IncomingMessage & { cookies: NextApiRequestCookies };

export type RequestLike = NextRequest | NextApiRequest | GsspRequest;

export type NextMiddlewareRequestParam = Parameters<NextMiddleware>['0'];
export type NextMiddlewareEvtParam = Parameters<NextMiddleware>['1'];
export type NextMiddlewareReturn = ReturnType<NextMiddleware>;

export type InferAuthObjectFromTokenArray<
  T extends readonly TokenType[],
  SessionType extends AuthObject,
  MachineType extends AuthObject,
> = SessionTokenType extends T[number]
  ? T[number] extends SessionTokenType
    ? SessionType
    : SessionType | (MachineType & { tokenType: T[number] })
  : MachineType & { tokenType: T[number] };

export type InferAuthObjectFromToken<
  T extends TokenType,
  SessionType extends AuthObject,
  MachineType extends AuthObject,
> = T extends SessionTokenType ? SessionType : MachineType & { tokenType: T };
