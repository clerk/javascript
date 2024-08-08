import { joinPaths } from '../../util/path';
import type { DeletedObject, ObjectType } from '../resources';
import { AbstractAPI } from './AbstractApi';

const basePath = '/domains';

export class DomainAPI extends AbstractAPI {
  public async deleteDomain(id: string) {
    return this.request<DeletedObject<typeof ObjectType.Domain>>({
      method: 'DELETE',
      path: joinPaths(basePath, id),
    });
  }
}
