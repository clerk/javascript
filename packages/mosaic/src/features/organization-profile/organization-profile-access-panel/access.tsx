import { useState } from 'react';

import { Button } from '../../../components/button';
import { Section } from '../../../components/section';
import { useMessages } from '../../../localization';
import type { RenderProfilePage } from '../../profile-pages/profile-pages.view';
import { useAccessController } from './access.controller';
import { useAccessPanelModel } from './access.model';
import type { AccessData } from './access.types';
import { accessProfilePage } from './access.view';

export function OrganizationProfileAccessPanel({ render }: { render: RenderProfilePage }) {
  const [policyId, setPolicyId] = useState<string | null>(null);
  const [directoryParentId, setDirectoryParentId] = useState<string | null>(null);
  const model = useAccessPanelModel(policyId, setPolicyId, directoryParentId, setDirectoryParentId);
  const m = useMessages('organizationProfile').access;

  switch (model.status) {
    case 'hidden':
      return render(null);
    case 'loading':
      return render(<Section.Description role='status'>{m.loadingPolicies}</Section.Description>);
    case 'error':
      return render(
        <div>
          <Section.Error>{m.loadPoliciesError}</Section.Error>
          <Button onClick={() => void model.retry()}>{m.retry}</Button>
        </div>,
      );
    case 'ready':
      return (
        <AccessPanelContent
          data={model.data}
          render={render}
        />
      );
  }
}

function AccessPanelContent({ data, render }: { data: AccessData; render: RenderProfilePage }) {
  const { page, layout } = accessProfilePage(useAccessController(data));
  return render(page, layout);
}
