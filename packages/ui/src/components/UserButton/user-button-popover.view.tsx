import { forwardRef, type ReactNode } from 'react';

import { PopoverCard } from '@/ui/elements/PopoverCard';
import { RootBox } from '@/ui/elements/RootBox';
import { UserPreviewView } from '@/ui/elements/user-preview.view';

import { descriptors, useLocalizations } from '../../customizables';
import type { PropsOfComponent } from '../../styledSystem';
import { userButtonMessages } from './user-button.messages';
import type { UserButtonPopoverData } from './user-button.types';

type UserButtonPopoverViewProps = PropsOfComponent<typeof PopoverCard.Root> &
  UserButtonPopoverData & {
    actions: ReactNode;
    footerActions: ReactNode;
  };

export const UserButtonPopoverView = forwardRef<HTMLDivElement, UserButtonPopoverViewProps>((props, ref) => {
  const { userPreview, isStandalone, actions, footerActions, ...rest } = props;
  const { t } = useLocalizations();

  return (
    <RootBox elementDescriptor={descriptors.userButtonPopoverRootBox}>
      <PopoverCard.Root
        elementDescriptor={descriptors.userButtonPopoverCard}
        ref={ref}
        role='dialog'
        aria-label={t(userButtonMessages.popup.label)}
        shouldEntryAnimate={!isStandalone}
        {...rest}
      >
        <PopoverCard.Content elementDescriptor={descriptors.userButtonPopoverMain}>
          <UserPreviewView
            elementId={'userButton'}
            {...userPreview}
            sx={t => ({
              width: '100%',
              padding: `${t.space.$4} ${t.space.$5}`,
            })}
          />
          {actions}
        </PopoverCard.Content>
        <PopoverCard.Footer elementDescriptor={descriptors.userButtonPopoverFooter}>{footerActions}</PopoverCard.Footer>
      </PopoverCard.Root>
    </RootBox>
  );
});
