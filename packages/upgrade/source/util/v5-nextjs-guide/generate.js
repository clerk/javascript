import { readFileSync } from 'fs';
import { parseInline } from 'marked';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VERSION = 'v5';

async function generate() {
  const data = (await import(`../../versions/${VERSION}/index.js`)).default['nextjs'];

  let output = '';
  output += `---
title: Upgrading Next.js from v4 to v5
description: Learn how to upgrade Clerk's Next.js SDK from v4 to v5.
---`;
  output += '\n\n';
  output += read('intro');
  output += '\n\n';
  output += read('version-requirements');

  // This is a guide-specific item, no matcher for this
  const defaultsChangeItem = {
    title: 'Changes to default variables',
    content: `\nThe default values of some [appearance variables](/docs/components/customization/variables) have changed which may impact your UI (if you are not already overriding them).

    - The default \`colorPrimary\` value changed from \`#103FEF\` to \`#2F3037\`. As the new color is a dark grey, the \`colorPrimary\` of the dark theme was changed to \`#FFFFFF\`.
    - The default \`fontSize\` value changed from \`1rem\` to \`0.8125rem\`
    - The default \`fontWeight\` values changed from \`{ normal: 400, medium: 500, bold: 600 }\` to \`{ normal: 400, medium: 500, bold: 700 }\`
    - Previously, the default value for \`fontSmoothing\` was \`auto\`. This value is now unset. If you want to pass a custom value to it, you can still do so.\n`,
  };

  output += '\n\n';
  output += read('retheme-changes');

  const apperanceChanges = data.filter(i => i.category === 'appearance');
  apperanceChanges.push(defaultsChangeItem);
  const localizationChanges = data.filter(i => i.category === 'localization');

  output += '\n\n';
  output += '#### Appearance changes';
  output += '\n\n';
  output += `<Accordion titles={[${apperanceChanges.map(i => `"${parseInline(i.title)}"`).join(', ')}]}>`;
  output += '\n';
  output += apperanceChanges.map(i => `<AccordionPanel>${i.content}</AccordionPanel>`).join('\n');
  output += '</Accordion>';
  output += '\n\n';
  output += '#### Localization changes';
  output += '\n\n';
  output += `<Accordion titles={[${localizationChanges.map(i => `"${parseInline(i.title)}"`).join(', ')}]}>`;
  output += '\n';
  output += localizationChanges.map(i => `<AccordionPanel>${i.content}</AccordionPanel>`).join('\n');
  output += '</Accordion>';

  output += '\n\n';
  output += read('middleware-changes');
  output += '\n\n';
  output += read('import-changes');
  output += '\n\n';
  output += read('after-sign-x-handling');
  output += '\n\n';
  output += read('deprecation-removals');

  const deprecationRemovals = data.filter(i => i.category === 'deprecation-removal');
  const otherChanges = data.filter(i => !i.category);

  output += '\n\n';
  output += '#### Deprecation removals';
  output += '\n\n';
  output += `<Accordion titles={[${deprecationRemovals.map(i => `"${parseInline(i.title)}"`).join(', ')}]}>`;
  output += '\n';
  output += deprecationRemovals.map(i => `<AccordionPanel>${i.content}</AccordionPanel>`).join('\n');
  output += '</Accordion>';
  output += '\n\n';
  output += '#### Other breaking changes';
  output += '\n\n';
  output += `<Accordion titles={[${otherChanges.map(i => `"${parseInline(i.title)}"`).join(', ')}]}>`;
  output += '\n';
  output += otherChanges.map(i => `<AccordionPanel>${i.content}</AccordionPanel>`).join('\n');
  output += '</Accordion>';
  output += '\n\n';

  return output;
}

generate().then(console.log);

function read(p) {
  return readFileSync(path.join(__dirname, p + '.mdx'), 'utf8');
}
