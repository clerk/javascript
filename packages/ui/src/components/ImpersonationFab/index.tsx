import { withCoreUserGuard } from '../../contexts';
import { InternalThemeProvider } from '../../styledSystem';
import { useImpersonationFabController } from './impersonation-fab.controller';
import { useImpersonationFabModel } from './impersonation-fab.model';
import { ImpersonationFabView } from './impersonation-fab.view';

function ImpersonationFabContent() {
  const model = useImpersonationFabModel();
  const controller = useImpersonationFabController(model);

  if (controller.status !== 'ready') {
    return null;
  }

  const { status: _status, ...viewProps } = controller;
  return <ImpersonationFabView {...viewProps} />;
}

export const ImpersonationFab = withCoreUserGuard(() => (
  <InternalThemeProvider>
    <ImpersonationFabContent />
  </InternalThemeProvider>
));
