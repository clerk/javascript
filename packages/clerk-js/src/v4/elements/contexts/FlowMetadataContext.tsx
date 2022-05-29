import React from 'react';

import { makeContextAndHook } from '../utils';

type FlowMetadata = {
  flow: 'signIn' | 'signUp';
  page: 'start' | 'emailOtp' | 'phoneOtp';
};

const [FlowMetadataCtx, useFlowMetadata] = makeContextAndHook<FlowMetadata>('FlowMetadata');

const FlowMetadataProvider = (props: React.PropsWithChildren<FlowMetadata>) => {
  const { flow, page } = props;
  const value = React.useMemo(() => ({ value: props }), [flow, page]);
  return <FlowMetadataCtx.Provider value={value}>{props.children}</FlowMetadataCtx.Provider>;
};

export { useFlowMetadata, FlowMetadataProvider };
export type { FlowMetadata };
