import type { LocalizationKey } from '../../customizables';
import { Button, Col, Flex, Text, useLocalizations } from '../../customizables';
import { useLoadingStatus } from '../../hooks';
import type { PropsOfComponent } from '../../styledSystem';

type LinkButtonWithTextDescriptionProps = Omit<PropsOfComponent<typeof Button>, 'title'> & {
  title: LocalizationKey;
  titleLabel?: React.ReactNode;
  subtitle: LocalizationKey;
  actionLabel?: LocalizationKey;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<any>;
};

export const LinkButtonWithDescription = (props: LinkButtonWithTextDescriptionProps) => {
  const { title, subtitle, actionLabel, titleLabel, onClick: onClickProp, ...rest } = props;
  const status = useLoadingStatus();
  const { t } = useLocalizations();

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    status.setLoading();
    if (onClickProp) {
      (onClickProp?.(e) as any)?.finally(() => status.setIdle());
    }
  };

  return (
    <Col gap={2}>
      <Col gap={1}>
        <Flex
          gap={2}
          align='center'
        >
          <Text
            localizationKey={title}
            variant='subtitle'
          />
          {titleLabel}
        </Flex>
        <Text
          localizationKey={subtitle}
          variant='caption'
          colorScheme='secondary'
        />
      </Col>
      {actionLabel && (
        <Button
          localizationKey={actionLabel}
          loadingText={t(actionLabel)}
          variant='link'
          {...rest}
          isLoading={status.isLoading}
          onClick={onClick}
        />
      )}
    </Col>
  );
};
