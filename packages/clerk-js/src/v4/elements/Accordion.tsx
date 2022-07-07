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
}>;

export const AccordionItem = (props: AccordionItemProps) => {
  const { children, title, icon, defaultOpen = false, toggleable = true } = props;
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const toggle = () => {
    if (toggleable) {
      return setIsOpen(s => !s);
    }
  };

  return (
    <Col>
      <ArrowBlockButton
        variant='ghost'
        colorScheme='neutral'
        textVariant='smallRegular'
        icon={icon}
        rightIcon={Caret}
        rightIconSx={theme => ({
          transitionProperty: theme.transitionProperty.$common,
          transitionDuration: theme.transitionDuration.$controls,
          transform: `rotate(${isOpen ? '180' : '0'}deg)`,
          opacity: 0.4,
        })}
        sx={theme => ({
          backgroundColor: isOpen ? theme.colors.$blackAlpha50 : undefined,
          padding: `${theme.space.$3} ${theme.space.$4}`,
          minHeight: theme.sizes.$10,
        })}
        onClick={toggle}
        isDisabled={!toggleable}
      >
        {title}
      </ArrowBlockButton>
      {isOpen && (
        <Col
          sx={theme => ({
            animation: `${animations.blockBigIn} ${theme.transitionDuration.$slow} ease`,
            padding: `${theme.space.$4} ${theme.space.$8}`,
            borderTop: 0,
          })}
        >
          {children}
        </Col>
      )}
    </Col>
  );
};
