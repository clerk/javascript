import { createHash } from 'node:crypto';

import type { ClerkClient, User } from '@clerk/backend';

type E2EUserRecord = {
  username: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
  privateMetadata: Record<string, unknown>;
};

const encodeHexAsLetters = (hex: string): string =>
  Array.from(hex, character => String.fromCharCode(97 + Number.parseInt(character, 16))).join('');

export const getE2ERunToken = (runKey = process.env.INTEGRATION_TEST_RUN_KEY): string | undefined => {
  if (!runKey) {
    return;
  }

  const digest = createHash('sha256').update(runKey).digest('hex').slice(0, 20);
  return encodeHexAsLetters(digest);
};

export const getE2ERunMarker = (runKey = process.env.INTEGRATION_TEST_RUN_KEY): string | undefined => {
  const runToken = getE2ERunToken(runKey);
  if (!runToken) {
    return;
  }

  return `e2e_${runToken}`;
};

export const getE2EApplicationRunMarker = (runKey = process.env.INTEGRATION_TEST_RUN_KEY): string | undefined => {
  const runToken = getE2ERunToken(runKey);
  return runToken ? `run-${runToken}` : undefined;
};

export const userMatchesE2ERun = (user: E2EUserRecord, marker: string): boolean =>
  Boolean(
    user.username?.includes(marker) ||
    user.emailAddresses.some(email => email.emailAddress.includes(marker)) ||
    user.privateMetadata.e2eRunMarker === marker,
  );

export const findE2ERunUsers = async (clerkClient: ClerkClient, marker: string): Promise<User[]> => {
  const usersById = new Map<string, User>();
  let offset = 0;

  while (true) {
    const { data } = await clerkClient.users.getUserList({ query: marker, limit: 100, offset });
    data.filter(user => userMatchesE2ERun(user, marker)).forEach(user => usersById.set(user.id, user));

    if (data.length < 100) {
      break;
    }
    offset += data.length;
  }

  return Array.from(usersById.values());
};
