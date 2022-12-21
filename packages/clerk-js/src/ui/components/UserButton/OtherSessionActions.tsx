import { Flex } from '../../customizables';
import { Actions } from '../../elements';
import { PropsOfComponent } from '../../styledSystem';

export const SessionActions = (props: PropsOfComponent<typeof Flex>) => {
  return (
    <Actions
      sx={theme => ({
        backgroundColor: theme.colors.$blackAlpha20,
        border: `${theme.borders.$normal} ${theme.colors.$blackAlpha200}`,
        borderRight: 0,
        borderLeft: 0,
      })}
      {...props}
    />
  );
};
