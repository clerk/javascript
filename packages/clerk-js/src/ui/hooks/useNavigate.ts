import React from 'react';
import { useCoreClerk } from 'ui/contexts';
import { RouteContext } from 'ui/router';

export function useNavigate(): { navigate: any } {
  const Clerk = useCoreClerk();
  const router = React.useContext(RouteContext);

  const navigate = router?.navigate || Clerk.navigate;
  return { navigate };
}
