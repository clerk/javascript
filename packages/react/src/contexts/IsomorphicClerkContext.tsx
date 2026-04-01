import { useClerkInstanceContext } from '@clerk/shared/react';

import type { IsomorphicClerk } from '../isomorphicClerk';

export const useIsomorphicClerkContext = useClerkInstanceContext as unknown as () => IsomorphicClerk;
