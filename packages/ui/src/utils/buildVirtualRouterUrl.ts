export const buildVirtualRouterUrl = ({ base, path }: { base: string; path: string | undefined }) => {
  if (!path) {
    return base;
  }

  return base + path;
};
