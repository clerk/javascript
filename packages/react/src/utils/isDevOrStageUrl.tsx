import { createDevOrStagingUrlCache } from '@clerk/utils';
const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
export { isDevOrStagingUrl };
