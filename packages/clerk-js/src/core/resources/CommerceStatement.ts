import type {
  CommerceStatementGroupJSON,
  CommerceStatementJSON,
  CommerceStatementResource,
  CommerceStatementStatus,
  CommerceStatementTotals,
} from '@clerk/types';

import { commerceTotalsFromJSON } from '../../utils';
import { BaseResource, CommercePayment } from './internal';
import { parseJSON } from './parser';

export class CommerceStatement extends BaseResource implements CommerceStatementResource {
  id!: string;
  status!: CommerceStatementStatus;
  timestamp!: Date;
  totals!: CommerceStatementTotals;
  groups!: CommerceStatementGroup[];

  constructor(data: CommerceStatementJSON) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceStatementJSON | null): this {
    Object.assign(
      this,
      parseJSON<CommerceStatement>(data, {
        dateFields: ['timestamp'],
        customTransforms: {
          totals: value => commerceTotalsFromJSON(value),
          // @ts-expect-error
          groups: value => value.map(group => new CommerceStatementGroup(group)),
        },
      }),
    );
    return this;
  }
}

export class CommerceStatementGroup {
  id!: string;
  timestamp!: Date;
  items!: CommercePayment[];

  constructor(data: CommerceStatementGroupJSON) {
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceStatementGroupJSON | null): this {
    Object.assign(
      this,
      parseJSON<CommerceStatementGroup>(data, {
        dateFields: ['timestamp'],
        customTransforms: {
          // @ts-expect-error
          items: value => value.map(item => new CommercePayment(item)),
        },
      }),
    );
    return this;
  }
}
