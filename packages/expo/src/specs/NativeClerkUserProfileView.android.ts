import { requireNativeView } from 'expo';
import type { ComponentType, RefAttributes } from 'react';
import type { NativeSyntheticEvent, ViewProps } from 'react-native';

type ProfileEvent = Readonly<{ type: string }>;
type NavigationChangeEvent = Readonly<{ depth: number; canGoBack: boolean }>;

interface NativeProps extends ViewProps {
  isDismissible?: boolean;
  hideHeader?: boolean;
  onProfileEvent?: (event: NativeSyntheticEvent<ProfileEvent>) => void;
  onNavigationChange?: (event: NativeSyntheticEvent<NavigationChangeEvent>) => void;
}

export interface NativeClerkUserProfileViewRef {
  goBack: () => Promise<void>;
  popToRoot: () => Promise<void>;
}

export default requireNativeView<NativeProps>('ClerkUserProfileView') as ComponentType<
  NativeProps & RefAttributes<NativeClerkUserProfileViewRef>
>;
