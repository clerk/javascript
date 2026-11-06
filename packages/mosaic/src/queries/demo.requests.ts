import { ClerkRuntimeError } from '@clerk/shared/error';
import type { MosaicFetch, MosaicFetchInit } from '@clerk/shared/internal/clerk-js/mosaicRuntime';

export type DemoInstance = {
  id: string;
  name: string;
  environment: 'development' | 'production';
};

export type UpdateDemoParams = Pick<DemoInstance, 'name'>;

export async function getDemoInstance(
  mFetch: MosaicFetch,
  { signal }: Pick<MosaicFetchInit, 'signal'> = {},
): Promise<DemoInstance> {
  const data = await mFetch<DemoInstance>({ path: '/demo', method: 'GET', signal });
  if (!data) {
    throw new ClerkRuntimeError('The demo request returned no instance data.', { code: 'mosaic_demo_unavailable' });
  }
  return data;
}

export async function updateDemoInstance(
  mFetch: MosaicFetch,
  params: UpdateDemoParams,
  { signal }: Pick<MosaicFetchInit, 'signal'> = {},
): Promise<DemoInstance> {
  const data = await mFetch<DemoInstance>({ path: '/demo', method: 'PUT', body: params, signal });
  if (!data) {
    throw new ClerkRuntimeError('The demo update returned no instance data.', { code: 'mosaic_demo_unavailable' });
  }
  return data;
}
