import { useSSOBypassSectionController } from './sso-bypass.controller';
import { useSSOBypassModel } from './sso-bypass.model';
import { SSOBypassSectionSkeleton } from './sso-bypass.skeleton';
import { SSOBypassSectionView } from './sso-bypass.view';

export function SSOBypassSection() {
  const model = useSSOBypassModel({ enabled: true, withRoles: true });
  const controller = useSSOBypassSectionController(model);
  if (model.isLoading) {
    return <SSOBypassSectionSkeleton />;
  }
  return <SSOBypassSectionView {...controller} />;
}
