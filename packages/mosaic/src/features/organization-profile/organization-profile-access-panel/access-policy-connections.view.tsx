import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { Icon } from '../../../components/icon';
import { Menu } from '../../../components/menu';
import { Cog6Teeth } from '../../../icons/glyphs/cog-6-teeth';
import { Plus } from '../../../icons/glyphs/plus';
import { X } from '../../../icons/glyphs/x';
import { useMessages } from '../../../localization';
import type { AccessController } from './access.controller';
import { styles } from './access.styles';
import { AccessSelect } from './access-fields.view';

export function PolicySsoConnections({ controller }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const { form, data, registerAddSso } = controller;
  const policy = form.values;
  return (
    <div {...stylex.props(styles.inset)}>
      {policy.ssoConnectionIds.map(id => (
        <div
          key={id}
          {...stylex.props(styles.connectionRow)}
        >
          <div {...stylex.props(styles.connectionControl)}>
            <AccessSelect
              label={m.connections}
              hideLabel={id !== policy.ssoConnectionIds[0]}
              provider={data.connections.find(item => item.id === id)?.configuration.provider}
              value={id}
              items={data.connections
                .filter(item => item.kind === 'sso' && (item.id === id || !policy.ssoConnectionIds.includes(item.id)))
                .map(item => ({ value: item.id, label: item.configuration.name }))}
              onChange={next =>
                form.setValue(
                  'ssoConnectionIds',
                  policy.ssoConnectionIds.map(value => (value === id ? next : value)),
                )
              }
              disabled={form.isSubmitting}
            />
          </div>
          <Button
            variant='outline'
            color='neutral'
            shape='square'
            aria-label={m.manage}
            onClick={() => controller.onManage(id)}
            disabled={form.isSubmitting}
          >
            <Icon
              glyph={Cog6Teeth}
              xstyle={styles.connectionAction}
            />
          </Button>
          <Button
            ref={controller.ssoRemoval.registerTrigger(id)}
            shape='square'
            aria-label={m.remove}
            variant='outline'
            color='neutral'
            disabled={form.isSubmitting}
            onClick={() => {
              void controller.ssoRemoval.remove(id).then(() => controller.ssoRemoval.finalFocus()?.focus());
            }}
          >
            <Icon
              glyph={X}
              xstyle={styles.connectionAction}
            />
          </Button>
        </div>
      ))}
      {controller.availableSsoConnections.length ? (
        <Menu.Root>
          <Menu.Trigger
            ref={registerAddSso}
            aria-label={m.addConnection}
            render={
              <Button
                variant='outline'
                color='neutral'
                xstyle={styles.fit}
              />
            }
            disabled={form.isSubmitting}
          >
            <Icon glyph={Plus} />
            {m.add}
          </Menu.Trigger>
          <Menu.Popup>
            {controller.availableSsoConnections.map(connection => (
              <Menu.Item
                key={connection.id}
                label={connection.configuration.name}
                onClick={() => controller.onAttachSso(connection.id)}
              >
                <Menu.Label>{connection.configuration.name}</Menu.Label>
              </Menu.Item>
            ))}
            <Menu.Item
              label={m.ssoTitle}
              onClick={() => controller.onSetup('sso')}
            >
              <Menu.Label>{m.ssoTitle}</Menu.Label>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      ) : (
        <Button
          xstyle={styles.fit}
          ref={registerAddSso}
          aria-label={m.addConnection}
          variant='outline'
          color='neutral'
          onClick={() => controller.onSetup('sso')}
          disabled={form.isSubmitting}
        >
          <Icon glyph={Plus} />
          {m.add}
        </Button>
      )}
    </div>
  );
}

export function PolicyDirectory({ controller }: { controller: AccessController }) {
  const m = useMessages('organizationProfile').access;
  const { form, data } = controller;
  const policy = form.values;
  const directories = data.connections.filter(connection => connection.kind === 'directory');
  return (
    <div {...stylex.props(styles.inset)}>
      {policy.directoryConnectionId || (data.live && directories.length > 0) ? (
        <div {...stylex.props(styles.connectionRow)}>
          <AccessSelect
            label={m.directory}
            value={policy.directoryConnectionId}
            provider={data.connections.find(item => item.id === policy.directoryConnectionId)?.configuration.provider}
            items={directories.map(item => ({ value: item.id, label: item.configuration.name }))}
            onChange={id => form.setValue('directoryConnectionId', id)}
            disabled={form.isSubmitting}
          />
          <Button
            variant='outline'
            color='neutral'
            shape='square'
            aria-label={m.manage}
            disabled={form.isSubmitting || !policy.directoryConnectionId}
            onClick={() => controller.onManage(policy.directoryConnectionId ?? '')}
          >
            <Icon
              glyph={Cog6Teeth}
              xstyle={styles.connectionAction}
            />
          </Button>
        </div>
      ) : data.canCreateDirectory !== false ? (
        <Button
          variant='outline'
          color='neutral'
          xstyle={styles.fit}
          onClick={() => controller.onSetup('directory')}
          disabled={form.isSubmitting}
        >
          <Icon glyph={Plus} />
          {m.addDirectory}
        </Button>
      ) : null}
    </div>
  );
}
