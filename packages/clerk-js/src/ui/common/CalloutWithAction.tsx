import type { MouseEvent, ReactNode } from 'react';

import { Col, Flex, Link, Text } from '../customizables';
import type { LocalizationKey } from '../localization';
import type { ThemableCssProp } from '../styledSystem';

type CalloutWithActionProps = {
  text: LocalizationKey | string;
  textSx?: ThemableCssProp;
  actionLabel?: LocalizationKey;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => Promise<any>;
  icon: ReactNode;
};
export const CalloutWithAction = (props: CalloutWithActionProps) => {
  const { icon, text, textSx, actionLabel, onClick: onClickProp } = props;

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClickProp) {
      void onClickProp?.(e);
    }
  };

  return (
    <Flex
      sx={theme => ({
        background: theme.colors.$blackAlpha50,
        padding: `${theme.space.$2x5} ${theme.space.$4}`,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderRadius: theme.radii.$md,
      })}
    >
      <Flex gap={2}>
        {icon}
        <Col gap={4}>
          <Text
            colorScheme='neutral'
            sx={[
              t => ({
                lineHeight: t.lineHeights.$base,
              }),
              textSx,
            ]}
            localizationKey={text}
          />

          {actionLabel && (
            <Link
              colorScheme={'primary'}
              variant='regularMedium'
              localizationKey={actionLabel}
              onClick={onClick}
            />
          )}
        </Col>
      </Flex>
    </Flex>
  );
};
