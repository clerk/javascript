# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the official Clerk JavaScript SDK monorepo containing all authentication packages published under the `@clerk` namespace. Clerk provides streamlined user management experiences including sign up, sign in, and profile management across 10+ JavaScript frameworks and platforms.

## Package Manager and Build System

- **Package Manager**: pnpm (v10.17.1+)
- **Build Orchestration**: Turborepo with aggressive caching
- **Node Version**: 18.17.0+
- **Enable pnpm**: Run `corepack enable` after cloning

## Core Commands

### Building and Development

```bash
# Install all dependencies (always run from monorepo root)
pnpm install

# Build all packages (required before first dev or after switching branches)
pnpm build

# Start dev mode for all packages (with watch/rebuild)
pnpm dev

# Build specific package
turbo build --filter=@clerk/nextjs

# Dev mode for specific package
pnpm --filter @clerk/nextjs dev

# Dev mode for clerk-js specifically
pnpm dev:js

# Clean all build artifacts
pnpm clean

# Nuclear clean (removes all node_modules and build artifacts)
pnpm nuke
```

### Testing

```bash
# Run all unit tests
pnpm test

# Run tests for specific package
pnpm --filter @clerk/nextjs test

# Run integration tests (framework-specific)
pnpm test:integration:nextjs
pnpm test:integration:express
pnpm test:integration:astro
pnpm test:integration:generic

# Run Playwright tests
pnpm playwright test --config integration/playwright.config.ts
```

### Code Quality

```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check

# Type checking and package validation
pnpm lint:publint
pnpm lint:attw
```

### Running Single Tests

For unit tests, navigate to the specific package and use:

```bash
cd packages/clerk-js
pnpm test path/to/test-file.test.ts
```

For integration tests, use Playwright's grep feature:

```bash
pnpm test:integration:base --grep "test name"
```

## Package Categories and Architecture

### Core Packages

- **`@clerk/clerk-js`**: Core browser SDK with UI components. Uses Rspack for bundling. Provides the fundamental authentication primitives.
- **`@clerk/backend`**: Server-side utilities, JWT verification, and API resources. Framework-agnostic backend SDK.
- **`@clerk/types`**: TypeScript type definitions shared across all packages
- **`@clerk/shared`**: Common utilities and helpers used by multiple packages

### Framework Integrations

- **`@clerk/nextjs`**: Next.js integration supporting both App Router and Pages Router
- **`@clerk/clerk-react`**: React hooks and components (foundation for many framework packages)
- **`@clerk/vue`**: Vue.js composables and components
- **`@clerk/astro`**: Astro integration with SSR support
- **`@clerk/nuxt`**: Nuxt.js module
- **`@clerk/remix`**: Remix loader and action utilities
- **`@clerk/express`**: Express.js middleware
- **`@clerk/fastify`**: Fastify plugin
- **`@clerk/react-router`**: React Router integration
- **`@clerk/tanstack-react-start`**: TanStack React Start integration

### Specialized Packages

- **`@clerk/expo`**: React Native/Expo SDK
- **`@clerk/chrome-extension`**: Chrome extension support
- **`@clerk/elements`**: Unstyled UI primitives for custom implementations
- **`@clerk/themes`**: Pre-built themes
- **`@clerk/localizations`**: Translations for 30+ languages
- **`@clerk/agent-toolkit`**: AI agent integration tools
- **`@clerk/testing`**: Testing utilities
- **`@clerk/upgrade`**: Migration tooling

## Dependency Architecture

Key dependency relationships:

- Most packages depend on `@clerk/shared` and `@clerk/types`
- Framework packages typically depend on `@clerk/clerk-js` for core browser functionality
- `@clerk/backend` is independent and used for server-side operations
- `@clerk/clerk-react` is the foundation for React-based framework packages (Next.js, Remix, etc.)

## Development Workflow

### Making Changes

1. **Always run from monorepo root**: `pnpm install` must be run from root
2. **Build first**: Run `pnpm build` after cloning or switching branches to ensure TypeScript types are generated
3. **Use dev mode**: Run `pnpm dev` to watch for changes across all packages
4. **Test in playground**: Use apps in `playground/` directory to test changes locally

### Testing Changes

- **Unit tests**: Co-located with source files or in `__tests__` directories
- **Integration tests**: Located in `integration/` directory with template apps in `integration/templates/`
- Each framework has its own integration test suite
- Use Playwright for E2E testing

### Changesets for Version Management

When making changes:

- Run `pnpm changeset` to create a changeset describing your changes
- For internal changes that don't need a changelog entry, use `pnpm changeset:empty`
- Changesets power the automated versioning and release process
- Follow semantic versioning: patch for fixes, minor for features, major for breaking changes

## TypeScript Configuration

This codebase uses strict TypeScript:

- Explicit return types for public APIs
- Avoid `any` - prefer `unknown` with type guards
- Use `readonly` for immutable data
- Prefer named exports over default exports
- Use type-only imports where possible: `import type { User } from './types'`

## Build Tools

- **tsup**: Used for most packages (TypeScript compilation and bundling)
- **Rspack**: Used specifically for `@clerk/clerk-js` (high-performance bundler)
- **TypeDoc**: Generates API documentation from JSDoc comments

## Testing Stack

- **Jest**: Unit tests for most packages
- **Vitest**: Unit tests for some packages (faster, ESM-native)
- **React Testing Library**: Component testing
- **Playwright**: Integration and E2E tests

## Environment Variables

Clerk supports multiple environment variable prefixes depending on the framework:

- `CLERK_*` - General purpose
- `NEXT_PUBLIC_CLERK_*` - Next.js
- `VITE_CLERK_*` - Vite-based apps
- `PUBLIC_CLERK_*` - Astro
- `EXPO_PUBLIC_CLERK_*` - Expo
- `REACT_APP_CLERK_*` - Create React App

## Local Publishing with Yalc

To test packages locally in other projects:

```bash
# In the package directory
pnpm yalc push --replace --sig

# Or publish all packages
pnpm yalc:all
```

## Commit and PR Guidelines

### Commit Messages

Must follow [conventional commits](https://www.conventionalcommits.org/):

- Format: `type(scope): description`
- Types: `feat`, `fix`, `chore`, `docs`
- Scope: package name (e.g., `nextjs`, `clerk-js`) or `repo` for monorepo-level changes

Example: `feat(nextjs): add App Router support for organizations`

### Pull Requests

- Create changesets with descriptive changelog entries
- Include tests for new functionality
- Update documentation (both JSDoc and clerk-docs repo if needed)
- Ensure all CI checks pass
- Small, focused PRs are preferred over large changes

## JSDoc Documentation Standards

When adding or updating public APIs:

- Include clear descriptions with parameter and return type annotations
- Provide `@example` blocks with h3 headings (`###`) and descriptions
- Use absolute links to Clerk docs: `[Clerk docs](https://clerk.com/docs)`
- Add `@default` annotations for optional properties with defaults
- Follow the examples in [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Monorepo Structure

```
packages/              # All publishable packages
integration/           # E2E tests and framework templates
  templates/          # Sample apps for testing integrations
playground/           # Development and testing applications
docs/                 # Documentation and contribution guides
scripts/              # Build automation and utilities
.cursor/rules/        # Additional cursor AI rules for specific domains
```

## Key Package Build Commands

### @clerk/clerk-js

- Uses Rspack (not tsup)
- `pnpm build:bundle` - Build all variants
- `pnpm build:declarations` - Generate TypeScript declarations
- `pnpm dev` - Dev server with hot reload

### @clerk/nextjs and other framework packages

- Uses tsup
- `pnpm build` - Build ESM and CJS bundles
- `pnpm dev` - Watch mode for development
- `pnpm test` - Run unit tests

## Common Patterns

### API Design

- Provide sensible defaults to minimize configuration
- Support both imperative and declarative patterns
- Maintain backward compatibility when possible
- Use discriminated unions for type-safe state management

### Error Handling

- Use custom error classes that extend Error
- Provide meaningful error messages with recovery suggestions
- Validate inputs and sanitize outputs

### Performance

- Use lazy loading for optional features
- Implement proper caching strategies
- Minimize React re-renders with proper memoization
- Tree-shaking friendly exports

## Troubleshooting

**Build failures after switching branches**: Run `pnpm clean && pnpm build`

**Type errors from workspace dependencies**: Ensure all packages are built with `pnpm build`

**Integration test failures**: Check that required environment variables are set and the correct Clerk instance is configured

**Turbo cache issues**: Run `pnpm turbo:clean` to clear Turbo cache
