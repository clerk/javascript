export function InlineCode({ text }: { text: string }) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((part, i) => {
    if (part.startsWith('`')) {
      return (
        <code
          key={i}
          className='code-inline'
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**')) {
      return (
        <strong
          key={i}
          className='text-foreground font-medium'
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
