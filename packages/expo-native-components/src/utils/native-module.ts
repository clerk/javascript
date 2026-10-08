import { Platform } from 'react-native';

export const isNativeSupported = Platform.OS === 'ios' || Platform.OS === 'android';
