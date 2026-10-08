import path from 'node:path';

import rootConfig from '../../eslint.config.mjs';
import mosaicImportGuards from './eslint/config.mjs';

const root = path.resolve(import.meta.dirname, '../..');

export default [...rootConfig.map(config => ({ ...config, basePath: root })), ...mosaicImportGuards];
