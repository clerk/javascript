import { usePassedHooks } from './PassedHooksContext';

export const usePathnameWithoutSplatRouteParams = () => {
  const { params, location } = usePassedHooks();
  const { pathname } = location;

  // Get the splat route params
  // Remix store splat route params in an object with a key of '*'
  // If there are no splat route params, we fallback to an empty string
  const splatRouteParam = params['*'] || '';

  // Remove the splat route param from the pathname
  // so we end up with the pathname where the components are mounted at
  // eg /user/123/profile/security will return /user/123/profile as the path
  const path = pathname.replace(splatRouteParam, '').replace(/\/$/, '').replace(/^\//, '').trim();

  return `/${path}`;
};
