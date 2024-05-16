import { expect, test } from 'vitest';
import { join } from 'node:path';
import { glob } from 'fast-glob';
import { transform } from '../src/index';
import { readFile } from 'node:fs/promises';

const fixtureDir = 'tests';
const fixtures = await glob('**/**/*.fixture.{jsx,tsx}', { cwd: fixtureDir });

for (let fixture of fixtures) {
  let name = fixture.replace(/\.fixture\.(jsx|tsx)$/, '');
  test(name, async () => {
    let code = await readFile(join(fixtureDir, fixture), 'utf8');
    let result = await transform(code);
    expect(result).toMatchSnapshot();
  });
}
