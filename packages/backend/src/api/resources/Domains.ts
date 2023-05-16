import type { DomainJSON } from './JSON';

export class Domains {
  constructor(readonly id: string, readonly name: string) {}

  static fromJSON(data: DomainJSON): Domains {
    return new Domains(data.id, data.name);
  }
}
