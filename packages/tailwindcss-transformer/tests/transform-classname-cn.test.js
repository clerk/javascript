import { expect, test } from 'vitest';
import { transform } from '../src/index';

test('className with cn', async () => {
  let result = await transform(
    `const Button: React.FC<ButtonProps> = ({ children, className }) => {
    return <button className={cn('bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded')}>{children}</button>
  }`,
    {
      styleCache: new Map(),
    },
  );
  expect(result).toMatchSnapshot();
});
