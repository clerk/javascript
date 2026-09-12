'use server';

import { keyless } from '../server/keyless-node';
import { canUseKeyless } from '../utils/feature-flags';

export async function deleteKeylessAction() {
  if (!canUseKeyless) {
    return;
  }

  try {
    await keyless().removeKeys();
  } catch {
    // Ignore errors during key removal
  }
}
