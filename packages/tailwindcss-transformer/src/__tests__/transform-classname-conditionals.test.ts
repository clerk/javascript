import { transform } from '../index';

test('className with conditionals', () => {
  const result = transform(
    `const Button: React.FC<ButtonProps> = ({ children, display }) => {
    return <button className={dislay === 'flex' ? 'flex' : 'inline-flex'}>{children}</button>
  }`,
    {
      styleCache: new Map(),
    },
  );
  expect(result).toMatchSnapshot();
});
