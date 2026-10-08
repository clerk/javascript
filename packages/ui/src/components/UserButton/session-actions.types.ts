import type { MenuItem } from '../../utils/createCustomMenuItems';
import type { UserButtonSessionOption } from './multisession.types';

export type SessionActionsModel = {
  navigate: (path: string) => Promise<unknown>;
  menuItems: MenuItem[];
};

export type SessionActionHandlers = {
  canRun: () => boolean;
  handleManageAccountClicked: () => Promise<unknown> | void;
  handleSignOutSessionClicked: (sessionId: string) => () => Promise<unknown> | void;
  handleUserProfileActionClicked: (startPath?: string) => Promise<unknown> | void;
  completedCallback: () => void;
};

export type SingleSessionActionsProps = SessionActionHandlers & { session: UserButtonSessionOption };
export type MultiSessionActionsProps = SingleSessionActionsProps & {
  handleSessionClicked: (sessionId: string) => () => Promise<unknown> | void;
  handleAddAccountClicked: () => Promise<unknown> | void;
  otherSessions: UserButtonSessionOption[];
};

export type SessionActionsData = {
  menuItems: MenuItem[];
  hasOnlyDefaultItems: boolean;
  onMenuItemClick: (item: MenuItem) => Promise<unknown>;
};

export type SingleSessionActionsData = SessionActionsData & {
  onSignOut: () => Promise<unknown> | void;
};

export type MultiSessionActionsData = SingleSessionActionsData & {
  onManageAccount: () => Promise<unknown> | void;
  onAddAccount: () => Promise<unknown> | void;
  otherSessions: (UserButtonSessionOption & { onClick: () => Promise<unknown> | void })[];
};
