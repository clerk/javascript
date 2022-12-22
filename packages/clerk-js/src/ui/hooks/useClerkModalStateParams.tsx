import React from 'react';

import { readStateParam, removeClerkQueryParam } from '../../utils';

export const useClerkModalStateParams = () => {
  const contentRef = React.useRef({ path: '', componentName: '' });
  const decodedRedirectParams = readStateParam();

  React.useLayoutEffect(() => {
    if (decodedRedirectParams) {
      contentRef.current = decodedRedirectParams;
    }
  }, []);

  const clearUrlStateParam = () => {
    contentRef.current = { path: '', componentName: '' };
  };

  const removeQueryParam = () => removeClerkQueryParam('__clerk_modal_state');

  return { urlStateParam: contentRef.current, decodedRedirectParams, clearUrlStateParam, removeQueryParam };
};
