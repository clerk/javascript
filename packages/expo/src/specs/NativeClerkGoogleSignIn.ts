import type { TurboModule } from 'react-native';
// UnsafeObject is the standard React Native TurboModule type for passing arbitrary
// JS objects across the bridge. It is not Clerk-specific — see React Native codegen docs.
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypesNamespace';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  configure(params: UnsafeObject): void;
  signIn(params: UnsafeObject | null): Promise<UnsafeObject>;
  createAccount(params: UnsafeObject | null): Promise<UnsafeObject>;
  presentExplicitSignIn(params: UnsafeObject | null): Promise<UnsafeObject>;
  signOut(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ClerkGoogleSignIn');
