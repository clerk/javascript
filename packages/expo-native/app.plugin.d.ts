import type { ConfigPlugin } from '@expo/config-plugins';

declare const withClerkExpoNative: ConfigPlugin<{ keychainService?: string; theme?: string } | void>;

export = withClerkExpoNative;
