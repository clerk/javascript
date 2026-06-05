import { createContext, useContext } from 'react';

import type { __experimental_MosaicOrganizationProfileCtx } from '../../types';

export const __experimental_MosaicOrganizationProfileContext =
  createContext<__experimental_MosaicOrganizationProfileCtx | null>(null);

export const __experimental_useMosaicOrganizationProfileContext = () => {
  const context = useContext(__experimental_MosaicOrganizationProfileContext);

  if (!context || context.componentName !== '__experimental_MosaicOrganizationProfile') {
    throw new Error(
      'Clerk: __experimental_useMosaicOrganizationProfileContext called outside MosaicOrganizationProfile.',
    );
  }

  const { componentName, ...ctx } = context;

  return {
    ...ctx,
    componentName,
  };
};
