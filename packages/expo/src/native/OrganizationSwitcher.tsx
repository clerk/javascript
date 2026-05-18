import { useCallback } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import NativeClerkOrganizationSwitcher from '../specs/NativeClerkOrganizationSwitcher';
import { isNativeSupported } from '../utils/native-module';

export interface OrganizationSwitcherProps {
  /**
   * Hide the personal account row inside the switcher.
   *
   * iOS only today. Android's prebuilt switcher does not currently expose a
   * personal-account row; this prop is a no-op there. Once clerk-android's
   * MOBILE-497 parity work lands, the prop will apply on both platforms.
   *
   * @default false
   */
  hidePersonal?: boolean;

  /**
   * Invoked after the active organization changes.
   *
   * `organizationId` is the new active organization's id, or `null` when the
   * user switched to their personal account.
   */
  onOrganizationChanged?: (event: { organizationId: string | null }) => void;

  /**
   * Style applied to the container view.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A pre-built native control for switching the active organization.
 *
 * `OrganizationSwitcher` renders inline within your React Native view hierarchy,
 * powered by:
 * - **iOS**: clerk-ios (SwiftUI) — https://github.com/clerk/clerk-ios
 * - **Android**: clerk-android (Jetpack Compose) — https://github.com/clerk/clerk-android
 *
 * The switcher only renders when Organizations are enabled in the Clerk
 * environment and a user is signed in. Use `useOrganization()` to react to
 * organization changes in JS.
 *
 * @example
 * ```tsx
 * import { OrganizationSwitcher } from '@clerk/expo/native';
 *
 * export default function Header() {
 *   return <OrganizationSwitcher />;
 * }
 * ```
 *
 * @see {@link https://clerk.com/docs/components/organization/organization-switcher} Clerk OrganizationSwitcher Documentation
 */
export function OrganizationSwitcher({
  hidePersonal = false,
  onOrganizationChanged,
  style,
}: OrganizationSwitcherProps) {
  const handleOrganizationEvent = useCallback(
    (event: { nativeEvent: { type: string; data: string } }) => {
      const { type, data: rawData } = event.nativeEvent;
      if (type !== 'organizationChanged') {
        return;
      }

      let parsed: { organizationId?: string | null } = {};
      try {
        parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
      } catch {
        // Malformed payload — surface a null change so consumers can refresh.
      }

      onOrganizationChanged?.({ organizationId: parsed.organizationId ?? null });
    },
    [onOrganizationChanged],
  );

  if (!isNativeSupported || !NativeClerkOrganizationSwitcher) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.text}>
          {!isNativeSupported
            ? 'Native OrganizationSwitcher is only available on iOS and Android'
            : 'Native OrganizationSwitcher requires the @clerk/expo plugin. Add "@clerk/expo" to your app.json plugins array.'}
        </Text>
      </View>
    );
  }

  return (
    <NativeClerkOrganizationSwitcher
      style={[styles.nativeDefault, style]}
      hidePersonal={hidePersonal}
      onOrganizationEvent={handleOrganizationEvent}
    />
  );
}

const styles = StyleSheet.create({
  // Without an explicit size, the underlying RN view has zero height — the
  // SwiftUI / Compose content overflows visually but taps fall through to
  // the parent. Consumers can override via the `style` prop.
  nativeDefault: {
    alignSelf: 'stretch',
    minHeight: 56,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
});
