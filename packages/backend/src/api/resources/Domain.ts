import { CnameTarget } from './CnameTarget';
import type { DomainJSON } from './JSON';

/** The `Domain` object represents a domain that is managed by the instance. */
export class Domain {
  constructor(
    /** The unique identifier of the domain. */
    readonly id: string,
    /** The name of the domain. */
    readonly name: string,
    /** Whether the domain is a satellite domain. */
    readonly isSatellite: boolean,
    /** The Frontend API URL for the domain. */
    readonly frontendApiUrl: string,
    /** The development origin for the domain. */
    readonly developmentOrigin: string,
    /** The CNAME targets for the domain. */
    readonly cnameTargets: CnameTarget[],
    /** The [Account Portal](https://clerk.com/docs/guides/account-portal/overview) URL for the domain. */
    readonly accountsPortalUrl?: string | null,
    /** The [proxy URL](https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi) for the domain. */
    readonly proxyUrl?: string | null,
  ) {}

  static fromJSON(data: DomainJSON): Domain {
    return new Domain(
      data.id,
      data.name,
      data.is_satellite,
      data.frontend_api_url,
      data.development_origin,
      data.cname_targets && data.cname_targets.map(x => CnameTarget.fromJSON(x)),
      data.accounts_portal_url,
      data.proxy_url,
    );
  }
}
