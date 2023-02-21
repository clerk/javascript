import React from 'react';

import { CLERK_REDIRECT_STATE } from '../../core/constants';
import { readStateParam, removeClerkQueryParam } from '../../utils';

export const useClerkModalStateParams = () => {
  const [params, setParams] = React.useState({
    startPath: '',
    path: '',
    componentName: '',
    socialProvider: '',
    modal: false,
  });
  const decodedRedirectParams = readStateParam();

  React.useLayoutEffect(() => {
    if (decodedRedirectParams) {
      setParams(decodedRedirectParams);
    }
  }, []);

  const clearUrlStateParam = () => {
    setParams({ startPath: '', path: '', componentName: '', socialProvider: '', modal: false });
  };

  const removeQueryParam = () => removeClerkQueryParam(CLERK_REDIRECT_STATE);

  return {
    urlStateParam: { ...params, clearUrlStateParam },
    decodedRedirectParams,
    clearUrlStateParam,
    removeQueryParam,
  };
};
