#!/usr/bin/env zx

/**
 * The purpose of this script is to search for RHC (remotely hosted code) in the build outputs of a package.
 * For example, @clerk/chrome-extension should not have any RHC in it, this includes unused functions that include remote URLs.
 */

import { $, argv } from 'zx';

const targetType = argv._[0]; // file | directory
const target = argv._[1]; // Target of the resource

async function asyncSearchRHC(name, search) {
  const cmd = () =>
    targetType === 'directory'
      ? $`grep -rFq --include=\\*.js --include=\\*.mjs "${search}" ${target}`
      : $`grep -Fq "${search}" ${target}`;

  if ((await cmd().exitCode) === 0) {
    throw new Error(`Found ${name} related RHC in build output. (Search: \`${search}\`)`);
  }

  return;
}

await Promise.allSettled([
  asyncSearchRHC('Turnstile', 'cloudflare.com/turnstile/v0/api.js'),
  asyncSearchRHC('clerk-js Hotloading', '/npm/@clerk/clerk-js'),
  asyncSearchRHC('Google One Tap', 'accounts.google.com/gsi/client'),
]).then(results => {
  const errors = results.filter(result => result.status === 'rejected').map(result => result.reason.message);

  if (errors.length > 0) {
    throw new Error(`\n${errors.join('\n')}`);
  }

  console.log('✅ No RHC found in build output');
});
