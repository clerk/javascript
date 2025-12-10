import type {
  CreateEnterpriseSSOLinkFlowReturn,
  EmailAddressResource,
  StartEnterpriseSSOLinkFlowParams,
} from '@clerk/shared/types';
import React from 'react';

type EnterpriseSSOLinkEmailAddressReturn = CreateEnterpriseSSOLinkFlowReturn<
  StartEnterpriseSSOLinkFlowParams,
  EmailAddressResource
>;

function useEnterpriseSSOLink(resource: EmailAddressResource): EnterpriseSSOLinkEmailAddressReturn {
  const { startEnterpriseSSOLinkFlow, cancelEnterpriseSSOLinkFlow } = React.useMemo(
    () => resource.createEnterpriseSSOLinkFlow(),
    [resource],
  );

  React.useEffect(() => {
    return cancelEnterpriseSSOLinkFlow;
  }, []);

  return {
    startEnterpriseSSOLinkFlow,
    cancelEnterpriseSSOLinkFlow,
  };
}

export { useEnterpriseSSOLink };
