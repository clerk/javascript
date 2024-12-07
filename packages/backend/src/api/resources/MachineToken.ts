import type { MachineTokenJSON } from './JSON';

export class MachineToken {
  constructor(readonly token: string) {}

  static fromJSON(data: MachineTokenJSON): MachineToken {
    return new MachineToken(data.jwt);
  }
}
