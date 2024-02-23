import React, { useContext, useState } from 'react';

type FlowMetadata = {
  flow?:
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

// set the defaults
const FlowMetadataCtx = React.createContext<FlowMetadata & { setPart: (part: FlowMetadata['part']) => void }>({
  flow: undefined,
  part: undefined,
  setPart: () => {},
});

const FlowMetadataProvider = (props: React.PropsWithChildren<FlowMetadata>) => {
  const [part, setPart] = useState(props.part);

  return (
    <FlowMetadataCtx.Provider value={{ flow: props.flow, part: part, setPart: setPart as any }}>
      {props.children}
    </FlowMetadataCtx.Provider>
  );
};
const useFlowMetadata = () => {
  const { flow, part, setPart } = useContext(FlowMetadataCtx);
  return { flow, part, setPart };
};

export { useFlowMetadata, FlowMetadataProvider };
export type { FlowMetadata };
