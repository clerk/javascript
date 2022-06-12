import React from 'react';

import { createContextAndHook } from '../../utils';

type FlowMetadata = {
  flow: 'signIn' | 'signUp';
  page:
    | 'start'
    | 'emailCode'
    | 'phoneCode'
    | 'password'
    | 'emailLink'
    | 'alternativeMethods'
    | 'havingTrouble'
    | 'ssoCallback'
    | 'emailLinkVerify';
};

const [FlowMetadataCtx, useFlowMetadata] = createContextAndHook<FlowMetadata>('FlowMetadata');

const FlowMetadataProvider = (props: React.PropsWithChildren<FlowMetadata>) => {
  const { flow, page } = props;
  const value = React.useMemo(() => ({ value: props }), [flow, page]);
  return <FlowMetadataCtx.Provider value={value}>{props.children}</FlowMetadataCtx.Provider>;
};

export { useFlowMetadata, FlowMetadataProvider };
export type { FlowMetadata };
