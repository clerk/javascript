import { z } from 'zod';

// Configuration schema
export const ConfigSchema = z.object({
  packages: z.array(z.string()).optional(),
  excludePackages: z.array(z.string()).default([]),
  snapshotsDir: z.string().default('.api-snapshots'),
  mainBranch: z.string().default('main'),
  checkVersionBump: z.boolean().default(true),
  suppressedChanges: z
    .array(
      z.object({
        package: z.string(),
        changeId: z.string(),
        reason: z.string(),
        expires: z.string().optional(), // ISO date string
      }),
    )
    .default([]),
  githubToken: z.string().optional(),
  enableLLMAnalysis: z.boolean().default(false),
  llmProvider: z.enum(['openai', 'anthropic']).default('openai'),
  llmApiKey: z.string().optional(),
  storage: z.any().optional(), // Storage configuration
  turborepo: z
    .object({
      enabled: z.boolean().default(false),
      remoteCache: z
        .object({
          enabled: z.boolean().default(false),
          teamId: z.string().optional(),
          token: z.string().optional(),
        })
        .optional(),
      tasks: z
        .object({
          snapshot: z.string().default('api:snapshot'),
          check: z.string().default('api:check'),
        })
        .optional(),
    })
    .optional(),
  ci: z
    .object({
      enableStatusChecks: z.boolean().default(true),
      failOnBreakingChanges: z.boolean().default(true),
      baselineStorage: z.enum(['gcs', 'turborepo']).default('turborepo'),
      baselinePath: z.string().optional(),
      artifactRetentionDays: z.number().default(7),
    })
    .optional(),
});

export type Config = z.infer<typeof ConfigSchema> & {
  storage?: import('./storage/storage-manager.js').StorageManagerConfig;
};

// Package information
export interface PackageInfo {
  name: string;
  version: string;
  path: string;
  entrypoints: string[];
  hasExportsField: boolean;
}

// API change types
export enum ChangeType {
  BREAKING = 'breaking',
  NON_BREAKING = 'non-breaking',
  ADDITION = 'addition',
}

export enum ChangeSeverity {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch',
}

export interface ApiChange {
  id: string;
  type: ChangeType;
  severity: ChangeSeverity;
  category: 'export' | 'function' | 'interface' | 'type' | 'class' | 'enum';
  description: string;
  beforeSnippet?: string;
  afterSnippet?: string;
  location?: {
    file: string;
    line?: number;
  };
  isSuppressed?: boolean;
  suppressionReason?: string;
}

export interface PackageAnalysis {
  packageName: string;
  version: {
    current: string;
    previous: string;
  };
  changes: ApiChange[];
  hasBreakingChanges: boolean;
  recommendedVersionBump: ChangeSeverity;
  actualVersionBump?: ChangeSeverity;
  isValidBump: boolean;
}

export interface AnalysisResult {
  packages: PackageAnalysis[];
  hasBreakingChanges: boolean;
  ciShouldFail: boolean;
  summary: {
    totalPackages: number;
    packagesWithChanges: number;
    breakingChanges: number;
    nonBreakingChanges: number;
    additions: number;
  };
}

// API Extractor related types
export interface ApiSnapshot {
  packageName: string;
  version: string;
  timestamp: string;
  apiJsonPath: string;
  extractorConfigPath: string;
}
