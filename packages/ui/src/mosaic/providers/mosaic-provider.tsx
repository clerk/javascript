import type { UIRegistry } from '../i18n-registry';
import { AppearanceProvider } from './appearance-provider';
import type { AppearanceProviderProps } from './appearance-provider';
import { LocalizationProvider } from './localization-provider';
import type { LocalizationProviderProps } from './localization-provider';

export { useMosaicTheme } from './appearance-provider';

export interface MosaicProviderProps {
  children: React.ReactNode;
  appearance?: Omit<AppearanceProviderProps, 'children'>;
  localization?: Omit<LocalizationProviderProps<UIRegistry>, 'children'>;
}

export function MosaicProvider({ children, appearance, localization }: MosaicProviderProps) {
  return (
    <AppearanceProvider {...appearance}>
      <LocalizationProvider {...localization}>{children}</LocalizationProvider>
    </AppearanceProvider>
  );
}
