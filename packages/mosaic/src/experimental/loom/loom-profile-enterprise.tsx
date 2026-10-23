import { UserProfileEnterpriseAccountsSectionView } from '../../features/user-profile/user-profile-enterprise-accounts-section/user-profile-enterprise-accounts-section.view';
import { useLoomProfileEnterpriseModel } from './loom-profile-enterprise.model';

export function LoomProfileEnterprise() {
  const state = useLoomProfileEnterpriseModel();
  return state ? <UserProfileEnterpriseAccountsSectionView accounts={state.accounts} /> : null;
}
