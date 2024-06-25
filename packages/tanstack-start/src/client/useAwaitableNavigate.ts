import type { NavigateOptions } from '@tanstack/react-router';
import { useLocation, useNavigate } from '@tanstack/react-router';
import React from 'react';

type Resolve = (value?: unknown) => void;

export const useAwaitableNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resolveFunctionsRef = React.useRef<Resolve[]>([]);
  const resolveAll = () => {
    resolveFunctionsRef.current.forEach(resolve => resolve());
    resolveFunctionsRef.current.splice(0, resolveFunctionsRef.current.length);
  };

  React.useEffect(() => {
    resolveAll();
  }, [location]);

  return ({ to, replace }: NavigateOptions) => {
    return new Promise(res => {
      resolveFunctionsRef.current.push(res);
      res(
        navigate({
          to,
          replace,
        }),
      );
    });
  };
};
