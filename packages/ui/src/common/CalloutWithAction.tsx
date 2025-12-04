import type { ComponentType, MouseEvent, PropsWithChildren } from 'react';

import { Col, Flex, Icon, Link, Text } from '../customizables';
import type { LocalizationKey } from '../localization';
import type { ThemableCssProp } from '../styledSystem';

type CalloutWithActionProps = {
  text?: LocalizationKey | string;
  textSx?: ThemableCssProp;
  actionLabel?: LocalizationKey;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => Promise<unknown>;
  icon: ComponentType;
};
export const CalloutWithAction = (props: PropsWithChildren<CalloutWithActionProps>) => {
  const { icon, text, textSx, actionLabel, onClick: onClickProp } = props;

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    void onClickProp?.(e);
  };

  return (
    <Flex
      sx={theme => ({
        background: theme.colors.$neutralAlpha50,
        padding: `${theme.space.$2x5} ${theme.space.$4}`,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderRadius: theme.radii.$md,
      })}
    >
      <Flex gap={2}>
        <Icon
          colorScheme='neutral'
          icon={icon}
          sx={t => ({ marginTop: t.space.$1 })}
        />
        <Col gap={4}>
          <Text
            colorScheme='secondary'
            sx={textSx}
            localizationKey={text}
          >
            {props.children}
          </Text>

          {actionLabel && (
            <Link
              colorScheme={'primary'}
              variant='subtitle'
              localizationKey={actionLabel}
              onClick={onClick}
            />
          )}
        </Col>
      </Flex>
    </Flex>
  );
};
