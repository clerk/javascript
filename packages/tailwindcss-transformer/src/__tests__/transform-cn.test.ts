import { transform } from '../index';

test('cn/cx/clsx', () => {
  const result = transform(
    `const ButtonCn: React.FC<ButtonProps> = ({ children, className }) => {
      const buttonClasses = cn(
        (something === 'flex' || 'flex') && 'flex',
        ['flex', 'flex'],
        something === 'flex' || something === 'flex' ? (something ? 'flex' : 'flex') : 'flex',
        className,
      );
      return <button className={buttonClasses}>{children}</button>;
    };
    
    const ButtonCx: React.FC<ButtonProps> = ({ children, className }) => {
      const buttonClasses = cx(
        (something === 'flex' || 'flex') && 'flex',
        ['flex', 'flex'],
        something === 'flex' || something === 'flex' ? (something ? 'flex' : 'flex') : 'flex',
        className,
      );
      return <button className={buttonClasses}>{children}</button>;
    };
    
    const ButtonClsx: React.FC<ButtonProps> = ({ children, className }) => {
      const buttonClasses = clsx(
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
