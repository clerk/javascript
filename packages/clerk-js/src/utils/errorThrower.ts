import { buildErrorThrower } from '@clerk/shared';

import { name } from '../../package.json';

const errorThrower = buildErrorThrower({ packageName: name });

export { errorThrower };
