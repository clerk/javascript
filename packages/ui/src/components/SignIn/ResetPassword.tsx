import { withCardStateProvider } from '@/ui/elements/contexts';

import { useResetPasswordController } from './reset-password.controller';
import { useResetPasswordModel } from './reset-password.model';
import { ResetPasswordView } from './reset-password.view';

const ResetPasswordInternal = () => {
  const model = useResetPasswordModel();
  const controller = useResetPasswordController(model);
  return <ResetPasswordView {...controller} />;
};

export const ResetPassword = withCardStateProvider(ResetPasswordInternal);
