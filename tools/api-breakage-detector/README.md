# API Breakage Detector

A comprehensive tool for detecting breaking changes in TypeScript package APIs, designed for production use with robust cloud storage integration.

## 🚀 Features

### Core Functionality

- **API Snapshot Generation**: Uses Microsoft API Extractor to create detailed API snapshots
- **Breaking Change Detection**: Intelligent analysis of API changes with severity classification
- **Version Bump Validation**: Ensures semantic versioning compliance
- **Suppression Management**: Flexible system for managing false positives
- **Rich Reporting**: Markdown reports with code diffs and actionable insights

### Production Storage Solutions

- **Google Cloud Storage (GCS)**: Primary production storage with lifecycle management
- **Multi-Backend Support**: Automatic failover between storage backends
- **Health Monitoring**: Real-time storage backend health checks
- **Cost Optimization**: Intelligent storage class transitions and cleanup
- **Batch Operations**: Efficient bulk snapshot operations

### CI/CD Integration

- **GitHub Actions**: Automated PR checking and status updates
- **Turborepo Integration**: Leverages existing cache infrastructure
- **Parallel Processing**: Concurrent package analysis for speed
- **Artifact Management**: Efficient storage and retrieval of snapshots

## 📦 Installation

```bash
# Install the tool
pnpm install @clerk/api-breakage-detector

# Install optional cloud storage dependencies
pnpm install @google-cloud/storage  # For GCS support
pnpm install @aws-sdk/client-s3     # For S3 support
pnpm install @azure/storage-blob    # For Azure support
```

## 🔧 Configuration

### Basic Configuration

Create `.api-breakage.config.json` in your repository root:

```json
{
  "packages": ["@your-org/package1", "@your-org/package2"],
  "excludePackages": ["@your-org/testing"],
  "snapshotsDir": ".api-snapshots",
  "mainBranch": "main",
  "checkVersionBump": true,
  "suppressedChanges": []
}
```

### Production GCS Configuration

```json
{
  "packages": ["@your-org/package1", "@your-org/package2"],
  "excludePackages": ["@your-org/testing"],
  "snapshotsDir": ".api-snapshots",
  "mainBranch": "main",
  "checkVersionBump": true,
  "suppressedChanges": [],
  "storage": {
    "primary": {
      "type": "gcs",
      "options": {
        "projectId": "your-gcp-project",
        "bucket": "your-api-snapshots-bucket",
        "prefix": "api-snapshots",
        "multiRegion": true,
        "enableVersioning": true,
        "lifecycle": {
          "enabled": true,
          "deleteAfterDays": 365,
          "archiveAfterDays": 90
        },
        "storageClass": "STANDARD"
      }
    },
    "fallback": [
      {
        "type": "git-lfs",
        "options": {
          "repositoryUrl": "https://github.com/your-org/api-snapshots.git",
          "branch": "main",
          "snapshotsPath": "snapshots"
        }
      }
    ],
    "healthCheckInterval": 10,
    "retryAttempts": 3,
    "retryDelay": 1000
  }
}
```

## 🛠️ Usage

### CLI Commands

```bash
# Initialize configuration
api-breakage-detector init

# Generate API snapshots
api-breakage-detector snapshot

# Detect breaking changes
api-breakage-detector detect

# Storage management
api-breakage-detector storage health
api-breakage-detector storage stats
api-breakage-detector storage cleanup --days 30

# Suppression management
api-breakage-detector suppress -p @your-org/package -i change-id -r "Reason"
api-breakage-detector cleanup
```

### Programmatic Usage

```typescript
import { BreakingChangesDetector } from '@clerk/api-breakage-detector';

const detector = new BreakingChangesDetector({
  workspaceRoot: process.cwd(),
  config: {
    packages: ['@your-org/package'],
    excludePackages: [],
    snapshotsDir: '.api-snapshots',
    mainBranch: 'main',
    checkVersionBump: true,
    suppressedChanges: [],
    storage: {
      primary: {
        type: 'gcs',
        options: {
          projectId: 'your-project',
          bucket: 'your-bucket',
        },
      },
    },
  },
});

const result = await detector.detectBreakingChanges();
console.log(result);
```

## ☁️ Google Cloud Storage Setup

### Prerequisites

1. Google Cloud Project with billing enabled
2. Cloud Storage API enabled
3. Service account with Storage Object Admin permissions

### Quick Setup

```bash
# Set up GCS bucket
export PROJECT_ID="your-project-id"
export BUCKET_NAME="your-api-snapshots"

gsutil mb -p $PROJECT_ID -c STANDARD -l us-central1 gs://$BUCKET_NAME
gsutil versioning set on gs://$BUCKET_NAME

# Create service account
gcloud iam service-accounts create api-breakage-detector \
  --display-name="API Breakage Detector"

# Generate key
gcloud iam service-accounts keys create sa-key.json \
  --iam-account=api-breakage-detector@$PROJECT_ID.iam.gserviceaccount.com

# Set permissions
gsutil iam ch serviceAccount:api-breakage-detector@$PROJECT_ID.iam.gserviceaccount.com:objectAdmin gs://$BUCKET_NAME
```

### Environment Variables

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/sa-key.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GCS_BUCKET="your-api-snapshots"
```

## 🔄 GitHub Actions Integration

```yaml
name: API Breakage Check

on:
  pull_request:
    branches: [main]

jobs:
  api-breakage-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Setup GCS credentials
        run: |
          echo '${{ secrets.GCS_SERVICE_ACCOUNT_KEY }}' > /tmp/gcs-key.json
          echo "GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcs-key.json" >> $GITHUB_ENV

      - name: Install dependencies
        run: pnpm install

      - name: Check API breaking changes
        run: |
          pnpm api-breakage-detector detect \
            --fail-on-breaking \
            --output api-breakage-report.md
        env:
          GOOGLE_CLOUD_PROJECT: ${{ secrets.GCS_PROJECT_ID }}
          GCS_BUCKET: ${{ secrets.GCS_BUCKET }}

      - name: Comment PR
        uses: actions/github-script@v7
        if: always()
        with:
          script: |
            const fs = require('fs');
            if (fs.existsSync('api-breakage-report.md')) {
              const report = fs.readFileSync('api-breakage-report.md', 'utf8');
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: report
              });
            }
```

## 📊 Storage Features

### Cost Optimization

- **Lifecycle Management**: Automatic transition to cheaper storage classes
- **Compression**: Automatic gzip compression for files > 1KB
- **Cleanup**: Configurable retention policies
- **Monitoring**: Built-in cost tracking and alerts

### Reliability

- **Multi-Regional**: Global availability and redundancy
- **Versioning**: Object versioning for data protection
- **Health Checks**: Continuous monitoring and failover
- **Retry Logic**: Exponential backoff for transient failures

### Performance

- **Parallel Operations**: Concurrent uploads and downloads
- **Caching**: Intelligent baseline caching
- **Batch Processing**: Efficient bulk operations
- **Edge Caching**: Global CDN integration

## 🔍 Monitoring and Observability

### Health Checks

```bash
# Check storage backend health
api-breakage-detector storage health

# Get storage statistics
api-breakage-detector storage stats

# Monitor costs and usage
gsutil du -sh gs://your-bucket
```

### Metrics

- Storage usage and costs
- API request rates and errors
- Upload/download latency
- Health check failures
- Snapshot generation times

## 🛡️ Security

### Best Practices

- **Least Privilege**: Minimal IAM permissions
- **Encryption**: Automatic encryption at rest
- **Audit Logging**: Comprehensive access logs
- **Private Access**: No public bucket access
- **Key Management**: Secure credential handling

### Compliance

- **Data Retention**: Configurable retention policies
- **Access Control**: Fine-grained permissions
- **Audit Trail**: Complete operation logging
- **Backup**: Multi-region redundancy

## 📚 Documentation

- [GCS Production Setup Guide](./docs/GCS_PRODUCTION_SETUP.md)
- [Configuration Reference](./docs/CONFIGURATION.md)
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- [API Reference](./docs/API.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🆘 Support

- [GitHub Issues](https://github.com/your-org/api-breakage-detector/issues)
- [Documentation](./docs/)
- [GCS Support](https://cloud.google.com/support)

---

Built with ❤️ for reliable API evolution in production environments.

## 🔐 Environment Variables

The API Breakage Detector uses the following environment variables for authentication:

### Google Cloud Storage Configuration

| Variable         | Description          | Required | Example              |
| ---------------- | -------------------- | -------- | -------------------- |
| `GCS_PROJECT_ID` | Your GCP project ID  | **Yes**  | `'my-gcp-project'`   |
| `GCS_BUCKET`     | Your GCS bucket name | **Yes**  | `'my-api-snapshots'` |

### Google Cloud Storage Authentication (choose one)

| Variable                         | Description                          | Example                                 |
| -------------------------------- | ------------------------------------ | --------------------------------------- |
| `GOOGLE_SERVICE_ACCOUNT_KEY`     | JSON service account key content     | `'{"type":"service_account",...}'`      |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account key file     | `'/path/to/key.json'`                   |
| _(none)_                         | Uses default application credentials | `gcloud auth application-default login` |

### GitHub Integration (for CI/CD)

| Variable            | Description                     | Example              |
| ------------------- | ------------------------------- | -------------------- |
| `GITHUB_TOKEN`      | GitHub API token                | `'ghp_...'`          |
| `GITHUB_REPOSITORY` | Repository in owner/repo format | `'clerk/javascript'` |

For detailed setup instructions, see [`docs/GCS_ENV_SETUP.md`](./docs/GCS_ENV_SETUP.md).

## �� Storage Backends
