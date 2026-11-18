import { useSSOBypassPageController } from './sso-bypass.controller';
import { useSSOBypassModel } from './sso-bypass.model';
import { SSOBypassPageSkeleton } from './sso-bypass.skeleton';
import { SSOBypassPageView } from './sso-bypass.view';

export function SSOBypassPage() {
  const model = useSSOBypassModel({ enabled: true, withRoles: true });
  const controller = useSSOBypassPageController(model);
  if (model.isLoading) {
    return <SSOBypassPageSkeleton />;
  }
  return <SSOBypassPageView {...controller} />;
}
