import { createStartHandler, defineHandlerCallback, defaultStreamHandler } from '@tanstack/react-start/server';
import { createRouter } from './router';
import { createClerkHandler } from '@clerk/tanstack-react-start/server';

export default defineHandlerCallback(async event => {
  const startHandler = await createClerkHandler(
    createStartHandler({
      createRouter,
    }),
  )(defaultStreamHandler);

  return startHandler(event);
});
