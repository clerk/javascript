import { expect, test } from 'vitest';
import { transform } from '../src/index';

test('cn', async () => {
  let result = await transform(
    `const Button: React.FC<ButtonProps> = ({ children, className }) => {
    const buttonClasses = cn(
      (something === 'flex' || 'flex') && 'flex',
      ['flex', 'flex'],
      something === 'flex' || something === 'flex' ? (something ? 'flex' : 'flex') : 'flex',
      className,
    );
    return <button className={buttonClasses}>{children}</button>;
  };`,
    {
      styleCache: new Map(),
    },
  );
  expect(result).toMatchSnapshot();
});
