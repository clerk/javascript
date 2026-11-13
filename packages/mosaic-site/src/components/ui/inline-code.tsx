export function InlineCode({ text }: { text: string }) {
  return text.split('`').map((part, i) =>
    i % 2 ? (
      <code
        key={i}
        className='code-inline'
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}
