import type { ComponentType } from 'react';
import { requireNativeView } from 'expo';
import { Platform, requireNativeComponent, type ViewProps } from 'react-native';

type NativeViewName = 'ClerkAuthView' | 'ClerkUserButtonView' | 'ClerkUserProfileView';

export function getNativeClerkView<TProps extends ViewProps>(name: NativeViewName): ComponentType<TProps> | null {
  try {
    if (Platform.OS === 'android') {
      return requireNativeView<TProps>(name);
    }

    return requireNativeComponent<TProps>(name);
  } catch {
    return null;
  }
}
