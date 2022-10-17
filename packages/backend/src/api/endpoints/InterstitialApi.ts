import { AbstractAPI } from './AbstractApi';

export class InterstitialAPI extends AbstractAPI {
  public async getInterstitial() {
    return this.request<string>({
      path: 'internal/interstitial',
      method: 'GET',
      headerParams: {
        'Content-Type': 'text/html',
      },
    });
  }
}
