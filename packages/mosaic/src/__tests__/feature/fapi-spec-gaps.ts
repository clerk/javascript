export interface SpecGap {
  at: string;
  property: string;
  schema: Record<string, unknown>;
  replaces?: Record<string, unknown>;
  sentBy: string;
}

const activeSession = component('Client.ActiveSession');
const serializedSession = 'api/serialize/session.go sessionToClientAPI';
const externalAccount = component('ExternalAccountWithVerification');
const samlLinking = 'api/fapi/v1/users/service.go connectSAMLEnterpriseAccount';
const accountVerifications = [
  { $ref: component('verification_oauth') },
  { $ref: component('verification_google_one_tap') },
];

export const SPEC_GAPS: readonly SpecGap[] = [
  {
    at: component('Client.User'),
    property: 'enterprise_accounts',
    schema: { type: 'array', items: { type: 'object' } },
    sentBy: 'api/serialize/user.go UserResponse',
  },
  {
    at: component('Client.SessionBase'),
    property: 'tasks',
    schema: { type: 'array', items: { $ref: '#/components/schemas/Client.SessionTask' } },
    sentBy: 'api/serialize/session.go SessionClientResponse',
  },
  {
    at: component('Client.OrganizationSettings'),
    property: 'force_organization_selection',
    schema: { type: 'boolean' },
    sentBy: 'api/serialize/auth_config.go organizationSettingsResponse',
  },
  {
    at: component('UserSettings.SignUp'),
    property: 'mfa',
    schema: { type: 'object', properties: { required: { type: 'boolean' } }, required: ['required'] },
    sentBy: 'pkg/usersettings/model/user_settings.go SignUp',
  },
  {
    at: activeSession,
    property: 'last_active_organization_id',
    schema: { type: 'string', nullable: true },
    sentBy: serializedSession,
  },
  { at: activeSession, property: 'user', schema: { type: 'object', nullable: true }, sentBy: serializedSession },
  {
    at: activeSession,
    property: 'public_user_data',
    schema: { type: 'object', nullable: true },
    sentBy: serializedSession,
  },
  {
    at: activeSession,
    property: 'factor_verification_age',
    schema: { type: 'array', items: { type: 'integer' } },
    sentBy: serializedSession,
  },
  { at: activeSession, property: 'created_at', schema: { type: 'integer' }, sentBy: serializedSession },
  { at: activeSession, property: 'updated_at', schema: { type: 'integer' }, sentBy: serializedSession },
  {
    at: component('EnterpriseConnectionResponse'),
    property: 'object',
    schema: { type: 'string', enum: ['enterprise_connection'] },
    sentBy: 'api/serialize/enterprise_connection.go EnterpriseConnectionResponse',
  },
  {
    at: '#/paths/~1v1~1client~1sessions~1{session_id}~1tokens/post/responses/200/content/application~1json/schema',
    property: 'object',
    schema: { type: 'string', enum: ['token'] },
    sentBy: 'api/serialize/token.go Token',
  },
  {
    at: `${operation('/v1/client/sessions/{session_id}/tokens', 'post')}/requestBody/content/application~1x-www-form-urlencoded/schema`,
    property: 'tab_state',
    schema: { type: 'string' },
    sentBy: 'api/fapi/v1/tokens/http.go paramTabState',
  },
  {
    at: `${operation('/v1/me/organization_suggestions', 'get')}/x-query-schema`,
    property: 'status',
    schema: { type: 'array', items: { type: 'string' } },
    replaces: { type: 'string' },
    sentBy: 'api/fapi/v1/users/http.go ListOrganizationSuggestions',
  },
  {
    at: `${operation('/v1/me/enterprise_connections', 'get')}/x-query-schema`,
    property: 'with_organization_account_linking',
    schema: { type: 'boolean' },
    sentBy: 'api/fapi/v1/enterprise_connections/deprecated_http.go ListEnterpriseConnections',
  },
  {
    at: externalAccount,
    property: 'public_metadata',
    schema: { type: 'object', additionalProperties: true, nullable: true },
    replaces: { type: 'object', additionalProperties: true },
    sentBy: samlLinking,
  },
  {
    at: externalAccount,
    property: 'verification',
    schema: {
      type: 'object',
      nullable: true,
      oneOf: [...accountVerifications, { $ref: component('Stubs.Verification.SAML') }],
    },
    replaces: {
      type: 'object',
      nullable: true,
      oneOf: accountVerifications,
      discriminator: { propertyName: 'object' },
    },
    sentBy: samlLinking,
  },
];

function component(name: string): string {
  return `#/components/schemas/${name}`;
}

function operation(path: string, method: string): string {
  return `#/paths/${path.replace(/\//g, '~1')}/${method}`;
}
