import type { CnameTargetJSON } from './JSON';

export class CnameTarget {
  constructor(
    readonly host: string,
    readonly value: string,
    readonly required: boolean,
  ) {}

  static fromJSON(data: CnameTargetJSON): CnameTarget {
    return new CnameTarget(data.host, data.value, data.required);
  }
}
