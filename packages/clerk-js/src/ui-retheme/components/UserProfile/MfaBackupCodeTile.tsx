import { Flex, Text } from '../../customizables';

export const MfaBackupCodeTile = (props: { code: string }) => {
  const { code } = props;

  return (
    <Flex
      center
      sx={t => ({
        backgroundColor: t.colors.$blackAlpha50,
        padding: `${t.space.$1} ${t.space.$4}`,
        borderRadius: t.radii.$sm,
      })}
    >
      <Text>{code}</Text>
    </Flex>
  );
};
