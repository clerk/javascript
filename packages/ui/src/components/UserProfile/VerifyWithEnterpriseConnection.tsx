import type { EmailVerificationProps } from './email-form.types';
import { useEmailVerificationController } from './email-verification.controller';
import { VerifyWithEnterpriseConnectionView } from './verify-with-enterprise-connection.view';

export const VerifyWithEnterpriseConnection = (props: EmailVerificationProps) => {
  const controller = useEmailVerificationController(props);
  return <VerifyWithEnterpriseConnectionView controller={controller} />;
};
