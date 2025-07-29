import type { MachineSecretKeyJSON } from './JSON';

export class MachineSecretKey {
  constructor(readonly secret: string) {}

  static fromJSON(data: MachineSecretKeyJSON): MachineSecretKey {
    return new MachineSecretKey(data.secret);
  }
}
