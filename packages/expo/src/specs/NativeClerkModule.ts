import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  presentAuth(options: object): Promise<object>;
  presentUserProfile(options: object): Promise<object | null>;
  getSession(): Promise<object | null>;
  getClientToken(): Promise<string | null>;
  signOut(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ClerkExpo');
