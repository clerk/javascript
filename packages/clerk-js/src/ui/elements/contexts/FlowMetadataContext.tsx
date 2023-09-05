import { createContextAndHook } from '@clerk/shared';
import React from 'react';

type FlowMetadata = {
  flow:
    | 'signIn'
    | 'signUp'
    | 'userButton'
    | 'userProfile'
    | 'organizationProfile'
    | 'createOrganization'
    | 'organizationSwitcher'
    | 'organizationList';
  part?:
    | 'start'
    | 'emailCode'
    | 'phoneCode'
    | 'phoneCode2Fa'
    | 'totp2Fa'
    | 'backupCode2Fa'
    | 'password'
    | 'resetPassword'
    | 'emailLink'
    | 'emailLinkVerify'
    | 'emailLinkStatus'
    | 'alternativeMethods'
    | 'forgotPasswordMethods'
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
