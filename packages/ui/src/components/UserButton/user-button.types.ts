import type { MultisessionModel, UserButtonPreviewData, UserButtonSessionOption } from './multisession.types';

export type UserButtonIdentifierData = { identifier: string | undefined };

export type UserButtonTriggerData = UserButtonIdentifierData & {
  showName: boolean | undefined;
  avatar: { firstName: string | null; lastName: string | null; imageUrl: string } | undefined;
  ariaLabel: string;
};

export type UserButtonPopoverModel = {
  session: UserButtonSessionOption;
  userPreview: UserButtonPreviewData | undefined;
  multisession: MultisessionModel;
  userProfileMode: 'modal' | 'navigation' | undefined;
  isStandalone: boolean;
  singleSessionMode: boolean;
};

export type UserButtonPopoverData = {
  userPreview: UserButtonPreviewData | undefined;
  isStandalone: boolean;
};

export type UserButtonRootData = {
  standalone: boolean | ((open: boolean) => void) | undefined;
  defaultOpen: boolean | undefined;
};
