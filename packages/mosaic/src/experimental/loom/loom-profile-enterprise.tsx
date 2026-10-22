import { useUserProfileEnterpriseAccountsController } from '../../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.controller';
import { UserProfileEnterpriseAccountsSectionView } from '../../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.view';
import { useMessages } from '../../localization';
import { type LoomEnterpriseState, useLoomProfileEnterpriseModel } from './loom-profile-enterprise.model';

export function LoomProfileEnterprise() {
  const state = useLoomProfileEnterpriseModel();
  if (!state) {
    return null;
  }
  if (!state.connect) {
    return (
      <UserProfileEnterpriseAccountsSectionView
        accounts={state.accounts}
        connections={state.connections}
        connectionsStatus={state.connectionsStatus}
      />
    );
  }
  return (
    <InteractiveEnterprise
      key={state.userId}
      state={state}
      connect={state.connect}
    />
  );
}

function InteractiveEnterprise({
  state,
  connect,
}: {
  state: LoomEnterpriseState;
  connect: NonNullable<LoomEnterpriseState['connect']>;
}) {
  const m = useMessages('userProfileEnterpriseAccountsSection');
  const controller = useUserProfileEnterpriseAccountsController({
    accounts: state.accounts,
    connections: state.connections,
    onConnect: connect,
    errorFallback: m.errors.generic,
  });
  return (
    <UserProfileEnterpriseAccountsSectionView
      {...controller}
      connectionsStatus={state.connectionsStatus}
    />
  );
}
