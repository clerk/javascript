import { useRef } from 'react';
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

  const computedPath = `/${path}`;

  // Stabilize the base path to prevent race conditions during navigation away.
  // When the router navigates to a different route, useLocation() returns the
  // new pathname before this component unmounts. This causes the basePath to change,
  // which makes the SignIn/SignUp catch-all route fire RedirectToSignIn incorrectly.
  // Matches the pattern used in @clerk/nextjs usePathnameWithoutCatchAll.
  const stablePath = useRef(computedPath);
  return stablePath.current;
};
