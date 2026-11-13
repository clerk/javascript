import { useState } from 'react';

import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import { useAccessController } from './access.controller';
import { useAccessPanelModel } from './access.model';
import type { AccessData } from './access.types';
import { OrganizationProfileAccessPanelView } from './access.view';

export function OrganizationProfileAccessPanel() {
  const [policyId, setPolicyId] = useState<string | null>(null);
  const [directoryParentId, setDirectoryParentId] = useState<string | null>(null);
  const model = useAccessPanelModel(policyId, setPolicyId, directoryParentId, setDirectoryParentId);
  const m = useMessages('organizationProfile').access;

  switch (model.status) {
    case 'hidden':
      return null;
    case 'loading':
      return <Section.Description role='status'>{m.loadingPolicies}</Section.Description>;
    case 'error':
      return (
        <div>
          <Section.Error>{m.loadPoliciesError}</Section.Error>
          <Button onClick={() => void model.retry()}>{m.retry}</Button>
        </div>
      );
    case 'ready':
      return <AccessPanelContent data={model.data} />;
  }
}

function AccessPanelContent({ data }: { data: AccessData }) {
  const controller = useAccessController(data);
  return (
    <OrganizationProfileAccessPanelView
      controller={controller}
      showEditorControls
    />
  );
}
