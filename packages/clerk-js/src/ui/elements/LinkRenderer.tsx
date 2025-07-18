import React, { memo, useMemo } from 'react';

import { Link } from '@/ui/customizables';
import type { PropsOfComponent } from '@/ui/styledSystem';

interface LinkRendererProps extends Omit<PropsOfComponent<typeof Link>, 'href' | 'children'> {
  text: string;
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
        <Link
          key={offset}
          href={url}
          {...memoizedLinkProps}
        >
          {linkText}
        </Link>,
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
