import { useLocation, useNavigate } from '@remix-run/react';
import React from 'react';
import type { NavigateOptions } from 'react-router';

type Resolve = (value?: unknown) => void;

export const useAwaitableNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resolveFunctionsRef = React.useRef<Resolve[]>([]);
  const resolveAll = () => {
    resolveFunctionsRef.current.forEach(resolve => resolve());
    resolveFunctionsRef.current.splice(0, resolveFunctionsRef.current.length);
  };

  // location.key will change even when navigating to the same url,
  // so we will successfully resolve in that case as well
  React.useEffect(() => {
    resolveAll();
  }, [location]);

  return (to: string, opts?: NavigateOptions) => {
    return new Promise(res => {
      resolveFunctionsRef.current.push(res);
      navigate(to, opts);
    });
  };
};
