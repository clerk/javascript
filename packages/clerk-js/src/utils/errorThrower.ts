import { buildErrorThrower } from '@clerk/shared';

import packageJSON from '../../package.json';

const errorThrower = buildErrorThrower({ packageName: packageJSON.name });

export { errorThrower };
