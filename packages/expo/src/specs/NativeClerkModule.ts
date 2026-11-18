import { requireOptionalNativeModule } from 'expo';

import type {
  NativeAuthFlowModule,
  NativeClientSyncModule,
  NativeUpdateRequiredViewModule,
} from './NativeClerkModule.types';

export interface Spec
  extends NativeAuthFlowModule, Partial<NativeClientSyncModule>, Partial<NativeUpdateRequiredViewModule> {
  // Exposed by Expo Modules EventEmitter for the internal `clerkNativeClientInvalidated` event.
  // This is not part of the public @clerk/expo API.
  addListener?(eventName: string, listener?: (...args: unknown[]) => void): { remove: () => void };
}

export default requireOptionalNativeModule<Spec>('ClerkExpo');
