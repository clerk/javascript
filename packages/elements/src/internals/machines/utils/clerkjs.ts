import type { Simplify } from 'type-fest';

// ================= Types ================= //

export type ClerkJSEventCategory = 'NAVIGATE';
export type ClerkJSEvent<T extends ClerkJSEventCategory = ClerkJSEventCategory> = `CLERKJS.${T}.${string}`;
export type ClerkJSEventObject<T extends ClerkJSEventCategory = ClerkJSEventCategory> = Simplify<
  Record<string, ClerkJSEvent<T>>
>;
export type ClerkJSEventExtractCategory<S extends string> = S extends `CLERKJS.${infer T}.${string}` ? T : never;

// ================= Type Narrowing ================= //

export function isClerkJSEvent<T extends ClerkJSEventObject<ClerkJSEventExtractCategory<E>>, E extends ClerkJSEvent>(
  eventObj: T,
  event: E,
): event is typeof event {
  return Object.values(eventObj).includes(event as any);
}

// ================= ClerkJSNavigationEvent ================= //

export type ClerkJSNavigationEvent = (typeof ClerkJSNavigationEvent)[keyof typeof ClerkJSNavigationEvent];
export const ClerkJSNavigationEvent: ClerkJSEventObject<'NAVIGATE'> = {
  complete: 'CLERKJS.NAVIGATE.COMPLETE',
  signUp: 'CLERKJS.NAVIGATE.SIGN_UP',
  continue: 'CLERKJS.NAVIGATE.CONTINUE',
  generic: 'CLERKJS.NAVIGATE.GENERIC',
  resetPassword: 'CLERKJS.NAVIGATE.RESET_PASSWORD',
  signIn: 'CLERKJS.NAVIGATE.SIGN_IN',
  verification: 'CLERKJS.NAVIGATE.VERIFICATION',
} as const;

export function isClerkJSNavigationEvent(event: unknown): event is ClerkJSNavigationEvent {
  return isClerkJSEvent(ClerkJSNavigationEvent, event as ClerkJSEvent<'NAVIGATE'>);
}
