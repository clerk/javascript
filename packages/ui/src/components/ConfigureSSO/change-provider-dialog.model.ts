import type { LocalizationKey } from '@/customizables';
import { useLocalizations } from '@/customizables';

export const useChangeProviderDialogModel = (
  nextProviderLabel: LocalizationKey,
  currentProviderLabel: LocalizationKey,
) => {
  const { t } = useLocalizations();
  return { nextProvider: t(nextProviderLabel), currentProvider: t(currentProviderLabel) };
};
