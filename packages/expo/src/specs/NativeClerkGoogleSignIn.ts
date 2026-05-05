import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypesNamespace';

export interface Spec extends TurboModule {
  configure(params: UnsafeObject): void;
  signIn(params: UnsafeObject | null): Promise<UnsafeObject>;
  createAccount(params: UnsafeObject | null): Promise<UnsafeObject>;
  presentExplicitSignIn(params: UnsafeObject | null): Promise<UnsafeObject>;
  signOut(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('ClerkGoogleSignIn');
