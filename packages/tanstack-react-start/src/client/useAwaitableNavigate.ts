import type { NavigateOptions } from '@tanstack/react-router';
import { useLocation, useNavigate } from '@tanstack/react-router';
import React, { useTransition } from 'react';

type Resolve = (value?: unknown) => void;

export const useAwaitableNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resolveFunctionsRef = React.useRef<Resolve[]>([]);
  const resolveAll = () => {
    resolveFunctionsRef.current.forEach(resolve => resolve());
    resolveFunctionsRef.current.splice(0, resolveFunctionsRef.current.length);
  };
  const [_, startTransition] = useTransition();

  React.useEffect(() => {
    resolveAll();
  }, [location]);

  return (options: NavigateOptions) => {
    return new Promise(res => {
      startTransition(() => {
        resolveFunctionsRef.current.push(res);
        navigate(options);
      });
    });
  };
};
