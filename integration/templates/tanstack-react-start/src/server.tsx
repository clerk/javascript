import { createStartHandler, defineHandlerCallback, defaultStreamHandler } from '@tanstack/react-start/server';
import { createRouter } from './router';
import { createClerkHandler } from '@clerk/tanstack-react-start/server';

const handlerFactory = createClerkHandler(
  createStartHandler({
    createRouter,
  }),
);

export default defineHandlerCallback(async event => {
  const startHandler = await handlerFactory(defaultStreamHandler);
  return startHandler(event);
});
