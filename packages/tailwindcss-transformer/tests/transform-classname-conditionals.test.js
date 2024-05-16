import { expect, test } from 'vitest';
import { transform } from '../src/index';

test('className with conditionals', async () => {
  let result = await transform(
    `const Button: React.FC<ButtonProps> = ({ children, display }) => {
    return <button className={dislay === 'flex' ? 'flex' : 'inline-flex'}>{children}</button>
  }`,
    {
      styleCache: new Map(),
    },
  );
  expect(result).toMatchSnapshot();
});
