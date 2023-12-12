import { buildErrorThrower } from '@clerk/shared/error';

const errorThrower = buildErrorThrower({ packageName: '@clerk/clerk-react' });

export { errorThrower };
