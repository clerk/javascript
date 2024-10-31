import React, { memo, useMemo } from 'react';

interface LinkRendererProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children' | 'class'> {
  text: string;
  className?: string;
}

const LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g; // parses [text](url)

export const LinkRenderer: React.FC<LinkRendererProps> = memo(({ text, ...linkProps }) => {
  const memoizedLinkProps = useMemo(() => linkProps, [linkProps]);

  const renderedContent = useMemo(() => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    text.replace(LINK_REGEX, (match, linkText, url, offset) => {
      if (offset > lastIndex) {
        parts.push(text.slice(lastIndex, offset));
      }
      parts.push(
        <a
          {...memoizedLinkProps}
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          key={offset}
        >
          {linkText}
        </a>,
      );
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }, [text, memoizedLinkProps]);

  return renderedContent;
});
