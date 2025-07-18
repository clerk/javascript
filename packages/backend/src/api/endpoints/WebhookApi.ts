import { joinPaths } from '../../util/path';
import type { WebhooksSvixJSON } from '../resources/JSON';
import { AbstractAPI } from './AbstractApi';

const basePath = '/webhooks';

export class WebhookAPI extends AbstractAPI {
  public async createSvixApp() {
    return this.request<WebhooksSvixJSON>({
      method: 'POST',
      path: joinPaths(basePath, 'svix'),
    });
  }

  public async generateSvixAuthURL() {
    return this.request<WebhooksSvixJSON>({
      method: 'POST',
      path: joinPaths(basePath, 'svix_url'),
    });
  }

  public async deleteSvixApp() {
    return this.request<void>({
      method: 'DELETE',
      path: joinPaths(basePath, 'svix'),
    });
  }
}
