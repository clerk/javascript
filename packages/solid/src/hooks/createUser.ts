import type { UserResource } from '@clerk/types';
import type { Accessor } from 'solid-js';

import { useUserContext } from '../contexts/UserContext';

type UseUserReturn =
  | { isLoaded: false; isSignedIn: undefined; user: undefined }
  | { isLoaded: true; isSignedIn: false; user: null }
  | { isLoaded: true; isSignedIn: true; user: UserResource };

export function createUser(): Accessor<UseUserReturn> {
  const user = useUserContext();
  return () => {
    const us = user();
    if (us === undefined) {
      return { isLoaded: false, isSignedIn: undefined, user: undefined };
    } else if (us === null) {
      return { isLoaded: true, isSignedIn: false, user: null };
    } else {
      return { isLoaded: true, isSignedIn: true, user: us };
    }
  };
}
