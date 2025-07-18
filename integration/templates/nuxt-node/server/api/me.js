import { clerkClient } from '@clerk/nuxt/server';

export default eventHandler(async event => {
  const { userId } = event.context.auth();

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const user = await clerkClient(event).users.getUser(userId);

  return user;
});
