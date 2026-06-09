# AGENTS.md — @clerk/headless

Private, unstyled primitive library. Each primitive is a compound component built from per-file
parts that emit zero styles and expose behavior + `data-cl-*` attributes.

## References

- For the review patterns every new/changed primitive must satisfy (consumer ref merging, wired
  id protection, SSR-safe id hoisting, lint, aria tests), see `references/review-checklist.md`.
