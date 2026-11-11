export type ThemeId = 'default' | 'clerk';
export const THEME_MESSAGE = 'mosaic-theme';
export const THEMES: { id: string; label: string; soon?: boolean }[] = [
  { id: 'default', label: 'default' },
  { id: 'clerk', label: 'clerk' },
  { id: 'minimal', label: 'minimal', soon: true },
];
export const parseTheme = (value: string | null | undefined): ThemeId =>
  THEMES.find(item => !item.soon && item.id === value)?.id === 'clerk' ? 'clerk' : 'default';
const THEME_RULES = `
[data-mosaic-theme='clerk'] {
  --cl-color-neutral: light-dark(#2b2b34, #f6f6f7);
  --cl-color-page: light-dark(#ffffff, #1b1b1f);
  --cl-color-surface: light-dark(#ffffff, #1b1b1f);
  --cl-color-surface-subtle: light-dark(#fafafb, #232328);
  --cl-color-foreground: light-dark(#2b2b34, #f6f6f7);
  --cl-color-foreground-secondary: light-dark(#5f5f6f, #adadb7);
  --cl-color-foreground-disabled: light-dark(#adadb7, #5f5f6f);
  --cl-color-border: light-dark(#dbdbe0, #33333e);
  --cl-color-border-subtle: light-dark(#ececee, #232328);
  --cl-color-brand: light-dark(#6c47ff, #846bff);
  --cl-color-brand-foreground: #ffffff;
  --cl-color-brand-subtle: #6c47ff0a;
  --cl-color-brand-border: #6c47ff1f;
  --cl-color-negative: light-dark(#e02e2e, #f73d3d);
  --cl-color-positive: light-dark(#15892b, #31c854);
  --cl-color-warning: #fd7224;
  --cl-radius-sm: 0.25rem;
  --cl-radius-md: 0.5rem;
  --cl-radius-lg: 0.625rem;
  --cl-radius-xl: 0.75rem;
  --cl-radius-2xl: 0.875rem;
  --cl-shadow-sm: light-dark(0 0 2px rgb(0 0 0 / 0.08), 0 1.5px 2px rgb(0 0 0 / 0.32)), light-dark(0 1px 2px rgb(0 0 0 / 0.06), 0 -1px 0 rgb(255 255 255 / 0.04)), 0 0 0 1px light-dark(rgb(0 0 0 / 0.04), rgb(255 255 255 / 0.12));
  --cl-shadow-md: 0 1px 0 -1px light-dark(rgb(0 0 0 / 0.06), rgb(0 0 0 / 0.3)), 0 2px 4px -2px light-dark(rgb(0 0 0 / 0.06), rgb(0 0 0 / 0.3)), 0 6px 8px -4px light-dark(rgb(0 0 0 / 0.06), rgb(0 0 0 / 0.3)), 0 8px 16px -3px light-dark(rgb(0 0 0 / 0.06), rgb(0 0 0 / 0.3)), 0 0 0 1px light-dark(rgb(0 0 0 / 0.04), rgb(255 255 255 / 0.08));
  --cl-shadow-lg: 0 4px 4px -4px light-dark(rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.4)), 0 6px 7px -4px light-dark(rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.4)), 0 8px 30px -4px light-dark(rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.4)), 0 10px 24px -4px light-dark(rgb(0 0 0 / 0.08), rgb(0 0 0 / 0.4)), 0 0 0 1px light-dark(rgb(0 0 0 / 0.04), rgb(255 255 255 / 0.08));
}
[data-mosaic-theme='clerk'] .cl-profile-page-title {
  font-size: 1.75rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 2.125rem;
  margin-bottom: 1.75rem;
}
[data-mosaic-theme='clerk'] .cl-panel-sections {
  gap: 1.5rem;
}
[data-mosaic-theme='clerk'] .cl-section-group {
  flex-direction: column;
  background-color: light-dark(#fafafb, #111113);
  border-radius: 1rem;
  padding: 0.25rem 0;
}
[data-mosaic-theme='clerk'] .cl-section-header {
  margin: 0;
  padding: 1rem 1.5rem;
}
[data-mosaic-theme='clerk'] .cl-section-title {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.375rem;
  color: var(--cl-color-foreground);
}
[data-mosaic-theme='clerk'] .cl-section-body {
  background-color: var(--cl-color-surface);
  border: 0;
  border-radius: 0.75rem;
  box-shadow: 0 0 0 1px light-dark(#191c210a, rgb(255 255 255 / 0.08)), 0 1px 2px light-dark(#191c210f, rgb(0 0 0 / 0.3)), 0 0 2px light-dark(#00000014, rgb(0 0 0 / 0.3)), inset 0 1px 0 light-dark(transparent, rgb(255 255 255 / 0.03));
  margin: 0 0.25rem;
  overflow: clip;
  padding: 0.5rem 0;
}
[data-mosaic-theme='clerk'] .cl-section-row {
  padding: 1rem 1.25rem;
}
[data-mosaic-theme='clerk'] .cl-section-items > .cl-section-item {
  padding: 1rem 1.25rem;
}
[data-mosaic-theme='clerk'] .cl-section-row + .cl-section-row,
[data-mosaic-theme='clerk'] .cl-section-items > .cl-section-item + .cl-section-item {
  border-top: 1px solid var(--cl-color-border-subtle);
}
[data-mosaic-theme='clerk'] .cl-section-actions .cl-button[data-variant='outline'][data-color='neutral'],
[data-mosaic-theme='clerk'] .cl-card-footer .cl-button[data-variant='outline'][data-color='neutral'] {
  background-color: light-dark(#ffffff, #232328);
  background-image: linear-gradient(180deg, transparent 30%, rgb(0 0 0 / 0.02));
  border: 0;
  border-radius: 0.375rem;
  box-shadow: inset 0 1px 0.5px #ffffff0d, 0 2px 2px -1px #0000000f, 0 4px 4px -2px #0000000a, 0 0 0 1px #0000001a;
  color: var(--cl-color-foreground);
  font-weight: 500;
}
[data-mosaic-theme='clerk'] .cl-button[data-variant='filled'][data-color='primary'] {
  background-color: #6c47ff;
  background-image: linear-gradient(180deg, #ffffff33, transparent);
  border: 0;
  border-radius: 0.375rem;
  box-shadow: inset 0 1px 1px #ffffff1f, 0 2px 2px -1px #00000029, 0 4px 4px -2px #0000003d, 0 0 0 1px #6c47ff;
  color: #ffffff;
  font-weight: 500;
}

[data-mosaic-theme='clerk'] .cl-section-label {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
}
[data-mosaic-theme='clerk'] .cl-section-label + .cl-section-description {
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-top: 0.125rem;
  color: var(--cl-color-foreground-secondary);
}
[data-mosaic-theme='clerk'] .cl-profile-nav-item {
  border-radius: 0.5rem;
}
[data-mosaic-theme='clerk'] .cl-profile-nav-item[data-selected] {
  background-color: light-dark(color-mix(in oklab, var(--cl-color-neutral) 7%, transparent), #232328);
}
[data-mosaic-theme='clerk'] .cl-popover-popup,
[data-mosaic-theme='clerk'] .cl-menu-popup {
  background-color: light-dark(#ffffff, #33333e);
  box-shadow: 0 16px 36px -6px light-dark(rgb(0 0 0 / 0.1), rgb(0 0 0 / 0.07)), 0 6px 16px -2px light-dark(rgb(0 0 0 / 0.1), rgb(0 0 0 / 0.2)), 0 0 0 1px light-dark(rgb(0 0 0 / 0.06), rgb(17 17 19 / 0.32));
}
[data-mosaic-theme='clerk'] .cl-dialog-popup {
  background-color: light-dark(#fafafb, #111113);
  border-radius: 0.75rem;
  box-shadow: 0 32px 72px -12px light-dark(rgb(25 28 33 / 0.2), rgb(25 28 33 / 0.4)), 0 16px 32px -6px light-dark(rgb(0 0 0 / 0.2), rgb(0 0 0 / 0.4));
  overflow: clip;
}
[data-mosaic-theme='clerk'] .cl-dialog-popup .cl-card-root {
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
}
[data-mosaic-theme='clerk'] .cl-dialog-popup .cl-card-header {
  background-color: var(--cl-color-surface);
  border-bottom: 1px solid var(--cl-color-border-subtle);
  border-radius: 0.75rem 0.75rem 0 0;
  box-shadow: 0 0 0 1px light-dark(#191c210a, rgb(255 255 255 / 0.08));
  padding: 1rem 1.25rem;
}
[data-mosaic-theme='clerk'] .cl-dialog-popup .cl-card-title {
  font-size: 1.0625rem;
  font-weight: 500;
  line-height: 1.5rem;
}
[data-mosaic-theme='clerk'] .cl-dialog-popup .cl-card-content {
  background-color: var(--cl-color-surface);
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: 0 0 0 1px light-dark(#191c210a, rgb(255 255 255 / 0.08)), 0 1px 2px light-dark(#191c210f, rgb(0 0 0 / 0.3)), 0 0 2px light-dark(#00000014, rgb(0 0 0 / 0.3));
  padding: 1.25rem;
}
[data-mosaic-theme='clerk'] .cl-dialog-popup .cl-field-label {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
}
[data-mosaic-theme='clerk'] .cl-dialog-popup .cl-input {
  border: 0;
  border-radius: 0.375rem;
  box-shadow: 0 2px 2px -1px light-dark(#0000000f, rgb(0 0 0 / 0.3)), 0 0 0 1px light-dark(#191c211f, rgb(255 255 255 / 0.14)), 0 4px 4px -2px light-dark(#0000000a, rgb(0 0 0 / 0.2));
  height: 2rem;
  padding-inline: 0.625rem;
}
[data-mosaic-theme='clerk'] .cl-dialog-popup .cl-input-group {
  border: 0;
  border-radius: 0.375rem;
  box-shadow: 0 2px 2px -1px light-dark(#0000000f, rgb(0 0 0 / 0.3)), 0 0 0 1px light-dark(#191c211f, rgb(255 255 255 / 0.14)), 0 4px 4px -2px light-dark(#0000000a, rgb(0 0 0 / 0.2));
  height: 2rem;
}
[data-mosaic-theme='clerk'] .cl-dialog-popup .cl-input-group .cl-input {
  box-shadow: none;
  height: 100%;
}
[data-mosaic-theme='clerk'] .cl-dialog-popup .cl-card-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem;
}
[data-mosaic-theme='clerk'] .cl-dialog-popup .cl-card-footer .cl-button {
  flex: 1 1 0;
  font-size: 0.875rem;
  height: 2rem;
  justify-content: center;
}
[data-mosaic-theme='clerk'] .cl-table-shell {
  background-color: light-dark(#fafafb, #111113);
  border-radius: 1rem;
  padding: 0.25rem;
}
[data-mosaic-theme='clerk'] .cl-table {
  border-collapse: separate;
  border-spacing: 0;
}
[data-mosaic-theme='clerk'] .cl-table-header {
  background-color: transparent;
}
[data-mosaic-theme='clerk'] .cl-table-column {
  background-color: transparent;
  border: 0;
  color: var(--cl-color-foreground-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  padding: 1rem 1.75rem;
}
[data-mosaic-theme='clerk'] .cl-table-cell {
  background-color: var(--cl-color-surface);
  border-bottom: 1px solid var(--cl-color-border-subtle);
  color: var(--cl-color-foreground-secondary);
  font-size: 0.875rem;
  padding: 1rem 1.75rem;
}
[data-mosaic-theme='clerk'] .cl-table-body .cl-table-row .cl-table-cell:first-child {
  border-left: 1px solid var(--cl-color-border-subtle);
}
[data-mosaic-theme='clerk'] .cl-table-body .cl-table-row .cl-table-cell:last-child {
  border-right: 1px solid var(--cl-color-border-subtle);
}
[data-mosaic-theme='clerk'] .cl-table-body .cl-table-row:first-child .cl-table-cell {
  border-top: 1px solid var(--cl-color-border-subtle);
}
[data-mosaic-theme='clerk'] .cl-table-body .cl-table-row:first-child .cl-table-cell:first-child {
  border-top-left-radius: 0.75rem;
}
[data-mosaic-theme='clerk'] .cl-table-body .cl-table-row:first-child .cl-table-cell:last-child {
  border-top-right-radius: 0.75rem;
}
[data-mosaic-theme='clerk'] .cl-table-body .cl-table-row:last-child .cl-table-cell:first-child {
  border-bottom-left-radius: 0.75rem;
}
[data-mosaic-theme='clerk'] .cl-table-body .cl-table-row:last-child .cl-table-cell:last-child {
  border-bottom-right-radius: 0.75rem;
}
[data-mosaic-theme='clerk'] .cl-table-search {
  border: 0;
  border-radius: 0.375rem;
  box-shadow: 0 2px 2px -1px light-dark(#0000000f, rgb(0 0 0 / 0.3)), 0 0 0 1px light-dark(#191c211f, rgb(255 255 255 / 0.14)), 0 4px 4px -2px light-dark(#0000000a, rgb(0 0 0 / 0.2));
}
[data-mosaic-theme='clerk'] .cl-tabs-list {
  border-bottom: 1px solid var(--cl-color-border-subtle);
}
[data-mosaic-theme='clerk'] .cl-tabs-tab {
  font-weight: 500;
}

[data-mosaic-theme='clerk'] .cl-user-button-trigger,
[data-mosaic-theme='clerk'] .cl-organization-switcher-trigger {
  position: relative;
  isolation: isolate;
  min-height: 2rem;
  padding-block: 0;
  border: 1px solid transparent;
  border-radius: 0.4375rem;
  background-color: transparent;
  background-clip: padding-box;
  box-shadow: none;
  transition-property: background-color, border-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
[data-mosaic-theme='clerk'] .cl-user-button-trigger::before,
[data-mosaic-theme='clerk'] .cl-organization-switcher-trigger::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.02), inset 0 0 0 1px rgb(255 255 255 / 0.02);
  transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
[data-mosaic-theme='clerk'] .cl-user-button-trigger:active,
[data-mosaic-theme='clerk'] .cl-user-button-trigger[data-open],
[data-mosaic-theme='clerk'] .cl-user-button-trigger[data-popup-open],
[data-mosaic-theme='clerk'] .cl-user-button-trigger[aria-expanded='true'],
[data-mosaic-theme='clerk'] .cl-organization-switcher-trigger:active,
[data-mosaic-theme='clerk'] .cl-organization-switcher-trigger[data-open],
[data-mosaic-theme='clerk'] .cl-organization-switcher-trigger[data-popup-open],
[data-mosaic-theme='clerk'] .cl-organization-switcher-trigger[aria-expanded='true'] {
  background-color: light-dark(#ffffff, #232328);
  border-color: light-dark(rgb(0 0 0 / 0.05), rgb(255 255 255 / 0.05));
  box-shadow: 0 1px 0 -1px rgb(0 0 0 / 0.02), 0 1px 2px -0.5px rgb(0 0 0 / 0.02), 0 2px 2px -1px rgb(0 0 0 / 0.02), 0 3px 6px -4px rgb(0 0 0 / 0.02);
}
@media (hover: hover) {
  [data-mosaic-theme='clerk'] .cl-user-button-trigger:hover,
  [data-mosaic-theme='clerk'] .cl-organization-switcher-trigger:hover {
    background-color: light-dark(#ffffff, #232328);
    border-color: light-dark(rgb(0 0 0 / 0.05), rgb(255 255 255 / 0.05));
    box-shadow: 0 1px 0 -1px rgb(0 0 0 / 0.02), 0 1px 2px -0.5px rgb(0 0 0 / 0.02), 0 2px 2px -1px rgb(0 0 0 / 0.02), 0 3px 6px -4px rgb(0 0 0 / 0.02);
  }
}
[data-mosaic-theme='clerk'] .cl-user-button-trigger:active::before,
[data-mosaic-theme='clerk'] .cl-user-button-trigger[data-open]::before,
[data-mosaic-theme='clerk'] .cl-user-button-trigger[data-popup-open]::before,
[data-mosaic-theme='clerk'] .cl-user-button-trigger[aria-expanded='true']::before,
[data-mosaic-theme='clerk'] .cl-organization-switcher-trigger:active::before,
[data-mosaic-theme='clerk'] .cl-organization-switcher-trigger[data-open]::before,
[data-mosaic-theme='clerk'] .cl-organization-switcher-trigger[data-popup-open]::before,
[data-mosaic-theme='clerk'] .cl-organization-switcher-trigger[aria-expanded='true']::before {
  opacity: 1;
}
@media (hover: hover) {
  [data-mosaic-theme='clerk'] .cl-user-button-trigger:hover::before,
  [data-mosaic-theme='clerk'] .cl-organization-switcher-trigger:hover::before {
    opacity: 1;
  }
}
[data-mosaic-theme='clerk'] .cl-user-button-popover,
[data-mosaic-theme='clerk'] .cl-organization-switcher-popover {
  background-color: light-dark(#ffffff, #33333e);
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px light-dark(rgb(25 28 33 / 0.08), rgb(17 17 19 / 0.32)), inset 0 0 0 1px light-dark(transparent, rgb(255 255 255 / 0.04)), 0 16px 36px -6px rgb(0 0 0 / 0.07), 0 6px 16px -2px rgb(0 0 0 / 0.2);
  overflow: clip;
}
[data-mosaic-theme='clerk'] .cl-user-button-popover,
[data-mosaic-theme='clerk'] .cl-organization-switcher-popover {
  transform: none;
  scale: 1;
  opacity: 1;
  transition: scale var(--cl-duration-base, 180ms) var(--cl-ease-enter, cubic-bezier(0.16, 1, 0.3, 1)), opacity var(--cl-duration-base, 180ms) var(--cl-ease-enter, cubic-bezier(0.16, 1, 0.3, 1));
}
[data-mosaic-theme='clerk'] .cl-user-button-popover[data-starting-style],
[data-mosaic-theme='clerk'] .cl-user-button-popover[data-ending-style],
[data-mosaic-theme='clerk'] .cl-organization-switcher-popover[data-starting-style],
[data-mosaic-theme='clerk'] .cl-organization-switcher-popover[data-ending-style] {
  scale: 0.95;
  opacity: 0;
}
[data-mosaic-theme='clerk'] .cl-user-button-popover[data-ending-style],
[data-mosaic-theme='clerk'] .cl-organization-switcher-popover[data-ending-style] {
  transition: scale var(--cl-duration-fast, 120ms) var(--cl-ease-exit, cubic-bezier(0.4, 0, 1, 1)), opacity var(--cl-duration-fast, 120ms) var(--cl-ease-exit, cubic-bezier(0.4, 0, 1, 1));
}
@media (prefers-reduced-motion: reduce) {
  [data-mosaic-theme='clerk'] .cl-user-button-popover,
  [data-mosaic-theme='clerk'] .cl-user-button-popover[data-starting-style],
  [data-mosaic-theme='clerk'] .cl-user-button-popover[data-ending-style],
  [data-mosaic-theme='clerk'] .cl-organization-switcher-popover,
  [data-mosaic-theme='clerk'] .cl-organization-switcher-popover[data-starting-style],
  [data-mosaic-theme='clerk'] .cl-organization-switcher-popover[data-ending-style] {
    scale: 1;
    transition: opacity var(--cl-duration-base, 180ms);
  }
}
[data-mosaic-theme='clerk'] .cl-user-button-item,
[data-mosaic-theme='clerk'] .cl-organization-switcher-item {
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
}
[data-mosaic-theme='clerk'] .cl-user-button-item[data-interactive]:hover,
[data-mosaic-theme='clerk'] .cl-organization-switcher-item[data-interactive]:hover {
  background-color: light-dark(#f6f6f7, #232328);
  box-shadow: inset 0 0 0 1px light-dark(#ececee, rgb(0 0 0 / 0.12));
}
[data-mosaic-theme='clerk'] .cl-user-button-item-label,
[data-mosaic-theme='clerk'] .cl-organization-switcher-item-label {
  font-weight: 500;
}
[data-mosaic-theme='clerk'] .cl-badge {
  border-radius: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.015em;
  line-height: 0.875rem;
  padding: 0.125rem 0.25rem;
}

`;
export const THEME_CSS = THEME_RULES.replace(
  /(\.cl-[^{]*\{)([^}]*)\}/g,
  (_, selector: string, body: string) => `${selector}${body.replace(/;/g, ' !important;')}}`,
);
