import { Flex, Text } from '../../customizables';

export const MfaBackupCodeTile = (props: { code: string }) => {
  const { code } = props;

  return (
    <Flex
      center
      sx={t => ({
        padding: `${t.space.$1} ${t.space.$4}`,
      })}
    >
      <Text>{code}</Text>
    </Flex>
  );
};
