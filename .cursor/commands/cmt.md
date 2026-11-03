---
description: v8 - Generate commit message from chat changes
(note to LLMs: increment version when you make changes to this file)
---

# Commit Message Generator

Generate a commit message for changes in this chat. **Do not commit or push** (staging allowed with flag).

---

## Scopes and types

The scope is required. Valid scopes: any `packages/*` short name, the same name with `clerk-` removed (`clerk-js` or `js`), or `repo`, `release`, `e2e`, `ci`, `*`. Source of truth: `commitlint.config.ts`.

Only the PR title is linted, and it becomes the squash commit, so the title format matters most.

---

## Flags

- `noask` — skip questions, generate immediately
- `stage` — stage affected files after showing message
- `all` — include all git changes (default: only files discussed in chat)
- `staged` — include staged files in addition to chat context (default: only files discussed in chat)

**Examples:** `/cmd cmt`, `/cmd cmt noask`, `/cmd cmt stage all`, `/cmd cmt noask stage`

## Valid Types

feat | fix | docs | build | chore | ci | perf | refactor | revert | style | test

## Format

```
type(scope): description    ← CORRECT
type: description           ← WRONG: scope is required
scope: description          ← WRONG: missing type
```

`docs` is a type, not a scope: `docs(repo): update contributing guide`.

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

6. Generate commit message (type first, then the scope in parentheses)
7. If "stage" present → run `git add` on affected files (only chat-mentioned files unless "all" flag present)

## Format Rules

```
type(scope): description
```

- Type and scope are both required
- ≤72 chars
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
feat(backend): add rate limiting to auth endpoints

Why:
DDoS attacks on /api/sign-in caused production degradation.

What changed:
Redis over in-memory for multi-instance support.
Sliding window with exponential backoff for better UX.

Context:

May need IP allowlist for trusted services (CLERK-5678).
```

```
docs(nextjs): fix typo in the middleware README

Why:
Users reported confusion from misspelling.
```

```
ci(repo): consolidate test job into checks to speed up pipeline

Why:
Reduce CI overhead by running tests in same job as lint/type checks.
```

```
docs(repo): document commitlint scope validation system

Why:
Added clear documentation to help contributors understand scope requirements.
```

## Remember

- Important:Do not add unnecessary new lines or paragraphs to sentences. Let the editor wrap lines as needed.
- **TYPE FIRST, ALWAYS**, then the scope in parentheses
- **NEVER COMMIT OR PUSH**
- Type and scope are both required
- **Always explain WHY changes were made** - what problem was being solved, what issues were identified, what motivated the change
- **Provide enough context** - someone reading the commit in 2 years should understand the reasoning without access to the conversation
- Only ask questions for high-impact changes
- Prioritize conversation context over diff analysis
