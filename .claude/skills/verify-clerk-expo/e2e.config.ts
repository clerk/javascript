import { composeE2EConfig, loadRunContext, withJudge } from './src/core/e2e-config.ts';

export default await withJudge(composeE2EConfig(loadRunContext()));
