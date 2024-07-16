import { $clerk } from '../stores/internal';

/**
 * Loop through any Astro component that has requested to invoke a function and invoke it with its respective props.
 */
const invokeClerkAstroJSFunctions = () => {
  const functionNames = ['handleRedirectCallback'] as const;

  functionNames.forEach(fnName => {
    const elementsOfCategory = document.querySelectorAll(`[data-clerk-function-id^="clerk-${fnName}"]`);
    elementsOfCategory.forEach(el => {
      const id = el.getAttribute('data-clerk-function-id');
      const props = window.__astro_clerk_function_props?.get(fnName)?.get(id!) ?? {};
      void $clerk.get()?.[fnName]?.(props);
    });
  });
};

export { invokeClerkAstroJSFunctions };
