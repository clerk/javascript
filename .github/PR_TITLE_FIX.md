# PR Title Fix Required

## Issue

The PR title "Sign-in token hosted support" does not follow the conventional commit format required by the repository's commitlint configuration.

## Current Title
```
Sign-in token hosted support
```

## Required Format
The title must follow the pattern: `type(scope): subject`

Where:
- **type**: The type of change (e.g., `feat`, `fix`, `docs`, `chore`, etc.)
- **scope**: Must be one of: package names, `repo`, `release`, `e2e`, `*`, or `ci`
- **subject**: A brief description in camel-case, lower-case, or sentence-case

## Recommended New Title
```
docs(repo): add sign-in token support guide for hosted pages and embedded components
```

Or alternatively:
```
docs(repo): clarify sign-in token usage with hosted pages and embedded components
```

## Why This Format?

Looking at recent merged PRs in the repository:
- `docs(repo): Add JSDoc comments for OauthAccessToken object`
- `fix(nextjs,backend): Accommodate JWT OAuth access tokens`
- `chore(repo): Resolve dependabot alerts`

Since this PR adds documentation that applies to the entire repository (not a specific package), the scope should be `repo`.

## How to Fix

Please update the PR title in the GitHub UI to use the recommended format above. The CI check will automatically re-run once the title is updated.
