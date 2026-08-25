import { Fragment } from 'react';

import { Dd, Dl, Dt } from '@/ui/customizables';

type Parameter = {
  key: string;
  label: string;
  value: string | number | boolean;
};

export function ParameterStamp({ parameters }: { parameters: Parameter[] }) {
  if (parameters.length === 0) {
    return null;
  }

  return (
    <Dl
      sx={theme => ({
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)',
        gap: `${theme.space.$3} ${theme.space.$4}`,
        textAlign: 'start',
      })}
    >
      {parameters.map(parameter => (
        <Fragment key={parameter.key}>
          <Dt
            sx={theme => ({
              color: theme.colors.$colorMutedForeground,
              fontSize: theme.fontSizes.$sm,
              overflowWrap: 'anywhere',
            })}
          >
            {parameter.label}
          </Dt>
          <Dd
            sx={theme => ({
              color: theme.colors.$colorForeground,
              fontSize: theme.fontSizes.$sm,
              fontWeight: theme.fontWeights.$medium,
              margin: 0,
              overflowWrap: 'anywhere',
              textAlign: 'end',
            })}
          >
            {String(parameter.value)}
          </Dd>
        </Fragment>
      ))}
    </Dl>
  );
}
