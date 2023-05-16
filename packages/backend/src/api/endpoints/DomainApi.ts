import { joinPaths } from '../../util/path';
import type { Domains } from '../resources/Domains';
import { AbstractAPI } from './AbstractApi';

const basePath = '/domains';

export class DomainAPI extends AbstractAPI {
  public deleteDomain(id: string) {
    return this.request<Domains>({
      method: 'DELETE',
      path: joinPaths(basePath, id),
    });
  }
}
