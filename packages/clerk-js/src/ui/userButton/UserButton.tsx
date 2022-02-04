import React from 'react';
import cn from 'classnames';
import { usePopper } from 'react-popper';
import { useCoreUser, withCoreUserGuard } from 'ui/contexts';
import { UserButtonPopup } from './UserButtonPopup';
import { Avatar } from '@clerk/shared/components/avatar';
import { Portal } from 'ui/common';
import { useDetectClickOutside } from '@clerk/shared/hooks';
import { PopupVisibilityContext } from './contexts/PopupVisibilityContext';
import { determineIdentifier } from './utils';
import type { UserButtonProps } from '@clerk/types';

const userButtonPopperOptions = {
  placement: 'bottom-end',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 16],
      },
    },
  ],
};

export const UserButton = withCoreUserGuard(({ showName }: UserButtonProps) => {
  const user = useCoreUser();
  const { firstName, lastName, profileImageUrl } = user;
  const identifier = determineIdentifier(user);

  const userButtonRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { isActive, setIsActive } = useDetectClickOutside(containerRef, false);
  const { styles, attributes, update } = usePopper(
    userButtonRef.current,
    containerRef.current,
    userButtonPopperOptions as any,
  );

  React.useLayoutEffect(() => {
    void update?.();
  }, [isActive]);

  const handlePopupToggle = (e: any) => {
    if (e.button !== leftMouseButton) {
      return;
    }
    e.stopPropagation();
    setIsActive(!isActive);
  };

  return (
    <>
      <button
        className={cn('cl-user-button-trigger', {
          'cl-active': isActive,
        })}
        type='button'
        onMouseDown={handlePopupToggle}
        ref={userButtonRef}
      >
        <Avatar
          className='cl-user-button-avatar'
          firstName={firstName || ''}
          lastName={lastName || ''}
          profileImageUrl={profileImageUrl}
          size={32}
          optimize
        />
        {showName && (
          <div className='cl-user-button-fullname'>{identifier}</div>
        )}
      </button>
      <Portal hostEl={document.getElementById('clerk-components')}>
        <PopupVisibilityContext.Provider
          value={{ isPopupVisible: isActive, setPopupVisible: setIsActive }}
        >
          <div
            ref={containerRef}
            className='cl-component cl-user-button-popup'
            style={{
              display: isActive ? 'block' : 'none',
              ...styles.popper,
            }}
            {...attributes.popper}
          >
            <UserButtonPopup />
          </div>
        </PopupVisibilityContext.Provider>
      </Portal>
    </>
  );
});

const leftMouseButton = 0;
