import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

import { optimize } from 'svgo';

const dir = resolve(import.meta.dirname, '../src/components/provider-logo');
const { providers } = JSON.parse(readFileSync(resolve(dir, 'logos/manifest.json'), 'utf8'));

const TREATMENTS = new Set(['color', 'mono', 'adaptive']);

function optimizeSvg(id, source) {
  return optimize(source, {
    multipass: true,
    floatPrecision: 1,
    plugins: [
      { name: 'preset-default', params: { overrides: { removeViewBox: false } } },
      'removeDimensions',
      'removeTitle',
      'convertStyleToAttrs',
      { name: 'prefixIds', params: { prefix: `cl-logo-${id}`, delim: '-' } },
    ],
  }).data;
}

function parse(markup) {
  const root = { children: [] };
  const stack = [root];
  const tag = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[\w:-]+="[^"]*")*)\s*(\/?)>|([^<]+)/g;
  for (const [, closing, name, attrs, selfClosing, text] of markup.matchAll(tag)) {
    if (text !== undefined) {
      if (text.trim()) {
        throw new Error(`Unexpected text content: ${text.slice(0, 40)}`);
      }
      continue;
    }
    if (closing) {
      stack.pop();
      continue;
    }
    if (name === 'style' || name === 'script' || name === 'foreignObject' || name === 'image') {
      throw new Error(`Unsupported <${name}> element`);
    }
    const node = {
      name,
      attrs: Object.fromEntries([...attrs.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v])),
      children: [],
    };
    stack.at(-1).children.push(node);
    if (!selfClosing) {
      stack.push(node);
    }
  }
  return root.children[0];
}

const camel = value => value.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function applyTreatment(entry, svg) {
  const paint = Object.fromEntries(
    Object.entries(svg.attrs).filter(([k]) => ['fill', 'fill-rule', 'clip-rule', 'stroke'].includes(k)),
  );
  const visit = (node, fn) => {
    fn(node);
    node.children.forEach(child => visit(child, fn));
  };

  if (entry.treatment === 'mono') {
    paint.fill = 'currentColor';
    svg.children.forEach(child =>
      visit(child, node => {
        if (node.name === 'clipPath' || node.name === 'mask') {
          return;
        }
        if (node.attrs.fill && node.attrs.fill !== 'none') {
          node.attrs.fill = 'currentColor';
        }
      }),
    );
  }

  const unused = new Set(Object.keys(entry.colors ?? {}));
  const swap = value => {
    for (const [from, to] of Object.entries(entry.colors ?? {})) {
      if (value?.toLowerCase() === from.toLowerCase()) {
        unused.delete(from);
        return to;
      }
    }
    return value;
  };
  if (paint.fill) {
    paint.fill = swap(paint.fill);
  }
  svg.children.forEach(child =>
    visit(child, node => {
      if (node.attrs.fill) {
        node.attrs.fill = swap(node.attrs.fill);
      }
    }),
  );
  if (unused.size > 0) {
    throw new Error(`${entry.id}: colors not found in the optimized SVG: ${[...unused].join(', ')}`);
  }
  return paint;
}

function attrsToJsx(attrs, ids) {
  return Object.entries(attrs)
    .filter(([k]) => !k.startsWith('xmlns') && k !== 'class' && k !== 'data-name')
    .map(([k, v]) => {
      const name = k === 'xlink:href' ? 'href' : k.startsWith('aria-') || k.startsWith('data-') ? k : camel(k);
      if (name === 'id') {
        return `id={\`${v}-\${uid}\`}`;
      }
      const scoped = v.replace(/#(cl-logo-[\w-]+)/g, (match, ref) => (ids.has(ref) ? `#${ref}-\${uid}` : match));
      if (v.startsWith('light-dark(')) {
        return `style={{ ${camel(name)}: '${v}' }}`;
      }
      if (name === 'style') {
        const entries = v
          .split(';')
          .filter(Boolean)
          .map(rule => rule.split(':').map(s => s.trim()))
          .map(([prop, value]) => `${camel(prop)}: '${value}'`);
        return `style={{ ${entries.join(', ')} }}`;
      }
      return scoped === v ? `${name}='${v}'` : `${name}={\`${scoped}\`}`;
    })
    .join(' ');
}

function toJsx(node, ids) {
  const attrs = attrsToJsx(node.attrs, ids);
  const open = attrs ? `<${node.name} ${attrs}` : `<${node.name}`;
  if (node.children.length === 0) {
    return `${open} />`;
  }
  return `${open}>${node.children.map(child => toJsx(child, ids)).join('')}</${node.name}>`;
}

function squareViewBox(viewBox) {
  let [x, y, w, h] = viewBox.split(/[\s,]+/).map(Number);
  if (w !== h) {
    const size = Math.max(w, h);
    x -= (size - w) / 2;
    y -= (size - h) / 2;
    w = h = size;
  }
  return [x, y, w, h].map(n => +n.toFixed(2)).join(' ');
}

const seen = new Set();
const glyphs = [];
let rawBytes = '';

for (const entry of providers) {
  if (seen.has(entry.id)) {
    throw new Error(`Duplicate provider id: ${entry.id}`);
  }
  seen.add(entry.id);
  if (!TREATMENTS.has(entry.treatment)) {
    throw new Error(`${entry.id}: unknown treatment "${entry.treatment}"`);
  }

  const optimized = optimizeSvg(entry.id, readFileSync(resolve(dir, `logos/${entry.id}.svg`), 'utf8'));
  rawBytes += optimized;
  const svg = parse(optimized);
  if (!svg.attrs.viewBox) {
    throw new Error(`${entry.id}: the SVG has no viewBox`);
  }
  const paint = applyTreatment(entry, svg);

  const ids = new Set();
  const collect = node => {
    if (node.attrs.id) {
      ids.add(node.attrs.id);
    }
    node.children.forEach(collect);
  };
  collect(svg);

  let body = svg.children.map(child => toJsx(child, ids)).join('');
  const paintAttrs = attrsToJsx(paint, ids);
  if (paintAttrs) {
    body = `<g ${paintAttrs}>${body}</g>`;
  } else if (svg.children.length > 1) {
    body = `<>${body}</>`;
  }
  if (entry.treatment === 'adaptive' && !body.includes('light-dark(')) {
    throw new Error(`${entry.id}: an adaptive logo needs at least one light-dark() color`);
  }

  const key = /^[a-z_$][\w$]*$/i.test(entry.id) ? entry.id : `'${entry.id}'`;
  glyphs.push(`  ${key}: {
    viewBox: '${squareViewBox(svg.attrs.viewBox)}',
    render: (${ids.size > 0 ? 'uid' : ''}) => (${body}),
  },`);
}

writeFileSync(
  resolve(dir, 'provider-logo.ids.generated.ts'),
  `export const providerLogoIds = ${JSON.stringify(providers.map(p => p.id))} as const;

export type ProviderLogoId = (typeof providerLogoIds)[number];
`,
);

writeFileSync(
  resolve(dir, 'provider-logo.glyphs.generated.tsx'),
  `import type React from 'react';

import type { ProviderLogoId } from './provider-logo.ids.generated';

export type ProviderLogoGlyph = { viewBox: string; render: (uid: string) => React.ReactElement };

export const providerLogoGlyphs: Record<ProviderLogoId, ProviderLogoGlyph> = {
${glyphs.join('\n')}
};
`,
);

execFileSync(
  'pnpm',
  ['exec', 'prettier', '--write', 'provider-logo.ids.generated.ts', 'provider-logo.glyphs.generated.tsx'],
  { cwd: dir, stdio: 'ignore' },
);

console.log(`${providers.length} provider logos, ${gzipSync(rawBytes, { level: 9 }).length} B gzip of optimized SVG`);
