# Clerk JavaScript SDK Monorepo

## Workflow
- Use Plan mode for cross-package changes or new features
- Run `pnpm build --filter=@clerk/[package]...` to build a package with dependencies
- Changes to `@clerk/shared` or `@clerk/types` require rebuilding dependent packages

## Verification
Before marking work complete:
- `pnpm build` passes (or filtered build for touched packages)
- `pnpm test` passes
- `pnpm lint` passes
- Changeset added if user-facing change: `pnpm changeset`

## Project Structure
```
packages/           # 31 SDK packages
  clerk-js/         # Core JS (UI components, auth flows)
  react/            # React SDK (hooks, components)
  nextjs/           # Next.js SDK
  backend/          # Node.js backend SDK
  shared/           # Shared utilities (used by most packages)
  types/            # Shared TypeScript types
  express|fastify|  # Framework integrations
  vue|astro|expo/   # More framework SDKs
integration/        # E2E tests (Playwright)
playground/         # Demo apps for testing
```

## Key Technologies
pnpm 10+ | Turbo | TypeScript 5.8 | tsup | Vitest | Playwright | ESLint 9 (flat config)

## Code Patterns

**Package exports:**
- `.` - Public API
- `./internal` - Internal APIs (prefix: `__internal_`)
- `./experimental` - Experimental APIs (prefix: `__experimental_`)
- `./errors` - Error classes

**Naming conventions:**
- Hooks: `use[Feature]` (e.g., `useUser`, `useAuth`)
- Components: PascalCase (e.g., `SignIn`, `UserButton`)
- Internal: `__internal_[name]`
- Experimental: `__experimental_[name]`

**Build output:** Dual ESM (.mjs) + CJS (.js) with .d.ts declarations

**Commit format:** `feat(package-name): description` or `fix(package-name): description`

## Common Commands
| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm build --filter=@clerk/react...` | Build package + deps |
| `pnpm dev` | Watch mode for development |
| `pnpm test` | Run all unit tests |
| `pnpm test --filter=@clerk/react` | Test single package |
| `pnpm lint` | ESLint check |
| `pnpm format` | Prettier format |
| `pnpm changeset` | Add changeset for release |

## Testing
- **Unit tests:** Vitest (co-located in `__tests__/` or `.test.ts` files)
- **E2E tests:** `pnpm test:integration:base` (Playwright)
- **Test single file:** `pnpm vitest run path/to/file.test.ts`

## Learnings
<!-- Add gotchas with dates, prune when stale -->
<!-- 2025-01-30: Example - clerk-js requires specific build order -->
