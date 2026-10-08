import { app } from './specs/app.ts';
import { composeE2EConfig } from './specs/support/config.ts';
import { readTarget } from './specs/support/inputs.ts';

export default composeE2EConfig(app, readTarget(app, process.env), process.env);
