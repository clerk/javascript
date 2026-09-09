import { requireOptionalNativeModule } from 'expo';
import type { NativeAuthFlowModule, NativeResourceModule } from './NativeClerkModule.types';

export interface Spec extends NativeAuthFlowModule, NativeResourceModule {}

export default requireOptionalNativeModule<Spec>('ClerkExpo');
