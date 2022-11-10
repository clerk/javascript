export const userHasDefaultImage = (url: string) => {
  return !(url || '').includes('gravatar');
};
