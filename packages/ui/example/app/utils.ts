import type { HslColor } from './color-picker';

const hslToString = (color: HslColor) => `${color.h} ${color.s}% ${color.l}%`;

const highlightLine = (line: [string, HslColor]) => {
  const [key, color] = line;
  return `  <span style="color:#bab1ff">--cl-${key}</span>: <span style="color:#5de3ff">${hslToString(color)}</span>;`;
};

export const generateTheme = (colors: [string, HslColor][]) => {
  const raw = colors.map(([key, color]) => `  --cl-${key}: ${hslToString(color)};`).join('\n');
  const highlighted = colors.map(highlightLine).join('\n');
  return {
    rawCss: `:root {
${raw}
}`,
    highlightedCss: `:root {
${highlighted}
}`,
  };
};
