import type { Locator } from 'e2e';
import { expect } from 'e2e';

import type { DeviceFixtures } from '../types.ts';

export async function tapUntilVisible(control: Locator, outcome: Locator) {
  await expect
    .poll(
      async () => {
        if (!(await outcome.isVisible()) && (await control.isVisible())) {
          await control.tap();
        }
        return outcome.isVisible();
      },
      { timeout: 30_000, interval: 1000 },
    )
    .toBe(true);
}

export async function tapCenter({ screen }: DeviceFixtures, control: Locator) {
  await expect(control).toBeVisible();
  const box = await control.boundingBox();
  if (!box) {
    throw new Error('Control has no bounding box');
  }
  await screen.tapAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
}

export async function tapControl(fixtures: DeviceFixtures, control: Locator) {
  if (fixtures.platform === 'android') {
    await tapCenter(fixtures, control);
  } else {
    await control.tap();
  }
}

export async function fill(field: Locator, value: string) {
  await field.tap();
  await field.fill(value).catch((error: { code?: string }) => {
    if (error.code !== 'ENGINE_FAILURE') {
      throw error;
    }
    return field.fill(value);
  });
}
