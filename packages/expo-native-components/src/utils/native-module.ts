import { Platform } from 'react-native';

import NativeClerkModule from '../specs/NativeClerkModule';

export const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export const ClerkExpoModule = isNativeSupported ? NativeClerkModule : null;
