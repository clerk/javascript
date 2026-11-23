import { RuleTester } from 'oxlint/plugins-dev';
import { describe, test } from 'vitest';

RuleTester.describe = describe;
RuleTester.it = test;
