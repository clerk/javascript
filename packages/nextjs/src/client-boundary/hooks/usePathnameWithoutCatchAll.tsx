import React from 'react';

import { usePagesRouter } from './usePagesRouter';

export const usePathnameWithoutCatchAll = () => {
  const pathRef = React.useRef<string>();

  const { pagesRouter } = usePagesRouter();

  if (pagesRouter) {
    if (pathRef.current) {
      return pathRef.current;
    } else {
      // in pages router things are simpler as the pathname includes the catch all route
      // which starts with [[... and we can just remove it
      pathRef.current = pagesRouter.pathname.replace(/\/\[\[\.\.\..*/, '');
      return pathRef.current;
    }
  }

  // require is used to avoid importing next/navigation when the pages router is used,
  // as it will throw an error. We cannot use dynamic import as it is async
  // and we need the hook to be sync
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const usePathname = require('next/navigation').usePathname;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const useParams = require('next/navigation').useParams;

  // Get the pathname that includes any named or catch all params
  // eg:
  // the filesystem route /user/[id]/profile/[[...rest]]/page.tsx
  // could give us the following pathname /user/123/profile/security
  // if the user navigates to the security section of the user profile
  const pathname = usePathname() || '';
  const pathParts = pathname.split('/').filter(Boolean);
  // the useParams hook returns an object with all named and catch all params
  // for named params, the key in the returned object always contains a single value
  // for catch all params, the key in the returned object contains an array of values
  // we find the catch all params by checking if the value is an array
  // and then we remove one path part for each catch all param
  const catchAllParams = Object.values(useParams() || {})
    .filter(v => Array.isArray(v))
    .flat(Infinity);
  // so we end up with the pathname where the components are mounted at
  // eg /user/123/profile/security will return /user/123/profile as the path
  if (pathRef.current) {
    return pathRef.current;
  } else {
    pathRef.current = `/${pathParts.slice(0, pathParts.length - catchAllParams.length).join('/')}`;
    return pathRef.current;
  }
};
