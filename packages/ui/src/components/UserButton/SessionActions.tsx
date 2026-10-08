import { useSessionActionsController } from './session-actions.controller';
import { useSessionActionsModel } from './session-actions.model';
import type { MultiSessionActionsProps, SingleSessionActionsProps } from './session-actions.types';
import { MultiSessionActionsView, SingleSessionActionsView } from './session-actions.view';

export const SingleSessionActions = (props: SingleSessionActionsProps) => {
  const model = useSessionActionsModel();
  const menu = useSessionActionsController(props, model);

  return (
    <SingleSessionActionsView
      {...menu}
      onSignOut={props.handleSignOutSessionClicked(props.session.id)}
    />
  );
};

export const MultiSessionActions = (props: MultiSessionActionsProps) => {
  const model = useSessionActionsModel();
  const menu = useSessionActionsController(props, model);

  return (
    <MultiSessionActionsView
      {...menu}
      onManageAccount={props.handleManageAccountClicked}
      onSignOut={props.handleSignOutSessionClicked(props.session.id)}
      onAddAccount={props.handleAddAccountClicked}
      otherSessions={props.otherSessions.map(session => ({
        id: session.id,
        preview: session.preview,
        onClick: props.handleSessionClicked(session.id),
      }))}
    />
  );
};
