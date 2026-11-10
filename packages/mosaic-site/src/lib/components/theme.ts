export type ThemeId = 'default' | 'clerk' | 'carbon' | 'minimal';
export const THEME_MESSAGE = 'mosaic-theme';
export const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'default', label: 'default' },
  { id: 'clerk', label: 'clerk' },
  { id: 'carbon', label: 'carbon' },
  { id: 'minimal', label: 'minimal' },
];
export const parseTheme = (value: string | null | undefined): ThemeId =>
  THEMES.find(item => item.id === value)?.id ?? 'default';
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
[data-mosaic-theme='carbon'] {
  --cl-color-neutral: light-dark(#1b1b1b, #f0f0f1);
  --cl-color-page: light-dark(#f9f9fa, #0e0f10);
  --cl-color-surface: light-dark(#ffffff, #16171a);
  --cl-color-surface-subtle: light-dark(#f3f3f4, #1b1c1f);
  --cl-color-foreground: light-dark(#1b1b1b, #f0f0f1);
  --cl-color-foreground-secondary: light-dark(#5e5e60, #8a8f98);
  --cl-color-foreground-disabled: light-dark(#a0a0a2, #5a5d64);
  --cl-color-border: light-dark(#d8d8d8, #2a2c31);
  --cl-color-border-subtle: light-dark(#00000016, #212327);
  --cl-color-brand: light-dark(#5e6ad2, #6a76df);
  --cl-color-brand-foreground: #ffffff;
  --cl-color-negative: light-dark(#e2253b, #f73d3d);
  --cl-radius-sm: 0.25rem;
  --cl-radius-md: 0.5rem;
  --cl-radius-lg: 0.625rem;
  --cl-radius-xl: 0.75rem;
  --cl-radius-2xl: 1rem;
  --cl-text-sm-size: 0.8125rem;
  --cl-shadow-sm: 0 0 0 0.5px light-dark(#00000016, rgb(255 255 255 / 0.06)), 0 1px 1px light-dark(#0000000a, rgb(0 0 0 / 0.3));
  --cl-shadow-md: 0 0 0 0.5px light-dark(#00000016, rgb(255 255 255 / 0.06)), 0 3px 6px -2px light-dark(#00000005, rgb(0 0 0 / 0.4)), 0 1px 1px light-dark(#0000000a, rgb(0 0 0 / 0.3));
  --cl-shadow-lg: 0 0 0 0.5px light-dark(#00000016, rgb(255 255 255 / 0.07)), 0 8px 16px -6px light-dark(rgb(0 0 0 / 0.12), rgb(0 0 0 / 0.5));
}
[data-mosaic-theme='carbon'] .cl-profile-content-body {
  margin: 0 auto;
  max-width: 40rem;
}
[data-mosaic-theme='carbon'] .cl-profile-page-title {
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 2rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
}
[data-mosaic-theme='carbon'] .cl-panel-sections {
  gap: 3rem;
}
[data-mosaic-theme='carbon'] .cl-section-group {
  flex-direction: column;
  gap: 1rem;
}
[data-mosaic-theme='carbon'] .cl-section-header {
  margin: 0;
  padding: 0 1rem;
}
[data-mosaic-theme='carbon'] .cl-section-title {
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.4375rem;
}
[data-mosaic-theme='carbon'] .cl-section-body {
  background-color: var(--cl-color-surface);
  border: 0;
  border-radius: 0.625rem;
  box-shadow: var(--cl-shadow-md);
  padding: 0;
}
[data-mosaic-theme='carbon'] .cl-section-row,
[data-mosaic-theme='carbon'] .cl-section-items > .cl-section-item {
  border-width: 0;
  min-height: 3.75rem;
  padding: 1rem;
}
[data-mosaic-theme='carbon'] .cl-section-row + .cl-section-row,
[data-mosaic-theme='carbon'] .cl-section-items > .cl-section-item + .cl-section-item {
  background-image: linear-gradient(#00000016, #00000016);
  background-position: center top;
  background-repeat: no-repeat;
  background-size: calc(100% - 2rem) 0.5px;
}
[data-mosaic-theme='carbon'] .cl-section-label {
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1rem;
}
[data-mosaic-theme='carbon'] .cl-section-description {
  font-size: 0.8125rem;
  font-weight: 450;
}
[data-mosaic-theme='carbon'] .cl-section-label + .cl-section-description {
  font-size: 0.75rem;
  line-height: 1rem;
  margin-top: 0.1875rem;
}
[data-mosaic-theme='carbon'] .cl-button[data-variant='outline'][data-color='neutral'] {
  background-color: var(--cl-color-surface);
  border: 0.5px solid light-dark(#d8d8d8, #2a2c31);
  border-radius: 0.5rem;
  box-shadow: none;
  font-size: 0.8125rem;
  font-weight: 500;
  height: 2rem;
}
[data-mosaic-theme='carbon'] .cl-profile-nav-item {
  border-radius: 0.5rem;
  font-size: 0.8125rem;
}
[data-mosaic-theme='carbon'] .cl-profile-nav-item[data-selected] {
  background-color: color-mix(in oklab, var(--cl-color-neutral) 7%, transparent);
}
[data-mosaic-theme='minimal'] {
  --cl-color-neutral: light-dark(#37352f, #ffffff);
  --cl-color-page: light-dark(#ffffff, #191919);
  --cl-color-surface: light-dark(#ffffff, #191919);
  --cl-color-surface-subtle: light-dark(#f7f7f5, #252525);
  --cl-color-foreground: light-dark(#37352f, #ebebeb);
  --cl-color-foreground-secondary: light-dark(#787774, #9b9b9b);
  --cl-color-foreground-disabled: light-dark(#b7b6b3, #5a5a5a);
  --cl-color-border: light-dark(#dedcd8, #373737);
  --cl-color-border-subtle: light-dark(#ebeae7, #2e2e2e);
  --cl-color-brand: #2383e2;
  --cl-color-brand-foreground: #ffffff;
  --cl-radius-sm: 0.1875rem;
  --cl-radius-md: 0.375rem;
  --cl-radius-lg: 0.4375rem;
  --cl-radius-xl: 0.5rem;
  --cl-radius-2xl: 0.75rem;
  --cl-shadow-sm: none;
  --cl-shadow-md: 0 0 0 1px light-dark(rgb(55 53 47 / 0.09), rgb(255 255 255 / 0.07));
  --cl-shadow-lg: 0 0 0 1px light-dark(rgb(15 15 15 / 0.05), rgb(255 255 255 / 0.07)), 0 3px 6px light-dark(rgb(15 15 15 / 0.1), rgb(0 0 0 / 0.3)), 0 9px 24px light-dark(rgb(15 15 15 / 0.2), rgb(0 0 0 / 0.4));
}
[data-mosaic-theme='minimal'] .cl-table-shell {
  background-color: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}
[data-mosaic-theme='minimal'] .cl-table {
  border-collapse: collapse;
  border-spacing: 0;
}
[data-mosaic-theme='minimal'] .cl-table-header {
  background-color: transparent;
}
[data-mosaic-theme='minimal'] .cl-table-column {
  background-color: transparent;
  border-bottom: 1px solid var(--cl-color-border-subtle);
  border-top: 1px solid var(--cl-color-border-subtle);
  color: var(--cl-color-foreground-secondary);
  font-size: 0.875rem;
  font-weight: 400;
  padding: 0.5rem 0.75rem;
}
[data-mosaic-theme='minimal'] .cl-table-cell {
  background-color: transparent;
  border-bottom: 1px solid var(--cl-color-border-subtle);
  color: var(--cl-color-foreground);
  font-size: 0.9375rem;
  padding: 0.75rem;
}
[data-mosaic-theme='minimal'] .cl-table-row:hover .cl-table-cell {
  background-color: light-dark(rgb(55 53 47 / 0.04), rgb(255 255 255 / 0.04));
}
[data-mosaic-theme='minimal'] .cl-profile-layout {
  column-gap: 2.5rem;
}
[data-mosaic-theme='minimal'] .cl-profile-nav-item {
  border-radius: 0.375rem;
}
[data-mosaic-theme='minimal'] .cl-profile-nav-item[data-selected] {
  background-color: color-mix(in oklab, var(--cl-color-neutral) 8%, transparent);
}
[data-mosaic-theme='minimal'] .cl-profile-page-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 2.5rem;
  margin-bottom: 2.5rem;
}
[data-mosaic-theme='minimal'] .cl-panel-sections {
  gap: 4rem;
}
[data-mosaic-theme='minimal'] .cl-section-header {
  margin: 0 0 0.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--cl-color-border-subtle);
}
[data-mosaic-theme='minimal'] .cl-section-title {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.005em;
}
[data-mosaic-theme='minimal'] .cl-section-body {
  background-color: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}
[data-mosaic-theme='minimal'] .cl-section-row {
  border-width: 0;
  padding: 0.875rem 0;
}
[data-mosaic-theme='minimal'] .cl-section-label {
  font-weight: 600;
}
[data-mosaic-theme='minimal'] .cl-button:not(.cl-menu-trigger) {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
[data-mosaic-theme='minimal'] .cl-button[data-variant='outline']:not(.cl-menu-trigger) {
  height: 2rem;
  padding-inline: 0.75rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup {
  background-color: light-dark(#ffffff, #202020);
  border: 1px solid light-dark(#e9e9e7, #373737);
  border-radius: 0.75rem;
  box-shadow: var(--cl-shadow-lg);
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-root {
  background-color: transparent;
  border-radius: 0;
  box-shadow: none;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-header {
  border: 0;
  justify-content: center;
  padding: 2rem 2rem 0.5rem;
  position: relative;
  text-align: center;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.75rem;
  text-align: center;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-header .cl-button {
  background-color: color-mix(in oklab, var(--cl-color-neutral) 10%, transparent);
  border-radius: 9999px;
  position: absolute;
  right: 1rem;
  top: 1rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-header-content {
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-media {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-description {
  color: var(--cl-color-foreground-secondary);
  font-size: 1rem;
  line-height: 1.5rem;
  margin-top: 0.5rem;
  text-align: center;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-content {
  padding: 1rem 2rem 2rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-group {
  display: flex;
  flex-direction: column;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-header {
  display: contents;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-header .cl-section-content {
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-body {
  order: 1;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-header .cl-section-actions {
  align-self: stretch;
  display: flex;
  margin-top: 1.5rem;
  order: 2;
  width: 100%;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-header .cl-section-actions .cl-button {
  background-color: var(--cl-color-brand);
  border: 0;
  border-radius: 0.5rem;
  box-shadow: none;
  color: var(--cl-color-brand-foreground);
  flex: none;
  font-weight: 600;
  height: 2rem;
  justify-content: center;
  width: 100%;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-title {
  color: var(--cl-color-foreground-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-row,
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-items > .cl-section-item {
  border: 1px solid var(--cl-color-border);
  border-radius: 0.5rem;
  padding: 0.875rem 1rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-section-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-content:has(.cl-field-root) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-field-root {
  gap: 0.5rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-field-label {
  color: var(--cl-color-foreground-secondary);
  font-size: 0.875rem;
  font-weight: 400;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-input {
  background-color: light-dark(#f7f7f5, #2a2a2a);
  border: 1px solid var(--cl-color-border);
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  height: 2rem;
  padding-inline: 0.75rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-input-group {
  background-color: light-dark(#f7f7f5, #2a2a2a);
  border: 1px solid var(--cl-color-border);
  border-radius: 0.5rem;
  height: 2rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-input-group .cl-input {
  background-color: transparent;
  border: 0;
  box-shadow: none;
  height: 100%;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-footer {
  border: 0;
  flex-direction: column-reverse;
  gap: 0.5rem;
  padding: 0 2rem 2rem;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-footer .cl-button {
  border-radius: 0.5rem;
  flex: none;
  font-weight: 600;
  height: 2rem;
  min-height: 2rem;
  justify-content: center;
  width: 100%;
}
[data-mosaic-theme='minimal'] .cl-dialog-popup .cl-card-footer .cl-button[data-variant='outline'] {
  background-color: transparent;
  border: 0;
  box-shadow: none;
  color: var(--cl-color-foreground-secondary);
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
[data-mosaic-theme='carbon'] .cl-user-button-trigger,
[data-mosaic-theme='carbon'] .cl-organization-switcher-trigger {
  background-color: transparent;
  border-radius: 0.5rem;
  box-shadow: 0 0 0 0.5px light-dark(#d8d8d8, #2a2c31);
}
[data-mosaic-theme='carbon'] .cl-user-button-popover,
[data-mosaic-theme='carbon'] .cl-organization-switcher-popover {
  border-radius: 0.625rem;
  box-shadow: var(--cl-shadow-md);
}
[data-mosaic-theme='carbon'] .cl-user-button-item,
[data-mosaic-theme='carbon'] .cl-organization-switcher-item {
  font-size: 0.8125rem;
  min-height: 2rem;
}
[data-mosaic-theme='minimal'] .cl-user-button-trigger,
[data-mosaic-theme='minimal'] .cl-organization-switcher-trigger {
  background-color: transparent;
  border-radius: 0.375rem;
  box-shadow: none;
}
[data-mosaic-theme='minimal'] .cl-user-button-popover,
[data-mosaic-theme='minimal'] .cl-organization-switcher-popover {
  background-color: light-dark(#ffffff, #202020);
  border-radius: 0.75rem;
  box-shadow: var(--cl-shadow-lg);
}
[data-mosaic-theme='minimal'] .cl-user-button-item,
[data-mosaic-theme='minimal'] .cl-organization-switcher-item {
  border-radius: 0.375rem;
}
[data-mosaic-theme='minimal'] .cl-user-button-header-title,
[data-mosaic-theme='minimal'] .cl-organization-switcher-header-title {
  font-weight: 600;
}

`;
export const THEME_CSS = THEME_RULES.replace(
  /(\.cl-[^{]*\{)([^}]*)\}/g,
  (_, selector: string, body: string) => `${selector}${body.replace(/;/g, ' !important;')}}`,
);
