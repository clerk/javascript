export type SceneThemeId = 'github' | 'linear';
export type SceneThemeChoice = 'default' | SceneThemeId;

export const SCENE_THEMES: { id: SceneThemeId; label: string; description: string }[] = [
  { id: 'github', label: 'Workday', description: 'Bordered boxes, outlined badges, a sidebar marker' },
  { id: 'linear', label: 'After hours', description: 'Nested frames, hairline rings, pill controls' },
];

const scope = (id: SceneThemeChoice, selector = '') => `[data-scene-theme='${id}']${selector ? ` ${selector}` : ''}`;

const DEFAULT = `
${scope('default')} {
  --cl-color-neutral: light-dark(oklch(0.12 0.008 60), oklch(0.99 0.002 85));
  --cl-color-page: light-dark(#ffffff, #0f0d0b);
  --cl-color-surface: light-dark(#ffffff, #181613);
  --cl-color-surface-subtle: light-dark(#f7f7f6, #201d1b);
  --cl-color-foreground: light-dark(#191714, #fafaf9);
  --cl-color-foreground-secondary: light-dark(#595450, #a5a29f);
  --cl-color-foreground-disabled: light-dark(#a5a39f, #76726e);
  --cl-color-input: var(--cl-color-surface);
  --cl-color-input-placeholder: light-dark(#75716c, #a5a29f);
  --cl-color-ring: light-dark(#181613, #e4e3e1);
  --cl-color-neutral-alpha-100: color-mix(in oklab, var(--cl-color-neutral) 6%, transparent);
  --cl-color-neutral-alpha-200: color-mix(in oklab, var(--cl-color-neutral) 8%, transparent);
  --cl-color-neutral-alpha-300: color-mix(in oklab, var(--cl-color-neutral) 12%, transparent);
  --cl-color-neutral-subtle: light-dark(var(--cl-color-neutral-alpha-200), var(--cl-color-neutral-alpha-300));
  --cl-color-border: var(--cl-color-neutral-alpha-300);
  --cl-color-border-subtle: var(--cl-color-neutral-alpha-200);
}
`;

const GITHUB = `
${scope('github')} {
  --cl-font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
  --cl-color-neutral: light-dark(#25221f, #f6f5f4);
  --cl-color-page: light-dark(#ffffff, #12100e);
  --cl-color-surface: light-dark(#ffffff, #12100e);
  --cl-color-surface-subtle: light-dark(#f8f8f7, #1d1a18);
  --cl-color-foreground: light-dark(#25221f, #f6f5f4);
  --cl-color-foreground-secondary: light-dark(#65615c, #9a9793);
  --cl-color-border: light-dark(#d9d8d5, #47423e);
  --cl-color-border-subtle: light-dark(#d9d8d5b3, #47423eb3);
  --cl-color-brand: light-dark(#0969da, #1f6feb);
  --cl-color-brand-foreground: #ffffff;
  --cl-radius-sm: 0.375rem;
  --cl-radius-md: 0.375rem;
  --cl-radius-lg: 0.375rem;
  --cl-radius-xl: 0.375rem;
  --cl-radius-2xl: 0.375rem;
}
${scope('github', '.cl-profile-layout')} {
  border-color: transparent;
}
${scope('github', '.cl-profile-nav')} {
  background-color: var(--cl-color-page);
  border-right: 0;
}
${scope('github', '.cl-profile-nav-item')} {
  position: relative;
  font-size: 0.875rem;
  color: var(--cl-color-foreground);
}
${scope('github', ".cl-profile-nav-item[aria-selected='true']")} {
  background-color: light-dark(#8d89851f, #6f6b6633);
  font-weight: 600;
}
${scope('github', ".cl-profile-nav-item[aria-selected='true']::before")} {
  content: '';
  position: absolute;
  left: -0.5rem;
  top: 50%;
  width: 0.25rem;
  height: 1.5rem;
  translate: 0 -50%;
  border-radius: 0.375rem;
  background-color: var(--cl-color-brand);
}
${scope('github', '.cl-profile-page-title')} {
  font-size: 1.5rem;
  font-weight: 400;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--cl-color-border);
}
${scope('github', '.cl-section-title')} {
  font-size: 1rem;
  font-weight: 600;
}
${scope('github', '.cl-section-body')} {
  background-color: var(--cl-color-page);
  border: 1px solid var(--cl-color-border);
  border-radius: 0.375rem;
  box-shadow: none;
}
${scope('github', '.cl-section-row + .cl-section-row')},
${scope('github', '.cl-section-items > .cl-section-item + .cl-section-item')} {
  border-top: 1px solid var(--cl-color-border);
}
${scope('github', '.cl-badge')} {
  background-color: transparent;
  border: 1px solid var(--cl-color-border);
  border-radius: 2em;
  color: var(--cl-color-foreground);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0 0.4375rem;
}
${scope('github', ".cl-badge[data-color='neutral']")} {
  border-color: light-dark(#0969da, #4493f8);
  color: light-dark(#0969da, #4493f8);
}
${scope('github', ".cl-badge[data-color='positive']")} {
  border-color: light-dark(#1a7f37, #3fb950);
  color: light-dark(#1a7f37, #3fb950);
}
${scope('github', ".cl-badge[data-color='warning']")} {
  border-color: light-dark(#9a6700, #d29922);
  color: light-dark(#9a6700, #d29922);
}
${scope('github', '.cl-button')} {
  border-radius: 0.375rem;
  font-weight: 500;
}
${scope('github', ".cl-button[data-variant='outline']")} {
  background-color: light-dark(#f8f8f7, #2a2724);
  border-color: var(--cl-color-border);
  box-shadow: none;
}
`;

const RING = 'inset 0 0 0 1px light-dark(rgb(0 0 0 / 0.06), rgb(255 255 255 / 0.06))';
const BEVEL = 'inset 0 1px 0 light-dark(rgb(255 255 255 / 0.8), rgb(255 255 255 / 0.04))';
const LIFT = '0 1px 3px light-dark(rgb(0 0 0 / 0.04), rgb(0 0 0 / 0.24))';

const LINEAR = `
${scope('linear')} {
  --cl-font-family-sans: 'Inter', 'Inter Variable', -apple-system, system-ui, sans-serif;
  --cl-color-neutral: light-dark(#111111, #ffffff);
  --cl-color-page: light-dark(#fbfbfb, #121212);
  --cl-color-surface: light-dark(#ffffff, #181818);
  --cl-color-surface-subtle: light-dark(#f4f4f4, #161616);
  --cl-color-foreground: light-dark(#111111, #ffffff);
  --cl-color-foreground-secondary: light-dark(#6f6f6f, #939393);
  --cl-color-border: light-dark(#e6e6e6, #2a2a2a);
  --cl-color-border-subtle: light-dark(#efefef, #222222);
  --cl-color-brand: #0071fc;
  --cl-color-brand-foreground: #ffffff;
  --cl-radius-sm: 0.5rem;
  --cl-radius-md: 0.625rem;
  --cl-radius-lg: 0.75rem;
  --cl-radius-xl: 1.25rem;
  --cl-radius-2xl: 1.5rem;
}
${scope('linear', '.cl-profile-layout')} {
  border-color: transparent;
  box-shadow: ${RING}, ${BEVEL}, ${LIFT};
}
${scope('linear', '.cl-profile-nav')} {
  border-right: 0;
}
${scope('linear', ".cl-profile-nav-item[aria-selected='true']")} {
  background-color: light-dark(rgb(0 0 0 / 0.05), rgb(255 255 255 / 0.06));
  border-radius: 9999px;
  box-shadow: ${RING};
}
${scope('linear', '.cl-profile-page-title')} {
  font-size: 1.375rem;
  font-weight: 500;
  letter-spacing: -0.02em;
}
${scope('linear', '.cl-section-group')} {
  background-color: var(--cl-color-surface-subtle);
  border-radius: 1.25rem;
  box-shadow: ${RING};
  flex-direction: column;
  padding: 0.375rem;
}
${scope('linear', '.cl-section-header')} {
  margin: 0;
  padding: 0.5rem 0.75rem 0.625rem;
}
${scope('linear', '.cl-section-title')} {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--cl-color-foreground-secondary);
}
${scope('linear', '.cl-section-body')} {
  background-color: var(--cl-color-surface);
  border: 0;
  border-radius: 0.875rem;
  box-shadow: ${RING}, ${BEVEL}, ${LIFT};
}
${scope('linear', '.cl-section-row + .cl-section-row')},
${scope('linear', '.cl-section-items > .cl-section-item + .cl-section-item')} {
  border-top: 1px solid var(--cl-color-border-subtle);
}
${scope('linear', '.cl-button')} {
  border-radius: 9999px;
  font-weight: 500;
}
${scope('linear', ".cl-button[data-variant='outline']")} {
  background-color: light-dark(rgb(0 0 0 / 0.04), rgb(255 255 255 / 0.06));
  border-color: transparent;
  box-shadow: ${RING}, ${BEVEL};
}
${scope('linear', '.cl-badge')} {
  background-color: light-dark(rgb(0 0 0 / 0.05), rgb(255 255 255 / 0.07));
  border-radius: 9999px;
  box-shadow: ${RING};
  color: var(--cl-color-foreground-secondary);
}
`;

const important = (css: string) => css.replace(/^(\s+(?!--)[a-z-]+:\s[^;]+);$/gm, '$1 !important;');

export const SCENE_THEME_CSS = important(DEFAULT + GITHUB + LINEAR);
