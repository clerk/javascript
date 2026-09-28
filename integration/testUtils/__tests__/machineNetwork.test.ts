import { createClerkClient } from '@clerk/backend';
import { faker } from '@faker-js/faker';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFakeMachineNetwork } from '../machineNetwork';

function createClient() {
  const client = createClerkClient({ secretKey: 'sk_test_fixture' });
  let machineCount = 0;
  const createMachine = vi.spyOn(client.machines, 'create').mockImplementation(({ name }) =>
    Promise.resolve({
      id: `machine_${++machineCount}`,
      name,
      instanceId: 'instance_test',
      createdAt: 0,
      updatedAt: 0,
      scopedMachines: [],
      defaultTokenTtl: 1800,
      secretKey: 'msk_test_fixture',
    }),
  );
  const deleteMachine = vi.spyOn(client.machines, 'delete').mockResolvedValue({
    id: 'machine_deleted',
    name: 'Deleted machine',
    instanceId: 'instance_test',
    createdAt: 0,
    updatedAt: 0,
    scopedMachines: [],
    defaultTokenTtl: 1800,
  });
  let tokenCount = 0;
  const createToken = vi.spyOn(client.m2m, 'createToken').mockImplementation(() =>
    Promise.resolve({
      id: `token_${++tokenCount}`,
      subject: 'machine_test',
      scopes: [],
      claims: null,
      revoked: false,
      revocationReason: null,
      expired: false,
      expiration: 1800000,
      createdAt: 0,
      updatedAt: 0,
      token: 'mt_test_fixture',
    }),
  );
  const revokeToken = vi.spyOn(client.m2m, 'revokeToken').mockImplementation(({ m2mTokenId }) =>
    Promise.resolve({
      id: m2mTokenId,
      subject: 'machine_test',
      scopes: [],
      claims: null,
      revoked: true,
      revocationReason: null,
      expired: false,
      expiration: 1800000,
      createdAt: 0,
      updatedAt: 0,
    }),
  );
  return { client, createMachine, deleteMachine, createToken, revokeToken };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createFakeMachineNetwork', () => {
  it('uses different machine names for separate networks even when company names repeat', async () => {
    vi.spyOn(faker.company, 'name').mockReturnValue('Repeated Company');
    const { client, createMachine } = createClient();

    await createFakeMachineNetwork(client);
    await createFakeMachineNetwork(client);

    expect(new Set(createMachine.mock.calls.map(([params]) => params.name)).size).toBe(6);
  });

  it('cleans up created machines and tokens when later setup fails', async () => {
    const { client, createMachine, deleteMachine, revokeToken } = createClient();
    const create = createMachine.getMockImplementation();
    if (!create) {
      throw new Error('Missing machine API implementation');
    }
    const error = new Error('Machine creation failed');
    createMachine.mockImplementationOnce(create).mockImplementationOnce(create).mockRejectedValueOnce(error);

    await expect(createFakeMachineNetwork(client)).rejects.toBe(error);

    expect(revokeToken).toHaveBeenCalledWith({ m2mTokenId: 'token_1' });
    expect(deleteMachine.mock.calls).toEqual([['machine_1'], ['machine_2']]);
  });

  it('attempts every deletion and reports failures even when token revocation fails', async () => {
    const { client, deleteMachine, revokeToken } = createClient();
    const network = await createFakeMachineNetwork(client);
    const revocationError = new Error('Token revocation failed');
    const deletionError = new Error('Machine deletion failed');
    revokeToken.mockRejectedValueOnce(revocationError);
    deleteMachine.mockRejectedValueOnce(deletionError);

    await expect(network.cleanup()).rejects.toMatchObject({ errors: [revocationError, deletionError] });

    expect(revokeToken.mock.calls).toEqual([[{ m2mTokenId: 'token_1' }], [{ m2mTokenId: 'token_2' }]]);
    expect(deleteMachine.mock.calls).toEqual([['machine_1'], ['machine_2'], ['machine_3']]);
  });

  it('preserves the setup error when cleaning up partial setup also fails', async () => {
    const { client, createToken, deleteMachine } = createClient();
    const setupError = new Error('Token creation failed');
    const cleanupError = new Error('Machine deletion failed');
    createToken.mockRejectedValueOnce(setupError);
    deleteMachine.mockRejectedValueOnce(cleanupError);

    await expect(createFakeMachineNetwork(client)).rejects.toMatchObject({
      errors: [setupError, { errors: [cleanupError] }],
    });
    expect(deleteMachine.mock.calls).toEqual([['machine_1'], ['machine_2']]);
  });
});
