import runtime from '../runtime';

console.log('nikos');
console.log({ runtime });

const hello = '2121';
export { hello };

const adaptWhatever = (obj: Record<string, any>) => {
  new runtime.Headers(obj);
};
