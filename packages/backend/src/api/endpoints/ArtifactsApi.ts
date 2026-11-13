import type { RequestFunction } from '../request';

export type PoppyMetadata = unknown;

export class ArtifactsAPI {
  constructor(private readonly request: RequestFunction) {}

  public async __experimental_getPoppyJson() {
    const artifact = await this.request<{ object: 'artifact'; data: PoppyMetadata }>({
      method: 'GET',
      path: '/artifacts/well-known-poppy',
    });
    return artifact.data;
  }
}
