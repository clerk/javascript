import type { UserPreviewData } from '@/ui/elements/user-preview.view';

export type UserButtonPreviewData = UserPreviewData & {
  title: string;
  subtitle?: string;
};

export type UserButtonSessionOption = {
  id: string;
  preview: UserButtonPreviewData | undefined;
};

export type MultisessionModel = {
  scopeKey: string;
  canRun: () => boolean;
  signedInSessions: UserButtonSessionOption[];
  otherSessions: UserButtonSessionOption[];
  signOutSession: (sessionId: string) => Promise<boolean>;
  navigateToUserProfile: () => Promise<boolean>;
  openUserProfile: (startPath?: string) => boolean;
  signOutAll: () => Promise<boolean>;
  switchSession: (sessionId: string) => Promise<boolean>;
  addAccount: () => boolean;
};

export type MultisessionControllerOptions = {
  userProfileMode?: 'modal' | 'navigation';
  actionCompleteCallback?: () => void;
};

export type MultisessionActionsData = {
  handleSignOutSessionClicked: (sessionId: string) => () => Promise<unknown>;
  handleManageAccountClicked: () => Promise<unknown>;
  handleUserProfileActionClicked: (startPath?: string) => Promise<unknown>;
  handleSignOutAllClicked: () => Promise<unknown>;
  handleSessionClicked: (sessionId: string) => () => Promise<unknown>;
  handleAddAccountClicked: () => Promise<unknown>;
  otherSessions: UserButtonSessionOption[];
  signedInSessions: UserButtonSessionOption[];
};
