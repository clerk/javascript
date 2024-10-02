'use server';
import { protectAction } from '@clerk/nextjs/server';

const logUserIdAction = protectAction().action(auth => {
  return {
    userId: auth.userId,
  };
});

const logUserIdActionRole = protectAction()
  .with({
    role: 'org:admin',
  })
  .action(auth => {
    return {
      userId: auth.userId,
    };
  });

const logUserIdActionReverification = protectAction()
  .with({
    reverification: {
      level: 'secondFactor',
      afterMinutes: 1,
    },
  })
  .action(auth => {
    return {
      userId: auth.userId,
    };
  });

const logUserIdActionStack = protectAction()
  .with({
    role: 'org:admin',
  })
  .with({
    reverification: {
      level: 'secondFactor',
      afterMinutes: 1,
    },
  })
  .action(auth => {
    return {
      userId: auth.userId,
    };
  });

export { logUserIdAction, logUserIdActionRole, logUserIdActionReverification, logUserIdActionStack };
