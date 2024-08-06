import type { Appearance } from '@clerk/types';

import { useOptions } from './use-options';

export function useAppearance() {
  const { appearance } = useOptions();
  return (appearance as Appearance) || {};
}
