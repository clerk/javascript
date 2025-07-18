import type { ProxyCheckJSON } from './JSON';

export class ProxyCheck {
  constructor(
    readonly id: string,
    readonly domainId: string,
    readonly lastRunAt: number | null,
    readonly proxyUrl: string,
    readonly successful: boolean,
    readonly createdAt: number,
    readonly updatedAt: number,
  ) {}

  static fromJSON(data: ProxyCheckJSON): ProxyCheck {
    return new ProxyCheck(
      data.id,
      data.domain_id,
      data.last_run_at,
      data.proxy_url,
      data.successful,
      data.created_at,
      data.updated_at,
    );
  }
}
