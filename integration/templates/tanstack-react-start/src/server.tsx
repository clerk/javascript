import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server';
import { createRouter } from './router';
import { createClerkHandler } from '@clerk/tanstack-react-start/server';

export default createClerkHandler(
  createStartHandler({
    createRouter,
  }),
)(defaultStreamHandler);
