import { withCardStateProvider } from '@/ui/elements/contexts';

import { useResetPasswordSuccessController } from './reset-password-success.controller';
import { useResetPasswordSuccessModel } from './reset-password-success.model';
import { ResetPasswordSuccessView } from './reset-password-success.view';

const ResetPasswordSuccessInternal = () => {
  useResetPasswordSuccessModel();
  const controller = useResetPasswordSuccessController();
  return <ResetPasswordSuccessView {...controller} />;
};

export const ResetPasswordSuccess = withCardStateProvider(ResetPasswordSuccessInternal);
