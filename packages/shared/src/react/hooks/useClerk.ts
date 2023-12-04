import type { LoadedClerk } from '@clerk/types';

import { useClerkInstanceContext } from '../contexts';

export const useClerk: () => LoadedClerk = useClerkInstanceContext;
