---
description: v7 - Generate commit message from chat changes
(note to LLMs: increment version when you make changes to this file)
---

# Commit Message Generator

Generate a commit message for changes in this chat. **Do not commit or push** (staging allowed with flag).

---

## ⚙️ REPO-SPECIFIC CONFIGURATION

> **Edit this section when using in a new repository.**

### Valid Scopes

Scopes must match package/app names. No scope is also valid. Invalid scope = commitlint rejection.

- **Packages:** agent-toolkit, astro, backend, chrome-extension, clerk-js, dev-cli, elements, expo, expo-passkeys, express, fastify, localizations, nextjs, nuxt, react, react-router, remix, shared, tanstack-react-start, testing, themes, types, ui, upgrade, vue
- **Other:** docs, repo, release, e2e, \*

---

## Flags

- `noask` — skip questions, generate immediately
- `stage` — stage affected files after showing message
- `all` — include all git changes (default: only files discussed in chat)
- `staged` — include staged files in addition to chat context (default: only files discussed in chat)

**Examples:** `/cmd cmt`, `/cmd cmt noask`, `/cmd cmt stage all`, `/cmd cmt noask stage`

## Valid Types

**Types (REQUIRED - ALWAYS FIRST):** feat | fix | build | chore | ci | perf | refactor | revert | style | test

## FORMAT - READ THIS CAREFULLY

**CRITICAL: Type is MANDATORY and ALWAYS comes FIRST**

```
type(scope): description    ← CORRECT: type first, scope optional
type: description           ← CORRECT: type without scope
```

**WRONG FORMATS:**

```
docs: description           ← WRONG: "docs" is a SCOPE, not a type!
scope: description          ← WRONG: missing type!
```

**If working with docs:**

```
feat(docs): add new guide   ← CORRECT
chore(docs): update readme  ← CORRECT
docs: something             ← WRONG
```

## Process

1. If "noask" present → skip to step 4
2. Review conversation for problem/decisions/rationale
3. Determine scope:
   - If "all" flag present → run `git diff` for all changes
   - Otherwise → only consider files/changes mentioned in the chat conversation
4. Classify impact:
   - **High:** API/breaking changes, security, new features, architecture, bug fixes, deps
   - **Low:** typos, formatting, refactors, docs, comments, linting
5. If **high impact** AND conversation lacks clear "why" → ask:

   > "Significant changes detected. Please explain: Why needed? What problem solved? Any trade-offs?"

   Then **STOP and wait** for response.

6. Generate commit message (TYPE FIRST, then optional scope in parentheses)
7. If "stage" present → run `git add` on affected files (only chat-mentioned files unless "all" flag present)

## Format Rules

```
type(scope): description
```

- **TYPE IS REQUIRED** - one of: feat, fix, build, chore, ci, perf, refactor, revert, style, test
- **SCOPE IS OPTIONAL** - if present, wrap in parentheses after type
- All lowercase, ≤72 chars
- Title = "what it does", body = "why"
- Be specific (use domain terms from conversation, not generic words)
- No filler: avoid "update", "changes", "code" when meaningless

## Templates

**High impact (with context):**

```
type(scope): short description

Why:
[Problem/requirement that prompted this]

What changed:
[Key decisions, trade-offs, non-obvious choices]

Context (optional):

[Future work, related issues, caveats]
```

**Low impact or limited context:**

```
type(scope): short description

Why:
[1 sentence if not obvious from title]
```

## Examples

```
feat(api): add rate limiting to auth endpoints

Why:
DDoS attacks on /api/sign-in caused production degradation.

What changed:
Redis over in-memory for multi-instance support.
Sliding window with exponential backoff for better UX.

Context:

May need IP allowlist for trusted services (CLERK-5678).
```

```
chore(docs): fix typo in authentication guide

Why:
Users reported confusion from misspelling.
```

```
ci: consolidate test job into checks to speed up pipeline

Why:
Reduce CI overhead by running tests in same job as lint/type checks.
```

```
feat(docs): document commitlint scope validation system

Why:
Added clear documentation to help contributors understand scope requirements.
```

## Remember

- Important:Do not add unnecessary new lines or paragraphs to sentences. Let the editor wrap lines as needed.
- **TYPE FIRST, ALWAYS** - never start with a scope
- **NEVER COMMIT OR PUSH**
- Type is REQUIRED, scope is optional
- **Always explain WHY changes were made** - what problem was being solved, what issues were identified, what motivated the change
- **Provide enough context** - someone reading the commit in 2 years should understand the reasoning without access to the conversation
- Only ask questions for high-impact changes
- Prioritize conversation context over diff analysis
