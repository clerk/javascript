import { resolve } from 'node:path';

import fs from 'fs-extra';

import { constants } from '../constants';

const getInstanceKeys = () => {
  let keys: Record<string, { pk: string; sk: string }>;
  try {
    keys = constants.INTEGRATION_INSTANCE_KEYS
      ? JSON.parse(constants.INTEGRATION_INSTANCE_KEYS)
      : fs.readJSONSync(resolve(import.meta.dirname, '..', '.keys.json')) || null;
  } catch (error) {
    console.log('Could not find .keys.json file', error);
  }
  if (!keys) {
    throw new Error('Missing instance keys. Is your env or .keys.json file populated?');
  }

  try {
    const stagingKeys: Record<string, { pk: string; sk: string }> = constants.INTEGRATION_STAGING_INSTANCE_KEYS
      ? JSON.parse(constants.INTEGRATION_STAGING_INSTANCE_KEYS)
      : fs.readJSONSync(resolve(import.meta.dirname, '..', '.keys.staging.json')) || null;
    if (stagingKeys) {
      Object.assign(keys, stagingKeys);
    }
  } catch {
    // Staging keys are optional
  }

  return new Map(Object.entries(keys));
};

export const instanceKeys = getInstanceKeys();
