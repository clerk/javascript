import { isClerkAPIResponseError, isClerkRuntimeError } from '@clerk/shared/error';
import type { ClerkAPIError } from '@clerk/shared/types';
import { snakeToCamel } from '@clerk/shared/underscore';

import type { ErrorDescription, MessageValues } from '../../localization';
import type { MosaicIssue } from '../../utils/errors';
import { describeError, MosaicError } from '../../utils/errors';

declare const settled: unique symbol;

/** A model callback's promise. Only `callClerk` makes one, so a Clerk error never reaches a controller. */
export type ClerkCall<T = void> = Promise<T> & { readonly [settled]: true };

export interface CallClerkOptions {
  /** Form fields to match against each issue's `paramName`. An issue that matches none has no `field`. */
  fields?: readonly string[];
  /** Values for the placeholders in each issue's copy, such as a username's length limits. */
  params?: MessageValues;
}

/**
 * Runs a model callback and rejects with a `MosaicError` when Clerk reports a failure. Anything
 * else, such as a `CancelledError` or a code fault, rejects unchanged.
 */
export function callClerk<T>(run: () => Promise<T>, options: CallClerkOptions = {}): ClerkCall<T> {
  return brand(settle(run, options));
}

/** Reads a Clerk error from outside `callClerk`, such as a failed query. Returns what `describeError` returns for a `callClerk` rejection. */
export function describeClerkError(cause: unknown): ErrorDescription {
  return describeError(toMosaicError(cause, {}) ?? cause);
}

async function settle<T>(run: () => Promise<T>, options: CallClerkOptions): Promise<T> {
  try {
    return await run();
  } catch (cause) {
    throw toMosaicError(cause, options) ?? cause;
  }
}

function brand<T>(promise: Promise<T>): ClerkCall<T> {
  // eslint-disable-next-line typescript/consistent-type-assertions -- Minting the brand is the one place a ClerkCall is made.
  return promise as ClerkCall<T>;
}

function toMosaicError(cause: unknown, { fields = [], params }: CallClerkOptions): MosaicError | undefined {
  const [first, ...rest] = toIssues(cause).map(issue => {
    const field = fields.find(name => issue.paramName !== undefined && snakeToCamel(issue.paramName) === name);
    return {
      ...issue,
      ...(params ? { params } : {}),
      ...(field ? { field } : {}),
    };
  });
  return first ? new MosaicError([first, ...rest]) : undefined;
}

function toIssues(cause: unknown): MosaicIssue[] {
  if (!(cause instanceof Error)) {
    return [];
  }
  if (isClerkRuntimeError(cause)) {
    return [{ code: cause.code, ...(cause.longMessage ? { message: cause.longMessage } : {}) }];
  }
  if (!isClerkAPIResponseError(cause)) {
    return [];
  }
  return cause.errors.map((error: ClerkAPIError) => {
    const paramName = error.meta?.paramName;
    return {
      code: error.code,
      ...(paramName ? { paramName } : {}),
      message: error.longMessage || error.message,
    };
  });
}
