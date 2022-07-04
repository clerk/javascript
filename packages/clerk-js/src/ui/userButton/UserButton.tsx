import { Avatar } from '@clerk/shared/components/avatar';
import { Portal } from '@clerk/shared/components/portal';
import type { UserButtonProps } from '@clerk/types';
import cn from 'classnames';
import React from 'react';
import { usePopper } from 'react-popper';
import { useCoreUser, withCoreUserGuard } from 'ui/contexts';

import { PopupVisibilityContext } from './contexts/PopupVisibilityContext';
import { UserButtonPopup } from './UserButtonPopup';
import { useUserButtonVisibility } from './useUserButtonVisibility';
import { determineIdentifier } from './utils';

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
  const { isActive, setIsActive } = useUserButtonVisibility(containerRef);

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
        {showName && <div className='cl-user-button-fullname'>{identifier}</div>}
      </button>
      <Portal hostEl={document.getElementById('clerk-components')}>
        <PopupVisibilityContext.Provider value={{ isPopupVisible: isActive, setPopupVisible: setIsActive }}>
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
