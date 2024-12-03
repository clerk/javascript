import type {
  CreateEnterpriseSsoLinkFlowReturn,
  EmailAddressResource,
  StartEnterpriseSsoLinkFlowParams,
} from '@clerk/types';
import React from 'react';

type EnterpriseSsoLinkEmailAddressReturn = CreateEnterpriseSsoLinkFlowReturn<
  StartEnterpriseSsoLinkFlowParams,
  EmailAddressResource
>;

function useEnterpriseSsoLink(resource: EmailAddressResource): EnterpriseSsoLinkEmailAddressReturn {
  const { startEnterpriseSsoLinkFlow, cancelEnterpriseSsoLinkFlow } = React.useMemo(
    () => resource.createEnterpriseSsoLinkFlow(),
    [resource],
  );

  React.useEffect(() => {
    return cancelEnterpriseSsoLinkFlow;
  }, []);

  return {
    startEnterpriseSsoLinkFlow,
    cancelEnterpriseSsoLinkFlow,
  };
}

export { useEnterpriseSsoLink };
