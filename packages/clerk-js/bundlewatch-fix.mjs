import { writeFile } from 'node:fs/promises';
import bundlewatch from 'bundlewatch';
import { minimatch } from 'minimatch';
import { format } from 'prettier';
import { $ } from 'zx';
import bundlewatchConfig from './bundlewatch.config.json' with { type: 'json' };

const { fullResults } = await bundlewatch.default(bundlewatchConfig);
const failedFiles = fullResults.filter(result => result.status === 'fail');

for (const file of failedFiles) {
  const matchingFileIndex = bundlewatchConfig.files.findIndex(f => {
    return minimatch(file.filePath, f.path);
  });
  if (matchingFileIndex !== -1) {
    // update maxSize to the file size plus 1KB, rounded up to the nearest KB
    bundlewatchConfig.files[matchingFileIndex].maxSize = `${Math.ceil((file.size + 1024) / 1024)}KB`;
  }
}

const formattedConfig = await format(JSON.stringify(bundlewatchConfig), { parser: 'json' });
await writeFile('./bundlewatch.config.json', formattedConfig);
// print the git diff of the bundlewatch.config.json file
const diff = await $`git -c color.ui=always --no-pager diff bundlewatch.config.json`.then(res => res.stdout);
console.log(diff);
console.log('Bundlewatch config updated!');
