import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { CopyButton } from '../../components/copy-button';
import { useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './logs.styles';

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}[\],]/g;

function highlight(json: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of json.matchAll(TOKEN)) {
    const index = match.index;
    if (index > last) {
      nodes.push(json.slice(last, index));
    }
    const [token, quoted, colon, literal] = match;
    const key = `${index}`;
    if (quoted && colon) {
      nodes.push(
        <span
          key={key}
          {...stylex.props(styles.jsonKey)}
        >
          {quoted}
        </span>,
        <span
          key={`${key}:`}
          {...stylex.props(styles.jsonPunctuation)}
        >
          {colon}
        </span>,
      );
    } else if (quoted) {
      nodes.push(
        <span
          key={key}
          {...stylex.props(styles.jsonString)}
        >
          {quoted}
        </span>,
      );
    } else if (literal) {
      nodes.push(
        <span
          key={key}
          {...stylex.props(styles.jsonLiteral)}
        >
          {literal}
        </span>,
      );
    } else if (/^[{}[\],]$/.test(token)) {
      nodes.push(
        <span
          key={key}
          {...stylex.props(styles.jsonPunctuation)}
        >
          {token}
        </span>,
      );
    } else {
      nodes.push(
        <span
          key={key}
          {...stylex.props(styles.jsonNumber)}
        >
          {token}
        </span>,
      );
    }
    last = index + token.length;
  }
  if (last < json.length) {
    nodes.push(json.slice(last));
  }
  return nodes;
}

export function LogPayloadView({ payload }: { payload: Record<string, unknown> }) {
  const m = useMessages('logs');
  const serialized = useMemo(() => JSON.stringify(payload, null, 2), [payload]);
  const hasPayload = Object.keys(payload).length > 0;

  return (
    <section {...mergeStyleProps(themeProps('log-payload'), stylex.props(styles.section))}>
      <div {...stylex.props(styles.sectionHeader)}>
        <h3 {...stylex.props(styles.sectionTitle)}>{m.payload}</h3>
        <CopyButton
          value={serialized}
          label={m.copyPayload}
          copiedLabel={m.copied}
          disabled={!hasPayload}
          size='sm'
          variant='ghost'
          color='neutral'
        />
      </div>
      {hasPayload ? (
        <pre {...stylex.props(styles.payload)}>
          <code>{highlight(serialized)}</code>
        </pre>
      ) : (
        <div {...stylex.props(styles.payloadEmpty)}>{m.noPayload}</div>
      )}
    </section>
  );
}
