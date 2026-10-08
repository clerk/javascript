import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';

import type { EnterpriseConnectionRow } from './enterprise-accounts-section.model';
import { useEnterpriseAccountsSectionModel } from './enterprise-accounts-section.model';
import { EnterpriseAccountsSectionView, EnterpriseConnectButtonView } from './enterprise-accounts-section.view';
import { useProfileConnectionController } from './profile-connection.controller';

const EnterpriseConnectMenuButton = ({
  connection,
  model,
}: {
  connection: EnterpriseConnectionRow;
  model: ReturnType<typeof useEnterpriseAccountsSectionModel>;
}) => {
  const controller = useProfileConnectionController(
    {
      requestKey: JSON.stringify([model.requestKey, connection.id]),
      canRun: model.canRun,
      connect: canContinue => model.connect(connection.id, canContinue),
    },
    `enterprise_${connection.id}`,
  );
  return <EnterpriseConnectButtonView controller={{ ...connection, ...controller }} />;
};

export const EnterpriseAccountsSection = () => {
  const model = useEnterpriseAccountsSectionModel();
  if (!model.shouldRender) {
    return null;
  }
  return (
    <EnterpriseAccountsContent
      key={model.requestKey}
      model={model}
    />
  );
};

const EnterpriseAccountsContent = withCardStateProvider(
  ({ model }: { model: ReturnType<typeof useEnterpriseAccountsSectionModel> }) => {
    const { error } = useCardState();
    const addMenu = model.linkableConnections.length ? (
      <EnterpriseAccountsSectionView.AddMenu>
        {model.linkableConnections.map(connection => (
          <EnterpriseConnectMenuButton
            connection={connection}
            model={model}
            key={connection.id}
          />
        ))}
      </EnterpriseAccountsSectionView.AddMenu>
    ) : null;
    return (
      <EnterpriseAccountsSectionView
        error={error}
        accounts={model.accounts}
        addMenu={addMenu}
      />
    );
  },
);
