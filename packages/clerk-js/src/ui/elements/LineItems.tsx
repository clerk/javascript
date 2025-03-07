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
 * LineItems.Divider
 * -----------------------------------------------------------------------------------------------*/

function Divider() {
  return (
    <Box
      elementDescriptor={descriptors.lineItemsDivider}
      as='hr'
      sx={t => ({
        borderColor: t.colors.$neutralAlpha100,
      })}
    />
  );
}

/* -------------------------------------------------------------------------------------------------
 * LineItems.Group
 * -----------------------------------------------------------------------------------------------*/

interface GroupProps {
  children: React.ReactNode;
}

function Group({ children }: GroupProps) {
  return (
    <Box
      sx={_ => ({
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
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
        sx={t => ({
          display: 'inline-flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: t.space.$1,
        })}
      >
        {prefix ? (
          <Span
            sx={t => ({
              color: t.colors.$colorTextSecondary,
              fontSize: t.fontSizes.$sm,
            })}
          >
            {prefix}
          </Span>
        ) : null}
        <Span
          sx={t => ({
            fontWeight: weight === 'normal' ? t.fontWeights.$normal : t.fontWeights.$medium,
          })}
        >
          {children}
        </Span>
      </Span>
      {note ? <Span>{note}</Span> : null}
    </Dd>
  );
}

export const LineItems = {
  Root,
  Divider,
  Group,
  Title,
  Description,
};
