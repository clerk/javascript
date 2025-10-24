import type { MachineSecretKeyJSON } from './JSON';

/**
 * The Backend `MachineSecretKey` object holds information about a machine secret key.
 */
export class MachineSecretKey {
  constructor(readonly secret: string) {}

  static fromJSON(data: MachineSecretKeyJSON): MachineSecretKey {
    return new MachineSecretKey(data.secret);
  }
}
