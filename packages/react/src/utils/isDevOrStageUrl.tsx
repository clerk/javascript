import { createDevOrStagingUrlCache } from '@clerk/shared';
const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
export { isDevOrStagingUrl };
