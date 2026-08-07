import type { MachineScopeJSON } from './JSON';

/**
 * The Backend `MachineScope` object holds information about a machine scope.
 */
export class MachineScope {
  constructor(
    /** The ID of the machine that has access to the target machine. */
    readonly fromMachineId: string,
    /** The ID of the machine that is being accessed. */
    readonly toMachineId: string,
    /** The Unix timestamp when the machine scope was created. */
    readonly createdAt?: number,
    /** Whether the machine scope has been deleted. */
    readonly deleted?: boolean,
  ) {}

  static fromJSON(data: MachineScopeJSON): MachineScope {
    return new MachineScope(data.from_machine_id, data.to_machine_id, data.created_at, data.deleted);
  }
}
