import { EmailForm } from './EmailForm';
import { useEmailMenuController } from './emails-section.controller';
import { useEmailMenuModel } from './emails-section.model';
import { EmailMenuView } from './emails-section.view';
import { RemoveEmailForm } from './RemoveResourceForm';
import { useProfileActionCloseController } from './useProfileActionCloseController';

export const RemoveEmailScreen = ({ emailId }: { emailId: string }) => {
  const controller = useProfileActionCloseController();
  return (
    <RemoveEmailForm
      onSuccess={controller.onSuccess}
      onReset={controller.onReset}
      emailId={emailId}
    />
  );
};

export const EmailScreen = ({ emailId }: { emailId?: string }) => {
  const controller = useProfileActionCloseController();
  return (
    <EmailForm
      onSuccess={controller.onSuccess}
      onReset={controller.onReset}
      emailId={emailId}
    />
  );
};

export const EmailMenu = ({
  emailId,
  isVerified,
  shouldAllowDeletion,
}: {
  emailId: string;
  isVerified: boolean;
  shouldAllowDeletion: boolean;
}) => {
  const model = useEmailMenuModel(emailId, isVerified);
  const controller = useEmailMenuController(model, emailId, shouldAllowDeletion);
  return <EmailMenuView controller={controller} />;
};
