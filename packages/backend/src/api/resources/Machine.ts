import type { MachineJSON } from './JSON';

export class Machine {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly instanceId: string,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: MachineJSON): Machine {
    return new Machine(data.id, data.name, data.instance_id, data.created_at, data.updated_at);
  }
}
