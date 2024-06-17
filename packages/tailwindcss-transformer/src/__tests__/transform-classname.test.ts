import { transform } from '../index';

test('className', () => {
  const result = transform(
    `const Button: React.FC<ButtonProps> = ({ children, className }) => {
    return <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>{children}</button>
  }`,
    {
      styleCache: new Map(),
    },
  );
  expect(result).toMatchSnapshot();
});
