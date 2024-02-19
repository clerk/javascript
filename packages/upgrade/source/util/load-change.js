import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function createLoader({ version, baseUrl }) {
  return function load(sdk, slugs) {
    // Note: This could benefit perf-wise by being converted to async, but it would
    // make the code a decent amount more complex.
    return slugs.map(slug => {
      const sdkPath = path.join(__dirname, '../versions', `${version}`, sdk, `${slug}.md`);
      const sharedPath = path.join(__dirname, '../versions', `${version}`, 'common', `${slug}.md`);

      const loadPath = fs.existsSync(sdkPath) ? sdkPath : sharedPath;
      const content = fs.readFileSync(loadPath, 'utf8');
      const parsed = matter(content);
      const fm = parsed.data;

      return {
        title: fm.title,
        matcher: Array.isArray(fm.matcher)
          ? fm.matcher.map(m => new RegExp(m, `g${fm.matcherFlags ? fm.matcherFlags : ''}`))
          : new RegExp(fm.matcher, `g${fm.matcherFlags ? fm.matcherFlags : ''}`),
        replaceWithString: fm.replaceWithString,
        slug,
        sdk: sdk,
        content: parsed.content,
        warning: fm.warning,
        category: fm.category,
        link: `${baseUrl}#${slug}`,
      };
    });
  };
}
