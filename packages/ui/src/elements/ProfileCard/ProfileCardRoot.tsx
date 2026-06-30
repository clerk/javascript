import { createContextAndHook } from '@clerk/shared/react';
import React from 'react';

import { Box, descriptors, Icon } from '../../customizables';
import { Close } from '../../icons';
import type { PropsOfComponent } from '../../styledSystem';
import { mqu } from '../../styledSystem';
import { Card } from '../Card';
import { IconButton } from '../IconButton';
import { useUnsafeModalContext } from '../Modal';

// Lets a descendant header (the SSO wizard) claim the modal close button so the
// shared absolute overlay can step aside on desktop. No card sets this by default,
// so every existing consumer keeps the absolute button unchanged.
export const [ProfileCardCloseButtonContext, _useProfileCardCloseButton, useUnsafeProfileCardCloseButton] =
  createContextAndHook<{ setHeaderOwnsCloseButton: (owns: boolean) => void }>('ProfileCardCloseButtonContext');

export const ProfileCardRoot = React.forwardRef<HTMLDivElement, PropsOfComponent<typeof Card.Root>>((props, ref) => {
  const { sx, children, ...rest } = props;
  const { toggle } = useUnsafeModalContext();
  const [headerOwnsCloseButton, setHeaderOwnsCloseButton] = React.useState(false);
  // The setState identity is stable, so empty deps are correct.
  const closeButtonCtx = React.useMemo(() => ({ value: { setHeaderOwnsCloseButton } }), []);

  return (
    <Card.Root
      ref={ref}
      // Profile cards always render as raised — flush is scoped to simple card components
      elevation='raised'
      sx={[
        t => ({
          width: t.sizes.$220,
          maxWidth: `calc(100vw - ${t.sizes.$8})`,
          display: 'flex',
          flexDirection: 'row',
          [mqu.md]: {
            display: 'flex',
            flexDirection: 'column',
          },
          overflow: 'hidden',
          height: t.sizes.$176,
          position: 'relative',
        }),
        sx,
      ]}
      {...rest}
    >
      {toggle && (
        <Box
          sx={t => ({
            [mqu.md]: {
              padding: `${t.space.$1x5} ${t.space.$2}`,
              top: t.space.$none,
              insetInlineEnd: t.space.$none,
              // Mobile always keeps the absolute button; restore the Box's default
              // display when the header has hidden it on desktop.
              ...(headerOwnsCloseButton && { display: 'block' }),
            },
            zIndex: t.zIndices.$modal,
            position: 'absolute',
            top: t.space.$2,
            insetInlineEnd: t.space.$2,
            // A descendant header owns the desktop close button: keep this overlay
            // mounted (mobile uses it) but hide it on desktop.
            ...(headerOwnsCloseButton && { display: 'none' }),
          })}
        >
          <IconButton
            elementDescriptor={descriptors.modalCloseButton}
            variant='ghost'
            aria-label='Close modal'
            onClick={toggle}
            icon={
              <Icon
                icon={Close}
                size='md'
              />
            }
            sx={t => ({
              color: t.colors.$colorMutedForeground,
              padding: t.space.$3,
            })}
          />
        </Box>
      )}
      <ProfileCardCloseButtonContext.Provider value={closeButtonCtx}>{children}</ProfileCardCloseButtonContext.Provider>
      <Card.Footer
        isProfileFooter
        sx={{
          display: 'none',
          [mqu.md]: {
            display: 'flex',
          },
        }}
      />
    </Card.Root>
  );
});
