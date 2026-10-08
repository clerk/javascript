import type { AddConnectedAccountProps } from './connected-accounts-menu.model';
import { useAddConnectedAccountModel, useConnectMenuButtonModel } from './connected-accounts-menu.model';
import { AddConnectedAccountView, ConnectMenuButtonView } from './connected-accounts-menu.view';
import { useProfileConnectionController } from './profile-connection.controller';

export const AddConnectedAccount = (props: AddConnectedAccountProps) => {
  const model = useAddConnectedAccountModel();

  if (model.strategies.length === 0) {
    return null;
  }

  return (
    <AddConnectedAccountView
      onClick={props.onClick}
      buttons={model.strategies.map(strategy => (
        <ConnectMenuButton
          strategy={strategy}
          key={strategy}
        />
      ))}
    />
  );
};

const ConnectMenuButton = ({
  strategy,
}: {
  strategy: ReturnType<typeof useAddConnectedAccountModel>['strategies'][number];
}) => {
  const model = useConnectMenuButtonModel(strategy);
  const controller = useProfileConnectionController(model, model.strategy);

  return <ConnectMenuButtonView controller={{ ...controller, strategy: model.strategy, display: model.display }} />;
};
