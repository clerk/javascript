import { transform } from '../index';

test('className with cn', () => {
  const result = transform(
    `const Button: React.FC<ButtonProps> = ({ children, intent, className }) => {
    return <button className={cn({ danger: 'bg-red-500', 'success': 'bg-green-500' }[intent])}>{children}</button>
  }`,
    {
      styleCache: new Map(),
    },
  );
  expect(result).toMatchSnapshot();
});
