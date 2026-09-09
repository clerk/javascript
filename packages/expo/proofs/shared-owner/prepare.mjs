import fs from 'node:fs/promises';
import path from 'node:path';
import { fixtures } from '../../../mobile-runtime/test/native-fixtures.mjs';

const target = process.argv[2];
if (!target) throw new Error('Usage: node prepare.mjs <disposable-expo-app-directory>');
const directory = path.resolve(target);
const fixture = structuredClone(fixtures);
fixture.environment.user_settings.attributes.first_name.enabled = true;
fixture.environment.user_settings.attributes.last_name.enabled = true;
await fs.mkdir(directory, { recursive: true });
for (const name of ['ProofApp.tsx', 'proof-network.js', 'index.js']) {
  await fs.copyFile(new URL(name, import.meta.url), path.join(directory, name));
}
await fs.writeFile(path.join(directory, 'proof-fixtures.json'), JSON.stringify(fixture));
console.log(`Prepared shared-owner fixture in ${directory}`);
