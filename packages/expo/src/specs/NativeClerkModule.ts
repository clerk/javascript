import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  presentAuth(options: Object): Promise<Object>;
  presentUserProfile(options: Object): Promise<Object | null>;
  getSession(): Promise<Object | null>;
  getClientToken(): Promise<string | null>;
  signOut(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('ClerkExpo');
