import React from 'react';

import { CLERK_MODAL_STATE } from '../../core/constants';
import { readStateParam, removeClerkQueryParam } from '../../utils';

export const useClerkModalStateParams = () => {
  const contentRef = React.useRef({ startPath: '', path: '', componentName: '', socialProvider: '' });
  const decodedRedirectParams = readStateParam();

  React.useLayoutEffect(() => {
    if (decodedRedirectParams) {
      contentRef.current = decodedRedirectParams;
    }
  }, []);

  const clearUrlStateParam = () => {
    contentRef.current = { startPath: '', path: '', componentName: '', socialProvider: '' };
  };

  const removeQueryParam = () => removeClerkQueryParam(CLERK_MODAL_STATE);

  return {
    urlStateParam: { ...contentRef.current, clearUrlStateParam },
    decodedRedirectParams,
    clearUrlStateParam,
    removeQueryParam,
  };
};
