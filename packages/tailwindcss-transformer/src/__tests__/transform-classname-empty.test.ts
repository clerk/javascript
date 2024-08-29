import { transform } from '../index';

test('empty className', () => {
  const result = transform(
    `const Button: React.FC<ButtonProps> = ({ children, className }) => {
    return <button className=''>{children}</button>
  }`,
    {
      styleCache: new Map(),
    },
  );
  expect(result).toMatchSnapshot();
});
