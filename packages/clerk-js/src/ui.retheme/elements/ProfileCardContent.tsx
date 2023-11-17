import React from 'react';

import { Col, descriptors } from '../customizables';
import { useRouter } from '../router';
import { common, mqu } from '../styledSystem';

type ProfileCardContentProps = React.PropsWithChildren<{ contentRef?: React.RefObject<HTMLDivElement> }>;

export const ProfileCardContent = (props: ProfileCardContentProps) => {
  const { contentRef, children } = props;
  const router = useRouter();
  const scrollPosRef = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (target.scrollTop) {
        scrollPosRef.current = target.scrollTop;
      }
    };
    contentRef?.current?.addEventListener('scroll', handleScroll);
    return () => contentRef?.current?.removeEventListener('scroll', handleScroll);
  }, []);

  React.useLayoutEffect(() => {
    if (scrollPosRef.current && contentRef?.current) {
      contentRef.current.scrollTop = scrollPosRef.current;
    }
  }, [router.currentPath]);

  return (
    <ScrollerContainer>
      <Col
        elementDescriptor={descriptors.pageScrollBox}
        sx={theme => ({
          flex: `1`,
          padding: `${theme.space.$9x5} ${theme.space.$8}`,
          [mqu.xs]: {
            padding: `${theme.space.$8} ${theme.space.$5}`,
          },
          ...common.maxHeightScroller(theme),
        })}
        ref={contentRef}
      >
        {children}
      </Col>
    </ScrollerContainer>
  );
};

const ScrollerContainer = (props: React.PropsWithChildren<Record<never, never>>) => {
  return (
    <Col
      elementDescriptor={descriptors.scrollBox}
      sx={t => ({ position: 'relative', borderRadius: t.radii.$xl, width: '100%', overflow: 'hidden' })}
      {...props}
    />
  );
};
