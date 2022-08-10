import { Button, Col, Flex, Text } from '../customizables';
import { useLoadingStatus } from '../hooks';
import { PropsOfComponent } from '../styledSystem';

type LinkButtonWithTextDescriptionProps = PropsOfComponent<typeof Button> & {
  title: string;
  titleLabel?: React.ReactNode;
  subtitle: string;
  actionLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => Promise<any>;
};

export const LinkButtonWithDescription = (props: LinkButtonWithTextDescriptionProps) => {
  const { title, subtitle, actionLabel, titleLabel, onClick: onClickProp, ...rest } = props;
  const status = useLoadingStatus();

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
          <Text variant='regularMedium'>{title}</Text>
          {titleLabel}
        </Flex>
        <Text
          variant='smallRegular'
          colorScheme='neutral'
        >
          {subtitle}
        </Text>
      </Col>
      {actionLabel && (
        <Button
          colorScheme='primary'
          variant='link'
          {...rest}
          isLoading={status.isLoading}
          loadingText={actionLabel}
          onClick={onClick}
        >
          {actionLabel}
        </Button>
      )}
    </Col>
  );
};
