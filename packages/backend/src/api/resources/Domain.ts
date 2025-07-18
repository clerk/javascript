import { CnameTarget } from './CnameTarget';
import type { DomainJSON } from './JSON';

export class Domain {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly isSatellite: boolean,
    readonly frontendApiUrl: string,
    readonly developmentOrigin: string,
    readonly cnameTargets: CnameTarget[],
    readonly accountsPortalUrl?: string | null,
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
