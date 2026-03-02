import type { TurboModule } from 'react-native';
// UnsafeObject is the standard React Native TurboModule type for passing arbitrary
// JS objects across the bridge. It is not Clerk-specific — see React Native codegen docs.
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypesNamespace';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  presentAuth(options: UnsafeObject): Promise<UnsafeObject>;
  presentUserProfile(options: UnsafeObject): Promise<UnsafeObject | null>;
  getSession(): Promise<UnsafeObject | null>;
  getClientToken(): Promise<string | null>;
  signOut(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('ClerkExpo');
