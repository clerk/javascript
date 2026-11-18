import type { MachineJSON } from './JSON';

/**
 * The Backend `Machine` object holds information about a machine.
 */
export class Machine {
  constructor(
    /** The unique identifier for the machine. */
    readonly id: string,
    /** The name of the machine. */
    readonly name: string,
    /** The ID of the instance the machine belongs to. */
    readonly instanceId: string,
    /** The Unix timestamp when the machine was created. */
    readonly createdAt: number,
    /** The Unix timestamp when the machine was last updated. */
    readonly updatedAt: number,
    /** The machines that the current machine has access to. */
    readonly scopedMachines: Machine[],
    /** The default time-to-live (TTL) in seconds for tokens created by this machine. */
    readonly defaultTokenTtl: number,
    /** The secret key for the machine. */
    readonly secretKey?: string,
  ) {}

  static fromJSON(data: MachineJSON): Machine {
    return new Machine(
      data.id,
      data.name,
      data.instance_id,
      data.created_at,
      data.updated_at,
      data.scoped_machines.map(
        m =>
          new Machine(
            m.id,
            m.name,
            m.instance_id,
            m.created_at,
            m.updated_at,
            [], // Nested machines don't have scoped_machines
            m.default_token_ttl,
          ),
      ),
      data.default_token_ttl,
      data.secret_key,
    );
  }
}
