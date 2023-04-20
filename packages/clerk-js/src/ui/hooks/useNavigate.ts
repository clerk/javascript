import React from 'react';

import { useCoreClerk } from '../contexts';
import { RouteContext } from '../router';

// FIXME: When you remove this return type and use TypeScript inference, it will show errors throughout the codebase.
export function useNavigate(): { navigate: any } {
  const Clerk = useCoreClerk();
  const router = React.useContext(RouteContext);

  const navigate = router?.navigate || Clerk.navigate;
  return { navigate };
}
