// https://github.com/clerk/javascript/blob/main/packages/remix/src/errors.ts#L1-L0
const createErrorMessage = (msg: string) => {
  return `🔒 Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
or come say hi in our discord server: https://clerk.com/discord
`;
};

export const pluginRegistrationRequired =
  createErrorMessage(`The "clerkPlugin" should be registered before using the "getAuth".
Example:

import { clerkPlugin } from '@clerk/fastify';

const server: FastifyInstance = Fastify({ logger: true });
server.register(clerkPlugin);
`);
