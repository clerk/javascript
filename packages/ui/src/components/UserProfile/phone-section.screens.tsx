import { usePhoneMenuController } from './phone-section.controller';
import { usePhoneMenuModel } from './phone-section.model';
import { PhoneMenuView } from './phone-section.view';
import { PhoneForm } from './PhoneForm';
import { RemovePhoneForm } from './RemoveResourceForm';
import { useProfileActionCloseController } from './useProfileActionCloseController';

export const RemovePhoneScreen = ({ phoneId }: { phoneId: string }) => {
  const controller = useProfileActionCloseController();
  return (
    <RemovePhoneForm
      onSuccess={controller.onSuccess}
      onReset={controller.onReset}
      phoneId={phoneId}
    />
  );
};

export const PhoneScreen = ({ phoneId }: { phoneId?: string }) => {
  const controller = useProfileActionCloseController();
  return (
    <PhoneForm
      onSuccess={controller.onSuccess}
      onReset={controller.onReset}
      phoneId={phoneId}
    />
  );
};

export const PhoneMenu = ({
  phoneId,
  isVerified,
  shouldAllowDeletion,
}: {
  phoneId: string;
  isVerified: boolean;
  shouldAllowDeletion: boolean;
}) => {
  const model = usePhoneMenuModel(phoneId, isVerified);
  const controller = usePhoneMenuController(model, phoneId, shouldAllowDeletion);
  if (controller.status === 'hidden') {
    return null;
  }
  return <PhoneMenuView controller={controller} />;
};
