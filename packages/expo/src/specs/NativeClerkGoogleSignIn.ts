import { requireOptionalNativeModule } from 'expo';

type NativeMap = Record<string, unknown>;

interface Spec {
  configure(params: NativeMap): void;
  signIn(params: NativeMap | null): Promise<NativeMap>;
  createAccount(params: NativeMap | null): Promise<NativeMap>;
  presentExplicitSignIn(params: NativeMap | null): Promise<NativeMap>;
  signOut(): Promise<void>;
}

export default requireOptionalNativeModule<Spec>('ClerkGoogleSignIn');
