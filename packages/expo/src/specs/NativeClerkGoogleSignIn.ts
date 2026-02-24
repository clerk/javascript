import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  configure(params: Object): void;
  signIn(params: Object | null): Promise<Object>;
  createAccount(params: Object | null): Promise<Object>;
  presentExplicitSignIn(params: Object | null): Promise<Object>;
  signOut(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ClerkGoogleSignIn');
