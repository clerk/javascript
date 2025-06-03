# API Breakage Detector

A comprehensive tool for detecting breaking changes in TypeScript package APIs within monorepos. Uses Microsoft API Extractor to generate API snapshots and provides intelligent change detection with human-readable reports.

## Features

- 🔍 **Automatic Package Discovery**: Discovers packages based on `exports` field in `package.json`
- 📸 **API Snapshot Generation**: Uses API Extractor to generate `.api.json` files
- 🔄 **Intelligent Change Detection**: Categorizes changes as breaking, non-breaking, or additions
- 📊 **Version Bump Validation**: Ensures version bumps match the severity of changes
- 🚫 **Change Suppression**: Configurable system to suppress false positives
- 📝 **Rich Markdown Reports**: Human-readable reports for GitHub PR comments
- 🤖 **GitHub Actions Integration**: Ready-to-use CI/CD workflow
- 🧠 **LLM Integration**: Optional AI-powered change analysis and explanations

## Quick Start

### Installation

```bash
# In your monorepo root
pnpm add -D @clerk/api-breakage-detector
```

### Initialize Configuration

```bash
npx api-breakage-detector init
```

This creates a `.api-breakage.config.json` file:

```json
{
  "excludePackages": [],
  "snapshotsDir": ".api-snapshots",
  "mainBranch": "main",
  "checkVersionBump": true,
  "suppressedChanges": [],
  "enableLLMAnalysis": false,
  "llmProvider": "openai"
}
```

### Run Detection

```bash
npx api-breakage-detector detect
```

## Usage

### CLI Commands

#### `detect`

Runs the API breaking changes detection:

```bash
npx api-breakage-detector detect [options]

Options:
  -c, --config <path>      Path to configuration file (default: ".api-breakage.config.json")
  -o, --output <path>      Output path for report
  --format <format>        Output format: markdown|json (default: "markdown")
  --workspace <path>       Workspace root path (default: current directory)
  --main-branch <branch>   Main branch name (default: "main")
  --no-version-check       Skip version bump validation
  --fail-on-breaking      Exit with error code if breaking changes detected
```

#### `suppress`

Add a suppression for a specific change:

```bash
npx api-breakage-detector suppress \
  --package "@clerk/react" \
  --change-id "a1b2c3d4" \
  --reason "Internal refactoring, not a breaking change" \
  --days 30
```

#### `cleanup`

Clean up expired suppressions and temporary files:

```bash
npx api-breakage-detector cleanup
```

### Programmatic Usage

```typescript
import { BreakingChangesDetector } from '@clerk/api-breakage-detector';

const detector = new BreakingChangesDetector({
  workspaceRoot: process.cwd(),
  config: {
    excludePackages: ['@clerk/testing'],
    mainBranch: 'main',
    checkVersionBump: true,
    suppressedChanges: [],
  },
});

const result = await detector.detectBreakingChanges();
const report = await detector.generateReport(result, 'markdown');

console.log(report);
```

## Configuration

### Basic Configuration

```json
{
  "packages": ["@clerk/*"],
  "excludePackages": ["@clerk/testing", "@clerk/localizations"],
  "snapshotsDir": ".api-snapshots",
  "mainBranch": "main",
  "checkVersionBump": true
}
```

### Suppression System

Suppressions allow you to ignore specific changes that aren't actually breaking:

```json
{
  "suppressedChanges": [
    {
      "package": "@clerk/react",
      "changeId": "a1b2c3d4",
      "reason": "Internal refactoring, maintains backward compatibility",
      "expires": "2024-12-31T23:59:59.999Z"
    }
  ]
}
```

### LLM Integration

Enable AI-powered change analysis:

```json
{
  "enableLLMAnalysis": true,
  "llmProvider": "openai",
  "llmApiKey": "your-api-key"
}
```

Set via environment variables:

```bash
export OPENAI_API_KEY="your-openai-key"
# or
export ANTHROPIC_API_KEY="your-anthropic-key"
```

## GitHub Actions Integration

Add the workflow to `.github/workflows/api-breakage-check.yml`:

```yaml
name: API Breakage Detection

on:
  pull_request:
    branches: [main]
    paths: ['packages/**']

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  detect-api-changes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm build:declarations

      - name: Run API breakage detection
        run: |
          npx api-breakage-detector detect \
            --format markdown \
            --output /tmp/api-report.md \
            --fail-on-breaking
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Example Reports

### Breaking Changes Detected

````markdown
# 💥 Breaking Changes Detected

![CI Status](https://img.shields.io/badge/CI-FAIL-red) ![Breaking Changes](https://img.shields.io/badge/Breaking%20Changes-3-red)

## Summary

📊 **2** out of **5** packages have API changes:

- 💥 **3** breaking changes
- 🔄 **1** non-breaking changes
- ✨ **2** new additions

### Version Bump Recommendations

⚠️ The following packages need version bumps:

- **@clerk/react**: 5.31.8 → recommended **major** bump

## Package Details

### 💥 @clerk/react

**Version:** 5.31.8 → 5.32.0 (minor bump)

⚠️ **Version bump required:** This package needs a **major** version bump

#### 💥 Breaking Changes

- **function** `Function 'useAuth' signature changed`
  <details>
  <summary>Show diff</summary>

  ```diff
  - useAuth(): AuthData
  + useAuth(options?: AuthOptions): AuthData
  ```
````

  </details>

- **interface** `Interface 'UserResource' removed member 'internalId'`

#### ✨ New Additions

- **function** `Added function 'useAuthContext'`

````

### No Changes Detected

```markdown
# ✅ No API Changes

![CI Status](https://img.shields.io/badge/CI-PASS-green)

## Summary

✅ No API changes detected in any packages.

All public APIs remain stable and backward compatible.

## Next Steps

✅ No API changes detected.

**Safe to merge.**
````

## Architecture

### Folder Structure

```
tools/api-breakage-detector/
├── src/
│   ├── core/
│   │   └── detector.ts          # Main orchestrator
│   │   ├── utils/
│   │   │   ├── package-discovery.ts # Package discovery logic
│   │   │   ├── api-extractor.ts     # API Extractor integration
│   │   │   ├── git-manager.ts       # Git operations
│   │   │   └── suppression-manager.ts # Suppression handling
│   │   ├── analyzers/
│   │   │   ├── api-diff.ts          # API comparison logic
│   │   │   └── version-analyzer.ts  # Version bump validation
│   │   ├── reporters/
│   │   │   └── markdown-reporter.ts # Report generation
│   │   ├── types.ts                 # Type definitions
│   │   ├── cli.ts                   # CLI interface
│   │   └── index.ts                 # Public API
│   ├── bin/
│   │   └── cli.js                   # CLI entry point
│   └── package.json
```

### Snapshot Storage

```
.api-snapshots/
├── baseline/                    # Cached snapshots from main branch
│   ├── @clerk__react.api.json
│   └── @clerk__nextjs.api.json
├── current/                     # Current branch snapshots (temporary)
│   ├── @clerk__react.api.json
│   └── @clerk__nextjs.api.json
└── .baseline-cache.json         # Cache metadata
```

## Advanced Features

### Custom Analyzers

Extend the analyzer system:

```typescript
import { ApiDiffAnalyzer, ApiChange } from '@clerk/api-breakage-detector';

class CustomAnalyzer extends ApiDiffAnalyzer {
  protected compareCustomItems(current: ApiItem, previous: ApiItem): ApiChange[] {
    // Custom analysis logic
    return [];
  }
}
```

### LLM-Powered Analysis

When enabled, the tool can use AI to:

- Generate natural language explanations of changes
- Suggest whether changes are truly breaking
- Auto-generate changelog entries
- Provide migration guidance

### Monorepo Integration

The tool integrates seamlessly with:

- **pnpm workspaces**
- **Turbo** (respects build dependencies)
- **Changesets** (validates version bumps)
- **GitHub Actions** (automated PR comments)

## Troubleshooting

### Common Issues

**API Extractor fails to generate snapshots:**

- Ensure TypeScript declarations are built first
- Check that `tsconfig.json` is properly configured
- Verify package exports are correctly defined

**False positive breaking changes:**

- Use suppressions for legitimate non-breaking changes
- Review API Extractor configuration
- Consider if the change affects public API surface

**Performance issues:**

- Enable baseline caching (automatic)
- Exclude non-public packages
- Run on specific packages only

### Debug Mode

```bash
DEBUG=api-breakage-detector:* npx api-breakage-detector detect
```

## Contributing

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build the tool: `cd tools/api-breakage-detector && pnpm build`
4. Run tests: `pnpm test`
5. Test locally: `pnpm run detect --workspace ../..`

## License

MIT License - see LICENSE file for details.
