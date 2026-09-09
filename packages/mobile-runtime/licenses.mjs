import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export function bundleNotices(moduleIds, repository) {
  const packages = new Map();
  for (const id of moduleIds) {
    if (!path.isAbsolute(id)) continue;
    let directory = path.dirname(id);
    while (!fs.existsSync(path.join(directory, 'package.json'))) {
      const parent = path.dirname(directory);
      if (parent === directory) throw new Error(`Cannot attribute bundled module: ${id}`);
      directory = parent;
    }
    if (packages.has(directory)) continue;
    const metadata = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
    const ownedSource = directory.startsWith(path.join(repository, 'packages') + path.sep);
    const noticeFiles = fs.readdirSync(directory).filter(name => /^(licen[sc]e|notice)(\.|$|-)/i.test(name));
    const notices = noticeFiles
      .filter(name => fs.statSync(path.join(directory, name)).isFile())
      .sort()
      .map(name => fs.readFileSync(path.join(directory, name), 'utf8').trim());
    if (!notices.length && fs.existsSync(path.join(directory, 'README.md'))) {
      const lines = fs.readFileSync(path.join(directory, 'README.md'), 'utf8').split(/\r?\n/);
      const heading = lines.findIndex(line => /^#{1,6}\s+licen[sc]e\s*$/i.test(line));
      if (heading >= 0) {
        const nextHeading = lines.findIndex((line, index) => index > heading && /^#{1,6}\s/.test(line));
        notices.push(
          lines
            .slice(heading + 1, nextHeading < 0 ? undefined : nextHeading)
            .join('\n')
            .trim(),
        );
      }
    }
    if (!notices.length && ownedSource) notices.push(fs.readFileSync(path.join(repository, 'LICENSE'), 'utf8').trim());
    if (!metadata.name || !metadata.version || !notices.length)
      throw new Error(`Bundled dependency requires an explicit license notice: ${directory}`);
    packages.set(directory, {
      name: metadata.name,
      version: metadata.version,
      license: metadata.license ?? (ownedSource ? 'MIT' : null),
      notice: notices.join('\n\n'),
    });
  }
  const dependencies = [...packages.values()].sort((a, b) =>
    `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`, 'en'),
  );
  const text =
    dependencies.map(item => `${item.name}@${item.version}\n${'='.repeat(72)}\n\n${item.notice}`).join('\n\n') + '\n';
  const inventory = dependencies.map(({ notice, ...metadata }) => ({
    ...metadata,
    noticeSHA256: createHash('sha256').update(notice).digest('hex'),
  }));
  return { text, inventory };
}
