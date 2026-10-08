import path from 'node:path';

import { ESLint } from 'eslint';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint({ overrideConfig: tseslint.configs.disableTypeChecked });
const root = path.resolve(import.meta.dirname, '..');

async function boundaryMessages(code, role) {
  const [result] = await eslint.lintText(code, {
    filePath: path.join(root, `packages/ui/src/components/SignIn/sign-in-start.${role}.tsx`),
  });
  expect(result.messages.filter(message => message.fatal)).toEqual([]);
  return result.messages.filter(message => message.ruleId === 'no-restricted-syntax');
}

describe('UI flow import boundaries', () => {
  it.each(['controller', 'view'])('rejects SDK hook imports in a %s', async role => {
    const messages = await boundaryMessages("import { useClerk as readClerk } from '@clerk/shared/react';", role);
    expect(messages).toHaveLength(1);
    expect(messages[0].severity).toBe(2);
  });

  it.each(['controller', 'view'])('rejects SDK components in a %s', async role => {
    expect(
      await boundaryMessages("import { __experimental_PaymentElement as Element } from '@clerk/shared/react';", role),
    ).toHaveLength(1);
  });

  it.each(['controller', 'view'])('rejects namespace imports in a %s', async role => {
    expect(await boundaryMessages("import * as Clerk from '@clerk/shared/react';", role)).toHaveLength(1);
  });

  it.each(['controller', 'view'])('rejects default and dynamic imports in a %s', async role => {
    expect(await boundaryMessages("import Clerk from '@clerk/shared/react';", role)).toHaveLength(1);
    expect(await boundaryMessages("void import('@clerk/shared/react');", role)).toHaveLength(1);
  });

  it.each(['controller', 'view'])('allows type imports and generic contexts in a %s', async role => {
    expect(
      await boundaryMessages("import type { __experimental_useCheckout } from '@clerk/shared/react';", role),
    ).toEqual([]);
    expect(
      await boundaryMessages("import { type __experimental_useCheckout } from '@clerk/shared/react';", role),
    ).toEqual([]);
    expect(await boundaryMessages("import { createContextAndHook } from '@clerk/shared/react';", role)).toEqual([]);
  });

  it('allows SDK hooks and components in models', async () => {
    expect(
      await boundaryMessages("import { useClerk, __experimental_PaymentElement } from '@clerk/shared/react';", 'model'),
    ).toEqual([]);
  });
});
