import { RouteContext } from 'ui/router';
import { useCoreClerk } from 'ui/contexts';
import React from 'react';

export function useNavigate(): { navigate: any } {
  const Clerk = useCoreClerk();
  const router = React.useContext(RouteContext);

  const navigate = router?.navigate || Clerk.navigate;
  return { navigate };
}
