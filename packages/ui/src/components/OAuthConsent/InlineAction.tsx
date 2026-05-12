import React from 'react';

import { Text } from '@/ui/customizables';
import { Tooltip } from '@/ui/elements/Tooltip';

type InlineActionProps = {
  text: string;
  actionText: string;
  onClick: () => void;
  tooltipText: string;
};

export function InlineAction({ text, actionText, onClick, tooltipText }: InlineActionProps) {
  const idx = text.indexOf(actionText);
  if (idx === -1) {
    return <>{text}</>;
  }

  let before = text.slice(0, idx);
  let after = text.slice(idx + actionText.length);

  // Pull adjacent parentheses into the action span so they don't wrap separately.
  let prefix = '';
  let suffix = '';
  if (before.endsWith('(')) {
    before = before.slice(0, -1);
    prefix = '(';
  }
  if (after.startsWith(')')) {
    after = after.slice(1);
    suffix = ')';
  }

  const actionContent = (
    <Tooltip.Root>
      <Tooltip.Trigger>
        <Text
          as='span'
          role='button'
          tabIndex={0}
          aria-label={tooltipText}
          variant='caption'
          onClick={onClick}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }}
          sx={t => ({
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            cursor: 'pointer',
            outline: 'none',
            display: 'inline-block',
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: t.colors.$colorRing,
            },
          })}
        >
          {actionText}
        </Text>
      </Tooltip.Trigger>
      <Tooltip.Content text={tooltipText} />
    </Tooltip.Root>
  );

  return (
    <>
      {before}
      {prefix || suffix ? (
        <Text
          as='span'
          sx={{ whiteSpace: 'nowrap' }}
        >
          {prefix}
          {actionContent}
          {suffix}
        </Text>
      ) : (
        actionContent
      )}
      {after}
    </>
  );
}
