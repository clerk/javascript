import {
  accordionForCategory,
  assembleContent,
  frontmatter,
  loadVersionChangeData,
  markdown,
  writeToFile,
} from '../../text-generation.js';

const cwd = 'core-2/retheme';

async function generate() {
  const data = await loadVersionChangeData('core-2', 'nextjs');

  const defaultsChangeItem = {
    title: 'Changes to default variables',
    content: `\nThe default values of some [appearance variables](/docs/components/customization/variables) have changed which may impact your UI (if you are not already overriding them).

    - The default \`colorPrimary\` value changed from \`#103FEF\` to \`#2F3037\`. As the new color is a dark grey, the \`colorPrimary\` of the dark theme was changed to \`#FFFFFF\`.
    - The default \`fontSize\` value changed from \`1rem\` to \`0.8125rem\`
    - The default \`fontWeight\` values changed from \`{ normal: 400, medium: 500, bold: 600 }\` to \`{ normal: 400, medium: 500, semibold: 600, bold: 700 }\`.\n`,
  };

  return assembleContent({ data: data, cwd }, [
    frontmatter({
      title: 'Redesigned Components in Core 2',
      description: 'Learn how to handle changes as a result of redesigned components in Clerk Core 2',
    }),
    '# Redesigned Components in Core 2',
    markdown('intro'),
    '## Appearance Changes',
    accordionForCategory('appearance', { additionalItems: [defaultsChangeItem] }),
    '## Localization Changes',
    accordionForCategory('localization'),
  ]);
}

void generate().then(writeToFile(cwd));
