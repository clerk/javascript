import { AuthProtectCheck } from '../../../blocks/auth';
import { useMessages } from '../../../localization';
import type { SignUpProtectScreen } from '../sign-up.types';
import { useSignUpProtectController } from './sign-up-protect.controller';

interface SignUpProtectProps extends SignUpProtectScreen {
  logo?: { src: string; alt: string };
}

export function SignUpProtect({ logo, ...screen }: SignUpProtectProps) {
  const m = useMessages('signUp');
  const { containerRef, isWidgetVisible, isPending, errorMessage, onRetry } = useSignUpProtectController(screen);

  return (
    <AuthProtectCheck
      messages={{ ...m.protectCheck, loading: m.loading }}
      logo={logo}
      challenge={isWidgetVisible}
      containerRef={containerRef}
      isPending={isPending}
      globalErrorMessage={errorMessage}
      onRetry={onRetry}
    />
  );
}
