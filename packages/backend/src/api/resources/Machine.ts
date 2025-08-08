import type { MachineJSON } from './JSON';

export class Machine {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly instanceId: string,
    readonly createdAt: number,
    readonly updatedAt: number,
    readonly scopedMachines: Machine[],
    readonly defaultTokenTtl: number,
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
