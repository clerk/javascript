import { useLocation, useParams } from 'react-router';

export const usePathnameWithoutSplatRouteParams = () => {
  const params = useParams();
  const { pathname } = useLocation();

  // Get the splat route params
  // React Router stores splat route params in an object with a key of '*'
  // If there are no splat route params, we fallback to an empty string
  const splatRouteParam = params['*'] || '';

  // Remove the splat route param from the pathname
  // so we end up with the pathname where the components are mounted at
  // eg /user/123/profile/security will return /user/123/profile as the path
  const path = pathname.replace(splatRouteParam, '').replace(/\/$/, '').replace(/^\//, '').trim();

  return `/${path}`;
};
