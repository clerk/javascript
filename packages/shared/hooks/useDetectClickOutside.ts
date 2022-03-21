import React from 'react';

export type DetectClickOutsideResponse = [boolean, React.Dispatch<React.SetStateAction<boolean>>] & {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useDetectClickOutside = (
  el: React.MutableRefObject<HTMLElement | undefined | null>,
  defaultActive: boolean,
  callback?: () => void,
) => {
  const [isActive, setIsActive] = React.useState(defaultActive);

  React.useEffect(() => {
    const pageClickEvent = (e: MouseEvent) => {
      if (el.current && !el.current.contains(e.target as Node)) {
        setIsActive(!isActive);

        if (typeof callback === 'function') {
          callback();
        }
      }
    };

    if (isActive) {
      window.addEventListener('mousedown', pageClickEvent);
    }

    return () => {
      window.removeEventListener('mousedown', pageClickEvent);
    };
  }, [isActive, el]);

  const result = [isActive, setIsActive] as DetectClickOutsideResponse;

  result.isActive = result[0];
  result.setIsActive = result[1];

  return result;
};
