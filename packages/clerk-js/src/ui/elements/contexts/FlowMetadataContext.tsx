import { createContextAndHook } from '@clerk/shared/react';
import React from 'react';

type FlowMetadata = {
  flow:
    | 'signIn'
    | 'signUp'
    | 'userButton'
    | 'userProfile'
    | 'userVerification'
    | 'organizationProfile'
    | 'createOrganization'
    | 'organizationSwitcher'
    | 'organizationList'
    | 'oneTap'
    | 'waitlist';
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
    | 'passwordPwnedMethods'
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
