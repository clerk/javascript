import type { MachineScopeJSON } from './JSON';

/**
 * The Backend `MachineScope` object holds information about a machine scope.
 */
export class MachineScope {
  constructor(
    readonly fromMachineId: string,
    readonly toMachineId: string,
    readonly createdAt?: number,
    readonly deleted?: boolean,
  ) {}

  static fromJSON(data: MachineScopeJSON): MachineScope {
    return new MachineScope(data.from_machine_id, data.to_machine_id, data.created_at, data.deleted);
  }
}
