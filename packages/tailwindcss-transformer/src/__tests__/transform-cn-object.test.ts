import { transform } from '../index';

test('className with cn/cx/clsx', () => {
  const result = transform(
    `const ButtonCn: React.FC<ButtonProps> = ({ children, intent, className }) => {
      return <button className={cn({ danger: 'bg-red-500', 'success': 'bg-green-500' }[intent])}>{children}</button>
    }
    
    const ButtonCx: React.FC<ButtonProps> = ({ children, intent, className }) => {
      return <button className={cx({ danger: 'bg-red-500', 'success': 'bg-green-500' }[intent])}>{children}</button>
    }
    
    const ButtonClsx: React.FC<ButtonProps> = ({ children, intent, className }) => {
      return <button className={clsx({ danger: 'bg-red-500', 'success': 'bg-green-500' }[intent])}>{children}</button>
    }`,
    {
      styleCache: new Map(),
    },
  );
  expect(result).toMatchSnapshot();
});
