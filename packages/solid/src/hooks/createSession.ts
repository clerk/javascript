import type { ActiveSessionResource } from '@clerk/types';
import type { Accessor } from 'solid-js';

import { useSessionContext } from '../contexts/SessionContext';

type UseSessionReturn =
  | { isLoaded: false; isSignedIn: undefined; session: undefined }
  | { isLoaded: true; isSignedIn: false; session: null }
  | { isLoaded: true; isSignedIn: true; session: ActiveSessionResource };

type CreateSession = () => Accessor<UseSessionReturn>;

export const createSession: CreateSession = () => {
  const session = useSessionContext();
  return () => {
    const sess = session();
    if (sess === undefined) {
      return { isLoaded: false, isSignedIn: undefined, session: undefined };
    } else if (sess === null) {
      return { isLoaded: true, isSignedIn: false, session: null };
    } else {
      return { isLoaded: true, isSignedIn: true, session: sess };
    }
  };
};
