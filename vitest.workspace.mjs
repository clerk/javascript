import { defineWorkspace } from 'vitest/config';

export default defineWorkspace(['./vitest.config.mts', './packages/*/vitest.config.{mts,mjs,js,ts}']);
