import { useRouter } from 'next/compat/router';

export const usePagesRouter = () => {
  // The compat version of useRouter returns null instead of throwing an error
  // when used inside app router instead of pages router
  // we use it to detect if the component is used inside pages or app router
  // so we can use the correct algorithm to get the path
  return { pagesRouter: useRouter() };
};
