export const deprecationWarning = (name: string, deprecation: string) => {
  console.warn(`${name} has been deprecated and will be removed in the next major version!
    Deprecation: ${deprecation}`);
};
