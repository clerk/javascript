import { vi } from 'vitest';

import packageJson from './package.json';

vi.stubGlobal('PACKAGE_NAME', packageJson.name);
vi.stubGlobal('PACKAGE_VERSION', packageJson.version);
