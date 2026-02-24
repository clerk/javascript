import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  configure(params: object): void;
  signIn(params: object | null): Promise<object>;
  createAccount(params: object | null): Promise<object>;
  presentExplicitSignIn(params: object | null): Promise<object>;
  signOut(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ClerkGoogleSignIn');
