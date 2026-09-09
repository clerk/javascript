import type { Clerk } from '@clerk/shared/types';

/** A resource projection over the supplied owner; never constructs or loads Clerk. */
export declare function attachResourceCore(
  clerk: Clerk,
  emit: (message: unknown) => void,
  options?: { namespace?: string },
): { receive(encoded: string): void; dispose(): void };
