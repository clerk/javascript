import type { ConfigPlugin } from '@expo/config-plugins';

declare const withClerkExpoNativeComponents: ConfigPlugin<{ keychainService?: string; theme?: string } | void>;

export = withClerkExpoNativeComponents;
