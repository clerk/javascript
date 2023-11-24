'use client';

import { createClerk as createClerkReact } from '@clerk/clerk-react';

const mockImplementation = (name: string) => {
  throw new Error(`${name} can only be used in a client environment.`);
};

export function createClerk<Role extends string = string, Permission extends string = string>() {
  return {
    ...createClerkReact<Role, Permission>(),
    auth: () => mockImplementation('auth()'),
  };
}
