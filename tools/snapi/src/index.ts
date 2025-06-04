export { BreakingChangesDetector } from './core/detector.js';
export { PackageDiscovery } from './utils/package-discovery.js';
export { ApiExtractorRunner } from './utils/api-extractor.js';
export { ApiDiffAnalyzer } from './analyzers/api-diff.js';
export { VersionAnalyzer } from './analyzers/version-analyzer.js';
export { ReportGenerator } from './reporters/markdown-reporter.js';
export { SuppressionManager } from './utils/suppression-manager.js';
export { GitManager } from './utils/git-manager.js';

export type {
  Config,
  PackageInfo,
  ApiChange,
  ChangeType,
  ChangeSeverity,
  PackageAnalysis,
  AnalysisResult,
  ApiSnapshot,
} from './types.js';

export { ConfigSchema } from './types.js';
