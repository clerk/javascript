export const isDefaultProfileImage = (url: string) => {
  return !(url || '').includes('gravatar');
};
