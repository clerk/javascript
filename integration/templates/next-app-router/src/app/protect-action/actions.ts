'use server';
import { __experimental_protectAction } from '@clerk/nextjs/server';

const logUserIdAction = __experimental_protectAction().action(auth => {
  return {
    userId: auth.userId,
  };
});

const logUserIdActionRole = __experimental_protectAction()
  .with({
    role: 'org:admin',
  })
  .action(auth => {
    return {
      userId: auth.userId,
    };
  });

const logUserIdActionReverification = __experimental_protectAction()
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

const logUserIdActionStack = __experimental_protectAction()
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
