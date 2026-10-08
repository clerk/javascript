import { useActiveConnectionAlertController } from './active-connection-alert.controller';
import { useActiveConnectionAlertModel } from './active-connection-alert.model';
import { ActiveConnectionAlertView } from './active-connection-alert.view';

export const ActiveConnectionAlert = (): JSX.Element | null => {
  const model = useActiveConnectionAlertModel();
  const controller = useActiveConnectionAlertController();
  return (
    <ActiveConnectionAlertView
      {...model}
      {...controller}
    />
  );
};
