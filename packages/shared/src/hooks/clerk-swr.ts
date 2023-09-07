export const disableSWRDevtools = () => {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.__SWR_DEVTOOLS_USE__ = undefined;
  }
};

export * from 'swr';
export { default as useSWR } from 'swr';
export { default as useSWRInfinite } from 'swr/infinite';
