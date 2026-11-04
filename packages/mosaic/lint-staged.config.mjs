import { lstatSync } from 'node:fs';

export default {
  '*.{mjs,js,jsx,ts,tsx,vue}': prettier,
  '*.{json,md,mdx}': prettier,
};

function prettier(files) {
  const realFiles = files.filter(file => !lstatSync(file).isSymbolicLink());
  return realFiles.length ? [`pnpm prettier --write ${realFiles.map(file => JSON.stringify(file)).join(' ')}`] : [];
}
