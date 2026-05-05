import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypesNamespace';

export interface Spec extends TurboModule {
  configure(publishableKey: string, bearerToken: string | null): Promise<void>;
  presentAuth(options: UnsafeObject): Promise<UnsafeObject>;
  presentUserProfile(options: UnsafeObject): Promise<UnsafeObject | null>;
  getSession(): Promise<UnsafeObject | null>;
  getClientToken(): Promise<string | null>;
  signOut(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('ClerkExpo');
