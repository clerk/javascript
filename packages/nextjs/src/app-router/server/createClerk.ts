import type { useAuth } from '../../client-boundary/hooks';
import { auth } from './auth';
import { experimental__Gate } from './controlComponents';

const mockImplementation = (name: string) => {
  throw new Error(`${name} can only be used in a server environment.`);
};

export function createClerk<Role extends string = string, Permission extends string = string>() {
  return {
    Gate: experimental__Gate<Role, Permission>,
    auth: auth<Role, Permission>,
    useAuth: (() => mockImplementation('useAuth()')) as typeof useAuth<Role, Permission>,
  };
}
