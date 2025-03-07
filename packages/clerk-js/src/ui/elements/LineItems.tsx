import { Box, Dd, descriptors, Dl, Dt, Span } from '../customizables';

/* -------------------------------------------------------------------------------------------------
 * LineItems.Root
 * -----------------------------------------------------------------------------------------------*/

interface RootProps {
  children: React.ReactNode;
}

function Root({ children }: RootProps) {
  return (
    <Dl
      elementDescriptor={descriptors.lineItemsRoot}
      sx={t => ({
        display: 'grid',
        gridRowGap: t.space.$2,
      })}
    >
      {children}
    </Dl>
  );
}

/* -------------------------------------------------------------------------------------------------
 * LineItems.Group
 * -----------------------------------------------------------------------------------------------*/

interface GroupProps {
  children: React.ReactNode;
  /**
   * @default `false`
   */
  borderTop?: boolean;
}

function Group({ children, borderTop = false }: GroupProps) {
  return (
    <Box
      elementDescriptor={descriptors.lineItemsGroup}
      sx={t => ({
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        ...(borderTop
          ? {
              borderTopWidth: t.borderWidths.$normal,
              borderTopStyle: t.borderStyles.$solid,
              borderTopColor: t.colors.$neutralAlpha100,
              paddingTop: t.space.$2,
            }
          : {}),
      })}
    >
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------------------------------
 * LineItems.Title
 * -----------------------------------------------------------------------------------------------*/

interface TitleProps {
  children: React.ReactNode;
  /**
   * @default `primary`
   */
  colorScheme?: 'primary' | 'secondary';
  /**
   * @default `medium`
   */
  weight?: 'normal' | 'medium';
}

function Title({ children, colorScheme = 'primary', weight = 'medium' }: TitleProps) {
  return (
    <Dt
      elementDescriptor={descriptors.lineItemsTitle}
      elementId={descriptors.lineItemsTitle.setId(colorScheme)}
      sx={t => ({
        fontWeight: weight === 'normal' ? t.fontWeights.$normal : t.fontWeights.$medium,
        color: colorScheme === 'primary' ? t.colors.$colorText : t.colors.$colorTextSecondary,
      })}
    >
      {children}
    </Dt>
  );
}

/* -------------------------------------------------------------------------------------------------
 * LineItems.Description
 * -----------------------------------------------------------------------------------------------*/

interface DescriptionProps {
  children: React.ReactNode;
  /**
   * Render a note below the description text.
   */
  note?: React.ReactNode;
  /**
   * Render a piece of text before the description text.
   */
  prefix?: React.ReactNode;
  /**
   * @default `secondary`
   */
  colorScheme?: 'primary' | 'secondary';
  /**
   * @default `normal`
   */
  weight?: 'normal' | 'medium';
}

function Description({ children, colorScheme = 'secondary', weight = 'normal', note, prefix }: DescriptionProps) {
  return (
    <Dd
      elementDescriptor={descriptors.lineItemsDescription}
      elementId={descriptors.lineItemsDescription.setId(colorScheme)}
      sx={t => ({
        display: 'grid',
        justifyContent: 'end',
        color: colorScheme === 'primary' ? t.colors.$colorText : t.colors.$colorTextSecondary,
      })}
    >
      <Span
        elementDescriptor={descriptors.lineItemsDescriptionInner}
        sx={t => ({
          display: 'inline-flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: t.space.$1,
        })}
      >
        {prefix ? (
          <Span
            elementDescriptor={descriptors.lineItemsDescriptionPrefix}
            sx={t => ({
              color: t.colors.$colorTextSecondary,
              fontSize: t.fontSizes.$sm,
            })}
          >
            {prefix}
          </Span>
        ) : null}
        <Span
          elementDescriptor={descriptors.lineItemsDescriptionText}
          sx={t => ({
            fontWeight: weight === 'normal' ? t.fontWeights.$normal : t.fontWeights.$medium,
          })}
        >
          {children}
        </Span>
      </Span>
      {note ? (
        <Span
          elementDescriptor={descriptors.lineItemsDescriptionNote}
          sx={t => ({
            fontSize: t.fontSizes.$sm,
          })}
        >
          {note}
        </Span>
      ) : null}
    </Dd>
  );
}

export const LineItems = {
  Root,
  Group,
  Title,
  Description,
};
