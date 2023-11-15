import React from 'react';

import { CLERK_MODAL_STATE } from '../../core/constants';
import { readStateParam, removeClerkQueryParam } from '../../utils';

export const useClerkModalStateParams = () => {
  const [state, setState] = React.useState({ startPath: '', path: '', componentName: '', socialProvider: '' });
  const decodedRedirectParams = readStateParam();

  React.useLayoutEffect(() => {
    if (decodedRedirectParams) {
      setState(decodedRedirectParams);
    }
  }, []);

  const clearUrlStateParam = () => {
    setState({ startPath: '', path: '', componentName: '', socialProvider: '' });
  };

  const removeQueryParam = () => removeClerkQueryParam(CLERK_MODAL_STATE);

  return {
    urlStateParam: { ...state, clearUrlStateParam },
    decodedRedirectParams,
    clearUrlStateParam,
    removeQueryParam,
  };
};
