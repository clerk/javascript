import type {
  CreateEnterpriseConnectionLinkFlowReturn,
  EmailAddressResource,
  StartEnterpriseConnectionLinkFlowParams,
} from '@clerk/types';
import React from 'react';

type EnterpriseConnectionLinkable = EmailAddressResource;
type EnterpriseConnectionLinkEmailAddressReturn = CreateEnterpriseConnectionLinkFlowReturn<
  StartEnterpriseConnectionLinkFlowParams,
  EmailAddressResource
>;

function useEnterpriseConnectionLink(
  resource: EnterpriseConnectionLinkable,
): EnterpriseConnectionLinkEmailAddressReturn {
  const { startEnterpriseConnectionLinkFlow, cancelEnterpriseConnectionLinkFlow } = React.useMemo(
    () => resource.createEnterpriseConnectionLinkFlow(),
    [resource],
  );

  React.useEffect(() => {
    return cancelEnterpriseConnectionLinkFlow;
  }, []);

  return {
    startEnterpriseConnectionLinkFlow,
    cancelEnterpriseConnectionLinkFlow,
  };
}

export { useEnterpriseConnectionLink };
