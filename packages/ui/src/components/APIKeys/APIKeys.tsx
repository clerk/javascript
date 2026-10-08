import { lazy } from 'react';

import { withCoreUserGuard } from '@/ui/contexts';
import { Flow } from '@/ui/customizables';
import { withCardStateProvider } from '@/ui/elements/contexts';

import { useAPIKeyRequestScopeModel } from './api-key-request-scope.model';
import { useAPIKeysPageController, useAPIKeysSearchController } from './api-keys.controller';
import { useAPIKeysModel, useAPIKeysPageModel } from './api-keys.model';
import type { APIKeyRequestScope, APIKeysPageProps } from './api-keys.types';
import { APIKeysPageView } from './api-keys.view';

const RevokeAPIKeyConfirmationModal = lazy(() =>
  import(/* webpackChunkName: "revoke-api-key-modal"*/ './RevokeAPIKeyConfirmationModal').then(module => ({
    default: module.RevokeAPIKeyConfirmationModal,
  })),
);

const CopyAPIKeyModal = lazy(() =>
  import(/* webpackChunkName: "copy-api-key-modal"*/ './CopyAPIKeyModal').then(module => ({
    default: module.CopyAPIKeyModal,
  })),
);

const APIKeysPageContent = withCardStateProvider(
  ({ scope, ...props }: APIKeysPageProps & { scope: APIKeyRequestScope }) => {
    const search = useAPIKeysSearchController();
    const model = useAPIKeysPageModel({ ...props, query: search.query }, scope);
    const controller = useAPIKeysPageController(model, props, search);
    return (
      <APIKeysPageView
        controller={controller}
        CopyModal={CopyAPIKeyModal}
        RevokeModal={RevokeAPIKeyConfirmationModal}
      />
    );
  },
);

export const APIKeysPage = (props: APIKeysPageProps) => {
  const scope = useAPIKeyRequestScopeModel(props.subject);
  return (
    <APIKeysPageContent
      key={scope.scopeKey}
      scope={scope}
      {...props}
    />
  );
};

const APIKeysInternal = () => {
  const model = useAPIKeysModel();

  return (
    <Flow.Root
      flow='apiKeys'
      sx={{ width: '100%' }}
    >
      <APIKeysPage
        subject={model.subject}
        perPage={model.perPage}
      />
    </Flow.Root>
  );
};

export const APIKeys = withCoreUserGuard(APIKeysInternal);
