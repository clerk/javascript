import { useEffect, useState } from 'react';

import { Box } from '../customizables';
import { animations } from '../styledSystem';

interface CommerceBladeProps {
  isOpen: boolean;
  isFullscreen?: boolean;
  children: React.ReactNode;
}

export const CommerceBlade = ({ isOpen, isFullscreen, children }: CommerceBladeProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    } else {
      const timer = setTimeout(() => {
        setMounted(false);
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);

  if (!mounted && !isOpen) {
    return null;
  }

  return (
    <CommerceBladeContent
      isOpen={isOpen}
      isFullscreen={isFullscreen}
    >
      {children}
    </CommerceBladeContent>
  );
};

const CommerceBladeContent = ({ isOpen, isFullscreen, children }: CommerceBladeProps) => {
  return (
    <>
      <Box
        sx={t => ({
          position: 'absolute',
          zIndex: t.zIndices.$modal,
          inset: 0,
          backgroundColor: t.colors.$whiteAlpha300,
          animation: `${isOpen ? animations.fadeIn : animations.fadeOut} ${t.transitionDuration.$slower} ${t.transitionTiming.$common}`,
        })}
      />
      <Box
        sx={t => ({
          position: isFullscreen ? 'fixed' : 'absolute',
          width: t.sizes.$100,
          inset: isFullscreen ? t.space.$3 : 0,
          insetInlineStart: 'auto',
          overflow: 'hidden',
          backgroundColor: t.colors.$colorBackground,
          borderRadius: `${t.radii.$xl} ${isFullscreen ? t.radii.$xl : 0} ${isFullscreen ? t.radii.$xl : 0} ${t.radii.$xl}`,
          boxShadow:
            '0px 0px 0px 1px rgba(25, 28, 33, 0.06), 0px 15px 35px -5px rgba(25, 28, 33, 0.20), 0px 5px 15px 0px rgba(0, 0, 0, 0.08)',
          zIndex: t.zIndices.$modal,
          animation: `${isOpen ? animations.drawerSlideIn : animations.drawerSlideOut} ${t.transitionDuration.$slower} ${t.transitionTiming.$slowBezier}`,
        })}
      >
        {children}
      </Box>
    </>
  );
};
