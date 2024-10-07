'use client';

import {
  UserVerificationModal as SharedUserVerificationModal,
  UserVerificationTrigger as SharedUserVerificationTrigger,
} from '@clerk/shared/react';
import { useRouter as usePagesRouter } from 'next/compat/router';
import type { NextRouter } from 'next/router';
import type { ComponentProps } from 'react';
import React from 'react';

const UserVerificationTrigger = (props: ComponentProps<'button'>): React.JSX.Element => {
  return (
    <SharedUserVerificationTrigger
      {...props}
      afterVerificationCancelled={
        //TODO-STEP-UP: Figure out how to go back in nextjs
        () => null
      }
    />
  );
};

interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

function customPromiseWithResolvers() {
  let resolve: PromiseWithResolvers<unknown>['resolve'];
  let reject: PromiseWithResolvers<unknown>['reject'];

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    // @ts-ignore
    resolve,
    // @ts-ignore
    reject,
  };
}

const UserVerificationModal = (): React.JSX.Element | null => {
  const pagesRouter = usePagesRouter();
  let router = pagesRouter;
  let useRouter;

  if (!pagesRouter) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    useRouter = require('next/navigation').useRouter;
  }

  router = (useRouter?.() || pagesRouter) as NextRouter;

  return (
    <SharedUserVerificationModal
      afterVerificationCancelled={async () => {
        const p = customPromiseWithResolvers();
        window.addEventListener('popstate', () => {
          p.resolve(true);
        });
        setTimeout(() => {
          p.reject();
        }, 500);
        router.back();
        try {
          await p.promise;
        } catch {
          void router.replace('/');
        }
      }}
    />
  );
};

export { UserVerificationTrigger, UserVerificationModal };
