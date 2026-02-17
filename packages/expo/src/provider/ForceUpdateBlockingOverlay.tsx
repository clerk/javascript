import { useClerk } from '@clerk/react';
import type { ComponentType, ReactNode } from 'react';
import { useMemo } from 'react';
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useForceUpdateStatus } from '../hooks/useForceUpdateStatus';

type ForceUpdateBlockingOverlayProps = {
  enabled: boolean;
};

type ClerkTheme = {
  buttons?: {
    fontColor?: string;
  };
  general?: {
    backgroundColor?: string;
    fontColor?: string;
    color?: string;
  };
};

type ClerkWithTheme = {
  __internal_environment?: {
    displayConfig?: {
      theme?: ClerkTheme;
    };
  } | null;
};

type FullWindowOverlayProps = {
  children?: ReactNode;
};

type FullWindowOverlayModule = {
  FullWindowOverlay?: ComponentType<FullWindowOverlayProps>;
};

const FALLBACK_COLORS = {
  backdrop: 'rgba(13, 15, 20, 0.75)',
  background: '#ffffff',
  text: '#151515',
  mutedText: '#4c4f62',
  primary: '#6c47ff',
  buttonText: '#ffffff',
};

const FullWindowOverlay: ComponentType<FullWindowOverlayProps> | null = (() => {
  try {
    return (require('react-native-screens') as FullWindowOverlayModule).FullWindowOverlay || null;
  } catch {
    return null;
  }
})();

const useOverlayColors = (): typeof FALLBACK_COLORS => {
  const clerk = useClerk();

  return useMemo(() => {
    const theme = (clerk as ClerkWithTheme).__internal_environment?.displayConfig?.theme;

    return {
      ...FALLBACK_COLORS,
      background: theme?.general?.backgroundColor || FALLBACK_COLORS.background,
      text: theme?.general?.fontColor || FALLBACK_COLORS.text,
      primary: theme?.general?.color || FALLBACK_COLORS.primary,
      buttonText: theme?.buttons?.fontColor || FALLBACK_COLORS.buttonText,
    };
  }, [clerk]);
};

const buildMessage = (minimumVersion: string | null): string => {
  if (!minimumVersion) {
    return 'This version of the app is no longer supported. Please update to continue.';
  }

  return `This version of the app is no longer supported. Please update to version ${minimumVersion} or newer.`;
};

export const ForceUpdateBlockingOverlay = ({ enabled }: ForceUpdateBlockingOverlayProps): JSX.Element | null => {
  const colors = useOverlayColors();
  const status = useForceUpdateStatus();

  if (!enabled || status.isSupported) {
    return null;
  }

  const onPressUpdate = (): void => {
    const updateURL = status.updateURL;
    if (!updateURL) {
      return;
    }

    void Linking.openURL(updateURL);
  };

  const overlay = (
    <View style={styles.fullWindowContainer}>
      <View style={[styles.backdrop, { backgroundColor: colors.backdrop }]}>
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>Update required</Text>
          <Text style={[styles.message, { color: colors.mutedText }]}>{buildMessage(status.minimumVersion)}</Text>
          {status.updateURL ? (
            <Pressable onPress={onPressUpdate} style={[styles.button, { backgroundColor: colors.primary }]}>
              <Text style={[styles.buttonLabel, { color: colors.buttonText }]}>Update now</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'ios' && FullWindowOverlay) {
    return <FullWindowOverlay>{overlay}</FullWindowOverlay>;
  }

  return (
    <Modal
      animationType='fade'
      onRequestClose={() => undefined}
      statusBarTranslucent
      transparent
      visible
    >
      {overlay}
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullWindowContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  backdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    maxWidth: 420,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
