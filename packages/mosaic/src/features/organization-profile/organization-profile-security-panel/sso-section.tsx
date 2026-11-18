import type { SSOConnectionActions } from './sso-connection.dialog';
import { SSOConnectionDialog } from './sso-connection.dialog';
import type { SSOConnectionsModel } from './sso-connections.model';
import { useSSOConnectionsModel } from './sso-connections.model';
import type { SSOConnection } from './sso-connections.types';
import { useSSOSectionController } from './sso-section.controller';
import { SSOSectionSkeleton } from './sso-section.skeleton';
import { SSOSectionView } from './sso-section.view';

export function SSOSection() {
  const model = useSSOConnectionsModel({ enabled: true });
  if (model.isLoading) {
    return <SSOSectionSkeleton />;
  }
  return <SSOSectionContent model={model} />;
}

export function SSOSectionContent({ model }: { model: SSOConnectionsModel }) {
  const { managed, onManagedOpenChange, managedFinalFocus, ...controller } = useSSOSectionController(model);
  return (
    <>
      <SSOSectionView {...controller} />
      <SSOConnectionDialog
        connection={managed}
        onOpenChange={onManagedOpenChange}
        finalFocus={managedFinalFocus}
        actions={connection => connectionActions(model, connection)}
      />
    </>
  );
}

function connectionActions(model: SSOConnectionsModel, connection: SSOConnection): SSOConnectionActions {
  return {
    onRename: name => model.rename(connection.id, name),
    onSetSetting: (setting, enabled) => model.setSetting(connection.id, setting, enabled),
    onUpdateSaml: values => model.updateSaml(connection.id, values),
    onUpdateOidc: values => model.updateOidc(connection.id, values),
  };
}
