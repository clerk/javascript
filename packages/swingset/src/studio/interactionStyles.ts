export const HOVER_ATTR = 'data-studio-hover';
export const ACTIVE_ATTR = 'data-studio-active';

const HOVER = /:hover(?![\w-])/g;
const ACTIVE = /:active(?![\w-])/g;

const mirrored = new WeakSet<CSSRule>();

function mirror(parent: CSSStyleSheet | CSSGroupingRule) {
  const rules = parent.cssRules;
  for (let i = rules.length - 1; i >= 0; i--) {
    const rule = rules[i];
    if (mirrored.has(rule)) {
      continue;
    }
    mirrored.add(rule);
    if (rule instanceof CSSStyleRule) {
      const selector = rule.selectorText.replace(HOVER, `[${HOVER_ATTR}]`).replace(ACTIVE, `[${ACTIVE_ATTR}]`);
      if (selector !== rule.selectorText) {
        try {
          mirrored.add(parent.cssRules[parent.insertRule(`${selector}{${rule.style.cssText}}`, i + 1)]);
        } catch {
          continue;
        }
      }
    } else if (rule instanceof CSSGroupingRule) {
      mirror(rule);
    }
  }
}

export function mirrorInteractionStyles() {
  for (const sheet of document.styleSheets) {
    try {
      mirror(sheet);
    } catch {
      continue;
    }
  }
}
