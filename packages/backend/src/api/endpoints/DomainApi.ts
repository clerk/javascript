import { joinPaths } from '../../util/path';
import type { DeletedObject } from '../resources/DeletedObject';
import type { PaginatedResourceResponse } from '../resources/Deserializer';
import type { Domain } from '../resources/Domain';
import { AbstractAPI } from './AbstractApi';

const basePath = '/domains';

/** @generateWithEmptyComment */
export type AddDomainParams = {
  /**
   * The new domain name. For development instances, can contain the port, e.g., `myhostname:3000`. For production instances, must be a valid FQDN, e.g., `mysite.com`. Cannot contain protocol scheme.
   */
  name: string;
  /** Whether the new domain is a satellite domain. Set to `false` to add the first custom primary domain to a production instance with an active provider domain. */
  is_satellite: boolean;
  /** The proxy URL for the domain. Applicable only to production instances. */
  proxy_url?: string | null;
};

/** @generateWithEmptyComment */
export type UpdateDomainParams = Partial<Pick<AddDomainParams, 'name' | 'proxy_url'>> & {
  /** The ID of the domain that will be updated. */
  domainId: string;
  /** Whether this is a domain for a secondary app, meaning that any subdomain provided is significant and will be stored as part of the domain. This is useful for supporting multiple apps (one primary and multiple secondaries) on the same root domain (eTLD+1). */
  is_secondary?: boolean | null;
};

/** @generateWithEmptyComment */
export class DomainAPI extends AbstractAPI {
  /**
   * Gets the list of domains for the instance. By default, the list is returned in descending order by creation date (newest first).
   * @returns A [`PaginatedResourceResponse`](https://clerk.com/docs/reference/backend/types/paginated-resource-response) object with a `data` property containing an array of [`Domain`](https://clerk.com/docs/reference/backend/types/domain) objects and a `totalCount` property containing the total number of domains for the instance.
   */
  public async list() {
    return this.request<PaginatedResourceResponse<Domain[]>>({
      method: 'GET',
      path: basePath,
    });
  }

  /**
   * Adds a [satellite domain](https://clerk.com/docs/guides/dashboard/dns-domains/satellite-domains) or the first custom primary domain to the instance.
   *
   * To migrate a production instance from an active provider domain to a custom primary domain, set `is_satellite` to `false`. The custom domain becomes active, and the provider domain remains attached. Additional custom primary domains are not supported.
   * @returns The created [`Domain`](https://clerk.com/docs/reference/backend/types/domain) object.
   */
  public async add(params: AddDomainParams) {
    return this.request<Domain>({
      method: 'POST',
      path: basePath,
      bodyParams: params,
    });
  }

  /**
   * Updates a domain for the instance. Both primary and satellite domains can be updated. If you choose to use Clerk via proxy, use this endpoint to specify the `proxy_url`. Whenever you decide you'd rather switch to DNS setup for Clerk, simply set `proxy_url` to `null` for the domain.
   *
   * When you update a production instance's primary domain name, you have to make sure that you've completed all the necessary setup steps for DNS and emails to work. Expect downtime otherwise. Updating a primary domain's name will also update the instance's home origin, affecting the default application paths.
   * @returns The updated [`Domain`](https://clerk.com/docs/reference/backend/types/domain) object.
   */
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
   * Deletes a domain for the instance. The active domain cannot be deleted.
   * @param satelliteDomainId - The ID of the domain to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object).
   */
  public async delete(satelliteDomainId: string) {
    return this.deleteDomain(satelliteDomainId);
  }

  /**
   * Deletes a domain for the instance. The active domain cannot be deleted.
   * @param satelliteDomainId - The ID of the domain to delete.
   * @returns The [`DeletedObject`](https://clerk.com/docs/reference/backend/types/deleted-object).
   * @deprecated Use `delete()` instead.
   */
  public async deleteDomain(satelliteDomainId: string) {
    this.requireId(satelliteDomainId);
    return this.request<DeletedObject>({
      method: 'DELETE',
      path: joinPaths(basePath, satelliteDomainId),
    });
  }
}
