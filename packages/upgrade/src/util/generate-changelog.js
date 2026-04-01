import { parseInline } from 'marked';

import SDKS from '../constants/sdks.js';

const VERSION = 'v5';

async function generate() {
  let output = '';
  output += `# Clerk SDKs ${VERSION} Changelog\n\n`;
  output += `Below is a listing of all the changes made to Clerk SDKs in ${VERSION} - each section describes the changes to one SDK. Note that some changes may be repeated between different SDKs.\n\n`;
  const data = (await import(`../versions/${VERSION}/index.js`)).default;

  for (let sdk in data) {
    output += `### ${getSdkName(sdk)}\n\n---\n\n`;
    data[sdk].map(entry => {
      // Note: make sure to add a custom anchor link here to match the cli output
      // anchor should be `entry.slug`
      output += `<details>
<summary>${
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        parseInline(entry.title)
      }</summary>
                
Regex matcher: \`${entry.matcher}\`

${entry.content}
</details>\n\n`;
    });
  }

  return output;
}

void generate().then(console.log);

function getSdkName(val) {
  return SDKS.find(sdk => val === sdk.value).label;
}
