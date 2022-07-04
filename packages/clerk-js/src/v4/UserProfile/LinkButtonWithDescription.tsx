import { Button, Col, Flex, Text } from '../customizables';
import { PropsOfComponent } from '../styledSystem';

type LinkButtonWithTextDescriptionProps = PropsOfComponent<typeof Button> & {
  title: string;
  titleLabel?: React.ReactNode;
  subtitle: string;
  actionLabel?: string;
};

export const LinkButtonWithDescription = (props: LinkButtonWithTextDescriptionProps) => {
  const { title, subtitle, actionLabel, titleLabel, ...rest } = props;
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
        >
          {actionLabel}
        </Button>
      )}
    </Col>
  );
};
