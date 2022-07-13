import React from 'react';

import { Col } from '../customizables';
import { Caret } from '../icons';
import { animations } from '../styledSystem';
import { ArrowBlockButton } from './ArrowBlockButton';

type AccordionItemProps = React.PropsWithChildren<{
  title: React.ReactNode;
  icon?: React.ReactElement;
  defaultOpen?: boolean;
  toggleable?: boolean;
  scrollOnOpen?: boolean;
}>;

export const AccordionItem = (props: AccordionItemProps) => {
  const { children, title, icon, defaultOpen = false, toggleable = true, scrollOnOpen = false } = props;
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (toggleable) {
      setIsOpen(s => !s);
    }
  };

  React.useLayoutEffect(() => {
    if (scrollOnOpen && isOpen && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isOpen]);

  return (
    <Col>
      <ArrowBlockButton
        variant='ghost'
        colorScheme='neutral'
        textVariant='smallRegular'
        icon={icon}
        rightIcon={Caret}
        rightIconSx={t => ({
          transitionProperty: t.transitionProperty.$common,
          transitionDuration: t.transitionDuration.$controls,
          transform: `rotate(${isOpen ? '180' : '0'}deg)`,
          opacity: 0.4,
        })}
        sx={t => ({
          backgroundColor: isOpen ? t.colors.$blackAlpha50 : undefined,
          padding: `${t.space.$3} ${t.space.$4}`,
          minHeight: t.sizes.$10,
        })}
        onClick={toggle}
        isDisabled={!toggleable}
      >
        {title}
      </ArrowBlockButton>
      {isOpen && (
        <Col
          ref={contentRef}
          sx={t => ({
            animation: `${animations.blockBigIn} ${t.transitionDuration.$slow} ease`,
            padding: `${t.space.$4} ${t.space.$8}`,
            borderTop: 0,
          })}
        >
          {children}
        </Col>
      )}
    </Col>
  );
};
