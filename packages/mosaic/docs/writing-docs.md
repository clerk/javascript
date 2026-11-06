# Writing docs

Read this when you change `AGENTS.md`, a guide in `docs/`, a path rule in `.claude/rules/`, or the verify-mosaic skill. It covers where a rule lives and how to check a docs change.

Worked example: [Motion](motion.md), which opens with its "Read this when" line, names its worked examples, lists its rules, then gives the how-to.

## Rules

- **One home per rule.** `AGENTS.md` holds the rules every change follows, and one guide in `docs/` holds each task. Edit the owning section and link to it from elsewhere; do not restate it.
- **Docs say what the code cannot:** rules, reasons, and which tool fits which problem. For facts the code already holds (lists of exports, tokens, builders or files, and signatures), name the file and give one example. Do not copy the list; a copy goes stale and agents trust it.
- **Keep each guide's shape:** a `Read this when …` line that names the files and tasks it covers, a worked example, `## Rules`, then the how-to. When the line changes, change its line in [Task guides](../AGENTS.md#task-guides) to match.
- **Check every link, anchor and source path you touched**, and that each path rule in `.claude/rules/` still names a guide that exists.
- **Compare the removed text with where it went**, so no rule is lost in a move.
- **Walk two unlike real tasks through the new text**, such as a styling fix and a new feature section, and check each reaches every rule it needs.
