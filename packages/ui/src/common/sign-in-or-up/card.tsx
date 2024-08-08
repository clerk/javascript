import { GlobalError } from '~/common/global-error';
import { useAppearance } from '~/hooks/use-appearance';
import { useDisplayConfig } from '~/hooks/use-display-config';
import { useEnvironment } from '~/hooks/use-environment';
import * as CardPrimitive from '~/primitives/card';

export function Card(props: {
  body?: React.ReactNode;
  actions?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode | React.ReactNode[];
}) {
  const { isDevelopmentOrStaging } = useEnvironment();
  const { layout } = useAppearance();
  const { applicationName, branded, logoImageUrl, homeUrl } = useDisplayConfig();
  const isDev = isDevelopmentOrStaging();

  // ! TODO Connections Layout?
  // ! TODO is empty card an issue?
  // ! TODO move footer links here?

  return (
    <CardPrimitive.Root>
      <CardPrimitive.Content>
        <CardPrimitive.Header>
          {logoImageUrl ? (
            <CardPrimitive.Logo
              href={homeUrl}
              src={logoImageUrl}
              alt={applicationName}
            />
          ) : null}
          {props?.title ? <CardPrimitive.Title>{props.title}</CardPrimitive.Title> : null}
          {props?.description ? (
            Array.isArray(props?.description) ? (
              props?.description.map((d, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <CardPrimitive.Description key={i}>{d}</CardPrimitive.Description>
              ))
            ) : (
              <CardPrimitive.Description>{props.description}</CardPrimitive.Description>
            )
          ) : null}
        </CardPrimitive.Header>
        <GlobalError />
        {props?.body ? <CardPrimitive.Body>{props?.body}</CardPrimitive.Body> : null}
        {props?.actions ? <CardPrimitive.Actions>{props?.actions}</CardPrimitive.Actions> : null}
        {isDev ? <CardPrimitive.Banner>Development mode</CardPrimitive.Banner> : null}
      </CardPrimitive.Content>

      <CardPrimitive.Footer
        branded={branded}
        helpPageUrl={layout?.helpPageUrl}
        privacyPageUrl={layout?.privacyPageUrl}
        termsPageUrl={layout?.termsPageUrl}
      />
    </CardPrimitive.Root>
  );
}
