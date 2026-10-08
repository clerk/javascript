import type { SSOConnection, SSOConnectionCommands } from '../../ConfigureSSO/configure-sso.types';

export type NameSectionProps = {
  connection: SSOConnection;
  updateConnection: SSOConnectionCommands['updateConnection'];
};

export const useNameSectionModel = ({ connection, updateConnection }: NameSectionProps) => ({
  name: connection.name,
  updateName: (name: string) => updateConnection(connection.id, { name }),
});
