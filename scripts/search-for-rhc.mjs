#!/usr/bin/env zx

/**
 * The purpose of this script is to search for RHC (remotely hosted code) in the build outputs of a package.
 * For example, @clerk/chrome-extension should not have any RHC in it, this includes unused functions that include remote URLs.
 */

import { $, argv } from 'zx';

const targetType = argv._[0]; // file | directory
const target = argv._[1]; // Target of the resource

async function asyncSearchRHC(name, search, regex = false) {
  const flag = regex ? 'E' : 'F';
  const cmd = () =>
    targetType === 'directory'
      ? $`grep -${flag}q --include=\\*.js --include=\\*.mjs ${search} ${target}`
      : $`grep -${flag}q ${search} ${target}`;

  if ((await cmd().exitCode) === 0) {
    throw new Error(`Found ${name} related RHC in build output. (Search: \`${search}\`)`);
  }

  return;
}

await Promise.allSettled([
  asyncSearchRHC('Turnstile', 'cloudflare.com/turnstile/v0/api.js'),
  asyncSearchRHC('clerk-js Hotloading', '/npm/@clerk/clerk-js'),
  asyncSearchRHC('Google One Tap', 'accounts.google.com/gsi/client'),
  asyncSearchRHC('Coinbase', 'coinbase.com'),
  asyncSearchRHC('Coinbase Wallet import', 'import\s*"@coinbase/wallet-sdk', true), // eslint-disable-line no-useless-escape
  asyncSearchRHC('Stripe', 'js.stripe.com'),
  asyncSearchRHC('Stripe import', 'import\s*"@stripe/stripe-js', true), // eslint-disable-line no-useless-escape
  asyncSearchRHC('Base import', 'import\s*"@base-org/account', true), // eslint-disable-line no-useless-escape
]).then(results => {
  const errors = results.filter(result => result.status === 'rejected').map(result => result.reason.message);

  if (errors.length > 0) {
    throw new Error(`\n${errors.join('\n')}`);
  }

  console.log('✅ No RHC found in build output');
});
