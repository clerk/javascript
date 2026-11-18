// `?raw` imports return the importee's source as a string (see the `asset/source`
// webpack rule in `next.config.mjs`). Used by story modules to expose their own
// source for the `<Story>` Code tab.
declare module '*?raw' {
  const content: string;
  export default content;
}
