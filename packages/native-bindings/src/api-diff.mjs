import fs from 'node:fs';
import path from 'node:path';

const [beforeDirectory, afterDirectory] = process.argv.slice(2);
if (!beforeDirectory || !afterDirectory)
  throw new Error('Usage: node src/api-diff.mjs BEFORE_GENERATED_DIRECTORY AFTER_GENERATED_DIRECTORY');
let breaking = false;
for (const language of ['swift', 'kotlin']) {
  const read = directory =>
    new Set(
      fs
        .readFileSync(path.join(directory, `${language}-api.txt`), 'utf8')
        .trim()
        .split('\n'),
    );
  const before = read(beforeDirectory),
    after = read(afterDirectory);
  const removed = [...before].filter(line => !after.has(line));
  const added = [...after].filter(line => !before.has(line));
  breaking ||= removed.length > 0;
  console.log(JSON.stringify({ language, removed, added }, null, 2));
}
if (breaking) process.exitCode = 2;
