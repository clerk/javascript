import React from 'react';

import { Col, descriptors } from '../../customizables';
import { useRouter } from '../../router';
import { common, mqu } from '../../styledSystem';

type ProfileCardContentProps = React.PropsWithChildren<{
  contentRef?: React.RefObject<HTMLDivElement>;
  scrollBoxId?: string;
}>;
export const ProfileCardContent = (props: ProfileCardContentProps) => {
  const { contentRef, children, scrollBoxId } = props;
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
    <Col
      elementDescriptor={descriptors.scrollBox}
      sx={t => ({
        backgroundColor: t.colors.$colorBackground,
        position: 'relative',
        borderRadius: t.radii.$lg,
        width: '100%',
        overflow: 'hidden',
        borderWidth: t.borderWidths.$normal,
        borderStyle: t.borderStyles.$solid,
        borderColor: t.colors.$borderAlpha150,
        marginBlock: '-1px',
        marginInlineEnd: '-1px',
        flex: 1,
      })}
      data-clerk-profile-scroll-box-root={scrollBoxId}
    >
      <Col
        elementDescriptor={descriptors.pageScrollBox}
        sx={theme => ({
          flex: `1`,
          scrollbarGutter: 'stable',
          paddingTop: theme.space.$7,
          paddingBottom: theme.space.$7,
          paddingLeft: theme.space.$8,
          paddingRight: theme.space.$6, //smaller because of stable scrollbar gutter
          [mqu.sm]: {
            padding: `${theme.space.$8} ${theme.space.$5}`,
          },
          ...common.maxHeightScroller(theme),
        })}
        ref={contentRef}
      >
        {children}
      </Col>
    </Col>
  );
};
