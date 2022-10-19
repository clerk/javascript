import React from 'react';

import { createContextAndHook } from '@clerk/shared';

type FlowMetadata = {
  flow: 'signIn' | 'signUp' | 'userButton' | 'userProfile' | 'organizationProfile' | 'organizationSwitcher';
  part?:
    | 'start'
    | 'emailCode'
    | 'phoneCode'
    | 'phoneCode2Fa'
    | 'totp2Fa'
    | 'backupCode2Fa'
    | 'password'
    | 'emailLink'
    | 'emailLinkVerify'
    | 'emailLinkStatus'
    | 'alternativeMethods'
    | 'havingTrouble'
    | 'ssoCallback'
    | 'popover'
    | 'complete'
    | 'accountSwitcher';
};

const [FlowMetadataCtx, useFlowMetadata] = createContextAndHook<FlowMetadata>('FlowMetadata');

const FlowMetadataProvider = (props: React.PropsWithChildren<FlowMetadata>) => {
  const { flow, part } = props;
  const value = React.useMemo(() => ({ value: props }), [flow, part]);
  return <FlowMetadataCtx.Provider value={value}>{props.children}</FlowMetadataCtx.Provider>;
};

export { useFlowMetadata, FlowMetadataProvider };
export type { FlowMetadata };
