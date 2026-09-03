import { Input } from '@clerk/headless/input';

import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Primitives',
  title: 'Input',
  source: 'packages/headless/src/primitives/input/index.ts',
};

export function Default() {
  return (
    <div>
      <label htmlFor='headless-input-demo'>Email address</label>
      <Input
        id='headless-input-demo'
        type='email'
        name='email'
        autoComplete='email'
        placeholder='you@example.com'
      />
    </div>
  );
}
