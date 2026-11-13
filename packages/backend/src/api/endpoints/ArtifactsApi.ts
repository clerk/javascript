import { AbstractAPI } from './AbstractApi';

export type PoppyMetadata = unknown;

export class ArtifactsAPI extends AbstractAPI {
  public async __experimental_getPoppyJson() {
    const artifact = await this.request<{ object: 'artifact'; data: PoppyMetadata }>({
      method: 'GET',
      path: '/artifacts/well-known-poppy',
    });
    return artifact.data;
  }
}
