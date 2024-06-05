import { transform } from '../index';

test('cn', () => {
  const result = transform(
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
