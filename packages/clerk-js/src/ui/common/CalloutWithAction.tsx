import type { MouseEvent } from 'react';

import { Col, Flex, Link, Text } from '../customizables';
import type { LocalizationKey } from '../localization';

type CalloutWithActionProps = {
  text: LocalizationKey;
  actionLabel?: LocalizationKey;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => Promise<any>;
};
export const CalloutWithAction = (props: CalloutWithActionProps) => {
  const { text, actionLabel, onClick: onClickProp } = props;

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onClickProp) {
      void onClickProp?.(e);
    }
  };

  return (
    <Flex
      sx={theme => ({
        background: theme.colors.$blackAlpha50,
        padding: theme.space.$4,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderRadius: theme.radii.$md,
      })}
    >
      <Col gap={4}>
        <Text
          sx={t => ({
            lineHeight: t.lineHeights.$tall,
          })}
          localizationKey={text}
        />

        <Link
          colorScheme={'primary'}
          variant='regularMedium'
          localizationKey={actionLabel}
          onClick={onClick}
        />
      </Col>
    </Flex>
  );
};
