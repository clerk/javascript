import { joinPaths } from '../../util/path';
import type { DeletedObject } from '../resources/DeletedObject';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Domain } from '../resources/Domain';
import { AbstractAPI } from './AbstractApi';

const basePath = '/domains';

type AddDomainParams = {
  /**
   * The new domain name. For development instances, can contain the port, i.e myhostname:3000. For production instances, must be a valid FQDN, i.e mysite.com. Cannot contain protocol scheme.
   */
  name: string;
  /**
   * Marks the new domain as satellite. Only true is accepted at the moment.
   */
  is_satellite: boolean;
  /**
   * The full URL of the proxy which will forward requests to the Clerk Frontend API for this domain. Applicable only to production instances.
   */
  proxy_url?: string | null;
};

type UpdateDomainParams = Partial<Pick<AddDomainParams, 'name' | 'proxy_url'>> & {
  /**
   * The ID of the domain that will be updated.
   */
  domainId: string;
  /**
   * Whether this is a domain for a secondary app, meaning that any subdomain provided is significant
   * and will be stored as part of the domain. This is useful for supporting multiple apps
   * (one primary and multiple secondaries) on the same root domain (eTLD+1).
   */
  is_secondary?: boolean | null;
};

export class DomainAPI extends AbstractAPI {
  public async list() {
    return this.request<PaginatedResourceResponse<Domain[]>>({
      method: 'GET',
      path: basePath,
    });
  }

  public async add(params: AddDomainParams) {
    return this.request<Domain>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  public async update(params: UpdateDomainParams) {
    const { domainId, ...bodyParams } = params;

    this.requireId(domainId);

    return this.request<Domain>({
      method: 'PATCH',
      path: joinPaths(basePath, domainId),
      bodyParams: bodyParams,
    });
  }

  /**
   * Deletes a satellite domain for the instance.
   * It is currently not possible to delete the instance's primary domain.
   */
  public async delete(satelliteDomainId: string) {
    return this.deleteDomain(satelliteDomainId);
  }

  /**
   * @deprecated Use `delete` instead
   */
  public async deleteDomain(satelliteDomainId: string) {
    this.requireId(satelliteDomainId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, satelliteDomainId),
    });
  }
}
