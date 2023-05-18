import { joinPaths } from '../../util/path';
import type { DeletedObject } from '../resources/DeletedObject';
import { AbstractAPI } from './AbstractApi';

const basePath = '/domains';

export class DomainAPI extends AbstractAPI {
  public async deleteDomain(id: string) {
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, id),
    });
  }
}
