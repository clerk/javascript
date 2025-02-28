/**
 * This file is used for conditional imports to mitigate bundling issues with Next.js server actions on version prior to 14.1.0.
 */
const fs = undefined;
const path = undefined;
const cwd = undefined;

module.exports = { fs, path, cwd };
