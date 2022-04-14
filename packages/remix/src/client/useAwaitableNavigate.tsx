import { useNavigate, useTransition } from '@remix-run/react';
import React from 'react';

type Resolve = (value?: unknown) => void;

export const useAwaitableNavigate = () => {
  const navigate = useNavigate();
  const transition = useTransition();
  const resolveFunctionsRef = React.useRef<Resolve[]>([]);

  const resolveAll = () => {
    if (transition.state !== 'idle') {
      return;
    }
    resolveFunctionsRef.current.forEach(resolve => resolve());
    resolveFunctionsRef.current.splice(0, resolveFunctionsRef.current.length);
  };

  React.useEffect(() => {
    resolveAll();
  }, [transition.state]);

  return (to: string) => {
    return new Promise(res => {
      resolveFunctionsRef.current.push(res);
      navigate(to);
    });
  };
};
