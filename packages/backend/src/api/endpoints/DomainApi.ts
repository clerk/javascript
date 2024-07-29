import { joinPaths } from '../../util/path';
import type { DeletedObjectJSON, ObjectType } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/domains';

export class DomainAPI extends AbstractAPI {
  public async deleteDomain(id: string) {
    return this.request<DeletedObjectJSON<typeof ObjectType.Domain>>({
      method: 'DELETE',
      path: joinPaths(basePath, id),
    });
  }
}
