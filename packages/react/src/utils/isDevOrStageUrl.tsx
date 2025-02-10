import { createDevOrStagingUrlCache } from '@clerk/shared/keys';
const { isDevOrStagingUrl } = createDevOrStagingUrlCache();
export { isDevOrStagingUrl };
