import { requireNativeView } from 'expo';
import type { ComponentType, RefAttributes } from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';

type AuthEvent = Readonly<{ type: string }>;
type NavigationChangeEvent = Readonly<{ depth: number; canGoBack: boolean }>;

interface NativeProps extends ViewProps {
  mode?: string;
  isDismissible?: boolean;
  logoMaxHeight?: number;
  hideHeader?: boolean;
  onAuthEvent?: (event: NativeSyntheticEvent<AuthEvent>) => void;
  onNavigationChange?: (event: NativeSyntheticEvent<NavigationChangeEvent>) => void;
}

export interface NativeClerkAuthViewRef {
  goBack: () => Promise<void>;
  popToRoot: () => Promise<void>;
}

export default requireNativeView<NativeProps>('ClerkAuthView') as ComponentType<
  NativeProps & RefAttributes<NativeClerkAuthViewRef>
>;
