import { Box, Text } from '../customizables';
import { common } from '../styledSystem';

type InitialIconProps = {
  initials: string;
};

export const InitialIcon = ({ initials }: InitialIconProps) => {
  return (
    <Box
      as='span'
      sx={t => ({
        ...common.centeredFlex('inline-flex'),
        width: t.space.$4,
        height: t.space.$4,
        borderRadius: t.radii.$sm,
        color: t.colors.$colorTextOnPrimaryBackground,
        backgroundColor: t.colors.$primary500,
      })}
    >
      <Text
        as='span'
        sx={t => ({
          ...common.centeredFlex('inline-flex'),
          width: '100%',
          fontSize: t.fontSizes.$sm,
          fontWeight: t.fontWeights.$semibold,
        })}
      >
        {initials}
      </Text>
    </Box>
  );
};
