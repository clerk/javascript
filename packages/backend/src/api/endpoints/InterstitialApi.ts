import { deprecated } from '../../util/shared';
import { AbstractAPI } from './AbstractApi';
/**
 * @deprecated Switch to the public interstitial endpoint from Clerk Backend API.
 */
export class InterstitialAPI extends AbstractAPI {
  public async getInterstitial() {
    deprecated(
      'getInterstitial()',
      'Switch to `Clerk(...).localInterstitial(...)` from `import { Clerk } from "@clerk/backend"`.',
    );

    return this.request<string>({
      path: 'internal/interstitial',
      method: 'GET',
      headerParams: {
        'Content-Type': 'text/html',
      },
    });
  }
}
