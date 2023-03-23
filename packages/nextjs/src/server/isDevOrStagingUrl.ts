// TODO: use the same function from @clerk/shared once treeshakable
function createDevOrStagingUrlCache() {
  const DEV_OR_STAGING_SUFFIXES = [
    '.lcl.dev',
    '.stg.dev',
    '.lclstage.dev',
    '.stgstage.dev',
    '.dev.lclclerk.com',
    '.stg.lclclerk.com',
    '.accounts.lclclerk.com',
    'accountsstage.dev',
    'accounts.dev',
  ];

  const devOrStagingUrlCache = new Map<string, boolean>();

  return {
    isDevOrStagingUrl: (url: string | URL): boolean => {
      if (!url) {
        return false;
      }

      const hostname = typeof url === 'string' ? url : url.hostname;
      let res = devOrStagingUrlCache.get(hostname);
      if (res === undefined) {
        res = DEV_OR_STAGING_SUFFIXES.some(s => hostname.endsWith(s));
        devOrStagingUrlCache.set(hostname, res);
      }
      return res;
    },
  };
}
const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
export { isDevOrStagingUrl };
