import { randomUUID } from 'node:crypto';

import type { ClerkClient, M2MToken, Machine } from '@clerk/backend';
import { faker } from '@faker-js/faker';

export type FakeMachineNetwork = {
  primaryServer: Machine;
  scopedSender: Machine;
  unscopedSender: Machine;
  scopedSenderToken: M2MToken;
  unscopedSenderToken: M2MToken;
  cleanup: () => Promise<void>;
};

export async function createFakeMachineNetwork(clerkClient: ClerkClient): Promise<FakeMachineNetwork> {
  const fakeCompanyName = `${faker.company.name()}-${randomUUID()}`;

  const machineIds: string[] = [];
  const tokenIds: string[] = [];
  const cleanup = async () => {
    const tokenResults = await Promise.allSettled(
      tokenIds.map(m2mTokenId => clerkClient.m2m.revokeToken({ m2mTokenId })),
    );
    const machineResults = await Promise.allSettled(
      machineIds.map(machineId => clerkClient.machines.delete(machineId)),
    );
    const errors = [...tokenResults, ...machineResults].flatMap(result =>
      result.status === 'rejected' ? [result.reason] : [],
    );
    if (errors.length > 0) {
      throw new AggregateError(errors, 'Failed to clean up M2M test resources');
    }
  };

  try {
    const primaryServer = await clerkClient.machines.create({
      name: `${fakeCompanyName} Primary API Server`,
    });
    machineIds.push(primaryServer.id);

    const scopedSender = await clerkClient.machines.create({
      name: `${fakeCompanyName} Scoped Sender`,
      scopedMachines: [primaryServer.id],
    });
    machineIds.push(scopedSender.id);
    const scopedSenderToken = await clerkClient.m2m.createToken({
      machineSecretKey: scopedSender.secretKey,
      secondsUntilExpiration: 60 * 30,
    });
    tokenIds.push(scopedSenderToken.id);

    const unscopedSender = await clerkClient.machines.create({
      name: `${fakeCompanyName} Unscoped Sender`,
    });
    machineIds.push(unscopedSender.id);
    const unscopedSenderToken = await clerkClient.m2m.createToken({
      machineSecretKey: unscopedSender.secretKey,
      secondsUntilExpiration: 60 * 30,
    });

    tokenIds.push(unscopedSenderToken.id);

    return {
      primaryServer,
      scopedSender,
      unscopedSender,
      scopedSenderToken,
      unscopedSenderToken,
      cleanup,
    };
  } catch (error) {
    try {
      await cleanup();
    } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Failed to create and clean up M2M test resources');
    }
    throw error;
  }
}
