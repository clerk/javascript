import { applicationConfig } from '../models/applicationConfig';
import { templates } from '../templates';

const clerkAstroLocal = `file:${process.cwd()}/packages/astro`;
const clerkTypesLocal = `file:${process.cwd()}/packages/types`;
const clerkLocalizationLocal = `file:${process.cwd()}/packages/localizations`;

import * as fs from 'fs';
import * as path from 'path';

const logFoldersAndFiles = dir => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    if (entry.isDirectory()) {
      console.log(`- ${entry.name}`);
      const subDir = path.join(dir, entry.name);

      // Read the sub-directory for files
      const subEntries = fs.readdirSync(subDir, { withFileTypes: true });

      subEntries.forEach(subEntry => {
        console.log(`  -- ${subEntry.name}`);
      });
    }
  });
};

// Replace 'your_directory_path' with the actual directory path you want to scan
const directoryPath = `${process.cwd()}/packages/astro`;
logFoldersAndFiles(directoryPath);

const astroNode = applicationConfig()
  .setName('astro-node')
  .useTemplate(templates['astro-node'])
  .setEnvFormatter('public', key => `PUBLIC_ASTRO_APP_${key}`)
  .addScript('setup', 'npm i')
  .addScript('dev', 'npm run dev')
  .addScript('build', 'npm run build')
  .addScript('serve', 'npm run preview')
  .addDependency('@clerk/astro', clerkAstroLocal)
  .addDependency('@clerk/types', clerkTypesLocal)
  .addDependency('@clerk/localizations', clerkLocalizationLocal);

export const astro = {
  node: astroNode,
};
