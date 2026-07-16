---
'@clerk/ui': patch
---

Improve `Select` keyboard and screen reader support by routing navigation through floating-ui's interaction hooks. Pressing `ArrowUp`/`ArrowDown` on a focused, closed `Select` now opens the listbox, and the active option is announced via `aria-activedescendant`. The searchable variant (for example the `PhoneInput` country picker) now exposes a proper combobox: its input is marked `role="combobox"` with `aria-controls`, `aria-autocomplete="list"`, and `aria-activedescendant`, while the plain variant keeps its listbox semantics.
