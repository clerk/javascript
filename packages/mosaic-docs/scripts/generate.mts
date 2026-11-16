/**
 * Generates the docs content from swingset (../swingset). Runs before `dev` and `build`.
 *
 * Usage: node scripts/generate.mts [path/to/packages/swingset]
 *
 * Reads every `*.stories.tsx` + `*.mdx` pair in swingset's `src/stories`, keeps the groups
 * documented here (Components, Primitives, Hooks), and writes one JSON file per item to
 * `.content/<section>/<slug>.json` plus a `manifest.json`. `.content/` is git-ignored.
 *
 * MDX is rewritten into a small vocabulary the site renders itself:
 *   <Story name='X' …/> / <Preview name='X' …/>  →  <Example name="X" />   (source of story fn X)
 *   <PropTable meta={…} extra={…} />            →  <Props />               (rows stored in JSON)
 *   <Usage component module props>…</Usage>     →  fenced ```tsx block
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

import { compile } from '@mdx-js/mdx';
import prettier from 'prettier';
import remarkGfm from 'remark-gfm';
import ts from 'typescript';

const SECTIONS: Record<string, string> = {
  Components: 'components',
  Primitives: 'primitives',
  Hooks: 'hooks',
};

const swingsetDir = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, '../../swingset'));
const storiesDir = path.join(swingsetDir, 'src/stories');
const outDir = path.join(import.meta.dirname, '../.content');

type Prop = { name: string; type: string; default?: string };
type Meta = {
  group: string;
  title: string;
  source?: string;
  styles?: { _variants?: Record<string, Record<string, unknown>>; _defaultVariants?: Record<string, unknown> };
};

function toSlug(s: string) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function evalLiteral(text: string): any {
  // Literals come from swingset source in our own monorepo.
  return vm.runInNewContext(`(${text})`);
}

function parseStoryFile(file: string) {
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let meta: Meta | undefined;
  const fns: Record<string, string> = {};
  const isExported = (n: ts.Node) =>
    ts.canHaveModifiers(n) && (ts.getModifiers(n) ?? []).some(m => m.kind === ts.SyntaxKind.ExportKeyword);

  for (const stmt of sf.statements) {
    if (!isExported(stmt)) {
      continue;
    }
    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        const name = decl.name.getText(sf);
        if (name === 'meta' && decl.initializer) {
          let init: ts.Expression = decl.initializer;
          while (ts.isSatisfiesExpression(init) || ts.isAsExpression(init)) {
            init = init.expression;
          }
          try {
            meta = evalLiteral(init.getText(sf));
          } catch {
            // Fall back to the string fields we need.
            const pick = (k: string) => init.getText(sf).match(new RegExp(`${k}:\\s*'([^']+)'`))?.[1];
            meta = {
              group: pick('group') ?? '',
              title: pick('title') ?? '',
              source: pick('source'),
            };
          }
        } else if (
          decl.initializer &&
          (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))
        ) {
          fns[name] = stmt.getText(sf);
        }
      }
    } else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      fns[stmt.name.text] = stmt.getText(sf);
    }
  }
  return { meta, fns };
}

/** Light cleanup so story sources read like usage code rather than knob plumbing. */
function cleanExample(src: string) {
  return src
    .replace(/^export (default )?/, '')
    .replace(/\(\s*props\s*:\s*Record<string,\s*unknown>\s*\)/g, '()')
    .replace(/\(\s*_props\s*:\s*Record<string,\s*unknown>\s*\)/g, '()')
    .replace(/^\s*\{\.\.\.(knobsAsProps\(props\)|props|\w+\(props\))\}\n/gm, '')
    .replace(/\s\{\.\.\.(knobsAsProps\(props\)|props|\w+\(props\))\}/g, '');
}

function variantProps(meta: Meta | undefined): Prop[] {
  const variants = meta?.styles?._variants ?? {};
  const defaults = meta?.styles?._defaultVariants ?? {};
  return Object.entries(variants).map(([name, options]) => {
    const keys = Object.keys(options);
    const isBoolean = keys.every(k => k === 'true' || k === 'false');
    const type = isBoolean ? 'boolean' : keys.map(k => `'${k}'`).join(' | ');
    const def = defaults[name];
    return {
      name,
      type,
      default:
        def === undefined
          ? undefined
          : isBoolean
            ? JSON.stringify(def)
            : `'${typeof def === 'string' ? def : JSON.stringify(def)}'`,
    };
  });
}

function usageCode(attrs: string, inner: string) {
  const component = attrs.match(/component=['"]([^'"]+)['"]/)?.[1] ?? 'Component';
  const importPath = attrs.match(/module=['"]([^'"]+)['"]/)?.[1];
  const propsLit = attrs.match(/props=\{(\{[\s\S]*\})\}/)?.[1];
  const props: Record<string, unknown> = propsLit ? evalLiteral(propsLit) : {};
  const attrLines = Object.entries(props)
    .map(([k, v]) => (typeof v === 'boolean' ? (v ? k : null) : typeof v === 'number' ? `${k}={${v}}` : `${k}='${v}'`))
    .filter(Boolean);
  const body = inner.trim();
  const lines: string[] = [];
  if (importPath) {
    lines.push(`import { ${component} } from '${importPath}'`, '');
  }
  if (attrLines.length === 0) {
    lines.push(body ? `<${component}>${body}</${component}>` : `<${component} />`);
  } else {
    lines.push(`<${component}`, ...attrLines.map(a => `  ${a}`));
    lines.push(...(body ? ['>', `  ${body}`, `</${component}>`] : ['/>']));
  }
  return '```tsx\n' + lines.join('\n') + '\n```';
}

/** Split out fenced code so tag rewrites never touch code samples. */
function mapOutsideFences(src: string, fn: (chunk: string) => string) {
  return src
    .split(/(^```[\s\S]*?^```)/m)
    .map((chunk, i) => (i % 2 === 1 ? chunk : fn(chunk)))
    .join('');
}

function transformMdx(mdx: string, moduleFns: Record<string, Record<string, string>>, fallbackModule: string) {
  const usedExamples: Record<string, string> = {};
  let props: Prop[] | null = null;
  const imports: Record<string, string> = {};
  for (const m of mdx.matchAll(/^import \* as (\w+) from ['"]\.\/([^'"]+)['"];?$/gm)) {
    imports[m[1]] = m[2];
  }

  let body = mdx.replace(/^import .*$/gm, '');

  // Title + lede.
  let title: string | undefined;
  body = body.replace(/^# (.+)\n/m, (_, t) => {
    title = t.trim();
    return '';
  });

  body = mapOutsideFences(body, chunk =>
    chunk
      .replace(/<(Story|Preview)\b([\s\S]*?)\/>/g, (_, _tag, attrs: string) => {
        const name = attrs.match(/name=['"]([^'"]+)['"]/)?.[1];
        const mod = attrs.match(/storyModule=\{(\w+)\}/)?.[1];
        const file = (mod && imports[mod]) || fallbackModule;
        const src = name ? moduleFns[file]?.[name] : undefined;
        if (!name || !src) {
          return '';
        }
        const key = `${file}#${name}`;
        usedExamples[key] = cleanExample(src);
        return `<Example id="${key}" name="${name}" />`;
      })
      .replace(/<PropTable\b([\s\S]*?)\/>/g, (_, attrs: string) => {
        const mod = attrs.match(/meta=\{(\w+)\.meta\}/)?.[1];
        const file = (mod && imports[mod]) || fallbackModule;
        const extraLit = attrs.match(/extra=\{(\[[\s\S]*\])\}/)?.[1];
        const extra: Prop[] = extraLit ? evalLiteral(extraLit) : [];
        props = [...variantProps(metaByFile[file]), ...extra, { name: 'xstyle', type: 'XStyle' }];
        return '<Props />';
      })
      .replace(/<Usage\b([^>]*?)(?:\/>|>([\s\S]*?)<\/Usage>)/g, (_, attrs: string, inner = '') =>
        usageCode(attrs, inner),
      ),
  );

  body = body
    .replace(/^## Playground$/m, '## Example')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Lede = first plain paragraph before any heading.
  let description: string | undefined;
  const firstBlock = body.split(/\n\n/)[0];
  if (firstBlock && !/^[#<`|-]/.test(firstBlock.trim())) {
    description = firstBlock.trim();
    body = body.slice(firstBlock.length).trim();
  }
  return { title, description, body, examples: usedExamples, props };
}

const metaByFile: Record<string, Meta | undefined> = {};

async function main() {
  if (!fs.existsSync(storiesDir)) {
    throw new Error(`No swingset stories at ${storiesDir}`);
  }
  const storyFiles = fs.readdirSync(storiesDir).filter(f => f.endsWith('.stories.tsx') || f.endsWith('.stories.ts'));
  const moduleFns: Record<string, Record<string, string>> = {};
  for (const f of storyFiles) {
    const key = f.replace(/\.tsx?$/, '');
    const { meta, fns } = parseStoryFile(path.join(storiesDir, f));
    moduleFns[key] = fns;
    metaByFile[key] = meta;
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  const manifest: Record<string, Array<{ slug: string; title: string; description?: string }>> = {};
  const failures: string[] = [];

  for (const f of storyFiles.sort()) {
    const key = f.replace(/\.tsx?$/, '');
    const meta = metaByFile[key];
    if (!meta || !SECTIONS[meta.group]) {
      continue;
    }
    const section = SECTIONS[meta.group];
    const mdxFile = path.join(storiesDir, key.replace(/\.stories$/, '.mdx'));
    const mdx = fs.existsSync(mdxFile) ? fs.readFileSync(mdxFile, 'utf8') : `# ${meta.title}\n`;
    const t = transformMdx(mdx, moduleFns, key);
    const props = t.props ?? (meta.styles ? [...variantProps(meta), { name: 'xstyle', type: 'XStyle' }] : null);
    let body = t.body;
    if (!t.props && props) {
      body += '\n\n## Props\n\n<Props />';
    }

    try {
      await compile(body, { remarkPlugins: [remarkGfm] });
    } catch (e) {
      failures.push(`${key}: ${(e as Error).message}`);
      continue;
    }

    const slug = toSlug(meta.title);
    const item = {
      section,
      slug,
      title: meta.title,
      description: t.description,
      source: meta.source,
      body,
      examples: t.examples,
      props,
    };
    for (const [k, code] of Object.entries(t.examples)) {
      try {
        t.examples[k] = (
          await prettier.format(code, {
            parser: 'typescript',
            singleQuote: true,
            jsxSingleQuote: true,
            semi: false,
            printWidth: 80,
          })
        ).trim();
      } catch {
        // Keep the raw source when it doesn't parse standalone.
      }
    }
    fs.mkdirSync(path.join(outDir, section), { recursive: true });
    fs.writeFileSync(path.join(outDir, section, `${slug}.json`), JSON.stringify(item, null, 2) + '\n');
    (manifest[section] ??= []).push({ slug, title: meta.title, description: t.description });
  }

  for (const list of Object.values(manifest)) {
    list.sort((a, b) => a.title.localeCompare(b.title));
  }
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  for (const [s, list] of Object.entries(manifest)) {
    console.log(`${s}: ${list.length}`);
  }
  if (failures.length) {
    console.error(`\n${failures.length} item(s) skipped (MDX failed to compile):`);
    for (const f of failures) {
      console.error(`  ${f}`);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
