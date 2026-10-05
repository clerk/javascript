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

const UNSUPPORTED = new Set(['style', 'script', 'foreignObject', 'image']);
const PAINT = new Set(['fill', 'fill-rule', 'clip-rule', 'stroke']);
const UNPAINTED = new Set(['clipPath', 'mask']);

const camel = value => value.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function treat(entry, optimized) {
  const unused = new Set(Object.keys(entry.colors ?? {}));
  const swap = value => {
    for (const [from, to] of Object.entries(entry.colors ?? {})) {
      if (value.toLowerCase() === from.toLowerCase()) {
        unused.delete(from);
        return to;
      }
    }
    return value;
  };

  let svg;
  let unpaintedDepth = 0;
  optimize(optimized, {
    plugins: [
      {
        name: 'providerLogoTreatment',
        fn: root => {
          svg = root.children.find(child => child.type === 'element');
          return {
            element: {
              enter: node => {
                if (UNSUPPORTED.has(node.name)) {
                  throw new Error(`${entry.id}: unsupported <${node.name}> element`);
                }
                if (UNPAINTED.has(node.name)) {
                  unpaintedDepth += 1;
                }
                const { fill } = node.attributes;
                if (entry.treatment === 'mono' && unpaintedDepth === 0 && (node === svg || (fill && fill !== 'none'))) {
                  node.attributes.fill = 'currentColor';
                }
                if (node.attributes.fill) {
                  node.attributes.fill = swap(node.attributes.fill);
                }
              },
              exit: node => {
                if (UNPAINTED.has(node.name)) {
                  unpaintedDepth -= 1;
                }
              },
            },
            text: {
              enter: node => {
                if (node.value.trim()) {
                  throw new Error(`${entry.id}: unexpected text content: ${node.value.slice(0, 40)}`);
                }
              },
            },
          };
        },
      },
    ],
  });

  if (unused.size > 0) {
    throw new Error(`${entry.id}: colors not found in the optimized SVG: ${[...unused].join(', ')}`);
  }
  return svg;
}

const elements = node => node.children.filter(child => child.type === 'element');

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
  const attrs = attrsToJsx(node.attributes, ids);
  const open = attrs ? `<${node.name} ${attrs}` : `<${node.name}`;
  const children = elements(node);
  if (children.length === 0) {
    return `${open} />`;
  }
  return `${open}>${children.map(child => toJsx(child, ids)).join('')}</${node.name}>`;
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
  const svg = treat(entry, optimized);
  if (!svg.attributes.viewBox) {
    throw new Error(`${entry.id}: the SVG has no viewBox`);
  }
  const paint = Object.fromEntries(Object.entries(svg.attributes).filter(([k]) => PAINT.has(k)));

  const ids = new Set();
  const collect = node => {
    if (node.attributes.id) {
      ids.add(node.attributes.id);
    }
    elements(node).forEach(collect);
  };
  collect(svg);

  let body = elements(svg)
    .map(child => toJsx(child, ids))
    .join('');
  const paintAttrs = attrsToJsx(paint, ids);
  if (paintAttrs) {
    body = `<g ${paintAttrs}>${body}</g>`;
  } else if (elements(svg).length > 1) {
    body = `<>${body}</>`;
  }
  if (entry.treatment === 'adaptive' && !body.includes('light-dark(')) {
    throw new Error(`${entry.id}: an adaptive logo needs at least one light-dark() color`);
  }

  const key = /^[a-z_$][\w$]*$/i.test(entry.id) ? entry.id : `'${entry.id}'`;
  glyphs.push(`  ${key}: {
    viewBox: '${squareViewBox(svg.attributes.viewBox)}',
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
