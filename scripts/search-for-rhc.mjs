#!/usr/bin/env zx

/**
 * The purpose of this script is to search for RHC (remotely hosted code) in the build outputs of a package.
 * For example, @clerk/chrome-extension should not have any RHC in it, this includes unused functions that include remote URLs.
 */

import { $, argv } from 'zx';

async function run() {
  const buildFolder = argv._[0];
  console.log(`🔍 Inspecting folder: ${buildFolder}`);
  const flags = ['--recursive', '--quiet', '--include=*.js', '--include=*.mjs'];

  // Leveraging https://google.github.io/zx/process-promise#nothrow to avoid throwing an error if the command fails
  if ((await $`grep ${flags} 'npm/@clerk/clerk-js' ${buildFolder}`.exitCode) === 0) {
    throw new Error('Found RHC in build output');
  } else {
    console.log('✅ No RHC found in build output');
  }
}

run();
