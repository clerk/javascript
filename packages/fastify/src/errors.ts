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

export const incompatibleFastifyVersion = (foundVersion: string) =>
  createErrorMessage(`@clerk/fastify requires fastify@>=5 but is being registered on fastify@${foundVersion}.

To resolve this, either:
  - upgrade your fastify dependency to ^5, or
  - pin @clerk/fastify@^1 to keep using fastify@4 (LTS):

      npm install @clerk/fastify@^1
      # or: pnpm add @clerk/fastify@^1
`);
