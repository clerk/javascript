import type { NavigateOptions } from '@tanstack/solid-router';
import { useLocation, useNavigate } from '@tanstack/solid-router';
import { createEffect, useTransition } from 'solid-js';

type Resolve = (value?: unknown) => void;

export const useAwaitableNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resolveFunctionsRef: Resolve[] = [];
  const resolveAll = () => {
    resolveFunctionsRef.forEach(resolve => resolve());
    resolveFunctionsRef.splice(0, resolveFunctionsRef.length);
  };
  const [_, startTransition] = useTransition();

  createEffect(() => {
    location();
    resolveAll();
  });

  return (options: NavigateOptions) => {
    return new Promise(res => {
      startTransition(() => {
        resolveFunctionsRef.push(res);
        res(navigate(options));
      });
    });
  };
};
