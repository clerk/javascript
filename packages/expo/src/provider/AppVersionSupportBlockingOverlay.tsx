import { useClerk } from '@clerk/react';
import type { ComponentType, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppVersionSupportStatus } from '../app-version-support/types';
import { useAppVersionSupportStatus } from '../hooks/useAppVersionSupportStatus';

type AppVersionSupportBlockingOverlayProps = {
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

const ENTER_DELAY_MS = 90;
const ENTER_DURATION_MS = 220;
const EXIT_DURATION_MS = 180;
const CONTENT_OFFSET_Y = 12;

const FullWindowOverlay: ComponentType<FullWindowOverlayProps> | null = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional dependency in Expo apps
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

export const AppVersionSupportBlockingOverlay = ({
  enabled,
}: AppVersionSupportBlockingOverlayProps): JSX.Element | null => {
  const colors = useOverlayColors();
  const status = useAppVersionSupportStatus();
  const shouldBlock = enabled && !status.isSupported;
  const [isPresented, setIsPresented] = useState(shouldBlock);
  const [presentationStatus, setPresentationStatus] = useState<AppVersionSupportStatus>(status);
  const overlayOpacity = useRef(new Animated.Value(shouldBlock ? 1 : 0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(CONTENT_OFFSET_Y)).current;
  const enterDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearEnterDelay = useCallback((): void => {
    if (!enterDelayTimeoutRef.current) {
      return;
    }

    clearTimeout(enterDelayTimeoutRef.current);
    enterDelayTimeoutRef.current = null;
  }, []);

  const startEntranceAnimation = useCallback((): void => {
    clearEnterDelay();
    overlayOpacity.stopAnimation();
    contentOpacity.stopAnimation();
    contentTranslateY.stopAnimation();

    overlayOpacity.setValue(1);
    contentOpacity.setValue(0);
    contentTranslateY.setValue(CONTENT_OFFSET_Y);

    enterDelayTimeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: ENTER_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: ENTER_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      enterDelayTimeoutRef.current = null;
    }, ENTER_DELAY_MS);
  }, [clearEnterDelay, contentOpacity, contentTranslateY, overlayOpacity]);

  const startExitAnimation = useCallback((): void => {
    clearEnterDelay();
    overlayOpacity.stopAnimation();
    contentOpacity.stopAnimation();
    contentTranslateY.stopAnimation();

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: EXIT_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: EXIT_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: CONTENT_OFFSET_Y,
        duration: EXIT_DURATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        return;
      }

      setIsPresented(false);
      overlayOpacity.setValue(0);
      contentOpacity.setValue(0);
      contentTranslateY.setValue(CONTENT_OFFSET_Y);
    });
  }, [clearEnterDelay, contentOpacity, contentTranslateY, overlayOpacity]);

  useEffect(() => {
    if (shouldBlock) {
      setPresentationStatus(status);
    }
  }, [shouldBlock, status]);

  useEffect(() => {
    if (shouldBlock) {
      if (!isPresented) {
        setIsPresented(true);
        return;
      }

      startEntranceAnimation();
      return;
    }

    if (isPresented) {
      startExitAnimation();
    }
  }, [isPresented, shouldBlock, startEntranceAnimation, startExitAnimation]);

  useEffect(() => {
    return () => {
      clearEnterDelay();
      overlayOpacity.stopAnimation();
      contentOpacity.stopAnimation();
      contentTranslateY.stopAnimation();
    };
  }, [clearEnterDelay, contentOpacity, contentTranslateY, overlayOpacity]);

  if (!isPresented) {
    return null;
  }

  const onPressUpdate = (): void => {
    const updateURL = presentationStatus.updateURL;
    if (!updateURL) {
      return;
    }

    void Linking.openURL(updateURL);
  };

  const overlay = (
    <Animated.View style={[styles.fullWindowContainer, { opacity: overlayOpacity }]}>
      <View style={[styles.backdrop, { backgroundColor: colors.backdrop }]}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.background,
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>Update required</Text>
          <Text style={[styles.message, { color: colors.mutedText }]}>
            {buildMessage(presentationStatus.minimumVersion)}
          </Text>
          {presentationStatus.updateURL ? (
            <Pressable
              onPress={onPressUpdate}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.buttonLabel, { color: colors.buttonText }]}>Update now</Text>
            </Pressable>
          ) : null}
        </Animated.View>
      </View>
    </Animated.View>
  );

  if (Platform.OS === 'ios' && FullWindowOverlay) {
    return <FullWindowOverlay>{overlay}</FullWindowOverlay>;
  }

  return (
    <Modal
      animationType='none'
      onRequestClose={() => undefined}
      statusBarTranslucent
      transparent
      visible={isPresented}
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
