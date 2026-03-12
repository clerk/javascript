import { ClerkRuntimeError } from '@clerk/shared/error';
import type { SignUpResource } from '@clerk/shared/types';

export async function executeProtectCheck(
  scriptUrl: string,
  signUp: SignUpResource,
  containerEl: HTMLDivElement,
): Promise<unknown> {
  let mod: Record<string, unknown>;
  try {
    mod = await import(/* webpackIgnore: true */ scriptUrl);
  } catch (e) {
    throw new ClerkRuntimeError('Protect check script failed to load', {
      code: 'protect_check_script_load_failed',
    });
  }

  if (typeof mod.default !== 'function') {
    throw new ClerkRuntimeError('Protect check script has no default export', {
      code: 'protect_check_invalid_script',
    });
  }

  try {
    const result = await mod.default(containerEl, signUp);
    return result;
  } catch (e) {
    throw new ClerkRuntimeError('Protect check script execution failed', {
      code: 'protect_check_execution_failed',
    });
  }
}
