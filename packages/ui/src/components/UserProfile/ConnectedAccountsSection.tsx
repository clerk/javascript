import { withCardStateProvider } from '@/ui/elements/contexts';

import {
  useConnectedAccountController,
  useConnectedAccountsSectionController,
} from './connected-accounts-section.controller';
import type { ConnectedAccountsSectionProps } from './connected-accounts-section.model';
import { useConnectedAccountModel, useConnectedAccountsSectionModel } from './connected-accounts-section.model';
import { RemoveConnectedAccountScreen } from './connected-accounts-section.screens';
import { ConnectedAccountsSectionView, ConnectedAccountView } from './connected-accounts-section.view';
import { AddConnectedAccount } from './ConnectedAccountsMenu';

export const ConnectedAccountsSection = ({ shouldAllowCreation = true }: ConnectedAccountsSectionProps) => {
  const model = useConnectedAccountsSectionModel();

  if (!model.hasUser || (!shouldAllowCreation && !model.hasExternalAccounts)) {
    return null;
  }

  return (
    <ConnectedAccountsContent
      key={model.requestKey}
      model={model}
      shouldAllowCreation={shouldAllowCreation}
    />
  );
};

const ConnectedAccountsContent = withCardStateProvider(
  ({
    model,
    shouldAllowCreation,
  }: {
    model: ReturnType<typeof useConnectedAccountsSectionModel>;
    shouldAllowCreation: boolean;
  }) => {
    const controller = useConnectedAccountsSectionController();
    return (
      <ConnectedAccountsSectionView
        controller={controller}
        items={model.accountIds.map(accountId => (
          <ConnectedAccount
            key={accountId}
            accountId={accountId}
          />
        ))}
        addMenu={shouldAllowCreation ? <AddConnectedAccount onClick={controller.closeAction} /> : null}
      />
    );
  },
);

const ConnectedAccount = ({ accountId }: { accountId: string }) => {
  const model = useConnectedAccountModel(accountId);
  const controller = useConnectedAccountController(model);

  if (!model.exists) {
    return null;
  }

  return (
    <ConnectedAccountView
      controller={controller}
      removeScreen={<RemoveConnectedAccountScreen accountId={model.id} />}
    />
  );
};
