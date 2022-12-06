import React from 'react';

import { readAndRemoveStateParam, removeClerkQueryParam } from '../../utils';

export const useReadParamState = () => {
  const contentRef = React.useRef({ path: '', componentName: '' });
  const decodedRedirectParams = readAndRemoveStateParam();

  React.useLayoutEffect(() => {
    if (decodedRedirectParams) {
      contentRef.current = decodedRedirectParams;
    }
  }, []);

  const clearUrlStateParam = () => {
    contentRef.current = { path: '', componentName: '' };
  };

  const removeQueryParam = () => removeClerkQueryParam('__clerk_state');

  return { urlStateParam: contentRef.current, decodedRedirectParams, clearUrlStateParam, removeQueryParam };
};
