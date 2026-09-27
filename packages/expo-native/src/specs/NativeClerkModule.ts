import { requireOptionalNativeModule } from 'expo';

import type { Spec } from './NativeClerkModule.types';

// Optional so it resolves to null in Expo Go instead of throwing at import time.
export default requireOptionalNativeModule<Spec>('ClerkExpo');
