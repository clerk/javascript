import ejs from 'ejs';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { parseInline } from 'marked';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadVersionChangeData(version, sdk) {
  return (await import(`../versions/${version}/index.js`)).default[sdk];
}

// Small utility for assembling and spacing out content pieces.
export function assembleContent(options, content) {
  return content.reduce((output, item) => {
    output += typeof item === 'function' ? item(options) : item;
    output += '\n\n';
    return output;
  }, '');
}

// Renders an object into a frontmatter string
export function frontmatter(obj) {
  return `---
${Object.keys(obj)
  .map(k => `${k}: "${obj[k]}"`)
  .join('\n')}
---

{/* WARNING: This is a generated file and should not be edited directly. To update its contents, see the "upgrade" package in the clerk/javascript repo. */}`;
}

// Renders a markdown file, partial-style - will read out of shared if not found in sdk dir
export const markdown = partial((p, { cwd }) => {
  const defaultPath = path.join(__dirname, cwd, p + '.mdx');
  const sharedPath = path.join(__dirname, cwd, '../shared', p + '.mdx');

  return readFileSync(existsSync(defaultPath) ? defaultPath : sharedPath, 'utf8').trim();
});

// Renders a markdown file with EJS template valyes
export const markdownTemplate = partial((p, data, { cwd }) => {
  const defaultPath = path.join(__dirname, cwd, p + '.mdx');
  const sharedPath = path.join(__dirname, cwd, '../shared', p + '.mdx');

  return ejs.render(readFileSync(existsSync(defaultPath) ? defaultPath : sharedPath, 'utf8').trim(), data);
});

// Given a single change item, renders it as its own markdown section.
// Typically used to highlight a specific change item that has a larger
// impact and/or is likely to affect most users.
export const singleItem = partial((slug, { data }) => {
  const item = data.find(i => i.slug === slug);
  return `### ${item.title}

${item.content.trim()}`;
});

// Given a set of change data and one or more categories, renders each item
// in the given categories into an accordion.
// Typically used to present a set of related changes or a longer list of changes
// that are de-emphasized as they are unlikely to be present for most users.
export const accordionForCategory = partial((categories, options, { data }) => {
  const items = filterCategories(data, categories);
  options ||= {};

  if (options.additionalItems) {
    items.push(...[].concat(options.additionalItems));
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return `<Accordion titles={[${items.map(i => `"${parseInline(i.title)}"`).join(', ')}]}>
${items.map(i => `  <AccordionPanel>${indent('\n' + i.content.trim(), 4)}\n  </AccordionPanel>`).join('\n')}
</Accordion>`;
});

// The "deprecation removals & housekeeping" section is standard at the bottom of
// each migration guide, and comprises a set of breaking changes that any given
// user is very unlikely to run into, so it is de-emphasized to make the upgrade
// process feel less scary.
export const deprecationRemovalsAndHousekeeping = partial((includeCategories, opts) => {
  includeCategories ||= [];

  const hasDeprecations = filterCategories(opts.data, 'deprecation-removal').length;
  const hasOtherChanges = filterCategories(opts.data, [undefined, ...includeCategories]).length;

  const content = ['### Deprecation removals & housekeeping', markdown('deprecation-removals')];

  if (hasDeprecations) {
    content.push('#### Deprecation removals');
    content.push(accordionForCategory('deprecation-removal'));
  }

  if (hasOtherChanges) {
    content.push('#### Other Breaking changes');
    content.push(accordionForCategory([undefined, ...includeCategories]));
  }

  return assembleContent(opts, content);
});

// writes output to an mdx file
export const writeToFile = partial((cwd, content) => {
  writeFileSync(path.join(__dirname, cwd, '__output.mdx'), content);
});

function filterCategories(data, categories) {
  return data.filter(i => [].concat(categories).includes(i.category));
}

// Small internal utility to ensure proper indentation within the resulting markup.
function indent(str, numSpaces) {
  return str
    .split('\n')
    .map(l => `${' '.repeat(numSpaces)}${l}`)
    .join('\n');
}

// Partial application utility, enables assembleContent to pass data into every child easily.
// This is one of the craziest functions I have written in my day 🥹
function partial(fn) {
  return (...args) => fn.bind(null, ...args.concat(Array(fn.length - args.length - 1)));
}
