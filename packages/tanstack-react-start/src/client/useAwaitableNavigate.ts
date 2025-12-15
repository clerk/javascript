import type { NavigateOptions } from '@tanstack/react-router';
import { useLocation, useNavigate } from '@tanstack/react-router';
import React from 'react';

type Resolve = () => void;

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

  return (options: NavigateOptions) => {
    return new Promise<void>(res => {
      resolveFunctionsRef.current.push(res);
      navigate(options)
        .then(() => {
          res();
        })
        .catch(() => {
          res();
        });
    });
  };
};
