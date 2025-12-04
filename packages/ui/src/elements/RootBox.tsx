import { Col } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';

export const RootBox = (props: PropsOfComponent<typeof Col>) => {
  return (
    <Col
      {...props}
      sx={t => ({
        boxSizing: 'border-box',
        width: 'fit-content',
        color: t.colors.$colorForeground,
        fontFamily: t.fonts.$main,
        fontStyle: t.fontStyles.$normal,
      })}
    />
  );
};
