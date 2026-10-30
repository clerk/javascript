import { useSyncExternalStore } from 'react';
import { Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';

import type { AppVersionSupportStatus, UpdateRequiredDisplay } from '../app-version/appVersionSupport';
import { getUpdateRequiredDisplay, subscribeToAppVersionSupport } from '../app-version/appVersionSupport';
import { getNativeAppIdentity, getNativeAppName } from '../app-version/nativeAppIdentity';
import { useAppVersionSupport } from '../hooks/useAppVersionSupport';
import { type UpdateRequiredColors, updateRequiredColors } from './colors';

const GOOGLE_PLAY_HOST = 'play.google.com';
const MAX_ACTIONS_WIDTH = 320;

export function UpdateRequiredView(): JSX.Element {
  const status = useAppVersionSupport();
  const display = useSyncExternalStore(
    subscribeToAppVersionSupport,
    getUpdateRequiredDisplay,
    getUpdateRequiredDisplay,
  );
  const colors = updateRequiredColors(useColorScheme());

  return (
    <UpdateRequiredContent
      status={status}
      display={display}
      appName={display.applicationName ?? getNativeAppName() ?? ''}
      displayVersion={getNativeAppIdentity()?.displayVersion ?? null}
      colors={colors}
    />
  );
}

type UpdateRequiredContentProps = {
  status: AppVersionSupportStatus;
  display: UpdateRequiredDisplay;
  appName: string;
  displayVersion: string | null;
  colors: UpdateRequiredColors;
};

export function UpdateRequiredContent({
  status,
  display,
  appName,
  displayVersion,
  colors,
}: UpdateRequiredContentProps): JSX.Element {
  const updateUrl = status.updateUrl;
  const supportEmail = display.supportEmail;

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        alwaysBounceVertical={false}
      >
        {display.logoImageUrl && (
          <Image
            source={{ uri: display.logoImageUrl }}
            style={styles.logo}
            resizeMode='contain'
            accessibilityIgnoresInvertColors
          />
        )}
        <View style={styles.header}>
          <Text
            accessibilityRole='header'
            style={[styles.title, { color: colors.foreground }]}
          >
            Update required
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {`This version of ${appName} is no longer supported. Please update to continue.`}
          </Text>
        </View>
        <VersionBox
          status={status}
          displayVersion={displayVersion}
          colors={colors}
        />
      </ScrollView>

      <View style={styles.actions}>
        {updateUrl && (
          <Pressable
            accessibilityRole='button'
            onPress={() => openURL(updateUrl)}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
              {storeButtonText(updateUrl)}
            </Text>
          </Pressable>
        )}
        {supportEmail && (
          <Pressable
            accessibilityRole='button'
            onPress={() => openURL(`mailto:${supportEmail}`)}
            style={({ pressed }) => [styles.helpButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.helpText, { color: colors.mutedForeground }]}>
              {"Can't update? "}
              <Text style={[styles.helpLink, { color: colors.primary }]}>{getHelpText()}</Text>
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function VersionBox({
  status,
  displayVersion,
  colors,
}: {
  status: AppVersionSupportStatus;
  displayVersion: string | null;
  colors: UpdateRequiredColors;
}): JSX.Element | null {
  const boxStyle = [styles.versionBox, { backgroundColor: colors.versionBoxBackground, borderColor: colors.border }];

  if (Platform.OS === 'android') {
    if (!displayVersion) {
      return null;
    }
    return (
      <View style={boxStyle}>
        <VersionColumn
          label='Your version'
          version={displayVersion}
          colors={colors}
        />
      </View>
    );
  }

  if (!status.minimumVersion || !status.currentVersion) {
    return null;
  }
  return (
    <View style={boxStyle}>
      <VersionColumn
        label='Your version'
        version={status.currentVersion}
        colors={colors}
      />
      <View style={[styles.versionDivider, { backgroundColor: colors.border }]} />
      <VersionColumn
        label='Required'
        version={`${status.minimumVersion}+`}
        colors={colors}
      />
    </View>
  );
}

function VersionColumn({
  label,
  version,
  colors,
}: {
  label: string;
  version: string;
  colors: UpdateRequiredColors;
}): JSX.Element {
  return (
    <View
      accessible
      style={styles.versionColumn}
    >
      <Text style={[styles.versionLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.versionValue, { color: colors.foreground }]}>{version}</Text>
    </View>
  );
}

export function storeButtonText(updateUrl: string): string {
  if (Platform.OS === 'ios') {
    return 'Go to App Store';
  }
  try {
    return new URL(updateUrl).hostname.toLowerCase() === GOOGLE_PLAY_HOST ? 'Go to Google Play' : 'Update app';
  } catch {
    return 'Update app';
  }
}

// openURL rejects when no app can open the URL, such as a mailto: link without a mail app. The screen stays as it is.
function openURL(url: string): void {
  Linking.openURL(url).catch(() => {});
}

function getHelpText(): string {
  return Platform.OS === 'ios' ? 'Get Help' : 'Get help';
}

const isIOS = Platform.OS === 'ios';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: isIOS ? 120 : 64,
    paddingBottom: 24,
  },
  logo: {
    width: 44,
    height: 44,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: isIOS ? '600' : '500',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isIOS ? 15 : 16,
    lineHeight: isIOS ? 20 : 24,
    letterSpacing: isIOS ? 0 : 0.15,
    textAlign: 'center',
  },
  versionBox: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  versionColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  versionDivider: {
    width: 1,
  },
  versionLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: isIOS ? 0 : 0.1,
    textAlign: 'center',
  },
  versionValue: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: isIOS ? 0 : 0.15,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MAX_ACTIONS_WIDTH + 48,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: isIOS ? 48 : 40,
    gap: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: isIOS ? 0 : 0.15,
  },
  // The platform minimum touch target: 44pt on iOS and 48dp on Android.
  helpButton: {
    minHeight: isIOS ? 44 : 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  helpLink: {
    fontWeight: '600',
  },
});
