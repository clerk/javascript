// Generated from TypeScript. Do not edit.
import Foundation
import Observation

public struct ClerkState: Hashable, Sendable {
  public let `status`: ClerkStatus
  public let `telemetry`: TelemetryCollector?
  public let `loaded`: Bool
  public let `sessions`: [Session]
  public let `lastAuthenticationStrategy`: LastAuthenticationStrategy?
  public let `environment`: EnvironmentResource
  public let `session`: Session?
  public let `user`: User?
  public let `organization`: Organization?
  public let `clientId`: String?
  public let `biometricCredentials`: BiometricCredentials
  public let `authCallback`: MobileAuthCallback?
  public let `signIn`: SignIn
  public let `signUp`: SignUp
  public init(`status`: ClerkStatus, `telemetry`: TelemetryCollector? = nil, `loaded`: Bool, `sessions`: [Session], `lastAuthenticationStrategy`: LastAuthenticationStrategy?, `environment`: EnvironmentResource, `session`: Session?, `user`: User?, `organization`: Organization?, `clientId`: String?, `biometricCredentials`: BiometricCredentials, `authCallback`: MobileAuthCallback?, `signIn`: SignIn, `signUp`: SignUp) {
    self.`status` = `status`
    self.`telemetry` = `telemetry`
    self.`loaded` = `loaded`
    self.`sessions` = `sessions`
    self.`lastAuthenticationStrategy` = `lastAuthenticationStrategy`
    self.`environment` = `environment`
    self.`session` = `session`
    self.`user` = `user`
    self.`organization` = `organization`
    self.`clientId` = `clientId`
    self.`biometricCredentials` = `biometricCredentials`
    self.`authCallback` = `authCallback`
    self.`signIn` = `signIn`
    self.`signUp` = `signUp`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "status": try self.`status`.encode(),
      "telemetry": try self.`telemetry`.map { value in try value.encode() } ?? .undefined,
      "loaded": .bool(self.`loaded`),
      "sessions": .array(try self.`sessions`.map { value in try value.encode() }),
      "lastAuthenticationStrategy": try self.`lastAuthenticationStrategy`.map { value in try value.encode() } ?? .null,
      "environment": try self.`environment`.encode(),
      "session": try self.`session`.map { value in try value.encode() } ?? .null,
      "user": try self.`user`.map { value in try value.encode() } ?? .null,
      "organization": try self.`organization`.map { value in try value.encode() } ?? .null,
      "clientId": try self.`clientId`.map { value in .string(value) } ?? .null,
      "biometricCredentials": try self.`biometricCredentials`.encode(),
      "authCallback": try self.`authCallback`.map { value in try value.encode() } ?? .null,
      "signIn": try self.`signIn`.encode(),
      "signUp": try self.`signUp`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkState {
    let values = try value.object()

    return try ClerkState(`status`: try ClerkStatus.decode((values["status"] ?? .undefined), in: runtime), `telemetry`: try (values["telemetry"] ?? .undefined).optional { value in try TelemetryCollector.decode(value, in: runtime) }, `loaded`: try (values["loaded"] ?? .undefined).bool(), `sessions`: try (values["sessions"] ?? .undefined).array().map { value in try Session.decode(value, in: runtime) }, `lastAuthenticationStrategy`: try (values["lastAuthenticationStrategy"] ?? .undefined).optional { value in try LastAuthenticationStrategy.decode(value, in: runtime) }, `environment`: try EnvironmentResource.decode((values["environment"] ?? .undefined), in: runtime), `session`: try (values["session"] ?? .undefined).optional { value in try Session.decode(value, in: runtime) }, `user`: try (values["user"] ?? .undefined).optional { value in try User.decode(value, in: runtime) }, `organization`: try (values["organization"] ?? .undefined).optional { value in try Organization.decode(value, in: runtime) }, `clientId`: try (values["clientId"] ?? .undefined).optional { value in try value.string() }, `biometricCredentials`: try BiometricCredentials.decode((values["biometricCredentials"] ?? .undefined), in: runtime), `authCallback`: try (values["authCallback"] ?? .undefined).optional { value in try MobileAuthCallback.decode(value, in: runtime) }, `signIn`: try SignIn.decode((values["signIn"] ?? .undefined), in: runtime), `signUp`: try SignUp.decode((values["signUp"] ?? .undefined), in: runtime))
  }
}
@MainActor @Observable public final class Clerk: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: ClerkState { context.state(handle, as: ClerkState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: true) }
  public var `status`: ClerkStatus { state.`status` }
  public var `telemetry`: TelemetryCollector? { state.`telemetry` }
  public var `loaded`: Bool { state.`loaded` }
  public var `sessions`: [Session] { state.`sessions` }
  public var `lastAuthenticationStrategy`: LastAuthenticationStrategy? { state.`lastAuthenticationStrategy` }
  public var `environment`: EnvironmentResource { state.`environment` }
  public var `session`: Session? { state.`session` }
  public var `user`: User? { state.`user` }
  public var `organization`: Organization? { state.`organization` }
  public var `clientId`: String? { state.`clientId` }
  public var `biometricCredentials`: BiometricCredentials { state.`biometricCredentials` }
  public var `authCallback`: MobileAuthCallback? { state.`authCallback` }
  public var `signIn`: SignIn { state.`signIn` }
  public var `signUp`: SignUp { state.`signUp` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try ClerkState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Clerk { try runtime.resource(ResourceHandle.decodeReference(value), as: Clerk.self) }
  /// Creates an Organization programmatically, adding the current user as admin. Returns an [`Organization`](https://clerk.com/docs/reference/objects/organization) object.
  ///
  /// > [!NOTE]
  /// > For React-based apps, consider using the [`<CreateOrganization />`](https://clerk.com/docs/reference/components/organization/create-organization) component.
  public func `createOrganization`(_ `params`: CreateOrganizationParams) async throws -> Organization {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Clerk.createOrganization", arguments: [try `params`.encode()]) { result in
      return try Organization.decode(result, in: runtime)
    }
  }
  /// Gets a single [Organization](https://clerk.com/docs/reference/objects/organization) by ID.
  public func `getOrganization`(_ `organizationId`: String) async throws -> Organization {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Clerk.getOrganization", arguments: [.string(`organizationId`)]) { result in
      return try Organization.decode(result, in: runtime)
    }
  }
  public func `handleAuthCallback`(_ `url`: URL) async throws -> MobileAuthenticationResult? {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Clerk.handleAuthCallback", arguments: [.string(`url`.absoluteString)]) { result in
      return try result.optional { value in try MobileAuthenticationResult.decode(value, in: runtime) }
    }
  }
  public func `clearAuthCallback`(_ `id`: Double) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Clerk.clearAuthCallback", arguments: [.number(`id`)]) { result in
      _ = result
    }
  }
  public func `authenticateWithSSO`(_ `params`: MobileSSOParams) async throws -> MobileAuthenticationResult {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Clerk.authenticateWithSSO", arguments: [try `params`.encode()]) { result in
      return try MobileAuthenticationResult.decode(result, in: runtime)
    }
  }
  public func `startAuthentication`(_ `params`: MobileIdentifierParams) async throws -> MobileAuthenticationResult {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Clerk.startAuthentication", arguments: [try `params`.encode()]) { result in
      return try MobileAuthenticationResult.decode(result, in: runtime)
    }
  }
  public func `setActive`(_ `params`: MobileSetActiveParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Clerk.setActive", arguments: [try `params`.encode()]) { result in
      _ = result
    }
  }
  public func `signOut`(_ `options`: MobileSignOutOptions? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Clerk.signOut", arguments: [try `options`.map { value in try value.encode() } ?? .undefined]) { result in
      _ = result
    }
  }
}

public enum ClerkStatus: Hashable, Sendable {
  case `degraded`
  case `error`
  case `loading`
  case `ready`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`degraded`: return "degraded"
    case .`error`: return "error"
    case .`loading`: return "loading"
    case .`ready`: return "ready"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "degraded": self = .`degraded`
    case "error": self = .`error`
    case "loading": self = .`loading`
    case "ready": self = .`ready`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkStatus { .init(rawValue: try value.string()) }
}

public struct TelemetryCollectorState: Hashable, Sendable {
  public let `isEnabled`: Bool
  public let `isDebug`: Bool
  public init(`isEnabled`: Bool, `isDebug`: Bool) {
    self.`isEnabled` = `isEnabled`
    self.`isDebug` = `isDebug`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "isEnabled": .bool(self.`isEnabled`),
      "isDebug": .bool(self.`isDebug`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> TelemetryCollectorState {
    let values = try value.object()

    return try TelemetryCollectorState(`isEnabled`: try (values["isEnabled"] ?? .undefined).bool(), `isDebug`: try (values["isDebug"] ?? .undefined).bool())
  }
}
@MainActor @Observable public final class TelemetryCollector: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: TelemetryCollectorState { context.state(handle, as: TelemetryCollectorState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `isEnabled`: Bool { state.`isEnabled` }
  public var `isDebug`: Bool { state.`isDebug` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try TelemetryCollectorState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> TelemetryCollector { try runtime.resource(ResourceHandle.decodeReference(value), as: TelemetryCollector.self) }
  /// Records a telemetry event.
  public func `record`(_ `event`: TelemetryEventRawRecord) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "TelemetryCollector.record", arguments: [try `event`.encode()]) { result in
      _ = result
    }
  }
  /// Records a telemetry log entry.
  public func `recordLog`(_ `entry`: TelemetryLogEntry) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "TelemetryCollector.recordLog", arguments: [try `entry`.encode()]) { result in
      _ = result
    }
  }
}

public struct TelemetryEventRawRecord: Hashable, Sendable {
  public let `event`: String
  public let `eventSamplingRate`: Double?
  public let `payload`: [String: JSONValue]
  public init(`event`: String, `eventSamplingRate`: Double? = nil, `payload`: [String: JSONValue]) {
    self.`event` = `event`
    self.`eventSamplingRate` = `eventSamplingRate`
    self.`payload` = `payload`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "event": .string(self.`event`),
      "eventSamplingRate": try self.`eventSamplingRate`.map { value in .number(value) } ?? .undefined,
      "payload": .object(self.`payload`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> TelemetryEventRawRecord {
    let values = try value.object()

    return try TelemetryEventRawRecord(`event`: try (values["event"] ?? .undefined).string(), `eventSamplingRate`: try (values["eventSamplingRate"] ?? .undefined).optional { value in try value.number() }, `payload`: try (values["payload"] ?? .undefined).object())
  }
}

/// Debug log entry interface for telemetry collector
public struct TelemetryLogEntry: Hashable, Sendable {
  public let `context`: [String: JSONValue]?
  public let `level`: TelemetryLogEntryLevel
  public let `message`: String
  public let `organizationId`: String?
  public let `sessionId`: String?
  public let `source`: String?
  public let `timestamp`: Double
  public let `userId`: String?
  public init(`context`: [String: JSONValue]? = nil, `level`: TelemetryLogEntryLevel, `message`: String, `organizationId`: String? = nil, `sessionId`: String? = nil, `source`: String? = nil, `timestamp`: Double, `userId`: String? = nil) {
    self.`context` = `context`
    self.`level` = `level`
    self.`message` = `message`
    self.`organizationId` = `organizationId`
    self.`sessionId` = `sessionId`
    self.`source` = `source`
    self.`timestamp` = `timestamp`
    self.`userId` = `userId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "context": try self.`context`.map { value in .object(value) } ?? .undefined,
      "level": try self.`level`.encode(),
      "message": .string(self.`message`),
      "organizationId": try self.`organizationId`.map { value in .string(value) } ?? .undefined,
      "sessionId": try self.`sessionId`.map { value in .string(value) } ?? .undefined,
      "source": try self.`source`.map { value in .string(value) } ?? .undefined,
      "timestamp": .number(self.`timestamp`),
      "userId": try self.`userId`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> TelemetryLogEntry {
    let values = try value.object()

    return try TelemetryLogEntry(`context`: try (values["context"] ?? .undefined).optional { value in try value.object() }, `level`: try TelemetryLogEntryLevel.decode((values["level"] ?? .undefined), in: runtime), `message`: try (values["message"] ?? .undefined).string(), `organizationId`: try (values["organizationId"] ?? .undefined).optional { value in try value.string() }, `sessionId`: try (values["sessionId"] ?? .undefined).optional { value in try value.string() }, `source`: try (values["source"] ?? .undefined).optional { value in try value.string() }, `timestamp`: try (values["timestamp"] ?? .undefined).number(), `userId`: try (values["userId"] ?? .undefined).optional { value in try value.string() })
  }
}

public enum TelemetryLogEntryLevel: Hashable, Sendable {
  case `info`
  case `error`
  case `warn`
  case `debug`
  case `trace`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`info`: return "info"
    case .`error`: return "error"
    case .`warn`: return "warn"
    case .`debug`: return "debug"
    case .`trace`: return "trace"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "info": self = .`info`
    case "error": self = .`error`
    case "warn": self = .`warn`
    case "debug": self = .`debug`
    case "trace": self = .`trace`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> TelemetryLogEntryLevel { .init(rawValue: try value.string()) }
}

public struct CreateOrganizationParams: Hashable, Sendable {
  public let `name`: String
  public let `slug`: String?
  public init(`name`: String, `slug`: String? = nil) {
    self.`name` = `name`
    self.`slug` = `slug`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "name": .string(self.`name`),
      "slug": try self.`slug`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreateOrganizationParams {
    let values = try value.object()

    return try CreateOrganizationParams(`name`: try (values["name"] ?? .undefined).string(), `slug`: try (values["slug"] ?? .undefined).optional { value in try value.string() })
  }
}

/// The `Organization` object holds information about an Organization, as well as methods for managing it.
///
/// To use these methods, you must have the **Organizations** feature [enabled in your app's settings in the Clerk Dashboard](https://clerk.com/docs/guides/organizations/configure#enable-organizations).
public struct OrganizationState: Hashable, Sendable {
  public let `id`: String
  public let `name`: String
  public let `slug`: String?
  public let `imageUrl`: String
  public let `hasImage`: Bool
  public let `membersCount`: Double
  public let `pendingInvitationsCount`: Double
  public let `publicMetadata`: [String: JSONValue]
  public let `adminDeleteEnabled`: Bool
  public let `maxAllowedMemberships`: Double
  public let `selfServeSSOEnabled`: Bool
  public let `exclusiveMembership`: Bool
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`id`: String, `name`: String, `slug`: String?, `imageUrl`: String, `hasImage`: Bool, `membersCount`: Double, `pendingInvitationsCount`: Double, `publicMetadata`: [String: JSONValue], `adminDeleteEnabled`: Bool, `maxAllowedMemberships`: Double, `selfServeSSOEnabled`: Bool, `exclusiveMembership`: Bool, `createdAt`: Date, `updatedAt`: Date) {
    self.`id` = `id`
    self.`name` = `name`
    self.`slug` = `slug`
    self.`imageUrl` = `imageUrl`
    self.`hasImage` = `hasImage`
    self.`membersCount` = `membersCount`
    self.`pendingInvitationsCount` = `pendingInvitationsCount`
    self.`publicMetadata` = `publicMetadata`
    self.`adminDeleteEnabled` = `adminDeleteEnabled`
    self.`maxAllowedMemberships` = `maxAllowedMemberships`
    self.`selfServeSSOEnabled` = `selfServeSSOEnabled`
    self.`exclusiveMembership` = `exclusiveMembership`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "name": .string(self.`name`),
      "slug": try self.`slug`.map { value in .string(value) } ?? .null,
      "imageUrl": .string(self.`imageUrl`),
      "hasImage": .bool(self.`hasImage`),
      "membersCount": .number(self.`membersCount`),
      "pendingInvitationsCount": .number(self.`pendingInvitationsCount`),
      "publicMetadata": .object(self.`publicMetadata`),
      "adminDeleteEnabled": .bool(self.`adminDeleteEnabled`),
      "maxAllowedMemberships": .number(self.`maxAllowedMemberships`),
      "selfServeSSOEnabled": .bool(self.`selfServeSSOEnabled`),
      "exclusiveMembership": .bool(self.`exclusiveMembership`),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationState {
    let values = try value.object()

    return try OrganizationState(`id`: try (values["id"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).string(), `slug`: try (values["slug"] ?? .undefined).optional { value in try value.string() }, `imageUrl`: try (values["imageUrl"] ?? .undefined).string(), `hasImage`: try (values["hasImage"] ?? .undefined).bool(), `membersCount`: try (values["membersCount"] ?? .undefined).number(), `pendingInvitationsCount`: try (values["pendingInvitationsCount"] ?? .undefined).number(), `publicMetadata`: try (values["publicMetadata"] ?? .undefined).object(), `adminDeleteEnabled`: try (values["adminDeleteEnabled"] ?? .undefined).bool(), `maxAllowedMemberships`: try (values["maxAllowedMemberships"] ?? .undefined).number(), `selfServeSSOEnabled`: try (values["selfServeSSOEnabled"] ?? .undefined).bool(), `exclusiveMembership`: try (values["exclusiveMembership"] ?? .undefined).bool(), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class Organization: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: OrganizationState { context.state(handle, as: OrganizationState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `name`: String { state.`name` }
  public var `slug`: String? { state.`slug` }
  public var `imageUrl`: String { state.`imageUrl` }
  public var `hasImage`: Bool { state.`hasImage` }
  public var `membersCount`: Double { state.`membersCount` }
  public var `pendingInvitationsCount`: Double { state.`pendingInvitationsCount` }
  public var `publicMetadata`: [String: JSONValue] { state.`publicMetadata` }
  public var `adminDeleteEnabled`: Bool { state.`adminDeleteEnabled` }
  public var `maxAllowedMemberships`: Double { state.`maxAllowedMemberships` }
  public var `selfServeSSOEnabled`: Bool { state.`selfServeSSOEnabled` }
  public var `exclusiveMembership`: Bool { state.`exclusiveMembership` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try OrganizationState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Organization { try runtime.resource(ResourceHandle.decodeReference(value), as: Organization.self) }
  /// Updates the current Organization.
  public func `update`(_ `params`: UpdateOrganizationParams) async throws -> Organization {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.update", arguments: [try `params`.encode()]) { result in
      return try Organization.decode(result, in: runtime)
    }
  }
  /// Gets the list of Organization Memberships.
  public func `getMemberships`(_ `params`: GetMembersParams? = nil) async throws -> ClerkPaginatedResponseOrganizationMembership {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.getMemberships", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ClerkPaginatedResponseOrganizationMembership.decode(result, in: runtime)
    }
  }
  /// Gets the list of invitations.
  public func `getInvitations`(_ `params`: GetInvitationsParams? = nil) async throws -> ClerkPaginatedResponseOrganizationInvitation {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.getInvitations", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ClerkPaginatedResponseOrganizationInvitation.decode(result, in: runtime)
    }
  }
  /// Gets the list of [Roles](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) available.
  public func `getRoles`(_ `params`: GetRolesParams? = nil) async throws -> GetRolesResponse {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.getRoles", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try GetRolesResponse.decode(result, in: runtime)
    }
  }
  /// Gets the list of domains.
  public func `getDomains`(_ `params`: GetDomainsParams? = nil) async throws -> ClerkPaginatedResponseOrganizationDomain {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.getDomains", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ClerkPaginatedResponseOrganizationDomain.decode(result, in: runtime)
    }
  }
  /// Gets the list of membership requests.
  public func `getMembershipRequests`(_ `params`: GetMembershipRequestParams? = nil) async throws -> ClerkPaginatedResponseOrganizationMembershipRequest {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.getMembershipRequests", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ClerkPaginatedResponseOrganizationMembershipRequest.decode(result, in: runtime)
    }
  }
  /// Adds a user as a member to an organization. A user can only be added to an organization if they are not already a member of it and if they already exist in the same instance as the organization. Only administrators can add members to an organization.
  public func `addMember`(_ `params`: AddMemberParams) async throws -> OrganizationMembership {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.addMember", arguments: [try `params`.encode()]) { result in
      return try OrganizationMembership.decode(result, in: runtime)
    }
  }
  /// Creates and sends an invitation to the given email address.
  public func `inviteMember`(_ `params`: InviteMemberParams) async throws -> OrganizationInvitation {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.inviteMember", arguments: [try `params`.encode()]) { result in
      return try OrganizationInvitation.decode(result, in: runtime)
    }
  }
  /// Creates and sends invitations to the given email addresses.
  public func `inviteMembers`(_ `params`: InviteMembersParams) async throws -> [OrganizationInvitation] {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.inviteMembers", arguments: [try `params`.encode()]) { result in
      return try result.array().map { value in try OrganizationInvitation.decode(value, in: runtime) }
    }
  }
  /// Updates a given member.
  public func `updateMember`(_ `params`: UpdateMembershipParams) async throws -> OrganizationMembership {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.updateMember", arguments: [try `params`.encode()]) { result in
      return try OrganizationMembership.decode(result, in: runtime)
    }
  }
  /// Removes a member.
  public func `removeMember`(_ `userId`: String) async throws -> OrganizationMembership {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.removeMember", arguments: [.string(`userId`)]) { result in
      return try OrganizationMembership.decode(result, in: runtime)
    }
  }
  /// Creates a new domain.
  public func `createDomain`(_ `domainName`: String, `params`: PickCreateOrganizationDomainParamsAndenrollmentMode? = nil) async throws -> OrganizationDomain {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.createDomain", arguments: [.string(`domainName`), try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try OrganizationDomain.decode(result, in: runtime)
    }
  }
  /// Starts the verification process of multiple [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) at once by issuing a fresh TXT challenge for each of the given domains in a single request. Each resolved domain's `ownershipVerification` property carries the `txtRecordName` and `txtRecordValue` the Organization [admin](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) must publish. A single bad domain does not fail the batch; it lands in the returned [`OrganizationDomainsBulkOwnershipVerificationResource`](https://clerk.com/docs/reference/types/organization-domains-bulk-ownership-verification-resource) object's `errors` array.
  public func `prepareOwnershipVerification`(_ `domainIds`: [String]) async throws -> OrganizationDomainsBulkOwnershipVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.prepareOwnershipVerification", arguments: [.array(try `domainIds`.map { value in .string(value) })]) { result in
      return try OrganizationDomainsBulkOwnershipVerification.decode(result, in: runtime)
    }
  }
  /// Completes the verification process started by [`prepareOwnershipVerification()`](https://clerk.com/docs/reference/objects/organization#prepare-ownership-verification), by resolving the published TXT record for each of the given domains in a single request. A single bad domain does not fail the batch; it lands in the returned [`OrganizationDomainsBulkOwnershipVerificationResource`](https://clerk.com/docs/reference/types/organization-domains-bulk-ownership-verification-resource) object's `errors` array.
  public func `attemptOwnershipVerification`(_ `domainIds`: [String]) async throws -> OrganizationDomainsBulkOwnershipVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.attemptOwnershipVerification", arguments: [.array(try `domainIds`.map { value in .string(value) })]) { result in
      return try OrganizationDomainsBulkOwnershipVerification.decode(result, in: runtime)
    }
  }
  /// Gets a domain for an Organization based on the given domain ID.
  public func `getDomain`(_ `value0`: OrganizationGetDomain__0) async throws -> OrganizationDomain {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.getDomain", arguments: [try `value0`.encode()]) { result in
      return try OrganizationDomain.decode(result, in: runtime)
    }
  }
  public func `getEnterpriseConnections`(_ `params`: GetEnterpriseConnectionsParams? = nil) async throws -> [EnterpriseConnection] {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.getEnterpriseConnections", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try result.array().map { value in try EnterpriseConnection.decode(value, in: runtime) }
    }
  }
  public func `createEnterpriseConnection`(_ `params`: CreateOrganizationEnterpriseConnectionParams) async throws -> EnterpriseConnection {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.createEnterpriseConnection", arguments: [try `params`.encode()]) { result in
      return try EnterpriseConnection.decode(result, in: runtime)
    }
  }
  public func `updateEnterpriseConnection`(_ `enterpriseConnectionId`: String, `params`: UpdateOrganizationEnterpriseConnectionParams) async throws -> EnterpriseConnection {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.updateEnterpriseConnection", arguments: [.string(`enterpriseConnectionId`), try `params`.encode()]) { result in
      return try EnterpriseConnection.decode(result, in: runtime)
    }
  }
  public func `deleteEnterpriseConnection`(_ `enterpriseConnectionId`: String) async throws -> DeletedObject {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.deleteEnterpriseConnection", arguments: [.string(`enterpriseConnectionId`)]) { result in
      return try DeletedObject.decode(result, in: runtime)
    }
  }
  public func `createEnterpriseConnectionTestRun`(_ `enterpriseConnectionId`: String) async throws -> EnterpriseConnectionTestRunInit {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.createEnterpriseConnectionTestRun", arguments: [.string(`enterpriseConnectionId`)]) { result in
      return try EnterpriseConnectionTestRunInit.decode(result, in: runtime)
    }
  }
  public func `getEnterpriseConnectionTestRuns`(_ `enterpriseConnectionId`: String, `params`: GetEnterpriseConnectionTestRunsParams? = nil) async throws -> ClerkPaginatedResponseEnterpriseConnectionTestRun {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.getEnterpriseConnectionTestRuns", arguments: [.string(`enterpriseConnectionId`), try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ClerkPaginatedResponseEnterpriseConnectionTestRun.decode(result, in: runtime)
    }
  }
  /// Deletes the Organization. Only administrators can delete an Organization.
  ///
  /// Deleting an Organization will also delete all memberships and invitations. **This is not reversible.**
  public func `destroy`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.destroy", arguments: []) { result in
      _ = result
    }
  }
  /// Sets or replaces an Organization's logo.
  public func `setLogo`(_ `params`: SetOrganizationLogoParams) async throws -> Organization {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.setLogo", arguments: [try `params`.encode()]) { result in
      return try Organization.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> Organization {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try Organization.decode(result, in: runtime)
    }
  }
  /// Initializes a payment method.
  public func `initializePaymentMethod`(_ `params`: InitializePaymentMethodParams) async throws -> BillingInitializedPaymentMethod {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.initializePaymentMethod", arguments: [try `params`.encode()]) { result in
      return try BillingInitializedPaymentMethod.decode(result, in: runtime)
    }
  }
  /// Adds a payment method.
  public func `addPaymentMethod`(_ `params`: AddPaymentMethodParams) async throws -> BillingPaymentMethod {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.addPaymentMethod", arguments: [try `params`.encode()]) { result in
      return try BillingPaymentMethod.decode(result, in: runtime)
    }
  }
  /// Gets a list of payment methods that have been stored.
  public func `getPaymentMethods`(_ `params`: GetPaymentMethodsParams? = nil) async throws -> ClerkPaginatedResponseBillingPaymentMethod {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Organization.getPaymentMethods", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ClerkPaginatedResponseBillingPaymentMethod.decode(result, in: runtime)
    }
  }
}

public struct UpdateOrganizationParams: Hashable, Sendable {
  public let `name`: String
  public let `slug`: String?
  public init(`name`: String, `slug`: String? = nil) {
    self.`name` = `name`
    self.`slug` = `slug`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "name": .string(self.`name`),
      "slug": try self.`slug`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UpdateOrganizationParams {
    let values = try value.object()

    return try UpdateOrganizationParams(`name`: try (values["name"] ?? .undefined).string(), `slug`: try (values["slug"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct GetMembersParams: Hashable, Sendable {
  public let `initialPage`: Double?
  public let `pageSize`: Double?
  public let `role`: [String]?
  public let `query`: String?
  public init(`initialPage`: Double? = nil, `pageSize`: Double? = nil, `role`: [String]? = nil, `query`: String? = nil) {
    self.`initialPage` = `initialPage`
    self.`pageSize` = `pageSize`
    self.`role` = `role`
    self.`query` = `query`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "initialPage": try self.`initialPage`.map { value in .number(value) } ?? .undefined,
      "pageSize": try self.`pageSize`.map { value in .number(value) } ?? .undefined,
      "role": try self.`role`.map { value in .array(try value.map { value in .string(value) }) } ?? .undefined,
      "query": try self.`query`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetMembersParams {
    let values = try value.object()

    return try GetMembersParams(`initialPage`: try (values["initialPage"] ?? .undefined).optional { value in try value.number() }, `pageSize`: try (values["pageSize"] ?? .undefined).optional { value in try value.number() }, `role`: try (values["role"] ?? .undefined).optional { value in try value.array().map { value in try value.string() } }, `query`: try (values["query"] ?? .undefined).optional { value in try value.string() })
  }
}

/// An interface that describes the response of a method that returns a paginated list of resources.
///
/// > [!TIP]
/// > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
public struct ClerkPaginatedResponseOrganizationMembership: Hashable, Sendable {
  public let `data`: [OrganizationMembership]
  public let `totalCount`: Double
  public init(`data`: [OrganizationMembership], `totalCount`: Double) {
    self.`data` = `data`
    self.`totalCount` = `totalCount`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "data": .array(try self.`data`.map { value in try value.encode() }),
      "total_count": .number(self.`totalCount`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkPaginatedResponseOrganizationMembership {
    let values = try value.object()

    return try ClerkPaginatedResponseOrganizationMembership(`data`: try (values["data"] ?? .undefined).array().map { value in try OrganizationMembership.decode(value, in: runtime) }, `totalCount`: try (values["total_count"] ?? .undefined).number())
  }
}

/// The `OrganizationMembership` object is the model around a user's membership in an Organization.
public struct OrganizationMembershipState: Hashable, Sendable {
  public let `id`: String
  public let `organization`: Organization
  public let `permissions`: [String]
  public let `publicMetadata`: [String: JSONValue]
  public let `publicUserData`: PublicUserData?
  public let `role`: String
  public let `roleName`: String
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`id`: String, `organization`: Organization, `permissions`: [String], `publicMetadata`: [String: JSONValue], `publicUserData`: PublicUserData? = nil, `role`: String, `roleName`: String, `createdAt`: Date, `updatedAt`: Date) {
    self.`id` = `id`
    self.`organization` = `organization`
    self.`permissions` = `permissions`
    self.`publicMetadata` = `publicMetadata`
    self.`publicUserData` = `publicUserData`
    self.`role` = `role`
    self.`roleName` = `roleName`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "organization": try self.`organization`.encode(),
      "permissions": .array(try self.`permissions`.map { value in .string(value) }),
      "publicMetadata": .object(self.`publicMetadata`),
      "publicUserData": try self.`publicUserData`.map { value in try value.encode() } ?? .undefined,
      "role": .string(self.`role`),
      "roleName": .string(self.`roleName`),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationMembershipState {
    let values = try value.object()

    return try OrganizationMembershipState(`id`: try (values["id"] ?? .undefined).string(), `organization`: try Organization.decode((values["organization"] ?? .undefined), in: runtime), `permissions`: try (values["permissions"] ?? .undefined).array().map { value in try value.string() }, `publicMetadata`: try (values["publicMetadata"] ?? .undefined).object(), `publicUserData`: try (values["publicUserData"] ?? .undefined).optional { value in try PublicUserData.decode(value, in: runtime) }, `role`: try (values["role"] ?? .undefined).string(), `roleName`: try (values["roleName"] ?? .undefined).string(), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class OrganizationMembership: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: OrganizationMembershipState { context.state(handle, as: OrganizationMembershipState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `organization`: Organization { state.`organization` }
  public var `permissions`: [String] { state.`permissions` }
  public var `publicMetadata`: [String: JSONValue] { state.`publicMetadata` }
  public var `publicUserData`: PublicUserData? { state.`publicUserData` }
  public var `role`: String { state.`role` }
  public var `roleName`: String { state.`roleName` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try OrganizationMembershipState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationMembership { try runtime.resource(ResourceHandle.decodeReference(value), as: OrganizationMembership.self) }
  /// Deletes the membership, removing the user from the Organization.
  public func `destroy`() async throws -> OrganizationMembership {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationMembership.destroy", arguments: []) { result in
      return try OrganizationMembership.decode(result, in: runtime)
    }
  }
  /// Updates the member's [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) in the Organization.
  public func `update`(_ `updateParams`: UpdateOrganizationMembershipParams) async throws -> OrganizationMembership {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationMembership.update", arguments: [try `updateParams`.encode()]) { result in
      return try OrganizationMembership.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> OrganizationMembership {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationMembership.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try OrganizationMembership.decode(result, in: runtime)
    }
  }
}

/// Information about the user that's publicly available.
public struct PublicUserData: Hashable, Sendable {
  public let `firstName`: String?
  public let `lastName`: String?
  public let `imageUrl`: String
  public let `hasImage`: Bool
  public let `identifier`: String
  public let `userId`: String?
  public let `username`: String?
  public let `banned`: Bool?
  public let `deprovisioned`: Bool?
  public init(`firstName`: String?, `lastName`: String?, `imageUrl`: String, `hasImage`: Bool, `identifier`: String, `userId`: String? = nil, `username`: String? = nil, `banned`: Bool? = nil, `deprovisioned`: Bool? = nil) {
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`imageUrl` = `imageUrl`
    self.`hasImage` = `hasImage`
    self.`identifier` = `identifier`
    self.`userId` = `userId`
    self.`username` = `username`
    self.`banned` = `banned`
    self.`deprovisioned` = `deprovisioned`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .null,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .null,
      "imageUrl": .string(self.`imageUrl`),
      "hasImage": .bool(self.`hasImage`),
      "identifier": .string(self.`identifier`),
      "userId": try self.`userId`.map { value in .string(value) } ?? .undefined,
      "username": try self.`username`.map { value in .string(value) } ?? .undefined,
      "banned": try self.`banned`.map { value in .bool(value) } ?? .undefined,
      "deprovisioned": try self.`deprovisioned`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PublicUserData {
    let values = try value.object()

    return try PublicUserData(`firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `imageUrl`: try (values["imageUrl"] ?? .undefined).string(), `hasImage`: try (values["hasImage"] ?? .undefined).bool(), `identifier`: try (values["identifier"] ?? .undefined).string(), `userId`: try (values["userId"] ?? .undefined).optional { value in try value.string() }, `username`: try (values["username"] ?? .undefined).optional { value in try value.string() }, `banned`: try (values["banned"] ?? .undefined).optional { value in try value.bool() }, `deprovisioned`: try (values["deprovisioned"] ?? .undefined).optional { value in try value.bool() })
  }
}

public struct UpdateOrganizationMembershipParams: Hashable, Sendable {
  public let `role`: String
  public init(`role`: String) {
    self.`role` = `role`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "role": .string(self.`role`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UpdateOrganizationMembershipParams {
    let values = try value.object()

    return try UpdateOrganizationMembershipParams(`role`: try (values["role"] ?? .undefined).string())
  }
}

public struct ClerkResourceReloadParams: Hashable, Sendable {
  public let `rotatingTokenNonce`: String?
  public init(`rotatingTokenNonce`: String? = nil) {
    self.`rotatingTokenNonce` = `rotatingTokenNonce`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "rotatingTokenNonce": try self.`rotatingTokenNonce`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkResourceReloadParams {
    let values = try value.object()

    return try ClerkResourceReloadParams(`rotatingTokenNonce`: try (values["rotatingTokenNonce"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct GetInvitationsParams: Hashable, Sendable {
  public let `initialPage`: Double?
  public let `pageSize`: Double?
  public let `status`: [OrganizationInvitationStatus]?
  public init(`initialPage`: Double? = nil, `pageSize`: Double? = nil, `status`: [OrganizationInvitationStatus]? = nil) {
    self.`initialPage` = `initialPage`
    self.`pageSize` = `pageSize`
    self.`status` = `status`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "initialPage": try self.`initialPage`.map { value in .number(value) } ?? .undefined,
      "pageSize": try self.`pageSize`.map { value in .number(value) } ?? .undefined,
      "status": try self.`status`.map { value in .array(try value.map { value in try value.encode() }) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetInvitationsParams {
    let values = try value.object()

    return try GetInvitationsParams(`initialPage`: try (values["initialPage"] ?? .undefined).optional { value in try value.number() }, `pageSize`: try (values["pageSize"] ?? .undefined).optional { value in try value.number() }, `status`: try (values["status"] ?? .undefined).optional { value in try value.array().map { value in try OrganizationInvitationStatus.decode(value, in: runtime) } })
  }
}

public enum OrganizationInvitationStatus: Hashable, Sendable {
  case `expired`
  case `accepted`
  case `pending`
  case `revoked`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`expired`: return "expired"
    case .`accepted`: return "accepted"
    case .`pending`: return "pending"
    case .`revoked`: return "revoked"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "expired": self = .`expired`
    case "accepted": self = .`accepted`
    case "pending": self = .`pending`
    case "revoked": self = .`revoked`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationInvitationStatus { .init(rawValue: try value.string()) }
}

/// An interface that describes the response of a method that returns a paginated list of resources.
///
/// > [!TIP]
/// > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
public struct ClerkPaginatedResponseOrganizationInvitation: Hashable, Sendable {
  public let `data`: [OrganizationInvitation]
  public let `totalCount`: Double
  public init(`data`: [OrganizationInvitation], `totalCount`: Double) {
    self.`data` = `data`
    self.`totalCount` = `totalCount`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "data": .array(try self.`data`.map { value in try value.encode() }),
      "total_count": .number(self.`totalCount`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkPaginatedResponseOrganizationInvitation {
    let values = try value.object()

    return try ClerkPaginatedResponseOrganizationInvitation(`data`: try (values["data"] ?? .undefined).array().map { value in try OrganizationInvitation.decode(value, in: runtime) }, `totalCount`: try (values["total_count"] ?? .undefined).number())
  }
}

/// The `OrganizationInvitation` object is the model around [an invitation to join an Organization](https://clerk.com/docs/guides/organizations/add-members/invitations).
public struct OrganizationInvitationState: Hashable, Sendable {
  public let `id`: String
  public let `emailAddress`: String
  public let `organizationId`: String
  public let `publicMetadata`: [String: JSONValue]
  public let `role`: String
  public let `roleName`: String
  public let `status`: OrganizationInvitationStatus
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`id`: String, `emailAddress`: String, `organizationId`: String, `publicMetadata`: [String: JSONValue], `role`: String, `roleName`: String, `status`: OrganizationInvitationStatus, `createdAt`: Date, `updatedAt`: Date) {
    self.`id` = `id`
    self.`emailAddress` = `emailAddress`
    self.`organizationId` = `organizationId`
    self.`publicMetadata` = `publicMetadata`
    self.`role` = `role`
    self.`roleName` = `roleName`
    self.`status` = `status`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "emailAddress": .string(self.`emailAddress`),
      "organizationId": .string(self.`organizationId`),
      "publicMetadata": .object(self.`publicMetadata`),
      "role": .string(self.`role`),
      "roleName": .string(self.`roleName`),
      "status": try self.`status`.encode(),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationInvitationState {
    let values = try value.object()

    return try OrganizationInvitationState(`id`: try (values["id"] ?? .undefined).string(), `emailAddress`: try (values["emailAddress"] ?? .undefined).string(), `organizationId`: try (values["organizationId"] ?? .undefined).string(), `publicMetadata`: try (values["publicMetadata"] ?? .undefined).object(), `role`: try (values["role"] ?? .undefined).string(), `roleName`: try (values["roleName"] ?? .undefined).string(), `status`: try OrganizationInvitationStatus.decode((values["status"] ?? .undefined), in: runtime), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class OrganizationInvitation: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: OrganizationInvitationState { context.state(handle, as: OrganizationInvitationState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `emailAddress`: String { state.`emailAddress` }
  public var `organizationId`: String { state.`organizationId` }
  public var `publicMetadata`: [String: JSONValue] { state.`publicMetadata` }
  public var `role`: String { state.`role` }
  public var `roleName`: String { state.`roleName` }
  public var `status`: OrganizationInvitationStatus { state.`status` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try OrganizationInvitationState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationInvitation { try runtime.resource(ResourceHandle.decodeReference(value), as: OrganizationInvitation.self) }
  /// Revokes the invitation so it can no longer be accepted.
  public func `revoke`() async throws -> OrganizationInvitation {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationInvitation.revoke", arguments: []) { result in
      return try OrganizationInvitation.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> OrganizationInvitation {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationInvitation.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try OrganizationInvitation.decode(result, in: runtime)
    }
  }
}

public struct GetRolesParams: Hashable, Sendable {
  public let `initialPage`: Double?
  public let `pageSize`: Double?
  public init(`initialPage`: Double? = nil, `pageSize`: Double? = nil) {
    self.`initialPage` = `initialPage`
    self.`pageSize` = `pageSize`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "initialPage": try self.`initialPage`.map { value in .number(value) } ?? .undefined,
      "pageSize": try self.`pageSize`.map { value in .number(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetRolesParams {
    let values = try value.object()

    return try GetRolesParams(`initialPage`: try (values["initialPage"] ?? .undefined).optional { value in try value.number() }, `pageSize`: try (values["pageSize"] ?? .undefined).optional { value in try value.number() })
  }
}

public struct GetRolesResponse: Hashable, Sendable {
  public let `hasRoleSetMigration`: Bool?
  public let `data`: [Role]
  public let `totalCount`: Double
  public init(`hasRoleSetMigration`: Bool? = nil, `data`: [Role], `totalCount`: Double) {
    self.`hasRoleSetMigration` = `hasRoleSetMigration`
    self.`data` = `data`
    self.`totalCount` = `totalCount`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "has_role_set_migration": try self.`hasRoleSetMigration`.map { value in .bool(value) } ?? .undefined,
      "data": .array(try self.`data`.map { value in try value.encode() }),
      "total_count": .number(self.`totalCount`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetRolesResponse {
    let values = try value.object()

    return try GetRolesResponse(`hasRoleSetMigration`: try (values["has_role_set_migration"] ?? .undefined).optional { value in try value.bool() }, `data`: try (values["data"] ?? .undefined).array().map { value in try Role.decode(value, in: runtime) }, `totalCount`: try (values["total_count"] ?? .undefined).number())
  }
}

public struct RoleState: Hashable, Sendable {
  public let `id`: String
  public let `key`: String
  public let `name`: String
  public let `description`: String
  public let `permissions`: [Permission]
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`id`: String, `key`: String, `name`: String, `description`: String, `permissions`: [Permission], `createdAt`: Date, `updatedAt`: Date) {
    self.`id` = `id`
    self.`key` = `key`
    self.`name` = `name`
    self.`description` = `description`
    self.`permissions` = `permissions`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "key": .string(self.`key`),
      "name": .string(self.`name`),
      "description": .string(self.`description`),
      "permissions": .array(try self.`permissions`.map { value in try value.encode() }),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> RoleState {
    let values = try value.object()

    return try RoleState(`id`: try (values["id"] ?? .undefined).string(), `key`: try (values["key"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).string(), `description`: try (values["description"] ?? .undefined).string(), `permissions`: try (values["permissions"] ?? .undefined).array().map { value in try Permission.decode(value, in: runtime) }, `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class Role: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: RoleState { context.state(handle, as: RoleState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `key`: String { state.`key` }
  public var `name`: String { state.`name` }
  public var `description`: String { state.`description` }
  public var `permissions`: [Permission] { state.`permissions` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try RoleState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Role { try runtime.resource(ResourceHandle.decodeReference(value), as: Role.self) }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> Role {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Role.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try Role.decode(result, in: runtime)
    }
  }
}

public struct PermissionState: Hashable, Sendable {
  public let `id`: String
  public let `key`: String
  public let `name`: String
  public let `type`: PermissionType
  public let `description`: String
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`id`: String, `key`: String, `name`: String, `type`: PermissionType, `description`: String, `createdAt`: Date, `updatedAt`: Date) {
    self.`id` = `id`
    self.`key` = `key`
    self.`name` = `name`
    self.`type` = `type`
    self.`description` = `description`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "key": .string(self.`key`),
      "name": .string(self.`name`),
      "type": try self.`type`.encode(),
      "description": .string(self.`description`),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PermissionState {
    let values = try value.object()

    return try PermissionState(`id`: try (values["id"] ?? .undefined).string(), `key`: try (values["key"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).string(), `type`: try PermissionType.decode((values["type"] ?? .undefined), in: runtime), `description`: try (values["description"] ?? .undefined).string(), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class Permission: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: PermissionState { context.state(handle, as: PermissionState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `key`: String { state.`key` }
  public var `name`: String { state.`name` }
  public var `type`: PermissionType { state.`type` }
  public var `description`: String { state.`description` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try PermissionState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Permission { try runtime.resource(ResourceHandle.decodeReference(value), as: Permission.self) }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> Permission {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Permission.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try Permission.decode(result, in: runtime)
    }
  }
}

public enum PermissionType: Hashable, Sendable {
  case `user`
  case `system`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`user`: return "user"
    case .`system`: return "system"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "user": self = .`user`
    case "system": self = .`system`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PermissionType { .init(rawValue: try value.string()) }
}

public struct GetDomainsParams: Hashable, Sendable {
  public let `initialPage`: Double?
  public let `pageSize`: Double?
  public let `enrollmentMode`: OrganizationEnrollmentMode?
  public init(`initialPage`: Double? = nil, `pageSize`: Double? = nil, `enrollmentMode`: OrganizationEnrollmentMode? = nil) {
    self.`initialPage` = `initialPage`
    self.`pageSize` = `pageSize`
    self.`enrollmentMode` = `enrollmentMode`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "initialPage": try self.`initialPage`.map { value in .number(value) } ?? .undefined,
      "pageSize": try self.`pageSize`.map { value in .number(value) } ?? .undefined,
      "enrollmentMode": try self.`enrollmentMode`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetDomainsParams {
    let values = try value.object()

    return try GetDomainsParams(`initialPage`: try (values["initialPage"] ?? .undefined).optional { value in try value.number() }, `pageSize`: try (values["pageSize"] ?? .undefined).optional { value in try value.number() }, `enrollmentMode`: try (values["enrollmentMode"] ?? .undefined).optional { value in try OrganizationEnrollmentMode.decode(value, in: runtime) })
  }
}

public enum OrganizationEnrollmentMode: Hashable, Sendable {
  case `enterpriseSso`
  case `manualInvitation`
  case `automaticInvitation`
  case `automaticSuggestion`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`enterpriseSso`: return "enterprise_sso"
    case .`manualInvitation`: return "manual_invitation"
    case .`automaticInvitation`: return "automatic_invitation"
    case .`automaticSuggestion`: return "automatic_suggestion"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "enterprise_sso": self = .`enterpriseSso`
    case "manual_invitation": self = .`manualInvitation`
    case "automatic_invitation": self = .`automaticInvitation`
    case "automatic_suggestion": self = .`automaticSuggestion`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationEnrollmentMode { .init(rawValue: try value.string()) }
}

/// An interface that describes the response of a method that returns a paginated list of resources.
///
/// > [!TIP]
/// > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
public struct ClerkPaginatedResponseOrganizationDomain: Hashable, Sendable {
  public let `data`: [OrganizationDomain]
  public let `totalCount`: Double
  public init(`data`: [OrganizationDomain], `totalCount`: Double) {
    self.`data` = `data`
    self.`totalCount` = `totalCount`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "data": .array(try self.`data`.map { value in try value.encode() }),
      "total_count": .number(self.`totalCount`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkPaginatedResponseOrganizationDomain {
    let values = try value.object()

    return try ClerkPaginatedResponseOrganizationDomain(`data`: try (values["data"] ?? .undefined).array().map { value in try OrganizationDomain.decode(value, in: runtime) }, `totalCount`: try (values["total_count"] ?? .undefined).number())
  }
}

/// The `OrganizationDomain` object is the model around an Organization's [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains).
public struct OrganizationDomainState: Hashable, Sendable {
  public let `id`: String
  public let `name`: String
  public let `organizationId`: String
  public let `enrollmentMode`: OrganizationEnrollmentMode
  public let `verification`: OrganizationDomainVerification?
  public let `affiliationVerification`: OrganizationDomainVerification?
  public let `ownershipVerification`: OrganizationDomainOwnershipVerification?
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public let `affiliationEmailAddress`: String?
  public let `totalPendingInvitations`: Double
  public let `totalPendingSuggestions`: Double
  public init(`id`: String, `name`: String, `organizationId`: String, `enrollmentMode`: OrganizationEnrollmentMode, `verification`: OrganizationDomainVerification?, `affiliationVerification`: OrganizationDomainVerification?, `ownershipVerification`: OrganizationDomainOwnershipVerification?, `createdAt`: Date, `updatedAt`: Date, `affiliationEmailAddress`: String?, `totalPendingInvitations`: Double, `totalPendingSuggestions`: Double) {
    self.`id` = `id`
    self.`name` = `name`
    self.`organizationId` = `organizationId`
    self.`enrollmentMode` = `enrollmentMode`
    self.`verification` = `verification`
    self.`affiliationVerification` = `affiliationVerification`
    self.`ownershipVerification` = `ownershipVerification`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
    self.`affiliationEmailAddress` = `affiliationEmailAddress`
    self.`totalPendingInvitations` = `totalPendingInvitations`
    self.`totalPendingSuggestions` = `totalPendingSuggestions`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "name": .string(self.`name`),
      "organizationId": .string(self.`organizationId`),
      "enrollmentMode": try self.`enrollmentMode`.encode(),
      "verification": try self.`verification`.map { value in try value.encode() } ?? .null,
      "affiliationVerification": try self.`affiliationVerification`.map { value in try value.encode() } ?? .null,
      "ownershipVerification": try self.`ownershipVerification`.map { value in try value.encode() } ?? .null,
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "affiliationEmailAddress": try self.`affiliationEmailAddress`.map { value in .string(value) } ?? .null,
      "totalPendingInvitations": .number(self.`totalPendingInvitations`),
      "totalPendingSuggestions": .number(self.`totalPendingSuggestions`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationDomainState {
    let values = try value.object()

    return try OrganizationDomainState(`id`: try (values["id"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).string(), `organizationId`: try (values["organizationId"] ?? .undefined).string(), `enrollmentMode`: try OrganizationEnrollmentMode.decode((values["enrollmentMode"] ?? .undefined), in: runtime), `verification`: try (values["verification"] ?? .undefined).optional { value in try OrganizationDomainVerification.decode(value, in: runtime) }, `affiliationVerification`: try (values["affiliationVerification"] ?? .undefined).optional { value in try OrganizationDomainVerification.decode(value, in: runtime) }, `ownershipVerification`: try (values["ownershipVerification"] ?? .undefined).optional { value in try OrganizationDomainOwnershipVerification.decode(value, in: runtime) }, `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date(), `affiliationEmailAddress`: try (values["affiliationEmailAddress"] ?? .undefined).optional { value in try value.string() }, `totalPendingInvitations`: try (values["totalPendingInvitations"] ?? .undefined).number(), `totalPendingSuggestions`: try (values["totalPendingSuggestions"] ?? .undefined).number())
  }
}
@MainActor @Observable public final class OrganizationDomain: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: OrganizationDomainState { context.state(handle, as: OrganizationDomainState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `name`: String { state.`name` }
  public var `organizationId`: String { state.`organizationId` }
  public var `enrollmentMode`: OrganizationEnrollmentMode { state.`enrollmentMode` }
  public var `verification`: OrganizationDomainVerification? { state.`verification` }
  public var `affiliationVerification`: OrganizationDomainVerification? { state.`affiliationVerification` }
  public var `ownershipVerification`: OrganizationDomainOwnershipVerification? { state.`ownershipVerification` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public var `affiliationEmailAddress`: String? { state.`affiliationEmailAddress` }
  public var `totalPendingInvitations`: Double { state.`totalPendingInvitations` }
  public var `totalPendingSuggestions`: Double { state.`totalPendingSuggestions` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try OrganizationDomainState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationDomain { try runtime.resource(ResourceHandle.decodeReference(value), as: OrganizationDomain.self) }
  /// Begins the verification process of a created Organization domain by sending a verification code to the provided email address.
  public func `prepareAffiliationVerification`(_ `params`: PrepareAffiliationVerificationParams) async throws -> OrganizationDomain {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationDomain.prepareAffiliationVerification", arguments: [try `params`.encode()]) { result in
      return try OrganizationDomain.decode(result, in: runtime)
    }
  }
  /// Completes the verification process started by [`prepareAffiliationVerification()`](https://clerk.com/docs/reference/types/organization-domain-resource#prepare-affiliation-verification), by validating the provided verification code.
  public func `attemptAffiliationVerification`(_ `params`: AttemptAffiliationVerificationParams) async throws -> OrganizationDomain {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationDomain.attemptAffiliationVerification", arguments: [try `params`.encode()]) { result in
      return try OrganizationDomain.decode(result, in: runtime)
    }
  }
  /// Deletes the Verified Domain.
  public func `delete`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationDomain.delete", arguments: []) { result in
      _ = result
    }
  }
  /// Updates the enrollment mode of the Verified Domain.
  public func `updateEnrollmentMode`(_ `params`: UpdateEnrollmentModeParams) async throws -> OrganizationDomain {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationDomain.updateEnrollmentMode", arguments: [try `params`.encode()]) { result in
      return try OrganizationDomain.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> OrganizationDomain {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationDomain.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try OrganizationDomain.decode(result, in: runtime)
    }
  }
}

/// The `OrganizationDomainVerification` object holds the affiliation verification details of an Organization's [Verified Domain](/docs/guides/organizations/add-members/verified-domains). Affiliation proves that the current user controls an email address that belongs to the domain.
public struct OrganizationDomainVerification: Hashable, Sendable {
  public let `status`: OrganizationDomainVerificationStatus
  public var `strategy`: String { "email_code" }
  public let `attempts`: Double
  public let `expiresAt`: Date
  public init(`status`: OrganizationDomainVerificationStatus, `attempts`: Double, `expiresAt`: Date) {
    self.`status` = `status`
    self.`attempts` = `attempts`
    self.`expiresAt` = `expiresAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "status": try self.`status`.encode(),
      "strategy": .string("email_code"),
      "attempts": .number(self.`attempts`),
      "expiresAt": .string(self.`expiresAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationDomainVerification {
    let values = try value.object()
    guard values["strategy"] == .string("email_code") else { throw CoreError.invalidValue }
    return try OrganizationDomainVerification(`status`: try OrganizationDomainVerificationStatus.decode((values["status"] ?? .undefined), in: runtime), `attempts`: try (values["attempts"] ?? .undefined).number(), `expiresAt`: try (values["expiresAt"] ?? .undefined).date())
  }
}

/// The current status of an Organization domain verification.
///
/// <ul>
///  <li>`unverified`: Verification has not been completed yet. An attempt may be pending.</li>
///  <li>`verified`: Verification has been completed.</li>
///  <li>`failed`: Too many verification attempts were made without success.</li>
///  <li>`expired`: The pending verification attempt expired before it could be completed.</li>
/// </ul>
public enum OrganizationDomainVerificationStatus: Hashable, Sendable {
  case `unverified`
  case `verified`
  case `failed`
  case `expired`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`unverified`: return "unverified"
    case .`verified`: return "verified"
    case .`failed`: return "failed"
    case .`expired`: return "expired"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "unverified": self = .`unverified`
    case "verified": self = .`verified`
    case "failed": self = .`failed`
    case "expired": self = .`expired`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationDomainVerificationStatus { .init(rawValue: try value.string()) }
}

/// Holds the ownership verification details of an Organization's [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains). Ownership proves control of the underlying DNS domain, typically by publishing a TXT record, and is required before the domain can be used for enterprise SSO.
public struct OrganizationDomainOwnershipVerification: Hashable, Sendable {
  public let `status`: OrganizationDomainOwnershipVerificationStatus
  public let `strategy`: OrganizationDomainOwnershipVerificationStrategy
  public let `attempts`: Double?
  public let `expiresAt`: Date?
  public let `verifiedAt`: Date?
  public let `txtRecordName`: String?
  public let `txtRecordValue`: String?
  public init(`status`: OrganizationDomainOwnershipVerificationStatus, `strategy`: OrganizationDomainOwnershipVerificationStrategy, `attempts`: Double?, `expiresAt`: Date?, `verifiedAt`: Date?, `txtRecordName`: String?, `txtRecordValue`: String?) {
    self.`status` = `status`
    self.`strategy` = `strategy`
    self.`attempts` = `attempts`
    self.`expiresAt` = `expiresAt`
    self.`verifiedAt` = `verifiedAt`
    self.`txtRecordName` = `txtRecordName`
    self.`txtRecordValue` = `txtRecordValue`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "status": try self.`status`.encode(),
      "strategy": try self.`strategy`.encode(),
      "attempts": try self.`attempts`.map { value in .number(value) } ?? .null,
      "expiresAt": try self.`expiresAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "verifiedAt": try self.`verifiedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "txtRecordName": try self.`txtRecordName`.map { value in .string(value) } ?? .null,
      "txtRecordValue": try self.`txtRecordValue`.map { value in .string(value) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationDomainOwnershipVerification {
    let values = try value.object()

    return try OrganizationDomainOwnershipVerification(`status`: try OrganizationDomainOwnershipVerificationStatus.decode((values["status"] ?? .undefined), in: runtime), `strategy`: try OrganizationDomainOwnershipVerificationStrategy.decode((values["strategy"] ?? .undefined), in: runtime), `attempts`: try (values["attempts"] ?? .undefined).optional { value in try value.number() }, `expiresAt`: try (values["expiresAt"] ?? .undefined).optional { value in try value.date() }, `verifiedAt`: try (values["verifiedAt"] ?? .undefined).optional { value in try value.date() }, `txtRecordName`: try (values["txtRecordName"] ?? .undefined).optional { value in try value.string() }, `txtRecordValue`: try (values["txtRecordValue"] ?? .undefined).optional { value in try value.string() })
  }
}

/// The current status of an Organization domain ownership verification.
///
/// <ul>
///  <li>`unverified`: Ownership has not been established yet. A TXT challenge is pending.</li>
///  <li>`verified`: Ownership has been verified.</li>
///  <li>`expired`: The pending ownership verification attempt expired before ownership could be confirmed. A new TXT challenge must be issued (via `prepareOwnershipVerification()`) to retry.</li>
/// </ul>
public enum OrganizationDomainOwnershipVerificationStatus: Hashable, Sendable {
  case `unverified`
  case `verified`
  case `expired`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`unverified`: return "unverified"
    case .`verified`: return "verified"
    case .`expired`: return "expired"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "unverified": self = .`unverified`
    case "verified": self = .`verified`
    case "expired": self = .`expired`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationDomainOwnershipVerificationStatus { .init(rawValue: try value.string()) }
}

/// The strategy used to verify ownership of an Organization's domain.
public enum OrganizationDomainOwnershipVerificationStrategy: Hashable, Sendable {
  case `txt`
  case `legacy`
  case `manualOverride`
  case `parentDomain`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`txt`: return "txt"
    case .`legacy`: return "legacy"
    case .`manualOverride`: return "manual_override"
    case .`parentDomain`: return "parent_domain"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "txt": self = .`txt`
    case "legacy": self = .`legacy`
    case "manual_override": self = .`manualOverride`
    case "parent_domain": self = .`parentDomain`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationDomainOwnershipVerificationStrategy { .init(rawValue: try value.string()) }
}

public struct PrepareAffiliationVerificationParams: Hashable, Sendable {
  public let `affiliationEmailAddress`: String
  public init(`affiliationEmailAddress`: String) {
    self.`affiliationEmailAddress` = `affiliationEmailAddress`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "affiliationEmailAddress": .string(self.`affiliationEmailAddress`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PrepareAffiliationVerificationParams {
    let values = try value.object()

    return try PrepareAffiliationVerificationParams(`affiliationEmailAddress`: try (values["affiliationEmailAddress"] ?? .undefined).string())
  }
}

public struct AttemptAffiliationVerificationParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AttemptAffiliationVerificationParams {
    let values = try value.object()

    return try AttemptAffiliationVerificationParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct UpdateEnrollmentModeParams: Hashable, Sendable {
  public let `enrollmentMode`: OrganizationEnrollmentMode
  public let `deletePending`: Bool?
  public init(`enrollmentMode`: OrganizationEnrollmentMode, `deletePending`: Bool? = nil) {
    self.`enrollmentMode` = `enrollmentMode`
    self.`deletePending` = `deletePending`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enrollmentMode": try self.`enrollmentMode`.encode(),
      "deletePending": try self.`deletePending`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UpdateEnrollmentModeParams {
    let values = try value.object()

    return try UpdateEnrollmentModeParams(`enrollmentMode`: try OrganizationEnrollmentMode.decode((values["enrollmentMode"] ?? .undefined), in: runtime), `deletePending`: try (values["deletePending"] ?? .undefined).optional { value in try value.bool() })
  }
}

public struct GetMembershipRequestParams: Hashable, Sendable {
  public let `initialPage`: Double?
  public let `pageSize`: Double?
  public let `status`: OrganizationInvitationStatus?
  public init(`initialPage`: Double? = nil, `pageSize`: Double? = nil, `status`: OrganizationInvitationStatus? = nil) {
    self.`initialPage` = `initialPage`
    self.`pageSize` = `pageSize`
    self.`status` = `status`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "initialPage": try self.`initialPage`.map { value in .number(value) } ?? .undefined,
      "pageSize": try self.`pageSize`.map { value in .number(value) } ?? .undefined,
      "status": try self.`status`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetMembershipRequestParams {
    let values = try value.object()

    return try GetMembershipRequestParams(`initialPage`: try (values["initialPage"] ?? .undefined).optional { value in try value.number() }, `pageSize`: try (values["pageSize"] ?? .undefined).optional { value in try value.number() }, `status`: try (values["status"] ?? .undefined).optional { value in try OrganizationInvitationStatus.decode(value, in: runtime) })
  }
}

/// An interface that describes the response of a method that returns a paginated list of resources.
///
/// > [!TIP]
/// > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
public struct ClerkPaginatedResponseOrganizationMembershipRequest: Hashable, Sendable {
  public let `data`: [OrganizationMembershipRequest]
  public let `totalCount`: Double
  public init(`data`: [OrganizationMembershipRequest], `totalCount`: Double) {
    self.`data` = `data`
    self.`totalCount` = `totalCount`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "data": .array(try self.`data`.map { value in try value.encode() }),
      "total_count": .number(self.`totalCount`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkPaginatedResponseOrganizationMembershipRequest {
    let values = try value.object()

    return try ClerkPaginatedResponseOrganizationMembershipRequest(`data`: try (values["data"] ?? .undefined).array().map { value in try OrganizationMembershipRequest.decode(value, in: runtime) }, `totalCount`: try (values["total_count"] ?? .undefined).number())
  }
}

/// The `OrganizationMembershipRequest` object is the model that describes [the request of a user to join an Organization](https://clerk.com/docs/guides/organizations/add-members/verified-domains#membership-requests).
public struct OrganizationMembershipRequestState: Hashable, Sendable {
  public let `id`: String
  public let `organizationId`: String
  public let `status`: OrganizationInvitationStatus
  public let `publicUserData`: PublicUserData
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`id`: String, `organizationId`: String, `status`: OrganizationInvitationStatus, `publicUserData`: PublicUserData, `createdAt`: Date, `updatedAt`: Date) {
    self.`id` = `id`
    self.`organizationId` = `organizationId`
    self.`status` = `status`
    self.`publicUserData` = `publicUserData`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "organizationId": .string(self.`organizationId`),
      "status": try self.`status`.encode(),
      "publicUserData": try self.`publicUserData`.encode(),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationMembershipRequestState {
    let values = try value.object()

    return try OrganizationMembershipRequestState(`id`: try (values["id"] ?? .undefined).string(), `organizationId`: try (values["organizationId"] ?? .undefined).string(), `status`: try OrganizationInvitationStatus.decode((values["status"] ?? .undefined), in: runtime), `publicUserData`: try PublicUserData.decode((values["publicUserData"] ?? .undefined), in: runtime), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class OrganizationMembershipRequest: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: OrganizationMembershipRequestState { context.state(handle, as: OrganizationMembershipRequestState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `organizationId`: String { state.`organizationId` }
  public var `status`: OrganizationInvitationStatus { state.`status` }
  public var `publicUserData`: PublicUserData { state.`publicUserData` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try OrganizationMembershipRequestState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationMembershipRequest { try runtime.resource(ResourceHandle.decodeReference(value), as: OrganizationMembershipRequest.self) }
  /// Accepts the Membership Request, adding the user to the Organization.
  public func `accept`() async throws -> OrganizationMembershipRequest {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationMembershipRequest.accept", arguments: []) { result in
      return try OrganizationMembershipRequest.decode(result, in: runtime)
    }
  }
  /// Rejects the Membership Request, declining the user's request to join the Organization.
  public func `reject`() async throws -> OrganizationMembershipRequest {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationMembershipRequest.reject", arguments: []) { result in
      return try OrganizationMembershipRequest.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> OrganizationMembershipRequest {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationMembershipRequest.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try OrganizationMembershipRequest.decode(result, in: runtime)
    }
  }
}

public struct AddMemberParams: Hashable, Sendable {
  public let `userId`: String
  public let `role`: String
  public init(`userId`: String, `role`: String) {
    self.`userId` = `userId`
    self.`role` = `role`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "userId": .string(self.`userId`),
      "role": .string(self.`role`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AddMemberParams {
    let values = try value.object()

    return try AddMemberParams(`userId`: try (values["userId"] ?? .undefined).string(), `role`: try (values["role"] ?? .undefined).string())
  }
}

public struct InviteMemberParams: Hashable, Sendable {
  public let `emailAddress`: String
  public let `role`: String
  public init(`emailAddress`: String, `role`: String) {
    self.`emailAddress` = `emailAddress`
    self.`role` = `role`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddress": .string(self.`emailAddress`),
      "role": .string(self.`role`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> InviteMemberParams {
    let values = try value.object()

    return try InviteMemberParams(`emailAddress`: try (values["emailAddress"] ?? .undefined).string(), `role`: try (values["role"] ?? .undefined).string())
  }
}

public struct InviteMembersParams: Hashable, Sendable {
  public let `emailAddresses`: [String]
  public let `role`: String
  public init(`emailAddresses`: [String], `role`: String) {
    self.`emailAddresses` = `emailAddresses`
    self.`role` = `role`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddresses": .array(try self.`emailAddresses`.map { value in .string(value) }),
      "role": .string(self.`role`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> InviteMembersParams {
    let values = try value.object()

    return try InviteMembersParams(`emailAddresses`: try (values["emailAddresses"] ?? .undefined).array().map { value in try value.string() }, `role`: try (values["role"] ?? .undefined).string())
  }
}

public struct UpdateMembershipParams: Hashable, Sendable {
  public let `userId`: String
  public let `role`: String
  public init(`userId`: String, `role`: String) {
    self.`userId` = `userId`
    self.`role` = `role`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "userId": .string(self.`userId`),
      "role": .string(self.`role`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UpdateMembershipParams {
    let values = try value.object()

    return try UpdateMembershipParams(`userId`: try (values["userId"] ?? .undefined).string(), `role`: try (values["role"] ?? .undefined).string())
  }
}

/// From T, pick a set of properties whose keys are in the union K
public struct PickCreateOrganizationDomainParamsAndenrollmentMode: Hashable, Sendable {
  public let `enrollmentMode`: OrganizationEnrollmentMode?
  public init(`enrollmentMode`: OrganizationEnrollmentMode? = nil) {
    self.`enrollmentMode` = `enrollmentMode`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enrollmentMode": try self.`enrollmentMode`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PickCreateOrganizationDomainParamsAndenrollmentMode {
    let values = try value.object()

    return try PickCreateOrganizationDomainParamsAndenrollmentMode(`enrollmentMode`: try (values["enrollmentMode"] ?? .undefined).optional { value in try OrganizationEnrollmentMode.decode(value, in: runtime) })
  }
}

/// The `OrganizationDomainsBulkOwnershipVerificationResource` object is the result of a bulk ownership verification flow, such as [`prepareOwnershipVerification()`](https://clerk.com/docs/reference/objects/organization#prepare-ownership-verification) or [`attemptOwnershipVerification()`](https://clerk.com/docs/reference/objects/organization#attempt-ownership-verification), where ownership is verified for several of an Organization's [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) at once. Because the operation can partially succeed, each requested domain is reported in either `data` or `errors`.
public struct OrganizationDomainsBulkOwnershipVerification: Hashable, Sendable {
  public let `data`: [OrganizationDomain]
  public let `errors`: [OrganizationDomainBulkOwnershipVerificationError]
  public init(`data`: [OrganizationDomain], `errors`: [OrganizationDomainBulkOwnershipVerificationError]) {
    self.`data` = `data`
    self.`errors` = `errors`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "data": .array(try self.`data`.map { value in try value.encode() }),
      "errors": .array(try self.`errors`.map { value in try value.encode() })
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationDomainsBulkOwnershipVerification {
    let values = try value.object()

    return try OrganizationDomainsBulkOwnershipVerification(`data`: try (values["data"] ?? .undefined).array().map { value in try OrganizationDomain.decode(value, in: runtime) }, `errors`: try (values["errors"] ?? .undefined).array().map { value in try OrganizationDomainBulkOwnershipVerificationError.decode(value, in: runtime) })
  }
}

public struct OrganizationDomainBulkOwnershipVerificationError: Hashable, Sendable {
  public let `id`: String
  public let `code`: String
  public init(`id`: String, `code`: String) {
    self.`id` = `id`
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationDomainBulkOwnershipVerificationError {
    let values = try value.object()

    return try OrganizationDomainBulkOwnershipVerificationError(`id`: try (values["id"] ?? .undefined).string(), `code`: try (values["code"] ?? .undefined).string())
  }
}

public struct OrganizationGetDomain__0: Hashable, Sendable {
  public let `domainId`: String
  public init(`domainId`: String) {
    self.`domainId` = `domainId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "domainId": .string(self.`domainId`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationGetDomain__0 {
    let values = try value.object()

    return try OrganizationGetDomain__0(`domainId`: try (values["domainId"] ?? .undefined).string())
  }
}

public struct GetEnterpriseConnectionsParams: Hashable, Sendable {
  public let `withOrganizationAccountLinking`: Bool?
  public init(`withOrganizationAccountLinking`: Bool? = nil) {
    self.`withOrganizationAccountLinking` = `withOrganizationAccountLinking`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "withOrganizationAccountLinking": try self.`withOrganizationAccountLinking`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetEnterpriseConnectionsParams {
    let values = try value.object()

    return try GetEnterpriseConnectionsParams(`withOrganizationAccountLinking`: try (values["withOrganizationAccountLinking"] ?? .undefined).optional { value in try value.bool() })
  }
}

public struct EnterpriseConnectionState: Hashable, Sendable {
  public let `id`: String
  public let `name`: String
  public let `active`: Bool
  public let `provider`: String
  public let `logoPublicUrl`: String?
  public let `domains`: [String]
  public let `organizationId`: String?
  public let `syncUserAttributes`: Bool
  public let `disableAdditionalIdentifications`: Bool
  public let `allowOrganizationAccountLinking`: Bool
  public let `customAttributes`: [JSONValue]
  public let `oauthConfig`: EnterpriseOAuthConfig?
  public let `samlConnection`: EnterpriseSamlConnectionNested?
  public let `createdAt`: Date?
  public let `updatedAt`: Date?
  public init(`id`: String, `name`: String, `active`: Bool, `provider`: String, `logoPublicUrl`: String?, `domains`: [String], `organizationId`: String?, `syncUserAttributes`: Bool, `disableAdditionalIdentifications`: Bool, `allowOrganizationAccountLinking`: Bool, `customAttributes`: [JSONValue], `oauthConfig`: EnterpriseOAuthConfig?, `samlConnection`: EnterpriseSamlConnectionNested?, `createdAt`: Date?, `updatedAt`: Date?) {
    self.`id` = `id`
    self.`name` = `name`
    self.`active` = `active`
    self.`provider` = `provider`
    self.`logoPublicUrl` = `logoPublicUrl`
    self.`domains` = `domains`
    self.`organizationId` = `organizationId`
    self.`syncUserAttributes` = `syncUserAttributes`
    self.`disableAdditionalIdentifications` = `disableAdditionalIdentifications`
    self.`allowOrganizationAccountLinking` = `allowOrganizationAccountLinking`
    self.`customAttributes` = `customAttributes`
    self.`oauthConfig` = `oauthConfig`
    self.`samlConnection` = `samlConnection`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "name": .string(self.`name`),
      "active": .bool(self.`active`),
      "provider": .string(self.`provider`),
      "logoPublicUrl": try self.`logoPublicUrl`.map { value in .string(value) } ?? .null,
      "domains": .array(try self.`domains`.map { value in .string(value) }),
      "organizationId": try self.`organizationId`.map { value in .string(value) } ?? .null,
      "syncUserAttributes": .bool(self.`syncUserAttributes`),
      "disableAdditionalIdentifications": .bool(self.`disableAdditionalIdentifications`),
      "allowOrganizationAccountLinking": .bool(self.`allowOrganizationAccountLinking`),
      "customAttributes": .array(try self.`customAttributes`.map { value in value }),
      "oauthConfig": try self.`oauthConfig`.map { value in try value.encode() } ?? .null,
      "samlConnection": try self.`samlConnection`.map { value in try value.encode() } ?? .null,
      "createdAt": try self.`createdAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "updatedAt": try self.`updatedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnectionState {
    let values = try value.object()

    return try EnterpriseConnectionState(`id`: try (values["id"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).string(), `active`: try (values["active"] ?? .undefined).bool(), `provider`: try (values["provider"] ?? .undefined).string(), `logoPublicUrl`: try (values["logoPublicUrl"] ?? .undefined).optional { value in try value.string() }, `domains`: try (values["domains"] ?? .undefined).array().map { value in try value.string() }, `organizationId`: try (values["organizationId"] ?? .undefined).optional { value in try value.string() }, `syncUserAttributes`: try (values["syncUserAttributes"] ?? .undefined).bool(), `disableAdditionalIdentifications`: try (values["disableAdditionalIdentifications"] ?? .undefined).bool(), `allowOrganizationAccountLinking`: try (values["allowOrganizationAccountLinking"] ?? .undefined).bool(), `customAttributes`: try (values["customAttributes"] ?? .undefined).array().map { value in value }, `oauthConfig`: try (values["oauthConfig"] ?? .undefined).optional { value in try EnterpriseOAuthConfig.decode(value, in: runtime) }, `samlConnection`: try (values["samlConnection"] ?? .undefined).optional { value in try EnterpriseSamlConnectionNested.decode(value, in: runtime) }, `createdAt`: try (values["createdAt"] ?? .undefined).optional { value in try value.date() }, `updatedAt`: try (values["updatedAt"] ?? .undefined).optional { value in try value.date() })
  }
}
@MainActor @Observable public final class EnterpriseConnection: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: EnterpriseConnectionState { context.state(handle, as: EnterpriseConnectionState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `name`: String { state.`name` }
  public var `active`: Bool { state.`active` }
  public var `provider`: String { state.`provider` }
  public var `logoPublicUrl`: String? { state.`logoPublicUrl` }
  public var `domains`: [String] { state.`domains` }
  public var `organizationId`: String? { state.`organizationId` }
  public var `syncUserAttributes`: Bool { state.`syncUserAttributes` }
  public var `disableAdditionalIdentifications`: Bool { state.`disableAdditionalIdentifications` }
  public var `allowOrganizationAccountLinking`: Bool { state.`allowOrganizationAccountLinking` }
  public var `customAttributes`: [JSONValue] { state.`customAttributes` }
  public var `oauthConfig`: EnterpriseOAuthConfig? { state.`oauthConfig` }
  public var `samlConnection`: EnterpriseSamlConnectionNested? { state.`samlConnection` }
  public var `createdAt`: Date? { state.`createdAt` }
  public var `updatedAt`: Date? { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try EnterpriseConnectionState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnection { try runtime.resource(ResourceHandle.decodeReference(value), as: EnterpriseConnection.self) }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> EnterpriseConnection {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EnterpriseConnection.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try EnterpriseConnection.decode(result, in: runtime)
    }
  }
}

public struct EnterpriseOAuthConfig: Hashable, Sendable {
  public let `id`: String
  public let `name`: String
  public let `clientId`: String
  public let `providerKey`: String?
  public let `redirectUri`: String?
  public let `discoveryUrl`: String?
  public let `authUrl`: String?
  public let `tokenUrl`: String?
  public let `userInfoUrl`: String?
  public let `logoPublicUrl`: Field<String>
  public let `requiresPkce`: Bool?
  public let `createdAt`: Date?
  public let `updatedAt`: Date?
  public init(`id`: String, `name`: String, `clientId`: String, `providerKey`: String? = nil, `redirectUri`: String? = nil, `discoveryUrl`: String? = nil, `authUrl`: String? = nil, `tokenUrl`: String? = nil, `userInfoUrl`: String? = nil, `logoPublicUrl`: Field<String> = .omitted, `requiresPkce`: Bool? = nil, `createdAt`: Date?, `updatedAt`: Date?) {
    self.`id` = `id`
    self.`name` = `name`
    self.`clientId` = `clientId`
    self.`providerKey` = `providerKey`
    self.`redirectUri` = `redirectUri`
    self.`discoveryUrl` = `discoveryUrl`
    self.`authUrl` = `authUrl`
    self.`tokenUrl` = `tokenUrl`
    self.`userInfoUrl` = `userInfoUrl`
    self.`logoPublicUrl` = `logoPublicUrl`
    self.`requiresPkce` = `requiresPkce`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "name": .string(self.`name`),
      "clientId": .string(self.`clientId`),
      "providerKey": try self.`providerKey`.map { value in .string(value) } ?? .undefined,
      "redirectUri": try self.`redirectUri`.map { value in .string(value) } ?? .undefined,
      "discoveryUrl": try self.`discoveryUrl`.map { value in .string(value) } ?? .undefined,
      "authUrl": try self.`authUrl`.map { value in .string(value) } ?? .undefined,
      "tokenUrl": try self.`tokenUrl`.map { value in .string(value) } ?? .undefined,
      "userInfoUrl": try self.`userInfoUrl`.map { value in .string(value) } ?? .undefined,
      "logoPublicUrl": try self.`logoPublicUrl`.encode { value in .string(value) },
      "requiresPkce": try self.`requiresPkce`.map { value in .bool(value) } ?? .undefined,
      "createdAt": try self.`createdAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "updatedAt": try self.`updatedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseOAuthConfig {
    let values = try value.object()

    return try EnterpriseOAuthConfig(`id`: try (values["id"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).string(), `clientId`: try (values["clientId"] ?? .undefined).string(), `providerKey`: try (values["providerKey"] ?? .undefined).optional { value in try value.string() }, `redirectUri`: try (values["redirectUri"] ?? .undefined).optional { value in try value.string() }, `discoveryUrl`: try (values["discoveryUrl"] ?? .undefined).optional { value in try value.string() }, `authUrl`: try (values["authUrl"] ?? .undefined).optional { value in try value.string() }, `tokenUrl`: try (values["tokenUrl"] ?? .undefined).optional { value in try value.string() }, `userInfoUrl`: try (values["userInfoUrl"] ?? .undefined).optional { value in try value.string() }, `logoPublicUrl`: try Field.decode((values["logoPublicUrl"] ?? .undefined)) { value in try value.string() }, `requiresPkce`: try (values["requiresPkce"] ?? .undefined).optional { value in try value.bool() }, `createdAt`: try (values["createdAt"] ?? .undefined).optional { value in try value.date() }, `updatedAt`: try (values["updatedAt"] ?? .undefined).optional { value in try value.date() })
  }
}

public struct EnterpriseSamlConnectionNested: Hashable, Sendable {
  public let `id`: String
  public let `name`: String
  public let `active`: Bool
  public let `idpEntityId`: String
  public let `idpSsoUrl`: String
  public let `idpCertificate`: String
  public let `idpCertificateIssuedAt`: Double
  public let `idpCertificateExpiresAt`: Double
  public let `idpMetadataUrl`: String
  public let `idpMetadata`: String
  public let `acsUrl`: String
  public let `spEntityId`: String
  public let `spMetadataUrl`: String
  public let `allowSubdomains`: Bool
  public let `allowIdpInitiated`: Bool
  public let `forceAuthn`: Bool
  public init(`id`: String, `name`: String, `active`: Bool, `idpEntityId`: String, `idpSsoUrl`: String, `idpCertificate`: String, `idpCertificateIssuedAt`: Double, `idpCertificateExpiresAt`: Double, `idpMetadataUrl`: String, `idpMetadata`: String, `acsUrl`: String, `spEntityId`: String, `spMetadataUrl`: String, `allowSubdomains`: Bool, `allowIdpInitiated`: Bool, `forceAuthn`: Bool) {
    self.`id` = `id`
    self.`name` = `name`
    self.`active` = `active`
    self.`idpEntityId` = `idpEntityId`
    self.`idpSsoUrl` = `idpSsoUrl`
    self.`idpCertificate` = `idpCertificate`
    self.`idpCertificateIssuedAt` = `idpCertificateIssuedAt`
    self.`idpCertificateExpiresAt` = `idpCertificateExpiresAt`
    self.`idpMetadataUrl` = `idpMetadataUrl`
    self.`idpMetadata` = `idpMetadata`
    self.`acsUrl` = `acsUrl`
    self.`spEntityId` = `spEntityId`
    self.`spMetadataUrl` = `spMetadataUrl`
    self.`allowSubdomains` = `allowSubdomains`
    self.`allowIdpInitiated` = `allowIdpInitiated`
    self.`forceAuthn` = `forceAuthn`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "name": .string(self.`name`),
      "active": .bool(self.`active`),
      "idpEntityId": .string(self.`idpEntityId`),
      "idpSsoUrl": .string(self.`idpSsoUrl`),
      "idpCertificate": .string(self.`idpCertificate`),
      "idpCertificateIssuedAt": .number(self.`idpCertificateIssuedAt`),
      "idpCertificateExpiresAt": .number(self.`idpCertificateExpiresAt`),
      "idpMetadataUrl": .string(self.`idpMetadataUrl`),
      "idpMetadata": .string(self.`idpMetadata`),
      "acsUrl": .string(self.`acsUrl`),
      "spEntityId": .string(self.`spEntityId`),
      "spMetadataUrl": .string(self.`spMetadataUrl`),
      "allowSubdomains": .bool(self.`allowSubdomains`),
      "allowIdpInitiated": .bool(self.`allowIdpInitiated`),
      "forceAuthn": .bool(self.`forceAuthn`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseSamlConnectionNested {
    let values = try value.object()

    return try EnterpriseSamlConnectionNested(`id`: try (values["id"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).string(), `active`: try (values["active"] ?? .undefined).bool(), `idpEntityId`: try (values["idpEntityId"] ?? .undefined).string(), `idpSsoUrl`: try (values["idpSsoUrl"] ?? .undefined).string(), `idpCertificate`: try (values["idpCertificate"] ?? .undefined).string(), `idpCertificateIssuedAt`: try (values["idpCertificateIssuedAt"] ?? .undefined).number(), `idpCertificateExpiresAt`: try (values["idpCertificateExpiresAt"] ?? .undefined).number(), `idpMetadataUrl`: try (values["idpMetadataUrl"] ?? .undefined).string(), `idpMetadata`: try (values["idpMetadata"] ?? .undefined).string(), `acsUrl`: try (values["acsUrl"] ?? .undefined).string(), `spEntityId`: try (values["spEntityId"] ?? .undefined).string(), `spMetadataUrl`: try (values["spMetadataUrl"] ?? .undefined).string(), `allowSubdomains`: try (values["allowSubdomains"] ?? .undefined).bool(), `allowIdpInitiated`: try (values["allowIdpInitiated"] ?? .undefined).bool(), `forceAuthn`: try (values["forceAuthn"] ?? .undefined).bool())
  }
}

public struct CreateOrganizationEnterpriseConnectionParams: Hashable, Sendable {
  public let `provider`: OrganizationEnterpriseConnectionProvider
  public let `name`: String?
  public let `domains`: [String]?
  public let `organizationId`: Field<String>
  public let `saml`: Field<OrganizationEnterpriseConnectionSamlInput>
  public let `oidc`: Field<OrganizationEnterpriseConnectionOidcInput>
  public init(`provider`: OrganizationEnterpriseConnectionProvider, `name`: String? = nil, `domains`: [String]? = nil, `organizationId`: Field<String> = .omitted, `saml`: Field<OrganizationEnterpriseConnectionSamlInput> = .omitted, `oidc`: Field<OrganizationEnterpriseConnectionOidcInput> = .omitted) {
    self.`provider` = `provider`
    self.`name` = `name`
    self.`domains` = `domains`
    self.`organizationId` = `organizationId`
    self.`saml` = `saml`
    self.`oidc` = `oidc`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "provider": try self.`provider`.encode(),
      "name": try self.`name`.map { value in .string(value) } ?? .undefined,
      "domains": try self.`domains`.map { value in .array(try value.map { value in .string(value) }) } ?? .undefined,
      "organizationId": try self.`organizationId`.encode { value in .string(value) },
      "saml": try self.`saml`.encode { value in try value.encode() },
      "oidc": try self.`oidc`.encode { value in try value.encode() }
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreateOrganizationEnterpriseConnectionParams {
    let values = try value.object()

    return try CreateOrganizationEnterpriseConnectionParams(`provider`: try OrganizationEnterpriseConnectionProvider.decode((values["provider"] ?? .undefined), in: runtime), `name`: try (values["name"] ?? .undefined).optional { value in try value.string() }, `domains`: try (values["domains"] ?? .undefined).optional { value in try value.array().map { value in try value.string() } }, `organizationId`: try Field.decode((values["organizationId"] ?? .undefined)) { value in try value.string() }, `saml`: try Field.decode((values["saml"] ?? .undefined)) { value in try OrganizationEnterpriseConnectionSamlInput.decode(value, in: runtime) }, `oidc`: try Field.decode((values["oidc"] ?? .undefined)) { value in try OrganizationEnterpriseConnectionOidcInput.decode(value, in: runtime) })
  }
}

public enum OrganizationEnterpriseConnectionProvider: Hashable, Sendable {
  case `samlOkta`
  case `samlGoogle`
  case `samlMicrosoft`
  case `samlCustom`
  case `oidcCustom`
  case `oidcGithubEnterprise`
  case `oidcGitlab`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`samlOkta`: return "saml_okta"
    case .`samlGoogle`: return "saml_google"
    case .`samlMicrosoft`: return "saml_microsoft"
    case .`samlCustom`: return "saml_custom"
    case .`oidcCustom`: return "oidc_custom"
    case .`oidcGithubEnterprise`: return "oidc_github_enterprise"
    case .`oidcGitlab`: return "oidc_gitlab"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "saml_okta": self = .`samlOkta`
    case "saml_google": self = .`samlGoogle`
    case "saml_microsoft": self = .`samlMicrosoft`
    case "saml_custom": self = .`samlCustom`
    case "oidc_custom": self = .`oidcCustom`
    case "oidc_github_enterprise": self = .`oidcGithubEnterprise`
    case "oidc_gitlab": self = .`oidcGitlab`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationEnterpriseConnectionProvider { .init(rawValue: try value.string()) }
}

public struct OrganizationEnterpriseConnectionSamlInput: Hashable, Sendable {
  public let `idpEntityId`: Field<String>
  public let `idpSsoUrl`: Field<String>
  public let `idpCertificate`: Field<String>
  public let `idpMetadataUrl`: Field<String>
  public let `idpMetadata`: Field<String>
  public let `attributeMapping`: Field<[String: JSONValue]>
  public let `allowSubdomains`: Field<Bool>
  public let `allowIdpInitiated`: Field<Bool>
  public let `forceAuthn`: Field<Bool>
  public init(`idpEntityId`: Field<String> = .omitted, `idpSsoUrl`: Field<String> = .omitted, `idpCertificate`: Field<String> = .omitted, `idpMetadataUrl`: Field<String> = .omitted, `idpMetadata`: Field<String> = .omitted, `attributeMapping`: Field<[String: JSONValue]> = .omitted, `allowSubdomains`: Field<Bool> = .omitted, `allowIdpInitiated`: Field<Bool> = .omitted, `forceAuthn`: Field<Bool> = .omitted) {
    self.`idpEntityId` = `idpEntityId`
    self.`idpSsoUrl` = `idpSsoUrl`
    self.`idpCertificate` = `idpCertificate`
    self.`idpMetadataUrl` = `idpMetadataUrl`
    self.`idpMetadata` = `idpMetadata`
    self.`attributeMapping` = `attributeMapping`
    self.`allowSubdomains` = `allowSubdomains`
    self.`allowIdpInitiated` = `allowIdpInitiated`
    self.`forceAuthn` = `forceAuthn`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "idpEntityId": try self.`idpEntityId`.encode { value in .string(value) },
      "idpSsoUrl": try self.`idpSsoUrl`.encode { value in .string(value) },
      "idpCertificate": try self.`idpCertificate`.encode { value in .string(value) },
      "idpMetadataUrl": try self.`idpMetadataUrl`.encode { value in .string(value) },
      "idpMetadata": try self.`idpMetadata`.encode { value in .string(value) },
      "attributeMapping": try self.`attributeMapping`.encode { value in .object(try value.mapValues { value in value }) },
      "allowSubdomains": try self.`allowSubdomains`.encode { value in .bool(value) },
      "allowIdpInitiated": try self.`allowIdpInitiated`.encode { value in .bool(value) },
      "forceAuthn": try self.`forceAuthn`.encode { value in .bool(value) }
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationEnterpriseConnectionSamlInput {
    let values = try value.object()

    return try OrganizationEnterpriseConnectionSamlInput(`idpEntityId`: try Field.decode((values["idpEntityId"] ?? .undefined)) { value in try value.string() }, `idpSsoUrl`: try Field.decode((values["idpSsoUrl"] ?? .undefined)) { value in try value.string() }, `idpCertificate`: try Field.decode((values["idpCertificate"] ?? .undefined)) { value in try value.string() }, `idpMetadataUrl`: try Field.decode((values["idpMetadataUrl"] ?? .undefined)) { value in try value.string() }, `idpMetadata`: try Field.decode((values["idpMetadata"] ?? .undefined)) { value in try value.string() }, `attributeMapping`: try Field.decode((values["attributeMapping"] ?? .undefined)) { value in try value.object().mapValues { value in value } }, `allowSubdomains`: try Field.decode((values["allowSubdomains"] ?? .undefined)) { value in try value.bool() }, `allowIdpInitiated`: try Field.decode((values["allowIdpInitiated"] ?? .undefined)) { value in try value.bool() }, `forceAuthn`: try Field.decode((values["forceAuthn"] ?? .undefined)) { value in try value.bool() })
  }
}

public struct OrganizationEnterpriseConnectionOidcInput: Hashable, Sendable {
  public let `clientId`: Field<String>
  public let `clientSecret`: Field<String>
  public let `discoveryUrl`: Field<String>
  public let `authUrl`: Field<String>
  public let `tokenUrl`: Field<String>
  public let `userInfoUrl`: Field<String>
  public let `requiresPkce`: Field<Bool>
  public init(`clientId`: Field<String> = .omitted, `clientSecret`: Field<String> = .omitted, `discoveryUrl`: Field<String> = .omitted, `authUrl`: Field<String> = .omitted, `tokenUrl`: Field<String> = .omitted, `userInfoUrl`: Field<String> = .omitted, `requiresPkce`: Field<Bool> = .omitted) {
    self.`clientId` = `clientId`
    self.`clientSecret` = `clientSecret`
    self.`discoveryUrl` = `discoveryUrl`
    self.`authUrl` = `authUrl`
    self.`tokenUrl` = `tokenUrl`
    self.`userInfoUrl` = `userInfoUrl`
    self.`requiresPkce` = `requiresPkce`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "clientId": try self.`clientId`.encode { value in .string(value) },
      "clientSecret": try self.`clientSecret`.encode { value in .string(value) },
      "discoveryUrl": try self.`discoveryUrl`.encode { value in .string(value) },
      "authUrl": try self.`authUrl`.encode { value in .string(value) },
      "tokenUrl": try self.`tokenUrl`.encode { value in .string(value) },
      "userInfoUrl": try self.`userInfoUrl`.encode { value in .string(value) },
      "requiresPkce": try self.`requiresPkce`.encode { value in .bool(value) }
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationEnterpriseConnectionOidcInput {
    let values = try value.object()

    return try OrganizationEnterpriseConnectionOidcInput(`clientId`: try Field.decode((values["clientId"] ?? .undefined)) { value in try value.string() }, `clientSecret`: try Field.decode((values["clientSecret"] ?? .undefined)) { value in try value.string() }, `discoveryUrl`: try Field.decode((values["discoveryUrl"] ?? .undefined)) { value in try value.string() }, `authUrl`: try Field.decode((values["authUrl"] ?? .undefined)) { value in try value.string() }, `tokenUrl`: try Field.decode((values["tokenUrl"] ?? .undefined)) { value in try value.string() }, `userInfoUrl`: try Field.decode((values["userInfoUrl"] ?? .undefined)) { value in try value.string() }, `requiresPkce`: try Field.decode((values["requiresPkce"] ?? .undefined)) { value in try value.bool() })
  }
}

public struct UpdateOrganizationEnterpriseConnectionParams: Hashable, Sendable {
  public let `name`: Field<String>
  public let `domains`: [String]?
  public let `active`: Field<Bool>
  public let `syncUserAttributes`: Field<Bool>
  public let `disableAdditionalIdentifications`: Field<Bool>
  public let `organizationId`: Field<String>
  public let `customAttributes`: Field<[String: JSONValue]>
  public let `saml`: Field<OrganizationEnterpriseConnectionSamlInput>
  public let `oidc`: Field<OrganizationEnterpriseConnectionOidcInput>
  public init(`name`: Field<String> = .omitted, `domains`: [String]? = nil, `active`: Field<Bool> = .omitted, `syncUserAttributes`: Field<Bool> = .omitted, `disableAdditionalIdentifications`: Field<Bool> = .omitted, `organizationId`: Field<String> = .omitted, `customAttributes`: Field<[String: JSONValue]> = .omitted, `saml`: Field<OrganizationEnterpriseConnectionSamlInput> = .omitted, `oidc`: Field<OrganizationEnterpriseConnectionOidcInput> = .omitted) {
    self.`name` = `name`
    self.`domains` = `domains`
    self.`active` = `active`
    self.`syncUserAttributes` = `syncUserAttributes`
    self.`disableAdditionalIdentifications` = `disableAdditionalIdentifications`
    self.`organizationId` = `organizationId`
    self.`customAttributes` = `customAttributes`
    self.`saml` = `saml`
    self.`oidc` = `oidc`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "name": try self.`name`.encode { value in .string(value) },
      "domains": try self.`domains`.map { value in .array(try value.map { value in .string(value) }) } ?? .undefined,
      "active": try self.`active`.encode { value in .bool(value) },
      "syncUserAttributes": try self.`syncUserAttributes`.encode { value in .bool(value) },
      "disableAdditionalIdentifications": try self.`disableAdditionalIdentifications`.encode { value in .bool(value) },
      "organizationId": try self.`organizationId`.encode { value in .string(value) },
      "customAttributes": try self.`customAttributes`.encode { value in .object(try value.mapValues { value in value }) },
      "saml": try self.`saml`.encode { value in try value.encode() },
      "oidc": try self.`oidc`.encode { value in try value.encode() }
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UpdateOrganizationEnterpriseConnectionParams {
    let values = try value.object()

    return try UpdateOrganizationEnterpriseConnectionParams(`name`: try Field.decode((values["name"] ?? .undefined)) { value in try value.string() }, `domains`: try (values["domains"] ?? .undefined).optional { value in try value.array().map { value in try value.string() } }, `active`: try Field.decode((values["active"] ?? .undefined)) { value in try value.bool() }, `syncUserAttributes`: try Field.decode((values["syncUserAttributes"] ?? .undefined)) { value in try value.bool() }, `disableAdditionalIdentifications`: try Field.decode((values["disableAdditionalIdentifications"] ?? .undefined)) { value in try value.bool() }, `organizationId`: try Field.decode((values["organizationId"] ?? .undefined)) { value in try value.string() }, `customAttributes`: try Field.decode((values["customAttributes"] ?? .undefined)) { value in try value.object().mapValues { value in value } }, `saml`: try Field.decode((values["saml"] ?? .undefined)) { value in try OrganizationEnterpriseConnectionSamlInput.decode(value, in: runtime) }, `oidc`: try Field.decode((values["oidc"] ?? .undefined)) { value in try OrganizationEnterpriseConnectionOidcInput.decode(value, in: runtime) })
  }
}

/// The `DeletedObjectResource` type represents an item that has been deleted from the database.
public struct DeletedObject: Hashable, Sendable {
  public let `object`: String
  public let `id`: String?
  public let `slug`: String?
  public let `deleted`: Bool
  public init(`object`: String, `id`: String? = nil, `slug`: String? = nil, `deleted`: Bool) {
    self.`object` = `object`
    self.`id` = `id`
    self.`slug` = `slug`
    self.`deleted` = `deleted`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "object": .string(self.`object`),
      "id": try self.`id`.map { value in .string(value) } ?? .undefined,
      "slug": try self.`slug`.map { value in .string(value) } ?? .undefined,
      "deleted": .bool(self.`deleted`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> DeletedObject {
    let values = try value.object()

    return try DeletedObject(`object`: try (values["object"] ?? .undefined).string(), `id`: try (values["id"] ?? .undefined).optional { value in try value.string() }, `slug`: try (values["slug"] ?? .undefined).optional { value in try value.string() }, `deleted`: try (values["deleted"] ?? .undefined).bool())
  }
}

public struct EnterpriseConnectionTestRunInit: Hashable, Sendable {
  public let `url`: String
  public init(`url`: String) {
    self.`url` = `url`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "url": .string(self.`url`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnectionTestRunInit {
    let values = try value.object()

    return try EnterpriseConnectionTestRunInit(`url`: try (values["url"] ?? .undefined).string())
  }
}

public struct GetEnterpriseConnectionTestRunsParams: Hashable, Sendable {
  public let `initialPage`: Double?
  public let `pageSize`: Double?
  public let `status`: [EnterpriseConnectionTestRunStatus]?
  public init(`initialPage`: Double? = nil, `pageSize`: Double? = nil, `status`: [EnterpriseConnectionTestRunStatus]? = nil) {
    self.`initialPage` = `initialPage`
    self.`pageSize` = `pageSize`
    self.`status` = `status`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "initialPage": try self.`initialPage`.map { value in .number(value) } ?? .undefined,
      "pageSize": try self.`pageSize`.map { value in .number(value) } ?? .undefined,
      "status": try self.`status`.map { value in .array(try value.map { value in try value.encode() }) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetEnterpriseConnectionTestRunsParams {
    let values = try value.object()

    return try GetEnterpriseConnectionTestRunsParams(`initialPage`: try (values["initialPage"] ?? .undefined).optional { value in try value.number() }, `pageSize`: try (values["pageSize"] ?? .undefined).optional { value in try value.number() }, `status`: try (values["status"] ?? .undefined).optional { value in try value.array().map { value in try EnterpriseConnectionTestRunStatus.decode(value, in: runtime) } })
  }
}

public enum EnterpriseConnectionTestRunStatus: Hashable, Sendable {
  case `failed`
  case `pending`
  case `success`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`failed`: return "failed"
    case .`pending`: return "pending"
    case .`success`: return "success"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "failed": self = .`failed`
    case "pending": self = .`pending`
    case "success": self = .`success`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnectionTestRunStatus { .init(rawValue: try value.string()) }
}

/// An interface that describes the response of a method that returns a paginated list of resources.
///
/// > [!TIP]
/// > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
public struct ClerkPaginatedResponseEnterpriseConnectionTestRun: Hashable, Sendable {
  public let `data`: [EnterpriseConnectionTestRun]
  public let `totalCount`: Double
  public init(`data`: [EnterpriseConnectionTestRun], `totalCount`: Double) {
    self.`data` = `data`
    self.`totalCount` = `totalCount`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "data": .array(try self.`data`.map { value in try value.encode() }),
      "total_count": .number(self.`totalCount`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkPaginatedResponseEnterpriseConnectionTestRun {
    let values = try value.object()

    return try ClerkPaginatedResponseEnterpriseConnectionTestRun(`data`: try (values["data"] ?? .undefined).array().map { value in try EnterpriseConnectionTestRun.decode(value, in: runtime) }, `totalCount`: try (values["total_count"] ?? .undefined).number())
  }
}

public struct EnterpriseConnectionTestRunState: Hashable, Sendable {
  public let `id`: String
  public let `status`: String
  public let `connectionType`: EnterpriseConnectionTestRunConnectionType
  public let `parsedUserInfo`: EnterpriseConnectionTestRunParsedUserInfo?
  public let `logs`: [EnterpriseConnectionTestRunLog]
  public let `saml`: EnterpriseConnectionTestRunSamlPayload?
  public let `oauth`: EnterpriseConnectionTestRunOauthPayload?
  public let `createdAt`: Date?
  public init(`id`: String, `status`: String, `connectionType`: EnterpriseConnectionTestRunConnectionType, `parsedUserInfo`: EnterpriseConnectionTestRunParsedUserInfo?, `logs`: [EnterpriseConnectionTestRunLog], `saml`: EnterpriseConnectionTestRunSamlPayload?, `oauth`: EnterpriseConnectionTestRunOauthPayload?, `createdAt`: Date?) {
    self.`id` = `id`
    self.`status` = `status`
    self.`connectionType` = `connectionType`
    self.`parsedUserInfo` = `parsedUserInfo`
    self.`logs` = `logs`
    self.`saml` = `saml`
    self.`oauth` = `oauth`
    self.`createdAt` = `createdAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "status": .string(self.`status`),
      "connectionType": try self.`connectionType`.encode(),
      "parsedUserInfo": try self.`parsedUserInfo`.map { value in try value.encode() } ?? .null,
      "logs": .array(try self.`logs`.map { value in try value.encode() }),
      "saml": try self.`saml`.map { value in try value.encode() } ?? .null,
      "oauth": try self.`oauth`.map { value in try value.encode() } ?? .null,
      "createdAt": try self.`createdAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnectionTestRunState {
    let values = try value.object()

    return try EnterpriseConnectionTestRunState(`id`: try (values["id"] ?? .undefined).string(), `status`: try (values["status"] ?? .undefined).string(), `connectionType`: try EnterpriseConnectionTestRunConnectionType.decode((values["connectionType"] ?? .undefined), in: runtime), `parsedUserInfo`: try (values["parsedUserInfo"] ?? .undefined).optional { value in try EnterpriseConnectionTestRunParsedUserInfo.decode(value, in: runtime) }, `logs`: try (values["logs"] ?? .undefined).array().map { value in try EnterpriseConnectionTestRunLog.decode(value, in: runtime) }, `saml`: try (values["saml"] ?? .undefined).optional { value in try EnterpriseConnectionTestRunSamlPayload.decode(value, in: runtime) }, `oauth`: try (values["oauth"] ?? .undefined).optional { value in try EnterpriseConnectionTestRunOauthPayload.decode(value, in: runtime) }, `createdAt`: try (values["createdAt"] ?? .undefined).optional { value in try value.date() })
  }
}
@MainActor @Observable public final class EnterpriseConnectionTestRun: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: EnterpriseConnectionTestRunState { context.state(handle, as: EnterpriseConnectionTestRunState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `status`: String { state.`status` }
  public var `connectionType`: EnterpriseConnectionTestRunConnectionType { state.`connectionType` }
  public var `parsedUserInfo`: EnterpriseConnectionTestRunParsedUserInfo? { state.`parsedUserInfo` }
  public var `logs`: [EnterpriseConnectionTestRunLog] { state.`logs` }
  public var `saml`: EnterpriseConnectionTestRunSamlPayload? { state.`saml` }
  public var `oauth`: EnterpriseConnectionTestRunOauthPayload? { state.`oauth` }
  public var `createdAt`: Date? { state.`createdAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try EnterpriseConnectionTestRunState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnectionTestRun { try runtime.resource(ResourceHandle.decodeReference(value), as: EnterpriseConnectionTestRun.self) }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> EnterpriseConnectionTestRun {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EnterpriseConnectionTestRun.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try EnterpriseConnectionTestRun.decode(result, in: runtime)
    }
  }
}

public enum EnterpriseConnectionTestRunConnectionType: Hashable, Sendable {
  case `saml`
  case `oauth`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`saml`: return "saml"
    case .`oauth`: return "oauth"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "saml": self = .`saml`
    case "oauth": self = .`oauth`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnectionTestRunConnectionType { .init(rawValue: try value.string()) }
}

public struct EnterpriseConnectionTestRunParsedUserInfo: Hashable, Sendable {
  public let `emailAddress`: String?
  public let `firstName`: String?
  public let `lastName`: String?
  public let `userId`: String?
  public init(`emailAddress`: String? = nil, `firstName`: String? = nil, `lastName`: String? = nil, `userId`: String? = nil) {
    self.`emailAddress` = `emailAddress`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`userId` = `userId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddress": try self.`emailAddress`.map { value in .string(value) } ?? .undefined,
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "userId": try self.`userId`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnectionTestRunParsedUserInfo {
    let values = try value.object()

    return try EnterpriseConnectionTestRunParsedUserInfo(`emailAddress`: try (values["emailAddress"] ?? .undefined).optional { value in try value.string() }, `firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `userId`: try (values["userId"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct EnterpriseConnectionTestRunLog: Hashable, Sendable {
  public let `level`: String?
  public let `code`: String?
  public let `shortMessage`: String?
  public let `message`: String?
  public init(`level`: String? = nil, `code`: String? = nil, `shortMessage`: String? = nil, `message`: String? = nil) {
    self.`level` = `level`
    self.`code` = `code`
    self.`shortMessage` = `shortMessage`
    self.`message` = `message`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "level": try self.`level`.map { value in .string(value) } ?? .undefined,
      "code": try self.`code`.map { value in .string(value) } ?? .undefined,
      "shortMessage": try self.`shortMessage`.map { value in .string(value) } ?? .undefined,
      "message": try self.`message`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnectionTestRunLog {
    let values = try value.object()

    return try EnterpriseConnectionTestRunLog(`level`: try (values["level"] ?? .undefined).optional { value in try value.string() }, `code`: try (values["code"] ?? .undefined).optional { value in try value.string() }, `shortMessage`: try (values["shortMessage"] ?? .undefined).optional { value in try value.string() }, `message`: try (values["message"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct EnterpriseConnectionTestRunSamlPayload: Hashable, Sendable {
  public let `samlRequest`: String?
  public let `samlResponse`: String?
  public let `relayState`: String?
  public init(`samlRequest`: String? = nil, `samlResponse`: String? = nil, `relayState`: String? = nil) {
    self.`samlRequest` = `samlRequest`
    self.`samlResponse` = `samlResponse`
    self.`relayState` = `relayState`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "samlRequest": try self.`samlRequest`.map { value in .string(value) } ?? .undefined,
      "samlResponse": try self.`samlResponse`.map { value in .string(value) } ?? .undefined,
      "relayState": try self.`relayState`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnectionTestRunSamlPayload {
    let values = try value.object()

    return try EnterpriseConnectionTestRunSamlPayload(`samlRequest`: try (values["samlRequest"] ?? .undefined).optional { value in try value.string() }, `samlResponse`: try (values["samlResponse"] ?? .undefined).optional { value in try value.string() }, `relayState`: try (values["relayState"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct EnterpriseConnectionTestRunOauthPayload: Hashable, Sendable {
  public let `userInfo`: String?
  public init(`userInfo`: String? = nil) {
    self.`userInfo` = `userInfo`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "userInfo": try self.`userInfo`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseConnectionTestRunOauthPayload {
    let values = try value.object()

    return try EnterpriseConnectionTestRunOauthPayload(`userInfo`: try (values["userInfo"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SetOrganizationLogoParams: Hashable, Sendable {
  public let `file`: SetOrganizationLogoParamsFile?
  public init(`file`: SetOrganizationLogoParamsFile?) {
    self.`file` = `file`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "file": try self.`file`.map { value in try value.encode() } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SetOrganizationLogoParams {
    let values = try value.object()

    return try SetOrganizationLogoParams(`file`: try (values["file"] ?? .undefined).optional { value in try SetOrganizationLogoParamsFile.decode(value, in: runtime) })
  }
}

public indirect enum SetOrganizationLogoParamsFile: Hashable, Sendable {
  case case1(String)
  case case2(UploadFile)
  case case3(UploadFile)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": .string(value)])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SetOrganizationLogoParamsFile {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try payload.string())
    case 1: return .case2(try UploadFile.decode(payload))
    case 2: return .case3(try UploadFile.decode(payload))
    default: throw CoreError.invalidValue
    }
  }
}

public struct InitializePaymentMethodParams: Hashable, Sendable {
  public var `gateway`: String { "stripe" }
  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "gateway": .string("stripe")
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> InitializePaymentMethodParams {
    let values = try value.object()
    guard values["gateway"] == .string("stripe") else { throw CoreError.invalidValue }
    return try InitializePaymentMethodParams()
  }
}

/// The `BillingInitializedPaymentMethodResource` type represents a payment method that has been initialized for checkout session.
public struct BillingInitializedPaymentMethodState: Hashable, Sendable {
  public let `externalClientSecret`: String
  public let `externalGatewayId`: String
  public let `paymentMethodOrder`: [String]
  public let `id`: String?
  public init(`externalClientSecret`: String, `externalGatewayId`: String, `paymentMethodOrder`: [String], `id`: String? = nil) {
    self.`externalClientSecret` = `externalClientSecret`
    self.`externalGatewayId` = `externalGatewayId`
    self.`paymentMethodOrder` = `paymentMethodOrder`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "externalClientSecret": .string(self.`externalClientSecret`),
      "externalGatewayId": .string(self.`externalGatewayId`),
      "paymentMethodOrder": .array(try self.`paymentMethodOrder`.map { value in .string(value) }),
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BillingInitializedPaymentMethodState {
    let values = try value.object()

    return try BillingInitializedPaymentMethodState(`externalClientSecret`: try (values["externalClientSecret"] ?? .undefined).string(), `externalGatewayId`: try (values["externalGatewayId"] ?? .undefined).string(), `paymentMethodOrder`: try (values["paymentMethodOrder"] ?? .undefined).array().map { value in try value.string() }, `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}
@MainActor @Observable public final class BillingInitializedPaymentMethod: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: BillingInitializedPaymentMethodState { context.state(handle, as: BillingInitializedPaymentMethodState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `externalClientSecret`: String { state.`externalClientSecret` }
  public var `externalGatewayId`: String { state.`externalGatewayId` }
  public var `paymentMethodOrder`: [String] { state.`paymentMethodOrder` }
  public var `id`: String? { state.`id` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try BillingInitializedPaymentMethodState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BillingInitializedPaymentMethod { try runtime.resource(ResourceHandle.decodeReference(value), as: BillingInitializedPaymentMethod.self) }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> BillingInitializedPaymentMethod {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BillingInitializedPaymentMethod.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try BillingInitializedPaymentMethod.decode(result, in: runtime)
    }
  }
}

public struct AddPaymentMethodParams: Hashable, Sendable {
  public var `gateway`: String { "stripe" }
  public let `paymentToken`: String
  public init(`paymentToken`: String) {
    self.`paymentToken` = `paymentToken`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "gateway": .string("stripe"),
      "paymentToken": .string(self.`paymentToken`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AddPaymentMethodParams {
    let values = try value.object()
    guard values["gateway"] == .string("stripe") else { throw CoreError.invalidValue }
    return try AddPaymentMethodParams(`paymentToken`: try (values["paymentToken"] ?? .undefined).string())
  }
}

/// The `BillingPaymentMethodResource` type represents a payment method for a checkout session.
public struct BillingPaymentMethodState: Hashable, Sendable {
  public let `id`: String
  public let `last4`: String?
  public let `paymentType`: String?
  public let `cardType`: String?
  public let `isDefault`: Bool?
  public let `isRemovable`: Bool?
  public let `status`: BillingPaymentMethodStatus
  public let `walletType`: Field<String>
  public let `expiryYear`: Field<Double>
  public let `expiryMonth`: Field<Double>
  public let `createdAt`: Field<Date>
  public let `updatedAt`: Field<Date>
  public init(`id`: String, `last4`: String?, `paymentType`: String? = nil, `cardType`: String?, `isDefault`: Bool? = nil, `isRemovable`: Bool? = nil, `status`: BillingPaymentMethodStatus, `walletType`: Field<String> = .omitted, `expiryYear`: Field<Double> = .omitted, `expiryMonth`: Field<Double> = .omitted, `createdAt`: Field<Date> = .omitted, `updatedAt`: Field<Date> = .omitted) {
    self.`id` = `id`
    self.`last4` = `last4`
    self.`paymentType` = `paymentType`
    self.`cardType` = `cardType`
    self.`isDefault` = `isDefault`
    self.`isRemovable` = `isRemovable`
    self.`status` = `status`
    self.`walletType` = `walletType`
    self.`expiryYear` = `expiryYear`
    self.`expiryMonth` = `expiryMonth`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "last4": try self.`last4`.map { value in .string(value) } ?? .null,
      "paymentType": try self.`paymentType`.map { value in .string("card") } ?? .undefined,
      "cardType": try self.`cardType`.map { value in .string(value) } ?? .null,
      "isDefault": try self.`isDefault`.map { value in .bool(value) } ?? .undefined,
      "isRemovable": try self.`isRemovable`.map { value in .bool(value) } ?? .undefined,
      "status": try self.`status`.encode(),
      "walletType": try self.`walletType`.encode { value in .string(value) },
      "expiryYear": try self.`expiryYear`.encode { value in .number(value) },
      "expiryMonth": try self.`expiryMonth`.encode { value in .number(value) },
      "createdAt": try self.`createdAt`.encode { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) },
      "updatedAt": try self.`updatedAt`.encode { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) }
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BillingPaymentMethodState {
    let values = try value.object()

    return try BillingPaymentMethodState(`id`: try (values["id"] ?? .undefined).string(), `last4`: try (values["last4"] ?? .undefined).optional { value in try value.string() }, `paymentType`: try (values["paymentType"] ?? .undefined).optional { value in try value.literal(.string("card")).string() }, `cardType`: try (values["cardType"] ?? .undefined).optional { value in try value.string() }, `isDefault`: try (values["isDefault"] ?? .undefined).optional { value in try value.bool() }, `isRemovable`: try (values["isRemovable"] ?? .undefined).optional { value in try value.bool() }, `status`: try BillingPaymentMethodStatus.decode((values["status"] ?? .undefined), in: runtime), `walletType`: try Field.decode((values["walletType"] ?? .undefined)) { value in try value.string() }, `expiryYear`: try Field.decode((values["expiryYear"] ?? .undefined)) { value in try value.number() }, `expiryMonth`: try Field.decode((values["expiryMonth"] ?? .undefined)) { value in try value.number() }, `createdAt`: try Field.decode((values["createdAt"] ?? .undefined)) { value in try value.date() }, `updatedAt`: try Field.decode((values["updatedAt"] ?? .undefined)) { value in try value.date() })
  }
}
@MainActor @Observable public final class BillingPaymentMethod: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: BillingPaymentMethodState { context.state(handle, as: BillingPaymentMethodState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `last4`: String? { state.`last4` }
  public var `paymentType`: String? { state.`paymentType` }
  public var `cardType`: String? { state.`cardType` }
  public var `isDefault`: Bool? { state.`isDefault` }
  public var `isRemovable`: Bool? { state.`isRemovable` }
  public var `status`: BillingPaymentMethodStatus { state.`status` }
  public var `walletType`: Field<String> { state.`walletType` }
  public var `expiryYear`: Field<Double> { state.`expiryYear` }
  public var `expiryMonth`: Field<Double> { state.`expiryMonth` }
  public var `createdAt`: Field<Date> { state.`createdAt` }
  public var `updatedAt`: Field<Date> { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try BillingPaymentMethodState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BillingPaymentMethod { try runtime.resource(ResourceHandle.decodeReference(value), as: BillingPaymentMethod.self) }
  /// A function that removes this payment method from the account. Accepts the following parameters:
  /// <ul>
  ///  <li>`orgId?` (`string`): The ID of the Organization to remove the payment method from.</li>
  /// </ul>
  public func `remove`(_ `params`: BillingPaymentMethodRemoveParams? = nil) async throws -> DeletedObject {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BillingPaymentMethod.remove", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try DeletedObject.decode(result, in: runtime)
    }
  }
  /// A function that sets this payment method as the default for the account. Accepts the following parameters:
  /// <ul>
  ///  <li>`orgId?` (`string`): The ID of the Organization to set as the default.</li>
  /// </ul>
  public func `makeDefault`(_ `params`: BillingPaymentMethodRemoveParams? = nil) async throws -> JSONValue {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BillingPaymentMethod.makeDefault", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return result
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> BillingPaymentMethod {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BillingPaymentMethod.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try BillingPaymentMethod.decode(result, in: runtime)
    }
  }
}

/// The status of a payment method.
public enum BillingPaymentMethodStatus: Hashable, Sendable {
  case `expired`
  case `active`
  case `disconnected`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`expired`: return "expired"
    case .`active`: return "active"
    case .`disconnected`: return "disconnected"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "expired": self = .`expired`
    case "active": self = .`active`
    case "disconnected": self = .`disconnected`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BillingPaymentMethodStatus { .init(rawValue: try value.string()) }
}

public struct BillingPaymentMethodRemoveParams: Hashable, Sendable {
  public let `orgId`: String?
  public init(`orgId`: String? = nil) {
    self.`orgId` = `orgId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "orgId": try self.`orgId`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BillingPaymentMethodRemoveParams {
    let values = try value.object()

    return try BillingPaymentMethodRemoveParams(`orgId`: try (values["orgId"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct GetPaymentMethodsParams: Hashable, Sendable {
  public let `initialPage`: Double?
  public let `pageSize`: Double?
  public init(`initialPage`: Double? = nil, `pageSize`: Double? = nil) {
    self.`initialPage` = `initialPage`
    self.`pageSize` = `pageSize`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "initialPage": try self.`initialPage`.map { value in .number(value) } ?? .undefined,
      "pageSize": try self.`pageSize`.map { value in .number(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetPaymentMethodsParams {
    let values = try value.object()

    return try GetPaymentMethodsParams(`initialPage`: try (values["initialPage"] ?? .undefined).optional { value in try value.number() }, `pageSize`: try (values["pageSize"] ?? .undefined).optional { value in try value.number() })
  }
}

/// An interface that describes the response of a method that returns a paginated list of resources.
///
/// > [!TIP]
/// > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
public struct ClerkPaginatedResponseBillingPaymentMethod: Hashable, Sendable {
  public let `data`: [BillingPaymentMethod]
  public let `totalCount`: Double
  public init(`data`: [BillingPaymentMethod], `totalCount`: Double) {
    self.`data` = `data`
    self.`totalCount` = `totalCount`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "data": .array(try self.`data`.map { value in try value.encode() }),
      "total_count": .number(self.`totalCount`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkPaginatedResponseBillingPaymentMethod {
    let values = try value.object()

    return try ClerkPaginatedResponseBillingPaymentMethod(`data`: try (values["data"] ?? .undefined).array().map { value in try BillingPaymentMethod.decode(value, in: runtime) }, `totalCount`: try (values["total_count"] ?? .undefined).number())
  }
}

/// The `Session` object is an abstraction over an HTTP session. It models the period of information exchange between a user and the server.
///
/// The `Session` object includes methods for recording session activity and ending the session client-side. For security reasons, sessions can also expire server-side.
///
/// As soon as a [`User`](https://clerk.com/docs/reference/objects/user) signs in, Clerk creates a `Session` for the current [`Client`](https://clerk.com/docs/reference/objects/client). Clients can have more than one sessions at any point in time, but only one of those sessions will be **active**.
///
/// In certain scenarios, a session might be replaced by another one. This is often the case with [multi-session applications](https://clerk.com/docs/guides/secure/session-options#multi-session-applications).
///
/// All sessions that are **expired**, **removed**, **replaced**, **ended** or **abandoned** are not considered valid.
///
/// > [!NOTE]
/// > For more information regarding the different session states, see the [guide on session management](https://clerk.com/docs/guides/secure/session-options).
public struct SessionState: Hashable, Sendable {
  public let `id`: String
  public let `status`: SessionStatus
  public let `expireAt`: Date
  public let `abandonAt`: Date
  public let `factorVerificationAge`: SessionFactorVerificationAgeValue?
  public let `lastActiveOrganizationId`: String?
  public let `lastActiveAt`: Date
  public let `actor`: [String: JSONValue]?
  public let `agent`: [String: JSONValue]?
  public let `tasks`: [SessionTask]?
  public let `currentTask`: SessionTask?
  public let `user`: User?
  public let `publicUserData`: PublicUserData
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`id`: String, `status`: SessionStatus, `expireAt`: Date, `abandonAt`: Date, `factorVerificationAge`: SessionFactorVerificationAgeValue?, `lastActiveOrganizationId`: String?, `lastActiveAt`: Date, `actor`: [String: JSONValue]?, `agent`: [String: JSONValue]?, `tasks`: [SessionTask]?, `currentTask`: SessionTask? = nil, `user`: User?, `publicUserData`: PublicUserData, `createdAt`: Date, `updatedAt`: Date) {
    self.`id` = `id`
    self.`status` = `status`
    self.`expireAt` = `expireAt`
    self.`abandonAt` = `abandonAt`
    self.`factorVerificationAge` = `factorVerificationAge`
    self.`lastActiveOrganizationId` = `lastActiveOrganizationId`
    self.`lastActiveAt` = `lastActiveAt`
    self.`actor` = `actor`
    self.`agent` = `agent`
    self.`tasks` = `tasks`
    self.`currentTask` = `currentTask`
    self.`user` = `user`
    self.`publicUserData` = `publicUserData`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "status": try self.`status`.encode(),
      "expireAt": .string(self.`expireAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "abandonAt": .string(self.`abandonAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "factorVerificationAge": try self.`factorVerificationAge`.map { value in try value.encode() } ?? .null,
      "lastActiveOrganizationId": try self.`lastActiveOrganizationId`.map { value in .string(value) } ?? .null,
      "lastActiveAt": .string(self.`lastActiveAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "actor": try self.`actor`.map { value in .object(value) } ?? .null,
      "agent": try self.`agent`.map { value in .object(value) } ?? .null,
      "tasks": try self.`tasks`.map { value in .array(try value.map { value in try value.encode() }) } ?? .null,
      "currentTask": try self.`currentTask`.map { value in try value.encode() } ?? .undefined,
      "user": try self.`user`.map { value in try value.encode() } ?? .null,
      "publicUserData": try self.`publicUserData`.encode(),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionState {
    let values = try value.object()

    return try SessionState(`id`: try (values["id"] ?? .undefined).string(), `status`: try SessionStatus.decode((values["status"] ?? .undefined), in: runtime), `expireAt`: try (values["expireAt"] ?? .undefined).date(), `abandonAt`: try (values["abandonAt"] ?? .undefined).date(), `factorVerificationAge`: try (values["factorVerificationAge"] ?? .undefined).optional { value in try SessionFactorVerificationAgeValue.decode(value, in: runtime) }, `lastActiveOrganizationId`: try (values["lastActiveOrganizationId"] ?? .undefined).optional { value in try value.string() }, `lastActiveAt`: try (values["lastActiveAt"] ?? .undefined).date(), `actor`: try (values["actor"] ?? .undefined).optional { value in try value.object() }, `agent`: try (values["agent"] ?? .undefined).optional { value in try value.object() }, `tasks`: try (values["tasks"] ?? .undefined).optional { value in try value.array().map { value in try SessionTask.decode(value, in: runtime) } }, `currentTask`: try (values["currentTask"] ?? .undefined).optional { value in try SessionTask.decode(value, in: runtime) }, `user`: try (values["user"] ?? .undefined).optional { value in try User.decode(value, in: runtime) }, `publicUserData`: try PublicUserData.decode((values["publicUserData"] ?? .undefined), in: runtime), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class Session: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SessionState { context.state(handle, as: SessionState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `status`: SessionStatus { state.`status` }
  public var `expireAt`: Date { state.`expireAt` }
  public var `abandonAt`: Date { state.`abandonAt` }
  public var `factorVerificationAge`: SessionFactorVerificationAgeValue? { state.`factorVerificationAge` }
  public var `lastActiveOrganizationId`: String? { state.`lastActiveOrganizationId` }
  public var `lastActiveAt`: Date { state.`lastActiveAt` }
  public var `actor`: [String: JSONValue]? { state.`actor` }
  public var `agent`: [String: JSONValue]? { state.`agent` }
  public var `tasks`: [SessionTask]? { state.`tasks` }
  public var `currentTask`: SessionTask? { state.`currentTask` }
  public var `user`: User? { state.`user` }
  public var `publicUserData`: PublicUserData { state.`publicUserData` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try SessionState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Session { try runtime.resource(ResourceHandle.decodeReference(value), as: Session.self) }
  /// Marks the session as ended. The session will no longer be active for this `Client` and its status will become **ended**.
  public func `end`() async throws -> Session {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.end", arguments: []) { result in
      return try Session.decode(result, in: runtime)
    }
  }
  /// Invalidates the current session by marking it as removed. Once removed, the session will be deactivated for the current Client instance and its `status` will be set to `removed`. This operation cannot be undone.
  public func `remove`() async throws -> Session {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.remove", arguments: []) { result in
      return try Session.decode(result, in: runtime)
    }
  }
  /// Updates the session's last active timestamp to the current time. This method should be called periodically to indicate ongoing user activity and prevent the session from becoming stale. The updated timestamp is used for session management and analytics purposes.
  public func `touch`(_ `params`: SessionTouchParams? = nil) async throws -> Session {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.touch", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try Session.decode(result, in: runtime)
    }
  }
  /// Gets the current user's [session token](https://clerk.com/docs/guides/sessions/session-tokens) or a [custom JWT template](https://clerk.com/docs/guides/sessions/jwt-templates).
  ///
  /// This method uses a cache so a network request will only be made if the token in memory has expired. The TTL for a Clerk token is one minute. It retries on transient failures (e.g., network errors); when the browser is offline and retries are exhausted, it throws `ClerkOfflineError`.
  ///
  /// Tokens can only be generated if the user is signed in.
  public func `getToken`(_ `options`: GetTokenOptions? = nil) async throws -> String? {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.getToken", arguments: [try `options`.map { value in try value.encode() } ?? .undefined]) { result in
      return try result.optional { value in try value.string() }
    }
  }
  /// Checks if the user is [authorized for the specified Role, Permission, Feature, or Plan](https://clerk.com/docs/guides/secure/authorization-checks) or requires the user to [reverify their credentials](https://clerk.com/docs/guides/secure/reverification) if their last verification is older than allowed.
  public func `checkAuthorization`(_ `isAuthorizedParams`: CheckAuthorizationParams) async throws -> Bool {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.checkAuthorization", arguments: [try `isAuthorizedParams`.encode()]) { result in
      return try result.bool()
    }
  }
  /// Clears the cache for the current session. This is useful if the session has been updated and the cache is no longer valid.
  public func `clearCache`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.clearCache", arguments: []) { result in
      _ = result
    }
  }
  /// Initiates the reverification flow.
  public func `startVerification`(_ `params`: SessionVerifyCreateParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.startVerification", arguments: [try `params`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Initiates the [first factor verification](!first-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
  public func `prepareFirstFactorVerification`(_ `factor`: SessionVerifyPrepareFirstFactorParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.prepareFirstFactorVerification", arguments: [try `factor`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Attempts to complete the [first factor verification](!first-factor-verification) process.
  public func `attemptFirstFactorVerification`(_ `attemptFactor`: SessionVerifyAttemptFirstFactorParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.attemptFirstFactorVerification", arguments: [try `attemptFactor`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Initiates the [second factor verification](!second-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
  public func `prepareSecondFactorVerification`(_ `params`: PhoneCodeSecondFactorConfig) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.prepareSecondFactorVerification", arguments: [try `params`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Attempts to complete the [second factor verification](!second-factor-verification) process.
  public func `attemptSecondFactorVerification`(_ `params`: SessionVerifyAttemptSecondFactorParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.attemptSecondFactorVerification", arguments: [try `params`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Initiates a verification flow using passkeys.
  public func `verifyWithPasskey`() async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.verifyWithPasskey", arguments: []) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> Session {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Session.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try Session.decode(result, in: runtime)
    }
  }
}

/// The current state of the session.
public enum SessionStatus: Hashable, Sendable {
  case `expired`
  case `abandoned`
  case `active`
  case `ended`
  case `pending`
  case `revoked`
  case `removed`
  case `replaced`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`expired`: return "expired"
    case .`abandoned`: return "abandoned"
    case .`active`: return "active"
    case .`ended`: return "ended"
    case .`pending`: return "pending"
    case .`revoked`: return "revoked"
    case .`removed`: return "removed"
    case .`replaced`: return "replaced"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "expired": self = .`expired`
    case "abandoned": self = .`abandoned`
    case "active": self = .`active`
    case "ended": self = .`ended`
    case "pending": self = .`pending`
    case "revoked": self = .`revoked`
    case "removed": self = .`removed`
    case "replaced": self = .`replaced`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionStatus { .init(rawValue: try value.string()) }
}

/// Represents the current pending task of a session.
public struct SessionTask: Hashable, Sendable {
  public let `key`: SessionTaskKey
  public init(`key`: SessionTaskKey) {
    self.`key` = `key`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "key": try self.`key`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionTask {
    let values = try value.object()

    return try SessionTask(`key`: try SessionTaskKey.decode((values["key"] ?? .undefined), in: runtime))
  }
}

public enum SessionTaskKey: Hashable, Sendable {
  case `chooseOrganization`
  case `resetPassword`
  case `setupMfa`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`chooseOrganization`: return "choose-organization"
    case .`resetPassword`: return "reset-password"
    case .`setupMfa`: return "setup-mfa"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "choose-organization": self = .`chooseOrganization`
    case "reset-password": self = .`resetPassword`
    case "setup-mfa": self = .`setupMfa`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionTaskKey { .init(rawValue: try value.string()) }
}

/// The `User` object holds all of the information for a single user of your application and provides a set of methods to manage their account. Each `User` has at least one authentication identifier, which might be their email address, phone number, or a username.
///
/// A user can be contacted at their primary email address or primary phone number. They can have more than one registered email address or phone number, but only one of them will be their primary email address (`User.primaryEmailAddress`) or primary phone number (`User.primaryPhoneNumber`). At the same time, a user can also have one or more external accounts by connecting to [social providers](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/overview) such as Google, Apple, Facebook, and many more (`User.externalAccounts`).
///
/// Finally, a `User` object holds profile data like the user's name, profile picture, and a set of [metadata](https://clerk.com/docs/guides/users/extending) that can be used internally to store arbitrary information. The metadata are split into `publicMetadata` and `privateMetadata`. Both types are set from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}, but public metadata can also be accessed from the [Frontend API](https://clerk.com/docs/reference/frontend-api){{ target: '_blank' }}.
public struct UserState: Hashable, Sendable {
  public let `id`: String
  public let `externalId`: String?
  public let `primaryEmailAddressId`: String?
  public let `primaryEmailAddress`: EmailAddress?
  public let `primaryPhoneNumberId`: String?
  public let `primaryPhoneNumber`: PhoneNumber?
  public let `primaryWeb3WalletId`: String?
  public let `primaryWeb3Wallet`: Web3Wallet?
  public let `username`: String?
  public let `fullName`: String?
  public let `firstName`: String?
  public let `lastName`: String?
  public let `imageUrl`: String
  public let `hasImage`: Bool
  public let `emailAddresses`: [EmailAddress]
  public let `phoneNumbers`: [PhoneNumber]
  public let `web3Wallets`: [Web3Wallet]
  public let `externalAccounts`: [ExternalAccount]
  public let `enterpriseAccounts`: [EnterpriseAccount]
  public let `passkeys`: [Passkey]
  public let `organizationMemberships`: [OrganizationMembership]
  public let `passwordEnabled`: Bool
  public let `totpEnabled`: Bool
  public let `backupCodeEnabled`: Bool
  public let `twoFactorEnabled`: Bool
  public let `publicMetadata`: [String: JSONValue]
  public let `unsafeMetadata`: [String: JSONValue]
  public let `lastSignInAt`: Date?
  public let `legalAcceptedAt`: Date?
  public let `createOrganizationEnabled`: Bool
  public let `createOrganizationsLimit`: Double?
  public let `deleteSelfEnabled`: Bool
  public let `updatedAt`: Date?
  public let `createdAt`: Date?
  public let `verifiedExternalAccounts`: [ExternalAccount]
  public let `unverifiedExternalAccounts`: [ExternalAccount]
  public let `verifiedWeb3Wallets`: [Web3Wallet]
  public let `hasVerifiedEmailAddress`: Bool
  public let `hasVerifiedPhoneNumber`: Bool
  public init(`id`: String, `externalId`: String?, `primaryEmailAddressId`: String?, `primaryEmailAddress`: EmailAddress?, `primaryPhoneNumberId`: String?, `primaryPhoneNumber`: PhoneNumber?, `primaryWeb3WalletId`: String?, `primaryWeb3Wallet`: Web3Wallet?, `username`: String?, `fullName`: String?, `firstName`: String?, `lastName`: String?, `imageUrl`: String, `hasImage`: Bool, `emailAddresses`: [EmailAddress], `phoneNumbers`: [PhoneNumber], `web3Wallets`: [Web3Wallet], `externalAccounts`: [ExternalAccount], `enterpriseAccounts`: [EnterpriseAccount], `passkeys`: [Passkey], `organizationMemberships`: [OrganizationMembership], `passwordEnabled`: Bool, `totpEnabled`: Bool, `backupCodeEnabled`: Bool, `twoFactorEnabled`: Bool, `publicMetadata`: [String: JSONValue], `unsafeMetadata`: [String: JSONValue], `lastSignInAt`: Date?, `legalAcceptedAt`: Date?, `createOrganizationEnabled`: Bool, `createOrganizationsLimit`: Double?, `deleteSelfEnabled`: Bool, `updatedAt`: Date?, `createdAt`: Date?, `verifiedExternalAccounts`: [ExternalAccount], `unverifiedExternalAccounts`: [ExternalAccount], `verifiedWeb3Wallets`: [Web3Wallet], `hasVerifiedEmailAddress`: Bool, `hasVerifiedPhoneNumber`: Bool) {
    self.`id` = `id`
    self.`externalId` = `externalId`
    self.`primaryEmailAddressId` = `primaryEmailAddressId`
    self.`primaryEmailAddress` = `primaryEmailAddress`
    self.`primaryPhoneNumberId` = `primaryPhoneNumberId`
    self.`primaryPhoneNumber` = `primaryPhoneNumber`
    self.`primaryWeb3WalletId` = `primaryWeb3WalletId`
    self.`primaryWeb3Wallet` = `primaryWeb3Wallet`
    self.`username` = `username`
    self.`fullName` = `fullName`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`imageUrl` = `imageUrl`
    self.`hasImage` = `hasImage`
    self.`emailAddresses` = `emailAddresses`
    self.`phoneNumbers` = `phoneNumbers`
    self.`web3Wallets` = `web3Wallets`
    self.`externalAccounts` = `externalAccounts`
    self.`enterpriseAccounts` = `enterpriseAccounts`
    self.`passkeys` = `passkeys`
    self.`organizationMemberships` = `organizationMemberships`
    self.`passwordEnabled` = `passwordEnabled`
    self.`totpEnabled` = `totpEnabled`
    self.`backupCodeEnabled` = `backupCodeEnabled`
    self.`twoFactorEnabled` = `twoFactorEnabled`
    self.`publicMetadata` = `publicMetadata`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`lastSignInAt` = `lastSignInAt`
    self.`legalAcceptedAt` = `legalAcceptedAt`
    self.`createOrganizationEnabled` = `createOrganizationEnabled`
    self.`createOrganizationsLimit` = `createOrganizationsLimit`
    self.`deleteSelfEnabled` = `deleteSelfEnabled`
    self.`updatedAt` = `updatedAt`
    self.`createdAt` = `createdAt`
    self.`verifiedExternalAccounts` = `verifiedExternalAccounts`
    self.`unverifiedExternalAccounts` = `unverifiedExternalAccounts`
    self.`verifiedWeb3Wallets` = `verifiedWeb3Wallets`
    self.`hasVerifiedEmailAddress` = `hasVerifiedEmailAddress`
    self.`hasVerifiedPhoneNumber` = `hasVerifiedPhoneNumber`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "externalId": try self.`externalId`.map { value in .string(value) } ?? .null,
      "primaryEmailAddressId": try self.`primaryEmailAddressId`.map { value in .string(value) } ?? .null,
      "primaryEmailAddress": try self.`primaryEmailAddress`.map { value in try value.encode() } ?? .null,
      "primaryPhoneNumberId": try self.`primaryPhoneNumberId`.map { value in .string(value) } ?? .null,
      "primaryPhoneNumber": try self.`primaryPhoneNumber`.map { value in try value.encode() } ?? .null,
      "primaryWeb3WalletId": try self.`primaryWeb3WalletId`.map { value in .string(value) } ?? .null,
      "primaryWeb3Wallet": try self.`primaryWeb3Wallet`.map { value in try value.encode() } ?? .null,
      "username": try self.`username`.map { value in .string(value) } ?? .null,
      "fullName": try self.`fullName`.map { value in .string(value) } ?? .null,
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .null,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .null,
      "imageUrl": .string(self.`imageUrl`),
      "hasImage": .bool(self.`hasImage`),
      "emailAddresses": .array(try self.`emailAddresses`.map { value in try value.encode() }),
      "phoneNumbers": .array(try self.`phoneNumbers`.map { value in try value.encode() }),
      "web3Wallets": .array(try self.`web3Wallets`.map { value in try value.encode() }),
      "externalAccounts": .array(try self.`externalAccounts`.map { value in try value.encode() }),
      "enterpriseAccounts": .array(try self.`enterpriseAccounts`.map { value in try value.encode() }),
      "passkeys": .array(try self.`passkeys`.map { value in try value.encode() }),
      "organizationMemberships": .array(try self.`organizationMemberships`.map { value in try value.encode() }),
      "passwordEnabled": .bool(self.`passwordEnabled`),
      "totpEnabled": .bool(self.`totpEnabled`),
      "backupCodeEnabled": .bool(self.`backupCodeEnabled`),
      "twoFactorEnabled": .bool(self.`twoFactorEnabled`),
      "publicMetadata": .object(self.`publicMetadata`),
      "unsafeMetadata": .object(self.`unsafeMetadata`),
      "lastSignInAt": try self.`lastSignInAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "legalAcceptedAt": try self.`legalAcceptedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "createOrganizationEnabled": .bool(self.`createOrganizationEnabled`),
      "createOrganizationsLimit": try self.`createOrganizationsLimit`.map { value in .number(value) } ?? .null,
      "deleteSelfEnabled": .bool(self.`deleteSelfEnabled`),
      "updatedAt": try self.`updatedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "createdAt": try self.`createdAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "verifiedExternalAccounts": .array(try self.`verifiedExternalAccounts`.map { value in try value.encode() }),
      "unverifiedExternalAccounts": .array(try self.`unverifiedExternalAccounts`.map { value in try value.encode() }),
      "verifiedWeb3Wallets": .array(try self.`verifiedWeb3Wallets`.map { value in try value.encode() }),
      "hasVerifiedEmailAddress": .bool(self.`hasVerifiedEmailAddress`),
      "hasVerifiedPhoneNumber": .bool(self.`hasVerifiedPhoneNumber`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UserState {
    let values = try value.object()

    return try UserState(`id`: try (values["id"] ?? .undefined).string(), `externalId`: try (values["externalId"] ?? .undefined).optional { value in try value.string() }, `primaryEmailAddressId`: try (values["primaryEmailAddressId"] ?? .undefined).optional { value in try value.string() }, `primaryEmailAddress`: try (values["primaryEmailAddress"] ?? .undefined).optional { value in try EmailAddress.decode(value, in: runtime) }, `primaryPhoneNumberId`: try (values["primaryPhoneNumberId"] ?? .undefined).optional { value in try value.string() }, `primaryPhoneNumber`: try (values["primaryPhoneNumber"] ?? .undefined).optional { value in try PhoneNumber.decode(value, in: runtime) }, `primaryWeb3WalletId`: try (values["primaryWeb3WalletId"] ?? .undefined).optional { value in try value.string() }, `primaryWeb3Wallet`: try (values["primaryWeb3Wallet"] ?? .undefined).optional { value in try Web3Wallet.decode(value, in: runtime) }, `username`: try (values["username"] ?? .undefined).optional { value in try value.string() }, `fullName`: try (values["fullName"] ?? .undefined).optional { value in try value.string() }, `firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `imageUrl`: try (values["imageUrl"] ?? .undefined).string(), `hasImage`: try (values["hasImage"] ?? .undefined).bool(), `emailAddresses`: try (values["emailAddresses"] ?? .undefined).array().map { value in try EmailAddress.decode(value, in: runtime) }, `phoneNumbers`: try (values["phoneNumbers"] ?? .undefined).array().map { value in try PhoneNumber.decode(value, in: runtime) }, `web3Wallets`: try (values["web3Wallets"] ?? .undefined).array().map { value in try Web3Wallet.decode(value, in: runtime) }, `externalAccounts`: try (values["externalAccounts"] ?? .undefined).array().map { value in try ExternalAccount.decode(value, in: runtime) }, `enterpriseAccounts`: try (values["enterpriseAccounts"] ?? .undefined).array().map { value in try EnterpriseAccount.decode(value, in: runtime) }, `passkeys`: try (values["passkeys"] ?? .undefined).array().map { value in try Passkey.decode(value, in: runtime) }, `organizationMemberships`: try (values["organizationMemberships"] ?? .undefined).array().map { value in try OrganizationMembership.decode(value, in: runtime) }, `passwordEnabled`: try (values["passwordEnabled"] ?? .undefined).bool(), `totpEnabled`: try (values["totpEnabled"] ?? .undefined).bool(), `backupCodeEnabled`: try (values["backupCodeEnabled"] ?? .undefined).bool(), `twoFactorEnabled`: try (values["twoFactorEnabled"] ?? .undefined).bool(), `publicMetadata`: try (values["publicMetadata"] ?? .undefined).object(), `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).object(), `lastSignInAt`: try (values["lastSignInAt"] ?? .undefined).optional { value in try value.date() }, `legalAcceptedAt`: try (values["legalAcceptedAt"] ?? .undefined).optional { value in try value.date() }, `createOrganizationEnabled`: try (values["createOrganizationEnabled"] ?? .undefined).bool(), `createOrganizationsLimit`: try (values["createOrganizationsLimit"] ?? .undefined).optional { value in try value.number() }, `deleteSelfEnabled`: try (values["deleteSelfEnabled"] ?? .undefined).bool(), `updatedAt`: try (values["updatedAt"] ?? .undefined).optional { value in try value.date() }, `createdAt`: try (values["createdAt"] ?? .undefined).optional { value in try value.date() }, `verifiedExternalAccounts`: try (values["verifiedExternalAccounts"] ?? .undefined).array().map { value in try ExternalAccount.decode(value, in: runtime) }, `unverifiedExternalAccounts`: try (values["unverifiedExternalAccounts"] ?? .undefined).array().map { value in try ExternalAccount.decode(value, in: runtime) }, `verifiedWeb3Wallets`: try (values["verifiedWeb3Wallets"] ?? .undefined).array().map { value in try Web3Wallet.decode(value, in: runtime) }, `hasVerifiedEmailAddress`: try (values["hasVerifiedEmailAddress"] ?? .undefined).bool(), `hasVerifiedPhoneNumber`: try (values["hasVerifiedPhoneNumber"] ?? .undefined).bool())
  }
}
@MainActor @Observable public final class User: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: UserState { context.state(handle, as: UserState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `externalId`: String? { state.`externalId` }
  public var `primaryEmailAddressId`: String? { state.`primaryEmailAddressId` }
  public var `primaryEmailAddress`: EmailAddress? { state.`primaryEmailAddress` }
  public var `primaryPhoneNumberId`: String? { state.`primaryPhoneNumberId` }
  public var `primaryPhoneNumber`: PhoneNumber? { state.`primaryPhoneNumber` }
  public var `primaryWeb3WalletId`: String? { state.`primaryWeb3WalletId` }
  public var `primaryWeb3Wallet`: Web3Wallet? { state.`primaryWeb3Wallet` }
  public var `username`: String? { state.`username` }
  public var `fullName`: String? { state.`fullName` }
  public var `firstName`: String? { state.`firstName` }
  public var `lastName`: String? { state.`lastName` }
  public var `imageUrl`: String { state.`imageUrl` }
  public var `hasImage`: Bool { state.`hasImage` }
  public var `emailAddresses`: [EmailAddress] { state.`emailAddresses` }
  public var `phoneNumbers`: [PhoneNumber] { state.`phoneNumbers` }
  public var `web3Wallets`: [Web3Wallet] { state.`web3Wallets` }
  public var `externalAccounts`: [ExternalAccount] { state.`externalAccounts` }
  public var `enterpriseAccounts`: [EnterpriseAccount] { state.`enterpriseAccounts` }
  public var `passkeys`: [Passkey] { state.`passkeys` }
  public var `organizationMemberships`: [OrganizationMembership] { state.`organizationMemberships` }
  public var `passwordEnabled`: Bool { state.`passwordEnabled` }
  public var `totpEnabled`: Bool { state.`totpEnabled` }
  public var `backupCodeEnabled`: Bool { state.`backupCodeEnabled` }
  public var `twoFactorEnabled`: Bool { state.`twoFactorEnabled` }
  public var `publicMetadata`: [String: JSONValue] { state.`publicMetadata` }
  public var `unsafeMetadata`: [String: JSONValue] { state.`unsafeMetadata` }
  public var `lastSignInAt`: Date? { state.`lastSignInAt` }
  public var `legalAcceptedAt`: Date? { state.`legalAcceptedAt` }
  public var `createOrganizationEnabled`: Bool { state.`createOrganizationEnabled` }
  public var `createOrganizationsLimit`: Double? { state.`createOrganizationsLimit` }
  public var `deleteSelfEnabled`: Bool { state.`deleteSelfEnabled` }
  public var `updatedAt`: Date? { state.`updatedAt` }
  public var `createdAt`: Date? { state.`createdAt` }
  public var `verifiedExternalAccounts`: [ExternalAccount] { state.`verifiedExternalAccounts` }
  public var `unverifiedExternalAccounts`: [ExternalAccount] { state.`unverifiedExternalAccounts` }
  public var `verifiedWeb3Wallets`: [Web3Wallet] { state.`verifiedWeb3Wallets` }
  public var `hasVerifiedEmailAddress`: Bool { state.`hasVerifiedEmailAddress` }
  public var `hasVerifiedPhoneNumber`: Bool { state.`hasVerifiedPhoneNumber` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try UserState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> User { try runtime.resource(ResourceHandle.decodeReference(value), as: User.self) }
  /// Updates the user's attributes. Use this method to save information you collected about the user.
  ///
  /// The appropriate settings must be enabled in the Clerk Dashboard for the user to be able to update their attributes. For example, if you want to use the `update({ firstName })` method, you must enable the **First and last name** setting. It can be found on the [**User & authentication**](https://dashboard.clerk.com/~/user-authentication/user-and-authentication?user_auth_tab=user-profile) page in the Clerk Dashboard.
  public func `update`(_ `params`: UpdateUserParams) async throws -> User {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.update", arguments: [try `params`.encode()]) { result in
      return try User.decode(result, in: runtime)
    }
  }
  /// Updates the user's `unsafeMetadata` using deep-merge semantics. Unlike [`update()`](https://clerk.com/docs/reference/objects/user#update), which fully replaces `unsafeMetadata`, this method merges the provided value with the existing `unsafeMetadata`. Top-level and nested keys are merged, and any key set to `null` is removed. Only `unsafeMetadata` is writable from the frontend; `publicMetadata` and `privateMetadata` can only be set from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}.
  public func `updateMetadata`(_ `params`: UpdateUserMetadataParams) async throws -> User {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.updateMetadata", arguments: [try `params`.encode()]) { result in
      return try User.decode(result, in: runtime)
    }
  }
  /// Deletes the current user.
  public func `delete`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.delete", arguments: []) { result in
      _ = result
    }
  }
  /// Updates the user's password.
  public func `updatePassword`(_ `params`: UpdateUserPasswordParams) async throws -> User {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.updatePassword", arguments: [try `params`.encode()]) { result in
      return try User.decode(result, in: runtime)
    }
  }
  /// Removes the user's password.
  public func `removePassword`(_ `params`: RemoveUserPasswordParams) async throws -> User {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.removePassword", arguments: [try `params`.encode()]) { result in
      return try User.decode(result, in: runtime)
    }
  }
  /// Adds an email address for the user. A new [`EmailAddress`](https://clerk.com/docs/reference/types/email-address) will be created and associated with the user.
  ///
  /// > [!WARNING]
  /// > [**Email** must be enabled](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) in your app's settings in the Clerk Dashboard.
  public func `createEmailAddress`(_ `params`: CreateEmailAddressParams) async throws -> EmailAddress {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.createEmailAddress", arguments: [try `params`.encode()]) { result in
      return try EmailAddress.decode(result, in: runtime)
    }
  }
  /// Creates a passkey for the signed-in user. For an example, see the [custom flow guide](https://clerk.com/docs/guides/development/custom-flows/authentication/passkeys#create-user-passkeys).
  public func `createPasskey`() async throws -> Passkey {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.createPasskey", arguments: []) { result in
      return try Passkey.decode(result, in: runtime)
    }
  }
  /// Adds a phone number for the user. A new [`PhoneNumber`](https://clerk.com/docs/reference/types/phone-number) will be created and associated with the user.
  ///
  /// > [!WARNING]
  /// > [**Phone** must be enabled](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) in your app's settings in the Clerk Dashboard.
  public func `createPhoneNumber`(_ `params`: CreatePhoneNumberParams) async throws -> PhoneNumber {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.createPhoneNumber", arguments: [try `params`.encode()]) { result in
      return try PhoneNumber.decode(result, in: runtime)
    }
  }
  /// Adds a Web3 wallet for the user. A new [`Web3WalletResource`](https://clerk.com/docs/reference/types/web3-wallet) will be created and associated with the user.
  public func `createWeb3Wallet`(_ `params`: CreateWeb3WalletParams) async throws -> Web3Wallet {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.createWeb3Wallet", arguments: [try `params`.encode()]) { result in
      return try Web3Wallet.decode(result, in: runtime)
    }
  }
  /// A check whether or not the given resource is the primary identifier for the user.
  public func `isPrimaryIdentification`(_ `ident`: UserIsPrimaryIdentificationIdent) async throws -> Bool {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.isPrimaryIdentification", arguments: [try `ident`.encode()]) { result in
      return try result.bool()
    }
  }
  /// Gets all **active** sessions for this user. This method uses a cache so a network request will only be triggered only once.
  public func `getSessions`() async throws -> [SessionWithActivities] {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.getSessions", arguments: []) { result in
      return try result.array().map { value in try SessionWithActivities.decode(value, in: runtime) }
    }
  }
  /// Adds the user's profile image or replaces it if one already exists. This method will upload an image and associate it with the user.
  public func `setProfileImage`(_ `params`: SetProfileImageParams) async throws -> ImageResource {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.setProfileImage", arguments: [try `params`.encode()]) { result in
      return try ImageResource.decode(result, in: runtime)
    }
  }
  /// Adds an external account for the user. A new [`ExternalAccount`](https://clerk.com/docs/reference/types/external-account) will be created and associated with the user. This method is useful if you want to allow an already signed-in user to connect their account with an external provider, such as Facebook, GitHub, etc., so that they can sign in with that provider in the future.
  ///
  /// > [!WARNING]
  /// > The social provider that you want to connect to [must be enabled](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#sso-connections) in your app's settings in the Clerk Dashboard.
  public func `createExternalAccount`(_ `params`: CreateExternalAccountParams) async throws -> ExternalAccount {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.createExternalAccount", arguments: [try `params`.encode()]) { result in
      return try ExternalAccount.decode(result, in: runtime)
    }
  }
  public func `getOrganizationMemberships`(_ `params`: GetUserOrganizationMembershipParams? = nil) async throws -> ClerkPaginatedResponseOrganizationMembership {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.getOrganizationMemberships", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ClerkPaginatedResponseOrganizationMembership.decode(result, in: runtime)
    }
  }
  /// Gets a list of Organization invitations for the user.
  public func `getOrganizationInvitations`(_ `params`: GetUserOrganizationInvitationsParams? = nil) async throws -> ClerkPaginatedResponseUserOrganizationInvitation {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.getOrganizationInvitations", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ClerkPaginatedResponseUserOrganizationInvitation.decode(result, in: runtime)
    }
  }
  /// Gets a list of Organization suggestions for the user.
  public func `getOrganizationSuggestions`(_ `params`: GetUserOrganizationSuggestionsParams? = nil) async throws -> ClerkPaginatedResponseOrganizationSuggestion {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.getOrganizationSuggestions", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ClerkPaginatedResponseOrganizationSuggestion.decode(result, in: runtime)
    }
  }
  /// Gets organization creation defaults for the current user.
  public func `getOrganizationCreationDefaults`() async throws -> OrganizationCreationDefaults {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.getOrganizationCreationDefaults", arguments: []) { result in
      return try OrganizationCreationDefaults.decode(result, in: runtime)
    }
  }
  /// Leaves an organization that the user is a member of.
  public func `leaveOrganization`(_ `organizationId`: String) async throws -> DeletedObject {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.leaveOrganization", arguments: [.string(`organizationId`)]) { result in
      return try DeletedObject.decode(result, in: runtime)
    }
  }
  /// Get the enterprise connections for the current user. This method is not intended for public use.
  /// Currently some customers use this to get enterprise connections for account linking purposes.
  public func `getEnterpriseConnections`(_ `params`: GetEnterpriseConnectionsParams? = nil) async throws -> [EnterpriseConnection] {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.getEnterpriseConnections", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try result.array().map { value in try EnterpriseConnection.decode(value, in: runtime) }
    }
  }
  /// Generates a TOTP secret for a user that can be used to register the application on the user's authenticator app of choice. If this method is called again (while still unverified), it replaces the previously generated secret.
  public func `createTOTP`() async throws -> TOTP {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.createTOTP", arguments: []) { result in
      return try TOTP.decode(result, in: runtime)
    }
  }
  /// Verifies a TOTP secret after a user has created it. The user must provide a code from their authenticator app that has been generated using the previously created secret. This way, correct set up and ownership of the authenticator app can be validated.
  public func `verifyTOTP`(_ `params`: VerifyTOTPParams) async throws -> TOTP {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.verifyTOTP", arguments: [try `params`.encode()]) { result in
      return try TOTP.decode(result, in: runtime)
    }
  }
  /// Disables TOTP by deleting the user's TOTP secret.
  public func `disableTOTP`() async throws -> DeletedObject {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.disableTOTP", arguments: []) { result in
      return try DeletedObject.decode(result, in: runtime)
    }
  }
  /// Generates a fresh new set of backup codes for the user. Every time the method is called, it will replace the previously generated backup codes.
  public func `createBackupCode`() async throws -> BackupCode {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.createBackupCode", arguments: []) { result in
      return try BackupCode.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> User {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try User.decode(result, in: runtime)
    }
  }
  /// Initializes a payment method.
  public func `initializePaymentMethod`(_ `params`: InitializePaymentMethodParams) async throws -> BillingInitializedPaymentMethod {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.initializePaymentMethod", arguments: [try `params`.encode()]) { result in
      return try BillingInitializedPaymentMethod.decode(result, in: runtime)
    }
  }
  /// Adds a payment method.
  public func `addPaymentMethod`(_ `params`: AddPaymentMethodParams) async throws -> BillingPaymentMethod {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.addPaymentMethod", arguments: [try `params`.encode()]) { result in
      return try BillingPaymentMethod.decode(result, in: runtime)
    }
  }
  /// Gets a list of payment methods that have been stored.
  public func `getPaymentMethods`(_ `params`: GetPaymentMethodsParams? = nil) async throws -> ClerkPaginatedResponseBillingPaymentMethod {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "User.getPaymentMethods", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ClerkPaginatedResponseBillingPaymentMethod.decode(result, in: runtime)
    }
  }
}

public struct EmailAddressState: Hashable, Sendable {
  public let `id`: String
  public let `createdAt`: Date?
  public let `emailAddress`: String
  public let `verification`: Verification
  public let `matchesSsoConnection`: Bool
  public let `linkedTo`: [IdentificationLink]
  public init(`id`: String, `createdAt`: Date? = nil, `emailAddress`: String, `verification`: Verification, `matchesSsoConnection`: Bool, `linkedTo`: [IdentificationLink]) {
    self.`id` = `id`
    self.`createdAt` = `createdAt`
    self.`emailAddress` = `emailAddress`
    self.`verification` = `verification`
    self.`matchesSsoConnection` = `matchesSsoConnection`
    self.`linkedTo` = `linkedTo`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "createdAt": try self.`createdAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .undefined,
      "emailAddress": .string(self.`emailAddress`),
      "verification": try self.`verification`.encode(),
      "matchesSsoConnection": .bool(self.`matchesSsoConnection`),
      "linkedTo": .array(try self.`linkedTo`.map { value in try value.encode() })
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EmailAddressState {
    let values = try value.object()

    return try EmailAddressState(`id`: try (values["id"] ?? .undefined).string(), `createdAt`: try (values["createdAt"] ?? .undefined).optional { value in try value.date() }, `emailAddress`: try (values["emailAddress"] ?? .undefined).string(), `verification`: try Verification.decode((values["verification"] ?? .undefined), in: runtime), `matchesSsoConnection`: try (values["matchesSsoConnection"] ?? .undefined).bool(), `linkedTo`: try (values["linkedTo"] ?? .undefined).array().map { value in try IdentificationLink.decode(value, in: runtime) })
  }
}
@MainActor @Observable public final class EmailAddress: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: EmailAddressState { context.state(handle, as: EmailAddressState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `createdAt`: Date? { state.`createdAt` }
  public var `emailAddress`: String { state.`emailAddress` }
  public var `verification`: Verification { state.`verification` }
  public var `matchesSsoConnection`: Bool { state.`matchesSsoConnection` }
  public var `linkedTo`: [IdentificationLink] { state.`linkedTo` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try EmailAddressState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EmailAddress { try runtime.resource(ResourceHandle.decodeReference(value), as: EmailAddress.self) }
  /// Returns a string representation of an object.
  public func `stringValue`() async throws -> String {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EmailAddress.toString", arguments: []) { result in
      return try result.string()
    }
  }
  public func `prepareVerification`(_ `params`: PrepareEmailAddressVerificationParams) async throws -> EmailAddress {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EmailAddress.prepareVerification", arguments: [try `params`.encode()]) { result in
      return try EmailAddress.decode(result, in: runtime)
    }
  }
  public func `attemptVerification`(_ `params`: AttemptEmailAddressVerificationParams) async throws -> EmailAddress {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EmailAddress.attemptVerification", arguments: [try `params`.encode()]) { result in
      return try EmailAddress.decode(result, in: runtime)
    }
  }
  public func `createEmailLinkFlow`() async throws -> CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EmailAddress.createEmailLinkFlow", arguments: []) { result in
      return try CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress.decode(result, in: runtime)
    }
  }
  public func `createEnterpriseSSOLinkFlow`() async throws -> CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EmailAddress.createEnterpriseSSOLinkFlow", arguments: []) { result in
      return try CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress.decode(result, in: runtime)
    }
  }
  public func `destroy`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EmailAddress.destroy", arguments: []) { result in
      _ = result
    }
  }
  public func `create`() async throws -> EmailAddress {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EmailAddress.create", arguments: []) { result in
      return try EmailAddress.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> EmailAddress {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EmailAddress.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try EmailAddress.decode(result, in: runtime)
    }
  }
}

public struct VerificationState: Hashable, Sendable {
  public let `attempts`: Double?
  public let `error`: ClerkAPIError?
  public let `expireAt`: Date?
  public let `status`: VerificationStatus?
  public let `strategy`: String?
  public let `verifiedAtClient`: String?
  public let `channel`: PhoneCodeChannel?
  public let `id`: String?
  public init(`attempts`: Double?, `error`: ClerkAPIError?, `expireAt`: Date?, `status`: VerificationStatus?, `strategy`: String?, `verifiedAtClient`: String?, `channel`: PhoneCodeChannel? = nil, `id`: String? = nil) {
    self.`attempts` = `attempts`
    self.`error` = `error`
    self.`expireAt` = `expireAt`
    self.`status` = `status`
    self.`strategy` = `strategy`
    self.`verifiedAtClient` = `verifiedAtClient`
    self.`channel` = `channel`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "attempts": try self.`attempts`.map { value in .number(value) } ?? .null,
      "error": try self.`error`.map { value in try value.encode() } ?? .null,
      "expireAt": try self.`expireAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "status": try self.`status`.map { value in try value.encode() } ?? .null,
      "strategy": try self.`strategy`.map { value in .string(value) } ?? .null,
      "verifiedAtClient": try self.`verifiedAtClient`.map { value in .string(value) } ?? .null,
      "channel": try self.`channel`.map { value in try value.encode() } ?? .undefined,
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> VerificationState {
    let values = try value.object()

    return try VerificationState(`attempts`: try (values["attempts"] ?? .undefined).optional { value in try value.number() }, `error`: try (values["error"] ?? .undefined).optional { value in try ClerkAPIError.decode(value, in: runtime) }, `expireAt`: try (values["expireAt"] ?? .undefined).optional { value in try value.date() }, `status`: try (values["status"] ?? .undefined).optional { value in try VerificationStatus.decode(value, in: runtime) }, `strategy`: try (values["strategy"] ?? .undefined).optional { value in try value.string() }, `verifiedAtClient`: try (values["verifiedAtClient"] ?? .undefined).optional { value in try value.string() }, `channel`: try (values["channel"] ?? .undefined).optional { value in try PhoneCodeChannel.decode(value, in: runtime) }, `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}
@MainActor @Observable public final class Verification: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: VerificationState { context.state(handle, as: VerificationState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `attempts`: Double? { state.`attempts` }
  public var `error`: ClerkAPIError? { state.`error` }
  public var `expireAt`: Date? { state.`expireAt` }
  public var `status`: VerificationStatus? { state.`status` }
  public var `strategy`: String? { state.`strategy` }
  public var `verifiedAtClient`: String? { state.`verifiedAtClient` }
  public var `channel`: PhoneCodeChannel? { state.`channel` }
  public var `id`: String? { state.`id` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try VerificationState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Verification { try runtime.resource(ResourceHandle.decodeReference(value), as: Verification.self) }
  public func `verifiedFromTheSameClient`() async throws -> Bool {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Verification.verifiedFromTheSameClient", arguments: []) { result in
      return try result.bool()
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> Verification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Verification.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try Verification.decode(result, in: runtime)
    }
  }
}

/// An interface that represents an error returned by the Clerk API.
public struct ClerkAPIError: Hashable, Sendable {
  public let `code`: String
  public let `message`: String
  public let `longMessage`: String?
  public let `meta`: ClerkAPIErrorMeta?
  public init(`code`: String, `message`: String, `longMessage`: String? = nil, `meta`: ClerkAPIErrorMeta? = nil) {
    self.`code` = `code`
    self.`message` = `message`
    self.`longMessage` = `longMessage`
    self.`meta` = `meta`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`),
      "message": .string(self.`message`),
      "longMessage": try self.`longMessage`.map { value in .string(value) } ?? .undefined,
      "meta": try self.`meta`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkAPIError {
    let values = try value.object()

    return try ClerkAPIError(`code`: try (values["code"] ?? .undefined).string(), `message`: try (values["message"] ?? .undefined).string(), `longMessage`: try (values["longMessage"] ?? .undefined).optional { value in try value.string() }, `meta`: try (values["meta"] ?? .undefined).optional { value in try ClerkAPIErrorMeta.decode(value, in: runtime) })
  }
}

public struct ClerkAPIErrorMeta: Hashable, Sendable {
  public let `paramName`: String?
  public let `sessionId`: String?
  public let `emailAddresses`: [String]?
  public let `identifiers`: [String]?
  public let `zxcvbn`: ClerkAPIErrorMetaZxcvbn?
  public let `permissions`: [String]?
  public let `plan`: ClerkAPIErrorMetaPlan?
  public let `isPlanUpgradePossible`: Bool?
  public let `seatsQuantityToAdd`: Double?
  public let `seatsQuantity`: Double?
  public init(`paramName`: String? = nil, `sessionId`: String? = nil, `emailAddresses`: [String]? = nil, `identifiers`: [String]? = nil, `zxcvbn`: ClerkAPIErrorMetaZxcvbn? = nil, `permissions`: [String]? = nil, `plan`: ClerkAPIErrorMetaPlan? = nil, `isPlanUpgradePossible`: Bool? = nil, `seatsQuantityToAdd`: Double? = nil, `seatsQuantity`: Double? = nil) {
    self.`paramName` = `paramName`
    self.`sessionId` = `sessionId`
    self.`emailAddresses` = `emailAddresses`
    self.`identifiers` = `identifiers`
    self.`zxcvbn` = `zxcvbn`
    self.`permissions` = `permissions`
    self.`plan` = `plan`
    self.`isPlanUpgradePossible` = `isPlanUpgradePossible`
    self.`seatsQuantityToAdd` = `seatsQuantityToAdd`
    self.`seatsQuantity` = `seatsQuantity`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "paramName": try self.`paramName`.map { value in .string(value) } ?? .undefined,
      "sessionId": try self.`sessionId`.map { value in .string(value) } ?? .undefined,
      "emailAddresses": try self.`emailAddresses`.map { value in .array(try value.map { value in .string(value) }) } ?? .undefined,
      "identifiers": try self.`identifiers`.map { value in .array(try value.map { value in .string(value) }) } ?? .undefined,
      "zxcvbn": try self.`zxcvbn`.map { value in try value.encode() } ?? .undefined,
      "permissions": try self.`permissions`.map { value in .array(try value.map { value in .string(value) }) } ?? .undefined,
      "plan": try self.`plan`.map { value in try value.encode() } ?? .undefined,
      "isPlanUpgradePossible": try self.`isPlanUpgradePossible`.map { value in .bool(value) } ?? .undefined,
      "seatsQuantityToAdd": try self.`seatsQuantityToAdd`.map { value in .number(value) } ?? .undefined,
      "seatsQuantity": try self.`seatsQuantity`.map { value in .number(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkAPIErrorMeta {
    let values = try value.object()

    return try ClerkAPIErrorMeta(`paramName`: try (values["paramName"] ?? .undefined).optional { value in try value.string() }, `sessionId`: try (values["sessionId"] ?? .undefined).optional { value in try value.string() }, `emailAddresses`: try (values["emailAddresses"] ?? .undefined).optional { value in try value.array().map { value in try value.string() } }, `identifiers`: try (values["identifiers"] ?? .undefined).optional { value in try value.array().map { value in try value.string() } }, `zxcvbn`: try (values["zxcvbn"] ?? .undefined).optional { value in try ClerkAPIErrorMetaZxcvbn.decode(value, in: runtime) }, `permissions`: try (values["permissions"] ?? .undefined).optional { value in try value.array().map { value in try value.string() } }, `plan`: try (values["plan"] ?? .undefined).optional { value in try ClerkAPIErrorMetaPlan.decode(value, in: runtime) }, `isPlanUpgradePossible`: try (values["isPlanUpgradePossible"] ?? .undefined).optional { value in try value.bool() }, `seatsQuantityToAdd`: try (values["seatsQuantityToAdd"] ?? .undefined).optional { value in try value.number() }, `seatsQuantity`: try (values["seatsQuantity"] ?? .undefined).optional { value in try value.number() })
  }
}

public struct ClerkAPIErrorMetaZxcvbn: Hashable, Sendable {
  public let `suggestions`: [ClerkAPIErrorMetaZxcvbnSuggestionsElement]
  public init(`suggestions`: [ClerkAPIErrorMetaZxcvbnSuggestionsElement]) {
    self.`suggestions` = `suggestions`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "suggestions": .array(try self.`suggestions`.map { value in try value.encode() })
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkAPIErrorMetaZxcvbn {
    let values = try value.object()

    return try ClerkAPIErrorMetaZxcvbn(`suggestions`: try (values["suggestions"] ?? .undefined).array().map { value in try ClerkAPIErrorMetaZxcvbnSuggestionsElement.decode(value, in: runtime) })
  }
}

public struct ClerkAPIErrorMetaZxcvbnSuggestionsElement: Hashable, Sendable {
  public let `code`: String
  public let `message`: String
  public init(`code`: String, `message`: String) {
    self.`code` = `code`
    self.`message` = `message`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`),
      "message": .string(self.`message`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkAPIErrorMetaZxcvbnSuggestionsElement {
    let values = try value.object()

    return try ClerkAPIErrorMetaZxcvbnSuggestionsElement(`code`: try (values["code"] ?? .undefined).string(), `message`: try (values["message"] ?? .undefined).string())
  }
}

public struct ClerkAPIErrorMetaPlan: Hashable, Sendable {
  public let `amountFormatted`: String
  public let `annualMonthlyAmountFormatted`: String
  public let `currencySymbol`: String
  public let `id`: String
  public let `name`: String
  public init(`amountFormatted`: String, `annualMonthlyAmountFormatted`: String, `currencySymbol`: String, `id`: String, `name`: String) {
    self.`amountFormatted` = `amountFormatted`
    self.`annualMonthlyAmountFormatted` = `annualMonthlyAmountFormatted`
    self.`currencySymbol` = `currencySymbol`
    self.`id` = `id`
    self.`name` = `name`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "amount_formatted": .string(self.`amountFormatted`),
      "annual_monthly_amount_formatted": .string(self.`annualMonthlyAmountFormatted`),
      "currency_symbol": .string(self.`currencySymbol`),
      "id": .string(self.`id`),
      "name": .string(self.`name`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkAPIErrorMetaPlan {
    let values = try value.object()

    return try ClerkAPIErrorMetaPlan(`amountFormatted`: try (values["amount_formatted"] ?? .undefined).string(), `annualMonthlyAmountFormatted`: try (values["annual_monthly_amount_formatted"] ?? .undefined).string(), `currencySymbol`: try (values["currency_symbol"] ?? .undefined).string(), `id`: try (values["id"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).string())
  }
}

public enum VerificationStatus: Hashable, Sendable {
  case `unverified`
  case `verified`
  case `failed`
  case `expired`
  case `transferable`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`unverified`: return "unverified"
    case .`verified`: return "verified"
    case .`failed`: return "failed"
    case .`expired`: return "expired"
    case .`transferable`: return "transferable"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "unverified": self = .`unverified`
    case "verified": self = .`verified`
    case "failed": self = .`failed`
    case "expired": self = .`expired`
    case "transferable": self = .`transferable`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> VerificationStatus { .init(rawValue: try value.string()) }
}

public enum PhoneCodeChannel: Hashable, Sendable {
  case `sms`
  case `whatsapp`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`sms`: return "sms"
    case .`whatsapp`: return "whatsapp"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "sms": self = .`sms`
    case "whatsapp": self = .`whatsapp`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PhoneCodeChannel { .init(rawValue: try value.string()) }
}

public struct IdentificationLinkState: Hashable, Sendable {
  public let `id`: String
  public let `type`: String
  public init(`id`: String, `type`: String) {
    self.`id` = `id`
    self.`type` = `type`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "type": .string(self.`type`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> IdentificationLinkState {
    let values = try value.object()

    return try IdentificationLinkState(`id`: try (values["id"] ?? .undefined).string(), `type`: try (values["type"] ?? .undefined).string())
  }
}
@MainActor @Observable public final class IdentificationLink: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: IdentificationLinkState { context.state(handle, as: IdentificationLinkState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `type`: String { state.`type` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try IdentificationLinkState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> IdentificationLink { try runtime.resource(ResourceHandle.decodeReference(value), as: IdentificationLink.self) }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> IdentificationLink {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "IdentificationLink.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try IdentificationLink.decode(result, in: runtime)
    }
  }
}

public indirect enum PrepareEmailAddressVerificationParams: Hashable, Sendable {
  case case1(EmailAddressPrepareVerificationParamsCase1)
  case case2(EmailAddressPrepareVerificationParamsCase2)
  @MainActor public var `strategy`: String {
    switch self {
    case .case1(let value): return value.`strategy`
    case .case2(let value): return value.`strategy`.rawValue
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PrepareEmailAddressVerificationParams {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try EmailAddressPrepareVerificationParamsCase1.decode(payload, in: runtime))
    case 1: return .case2(try EmailAddressPrepareVerificationParamsCase2.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct EmailAddressPrepareVerificationParamsCase1: Hashable, Sendable {
  public var `strategy`: String { "email_code" }
  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("email_code")
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EmailAddressPrepareVerificationParamsCase1 {
    let values = try value.object()
    guard values["strategy"] == .string("email_code") else { throw CoreError.invalidValue }
    return try EmailAddressPrepareVerificationParamsCase1()
  }
}

public struct EmailAddressPrepareVerificationParamsCase2: Hashable, Sendable {
  public let `strategy`: EmailAddressPrepareVerificationParamsCase2Strategy
  public let `redirectUrl`: String
  public init(`strategy`: EmailAddressPrepareVerificationParamsCase2Strategy, `redirectUrl`: String) {
    self.`strategy` = `strategy`
    self.`redirectUrl` = `redirectUrl`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": try self.`strategy`.encode(),
      "redirectUrl": .string(self.`redirectUrl`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EmailAddressPrepareVerificationParamsCase2 {
    let values = try value.object()

    return try EmailAddressPrepareVerificationParamsCase2(`strategy`: try EmailAddressPrepareVerificationParamsCase2Strategy.decode((values["strategy"] ?? .undefined), in: runtime), `redirectUrl`: try (values["redirectUrl"] ?? .undefined).string())
  }
}

public enum EmailAddressPrepareVerificationParamsCase2Strategy: Hashable, Sendable {
  case `emailLink`
  case `enterpriseSso`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`emailLink`: return "email_link"
    case .`enterpriseSso`: return "enterprise_sso"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "email_link": self = .`emailLink`
    case "enterprise_sso": self = .`enterpriseSso`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EmailAddressPrepareVerificationParamsCase2Strategy { .init(rawValue: try value.string()) }
}

public struct AttemptEmailAddressVerificationParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AttemptEmailAddressVerificationParams {
    let values = try value.object()

    return try AttemptEmailAddressVerificationParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState: Hashable, Sendable {

  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [:
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState {
    let values = try value.object()

    return try CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState()
  }
}
@MainActor @Observable public final class CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState { context.state(handle, as: CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }

  public func prepare(_ value: JSONValue) throws -> any Sendable { try CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress { try runtime.resource(ResourceHandle.decodeReference(value), as: CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress.self) }
  public func `startEmailLinkFlow`(_ `params`: StartEmailLinkFlowParams) async throws -> EmailAddress {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress.startEmailLinkFlow", arguments: [try `params`.encode()]) { result in
      return try EmailAddress.decode(result, in: runtime)
    }
  }
  public func `cancelEmailLinkFlow`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress.cancelEmailLinkFlow", arguments: []) { result in
      _ = result
    }
  }
}

public struct StartEmailLinkFlowParams: Hashable, Sendable {
  public let `redirectUrl`: String
  public init(`redirectUrl`: String) {
    self.`redirectUrl` = `redirectUrl`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "redirectUrl": .string(self.`redirectUrl`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> StartEmailLinkFlowParams {
    let values = try value.object()

    return try StartEmailLinkFlowParams(`redirectUrl`: try (values["redirectUrl"] ?? .undefined).string())
  }
}

public struct CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState: Hashable, Sendable {

  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [:
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState {
    let values = try value.object()

    return try CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState()
  }
}
@MainActor @Observable public final class CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState { context.state(handle, as: CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }

  public func prepare(_ value: JSONValue) throws -> any Sendable { try CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress { try runtime.resource(ResourceHandle.decodeReference(value), as: CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress.self) }
  public func `startEnterpriseSSOLinkFlow`(_ `params`: StartEnterpriseSSOLinkFlowParams) async throws -> EmailAddress {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress.startEnterpriseSSOLinkFlow", arguments: [try `params`.encode()]) { result in
      return try EmailAddress.decode(result, in: runtime)
    }
  }
  public func `cancelEnterpriseSSOLinkFlow`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress.cancelEnterpriseSSOLinkFlow", arguments: []) { result in
      _ = result
    }
  }
}

public struct StartEnterpriseSSOLinkFlowParams: Hashable, Sendable {
  public let `redirectUrl`: String
  public init(`redirectUrl`: String) {
    self.`redirectUrl` = `redirectUrl`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "redirectUrl": .string(self.`redirectUrl`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> StartEnterpriseSSOLinkFlowParams {
    let values = try value.object()

    return try StartEnterpriseSSOLinkFlowParams(`redirectUrl`: try (values["redirectUrl"] ?? .undefined).string())
  }
}

public struct PhoneNumberState: Hashable, Sendable {
  public let `id`: String
  public let `createdAt`: Date?
  public let `phoneNumber`: String
  public let `verification`: Verification
  public let `reservedForSecondFactor`: Bool
  public let `defaultSecondFactor`: Bool
  public let `linkedTo`: [IdentificationLink]
  public init(`id`: String, `createdAt`: Date? = nil, `phoneNumber`: String, `verification`: Verification, `reservedForSecondFactor`: Bool, `defaultSecondFactor`: Bool, `linkedTo`: [IdentificationLink]) {
    self.`id` = `id`
    self.`createdAt` = `createdAt`
    self.`phoneNumber` = `phoneNumber`
    self.`verification` = `verification`
    self.`reservedForSecondFactor` = `reservedForSecondFactor`
    self.`defaultSecondFactor` = `defaultSecondFactor`
    self.`linkedTo` = `linkedTo`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "createdAt": try self.`createdAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .undefined,
      "phoneNumber": .string(self.`phoneNumber`),
      "verification": try self.`verification`.encode(),
      "reservedForSecondFactor": .bool(self.`reservedForSecondFactor`),
      "defaultSecondFactor": .bool(self.`defaultSecondFactor`),
      "linkedTo": .array(try self.`linkedTo`.map { value in try value.encode() })
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PhoneNumberState {
    let values = try value.object()

    return try PhoneNumberState(`id`: try (values["id"] ?? .undefined).string(), `createdAt`: try (values["createdAt"] ?? .undefined).optional { value in try value.date() }, `phoneNumber`: try (values["phoneNumber"] ?? .undefined).string(), `verification`: try Verification.decode((values["verification"] ?? .undefined), in: runtime), `reservedForSecondFactor`: try (values["reservedForSecondFactor"] ?? .undefined).bool(), `defaultSecondFactor`: try (values["defaultSecondFactor"] ?? .undefined).bool(), `linkedTo`: try (values["linkedTo"] ?? .undefined).array().map { value in try IdentificationLink.decode(value, in: runtime) })
  }
}
@MainActor @Observable public final class PhoneNumber: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: PhoneNumberState { context.state(handle, as: PhoneNumberState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `createdAt`: Date? { state.`createdAt` }
  public var `phoneNumber`: String { state.`phoneNumber` }
  public var `verification`: Verification { state.`verification` }
  public var `reservedForSecondFactor`: Bool { state.`reservedForSecondFactor` }
  public var `defaultSecondFactor`: Bool { state.`defaultSecondFactor` }
  public var `linkedTo`: [IdentificationLink] { state.`linkedTo` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try PhoneNumberState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PhoneNumber { try runtime.resource(ResourceHandle.decodeReference(value), as: PhoneNumber.self) }
  public func `backupCodes`() async throws -> [String]? {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PhoneNumber.backupCodes", arguments: []) { result in
      return try result.optional { value in try value.array().map { value in try value.string() } }
    }
  }
  /// Returns a string representation of an object.
  public func `stringValue`() async throws -> String {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PhoneNumber.toString", arguments: []) { result in
      return try result.string()
    }
  }
  public func `prepareVerification`() async throws -> PhoneNumber {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PhoneNumber.prepareVerification", arguments: []) { result in
      return try PhoneNumber.decode(result, in: runtime)
    }
  }
  public func `attemptVerification`(_ `params`: AttemptPhoneNumberVerificationParams) async throws -> PhoneNumber {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PhoneNumber.attemptVerification", arguments: [try `params`.encode()]) { result in
      return try PhoneNumber.decode(result, in: runtime)
    }
  }
  public func `makeDefaultSecondFactor`() async throws -> PhoneNumber {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PhoneNumber.makeDefaultSecondFactor", arguments: []) { result in
      return try PhoneNumber.decode(result, in: runtime)
    }
  }
  public func `setReservedForSecondFactor`(_ `params`: SetReservedForSecondFactorParams) async throws -> PhoneNumber {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PhoneNumber.setReservedForSecondFactor", arguments: [try `params`.encode()]) { result in
      return try PhoneNumber.decode(result, in: runtime)
    }
  }
  public func `destroy`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PhoneNumber.destroy", arguments: []) { result in
      _ = result
    }
  }
  public func `create`() async throws -> PhoneNumber {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PhoneNumber.create", arguments: []) { result in
      return try PhoneNumber.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> PhoneNumber {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PhoneNumber.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try PhoneNumber.decode(result, in: runtime)
    }
  }
}

public struct AttemptPhoneNumberVerificationParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AttemptPhoneNumberVerificationParams {
    let values = try value.object()

    return try AttemptPhoneNumberVerificationParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct SetReservedForSecondFactorParams: Hashable, Sendable {
  public let `reserved`: Bool
  public init(`reserved`: Bool) {
    self.`reserved` = `reserved`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "reserved": .bool(self.`reserved`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SetReservedForSecondFactorParams {
    let values = try value.object()

    return try SetReservedForSecondFactorParams(`reserved`: try (values["reserved"] ?? .undefined).bool())
  }
}

public struct Web3WalletState: Hashable, Sendable {
  public let `id`: String
  public let `web3Wallet`: String
  public let `verification`: Verification
  public init(`id`: String, `web3Wallet`: String, `verification`: Verification) {
    self.`id` = `id`
    self.`web3Wallet` = `web3Wallet`
    self.`verification` = `verification`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "web3Wallet": .string(self.`web3Wallet`),
      "verification": try self.`verification`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Web3WalletState {
    let values = try value.object()

    return try Web3WalletState(`id`: try (values["id"] ?? .undefined).string(), `web3Wallet`: try (values["web3Wallet"] ?? .undefined).string(), `verification`: try Verification.decode((values["verification"] ?? .undefined), in: runtime))
  }
}
@MainActor @Observable public final class Web3Wallet: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: Web3WalletState { context.state(handle, as: Web3WalletState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `web3Wallet`: String { state.`web3Wallet` }
  public var `verification`: Verification { state.`verification` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try Web3WalletState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Web3Wallet { try runtime.resource(ResourceHandle.decodeReference(value), as: Web3Wallet.self) }
  /// Returns a string representation of an object.
  public func `stringValue`() async throws -> String {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Web3Wallet.toString", arguments: []) { result in
      return try result.string()
    }
  }
  public func `prepareVerification`(_ `params`: PrepareWeb3WalletVerificationParams) async throws -> Web3Wallet {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Web3Wallet.prepareVerification", arguments: [try `params`.encode()]) { result in
      return try Web3Wallet.decode(result, in: runtime)
    }
  }
  public func `attemptVerification`(_ `params`: AttemptWeb3WalletVerificationParams) async throws -> Web3Wallet {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Web3Wallet.attemptVerification", arguments: [try `params`.encode()]) { result in
      return try Web3Wallet.decode(result, in: runtime)
    }
  }
  public func `destroy`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Web3Wallet.destroy", arguments: []) { result in
      _ = result
    }
  }
  public func `create`() async throws -> Web3Wallet {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Web3Wallet.create", arguments: []) { result in
      return try Web3Wallet.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> Web3Wallet {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Web3Wallet.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try Web3Wallet.decode(result, in: runtime)
    }
  }
}

public struct PrepareWeb3WalletVerificationParams: Hashable, Sendable {
  public let `strategy`: PrepareWeb3WalletVerificationParamsStrategy
  public init(`strategy`: PrepareWeb3WalletVerificationParamsStrategy) {
    self.`strategy` = `strategy`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": try self.`strategy`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PrepareWeb3WalletVerificationParams {
    let values = try value.object()

    return try PrepareWeb3WalletVerificationParams(`strategy`: try PrepareWeb3WalletVerificationParamsStrategy.decode((values["strategy"] ?? .undefined), in: runtime))
  }
}

public enum PrepareWeb3WalletVerificationParamsStrategy: Hashable, Sendable {
  case `web3SolanaSignature`
  case `web3MetamaskSignature`
  case `web3CoinbaseWalletSignature`
  case `web3OkxWalletSignature`
  case `web3BaseSignature`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`web3SolanaSignature`: return "web3_solana_signature"
    case .`web3MetamaskSignature`: return "web3_metamask_signature"
    case .`web3CoinbaseWalletSignature`: return "web3_coinbase_wallet_signature"
    case .`web3OkxWalletSignature`: return "web3_okx_wallet_signature"
    case .`web3BaseSignature`: return "web3_base_signature"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "web3_solana_signature": self = .`web3SolanaSignature`
    case "web3_metamask_signature": self = .`web3MetamaskSignature`
    case "web3_coinbase_wallet_signature": self = .`web3CoinbaseWalletSignature`
    case "web3_okx_wallet_signature": self = .`web3OkxWalletSignature`
    case "web3_base_signature": self = .`web3BaseSignature`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PrepareWeb3WalletVerificationParamsStrategy { .init(rawValue: try value.string()) }
}

public struct AttemptWeb3WalletVerificationParams: Hashable, Sendable {
  public let `signature`: String
  public let `strategy`: PrepareWeb3WalletVerificationParamsStrategy?
  public init(`signature`: String, `strategy`: PrepareWeb3WalletVerificationParamsStrategy? = nil) {
    self.`signature` = `signature`
    self.`strategy` = `strategy`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "signature": .string(self.`signature`),
      "strategy": try self.`strategy`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AttemptWeb3WalletVerificationParams {
    let values = try value.object()

    return try AttemptWeb3WalletVerificationParams(`signature`: try (values["signature"] ?? .undefined).string(), `strategy`: try (values["strategy"] ?? .undefined).optional { value in try PrepareWeb3WalletVerificationParamsStrategy.decode(value, in: runtime) })
  }
}

public struct ExternalAccountState: Hashable, Sendable {
  public let `id`: String
  public let `createdAt`: Date?
  public let `identificationId`: String
  public let `provider`: OAuthProvider
  public let `providerUserId`: String
  public let `emailAddress`: String
  public let `approvedScopes`: String
  public let `firstName`: String
  public let `lastName`: String
  public let `imageUrl`: String
  public let `username`: String?
  public let `phoneNumber`: String?
  public let `publicMetadata`: [String: JSONValue]
  public let `label`: String?
  public let `verification`: Verification?
  public init(`id`: String, `createdAt`: Date? = nil, `identificationId`: String, `provider`: OAuthProvider, `providerUserId`: String, `emailAddress`: String, `approvedScopes`: String, `firstName`: String, `lastName`: String, `imageUrl`: String, `username`: String? = nil, `phoneNumber`: String? = nil, `publicMetadata`: [String: JSONValue], `label`: String? = nil, `verification`: Verification?) {
    self.`id` = `id`
    self.`createdAt` = `createdAt`
    self.`identificationId` = `identificationId`
    self.`provider` = `provider`
    self.`providerUserId` = `providerUserId`
    self.`emailAddress` = `emailAddress`
    self.`approvedScopes` = `approvedScopes`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`imageUrl` = `imageUrl`
    self.`username` = `username`
    self.`phoneNumber` = `phoneNumber`
    self.`publicMetadata` = `publicMetadata`
    self.`label` = `label`
    self.`verification` = `verification`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "createdAt": try self.`createdAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .undefined,
      "identificationId": .string(self.`identificationId`),
      "provider": try self.`provider`.encode(),
      "providerUserId": .string(self.`providerUserId`),
      "emailAddress": .string(self.`emailAddress`),
      "approvedScopes": .string(self.`approvedScopes`),
      "firstName": .string(self.`firstName`),
      "lastName": .string(self.`lastName`),
      "imageUrl": .string(self.`imageUrl`),
      "username": try self.`username`.map { value in .string(value) } ?? .undefined,
      "phoneNumber": try self.`phoneNumber`.map { value in .string(value) } ?? .undefined,
      "publicMetadata": .object(try self.`publicMetadata`.mapValues { value in value }),
      "label": try self.`label`.map { value in .string(value) } ?? .undefined,
      "verification": try self.`verification`.map { value in try value.encode() } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ExternalAccountState {
    let values = try value.object()

    return try ExternalAccountState(`id`: try (values["id"] ?? .undefined).string(), `createdAt`: try (values["createdAt"] ?? .undefined).optional { value in try value.date() }, `identificationId`: try (values["identificationId"] ?? .undefined).string(), `provider`: try OAuthProvider.decode((values["provider"] ?? .undefined), in: runtime), `providerUserId`: try (values["providerUserId"] ?? .undefined).string(), `emailAddress`: try (values["emailAddress"] ?? .undefined).string(), `approvedScopes`: try (values["approvedScopes"] ?? .undefined).string(), `firstName`: try (values["firstName"] ?? .undefined).string(), `lastName`: try (values["lastName"] ?? .undefined).string(), `imageUrl`: try (values["imageUrl"] ?? .undefined).string(), `username`: try (values["username"] ?? .undefined).optional { value in try value.string() }, `phoneNumber`: try (values["phoneNumber"] ?? .undefined).optional { value in try value.string() }, `publicMetadata`: try (values["publicMetadata"] ?? .undefined).object().mapValues { value in value }, `label`: try (values["label"] ?? .undefined).optional { value in try value.string() }, `verification`: try (values["verification"] ?? .undefined).optional { value in try Verification.decode(value, in: runtime) })
  }
}
@MainActor @Observable public final class ExternalAccount: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: ExternalAccountState { context.state(handle, as: ExternalAccountState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `createdAt`: Date? { state.`createdAt` }
  public var `identificationId`: String { state.`identificationId` }
  public var `provider`: OAuthProvider { state.`provider` }
  public var `providerUserId`: String { state.`providerUserId` }
  public var `emailAddress`: String { state.`emailAddress` }
  public var `approvedScopes`: String { state.`approvedScopes` }
  public var `firstName`: String { state.`firstName` }
  public var `lastName`: String { state.`lastName` }
  public var `imageUrl`: String { state.`imageUrl` }
  public var `username`: String? { state.`username` }
  public var `phoneNumber`: String? { state.`phoneNumber` }
  public var `publicMetadata`: [String: JSONValue] { state.`publicMetadata` }
  public var `label`: String? { state.`label` }
  public var `verification`: Verification? { state.`verification` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try ExternalAccountState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ExternalAccount { try runtime.resource(ResourceHandle.decodeReference(value), as: ExternalAccount.self) }
  public func `reauthorize`(_ `params`: ReauthorizeExternalAccountParams) async throws -> ExternalAccount {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ExternalAccount.reauthorize", arguments: [try `params`.encode()]) { result in
      return try ExternalAccount.decode(result, in: runtime)
    }
  }
  public func `destroy`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ExternalAccount.destroy", arguments: []) { result in
      _ = result
    }
  }
  public func `providerSlug`() async throws -> OAuthProvider {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ExternalAccount.providerSlug", arguments: []) { result in
      return try OAuthProvider.decode(result, in: runtime)
    }
  }
  public func `providerTitle`() async throws -> String {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ExternalAccount.providerTitle", arguments: []) { result in
      return try result.string()
    }
  }
  public func `accountIdentifier`() async throws -> String {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ExternalAccount.accountIdentifier", arguments: []) { result in
      return try result.string()
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> ExternalAccount {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ExternalAccount.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ExternalAccount.decode(result, in: runtime)
    }
  }
}

/// Represents the available OAuth providers.
public enum OAuthProvider: Hashable, Sendable {
  case `facebook`
  case `google`
  case `hubspot`
  case `github`
  case `tiktok`
  case `gitlab`
  case `discord`
  case `twitter`
  case `twitch`
  case `linkedin`
  case `linkedinOidc`
  case `dropbox`
  case `atlassian`
  case `bitbucket`
  case `microsoft`
  case `notion`
  case `apple`
  case `line`
  case `instagram`
  case `coinbase`
  case `spotify`
  case `xero`
  case `box`
  case `slack`
  case `linear`
  case `x`
  case `enstall`
  case `huggingface`
  case `vercel`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`facebook`: return "facebook"
    case .`google`: return "google"
    case .`hubspot`: return "hubspot"
    case .`github`: return "github"
    case .`tiktok`: return "tiktok"
    case .`gitlab`: return "gitlab"
    case .`discord`: return "discord"
    case .`twitter`: return "twitter"
    case .`twitch`: return "twitch"
    case .`linkedin`: return "linkedin"
    case .`linkedinOidc`: return "linkedin_oidc"
    case .`dropbox`: return "dropbox"
    case .`atlassian`: return "atlassian"
    case .`bitbucket`: return "bitbucket"
    case .`microsoft`: return "microsoft"
    case .`notion`: return "notion"
    case .`apple`: return "apple"
    case .`line`: return "line"
    case .`instagram`: return "instagram"
    case .`coinbase`: return "coinbase"
    case .`spotify`: return "spotify"
    case .`xero`: return "xero"
    case .`box`: return "box"
    case .`slack`: return "slack"
    case .`linear`: return "linear"
    case .`x`: return "x"
    case .`enstall`: return "enstall"
    case .`huggingface`: return "huggingface"
    case .`vercel`: return "vercel"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "facebook": self = .`facebook`
    case "google": self = .`google`
    case "hubspot": self = .`hubspot`
    case "github": self = .`github`
    case "tiktok": self = .`tiktok`
    case "gitlab": self = .`gitlab`
    case "discord": self = .`discord`
    case "twitter": self = .`twitter`
    case "twitch": self = .`twitch`
    case "linkedin": self = .`linkedin`
    case "linkedin_oidc": self = .`linkedinOidc`
    case "dropbox": self = .`dropbox`
    case "atlassian": self = .`atlassian`
    case "bitbucket": self = .`bitbucket`
    case "microsoft": self = .`microsoft`
    case "notion": self = .`notion`
    case "apple": self = .`apple`
    case "line": self = .`line`
    case "instagram": self = .`instagram`
    case "coinbase": self = .`coinbase`
    case "spotify": self = .`spotify`
    case "xero": self = .`xero`
    case "box": self = .`box`
    case "slack": self = .`slack`
    case "linear": self = .`linear`
    case "x": self = .`x`
    case "enstall": self = .`enstall`
    case "huggingface": self = .`huggingface`
    case "vercel": self = .`vercel`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OAuthProvider { .init(rawValue: try value.string()) }
}

public struct ReauthorizeExternalAccountParams: Hashable, Sendable {
  public let `additionalScopes`: [String]?
  public let `oidcPrompt`: String?
  public let `oidcLoginHint`: String?
  public init(`additionalScopes`: [String]? = nil, `oidcPrompt`: String? = nil, `oidcLoginHint`: String? = nil) {
    self.`additionalScopes` = `additionalScopes`
    self.`oidcPrompt` = `oidcPrompt`
    self.`oidcLoginHint` = `oidcLoginHint`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "additionalScopes": try self.`additionalScopes`.map { value in .array(try value.map { value in .string(value) }) } ?? .undefined,
      "oidcPrompt": try self.`oidcPrompt`.map { value in .string(value) } ?? .undefined,
      "oidcLoginHint": try self.`oidcLoginHint`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ReauthorizeExternalAccountParams {
    let values = try value.object()

    return try ReauthorizeExternalAccountParams(`additionalScopes`: try (values["additionalScopes"] ?? .undefined).optional { value in try value.array().map { value in try value.string() } }, `oidcPrompt`: try (values["oidcPrompt"] ?? .undefined).optional { value in try value.string() }, `oidcLoginHint`: try (values["oidcLoginHint"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct EnterpriseAccountState: Hashable, Sendable {
  public let `active`: Bool
  public let `emailAddress`: String
  public let `enterpriseConnection`: EnterpriseAccountConnection?
  public let `enterpriseConnectionId`: String?
  public let `firstName`: String?
  public let `lastName`: String?
  public let `protocol`: EnterpriseProtocol
  public let `provider`: EnterpriseProvider
  public let `providerUserId`: String?
  public let `publicMetadata`: [String: JSONValue]?
  public let `verification`: Verification?
  public let `lastAuthenticatedAt`: Date?
  public let `id`: String?
  public init(`active`: Bool, `emailAddress`: String, `enterpriseConnection`: EnterpriseAccountConnection?, `enterpriseConnectionId`: String?, `firstName`: String?, `lastName`: String?, `protocol`: EnterpriseProtocol, `provider`: EnterpriseProvider, `providerUserId`: String?, `publicMetadata`: [String: JSONValue]?, `verification`: Verification?, `lastAuthenticatedAt`: Date?, `id`: String? = nil) {
    self.`active` = `active`
    self.`emailAddress` = `emailAddress`
    self.`enterpriseConnection` = `enterpriseConnection`
    self.`enterpriseConnectionId` = `enterpriseConnectionId`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`protocol` = `protocol`
    self.`provider` = `provider`
    self.`providerUserId` = `providerUserId`
    self.`publicMetadata` = `publicMetadata`
    self.`verification` = `verification`
    self.`lastAuthenticatedAt` = `lastAuthenticatedAt`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "active": .bool(self.`active`),
      "emailAddress": .string(self.`emailAddress`),
      "enterpriseConnection": try self.`enterpriseConnection`.map { value in try value.encode() } ?? .null,
      "enterpriseConnectionId": try self.`enterpriseConnectionId`.map { value in .string(value) } ?? .null,
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .null,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .null,
      "protocol": try self.`protocol`.encode(),
      "provider": try self.`provider`.encode(),
      "providerUserId": try self.`providerUserId`.map { value in .string(value) } ?? .null,
      "publicMetadata": try self.`publicMetadata`.map { value in .object(try value.mapValues { value in value }) } ?? .null,
      "verification": try self.`verification`.map { value in try value.encode() } ?? .null,
      "lastAuthenticatedAt": try self.`lastAuthenticatedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseAccountState {
    let values = try value.object()

    return try EnterpriseAccountState(`active`: try (values["active"] ?? .undefined).bool(), `emailAddress`: try (values["emailAddress"] ?? .undefined).string(), `enterpriseConnection`: try (values["enterpriseConnection"] ?? .undefined).optional { value in try EnterpriseAccountConnection.decode(value, in: runtime) }, `enterpriseConnectionId`: try (values["enterpriseConnectionId"] ?? .undefined).optional { value in try value.string() }, `firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `protocol`: try EnterpriseProtocol.decode((values["protocol"] ?? .undefined), in: runtime), `provider`: try EnterpriseProvider.decode((values["provider"] ?? .undefined), in: runtime), `providerUserId`: try (values["providerUserId"] ?? .undefined).optional { value in try value.string() }, `publicMetadata`: try (values["publicMetadata"] ?? .undefined).optional { value in try value.object().mapValues { value in value } }, `verification`: try (values["verification"] ?? .undefined).optional { value in try Verification.decode(value, in: runtime) }, `lastAuthenticatedAt`: try (values["lastAuthenticatedAt"] ?? .undefined).optional { value in try value.date() }, `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}
@MainActor @Observable public final class EnterpriseAccount: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: EnterpriseAccountState { context.state(handle, as: EnterpriseAccountState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `active`: Bool { state.`active` }
  public var `emailAddress`: String { state.`emailAddress` }
  public var `enterpriseConnection`: EnterpriseAccountConnection? { state.`enterpriseConnection` }
  public var `enterpriseConnectionId`: String? { state.`enterpriseConnectionId` }
  public var `firstName`: String? { state.`firstName` }
  public var `lastName`: String? { state.`lastName` }
  public var `protocol`: EnterpriseProtocol { state.`protocol` }
  public var `provider`: EnterpriseProvider { state.`provider` }
  public var `providerUserId`: String? { state.`providerUserId` }
  public var `publicMetadata`: [String: JSONValue]? { state.`publicMetadata` }
  public var `verification`: Verification? { state.`verification` }
  public var `lastAuthenticatedAt`: Date? { state.`lastAuthenticatedAt` }
  public var `id`: String? { state.`id` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try EnterpriseAccountState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseAccount { try runtime.resource(ResourceHandle.decodeReference(value), as: EnterpriseAccount.self) }
  public func `destroy`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EnterpriseAccount.destroy", arguments: []) { result in
      _ = result
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> EnterpriseAccount {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EnterpriseAccount.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try EnterpriseAccount.decode(result, in: runtime)
    }
  }
}

public struct EnterpriseAccountConnectionState: Hashable, Sendable {
  public let `active`: Bool
  public let `allowIdpInitiated`: Bool
  public let `allowSubdomains`: Bool
  public let `disableAdditionalIdentifications`: Bool
  public let `domain`: String
  public let `logoPublicUrl`: String?
  public let `name`: String
  public let `protocol`: EnterpriseProtocol
  public let `provider`: EnterpriseProvider
  public let `syncUserAttributes`: Bool
  public let `allowOrganizationAccountLinking`: Bool
  public let `enterpriseConnectionId`: String?
  public let `id`: String?
  public init(`active`: Bool, `allowIdpInitiated`: Bool, `allowSubdomains`: Bool, `disableAdditionalIdentifications`: Bool, `domain`: String, `logoPublicUrl`: String?, `name`: String, `protocol`: EnterpriseProtocol, `provider`: EnterpriseProvider, `syncUserAttributes`: Bool, `allowOrganizationAccountLinking`: Bool, `enterpriseConnectionId`: String?, `id`: String? = nil) {
    self.`active` = `active`
    self.`allowIdpInitiated` = `allowIdpInitiated`
    self.`allowSubdomains` = `allowSubdomains`
    self.`disableAdditionalIdentifications` = `disableAdditionalIdentifications`
    self.`domain` = `domain`
    self.`logoPublicUrl` = `logoPublicUrl`
    self.`name` = `name`
    self.`protocol` = `protocol`
    self.`provider` = `provider`
    self.`syncUserAttributes` = `syncUserAttributes`
    self.`allowOrganizationAccountLinking` = `allowOrganizationAccountLinking`
    self.`enterpriseConnectionId` = `enterpriseConnectionId`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "active": .bool(self.`active`),
      "allowIdpInitiated": .bool(self.`allowIdpInitiated`),
      "allowSubdomains": .bool(self.`allowSubdomains`),
      "disableAdditionalIdentifications": .bool(self.`disableAdditionalIdentifications`),
      "domain": .string(self.`domain`),
      "logoPublicUrl": try self.`logoPublicUrl`.map { value in .string(value) } ?? .null,
      "name": .string(self.`name`),
      "protocol": try self.`protocol`.encode(),
      "provider": try self.`provider`.encode(),
      "syncUserAttributes": .bool(self.`syncUserAttributes`),
      "allowOrganizationAccountLinking": .bool(self.`allowOrganizationAccountLinking`),
      "enterpriseConnectionId": try self.`enterpriseConnectionId`.map { value in .string(value) } ?? .null,
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseAccountConnectionState {
    let values = try value.object()

    return try EnterpriseAccountConnectionState(`active`: try (values["active"] ?? .undefined).bool(), `allowIdpInitiated`: try (values["allowIdpInitiated"] ?? .undefined).bool(), `allowSubdomains`: try (values["allowSubdomains"] ?? .undefined).bool(), `disableAdditionalIdentifications`: try (values["disableAdditionalIdentifications"] ?? .undefined).bool(), `domain`: try (values["domain"] ?? .undefined).string(), `logoPublicUrl`: try (values["logoPublicUrl"] ?? .undefined).optional { value in try value.string() }, `name`: try (values["name"] ?? .undefined).string(), `protocol`: try EnterpriseProtocol.decode((values["protocol"] ?? .undefined), in: runtime), `provider`: try EnterpriseProvider.decode((values["provider"] ?? .undefined), in: runtime), `syncUserAttributes`: try (values["syncUserAttributes"] ?? .undefined).bool(), `allowOrganizationAccountLinking`: try (values["allowOrganizationAccountLinking"] ?? .undefined).bool(), `enterpriseConnectionId`: try (values["enterpriseConnectionId"] ?? .undefined).optional { value in try value.string() }, `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}
@MainActor @Observable public final class EnterpriseAccountConnection: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: EnterpriseAccountConnectionState { context.state(handle, as: EnterpriseAccountConnectionState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `active`: Bool { state.`active` }
  public var `allowIdpInitiated`: Bool { state.`allowIdpInitiated` }
  public var `allowSubdomains`: Bool { state.`allowSubdomains` }
  public var `disableAdditionalIdentifications`: Bool { state.`disableAdditionalIdentifications` }
  public var `domain`: String { state.`domain` }
  public var `logoPublicUrl`: String? { state.`logoPublicUrl` }
  public var `name`: String { state.`name` }
  public var `protocol`: EnterpriseProtocol { state.`protocol` }
  public var `provider`: EnterpriseProvider { state.`provider` }
  public var `syncUserAttributes`: Bool { state.`syncUserAttributes` }
  public var `allowOrganizationAccountLinking`: Bool { state.`allowOrganizationAccountLinking` }
  public var `enterpriseConnectionId`: String? { state.`enterpriseConnectionId` }
  public var `id`: String? { state.`id` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try EnterpriseAccountConnectionState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseAccountConnection { try runtime.resource(ResourceHandle.decodeReference(value), as: EnterpriseAccountConnection.self) }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> EnterpriseAccountConnection {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EnterpriseAccountConnection.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try EnterpriseAccountConnection.decode(result, in: runtime)
    }
  }
}

public enum EnterpriseProtocol: Hashable, Sendable {
  case `saml`
  case `oauth`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`saml`: return "saml"
    case .`oauth`: return "oauth"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "saml": self = .`saml`
    case "oauth": self = .`oauth`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseProtocol { .init(rawValue: try value.string()) }
}

public enum EnterpriseProvider: Hashable, Sendable {
  case `oauthFacebook`
  case `oauthGoogle`
  case `oauthHubspot`
  case `oauthGithub`
  case `oauthTiktok`
  case `oauthGitlab`
  case `oauthDiscord`
  case `oauthTwitter`
  case `oauthTwitch`
  case `oauthLinkedin`
  case `oauthLinkedinOidc`
  case `oauthDropbox`
  case `oauthAtlassian`
  case `oauthBitbucket`
  case `oauthMicrosoft`
  case `oauthNotion`
  case `oauthApple`
  case `oauthLine`
  case `oauthInstagram`
  case `oauthCoinbase`
  case `oauthSpotify`
  case `oauthXero`
  case `oauthBox`
  case `oauthSlack`
  case `oauthLinear`
  case `oauthX`
  case `oauthEnstall`
  case `oauthHuggingface`
  case `oauthVercel`
  case `samlOkta`
  case `samlGoogle`
  case `samlMicrosoft`
  case `samlCustom`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`oauthFacebook`: return "oauth_facebook"
    case .`oauthGoogle`: return "oauth_google"
    case .`oauthHubspot`: return "oauth_hubspot"
    case .`oauthGithub`: return "oauth_github"
    case .`oauthTiktok`: return "oauth_tiktok"
    case .`oauthGitlab`: return "oauth_gitlab"
    case .`oauthDiscord`: return "oauth_discord"
    case .`oauthTwitter`: return "oauth_twitter"
    case .`oauthTwitch`: return "oauth_twitch"
    case .`oauthLinkedin`: return "oauth_linkedin"
    case .`oauthLinkedinOidc`: return "oauth_linkedin_oidc"
    case .`oauthDropbox`: return "oauth_dropbox"
    case .`oauthAtlassian`: return "oauth_atlassian"
    case .`oauthBitbucket`: return "oauth_bitbucket"
    case .`oauthMicrosoft`: return "oauth_microsoft"
    case .`oauthNotion`: return "oauth_notion"
    case .`oauthApple`: return "oauth_apple"
    case .`oauthLine`: return "oauth_line"
    case .`oauthInstagram`: return "oauth_instagram"
    case .`oauthCoinbase`: return "oauth_coinbase"
    case .`oauthSpotify`: return "oauth_spotify"
    case .`oauthXero`: return "oauth_xero"
    case .`oauthBox`: return "oauth_box"
    case .`oauthSlack`: return "oauth_slack"
    case .`oauthLinear`: return "oauth_linear"
    case .`oauthX`: return "oauth_x"
    case .`oauthEnstall`: return "oauth_enstall"
    case .`oauthHuggingface`: return "oauth_huggingface"
    case .`oauthVercel`: return "oauth_vercel"
    case .`samlOkta`: return "saml_okta"
    case .`samlGoogle`: return "saml_google"
    case .`samlMicrosoft`: return "saml_microsoft"
    case .`samlCustom`: return "saml_custom"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "oauth_facebook": self = .`oauthFacebook`
    case "oauth_google": self = .`oauthGoogle`
    case "oauth_hubspot": self = .`oauthHubspot`
    case "oauth_github": self = .`oauthGithub`
    case "oauth_tiktok": self = .`oauthTiktok`
    case "oauth_gitlab": self = .`oauthGitlab`
    case "oauth_discord": self = .`oauthDiscord`
    case "oauth_twitter": self = .`oauthTwitter`
    case "oauth_twitch": self = .`oauthTwitch`
    case "oauth_linkedin": self = .`oauthLinkedin`
    case "oauth_linkedin_oidc": self = .`oauthLinkedinOidc`
    case "oauth_dropbox": self = .`oauthDropbox`
    case "oauth_atlassian": self = .`oauthAtlassian`
    case "oauth_bitbucket": self = .`oauthBitbucket`
    case "oauth_microsoft": self = .`oauthMicrosoft`
    case "oauth_notion": self = .`oauthNotion`
    case "oauth_apple": self = .`oauthApple`
    case "oauth_line": self = .`oauthLine`
    case "oauth_instagram": self = .`oauthInstagram`
    case "oauth_coinbase": self = .`oauthCoinbase`
    case "oauth_spotify": self = .`oauthSpotify`
    case "oauth_xero": self = .`oauthXero`
    case "oauth_box": self = .`oauthBox`
    case "oauth_slack": self = .`oauthSlack`
    case "oauth_linear": self = .`oauthLinear`
    case "oauth_x": self = .`oauthX`
    case "oauth_enstall": self = .`oauthEnstall`
    case "oauth_huggingface": self = .`oauthHuggingface`
    case "oauth_vercel": self = .`oauthVercel`
    case "saml_okta": self = .`samlOkta`
    case "saml_google": self = .`samlGoogle`
    case "saml_microsoft": self = .`samlMicrosoft`
    case "saml_custom": self = .`samlCustom`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseProvider { .init(rawValue: try value.string()) }
}

public struct PasskeyState: Hashable, Sendable {
  public let `id`: String
  public let `name`: String?
  public let `verification`: PasskeyVerification?
  public let `lastUsedAt`: Date?
  public let `updatedAt`: Date
  public let `createdAt`: Date
  public init(`id`: String, `name`: String?, `verification`: PasskeyVerification?, `lastUsedAt`: Date?, `updatedAt`: Date, `createdAt`: Date) {
    self.`id` = `id`
    self.`name` = `name`
    self.`verification` = `verification`
    self.`lastUsedAt` = `lastUsedAt`
    self.`updatedAt` = `updatedAt`
    self.`createdAt` = `createdAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "name": try self.`name`.map { value in .string(value) } ?? .null,
      "verification": try self.`verification`.map { value in try value.encode() } ?? .null,
      "lastUsedAt": try self.`lastUsedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PasskeyState {
    let values = try value.object()

    return try PasskeyState(`id`: try (values["id"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).optional { value in try value.string() }, `verification`: try (values["verification"] ?? .undefined).optional { value in try PasskeyVerification.decode(value, in: runtime) }, `lastUsedAt`: try (values["lastUsedAt"] ?? .undefined).optional { value in try value.date() }, `updatedAt`: try (values["updatedAt"] ?? .undefined).date(), `createdAt`: try (values["createdAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class Passkey: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: PasskeyState { context.state(handle, as: PasskeyState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `name`: String? { state.`name` }
  public var `verification`: PasskeyVerification? { state.`verification` }
  public var `lastUsedAt`: Date? { state.`lastUsedAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public var `createdAt`: Date { state.`createdAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try PasskeyState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Passkey { try runtime.resource(ResourceHandle.decodeReference(value), as: Passkey.self) }
  public func `update`(_ `params`: Partialtype) async throws -> Passkey {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Passkey.update", arguments: [try `params`.encode()]) { result in
      return try Passkey.decode(result, in: runtime)
    }
  }
  public func `delete`() async throws -> DeletedObject {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Passkey.delete", arguments: []) { result in
      return try DeletedObject.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> Passkey {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "Passkey.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try Passkey.decode(result, in: runtime)
    }
  }
}

public struct PasskeyVerificationState: Hashable, Sendable {
  public let `attempts`: Double?
  public let `error`: ClerkAPIError?
  public let `expireAt`: Date?
  public let `status`: VerificationStatus?
  public let `strategy`: String?
  public let `verifiedAtClient`: String?
  public let `channel`: PhoneCodeChannel?
  public let `id`: String?
  public init(`attempts`: Double?, `error`: ClerkAPIError?, `expireAt`: Date?, `status`: VerificationStatus?, `strategy`: String?, `verifiedAtClient`: String?, `channel`: PhoneCodeChannel? = nil, `id`: String? = nil) {
    self.`attempts` = `attempts`
    self.`error` = `error`
    self.`expireAt` = `expireAt`
    self.`status` = `status`
    self.`strategy` = `strategy`
    self.`verifiedAtClient` = `verifiedAtClient`
    self.`channel` = `channel`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "attempts": try self.`attempts`.map { value in .number(value) } ?? .null,
      "error": try self.`error`.map { value in try value.encode() } ?? .null,
      "expireAt": try self.`expireAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "status": try self.`status`.map { value in try value.encode() } ?? .null,
      "strategy": try self.`strategy`.map { value in .string(value) } ?? .null,
      "verifiedAtClient": try self.`verifiedAtClient`.map { value in .string(value) } ?? .null,
      "channel": try self.`channel`.map { value in try value.encode() } ?? .undefined,
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PasskeyVerificationState {
    let values = try value.object()

    return try PasskeyVerificationState(`attempts`: try (values["attempts"] ?? .undefined).optional { value in try value.number() }, `error`: try (values["error"] ?? .undefined).optional { value in try ClerkAPIError.decode(value, in: runtime) }, `expireAt`: try (values["expireAt"] ?? .undefined).optional { value in try value.date() }, `status`: try (values["status"] ?? .undefined).optional { value in try VerificationStatus.decode(value, in: runtime) }, `strategy`: try (values["strategy"] ?? .undefined).optional { value in try value.string() }, `verifiedAtClient`: try (values["verifiedAtClient"] ?? .undefined).optional { value in try value.string() }, `channel`: try (values["channel"] ?? .undefined).optional { value in try PhoneCodeChannel.decode(value, in: runtime) }, `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}
@MainActor @Observable public final class PasskeyVerification: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: PasskeyVerificationState { context.state(handle, as: PasskeyVerificationState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `attempts`: Double? { state.`attempts` }
  public var `error`: ClerkAPIError? { state.`error` }
  public var `expireAt`: Date? { state.`expireAt` }
  public var `status`: VerificationStatus? { state.`status` }
  public var `strategy`: String? { state.`strategy` }
  public var `verifiedAtClient`: String? { state.`verifiedAtClient` }
  public var `channel`: PhoneCodeChannel? { state.`channel` }
  public var `id`: String? { state.`id` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try PasskeyVerificationState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PasskeyVerification { try runtime.resource(ResourceHandle.decodeReference(value), as: PasskeyVerification.self) }
  public func `verifiedFromTheSameClient`() async throws -> Bool {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PasskeyVerification.verifiedFromTheSameClient", arguments: []) { result in
      return try result.bool()
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> PasskeyVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PasskeyVerification.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try PasskeyVerification.decode(result, in: runtime)
    }
  }
}

/// Make all properties in T optional
public struct Partialtype: Hashable, Sendable {
  public let `name`: Field<String>
  public init(`name`: Field<String> = .omitted) {
    self.`name` = `name`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "name": try self.`name`.encode { value in .string(value) }
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Partialtype {
    let values = try value.object()

    return try Partialtype(`name`: try Field.decode((values["name"] ?? .undefined)) { value in try value.string() })
  }
}

public struct UpdateUserParams: Hashable, Sendable {
  public let `username`: Field<String>
  public let `firstName`: Field<String>
  public let `lastName`: Field<String>
  public let `primaryEmailAddressId`: Field<String>
  public let `primaryPhoneNumberId`: Field<String>
  public let `primaryWeb3WalletId`: Field<String>
  public let `unsafeMetadata`: [String: JSONValue]?
  public init(`username`: Field<String> = .omitted, `firstName`: Field<String> = .omitted, `lastName`: Field<String> = .omitted, `primaryEmailAddressId`: Field<String> = .omitted, `primaryPhoneNumberId`: Field<String> = .omitted, `primaryWeb3WalletId`: Field<String> = .omitted, `unsafeMetadata`: [String: JSONValue]? = nil) {
    self.`username` = `username`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`primaryEmailAddressId` = `primaryEmailAddressId`
    self.`primaryPhoneNumberId` = `primaryPhoneNumberId`
    self.`primaryWeb3WalletId` = `primaryWeb3WalletId`
    self.`unsafeMetadata` = `unsafeMetadata`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "username": try self.`username`.encode { value in .string(value) },
      "firstName": try self.`firstName`.encode { value in .string(value) },
      "lastName": try self.`lastName`.encode { value in .string(value) },
      "primaryEmailAddressId": try self.`primaryEmailAddressId`.encode { value in .string(value) },
      "primaryPhoneNumberId": try self.`primaryPhoneNumberId`.encode { value in .string(value) },
      "primaryWeb3WalletId": try self.`primaryWeb3WalletId`.encode { value in .string(value) },
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UpdateUserParams {
    let values = try value.object()

    return try UpdateUserParams(`username`: try Field.decode((values["username"] ?? .undefined)) { value in try value.string() }, `firstName`: try Field.decode((values["firstName"] ?? .undefined)) { value in try value.string() }, `lastName`: try Field.decode((values["lastName"] ?? .undefined)) { value in try value.string() }, `primaryEmailAddressId`: try Field.decode((values["primaryEmailAddressId"] ?? .undefined)) { value in try value.string() }, `primaryPhoneNumberId`: try Field.decode((values["primaryPhoneNumberId"] ?? .undefined)) { value in try value.string() }, `primaryWeb3WalletId`: try Field.decode((values["primaryWeb3WalletId"] ?? .undefined)) { value in try value.string() }, `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() })
  }
}

public struct UpdateUserMetadataParams: Hashable, Sendable {
  public let `unsafeMetadata`: [String: JSONValue]
  public init(`unsafeMetadata`: [String: JSONValue]) {
    self.`unsafeMetadata` = `unsafeMetadata`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "unsafeMetadata": .object(self.`unsafeMetadata`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UpdateUserMetadataParams {
    let values = try value.object()

    return try UpdateUserMetadataParams(`unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).object())
  }
}

public struct UpdateUserPasswordParams: Hashable, Sendable {
  public let `newPassword`: String
  public let `currentPassword`: String?
  public let `signOutOfOtherSessions`: Bool?
  public init(`newPassword`: String, `currentPassword`: String? = nil, `signOutOfOtherSessions`: Bool? = nil) {
    self.`newPassword` = `newPassword`
    self.`currentPassword` = `currentPassword`
    self.`signOutOfOtherSessions` = `signOutOfOtherSessions`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "newPassword": .string(self.`newPassword`),
      "currentPassword": try self.`currentPassword`.map { value in .string(value) } ?? .undefined,
      "signOutOfOtherSessions": try self.`signOutOfOtherSessions`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UpdateUserPasswordParams {
    let values = try value.object()

    return try UpdateUserPasswordParams(`newPassword`: try (values["newPassword"] ?? .undefined).string(), `currentPassword`: try (values["currentPassword"] ?? .undefined).optional { value in try value.string() }, `signOutOfOtherSessions`: try (values["signOutOfOtherSessions"] ?? .undefined).optional { value in try value.bool() })
  }
}

public struct RemoveUserPasswordParams: Hashable, Sendable {
  public let `currentPassword`: String?
  public init(`currentPassword`: String? = nil) {
    self.`currentPassword` = `currentPassword`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "currentPassword": try self.`currentPassword`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> RemoveUserPasswordParams {
    let values = try value.object()

    return try RemoveUserPasswordParams(`currentPassword`: try (values["currentPassword"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct CreateEmailAddressParams: Hashable, Sendable {
  public let `email`: String
  public init(`email`: String) {
    self.`email` = `email`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "email": .string(self.`email`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreateEmailAddressParams {
    let values = try value.object()

    return try CreateEmailAddressParams(`email`: try (values["email"] ?? .undefined).string())
  }
}

public struct CreatePhoneNumberParams: Hashable, Sendable {
  public let `phoneNumber`: String
  public init(`phoneNumber`: String) {
    self.`phoneNumber` = `phoneNumber`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "phoneNumber": .string(self.`phoneNumber`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreatePhoneNumberParams {
    let values = try value.object()

    return try CreatePhoneNumberParams(`phoneNumber`: try (values["phoneNumber"] ?? .undefined).string())
  }
}

public struct CreateWeb3WalletParams: Hashable, Sendable {
  public let `web3Wallet`: String
  public init(`web3Wallet`: String) {
    self.`web3Wallet` = `web3Wallet`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "web3Wallet": .string(self.`web3Wallet`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreateWeb3WalletParams {
    let values = try value.object()

    return try CreateWeb3WalletParams(`web3Wallet`: try (values["web3Wallet"] ?? .undefined).string())
  }
}

public indirect enum UserIsPrimaryIdentificationIdent: Hashable, Sendable {
  case case1(EmailAddress)
  case case2(PhoneNumber)
  case case3(Web3Wallet)
  @MainActor public var `id`: String {
    switch self {
    case .case1(let value): return value.`id`
    case .case2(let value): return value.`id`
    case .case3(let value): return value.`id`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UserIsPrimaryIdentificationIdent {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try EmailAddress.decode(payload, in: runtime))
    case 1: return .case2(try PhoneNumber.decode(payload, in: runtime))
    case 2: return .case3(try Web3Wallet.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct SessionWithActivitiesState: Hashable, Sendable {
  public let `id`: String
  public let `status`: String
  public let `expireAt`: Date
  public let `abandonAt`: Date
  public let `lastActiveAt`: Date
  public let `latestActivity`: SessionActivity
  public let `actor`: [String: JSONValue]?
  public init(`id`: String, `status`: String, `expireAt`: Date, `abandonAt`: Date, `lastActiveAt`: Date, `latestActivity`: SessionActivity, `actor`: [String: JSONValue]?) {
    self.`id` = `id`
    self.`status` = `status`
    self.`expireAt` = `expireAt`
    self.`abandonAt` = `abandonAt`
    self.`lastActiveAt` = `lastActiveAt`
    self.`latestActivity` = `latestActivity`
    self.`actor` = `actor`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "status": .string(self.`status`),
      "expireAt": .string(self.`expireAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "abandonAt": .string(self.`abandonAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "lastActiveAt": .string(self.`lastActiveAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "latestActivity": try self.`latestActivity`.encode(),
      "actor": try self.`actor`.map { value in .object(value) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionWithActivitiesState {
    let values = try value.object()

    return try SessionWithActivitiesState(`id`: try (values["id"] ?? .undefined).string(), `status`: try (values["status"] ?? .undefined).string(), `expireAt`: try (values["expireAt"] ?? .undefined).date(), `abandonAt`: try (values["abandonAt"] ?? .undefined).date(), `lastActiveAt`: try (values["lastActiveAt"] ?? .undefined).date(), `latestActivity`: try SessionActivity.decode((values["latestActivity"] ?? .undefined), in: runtime), `actor`: try (values["actor"] ?? .undefined).optional { value in try value.object() })
  }
}
@MainActor @Observable public final class SessionWithActivities: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SessionWithActivitiesState { context.state(handle, as: SessionWithActivitiesState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `status`: String { state.`status` }
  public var `expireAt`: Date { state.`expireAt` }
  public var `abandonAt`: Date { state.`abandonAt` }
  public var `lastActiveAt`: Date { state.`lastActiveAt` }
  public var `latestActivity`: SessionActivity { state.`latestActivity` }
  public var `actor`: [String: JSONValue]? { state.`actor` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try SessionWithActivitiesState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionWithActivities { try runtime.resource(ResourceHandle.decodeReference(value), as: SessionWithActivities.self) }
  public func `revoke`() async throws -> SessionWithActivities {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SessionWithActivities.revoke", arguments: []) { result in
      return try SessionWithActivities.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> SessionWithActivities {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SessionWithActivities.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try SessionWithActivities.decode(result, in: runtime)
    }
  }
}

public struct SessionActivity: Hashable, Sendable {
  public let `id`: String
  public let `browserName`: String?
  public let `browserVersion`: String?
  public let `deviceType`: String?
  public let `ipAddress`: String?
  public let `city`: String?
  public let `country`: String?
  public let `isMobile`: Bool?
  public init(`id`: String, `browserName`: String? = nil, `browserVersion`: String? = nil, `deviceType`: String? = nil, `ipAddress`: String? = nil, `city`: String? = nil, `country`: String? = nil, `isMobile`: Bool? = nil) {
    self.`id` = `id`
    self.`browserName` = `browserName`
    self.`browserVersion` = `browserVersion`
    self.`deviceType` = `deviceType`
    self.`ipAddress` = `ipAddress`
    self.`city` = `city`
    self.`country` = `country`
    self.`isMobile` = `isMobile`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "browserName": try self.`browserName`.map { value in .string(value) } ?? .undefined,
      "browserVersion": try self.`browserVersion`.map { value in .string(value) } ?? .undefined,
      "deviceType": try self.`deviceType`.map { value in .string(value) } ?? .undefined,
      "ipAddress": try self.`ipAddress`.map { value in .string(value) } ?? .undefined,
      "city": try self.`city`.map { value in .string(value) } ?? .undefined,
      "country": try self.`country`.map { value in .string(value) } ?? .undefined,
      "isMobile": try self.`isMobile`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionActivity {
    let values = try value.object()

    return try SessionActivity(`id`: try (values["id"] ?? .undefined).string(), `browserName`: try (values["browserName"] ?? .undefined).optional { value in try value.string() }, `browserVersion`: try (values["browserVersion"] ?? .undefined).optional { value in try value.string() }, `deviceType`: try (values["deviceType"] ?? .undefined).optional { value in try value.string() }, `ipAddress`: try (values["ipAddress"] ?? .undefined).optional { value in try value.string() }, `city`: try (values["city"] ?? .undefined).optional { value in try value.string() }, `country`: try (values["country"] ?? .undefined).optional { value in try value.string() }, `isMobile`: try (values["isMobile"] ?? .undefined).optional { value in try value.bool() })
  }
}

public struct SetProfileImageParams: Hashable, Sendable {
  public let `file`: SetOrganizationLogoParamsFile?
  public init(`file`: SetOrganizationLogoParamsFile?) {
    self.`file` = `file`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "file": try self.`file`.map { value in try value.encode() } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SetProfileImageParams {
    let values = try value.object()

    return try SetProfileImageParams(`file`: try (values["file"] ?? .undefined).optional { value in try SetOrganizationLogoParamsFile.decode(value, in: runtime) })
  }
}

/// Represents information about an image.
public struct ImageResourceState: Hashable, Sendable {
  public let `id`: String?
  public let `name`: String?
  public let `publicUrl`: String?
  public init(`id`: String? = nil, `name`: String?, `publicUrl`: String?) {
    self.`id` = `id`
    self.`name` = `name`
    self.`publicUrl` = `publicUrl`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": try self.`id`.map { value in .string(value) } ?? .undefined,
      "name": try self.`name`.map { value in .string(value) } ?? .null,
      "publicUrl": try self.`publicUrl`.map { value in .string(value) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ImageResourceState {
    let values = try value.object()

    return try ImageResourceState(`id`: try (values["id"] ?? .undefined).optional { value in try value.string() }, `name`: try (values["name"] ?? .undefined).optional { value in try value.string() }, `publicUrl`: try (values["publicUrl"] ?? .undefined).optional { value in try value.string() })
  }
}
@MainActor @Observable public final class ImageResource: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: ImageResourceState { context.state(handle, as: ImageResourceState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String? { state.`id` }
  public var `name`: String? { state.`name` }
  public var `publicUrl`: String? { state.`publicUrl` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try ImageResourceState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ImageResource { try runtime.resource(ResourceHandle.decodeReference(value), as: ImageResource.self) }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> ImageResource {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ImageResource.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ImageResource.decode(result, in: runtime)
    }
  }
}

public struct CreateExternalAccountParams: Hashable, Sendable {
  public let `strategy`: CreateExternalAccountParamsStrategy?
  public let `token`: String?
  public let `enterpriseConnectionId`: String?
  public let `additionalScopes`: [String]?
  public let `oidcPrompt`: String?
  public let `oidcLoginHint`: String?
  public init(`strategy`: CreateExternalAccountParamsStrategy? = nil, `token`: String? = nil, `enterpriseConnectionId`: String? = nil, `additionalScopes`: [String]? = nil, `oidcPrompt`: String? = nil, `oidcLoginHint`: String? = nil) {
    self.`strategy` = `strategy`
    self.`token` = `token`
    self.`enterpriseConnectionId` = `enterpriseConnectionId`
    self.`additionalScopes` = `additionalScopes`
    self.`oidcPrompt` = `oidcPrompt`
    self.`oidcLoginHint` = `oidcLoginHint`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": try self.`strategy`.map { value in try value.encode() } ?? .undefined,
      "token": try self.`token`.map { value in .string(value) } ?? .undefined,
      "enterpriseConnectionId": try self.`enterpriseConnectionId`.map { value in .string(value) } ?? .undefined,
      "additionalScopes": try self.`additionalScopes`.map { value in .array(try value.map { value in .string(value) }) } ?? .undefined,
      "oidcPrompt": try self.`oidcPrompt`.map { value in .string(value) } ?? .undefined,
      "oidcLoginHint": try self.`oidcLoginHint`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreateExternalAccountParams {
    let values = try value.object()

    return try CreateExternalAccountParams(`strategy`: try (values["strategy"] ?? .undefined).optional { value in try CreateExternalAccountParamsStrategy.decode(value, in: runtime) }, `token`: try (values["token"] ?? .undefined).optional { value in try value.string() }, `enterpriseConnectionId`: try (values["enterpriseConnectionId"] ?? .undefined).optional { value in try value.string() }, `additionalScopes`: try (values["additionalScopes"] ?? .undefined).optional { value in try value.array().map { value in try value.string() } }, `oidcPrompt`: try (values["oidcPrompt"] ?? .undefined).optional { value in try value.string() }, `oidcLoginHint`: try (values["oidcLoginHint"] ?? .undefined).optional { value in try value.string() })
  }
}

public enum CreateExternalAccountParamsStrategy: Hashable, Sendable {
  case `oauthTokenApple`
  case `oauthFacebook`
  case `oauthGoogle`
  case `oauthHubspot`
  case `oauthGithub`
  case `oauthTiktok`
  case `oauthGitlab`
  case `oauthDiscord`
  case `oauthTwitter`
  case `oauthTwitch`
  case `oauthLinkedin`
  case `oauthLinkedinOidc`
  case `oauthDropbox`
  case `oauthAtlassian`
  case `oauthBitbucket`
  case `oauthMicrosoft`
  case `oauthNotion`
  case `oauthApple`
  case `oauthLine`
  case `oauthInstagram`
  case `oauthCoinbase`
  case `oauthSpotify`
  case `oauthXero`
  case `oauthBox`
  case `oauthSlack`
  case `oauthLinear`
  case `oauthX`
  case `oauthEnstall`
  case `oauthHuggingface`
  case `oauthVercel`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`oauthTokenApple`: return "oauth_token_apple"
    case .`oauthFacebook`: return "oauth_facebook"
    case .`oauthGoogle`: return "oauth_google"
    case .`oauthHubspot`: return "oauth_hubspot"
    case .`oauthGithub`: return "oauth_github"
    case .`oauthTiktok`: return "oauth_tiktok"
    case .`oauthGitlab`: return "oauth_gitlab"
    case .`oauthDiscord`: return "oauth_discord"
    case .`oauthTwitter`: return "oauth_twitter"
    case .`oauthTwitch`: return "oauth_twitch"
    case .`oauthLinkedin`: return "oauth_linkedin"
    case .`oauthLinkedinOidc`: return "oauth_linkedin_oidc"
    case .`oauthDropbox`: return "oauth_dropbox"
    case .`oauthAtlassian`: return "oauth_atlassian"
    case .`oauthBitbucket`: return "oauth_bitbucket"
    case .`oauthMicrosoft`: return "oauth_microsoft"
    case .`oauthNotion`: return "oauth_notion"
    case .`oauthApple`: return "oauth_apple"
    case .`oauthLine`: return "oauth_line"
    case .`oauthInstagram`: return "oauth_instagram"
    case .`oauthCoinbase`: return "oauth_coinbase"
    case .`oauthSpotify`: return "oauth_spotify"
    case .`oauthXero`: return "oauth_xero"
    case .`oauthBox`: return "oauth_box"
    case .`oauthSlack`: return "oauth_slack"
    case .`oauthLinear`: return "oauth_linear"
    case .`oauthX`: return "oauth_x"
    case .`oauthEnstall`: return "oauth_enstall"
    case .`oauthHuggingface`: return "oauth_huggingface"
    case .`oauthVercel`: return "oauth_vercel"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "oauth_token_apple": self = .`oauthTokenApple`
    case "oauth_facebook": self = .`oauthFacebook`
    case "oauth_google": self = .`oauthGoogle`
    case "oauth_hubspot": self = .`oauthHubspot`
    case "oauth_github": self = .`oauthGithub`
    case "oauth_tiktok": self = .`oauthTiktok`
    case "oauth_gitlab": self = .`oauthGitlab`
    case "oauth_discord": self = .`oauthDiscord`
    case "oauth_twitter": self = .`oauthTwitter`
    case "oauth_twitch": self = .`oauthTwitch`
    case "oauth_linkedin": self = .`oauthLinkedin`
    case "oauth_linkedin_oidc": self = .`oauthLinkedinOidc`
    case "oauth_dropbox": self = .`oauthDropbox`
    case "oauth_atlassian": self = .`oauthAtlassian`
    case "oauth_bitbucket": self = .`oauthBitbucket`
    case "oauth_microsoft": self = .`oauthMicrosoft`
    case "oauth_notion": self = .`oauthNotion`
    case "oauth_apple": self = .`oauthApple`
    case "oauth_line": self = .`oauthLine`
    case "oauth_instagram": self = .`oauthInstagram`
    case "oauth_coinbase": self = .`oauthCoinbase`
    case "oauth_spotify": self = .`oauthSpotify`
    case "oauth_xero": self = .`oauthXero`
    case "oauth_box": self = .`oauthBox`
    case "oauth_slack": self = .`oauthSlack`
    case "oauth_linear": self = .`oauthLinear`
    case "oauth_x": self = .`oauthX`
    case "oauth_enstall": self = .`oauthEnstall`
    case "oauth_huggingface": self = .`oauthHuggingface`
    case "oauth_vercel": self = .`oauthVercel`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CreateExternalAccountParamsStrategy { .init(rawValue: try value.string()) }
}

public struct GetUserOrganizationMembershipParams: Hashable, Sendable {
  public let `initialPage`: Double?
  public let `pageSize`: Double?
  public init(`initialPage`: Double? = nil, `pageSize`: Double? = nil) {
    self.`initialPage` = `initialPage`
    self.`pageSize` = `pageSize`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "initialPage": try self.`initialPage`.map { value in .number(value) } ?? .undefined,
      "pageSize": try self.`pageSize`.map { value in .number(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetUserOrganizationMembershipParams {
    let values = try value.object()

    return try GetUserOrganizationMembershipParams(`initialPage`: try (values["initialPage"] ?? .undefined).optional { value in try value.number() }, `pageSize`: try (values["pageSize"] ?? .undefined).optional { value in try value.number() })
  }
}

public struct GetUserOrganizationInvitationsParams: Hashable, Sendable {
  public let `initialPage`: Double?
  public let `pageSize`: Double?
  public let `status`: OrganizationInvitationStatus?
  public init(`initialPage`: Double? = nil, `pageSize`: Double? = nil, `status`: OrganizationInvitationStatus? = nil) {
    self.`initialPage` = `initialPage`
    self.`pageSize` = `pageSize`
    self.`status` = `status`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "initialPage": try self.`initialPage`.map { value in .number(value) } ?? .undefined,
      "pageSize": try self.`pageSize`.map { value in .number(value) } ?? .undefined,
      "status": try self.`status`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetUserOrganizationInvitationsParams {
    let values = try value.object()

    return try GetUserOrganizationInvitationsParams(`initialPage`: try (values["initialPage"] ?? .undefined).optional { value in try value.number() }, `pageSize`: try (values["pageSize"] ?? .undefined).optional { value in try value.number() }, `status`: try (values["status"] ?? .undefined).optional { value in try OrganizationInvitationStatus.decode(value, in: runtime) })
  }
}

/// An interface that describes the response of a method that returns a paginated list of resources.
///
/// > [!TIP]
/// > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
public struct ClerkPaginatedResponseUserOrganizationInvitation: Hashable, Sendable {
  public let `data`: [UserOrganizationInvitation]
  public let `totalCount`: Double
  public init(`data`: [UserOrganizationInvitation], `totalCount`: Double) {
    self.`data` = `data`
    self.`totalCount` = `totalCount`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "data": .array(try self.`data`.map { value in try value.encode() }),
      "total_count": .number(self.`totalCount`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkPaginatedResponseUserOrganizationInvitation {
    let values = try value.object()

    return try ClerkPaginatedResponseUserOrganizationInvitation(`data`: try (values["data"] ?? .undefined).array().map { value in try UserOrganizationInvitation.decode(value, in: runtime) }, `totalCount`: try (values["total_count"] ?? .undefined).number())
  }
}

/// The `OrganizationInvitation` object is the model around an organization invitation.
public struct UserOrganizationInvitationState: Hashable, Sendable {
  public let `id`: String
  public let `emailAddress`: String
  public let `publicOrganizationData`: UserOrganizationInvitationPublicOrganizationData
  public let `publicMetadata`: [String: JSONValue]
  public let `role`: String
  public let `status`: OrganizationInvitationStatus
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`id`: String, `emailAddress`: String, `publicOrganizationData`: UserOrganizationInvitationPublicOrganizationData, `publicMetadata`: [String: JSONValue], `role`: String, `status`: OrganizationInvitationStatus, `createdAt`: Date, `updatedAt`: Date) {
    self.`id` = `id`
    self.`emailAddress` = `emailAddress`
    self.`publicOrganizationData` = `publicOrganizationData`
    self.`publicMetadata` = `publicMetadata`
    self.`role` = `role`
    self.`status` = `status`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "emailAddress": .string(self.`emailAddress`),
      "publicOrganizationData": try self.`publicOrganizationData`.encode(),
      "publicMetadata": .object(self.`publicMetadata`),
      "role": .string(self.`role`),
      "status": try self.`status`.encode(),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UserOrganizationInvitationState {
    let values = try value.object()

    return try UserOrganizationInvitationState(`id`: try (values["id"] ?? .undefined).string(), `emailAddress`: try (values["emailAddress"] ?? .undefined).string(), `publicOrganizationData`: try UserOrganizationInvitationPublicOrganizationData.decode((values["publicOrganizationData"] ?? .undefined), in: runtime), `publicMetadata`: try (values["publicMetadata"] ?? .undefined).object(), `role`: try (values["role"] ?? .undefined).string(), `status`: try OrganizationInvitationStatus.decode((values["status"] ?? .undefined), in: runtime), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class UserOrganizationInvitation: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: UserOrganizationInvitationState { context.state(handle, as: UserOrganizationInvitationState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `emailAddress`: String { state.`emailAddress` }
  public var `publicOrganizationData`: UserOrganizationInvitationPublicOrganizationData { state.`publicOrganizationData` }
  public var `publicMetadata`: [String: JSONValue] { state.`publicMetadata` }
  public var `role`: String { state.`role` }
  public var `status`: OrganizationInvitationStatus { state.`status` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try UserOrganizationInvitationState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UserOrganizationInvitation { try runtime.resource(ResourceHandle.decodeReference(value), as: UserOrganizationInvitation.self) }
  public func `accept`() async throws -> UserOrganizationInvitation {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "UserOrganizationInvitation.accept", arguments: []) { result in
      return try UserOrganizationInvitation.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> UserOrganizationInvitation {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "UserOrganizationInvitation.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try UserOrganizationInvitation.decode(result, in: runtime)
    }
  }
}

public struct UserOrganizationInvitationPublicOrganizationData: Hashable, Sendable {
  public let `hasImage`: Bool
  public let `imageUrl`: String
  public let `name`: String
  public let `id`: String
  public let `slug`: String?
  public init(`hasImage`: Bool, `imageUrl`: String, `name`: String, `id`: String, `slug`: String?) {
    self.`hasImage` = `hasImage`
    self.`imageUrl` = `imageUrl`
    self.`name` = `name`
    self.`id` = `id`
    self.`slug` = `slug`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "hasImage": .bool(self.`hasImage`),
      "imageUrl": .string(self.`imageUrl`),
      "name": .string(self.`name`),
      "id": .string(self.`id`),
      "slug": try self.`slug`.map { value in .string(value) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UserOrganizationInvitationPublicOrganizationData {
    let values = try value.object()

    return try UserOrganizationInvitationPublicOrganizationData(`hasImage`: try (values["hasImage"] ?? .undefined).bool(), `imageUrl`: try (values["imageUrl"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).string(), `id`: try (values["id"] ?? .undefined).string(), `slug`: try (values["slug"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct GetUserOrganizationSuggestionsParams: Hashable, Sendable {
  public let `initialPage`: Double?
  public let `pageSize`: Double?
  public let `status`: GetUserOrganizationSuggestionsParamsStatus?
  public init(`initialPage`: Double? = nil, `pageSize`: Double? = nil, `status`: GetUserOrganizationSuggestionsParamsStatus? = nil) {
    self.`initialPage` = `initialPage`
    self.`pageSize` = `pageSize`
    self.`status` = `status`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "initialPage": try self.`initialPage`.map { value in .number(value) } ?? .undefined,
      "pageSize": try self.`pageSize`.map { value in .number(value) } ?? .undefined,
      "status": try self.`status`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetUserOrganizationSuggestionsParams {
    let values = try value.object()

    return try GetUserOrganizationSuggestionsParams(`initialPage`: try (values["initialPage"] ?? .undefined).optional { value in try value.number() }, `pageSize`: try (values["pageSize"] ?? .undefined).optional { value in try value.number() }, `status`: try (values["status"] ?? .undefined).optional { value in try GetUserOrganizationSuggestionsParamsStatus.decode(value, in: runtime) })
  }
}

public indirect enum GetUserOrganizationSuggestionsParamsStatus: Hashable, Sendable {
  case case1(String)
  case case2(String)
  case case3([OrganizationSuggestionStatus])
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": .string("accepted")])
    case .case2(let value): return .object(["$case": .number(1), "value": .string("pending")])
    case .case3(let value): return .object(["$case": .number(2), "value": .array(try value.map { value in try value.encode() })])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetUserOrganizationSuggestionsParamsStatus {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try payload.literal(.string("accepted")).string())
    case 1: return .case2(try payload.literal(.string("pending")).string())
    case 2: return .case3(try payload.array().map { value in try OrganizationSuggestionStatus.decode(value, in: runtime) })
    default: throw CoreError.invalidValue
    }
  }
}

public enum OrganizationSuggestionStatus: Hashable, Sendable {
  case `accepted`
  case `pending`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`accepted`: return "accepted"
    case .`pending`: return "pending"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "accepted": self = .`accepted`
    case "pending": self = .`pending`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationSuggestionStatus { .init(rawValue: try value.string()) }
}

/// An interface that describes the response of a method that returns a paginated list of resources.
///
/// > [!TIP]
/// > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
public struct ClerkPaginatedResponseOrganizationSuggestion: Hashable, Sendable {
  public let `data`: [OrganizationSuggestion]
  public let `totalCount`: Double
  public init(`data`: [OrganizationSuggestion], `totalCount`: Double) {
    self.`data` = `data`
    self.`totalCount` = `totalCount`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "data": .array(try self.`data`.map { value in try value.encode() }),
      "total_count": .number(self.`totalCount`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ClerkPaginatedResponseOrganizationSuggestion {
    let values = try value.object()

    return try ClerkPaginatedResponseOrganizationSuggestion(`data`: try (values["data"] ?? .undefined).array().map { value in try OrganizationSuggestion.decode(value, in: runtime) }, `totalCount`: try (values["total_count"] ?? .undefined).number())
  }
}

/// The `OrganizationSuggestion` object is the model around [a suggestion to join an Organization](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions).
public struct OrganizationSuggestionState: Hashable, Sendable {
  public let `id`: String
  public let `publicOrganizationData`: OrganizationSuggestionPublicOrganizationData
  public let `status`: OrganizationSuggestionStatus
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`id`: String, `publicOrganizationData`: OrganizationSuggestionPublicOrganizationData, `status`: OrganizationSuggestionStatus, `createdAt`: Date, `updatedAt`: Date) {
    self.`id` = `id`
    self.`publicOrganizationData` = `publicOrganizationData`
    self.`status` = `status`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "publicOrganizationData": try self.`publicOrganizationData`.encode(),
      "status": try self.`status`.encode(),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationSuggestionState {
    let values = try value.object()

    return try OrganizationSuggestionState(`id`: try (values["id"] ?? .undefined).string(), `publicOrganizationData`: try OrganizationSuggestionPublicOrganizationData.decode((values["publicOrganizationData"] ?? .undefined), in: runtime), `status`: try OrganizationSuggestionStatus.decode((values["status"] ?? .undefined), in: runtime), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class OrganizationSuggestion: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: OrganizationSuggestionState { context.state(handle, as: OrganizationSuggestionState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String { state.`id` }
  public var `publicOrganizationData`: OrganizationSuggestionPublicOrganizationData { state.`publicOrganizationData` }
  public var `status`: OrganizationSuggestionStatus { state.`status` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try OrganizationSuggestionState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationSuggestion { try runtime.resource(ResourceHandle.decodeReference(value), as: OrganizationSuggestion.self) }
  /// Accepts the suggestion, creating a request to join the Organization.
  public func `accept`() async throws -> OrganizationSuggestion {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationSuggestion.accept", arguments: []) { result in
      return try OrganizationSuggestion.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> OrganizationSuggestion {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationSuggestion.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try OrganizationSuggestion.decode(result, in: runtime)
    }
  }
}

public struct OrganizationSuggestionPublicOrganizationData: Hashable, Sendable {
  public let `hasImage`: Bool
  public let `imageUrl`: String
  public let `name`: String
  public let `id`: String
  public let `slug`: String?
  public init(`hasImage`: Bool, `imageUrl`: String, `name`: String, `id`: String, `slug`: String?) {
    self.`hasImage` = `hasImage`
    self.`imageUrl` = `imageUrl`
    self.`name` = `name`
    self.`id` = `id`
    self.`slug` = `slug`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "hasImage": .bool(self.`hasImage`),
      "imageUrl": .string(self.`imageUrl`),
      "name": .string(self.`name`),
      "id": .string(self.`id`),
      "slug": try self.`slug`.map { value in .string(value) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationSuggestionPublicOrganizationData {
    let values = try value.object()

    return try OrganizationSuggestionPublicOrganizationData(`hasImage`: try (values["hasImage"] ?? .undefined).bool(), `imageUrl`: try (values["imageUrl"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).string(), `id`: try (values["id"] ?? .undefined).string(), `slug`: try (values["slug"] ?? .undefined).optional { value in try value.string() })
  }
}

/// The `OrganizationCreationDefaults` object holds the suggested default values to use when creating an Organization, along with an advisory surfacing a potential issue with the suggested defaults.
public struct OrganizationCreationDefaultsState: Hashable, Sendable {
  public let `advisory`: OrganizationCreationDefaultsAdvisory?
  public let `form`: OrganizationCreationDefaultsForm
  public let `id`: String?
  public init(`advisory`: OrganizationCreationDefaultsAdvisory?, `form`: OrganizationCreationDefaultsForm, `id`: String? = nil) {
    self.`advisory` = `advisory`
    self.`form` = `form`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "advisory": try self.`advisory`.map { value in try value.encode() } ?? .null,
      "form": try self.`form`.encode(),
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationCreationDefaultsState {
    let values = try value.object()

    return try OrganizationCreationDefaultsState(`advisory`: try (values["advisory"] ?? .undefined).optional { value in try OrganizationCreationDefaultsAdvisory.decode(value, in: runtime) }, `form`: try OrganizationCreationDefaultsForm.decode((values["form"] ?? .undefined), in: runtime), `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}
@MainActor @Observable public final class OrganizationCreationDefaults: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: OrganizationCreationDefaultsState { context.state(handle, as: OrganizationCreationDefaultsState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `advisory`: OrganizationCreationDefaultsAdvisory? { state.`advisory` }
  public var `form`: OrganizationCreationDefaultsForm { state.`form` }
  public var `id`: String? { state.`id` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try OrganizationCreationDefaultsState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationCreationDefaults { try runtime.resource(ResourceHandle.decodeReference(value), as: OrganizationCreationDefaults.self) }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> OrganizationCreationDefaults {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "OrganizationCreationDefaults.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try OrganizationCreationDefaults.decode(result, in: runtime)
    }
  }
}

public struct OrganizationCreationDefaultsAdvisory: Hashable, Sendable {
  public var `code`: String { "organization_already_exists" }
  public var `severity`: String { "warning" }
  public let `meta`: [String: String]
  public init(`meta`: [String: String]) {
    self.`meta` = `meta`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string("organization_already_exists"),
      "severity": .string("warning"),
      "meta": .object(try self.`meta`.mapValues { value in .string(value) })
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationCreationDefaultsAdvisory {
    let values = try value.object()
    guard values["code"] == .string("organization_already_exists") else { throw CoreError.invalidValue }
    guard values["severity"] == .string("warning") else { throw CoreError.invalidValue }
    return try OrganizationCreationDefaultsAdvisory(`meta`: try (values["meta"] ?? .undefined).object().mapValues { value in try value.string() })
  }
}

public struct OrganizationCreationDefaultsForm: Hashable, Sendable {
  public let `name`: String
  public let `slug`: String
  public let `logo`: String?
  public let `blurHash`: String?
  public init(`name`: String, `slug`: String, `logo`: String?, `blurHash`: String?) {
    self.`name` = `name`
    self.`slug` = `slug`
    self.`logo` = `logo`
    self.`blurHash` = `blurHash`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "name": .string(self.`name`),
      "slug": .string(self.`slug`),
      "logo": try self.`logo`.map { value in .string(value) } ?? .null,
      "blurHash": try self.`blurHash`.map { value in .string(value) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationCreationDefaultsForm {
    let values = try value.object()

    return try OrganizationCreationDefaultsForm(`name`: try (values["name"] ?? .undefined).string(), `slug`: try (values["slug"] ?? .undefined).string(), `logo`: try (values["logo"] ?? .undefined).optional { value in try value.string() }, `blurHash`: try (values["blurHash"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct TOTP: Hashable, Sendable {
  public let `id`: String
  public let `secret`: String?
  public let `uri`: String?
  public let `verified`: Bool
  public let `backupCodes`: [String]?
  public let `createdAt`: Date?
  public let `updatedAt`: Date?
  public init(`id`: String, `secret`: String? = nil, `uri`: String? = nil, `verified`: Bool, `backupCodes`: [String]? = nil, `createdAt`: Date?, `updatedAt`: Date?) {
    self.`id` = `id`
    self.`secret` = `secret`
    self.`uri` = `uri`
    self.`verified` = `verified`
    self.`backupCodes` = `backupCodes`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "secret": try self.`secret`.map { value in .string(value) } ?? .undefined,
      "uri": try self.`uri`.map { value in .string(value) } ?? .undefined,
      "verified": .bool(self.`verified`),
      "backupCodes": try self.`backupCodes`.map { value in .array(try value.map { value in .string(value) }) } ?? .undefined,
      "createdAt": try self.`createdAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "updatedAt": try self.`updatedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> TOTP {
    let values = try value.object()

    return try TOTP(`id`: try (values["id"] ?? .undefined).string(), `secret`: try (values["secret"] ?? .undefined).optional { value in try value.string() }, `uri`: try (values["uri"] ?? .undefined).optional { value in try value.string() }, `verified`: try (values["verified"] ?? .undefined).bool(), `backupCodes`: try (values["backupCodes"] ?? .undefined).optional { value in try value.array().map { value in try value.string() } }, `createdAt`: try (values["createdAt"] ?? .undefined).optional { value in try value.date() }, `updatedAt`: try (values["updatedAt"] ?? .undefined).optional { value in try value.date() })
  }
}

public struct VerifyTOTPParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> VerifyTOTPParams {
    let values = try value.object()

    return try VerifyTOTPParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct BackupCode: Hashable, Sendable {
  public let `id`: String
  public let `codes`: [String]
  public let `createdAt`: Date?
  public let `updatedAt`: Date?
  public init(`id`: String, `codes`: [String], `createdAt`: Date?, `updatedAt`: Date?) {
    self.`id` = `id`
    self.`codes` = `codes`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "codes": .array(try self.`codes`.map { value in .string(value) }),
      "createdAt": try self.`createdAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "updatedAt": try self.`updatedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BackupCode {
    let values = try value.object()

    return try BackupCode(`id`: try (values["id"] ?? .undefined).string(), `codes`: try (values["codes"] ?? .undefined).array().map { value in try value.string() }, `createdAt`: try (values["createdAt"] ?? .undefined).optional { value in try value.date() }, `updatedAt`: try (values["updatedAt"] ?? .undefined).optional { value in try value.date() })
  }
}

public struct SessionTouchParams: Hashable, Sendable {
  public let `intent`: SessionTouchIntent?
  public init(`intent`: SessionTouchIntent? = nil) {
    self.`intent` = `intent`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "intent": try self.`intent`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionTouchParams {
    let values = try value.object()

    return try SessionTouchParams(`intent`: try (values["intent"] ?? .undefined).optional { value in try SessionTouchIntent.decode(value, in: runtime) })
  }
}

public enum SessionTouchIntent: Hashable, Sendable {
  case `focus`
  case `selectSession`
  case `selectOrg`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`focus`: return "focus"
    case .`selectSession`: return "select_session"
    case .`selectOrg`: return "select_org"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "focus": self = .`focus`
    case "select_session": self = .`selectSession`
    case "select_org": self = .`selectOrg`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionTouchIntent { .init(rawValue: try value.string()) }
}

public struct GetTokenOptions: Hashable, Sendable {
  public let `organizationId`: String?
  public let `skipCache`: Bool?
  public let `template`: String?
  public init(`organizationId`: String? = nil, `skipCache`: Bool? = nil, `template`: String? = nil) {
    self.`organizationId` = `organizationId`
    self.`skipCache` = `skipCache`
    self.`template` = `template`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "organizationId": try self.`organizationId`.map { value in .string(value) } ?? .undefined,
      "skipCache": try self.`skipCache`.map { value in .bool(value) } ?? .undefined,
      "template": try self.`template`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> GetTokenOptions {
    let values = try value.object()

    return try GetTokenOptions(`organizationId`: try (values["organizationId"] ?? .undefined).optional { value in try value.string() }, `skipCache`: try (values["skipCache"] ?? .undefined).optional { value in try value.bool() }, `template`: try (values["template"] ?? .undefined).optional { value in try value.string() })
  }
}

public indirect enum CheckAuthorizationParams: Hashable, Sendable {
  case case1(SessionCheckAuthorizationIsAuthorizedParamsCase1)
  case case2(SessionCheckAuthorizationIsAuthorizedParamsCase2)
  case case3(SessionCheckAuthorizationIsAuthorizedParamsCase3)
  case case4(SessionCheckAuthorizationIsAuthorizedParamsCase4)
  case case5(SessionCheckAuthorizationIsAuthorizedParamsCase5)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    case .case4(let value): return .object(["$case": .number(3), "value": try value.encode()])
    case .case5(let value): return .object(["$case": .number(4), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CheckAuthorizationParams {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try SessionCheckAuthorizationIsAuthorizedParamsCase1.decode(payload, in: runtime))
    case 1: return .case2(try SessionCheckAuthorizationIsAuthorizedParamsCase2.decode(payload, in: runtime))
    case 2: return .case3(try SessionCheckAuthorizationIsAuthorizedParamsCase3.decode(payload, in: runtime))
    case 3: return .case4(try SessionCheckAuthorizationIsAuthorizedParamsCase4.decode(payload, in: runtime))
    case 4: return .case5(try SessionCheckAuthorizationIsAuthorizedParamsCase5.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct SessionCheckAuthorizationIsAuthorizedParamsCase1: Hashable, Sendable {
  public let `role`: String
  public let `reverification`: ReverificationConfig?
  public init(`role`: String, `reverification`: ReverificationConfig? = nil) {
    self.`role` = `role`
    self.`reverification` = `reverification`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "role": .string(self.`role`),
      "reverification": try self.`reverification`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionCheckAuthorizationIsAuthorizedParamsCase1 {
    let values = try value.object()

    return try SessionCheckAuthorizationIsAuthorizedParamsCase1(`role`: try (values["role"] ?? .undefined).string(), `reverification`: try (values["reverification"] ?? .undefined).optional { value in try ReverificationConfig.decode(value, in: runtime) })
  }
}

/// The `ReverificationConfig` type has the following properties:
public indirect enum ReverificationConfig: Hashable, Sendable {
  case case1(String)
  case case2(String)
  case case3(String)
  case case4(String)
  case case5(SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": .string("strict_mfa")])
    case .case2(let value): return .object(["$case": .number(1), "value": .string("strict")])
    case .case3(let value): return .object(["$case": .number(2), "value": .string("moderate")])
    case .case4(let value): return .object(["$case": .number(3), "value": .string("lax")])
    case .case5(let value): return .object(["$case": .number(4), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ReverificationConfig {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try payload.literal(.string("strict_mfa")).string())
    case 1: return .case2(try payload.literal(.string("strict")).string())
    case 2: return .case3(try payload.literal(.string("moderate")).string())
    case 3: return .case4(try payload.literal(.string("lax")).string())
    case 4: return .case5(try SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5: Hashable, Sendable {
  public let `level`: SessionVerificationLevel
  public let `afterMinutes`: Double
  public init(`level`: SessionVerificationLevel, `afterMinutes`: Double) {
    self.`level` = `level`
    self.`afterMinutes` = `afterMinutes`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "level": try self.`level`.encode(),
      "afterMinutes": .number(self.`afterMinutes`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5 {
    let values = try value.object()

    return try SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5(`level`: try SessionVerificationLevel.decode((values["level"] ?? .undefined), in: runtime), `afterMinutes`: try (values["afterMinutes"] ?? .undefined).number())
  }
}

public enum SessionVerificationLevel: Hashable, Sendable {
  case `firstFactor`
  case `secondFactor`
  case `multiFactor`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`firstFactor`: return "first_factor"
    case .`secondFactor`: return "second_factor"
    case .`multiFactor`: return "multi_factor"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "first_factor": self = .`firstFactor`
    case "second_factor": self = .`secondFactor`
    case "multi_factor": self = .`multiFactor`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionVerificationLevel { .init(rawValue: try value.string()) }
}

public struct SessionCheckAuthorizationIsAuthorizedParamsCase2: Hashable, Sendable {
  public let `permission`: String
  public let `reverification`: ReverificationConfig?
  public init(`permission`: String, `reverification`: ReverificationConfig? = nil) {
    self.`permission` = `permission`
    self.`reverification` = `reverification`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "permission": .string(self.`permission`),
      "reverification": try self.`reverification`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionCheckAuthorizationIsAuthorizedParamsCase2 {
    let values = try value.object()

    return try SessionCheckAuthorizationIsAuthorizedParamsCase2(`permission`: try (values["permission"] ?? .undefined).string(), `reverification`: try (values["reverification"] ?? .undefined).optional { value in try ReverificationConfig.decode(value, in: runtime) })
  }
}

public struct SessionCheckAuthorizationIsAuthorizedParamsCase3: Hashable, Sendable {
  public let `feature`: String
  public let `reverification`: ReverificationConfig?
  public init(`feature`: String, `reverification`: ReverificationConfig? = nil) {
    self.`feature` = `feature`
    self.`reverification` = `reverification`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "feature": .string(self.`feature`),
      "reverification": try self.`reverification`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionCheckAuthorizationIsAuthorizedParamsCase3 {
    let values = try value.object()

    return try SessionCheckAuthorizationIsAuthorizedParamsCase3(`feature`: try (values["feature"] ?? .undefined).string(), `reverification`: try (values["reverification"] ?? .undefined).optional { value in try ReverificationConfig.decode(value, in: runtime) })
  }
}

public struct SessionCheckAuthorizationIsAuthorizedParamsCase4: Hashable, Sendable {
  public let `plan`: String
  public let `reverification`: ReverificationConfig?
  public init(`plan`: String, `reverification`: ReverificationConfig? = nil) {
    self.`plan` = `plan`
    self.`reverification` = `reverification`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "plan": .string(self.`plan`),
      "reverification": try self.`reverification`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionCheckAuthorizationIsAuthorizedParamsCase4 {
    let values = try value.object()

    return try SessionCheckAuthorizationIsAuthorizedParamsCase4(`plan`: try (values["plan"] ?? .undefined).string(), `reverification`: try (values["reverification"] ?? .undefined).optional { value in try ReverificationConfig.decode(value, in: runtime) })
  }
}

public struct SessionCheckAuthorizationIsAuthorizedParamsCase5: Hashable, Sendable {
  public let `reverification`: ReverificationConfig?
  public init(`reverification`: ReverificationConfig? = nil) {
    self.`reverification` = `reverification`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "reverification": try self.`reverification`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionCheckAuthorizationIsAuthorizedParamsCase5 {
    let values = try value.object()

    return try SessionCheckAuthorizationIsAuthorizedParamsCase5(`reverification`: try (values["reverification"] ?? .undefined).optional { value in try ReverificationConfig.decode(value, in: runtime) })
  }
}

public struct SessionVerifyCreateParams: Hashable, Sendable {
  public let `level`: SessionVerificationLevel
  public init(`level`: SessionVerificationLevel) {
    self.`level` = `level`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "level": try self.`level`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionVerifyCreateParams {
    let values = try value.object()

    return try SessionVerifyCreateParams(`level`: try SessionVerificationLevel.decode((values["level"] ?? .undefined), in: runtime))
  }
}

public struct SessionVerificationState: Hashable, Sendable {
  public let `status`: SessionVerificationStatus
  public let `level`: SessionVerificationLevel
  public let `session`: Session
  public let `firstFactorVerification`: Verification
  public let `secondFactorVerification`: Verification
  public let `supportedFirstFactors`: [SessionVerificationFirstFactor]?
  public let `supportedSecondFactors`: [SessionVerificationSecondFactor]?
  public let `id`: String?
  public init(`status`: SessionVerificationStatus, `level`: SessionVerificationLevel, `session`: Session, `firstFactorVerification`: Verification, `secondFactorVerification`: Verification, `supportedFirstFactors`: [SessionVerificationFirstFactor]?, `supportedSecondFactors`: [SessionVerificationSecondFactor]?, `id`: String? = nil) {
    self.`status` = `status`
    self.`level` = `level`
    self.`session` = `session`
    self.`firstFactorVerification` = `firstFactorVerification`
    self.`secondFactorVerification` = `secondFactorVerification`
    self.`supportedFirstFactors` = `supportedFirstFactors`
    self.`supportedSecondFactors` = `supportedSecondFactors`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "status": try self.`status`.encode(),
      "level": try self.`level`.encode(),
      "session": try self.`session`.encode(),
      "firstFactorVerification": try self.`firstFactorVerification`.encode(),
      "secondFactorVerification": try self.`secondFactorVerification`.encode(),
      "supportedFirstFactors": try self.`supportedFirstFactors`.map { value in .array(try value.map { value in try value.encode() }) } ?? .null,
      "supportedSecondFactors": try self.`supportedSecondFactors`.map { value in .array(try value.map { value in try value.encode() }) } ?? .null,
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionVerificationState {
    let values = try value.object()

    return try SessionVerificationState(`status`: try SessionVerificationStatus.decode((values["status"] ?? .undefined), in: runtime), `level`: try SessionVerificationLevel.decode((values["level"] ?? .undefined), in: runtime), `session`: try Session.decode((values["session"] ?? .undefined), in: runtime), `firstFactorVerification`: try Verification.decode((values["firstFactorVerification"] ?? .undefined), in: runtime), `secondFactorVerification`: try Verification.decode((values["secondFactorVerification"] ?? .undefined), in: runtime), `supportedFirstFactors`: try (values["supportedFirstFactors"] ?? .undefined).optional { value in try value.array().map { value in try SessionVerificationFirstFactor.decode(value, in: runtime) } }, `supportedSecondFactors`: try (values["supportedSecondFactors"] ?? .undefined).optional { value in try value.array().map { value in try SessionVerificationSecondFactor.decode(value, in: runtime) } }, `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}
@MainActor @Observable public final class SessionVerification: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SessionVerificationState { context.state(handle, as: SessionVerificationState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `status`: SessionVerificationStatus { state.`status` }
  public var `level`: SessionVerificationLevel { state.`level` }
  public var `session`: Session { state.`session` }
  public var `firstFactorVerification`: Verification { state.`firstFactorVerification` }
  public var `secondFactorVerification`: Verification { state.`secondFactorVerification` }
  public var `supportedFirstFactors`: [SessionVerificationFirstFactor]? { state.`supportedFirstFactors` }
  public var `supportedSecondFactors`: [SessionVerificationSecondFactor]? { state.`supportedSecondFactors` }
  public var `id`: String? { state.`id` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try SessionVerificationState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionVerification { try runtime.resource(ResourceHandle.decodeReference(value), as: SessionVerification.self) }
}

public enum SessionVerificationStatus: Hashable, Sendable {
  case `needsFirstFactor`
  case `needsSecondFactor`
  case `complete`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`needsFirstFactor`: return "needs_first_factor"
    case .`needsSecondFactor`: return "needs_second_factor"
    case .`complete`: return "complete"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "needs_first_factor": self = .`needsFirstFactor`
    case "needs_second_factor": self = .`needsSecondFactor`
    case "complete": self = .`complete`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionVerificationStatus { .init(rawValue: try value.string()) }
}

public indirect enum SessionVerificationFirstFactor: Hashable, Sendable {
  case case1(EmailCodeFactor)
  case case2(PhoneCodeFactor)
  case case3(PasswordFactor)
  case case4(PasskeyFactor)
  case case5(EnterpriseSSOFactor)
  @MainActor public var `strategy`: String {
    switch self {
    case .case1(let value): return value.`strategy`
    case .case2(let value): return value.`strategy`
    case .case3(let value): return value.`strategy`
    case .case4(let value): return value.`strategy`
    case .case5(let value): return value.`strategy`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    case .case4(let value): return .object(["$case": .number(3), "value": try value.encode()])
    case .case5(let value): return .object(["$case": .number(4), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionVerificationFirstFactor {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try EmailCodeFactor.decode(payload, in: runtime))
    case 1: return .case2(try PhoneCodeFactor.decode(payload, in: runtime))
    case 2: return .case3(try PasswordFactor.decode(payload, in: runtime))
    case 3: return .case4(try PasskeyFactor.decode(payload, in: runtime))
    case 4: return .case5(try EnterpriseSSOFactor.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct EmailCodeFactor: Hashable, Sendable {
  public var `strategy`: String { "email_code" }
  public let `emailAddressId`: String
  public let `safeIdentifier`: String
  public let `primary`: Bool?
  public init(`emailAddressId`: String, `safeIdentifier`: String, `primary`: Bool? = nil) {
    self.`emailAddressId` = `emailAddressId`
    self.`safeIdentifier` = `safeIdentifier`
    self.`primary` = `primary`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("email_code"),
      "emailAddressId": .string(self.`emailAddressId`),
      "safeIdentifier": .string(self.`safeIdentifier`),
      "primary": try self.`primary`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EmailCodeFactor {
    let values = try value.object()
    guard values["strategy"] == .string("email_code") else { throw CoreError.invalidValue }
    return try EmailCodeFactor(`emailAddressId`: try (values["emailAddressId"] ?? .undefined).string(), `safeIdentifier`: try (values["safeIdentifier"] ?? .undefined).string(), `primary`: try (values["primary"] ?? .undefined).optional { value in try value.bool() })
  }
}

public struct PhoneCodeFactor: Hashable, Sendable {
  public var `strategy`: String { "phone_code" }
  public let `phoneNumberId`: String
  public let `safeIdentifier`: String
  public let `primary`: Bool?
  public let `default`: Bool?
  public let `channel`: PhoneCodeChannel?
  public init(`phoneNumberId`: String, `safeIdentifier`: String, `primary`: Bool? = nil, `default`: Bool? = nil, `channel`: PhoneCodeChannel? = nil) {
    self.`phoneNumberId` = `phoneNumberId`
    self.`safeIdentifier` = `safeIdentifier`
    self.`primary` = `primary`
    self.`default` = `default`
    self.`channel` = `channel`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("phone_code"),
      "phoneNumberId": .string(self.`phoneNumberId`),
      "safeIdentifier": .string(self.`safeIdentifier`),
      "primary": try self.`primary`.map { value in .bool(value) } ?? .undefined,
      "default": try self.`default`.map { value in .bool(value) } ?? .undefined,
      "channel": try self.`channel`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PhoneCodeFactor {
    let values = try value.object()
    guard values["strategy"] == .string("phone_code") else { throw CoreError.invalidValue }
    return try PhoneCodeFactor(`phoneNumberId`: try (values["phoneNumberId"] ?? .undefined).string(), `safeIdentifier`: try (values["safeIdentifier"] ?? .undefined).string(), `primary`: try (values["primary"] ?? .undefined).optional { value in try value.bool() }, `default`: try (values["default"] ?? .undefined).optional { value in try value.bool() }, `channel`: try (values["channel"] ?? .undefined).optional { value in try PhoneCodeChannel.decode(value, in: runtime) })
  }
}

public struct PasswordFactor: Hashable, Sendable {
  public var `strategy`: String { "password" }
  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("password")
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PasswordFactor {
    let values = try value.object()
    guard values["strategy"] == .string("password") else { throw CoreError.invalidValue }
    return try PasswordFactor()
  }
}

public struct PasskeyFactor: Hashable, Sendable {
  public var `strategy`: String { "passkey" }
  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("passkey")
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PasskeyFactor {
    let values = try value.object()
    guard values["strategy"] == .string("passkey") else { throw CoreError.invalidValue }
    return try PasskeyFactor()
  }
}

public struct EnterpriseSSOFactor: Hashable, Sendable {
  public var `strategy`: String { "enterprise_sso" }
  public let `enterpriseConnectionId`: String?
  public let `enterpriseConnectionName`: String?
  public init(`enterpriseConnectionId`: String? = nil, `enterpriseConnectionName`: String? = nil) {
    self.`enterpriseConnectionId` = `enterpriseConnectionId`
    self.`enterpriseConnectionName` = `enterpriseConnectionName`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("enterprise_sso"),
      "enterpriseConnectionId": try self.`enterpriseConnectionId`.map { value in .string(value) } ?? .undefined,
      "enterpriseConnectionName": try self.`enterpriseConnectionName`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseSSOFactor {
    let values = try value.object()
    guard values["strategy"] == .string("enterprise_sso") else { throw CoreError.invalidValue }
    return try EnterpriseSSOFactor(`enterpriseConnectionId`: try (values["enterpriseConnectionId"] ?? .undefined).optional { value in try value.string() }, `enterpriseConnectionName`: try (values["enterpriseConnectionName"] ?? .undefined).optional { value in try value.string() })
  }
}

public indirect enum SessionVerificationSecondFactor: Hashable, Sendable {
  case case1(PhoneCodeFactor)
  case case2(TOTPFactor)
  case case3(BackupCodeFactor)
  @MainActor public var `strategy`: String {
    switch self {
    case .case1(let value): return value.`strategy`
    case .case2(let value): return value.`strategy`
    case .case3(let value): return value.`strategy`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionVerificationSecondFactor {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try PhoneCodeFactor.decode(payload, in: runtime))
    case 1: return .case2(try TOTPFactor.decode(payload, in: runtime))
    case 2: return .case3(try BackupCodeFactor.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct TOTPFactor: Hashable, Sendable {
  public var `strategy`: String { "totp" }
  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("totp")
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> TOTPFactor {
    let values = try value.object()
    guard values["strategy"] == .string("totp") else { throw CoreError.invalidValue }
    return try TOTPFactor()
  }
}

public struct BackupCodeFactor: Hashable, Sendable {
  public var `strategy`: String { "backup_code" }
  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("backup_code")
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BackupCodeFactor {
    let values = try value.object()
    guard values["strategy"] == .string("backup_code") else { throw CoreError.invalidValue }
    return try BackupCodeFactor()
  }
}

public indirect enum SessionVerifyPrepareFirstFactorParams: Hashable, Sendable {
  case case1(PasskeyFactor)
  case case2(EmailCodeConfig)
  case case3(PhoneCodeConfig)
  case case4(OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl)
  @MainActor public var `strategy`: String {
    switch self {
    case .case1(let value): return value.`strategy`
    case .case2(let value): return value.`strategy`
    case .case3(let value): return value.`strategy`
    case .case4(let value): return value.`strategy`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    case .case4(let value): return .object(["$case": .number(3), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionVerifyPrepareFirstFactorParams {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try PasskeyFactor.decode(payload, in: runtime))
    case 1: return .case2(try EmailCodeConfig.decode(payload, in: runtime))
    case 2: return .case3(try PhoneCodeConfig.decode(payload, in: runtime))
    case 3: return .case4(try OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct EmailCodeConfig: Hashable, Sendable {
  public var `strategy`: String { "email_code" }
  public let `primary`: Bool?
  public let `emailAddressId`: String
  public init(`primary`: Bool? = nil, `emailAddressId`: String) {
    self.`primary` = `primary`
    self.`emailAddressId` = `emailAddressId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("email_code"),
      "primary": try self.`primary`.map { value in .bool(value) } ?? .undefined,
      "emailAddressId": .string(self.`emailAddressId`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EmailCodeConfig {
    let values = try value.object()
    guard values["strategy"] == .string("email_code") else { throw CoreError.invalidValue }
    return try EmailCodeConfig(`primary`: try (values["primary"] ?? .undefined).optional { value in try value.bool() }, `emailAddressId`: try (values["emailAddressId"] ?? .undefined).string())
  }
}

public struct PhoneCodeConfig: Hashable, Sendable {
  public var `strategy`: String { "phone_code" }
  public let `phoneNumberId`: String
  public let `primary`: Bool?
  public let `default`: Bool?
  public let `channel`: PhoneCodeChannel?
  public init(`phoneNumberId`: String, `primary`: Bool? = nil, `default`: Bool? = nil, `channel`: PhoneCodeChannel? = nil) {
    self.`phoneNumberId` = `phoneNumberId`
    self.`primary` = `primary`
    self.`default` = `default`
    self.`channel` = `channel`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("phone_code"),
      "phoneNumberId": .string(self.`phoneNumberId`),
      "primary": try self.`primary`.map { value in .bool(value) } ?? .undefined,
      "default": try self.`default`.map { value in .bool(value) } ?? .undefined,
      "channel": try self.`channel`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PhoneCodeConfig {
    let values = try value.object()
    guard values["strategy"] == .string("phone_code") else { throw CoreError.invalidValue }
    return try PhoneCodeConfig(`phoneNumberId`: try (values["phoneNumberId"] ?? .undefined).string(), `primary`: try (values["primary"] ?? .undefined).optional { value in try value.bool() }, `default`: try (values["default"] ?? .undefined).optional { value in try value.bool() }, `channel`: try (values["channel"] ?? .undefined).optional { value in try PhoneCodeChannel.decode(value, in: runtime) })
  }
}

/// Construct a type with the properties of T except for those in type K.
public struct OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl: Hashable, Sendable {
  public var `strategy`: String { "enterprise_sso" }
  public let `emailAddressId`: String?
  public let `enterpriseConnectionId`: String?
  public let `enterpriseConnectionName`: String?
  public let `redirectUrl`: String
  public let `oidcPrompt`: String?
  public init(`emailAddressId`: String? = nil, `enterpriseConnectionId`: String? = nil, `enterpriseConnectionName`: String? = nil, `redirectUrl`: String, `oidcPrompt`: String? = nil) {
    self.`emailAddressId` = `emailAddressId`
    self.`enterpriseConnectionId` = `enterpriseConnectionId`
    self.`enterpriseConnectionName` = `enterpriseConnectionName`
    self.`redirectUrl` = `redirectUrl`
    self.`oidcPrompt` = `oidcPrompt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("enterprise_sso"),
      "emailAddressId": try self.`emailAddressId`.map { value in .string(value) } ?? .undefined,
      "enterpriseConnectionId": try self.`enterpriseConnectionId`.map { value in .string(value) } ?? .undefined,
      "enterpriseConnectionName": try self.`enterpriseConnectionName`.map { value in .string(value) } ?? .undefined,
      "redirectUrl": .string(self.`redirectUrl`),
      "oidcPrompt": try self.`oidcPrompt`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl {
    let values = try value.object()
    guard values["strategy"] == .string("enterprise_sso") else { throw CoreError.invalidValue }
    return try OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl(`emailAddressId`: try (values["emailAddressId"] ?? .undefined).optional { value in try value.string() }, `enterpriseConnectionId`: try (values["enterpriseConnectionId"] ?? .undefined).optional { value in try value.string() }, `enterpriseConnectionName`: try (values["enterpriseConnectionName"] ?? .undefined).optional { value in try value.string() }, `redirectUrl`: try (values["redirectUrl"] ?? .undefined).string(), `oidcPrompt`: try (values["oidcPrompt"] ?? .undefined).optional { value in try value.string() })
  }
}

public indirect enum SessionVerifyAttemptFirstFactorParams: Hashable, Sendable {
  case case1(EmailCodeAttempt)
  case case2(PhoneCodeAttempt)
  case case3(PasswordAttempt)
  case case4(PasskeyAttempt)
  @MainActor public var `strategy`: String {
    switch self {
    case .case1(let value): return value.`strategy`
    case .case2(let value): return value.`strategy`
    case .case3(let value): return value.`strategy`
    case .case4(let value): return value.`strategy`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    case .case4(let value): return .object(["$case": .number(3), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionVerifyAttemptFirstFactorParams {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try EmailCodeAttempt.decode(payload, in: runtime))
    case 1: return .case2(try PhoneCodeAttempt.decode(payload, in: runtime))
    case 2: return .case3(try PasswordAttempt.decode(payload, in: runtime))
    case 3: return .case4(try PasskeyAttempt.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct EmailCodeAttempt: Hashable, Sendable {
  public var `strategy`: String { "email_code" }
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("email_code"),
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EmailCodeAttempt {
    let values = try value.object()
    guard values["strategy"] == .string("email_code") else { throw CoreError.invalidValue }
    return try EmailCodeAttempt(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct PhoneCodeAttempt: Hashable, Sendable {
  public var `strategy`: String { "phone_code" }
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("phone_code"),
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PhoneCodeAttempt {
    let values = try value.object()
    guard values["strategy"] == .string("phone_code") else { throw CoreError.invalidValue }
    return try PhoneCodeAttempt(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct PasswordAttempt: Hashable, Sendable {
  public var `strategy`: String { "password" }
  public let `password`: String
  public init(`password`: String) {
    self.`password` = `password`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("password"),
      "password": .string(self.`password`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PasswordAttempt {
    let values = try value.object()
    guard values["strategy"] == .string("password") else { throw CoreError.invalidValue }
    return try PasswordAttempt(`password`: try (values["password"] ?? .undefined).string())
  }
}

public struct PasskeyAttempt: Hashable, Sendable {
  public var `strategy`: String { "passkey" }
  public let `publicKeyCredential`: PublicKeyCredentialWithAuthenticatorAssertionResponse
  public init(`publicKeyCredential`: PublicKeyCredentialWithAuthenticatorAssertionResponse) {
    self.`publicKeyCredential` = `publicKeyCredential`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("passkey"),
      "publicKeyCredential": try self.`publicKeyCredential`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PasskeyAttempt {
    let values = try value.object()
    guard values["strategy"] == .string("passkey") else { throw CoreError.invalidValue }
    return try PasskeyAttempt(`publicKeyCredential`: try PublicKeyCredentialWithAuthenticatorAssertionResponse.decode((values["publicKeyCredential"] ?? .undefined), in: runtime))
  }
}

public struct PublicKeyCredentialWithAuthenticatorAssertionResponse: Hashable, Sendable {
  public let `authenticatorAttachment`: String?
  public let `rawId`: Data
  public let `id`: String
  public let `type`: String
  public let `response`: AuthenticatorAssertionResponse
  public init(`authenticatorAttachment`: String?, `rawId`: Data, `id`: String, `type`: String, `response`: AuthenticatorAssertionResponse) {
    self.`authenticatorAttachment` = `authenticatorAttachment`
    self.`rawId` = `rawId`
    self.`id` = `id`
    self.`type` = `type`
    self.`response` = `response`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "authenticatorAttachment": try self.`authenticatorAttachment`.map { value in .string(value) } ?? .null,
      "rawId": .object(["base64": .string(self.`rawId`.base64EncodedString())]),
      "id": .string(self.`id`),
      "type": .string(self.`type`),
      "response": try self.`response`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PublicKeyCredentialWithAuthenticatorAssertionResponse {
    let values = try value.object()

    return try PublicKeyCredentialWithAuthenticatorAssertionResponse(`authenticatorAttachment`: try (values["authenticatorAttachment"] ?? .undefined).optional { value in try value.string() }, `rawId`: try (values["rawId"] ?? .undefined).data(), `id`: try (values["id"] ?? .undefined).string(), `type`: try (values["type"] ?? .undefined).string(), `response`: try AuthenticatorAssertionResponse.decode((values["response"] ?? .undefined), in: runtime))
  }
}

/// The **`AuthenticatorAssertionResponse`** interface of the Web Authentication API contains a digital signature from the private key of a particular WebAuthn credential. The relying party's server can verify this signature to authenticate a user, for example when they sign in.
/// Available only in secure contexts.
///
/// [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAssertionResponse)
public struct AuthenticatorAssertionResponse: Hashable, Sendable {
  public let `authenticatorData`: Data
  public let `signature`: Data
  public let `userHandle`: Data?
  public let `clientDataJSON`: Data
  public init(`authenticatorData`: Data, `signature`: Data, `userHandle`: Data?, `clientDataJSON`: Data) {
    self.`authenticatorData` = `authenticatorData`
    self.`signature` = `signature`
    self.`userHandle` = `userHandle`
    self.`clientDataJSON` = `clientDataJSON`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "authenticatorData": .object(["base64": .string(self.`authenticatorData`.base64EncodedString())]),
      "signature": .object(["base64": .string(self.`signature`.base64EncodedString())]),
      "userHandle": try self.`userHandle`.map { value in .object(["base64": .string(value.base64EncodedString())]) } ?? .null,
      "clientDataJSON": .object(["base64": .string(self.`clientDataJSON`.base64EncodedString())])
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AuthenticatorAssertionResponse {
    let values = try value.object()

    return try AuthenticatorAssertionResponse(`authenticatorData`: try (values["authenticatorData"] ?? .undefined).data(), `signature`: try (values["signature"] ?? .undefined).data(), `userHandle`: try (values["userHandle"] ?? .undefined).optional { value in try value.data() }, `clientDataJSON`: try (values["clientDataJSON"] ?? .undefined).data())
  }
}

public struct PhoneCodeSecondFactorConfig: Hashable, Sendable {
  public var `strategy`: String { "phone_code" }
  public let `phoneNumberId`: String?
  public init(`phoneNumberId`: String? = nil) {
    self.`phoneNumberId` = `phoneNumberId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("phone_code"),
      "phoneNumberId": try self.`phoneNumberId`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PhoneCodeSecondFactorConfig {
    let values = try value.object()
    guard values["strategy"] == .string("phone_code") else { throw CoreError.invalidValue }
    return try PhoneCodeSecondFactorConfig(`phoneNumberId`: try (values["phoneNumberId"] ?? .undefined).optional { value in try value.string() })
  }
}

public indirect enum SessionVerifyAttemptSecondFactorParams: Hashable, Sendable {
  case case1(PhoneCodeAttempt)
  case case2(TOTPAttempt)
  case case3(BackupCodeAttempt)
  @MainActor public var `strategy`: String {
    switch self {
    case .case1(let value): return value.`strategy`
    case .case2(let value): return value.`strategy`
    case .case3(let value): return value.`strategy`
    }
  }
  @MainActor public var `code`: String {
    switch self {
    case .case1(let value): return value.`code`
    case .case2(let value): return value.`code`
    case .case3(let value): return value.`code`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionVerifyAttemptSecondFactorParams {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try PhoneCodeAttempt.decode(payload, in: runtime))
    case 1: return .case2(try TOTPAttempt.decode(payload, in: runtime))
    case 2: return .case3(try BackupCodeAttempt.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct TOTPAttempt: Hashable, Sendable {
  public var `strategy`: String { "totp" }
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("totp"),
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> TOTPAttempt {
    let values = try value.object()
    guard values["strategy"] == .string("totp") else { throw CoreError.invalidValue }
    return try TOTPAttempt(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct BackupCodeAttempt: Hashable, Sendable {
  public var `strategy`: String { "backup_code" }
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("backup_code"),
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BackupCodeAttempt {
    let values = try value.object()
    guard values["strategy"] == .string("backup_code") else { throw CoreError.invalidValue }
    return try BackupCodeAttempt(`code`: try (values["code"] ?? .undefined).string())
  }
}

public enum LastAuthenticationStrategy: Hashable, Sendable {
  case `password`
  case `phoneCode`
  case `emailCode`
  case `emailLink`
  case `oauthFacebook`
  case `oauthGoogle`
  case `oauthHubspot`
  case `oauthGithub`
  case `oauthTiktok`
  case `oauthGitlab`
  case `oauthDiscord`
  case `oauthTwitter`
  case `oauthTwitch`
  case `oauthLinkedin`
  case `oauthLinkedinOidc`
  case `oauthDropbox`
  case `oauthAtlassian`
  case `oauthBitbucket`
  case `oauthMicrosoft`
  case `oauthNotion`
  case `oauthApple`
  case `oauthLine`
  case `oauthInstagram`
  case `oauthCoinbase`
  case `oauthSpotify`
  case `oauthXero`
  case `oauthBox`
  case `oauthSlack`
  case `oauthLinear`
  case `oauthX`
  case `oauthEnstall`
  case `oauthHuggingface`
  case `oauthVercel`
  case `web3SolanaSignature`
  case `web3MetamaskSignature`
  case `web3CoinbaseWalletSignature`
  case `web3OkxWalletSignature`
  case `web3BaseSignature`
  case `emailAddress`
  case `username`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`password`: return "password"
    case .`phoneCode`: return "phone_code"
    case .`emailCode`: return "email_code"
    case .`emailLink`: return "email_link"
    case .`oauthFacebook`: return "oauth_facebook"
    case .`oauthGoogle`: return "oauth_google"
    case .`oauthHubspot`: return "oauth_hubspot"
    case .`oauthGithub`: return "oauth_github"
    case .`oauthTiktok`: return "oauth_tiktok"
    case .`oauthGitlab`: return "oauth_gitlab"
    case .`oauthDiscord`: return "oauth_discord"
    case .`oauthTwitter`: return "oauth_twitter"
    case .`oauthTwitch`: return "oauth_twitch"
    case .`oauthLinkedin`: return "oauth_linkedin"
    case .`oauthLinkedinOidc`: return "oauth_linkedin_oidc"
    case .`oauthDropbox`: return "oauth_dropbox"
    case .`oauthAtlassian`: return "oauth_atlassian"
    case .`oauthBitbucket`: return "oauth_bitbucket"
    case .`oauthMicrosoft`: return "oauth_microsoft"
    case .`oauthNotion`: return "oauth_notion"
    case .`oauthApple`: return "oauth_apple"
    case .`oauthLine`: return "oauth_line"
    case .`oauthInstagram`: return "oauth_instagram"
    case .`oauthCoinbase`: return "oauth_coinbase"
    case .`oauthSpotify`: return "oauth_spotify"
    case .`oauthXero`: return "oauth_xero"
    case .`oauthBox`: return "oauth_box"
    case .`oauthSlack`: return "oauth_slack"
    case .`oauthLinear`: return "oauth_linear"
    case .`oauthX`: return "oauth_x"
    case .`oauthEnstall`: return "oauth_enstall"
    case .`oauthHuggingface`: return "oauth_huggingface"
    case .`oauthVercel`: return "oauth_vercel"
    case .`web3SolanaSignature`: return "web3_solana_signature"
    case .`web3MetamaskSignature`: return "web3_metamask_signature"
    case .`web3CoinbaseWalletSignature`: return "web3_coinbase_wallet_signature"
    case .`web3OkxWalletSignature`: return "web3_okx_wallet_signature"
    case .`web3BaseSignature`: return "web3_base_signature"
    case .`emailAddress`: return "email_address"
    case .`username`: return "username"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "password": self = .`password`
    case "phone_code": self = .`phoneCode`
    case "email_code": self = .`emailCode`
    case "email_link": self = .`emailLink`
    case "oauth_facebook": self = .`oauthFacebook`
    case "oauth_google": self = .`oauthGoogle`
    case "oauth_hubspot": self = .`oauthHubspot`
    case "oauth_github": self = .`oauthGithub`
    case "oauth_tiktok": self = .`oauthTiktok`
    case "oauth_gitlab": self = .`oauthGitlab`
    case "oauth_discord": self = .`oauthDiscord`
    case "oauth_twitter": self = .`oauthTwitter`
    case "oauth_twitch": self = .`oauthTwitch`
    case "oauth_linkedin": self = .`oauthLinkedin`
    case "oauth_linkedin_oidc": self = .`oauthLinkedinOidc`
    case "oauth_dropbox": self = .`oauthDropbox`
    case "oauth_atlassian": self = .`oauthAtlassian`
    case "oauth_bitbucket": self = .`oauthBitbucket`
    case "oauth_microsoft": self = .`oauthMicrosoft`
    case "oauth_notion": self = .`oauthNotion`
    case "oauth_apple": self = .`oauthApple`
    case "oauth_line": self = .`oauthLine`
    case "oauth_instagram": self = .`oauthInstagram`
    case "oauth_coinbase": self = .`oauthCoinbase`
    case "oauth_spotify": self = .`oauthSpotify`
    case "oauth_xero": self = .`oauthXero`
    case "oauth_box": self = .`oauthBox`
    case "oauth_slack": self = .`oauthSlack`
    case "oauth_linear": self = .`oauthLinear`
    case "oauth_x": self = .`oauthX`
    case "oauth_enstall": self = .`oauthEnstall`
    case "oauth_huggingface": self = .`oauthHuggingface`
    case "oauth_vercel": self = .`oauthVercel`
    case "web3_solana_signature": self = .`web3SolanaSignature`
    case "web3_metamask_signature": self = .`web3MetamaskSignature`
    case "web3_coinbase_wallet_signature": self = .`web3CoinbaseWalletSignature`
    case "web3_okx_wallet_signature": self = .`web3OkxWalletSignature`
    case "web3_base_signature": self = .`web3BaseSignature`
    case "email_address": self = .`emailAddress`
    case "username": self = .`username`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> LastAuthenticationStrategy { .init(rawValue: try value.string()) }
}

public struct EnvironmentResourceState: Hashable, Sendable {
  public let `userSettings`: UserSettings
  public let `organizationSettings`: OrganizationSettings
  public let `authConfig`: AuthConfig
  public let `displayConfig`: DisplayConfig
  public let `commerceSettings`: CommerceSettings
  public let `apiKeysSettings`: APIKeysSettings
  public let `protectConfig`: ProtectConfig
  public let `maintenanceMode`: Bool
  public let `clientDebugMode`: Bool
  public let `partitionedCookies`: Bool
  public let `id`: String?
  public init(`userSettings`: UserSettings, `organizationSettings`: OrganizationSettings, `authConfig`: AuthConfig, `displayConfig`: DisplayConfig, `commerceSettings`: CommerceSettings, `apiKeysSettings`: APIKeysSettings, `protectConfig`: ProtectConfig, `maintenanceMode`: Bool, `clientDebugMode`: Bool, `partitionedCookies`: Bool, `id`: String? = nil) {
    self.`userSettings` = `userSettings`
    self.`organizationSettings` = `organizationSettings`
    self.`authConfig` = `authConfig`
    self.`displayConfig` = `displayConfig`
    self.`commerceSettings` = `commerceSettings`
    self.`apiKeysSettings` = `apiKeysSettings`
    self.`protectConfig` = `protectConfig`
    self.`maintenanceMode` = `maintenanceMode`
    self.`clientDebugMode` = `clientDebugMode`
    self.`partitionedCookies` = `partitionedCookies`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "userSettings": try self.`userSettings`.encode(),
      "organizationSettings": try self.`organizationSettings`.encode(),
      "authConfig": try self.`authConfig`.encode(),
      "displayConfig": try self.`displayConfig`.encode(),
      "commerceSettings": try self.`commerceSettings`.encode(),
      "apiKeysSettings": try self.`apiKeysSettings`.encode(),
      "protectConfig": try self.`protectConfig`.encode(),
      "maintenanceMode": .bool(self.`maintenanceMode`),
      "clientDebugMode": .bool(self.`clientDebugMode`),
      "partitionedCookies": .bool(self.`partitionedCookies`),
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnvironmentResourceState {
    let values = try value.object()

    return try EnvironmentResourceState(`userSettings`: try UserSettings.decode((values["userSettings"] ?? .undefined), in: runtime), `organizationSettings`: try OrganizationSettings.decode((values["organizationSettings"] ?? .undefined), in: runtime), `authConfig`: try AuthConfig.decode((values["authConfig"] ?? .undefined), in: runtime), `displayConfig`: try DisplayConfig.decode((values["displayConfig"] ?? .undefined), in: runtime), `commerceSettings`: try CommerceSettings.decode((values["commerceSettings"] ?? .undefined), in: runtime), `apiKeysSettings`: try APIKeysSettings.decode((values["apiKeysSettings"] ?? .undefined), in: runtime), `protectConfig`: try ProtectConfig.decode((values["protectConfig"] ?? .undefined), in: runtime), `maintenanceMode`: try (values["maintenanceMode"] ?? .undefined).bool(), `clientDebugMode`: try (values["clientDebugMode"] ?? .undefined).bool(), `partitionedCookies`: try (values["partitionedCookies"] ?? .undefined).bool(), `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}
@MainActor @Observable public final class EnvironmentResource: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: EnvironmentResourceState { context.state(handle, as: EnvironmentResourceState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `userSettings`: UserSettings { state.`userSettings` }
  public var `organizationSettings`: OrganizationSettings { state.`organizationSettings` }
  public var `authConfig`: AuthConfig { state.`authConfig` }
  public var `displayConfig`: DisplayConfig { state.`displayConfig` }
  public var `commerceSettings`: CommerceSettings { state.`commerceSettings` }
  public var `apiKeysSettings`: APIKeysSettings { state.`apiKeysSettings` }
  public var `protectConfig`: ProtectConfig { state.`protectConfig` }
  public var `maintenanceMode`: Bool { state.`maintenanceMode` }
  public var `clientDebugMode`: Bool { state.`clientDebugMode` }
  public var `partitionedCookies`: Bool { state.`partitionedCookies` }
  public var `id`: String? { state.`id` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try EnvironmentResourceState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnvironmentResource { try runtime.resource(ResourceHandle.decodeReference(value), as: EnvironmentResource.self) }
  public func `isSingleSession`() async throws -> Bool {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EnvironmentResource.isSingleSession", arguments: []) { result in
      return try result.bool()
    }
  }
  public func `isProduction`() async throws -> Bool {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EnvironmentResource.isProduction", arguments: []) { result in
      return try result.bool()
    }
  }
  public func `isDevelopmentOrStaging`() async throws -> Bool {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EnvironmentResource.isDevelopmentOrStaging", arguments: []) { result in
      return try result.bool()
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> EnvironmentResource {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "EnvironmentResource.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try EnvironmentResource.decode(result, in: runtime)
    }
  }
}

public struct UserSettings: Hashable, Sendable {
  public let `social`: [String: OAuthProviderSettings]
  public let `enterpriseSSO`: EnterpriseSSOSettings
  public let `attributes`: [String: AttributeData]
  public let `actions`: Actions
  public let `signIn`: SignInData
  public let `signUp`: SignUpData
  public let `passwordSettings`: PasswordSettingsData
  public let `usernameSettings`: UsernameSettingsData
  public let `attackProtection`: AttackProtectionData
  public let `passkeySettings`: PasskeySettingsData
  public let `socialProviderStrategies`: [OAuthStrategy]
  public let `authenticatableSocialStrategies`: [OAuthStrategy]
  public let `web3FirstFactors`: [PrepareWeb3WalletVerificationParamsStrategy]
  public let `alternativePhoneCodeChannels`: [PhoneCodeChannel]
  public let `enabledFirstFactorIdentifiers`: [Attribute]
  public let `instanceIsPasswordBased`: Bool
  public let `hasValidAuthFactor`: Bool
  public init(`social`: [String: OAuthProviderSettings], `enterpriseSSO`: EnterpriseSSOSettings, `attributes`: [String: AttributeData], `actions`: Actions, `signIn`: SignInData, `signUp`: SignUpData, `passwordSettings`: PasswordSettingsData, `usernameSettings`: UsernameSettingsData, `attackProtection`: AttackProtectionData, `passkeySettings`: PasskeySettingsData, `socialProviderStrategies`: [OAuthStrategy], `authenticatableSocialStrategies`: [OAuthStrategy], `web3FirstFactors`: [PrepareWeb3WalletVerificationParamsStrategy], `alternativePhoneCodeChannels`: [PhoneCodeChannel], `enabledFirstFactorIdentifiers`: [Attribute], `instanceIsPasswordBased`: Bool, `hasValidAuthFactor`: Bool) {
    self.`social` = `social`
    self.`enterpriseSSO` = `enterpriseSSO`
    self.`attributes` = `attributes`
    self.`actions` = `actions`
    self.`signIn` = `signIn`
    self.`signUp` = `signUp`
    self.`passwordSettings` = `passwordSettings`
    self.`usernameSettings` = `usernameSettings`
    self.`attackProtection` = `attackProtection`
    self.`passkeySettings` = `passkeySettings`
    self.`socialProviderStrategies` = `socialProviderStrategies`
    self.`authenticatableSocialStrategies` = `authenticatableSocialStrategies`
    self.`web3FirstFactors` = `web3FirstFactors`
    self.`alternativePhoneCodeChannels` = `alternativePhoneCodeChannels`
    self.`enabledFirstFactorIdentifiers` = `enabledFirstFactorIdentifiers`
    self.`instanceIsPasswordBased` = `instanceIsPasswordBased`
    self.`hasValidAuthFactor` = `hasValidAuthFactor`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "social": .object(try self.`social`.mapValues { value in try value.encode() }),
      "enterpriseSSO": try self.`enterpriseSSO`.encode(),
      "attributes": .object(try self.`attributes`.mapValues { value in try value.encode() }),
      "actions": try self.`actions`.encode(),
      "signIn": try self.`signIn`.encode(),
      "signUp": try self.`signUp`.encode(),
      "passwordSettings": try self.`passwordSettings`.encode(),
      "usernameSettings": try self.`usernameSettings`.encode(),
      "attackProtection": try self.`attackProtection`.encode(),
      "passkeySettings": try self.`passkeySettings`.encode(),
      "socialProviderStrategies": .array(try self.`socialProviderStrategies`.map { value in try value.encode() }),
      "authenticatableSocialStrategies": .array(try self.`authenticatableSocialStrategies`.map { value in try value.encode() }),
      "web3FirstFactors": .array(try self.`web3FirstFactors`.map { value in try value.encode() }),
      "alternativePhoneCodeChannels": .array(try self.`alternativePhoneCodeChannels`.map { value in try value.encode() }),
      "enabledFirstFactorIdentifiers": .array(try self.`enabledFirstFactorIdentifiers`.map { value in try value.encode() }),
      "instanceIsPasswordBased": .bool(self.`instanceIsPasswordBased`),
      "hasValidAuthFactor": .bool(self.`hasValidAuthFactor`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UserSettings {
    let values = try value.object()

    return try UserSettings(`social`: try (values["social"] ?? .undefined).object().mapValues { value in try OAuthProviderSettings.decode(value, in: runtime) }, `enterpriseSSO`: try EnterpriseSSOSettings.decode((values["enterpriseSSO"] ?? .undefined), in: runtime), `attributes`: try (values["attributes"] ?? .undefined).object().mapValues { value in try AttributeData.decode(value, in: runtime) }, `actions`: try Actions.decode((values["actions"] ?? .undefined), in: runtime), `signIn`: try SignInData.decode((values["signIn"] ?? .undefined), in: runtime), `signUp`: try SignUpData.decode((values["signUp"] ?? .undefined), in: runtime), `passwordSettings`: try PasswordSettingsData.decode((values["passwordSettings"] ?? .undefined), in: runtime), `usernameSettings`: try UsernameSettingsData.decode((values["usernameSettings"] ?? .undefined), in: runtime), `attackProtection`: try AttackProtectionData.decode((values["attackProtection"] ?? .undefined), in: runtime), `passkeySettings`: try PasskeySettingsData.decode((values["passkeySettings"] ?? .undefined), in: runtime), `socialProviderStrategies`: try (values["socialProviderStrategies"] ?? .undefined).array().map { value in try OAuthStrategy.decode(value, in: runtime) }, `authenticatableSocialStrategies`: try (values["authenticatableSocialStrategies"] ?? .undefined).array().map { value in try OAuthStrategy.decode(value, in: runtime) }, `web3FirstFactors`: try (values["web3FirstFactors"] ?? .undefined).array().map { value in try PrepareWeb3WalletVerificationParamsStrategy.decode(value, in: runtime) }, `alternativePhoneCodeChannels`: try (values["alternativePhoneCodeChannels"] ?? .undefined).array().map { value in try PhoneCodeChannel.decode(value, in: runtime) }, `enabledFirstFactorIdentifiers`: try (values["enabledFirstFactorIdentifiers"] ?? .undefined).array().map { value in try Attribute.decode(value, in: runtime) }, `instanceIsPasswordBased`: try (values["instanceIsPasswordBased"] ?? .undefined).bool(), `hasValidAuthFactor`: try (values["hasValidAuthFactor"] ?? .undefined).bool())
  }
}

public struct OAuthProviderSettings: Hashable, Sendable {
  public let `enabled`: Bool
  public let `required`: Bool
  public let `authenticatable`: Bool
  public let `strategy`: OAuthStrategy
  public let `name`: String
  public let `logoUrl`: String?
  public init(`enabled`: Bool, `required`: Bool, `authenticatable`: Bool, `strategy`: OAuthStrategy, `name`: String, `logoUrl`: String?) {
    self.`enabled` = `enabled`
    self.`required` = `required`
    self.`authenticatable` = `authenticatable`
    self.`strategy` = `strategy`
    self.`name` = `name`
    self.`logoUrl` = `logoUrl`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enabled": .bool(self.`enabled`),
      "required": .bool(self.`required`),
      "authenticatable": .bool(self.`authenticatable`),
      "strategy": try self.`strategy`.encode(),
      "name": .string(self.`name`),
      "logo_url": try self.`logoUrl`.map { value in .string(value) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OAuthProviderSettings {
    let values = try value.object()

    return try OAuthProviderSettings(`enabled`: try (values["enabled"] ?? .undefined).bool(), `required`: try (values["required"] ?? .undefined).bool(), `authenticatable`: try (values["authenticatable"] ?? .undefined).bool(), `strategy`: try OAuthStrategy.decode((values["strategy"] ?? .undefined), in: runtime), `name`: try (values["name"] ?? .undefined).string(), `logoUrl`: try (values["logo_url"] ?? .undefined).optional { value in try value.string() })
  }
}

/// OAuth-related authentication strategies (`oauth_<provider>` and custom OAuth).
public enum OAuthStrategy: Hashable, Sendable {
  case `oauthFacebook`
  case `oauthGoogle`
  case `oauthHubspot`
  case `oauthGithub`
  case `oauthTiktok`
  case `oauthGitlab`
  case `oauthDiscord`
  case `oauthTwitter`
  case `oauthTwitch`
  case `oauthLinkedin`
  case `oauthLinkedinOidc`
  case `oauthDropbox`
  case `oauthAtlassian`
  case `oauthBitbucket`
  case `oauthMicrosoft`
  case `oauthNotion`
  case `oauthApple`
  case `oauthLine`
  case `oauthInstagram`
  case `oauthCoinbase`
  case `oauthSpotify`
  case `oauthXero`
  case `oauthBox`
  case `oauthSlack`
  case `oauthLinear`
  case `oauthX`
  case `oauthEnstall`
  case `oauthHuggingface`
  case `oauthVercel`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`oauthFacebook`: return "oauth_facebook"
    case .`oauthGoogle`: return "oauth_google"
    case .`oauthHubspot`: return "oauth_hubspot"
    case .`oauthGithub`: return "oauth_github"
    case .`oauthTiktok`: return "oauth_tiktok"
    case .`oauthGitlab`: return "oauth_gitlab"
    case .`oauthDiscord`: return "oauth_discord"
    case .`oauthTwitter`: return "oauth_twitter"
    case .`oauthTwitch`: return "oauth_twitch"
    case .`oauthLinkedin`: return "oauth_linkedin"
    case .`oauthLinkedinOidc`: return "oauth_linkedin_oidc"
    case .`oauthDropbox`: return "oauth_dropbox"
    case .`oauthAtlassian`: return "oauth_atlassian"
    case .`oauthBitbucket`: return "oauth_bitbucket"
    case .`oauthMicrosoft`: return "oauth_microsoft"
    case .`oauthNotion`: return "oauth_notion"
    case .`oauthApple`: return "oauth_apple"
    case .`oauthLine`: return "oauth_line"
    case .`oauthInstagram`: return "oauth_instagram"
    case .`oauthCoinbase`: return "oauth_coinbase"
    case .`oauthSpotify`: return "oauth_spotify"
    case .`oauthXero`: return "oauth_xero"
    case .`oauthBox`: return "oauth_box"
    case .`oauthSlack`: return "oauth_slack"
    case .`oauthLinear`: return "oauth_linear"
    case .`oauthX`: return "oauth_x"
    case .`oauthEnstall`: return "oauth_enstall"
    case .`oauthHuggingface`: return "oauth_huggingface"
    case .`oauthVercel`: return "oauth_vercel"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "oauth_facebook": self = .`oauthFacebook`
    case "oauth_google": self = .`oauthGoogle`
    case "oauth_hubspot": self = .`oauthHubspot`
    case "oauth_github": self = .`oauthGithub`
    case "oauth_tiktok": self = .`oauthTiktok`
    case "oauth_gitlab": self = .`oauthGitlab`
    case "oauth_discord": self = .`oauthDiscord`
    case "oauth_twitter": self = .`oauthTwitter`
    case "oauth_twitch": self = .`oauthTwitch`
    case "oauth_linkedin": self = .`oauthLinkedin`
    case "oauth_linkedin_oidc": self = .`oauthLinkedinOidc`
    case "oauth_dropbox": self = .`oauthDropbox`
    case "oauth_atlassian": self = .`oauthAtlassian`
    case "oauth_bitbucket": self = .`oauthBitbucket`
    case "oauth_microsoft": self = .`oauthMicrosoft`
    case "oauth_notion": self = .`oauthNotion`
    case "oauth_apple": self = .`oauthApple`
    case "oauth_line": self = .`oauthLine`
    case "oauth_instagram": self = .`oauthInstagram`
    case "oauth_coinbase": self = .`oauthCoinbase`
    case "oauth_spotify": self = .`oauthSpotify`
    case "oauth_xero": self = .`oauthXero`
    case "oauth_box": self = .`oauthBox`
    case "oauth_slack": self = .`oauthSlack`
    case "oauth_linear": self = .`oauthLinear`
    case "oauth_x": self = .`oauthX`
    case "oauth_enstall": self = .`oauthEnstall`
    case "oauth_huggingface": self = .`oauthHuggingface`
    case "oauth_vercel": self = .`oauthVercel`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OAuthStrategy { .init(rawValue: try value.string()) }
}

public struct EnterpriseSSOSettings: Hashable, Sendable {
  public let `enabled`: Bool
  public let `selfServeSso`: Bool
  public init(`enabled`: Bool, `selfServeSso`: Bool) {
    self.`enabled` = `enabled`
    self.`selfServeSso` = `selfServeSso`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enabled": .bool(self.`enabled`),
      "self_serve_sso": .bool(self.`selfServeSso`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EnterpriseSSOSettings {
    let values = try value.object()

    return try EnterpriseSSOSettings(`enabled`: try (values["enabled"] ?? .undefined).bool(), `selfServeSso`: try (values["self_serve_sso"] ?? .undefined).bool())
  }
}

public struct AttributeData: Hashable, Sendable {
  public let `enabled`: Bool
  public let `required`: Bool
  public let `immutable`: Bool?
  public let `verifications`: [VerificationStrategy]
  public let `usedForFirstFactor`: Bool
  public let `firstFactors`: [VerificationStrategy]
  public let `usedForSecondFactor`: Bool
  public let `secondFactors`: [VerificationStrategy]
  public let `verifyAtSignUp`: Bool
  public let `channels`: [PhoneCodeChannel]?
  public let `name`: Attribute
  public init(`enabled`: Bool, `required`: Bool, `immutable`: Bool? = nil, `verifications`: [VerificationStrategy], `usedForFirstFactor`: Bool, `firstFactors`: [VerificationStrategy], `usedForSecondFactor`: Bool, `secondFactors`: [VerificationStrategy], `verifyAtSignUp`: Bool, `channels`: [PhoneCodeChannel]? = nil, `name`: Attribute) {
    self.`enabled` = `enabled`
    self.`required` = `required`
    self.`immutable` = `immutable`
    self.`verifications` = `verifications`
    self.`usedForFirstFactor` = `usedForFirstFactor`
    self.`firstFactors` = `firstFactors`
    self.`usedForSecondFactor` = `usedForSecondFactor`
    self.`secondFactors` = `secondFactors`
    self.`verifyAtSignUp` = `verifyAtSignUp`
    self.`channels` = `channels`
    self.`name` = `name`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enabled": .bool(self.`enabled`),
      "required": .bool(self.`required`),
      "immutable": try self.`immutable`.map { value in .bool(value) } ?? .undefined,
      "verifications": .array(try self.`verifications`.map { value in try value.encode() }),
      "used_for_first_factor": .bool(self.`usedForFirstFactor`),
      "first_factors": .array(try self.`firstFactors`.map { value in try value.encode() }),
      "used_for_second_factor": .bool(self.`usedForSecondFactor`),
      "second_factors": .array(try self.`secondFactors`.map { value in try value.encode() }),
      "verify_at_sign_up": .bool(self.`verifyAtSignUp`),
      "channels": try self.`channels`.map { value in .array(try value.map { value in try value.encode() }) } ?? .undefined,
      "name": try self.`name`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AttributeData {
    let values = try value.object()

    return try AttributeData(`enabled`: try (values["enabled"] ?? .undefined).bool(), `required`: try (values["required"] ?? .undefined).bool(), `immutable`: try (values["immutable"] ?? .undefined).optional { value in try value.bool() }, `verifications`: try (values["verifications"] ?? .undefined).array().map { value in try VerificationStrategy.decode(value, in: runtime) }, `usedForFirstFactor`: try (values["used_for_first_factor"] ?? .undefined).bool(), `firstFactors`: try (values["first_factors"] ?? .undefined).array().map { value in try VerificationStrategy.decode(value, in: runtime) }, `usedForSecondFactor`: try (values["used_for_second_factor"] ?? .undefined).bool(), `secondFactors`: try (values["second_factors"] ?? .undefined).array().map { value in try VerificationStrategy.decode(value, in: runtime) }, `verifyAtSignUp`: try (values["verify_at_sign_up"] ?? .undefined).bool(), `channels`: try (values["channels"] ?? .undefined).optional { value in try value.array().map { value in try PhoneCodeChannel.decode(value, in: runtime) } }, `name`: try Attribute.decode((values["name"] ?? .undefined), in: runtime))
  }
}

public enum VerificationStrategy: Hashable, Sendable {
  case `phoneCode`
  case `emailCode`
  case `emailLink`
  case `totp`
  case `backupCode`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`phoneCode`: return "phone_code"
    case .`emailCode`: return "email_code"
    case .`emailLink`: return "email_link"
    case .`totp`: return "totp"
    case .`backupCode`: return "backup_code"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "phone_code": self = .`phoneCode`
    case "email_code": self = .`emailCode`
    case "email_link": self = .`emailLink`
    case "totp": self = .`totp`
    case "backup_code": self = .`backupCode`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> VerificationStrategy { .init(rawValue: try value.string()) }
}

public enum Attribute: Hashable, Sendable {
  case `passkey`
  case `password`
  case `backupCode`
  case `emailAddress`
  case `phoneNumber`
  case `username`
  case `firstName`
  case `lastName`
  case `web3Wallet`
  case `authenticatorApp`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`passkey`: return "passkey"
    case .`password`: return "password"
    case .`backupCode`: return "backup_code"
    case .`emailAddress`: return "email_address"
    case .`phoneNumber`: return "phone_number"
    case .`username`: return "username"
    case .`firstName`: return "first_name"
    case .`lastName`: return "last_name"
    case .`web3Wallet`: return "web3_wallet"
    case .`authenticatorApp`: return "authenticator_app"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "passkey": self = .`passkey`
    case "password": self = .`password`
    case "backup_code": self = .`backupCode`
    case "email_address": self = .`emailAddress`
    case "phone_number": self = .`phoneNumber`
    case "username": self = .`username`
    case "first_name": self = .`firstName`
    case "last_name": self = .`lastName`
    case "web3_wallet": self = .`web3Wallet`
    case "authenticator_app": self = .`authenticatorApp`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Attribute { .init(rawValue: try value.string()) }
}

public struct Actions: Hashable, Sendable {
  public let `deleteSelf`: Bool
  public let `createOrganization`: Bool
  public init(`deleteSelf`: Bool, `createOrganization`: Bool) {
    self.`deleteSelf` = `deleteSelf`
    self.`createOrganization` = `createOrganization`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "delete_self": .bool(self.`deleteSelf`),
      "create_organization": .bool(self.`createOrganization`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Actions {
    let values = try value.object()

    return try Actions(`deleteSelf`: try (values["delete_self"] ?? .undefined).bool(), `createOrganization`: try (values["create_organization"] ?? .undefined).bool())
  }
}

public struct SignInData: Hashable, Sendable {
  public let `secondFactor`: SignInDataSecond_factor
  public init(`secondFactor`: SignInDataSecond_factor) {
    self.`secondFactor` = `secondFactor`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "second_factor": try self.`secondFactor`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInData {
    let values = try value.object()

    return try SignInData(`secondFactor`: try SignInDataSecond_factor.decode((values["second_factor"] ?? .undefined), in: runtime))
  }
}

public struct SignInDataSecond_factor: Hashable, Sendable {
  public let `required`: Bool
  public let `enabled`: Bool
  public init(`required`: Bool, `enabled`: Bool) {
    self.`required` = `required`
    self.`enabled` = `enabled`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "required": .bool(self.`required`),
      "enabled": .bool(self.`enabled`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInDataSecond_factor {
    let values = try value.object()

    return try SignInDataSecond_factor(`required`: try (values["required"] ?? .undefined).bool(), `enabled`: try (values["enabled"] ?? .undefined).bool())
  }
}

public struct SignUpData: Hashable, Sendable {
  public let `allowlistOnly`: Bool
  public let `progressive`: Bool
  public let `captchaEnabled`: Bool
  public let `mode`: SignUpModes
  public let `legalConsentEnabled`: Bool
  public let `mfa`: SignUpDataMfa?
  public init(`allowlistOnly`: Bool, `progressive`: Bool, `captchaEnabled`: Bool, `mode`: SignUpModes, `legalConsentEnabled`: Bool, `mfa`: SignUpDataMfa? = nil) {
    self.`allowlistOnly` = `allowlistOnly`
    self.`progressive` = `progressive`
    self.`captchaEnabled` = `captchaEnabled`
    self.`mode` = `mode`
    self.`legalConsentEnabled` = `legalConsentEnabled`
    self.`mfa` = `mfa`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "allowlist_only": .bool(self.`allowlistOnly`),
      "progressive": .bool(self.`progressive`),
      "captcha_enabled": .bool(self.`captchaEnabled`),
      "mode": try self.`mode`.encode(),
      "legal_consent_enabled": .bool(self.`legalConsentEnabled`),
      "mfa": try self.`mfa`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpData {
    let values = try value.object()

    return try SignUpData(`allowlistOnly`: try (values["allowlist_only"] ?? .undefined).bool(), `progressive`: try (values["progressive"] ?? .undefined).bool(), `captchaEnabled`: try (values["captcha_enabled"] ?? .undefined).bool(), `mode`: try SignUpModes.decode((values["mode"] ?? .undefined), in: runtime), `legalConsentEnabled`: try (values["legal_consent_enabled"] ?? .undefined).bool(), `mfa`: try (values["mfa"] ?? .undefined).optional { value in try SignUpDataMfa.decode(value, in: runtime) })
  }
}

public enum SignUpModes: Hashable, Sendable {
  case `public`
  case `restricted`
  case `waitlist`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`public`: return "public"
    case .`restricted`: return "restricted"
    case .`waitlist`: return "waitlist"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "public": self = .`public`
    case "restricted": self = .`restricted`
    case "waitlist": self = .`waitlist`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpModes { .init(rawValue: try value.string()) }
}

public struct SignUpDataMfa: Hashable, Sendable {
  public let `required`: Bool
  public init(`required`: Bool) {
    self.`required` = `required`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "required": .bool(self.`required`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpDataMfa {
    let values = try value.object()

    return try SignUpDataMfa(`required`: try (values["required"] ?? .undefined).bool())
  }
}

public struct PasswordSettingsData: Hashable, Sendable {
  public let `allowedSpecialCharacters`: String
  public let `disableHibp`: Bool
  public let `minLength`: Double
  public let `maxLength`: Double
  public let `requireSpecialChar`: Bool
  public let `requireNumbers`: Bool
  public let `requireUppercase`: Bool
  public let `requireLowercase`: Bool
  public let `showZxcvbn`: Bool
  public let `minZxcvbnStrength`: Double
  public init(`allowedSpecialCharacters`: String, `disableHibp`: Bool, `minLength`: Double, `maxLength`: Double, `requireSpecialChar`: Bool, `requireNumbers`: Bool, `requireUppercase`: Bool, `requireLowercase`: Bool, `showZxcvbn`: Bool, `minZxcvbnStrength`: Double) {
    self.`allowedSpecialCharacters` = `allowedSpecialCharacters`
    self.`disableHibp` = `disableHibp`
    self.`minLength` = `minLength`
    self.`maxLength` = `maxLength`
    self.`requireSpecialChar` = `requireSpecialChar`
    self.`requireNumbers` = `requireNumbers`
    self.`requireUppercase` = `requireUppercase`
    self.`requireLowercase` = `requireLowercase`
    self.`showZxcvbn` = `showZxcvbn`
    self.`minZxcvbnStrength` = `minZxcvbnStrength`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "allowed_special_characters": .string(self.`allowedSpecialCharacters`),
      "disable_hibp": .bool(self.`disableHibp`),
      "min_length": .number(self.`minLength`),
      "max_length": .number(self.`maxLength`),
      "require_special_char": .bool(self.`requireSpecialChar`),
      "require_numbers": .bool(self.`requireNumbers`),
      "require_uppercase": .bool(self.`requireUppercase`),
      "require_lowercase": .bool(self.`requireLowercase`),
      "show_zxcvbn": .bool(self.`showZxcvbn`),
      "min_zxcvbn_strength": .number(self.`minZxcvbnStrength`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PasswordSettingsData {
    let values = try value.object()

    return try PasswordSettingsData(`allowedSpecialCharacters`: try (values["allowed_special_characters"] ?? .undefined).string(), `disableHibp`: try (values["disable_hibp"] ?? .undefined).bool(), `minLength`: try (values["min_length"] ?? .undefined).number(), `maxLength`: try (values["max_length"] ?? .undefined).number(), `requireSpecialChar`: try (values["require_special_char"] ?? .undefined).bool(), `requireNumbers`: try (values["require_numbers"] ?? .undefined).bool(), `requireUppercase`: try (values["require_uppercase"] ?? .undefined).bool(), `requireLowercase`: try (values["require_lowercase"] ?? .undefined).bool(), `showZxcvbn`: try (values["show_zxcvbn"] ?? .undefined).bool(), `minZxcvbnStrength`: try (values["min_zxcvbn_strength"] ?? .undefined).number())
  }
}

public struct UsernameSettingsData: Hashable, Sendable {
  public let `minLength`: Double
  public let `maxLength`: Double
  public init(`minLength`: Double, `maxLength`: Double) {
    self.`minLength` = `minLength`
    self.`maxLength` = `maxLength`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "min_length": .number(self.`minLength`),
      "max_length": .number(self.`maxLength`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UsernameSettingsData {
    let values = try value.object()

    return try UsernameSettingsData(`minLength`: try (values["min_length"] ?? .undefined).number(), `maxLength`: try (values["max_length"] ?? .undefined).number())
  }
}

public struct AttackProtectionData: Hashable, Sendable {
  public let `enumerationProtection`: AttackProtectionDataEnumeration_protection
  public init(`enumerationProtection`: AttackProtectionDataEnumeration_protection) {
    self.`enumerationProtection` = `enumerationProtection`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enumeration_protection": try self.`enumerationProtection`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AttackProtectionData {
    let values = try value.object()

    return try AttackProtectionData(`enumerationProtection`: try AttackProtectionDataEnumeration_protection.decode((values["enumeration_protection"] ?? .undefined), in: runtime))
  }
}

public struct AttackProtectionDataEnumeration_protection: Hashable, Sendable {
  public let `enabled`: Bool
  public init(`enabled`: Bool) {
    self.`enabled` = `enabled`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enabled": .bool(self.`enabled`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AttackProtectionDataEnumeration_protection {
    let values = try value.object()

    return try AttackProtectionDataEnumeration_protection(`enabled`: try (values["enabled"] ?? .undefined).bool())
  }
}

public struct PasskeySettingsData: Hashable, Sendable {
  public let `allowAutofill`: Bool
  public let `showSignInButton`: Bool
  public init(`allowAutofill`: Bool, `showSignInButton`: Bool) {
    self.`allowAutofill` = `allowAutofill`
    self.`showSignInButton` = `showSignInButton`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "allow_autofill": .bool(self.`allowAutofill`),
      "show_sign_in_button": .bool(self.`showSignInButton`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PasskeySettingsData {
    let values = try value.object()

    return try PasskeySettingsData(`allowAutofill`: try (values["allow_autofill"] ?? .undefined).bool(), `showSignInButton`: try (values["show_sign_in_button"] ?? .undefined).bool())
  }
}

/// The `OrganizationSettings` object holds the Organization-related settings configured for the instance.
public struct OrganizationSettings: Hashable, Sendable {
  public let `enabled`: Bool
  public let `maxAllowedMemberships`: Double
  public let `forceOrganizationSelection`: Bool
  public let `actions`: OrganizationSettingsActions
  public let `domains`: OrganizationSettingsDomains
  public let `slug`: OrganizationSettingsSlug
  public let `organizationCreationDefaults`: OrganizationSettingsOrganizationCreationDefaults
  public let `id`: String?
  public init(`enabled`: Bool, `maxAllowedMemberships`: Double, `forceOrganizationSelection`: Bool, `actions`: OrganizationSettingsActions, `domains`: OrganizationSettingsDomains, `slug`: OrganizationSettingsSlug, `organizationCreationDefaults`: OrganizationSettingsOrganizationCreationDefaults, `id`: String? = nil) {
    self.`enabled` = `enabled`
    self.`maxAllowedMemberships` = `maxAllowedMemberships`
    self.`forceOrganizationSelection` = `forceOrganizationSelection`
    self.`actions` = `actions`
    self.`domains` = `domains`
    self.`slug` = `slug`
    self.`organizationCreationDefaults` = `organizationCreationDefaults`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enabled": .bool(self.`enabled`),
      "maxAllowedMemberships": .number(self.`maxAllowedMemberships`),
      "forceOrganizationSelection": .bool(self.`forceOrganizationSelection`),
      "actions": try self.`actions`.encode(),
      "domains": try self.`domains`.encode(),
      "slug": try self.`slug`.encode(),
      "organizationCreationDefaults": try self.`organizationCreationDefaults`.encode(),
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationSettings {
    let values = try value.object()

    return try OrganizationSettings(`enabled`: try (values["enabled"] ?? .undefined).bool(), `maxAllowedMemberships`: try (values["maxAllowedMemberships"] ?? .undefined).number(), `forceOrganizationSelection`: try (values["forceOrganizationSelection"] ?? .undefined).bool(), `actions`: try OrganizationSettingsActions.decode((values["actions"] ?? .undefined), in: runtime), `domains`: try OrganizationSettingsDomains.decode((values["domains"] ?? .undefined), in: runtime), `slug`: try OrganizationSettingsSlug.decode((values["slug"] ?? .undefined), in: runtime), `organizationCreationDefaults`: try OrganizationSettingsOrganizationCreationDefaults.decode((values["organizationCreationDefaults"] ?? .undefined), in: runtime), `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct OrganizationSettingsActions: Hashable, Sendable {
  public let `adminDelete`: Bool
  public init(`adminDelete`: Bool) {
    self.`adminDelete` = `adminDelete`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "adminDelete": .bool(self.`adminDelete`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationSettingsActions {
    let values = try value.object()

    return try OrganizationSettingsActions(`adminDelete`: try (values["adminDelete"] ?? .undefined).bool())
  }
}

public struct OrganizationSettingsDomains: Hashable, Sendable {
  public let `enabled`: Bool
  public let `enrollmentModes`: [OrganizationEnrollmentMode]
  public let `defaultRole`: String?
  public init(`enabled`: Bool, `enrollmentModes`: [OrganizationEnrollmentMode], `defaultRole`: String?) {
    self.`enabled` = `enabled`
    self.`enrollmentModes` = `enrollmentModes`
    self.`defaultRole` = `defaultRole`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enabled": .bool(self.`enabled`),
      "enrollmentModes": .array(try self.`enrollmentModes`.map { value in try value.encode() }),
      "defaultRole": try self.`defaultRole`.map { value in .string(value) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationSettingsDomains {
    let values = try value.object()

    return try OrganizationSettingsDomains(`enabled`: try (values["enabled"] ?? .undefined).bool(), `enrollmentModes`: try (values["enrollmentModes"] ?? .undefined).array().map { value in try OrganizationEnrollmentMode.decode(value, in: runtime) }, `defaultRole`: try (values["defaultRole"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct OrganizationSettingsSlug: Hashable, Sendable {
  public let `disabled`: Bool
  public init(`disabled`: Bool) {
    self.`disabled` = `disabled`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "disabled": .bool(self.`disabled`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationSettingsSlug {
    let values = try value.object()

    return try OrganizationSettingsSlug(`disabled`: try (values["disabled"] ?? .undefined).bool())
  }
}

public struct OrganizationSettingsOrganizationCreationDefaults: Hashable, Sendable {
  public let `enabled`: Bool
  public init(`enabled`: Bool) {
    self.`enabled` = `enabled`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enabled": .bool(self.`enabled`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OrganizationSettingsOrganizationCreationDefaults {
    let values = try value.object()

    return try OrganizationSettingsOrganizationCreationDefaults(`enabled`: try (values["enabled"] ?? .undefined).bool())
  }
}

public struct AuthConfig: Hashable, Sendable {
  public let `singleSessionMode`: Bool
  public let `claimedAt`: Date?
  public let `reverification`: Bool
  public let `preferredChannels`: [String: PhoneCodeChannel]?
  public let `sessionMinter`: Bool
  public let `nativeSettings`: NativeAuthSettings?
  public let `id`: String?
  public init(`singleSessionMode`: Bool, `claimedAt`: Date?, `reverification`: Bool, `preferredChannels`: [String: PhoneCodeChannel]?, `sessionMinter`: Bool, `nativeSettings`: NativeAuthSettings? = nil, `id`: String? = nil) {
    self.`singleSessionMode` = `singleSessionMode`
    self.`claimedAt` = `claimedAt`
    self.`reverification` = `reverification`
    self.`preferredChannels` = `preferredChannels`
    self.`sessionMinter` = `sessionMinter`
    self.`nativeSettings` = `nativeSettings`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "singleSessionMode": .bool(self.`singleSessionMode`),
      "claimedAt": try self.`claimedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "reverification": .bool(self.`reverification`),
      "preferredChannels": try self.`preferredChannels`.map { value in .object(try value.mapValues { value in try value.encode() }) } ?? .null,
      "sessionMinter": .bool(self.`sessionMinter`),
      "nativeSettings": try self.`nativeSettings`.map { value in try value.encode() } ?? .undefined,
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> AuthConfig {
    let values = try value.object()

    return try AuthConfig(`singleSessionMode`: try (values["singleSessionMode"] ?? .undefined).bool(), `claimedAt`: try (values["claimedAt"] ?? .undefined).optional { value in try value.date() }, `reverification`: try (values["reverification"] ?? .undefined).bool(), `preferredChannels`: try (values["preferredChannels"] ?? .undefined).optional { value in try value.object().mapValues { value in try PhoneCodeChannel.decode(value, in: runtime) } }, `sessionMinter`: try (values["sessionMinter"] ?? .undefined).bool(), `nativeSettings`: try (values["nativeSettings"] ?? .undefined).optional { value in try NativeAuthSettings.decode(value, in: runtime) }, `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct NativeAuthSettings: Hashable, Sendable {
  public let `apiEnabled`: Bool
  public let `trustedDeviceSignInEnabled`: Bool
  public let `trustedDeviceEnrollmentPromptAfterSignInEnabled`: Bool
  public let `trustedDeviceEnrollmentPromptAfterSignUpEnabled`: Bool
  public init(`apiEnabled`: Bool, `trustedDeviceSignInEnabled`: Bool, `trustedDeviceEnrollmentPromptAfterSignInEnabled`: Bool, `trustedDeviceEnrollmentPromptAfterSignUpEnabled`: Bool) {
    self.`apiEnabled` = `apiEnabled`
    self.`trustedDeviceSignInEnabled` = `trustedDeviceSignInEnabled`
    self.`trustedDeviceEnrollmentPromptAfterSignInEnabled` = `trustedDeviceEnrollmentPromptAfterSignInEnabled`
    self.`trustedDeviceEnrollmentPromptAfterSignUpEnabled` = `trustedDeviceEnrollmentPromptAfterSignUpEnabled`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "apiEnabled": .bool(self.`apiEnabled`),
      "trustedDeviceSignInEnabled": .bool(self.`trustedDeviceSignInEnabled`),
      "trustedDeviceEnrollmentPromptAfterSignInEnabled": .bool(self.`trustedDeviceEnrollmentPromptAfterSignInEnabled`),
      "trustedDeviceEnrollmentPromptAfterSignUpEnabled": .bool(self.`trustedDeviceEnrollmentPromptAfterSignUpEnabled`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> NativeAuthSettings {
    let values = try value.object()

    return try NativeAuthSettings(`apiEnabled`: try (values["apiEnabled"] ?? .undefined).bool(), `trustedDeviceSignInEnabled`: try (values["trustedDeviceSignInEnabled"] ?? .undefined).bool(), `trustedDeviceEnrollmentPromptAfterSignInEnabled`: try (values["trustedDeviceEnrollmentPromptAfterSignInEnabled"] ?? .undefined).bool(), `trustedDeviceEnrollmentPromptAfterSignUpEnabled`: try (values["trustedDeviceEnrollmentPromptAfterSignUpEnabled"] ?? .undefined).bool())
  }
}

public struct DisplayConfig: Hashable, Sendable {
  public let `id`: String
  public let `afterSignInUrl`: String
  public let `afterSignOutAllUrl`: String
  public let `afterSignOutOneUrl`: String
  public let `afterSignUpUrl`: String
  public let `afterSwitchSessionUrl`: String
  public let `applicationName`: String
  public let `backendHost`: String
  public let `branded`: Bool
  public let `captchaPublicKey`: String?
  public let `captchaWidgetType`: DisplayConfigCaptchaWidgetType?
  public var `captchaProvider`: String { "turnstile" }
  public let `captchaPublicKeyInvisible`: String?
  public let `captchaOauthBypass`: [OAuthStrategy]
  public let `captchaHeartbeat`: Bool
  public let `captchaHeartbeatIntervalMs`: Double?
  public let `homeUrl`: String
  public let `instanceEnvironmentType`: String
  public let `logoImageUrl`: String
  public let `faviconImageUrl`: String
  public let `preferredSignInStrategy`: PreferredSignInStrategy
  public let `signInUrl`: String
  public let `signUpUrl`: String
  public let `supportEmail`: String
  public let `theme`: DisplayThemeJSON
  public let `userProfileUrl`: String
  public let `clerkJSVersion`: String?
  public let `organizationProfileUrl`: String
  public let `createOrganizationUrl`: String
  public let `afterLeaveOrganizationUrl`: String
  public let `afterCreateOrganizationUrl`: String
  public let `googleOneTapClientId`: String?
  public let `showDevModeWarning`: Bool
  public let `termsUrl`: String
  public let `privacyPolicyUrl`: String
  public let `waitlistUrl`: String
  public let `afterJoinWaitlistUrl`: String
  public init(`id`: String, `afterSignInUrl`: String, `afterSignOutAllUrl`: String, `afterSignOutOneUrl`: String, `afterSignUpUrl`: String, `afterSwitchSessionUrl`: String, `applicationName`: String, `backendHost`: String, `branded`: Bool, `captchaPublicKey`: String?, `captchaWidgetType`: DisplayConfigCaptchaWidgetType?, `captchaPublicKeyInvisible`: String?, `captchaOauthBypass`: [OAuthStrategy], `captchaHeartbeat`: Bool, `captchaHeartbeatIntervalMs`: Double? = nil, `homeUrl`: String, `instanceEnvironmentType`: String, `logoImageUrl`: String, `faviconImageUrl`: String, `preferredSignInStrategy`: PreferredSignInStrategy, `signInUrl`: String, `signUpUrl`: String, `supportEmail`: String, `theme`: DisplayThemeJSON, `userProfileUrl`: String, `clerkJSVersion`: String? = nil, `organizationProfileUrl`: String, `createOrganizationUrl`: String, `afterLeaveOrganizationUrl`: String, `afterCreateOrganizationUrl`: String, `googleOneTapClientId`: String? = nil, `showDevModeWarning`: Bool, `termsUrl`: String, `privacyPolicyUrl`: String, `waitlistUrl`: String, `afterJoinWaitlistUrl`: String) {
    self.`id` = `id`
    self.`afterSignInUrl` = `afterSignInUrl`
    self.`afterSignOutAllUrl` = `afterSignOutAllUrl`
    self.`afterSignOutOneUrl` = `afterSignOutOneUrl`
    self.`afterSignUpUrl` = `afterSignUpUrl`
    self.`afterSwitchSessionUrl` = `afterSwitchSessionUrl`
    self.`applicationName` = `applicationName`
    self.`backendHost` = `backendHost`
    self.`branded` = `branded`
    self.`captchaPublicKey` = `captchaPublicKey`
    self.`captchaWidgetType` = `captchaWidgetType`
    self.`captchaPublicKeyInvisible` = `captchaPublicKeyInvisible`
    self.`captchaOauthBypass` = `captchaOauthBypass`
    self.`captchaHeartbeat` = `captchaHeartbeat`
    self.`captchaHeartbeatIntervalMs` = `captchaHeartbeatIntervalMs`
    self.`homeUrl` = `homeUrl`
    self.`instanceEnvironmentType` = `instanceEnvironmentType`
    self.`logoImageUrl` = `logoImageUrl`
    self.`faviconImageUrl` = `faviconImageUrl`
    self.`preferredSignInStrategy` = `preferredSignInStrategy`
    self.`signInUrl` = `signInUrl`
    self.`signUpUrl` = `signUpUrl`
    self.`supportEmail` = `supportEmail`
    self.`theme` = `theme`
    self.`userProfileUrl` = `userProfileUrl`
    self.`clerkJSVersion` = `clerkJSVersion`
    self.`organizationProfileUrl` = `organizationProfileUrl`
    self.`createOrganizationUrl` = `createOrganizationUrl`
    self.`afterLeaveOrganizationUrl` = `afterLeaveOrganizationUrl`
    self.`afterCreateOrganizationUrl` = `afterCreateOrganizationUrl`
    self.`googleOneTapClientId` = `googleOneTapClientId`
    self.`showDevModeWarning` = `showDevModeWarning`
    self.`termsUrl` = `termsUrl`
    self.`privacyPolicyUrl` = `privacyPolicyUrl`
    self.`waitlistUrl` = `waitlistUrl`
    self.`afterJoinWaitlistUrl` = `afterJoinWaitlistUrl`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "afterSignInUrl": .string(self.`afterSignInUrl`),
      "afterSignOutAllUrl": .string(self.`afterSignOutAllUrl`),
      "afterSignOutOneUrl": .string(self.`afterSignOutOneUrl`),
      "afterSignUpUrl": .string(self.`afterSignUpUrl`),
      "afterSwitchSessionUrl": .string(self.`afterSwitchSessionUrl`),
      "applicationName": .string(self.`applicationName`),
      "backendHost": .string(self.`backendHost`),
      "branded": .bool(self.`branded`),
      "captchaPublicKey": try self.`captchaPublicKey`.map { value in .string(value) } ?? .null,
      "captchaWidgetType": try self.`captchaWidgetType`.map { value in try value.encode() } ?? .null,
      "captchaProvider": .string("turnstile"),
      "captchaPublicKeyInvisible": try self.`captchaPublicKeyInvisible`.map { value in .string(value) } ?? .null,
      "captchaOauthBypass": .array(try self.`captchaOauthBypass`.map { value in try value.encode() }),
      "captchaHeartbeat": .bool(self.`captchaHeartbeat`),
      "captchaHeartbeatIntervalMs": try self.`captchaHeartbeatIntervalMs`.map { value in .number(value) } ?? .undefined,
      "homeUrl": .string(self.`homeUrl`),
      "instanceEnvironmentType": .string(self.`instanceEnvironmentType`),
      "logoImageUrl": .string(self.`logoImageUrl`),
      "faviconImageUrl": .string(self.`faviconImageUrl`),
      "preferredSignInStrategy": try self.`preferredSignInStrategy`.encode(),
      "signInUrl": .string(self.`signInUrl`),
      "signUpUrl": .string(self.`signUpUrl`),
      "supportEmail": .string(self.`supportEmail`),
      "theme": try self.`theme`.encode(),
      "userProfileUrl": .string(self.`userProfileUrl`),
      "clerkJSVersion": try self.`clerkJSVersion`.map { value in .string(value) } ?? .undefined,
      "organizationProfileUrl": .string(self.`organizationProfileUrl`),
      "createOrganizationUrl": .string(self.`createOrganizationUrl`),
      "afterLeaveOrganizationUrl": .string(self.`afterLeaveOrganizationUrl`),
      "afterCreateOrganizationUrl": .string(self.`afterCreateOrganizationUrl`),
      "googleOneTapClientId": try self.`googleOneTapClientId`.map { value in .string(value) } ?? .undefined,
      "showDevModeWarning": .bool(self.`showDevModeWarning`),
      "termsUrl": .string(self.`termsUrl`),
      "privacyPolicyUrl": .string(self.`privacyPolicyUrl`),
      "waitlistUrl": .string(self.`waitlistUrl`),
      "afterJoinWaitlistUrl": .string(self.`afterJoinWaitlistUrl`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> DisplayConfig {
    let values = try value.object()
    guard values["captchaProvider"] == .string("turnstile") else { throw CoreError.invalidValue }
    return try DisplayConfig(`id`: try (values["id"] ?? .undefined).string(), `afterSignInUrl`: try (values["afterSignInUrl"] ?? .undefined).string(), `afterSignOutAllUrl`: try (values["afterSignOutAllUrl"] ?? .undefined).string(), `afterSignOutOneUrl`: try (values["afterSignOutOneUrl"] ?? .undefined).string(), `afterSignUpUrl`: try (values["afterSignUpUrl"] ?? .undefined).string(), `afterSwitchSessionUrl`: try (values["afterSwitchSessionUrl"] ?? .undefined).string(), `applicationName`: try (values["applicationName"] ?? .undefined).string(), `backendHost`: try (values["backendHost"] ?? .undefined).string(), `branded`: try (values["branded"] ?? .undefined).bool(), `captchaPublicKey`: try (values["captchaPublicKey"] ?? .undefined).optional { value in try value.string() }, `captchaWidgetType`: try (values["captchaWidgetType"] ?? .undefined).optional { value in try DisplayConfigCaptchaWidgetType.decode(value, in: runtime) }, `captchaPublicKeyInvisible`: try (values["captchaPublicKeyInvisible"] ?? .undefined).optional { value in try value.string() }, `captchaOauthBypass`: try (values["captchaOauthBypass"] ?? .undefined).array().map { value in try OAuthStrategy.decode(value, in: runtime) }, `captchaHeartbeat`: try (values["captchaHeartbeat"] ?? .undefined).bool(), `captchaHeartbeatIntervalMs`: try (values["captchaHeartbeatIntervalMs"] ?? .undefined).optional { value in try value.number() }, `homeUrl`: try (values["homeUrl"] ?? .undefined).string(), `instanceEnvironmentType`: try (values["instanceEnvironmentType"] ?? .undefined).string(), `logoImageUrl`: try (values["logoImageUrl"] ?? .undefined).string(), `faviconImageUrl`: try (values["faviconImageUrl"] ?? .undefined).string(), `preferredSignInStrategy`: try PreferredSignInStrategy.decode((values["preferredSignInStrategy"] ?? .undefined), in: runtime), `signInUrl`: try (values["signInUrl"] ?? .undefined).string(), `signUpUrl`: try (values["signUpUrl"] ?? .undefined).string(), `supportEmail`: try (values["supportEmail"] ?? .undefined).string(), `theme`: try DisplayThemeJSON.decode((values["theme"] ?? .undefined), in: runtime), `userProfileUrl`: try (values["userProfileUrl"] ?? .undefined).string(), `clerkJSVersion`: try (values["clerkJSVersion"] ?? .undefined).optional { value in try value.string() }, `organizationProfileUrl`: try (values["organizationProfileUrl"] ?? .undefined).string(), `createOrganizationUrl`: try (values["createOrganizationUrl"] ?? .undefined).string(), `afterLeaveOrganizationUrl`: try (values["afterLeaveOrganizationUrl"] ?? .undefined).string(), `afterCreateOrganizationUrl`: try (values["afterCreateOrganizationUrl"] ?? .undefined).string(), `googleOneTapClientId`: try (values["googleOneTapClientId"] ?? .undefined).optional { value in try value.string() }, `showDevModeWarning`: try (values["showDevModeWarning"] ?? .undefined).bool(), `termsUrl`: try (values["termsUrl"] ?? .undefined).string(), `privacyPolicyUrl`: try (values["privacyPolicyUrl"] ?? .undefined).string(), `waitlistUrl`: try (values["waitlistUrl"] ?? .undefined).string(), `afterJoinWaitlistUrl`: try (values["afterJoinWaitlistUrl"] ?? .undefined).string())
  }
}

public enum DisplayConfigCaptchaWidgetType: Hashable, Sendable {
  case `smart`
  case `invisible`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`smart`: return "smart"
    case .`invisible`: return "invisible"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "smart": self = .`smart`
    case "invisible": self = .`invisible`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> DisplayConfigCaptchaWidgetType { .init(rawValue: try value.string()) }
}

public enum PreferredSignInStrategy: Hashable, Sendable {
  case `password`
  case `otp`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`password`: return "password"
    case .`otp`: return "otp"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "password": self = .`password`
    case "otp": self = .`otp`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PreferredSignInStrategy { .init(rawValue: try value.string()) }
}

public struct DisplayThemeJSON: Hashable, Sendable {
  public let `general`: DisplayThemeJSONGeneral
  public let `buttons`: DisplayThemeJSONButtons
  public let `accounts`: DisplayThemeJSONAccounts
  public init(`general`: DisplayThemeJSONGeneral, `buttons`: DisplayThemeJSONButtons, `accounts`: DisplayThemeJSONAccounts) {
    self.`general` = `general`
    self.`buttons` = `buttons`
    self.`accounts` = `accounts`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "general": try self.`general`.encode(),
      "buttons": try self.`buttons`.encode(),
      "accounts": try self.`accounts`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> DisplayThemeJSON {
    let values = try value.object()

    return try DisplayThemeJSON(`general`: try DisplayThemeJSONGeneral.decode((values["general"] ?? .undefined), in: runtime), `buttons`: try DisplayThemeJSONButtons.decode((values["buttons"] ?? .undefined), in: runtime), `accounts`: try DisplayThemeJSONAccounts.decode((values["accounts"] ?? .undefined), in: runtime))
  }
}

public struct DisplayThemeJSONGeneral: Hashable, Sendable {
  public let `color`: String
  public let `backgroundColor`: DisplayThemeColor
  public let `fontFamily`: String
  public let `fontColor`: String
  public let `labelFontWeight`: String
  public let `padding`: String
  public let `borderRadius`: String
  public let `boxShadow`: String
  public init(`color`: String, `backgroundColor`: DisplayThemeColor, `fontFamily`: String, `fontColor`: String, `labelFontWeight`: String, `padding`: String, `borderRadius`: String, `boxShadow`: String) {
    self.`color` = `color`
    self.`backgroundColor` = `backgroundColor`
    self.`fontFamily` = `fontFamily`
    self.`fontColor` = `fontColor`
    self.`labelFontWeight` = `labelFontWeight`
    self.`padding` = `padding`
    self.`borderRadius` = `borderRadius`
    self.`boxShadow` = `boxShadow`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "color": .string(self.`color`),
      "background_color": try self.`backgroundColor`.encode(),
      "font_family": .string(self.`fontFamily`),
      "font_color": .string(self.`fontColor`),
      "label_font_weight": .string(self.`labelFontWeight`),
      "padding": .string(self.`padding`),
      "border_radius": .string(self.`borderRadius`),
      "box_shadow": .string(self.`boxShadow`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> DisplayThemeJSONGeneral {
    let values = try value.object()

    return try DisplayThemeJSONGeneral(`color`: try (values["color"] ?? .undefined).string(), `backgroundColor`: try DisplayThemeColor.decode((values["background_color"] ?? .undefined), in: runtime), `fontFamily`: try (values["font_family"] ?? .undefined).string(), `fontColor`: try (values["font_color"] ?? .undefined).string(), `labelFontWeight`: try (values["label_font_weight"] ?? .undefined).string(), `padding`: try (values["padding"] ?? .undefined).string(), `borderRadius`: try (values["border_radius"] ?? .undefined).string(), `boxShadow`: try (values["box_shadow"] ?? .undefined).string())
  }
}

public indirect enum DisplayThemeColor: Hashable, Sendable {
  case case1(String)
  case case2(HslaColor)
  case case3(RgbaColor)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": .string(value)])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> DisplayThemeColor {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try payload.string())
    case 1: return .case2(try HslaColor.decode(payload, in: runtime))
    case 2: return .case3(try RgbaColor.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct HslaColor: Hashable, Sendable {
  public let `h`: Double
  public let `s`: Double
  public let `l`: Double
  public let `a`: Double?
  public init(`h`: Double, `s`: Double, `l`: Double, `a`: Double? = nil) {
    self.`h` = `h`
    self.`s` = `s`
    self.`l` = `l`
    self.`a` = `a`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "h": .number(self.`h`),
      "s": .number(self.`s`),
      "l": .number(self.`l`),
      "a": try self.`a`.map { value in .number(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> HslaColor {
    let values = try value.object()

    return try HslaColor(`h`: try (values["h"] ?? .undefined).number(), `s`: try (values["s"] ?? .undefined).number(), `l`: try (values["l"] ?? .undefined).number(), `a`: try (values["a"] ?? .undefined).optional { value in try value.number() })
  }
}

public struct RgbaColor: Hashable, Sendable {
  public let `r`: Double
  public let `g`: Double
  public let `b`: Double
  public let `a`: Double?
  public init(`r`: Double, `g`: Double, `b`: Double, `a`: Double? = nil) {
    self.`r` = `r`
    self.`g` = `g`
    self.`b` = `b`
    self.`a` = `a`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "r": .number(self.`r`),
      "g": .number(self.`g`),
      "b": .number(self.`b`),
      "a": try self.`a`.map { value in .number(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> RgbaColor {
    let values = try value.object()

    return try RgbaColor(`r`: try (values["r"] ?? .undefined).number(), `g`: try (values["g"] ?? .undefined).number(), `b`: try (values["b"] ?? .undefined).number(), `a`: try (values["a"] ?? .undefined).optional { value in try value.number() })
  }
}

public struct DisplayThemeJSONButtons: Hashable, Sendable {
  public let `fontColor`: String
  public let `fontFamily`: String
  public let `fontWeight`: String
  public init(`fontColor`: String, `fontFamily`: String, `fontWeight`: String) {
    self.`fontColor` = `fontColor`
    self.`fontFamily` = `fontFamily`
    self.`fontWeight` = `fontWeight`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "font_color": .string(self.`fontColor`),
      "font_family": .string(self.`fontFamily`),
      "font_weight": .string(self.`fontWeight`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> DisplayThemeJSONButtons {
    let values = try value.object()

    return try DisplayThemeJSONButtons(`fontColor`: try (values["font_color"] ?? .undefined).string(), `fontFamily`: try (values["font_family"] ?? .undefined).string(), `fontWeight`: try (values["font_weight"] ?? .undefined).string())
  }
}

public struct DisplayThemeJSONAccounts: Hashable, Sendable {
  public let `backgroundColor`: DisplayThemeColor
  public init(`backgroundColor`: DisplayThemeColor) {
    self.`backgroundColor` = `backgroundColor`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "background_color": try self.`backgroundColor`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> DisplayThemeJSONAccounts {
    let values = try value.object()

    return try DisplayThemeJSONAccounts(`backgroundColor`: try DisplayThemeColor.decode((values["background_color"] ?? .undefined), in: runtime))
  }
}

public struct CommerceSettings: Hashable, Sendable {
  public let `billing`: CommerceSettingsBilling
  public let `id`: String?
  public init(`billing`: CommerceSettingsBilling, `id`: String? = nil) {
    self.`billing` = `billing`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "billing": try self.`billing`.encode(),
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CommerceSettings {
    let values = try value.object()

    return try CommerceSettings(`billing`: try CommerceSettingsBilling.decode((values["billing"] ?? .undefined), in: runtime), `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct CommerceSettingsBilling: Hashable, Sendable {
  public let `stripePublishableKey`: String?
  public let `organization`: CommerceSettingsBillingOrganization
  public let `user`: CommerceSettingsBillingUser
  public init(`stripePublishableKey`: String?, `organization`: CommerceSettingsBillingOrganization, `user`: CommerceSettingsBillingUser) {
    self.`stripePublishableKey` = `stripePublishableKey`
    self.`organization` = `organization`
    self.`user` = `user`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "stripePublishableKey": try self.`stripePublishableKey`.map { value in .string(value) } ?? .null,
      "organization": try self.`organization`.encode(),
      "user": try self.`user`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CommerceSettingsBilling {
    let values = try value.object()

    return try CommerceSettingsBilling(`stripePublishableKey`: try (values["stripePublishableKey"] ?? .undefined).optional { value in try value.string() }, `organization`: try CommerceSettingsBillingOrganization.decode((values["organization"] ?? .undefined), in: runtime), `user`: try CommerceSettingsBillingUser.decode((values["user"] ?? .undefined), in: runtime))
  }
}

public struct CommerceSettingsBillingOrganization: Hashable, Sendable {
  public let `enabled`: Bool
  public let `hasPaidPlans`: Bool
  public init(`enabled`: Bool, `hasPaidPlans`: Bool) {
    self.`enabled` = `enabled`
    self.`hasPaidPlans` = `hasPaidPlans`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enabled": .bool(self.`enabled`),
      "hasPaidPlans": .bool(self.`hasPaidPlans`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CommerceSettingsBillingOrganization {
    let values = try value.object()

    return try CommerceSettingsBillingOrganization(`enabled`: try (values["enabled"] ?? .undefined).bool(), `hasPaidPlans`: try (values["hasPaidPlans"] ?? .undefined).bool())
  }
}

public struct CommerceSettingsBillingUser: Hashable, Sendable {
  public let `enabled`: Bool
  public let `hasPaidPlans`: Bool
  public init(`enabled`: Bool, `hasPaidPlans`: Bool) {
    self.`enabled` = `enabled`
    self.`hasPaidPlans` = `hasPaidPlans`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "enabled": .bool(self.`enabled`),
      "hasPaidPlans": .bool(self.`hasPaidPlans`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> CommerceSettingsBillingUser {
    let values = try value.object()

    return try CommerceSettingsBillingUser(`enabled`: try (values["enabled"] ?? .undefined).bool(), `hasPaidPlans`: try (values["hasPaidPlans"] ?? .undefined).bool())
  }
}

public struct APIKeysSettings: Hashable, Sendable {
  public let `userApiKeysEnabled`: Bool
  public let `orgsApiKeysEnabled`: Bool
  public let `id`: String?
  public init(`userApiKeysEnabled`: Bool, `orgsApiKeysEnabled`: Bool, `id`: String? = nil) {
    self.`userApiKeysEnabled` = `userApiKeysEnabled`
    self.`orgsApiKeysEnabled` = `orgsApiKeysEnabled`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "user_api_keys_enabled": .bool(self.`userApiKeysEnabled`),
      "orgs_api_keys_enabled": .bool(self.`orgsApiKeysEnabled`),
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> APIKeysSettings {
    let values = try value.object()

    return try APIKeysSettings(`userApiKeysEnabled`: try (values["user_api_keys_enabled"] ?? .undefined).bool(), `orgsApiKeysEnabled`: try (values["orgs_api_keys_enabled"] ?? .undefined).bool(), `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct ProtectConfig: Hashable, Sendable {
  public let `id`: String?
  public let `loaders`: [ProtectLoader]?
  public let `tokensInvalidBefore`: Double?
  public let `challengeLoadTimeoutMs`: Double?
  public init(`id`: String? = nil, `loaders`: [ProtectLoader]? = nil, `tokensInvalidBefore`: Double? = nil, `challengeLoadTimeoutMs`: Double? = nil) {
    self.`id` = `id`
    self.`loaders` = `loaders`
    self.`tokensInvalidBefore` = `tokensInvalidBefore`
    self.`challengeLoadTimeoutMs` = `challengeLoadTimeoutMs`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": try self.`id`.map { value in .string(value) } ?? .undefined,
      "loaders": try self.`loaders`.map { value in .array(try value.map { value in try value.encode() }) } ?? .undefined,
      "tokens_invalid_before": try self.`tokensInvalidBefore`.map { value in .number(value) } ?? .undefined,
      "challenge_load_timeout_ms": try self.`challengeLoadTimeoutMs`.map { value in .number(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ProtectConfig {
    let values = try value.object()

    return try ProtectConfig(`id`: try (values["id"] ?? .undefined).optional { value in try value.string() }, `loaders`: try (values["loaders"] ?? .undefined).optional { value in try value.array().map { value in try ProtectLoader.decode(value, in: runtime) } }, `tokensInvalidBefore`: try (values["tokens_invalid_before"] ?? .undefined).optional { value in try value.number() }, `challengeLoadTimeoutMs`: try (values["challenge_load_timeout_ms"] ?? .undefined).optional { value in try value.number() })
  }
}

/// One loader, exactly as the server serves it.
///
/// **Field names are the wire's, not TypeScript's.** The array is assigned straight out of
/// `/v1/environment` with no case conversion, so a camelCase name here reads a field the server
/// does not send and is silently `undefined` forever. `token_timeout_ms` shipped that way and the
/// per-instance deadline it configures did nothing. Match the Go tag on
/// `antifraud/config.JSLoaderConfig`, and if a field has no tag there yet, name it as that tag
/// would be.
public struct ProtectLoader: Hashable, Sendable {
  public let `rollout`: Double?
  public let `target`: ProtectLoaderTarget
  public let `type`: String
  public let `attributes`: [String: ProtectLoaderAttributesValue]?
  public let `textContent`: String?
  public let `tokenUrl`: String?
  public let `tokenTimeoutMs`: Double?
  public let `challengeLoadTimeoutMs`: Double?
  public init(`rollout`: Double? = nil, `target`: ProtectLoaderTarget, `type`: String, `attributes`: [String: ProtectLoaderAttributesValue]? = nil, `textContent`: String? = nil, `tokenUrl`: String? = nil, `tokenTimeoutMs`: Double? = nil, `challengeLoadTimeoutMs`: Double? = nil) {
    self.`rollout` = `rollout`
    self.`target` = `target`
    self.`type` = `type`
    self.`attributes` = `attributes`
    self.`textContent` = `textContent`
    self.`tokenUrl` = `tokenUrl`
    self.`tokenTimeoutMs` = `tokenTimeoutMs`
    self.`challengeLoadTimeoutMs` = `challengeLoadTimeoutMs`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "rollout": try self.`rollout`.map { value in .number(value) } ?? .undefined,
      "target": try self.`target`.encode(),
      "type": .string(self.`type`),
      "attributes": try self.`attributes`.map { value in .object(try value.mapValues { value in try value.encode() }) } ?? .undefined,
      "text_content": try self.`textContent`.map { value in .string(value) } ?? .undefined,
      "token_url": try self.`tokenUrl`.map { value in .string(value) } ?? .undefined,
      "token_timeout_ms": try self.`tokenTimeoutMs`.map { value in .number(value) } ?? .undefined,
      "challenge_load_timeout_ms": try self.`challengeLoadTimeoutMs`.map { value in .number(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ProtectLoader {
    let values = try value.object()

    return try ProtectLoader(`rollout`: try (values["rollout"] ?? .undefined).optional { value in try value.number() }, `target`: try ProtectLoaderTarget.decode((values["target"] ?? .undefined), in: runtime), `type`: try (values["type"] ?? .undefined).string(), `attributes`: try (values["attributes"] ?? .undefined).optional { value in try value.object().mapValues { value in try ProtectLoaderAttributesValue.decode(value, in: runtime) } }, `textContent`: try (values["text_content"] ?? .undefined).optional { value in try value.string() }, `tokenUrl`: try (values["token_url"] ?? .undefined).optional { value in try value.string() }, `tokenTimeoutMs`: try (values["token_timeout_ms"] ?? .undefined).optional { value in try value.number() }, `challengeLoadTimeoutMs`: try (values["challenge_load_timeout_ms"] ?? .undefined).optional { value in try value.number() })
  }
}

public enum ProtectLoaderTarget: Hashable, Sendable {
  case `head`
  case `body`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`head`: return "head"
    case .`body`: return "body"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "head": self = .`head`
    case "body": self = .`body`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ProtectLoaderTarget { .init(rawValue: try value.string()) }
}

public indirect enum ProtectLoaderAttributesValue: Hashable, Sendable {
  case case1(String)
  case case2(Double)
  case case3(Bool)
  case case4(Bool)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": .string(value)])
    case .case2(let value): return .object(["$case": .number(1), "value": .number(value)])
    case .case3(let value): return .object(["$case": .number(2), "value": .bool(false)])
    case .case4(let value): return .object(["$case": .number(3), "value": .bool(true)])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ProtectLoaderAttributesValue {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try payload.string())
    case 1: return .case2(try payload.number())
    case 2: return .case3(try payload.literal(.bool(false)).bool())
    case 3: return .case4(try payload.literal(.bool(true)).bool())
    default: throw CoreError.invalidValue
    }
  }
}

/// Native biometric credentials, backed by device-held keys and the Clerk core.
public struct BiometricCredentialsState: Hashable, Sendable {
  public let `canEnroll`: Bool
  public init(`canEnroll`: Bool) {
    self.`canEnroll` = `canEnroll`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "canEnroll": .bool(self.`canEnroll`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialsState {
    let values = try value.object()

    return try BiometricCredentialsState(`canEnroll`: try (values["canEnroll"] ?? .undefined).bool())
  }
}
@MainActor @Observable public final class BiometricCredentials: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: BiometricCredentialsState { context.state(handle, as: BiometricCredentialsState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `canEnroll`: Bool { state.`canEnroll` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try BiometricCredentialsState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentials { try runtime.resource(ResourceHandle.decodeReference(value), as: BiometricCredentials.self) }
  public func `list`() async throws -> [BiometricCredential] {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BiometricCredentials.list", arguments: []) { result in
      return try result.array().map { value in try BiometricCredential.decode(value, in: runtime) }
    }
  }
  public func `availability`(_ `params`: BiometricCredentialSelectionParams? = nil) async throws -> BiometricCredentialAvailability {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BiometricCredentials.availability", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try BiometricCredentialAvailability.decode(result, in: runtime)
    }
  }
  public func `localAvailability`(_ `params`: BiometricCredentialSelectionParams? = nil) async throws -> BiometricCredentialAvailability {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BiometricCredentials.localAvailability", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try BiometricCredentialAvailability.decode(result, in: runtime)
    }
  }
  public func `validateLocalCredential`(_ `params`: BiometricCredentialSelectionParams? = nil) async throws -> BiometricCredentialValidationResult {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BiometricCredentials.validateLocalCredential", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try BiometricCredentialValidationResult.decode(result, in: runtime)
    }
  }
  public func `enroll`(_ `params`: BiometricCredentialEnrollmentParams? = nil) async throws -> BiometricCredential {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BiometricCredentials.enroll", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try BiometricCredential.decode(result, in: runtime)
    }
  }
  public func `revoke`(_ `params`: BiometricCredentialsRevokeParams) async throws -> BiometricCredential {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BiometricCredentials.revoke", arguments: [try `params`.encode()]) { result in
      return try BiometricCredential.decode(result, in: runtime)
    }
  }
  public func `revokeCurrentDeviceCredential`() async throws -> BiometricCredential? {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BiometricCredentials.revokeCurrentDeviceCredential", arguments: []) { result in
      return try result.optional { value in try BiometricCredential.decode(value, in: runtime) }
    }
  }
  public func `forgetLocalCredentials`(_ `params`: BiometricCredentialsForgetLocalCredentialsParams) async throws -> Double {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "BiometricCredentials.forgetLocalCredentials", arguments: [try `params`.encode()]) { result in
      return try result.number()
    }
  }
}

public struct BiometricCredential: Hashable, Sendable {
  public let `id`: String
  public let `object`: String
  public let `platform`: BiometricCredentialPlatform
  public let `appIdentifier`: String
  public let `name`: String?
  public let `algorithm`: BiometricCredentialAlgorithm
  public let `status`: BiometricCredentialStatus
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public let `lastUsedAt`: Date?
  public let `revokedAt`: Date?
  public init(`id`: String, `object`: String, `platform`: BiometricCredentialPlatform, `appIdentifier`: String, `name`: String?, `algorithm`: BiometricCredentialAlgorithm, `status`: BiometricCredentialStatus, `createdAt`: Date, `updatedAt`: Date, `lastUsedAt`: Date?, `revokedAt`: Date?) {
    self.`id` = `id`
    self.`object` = `object`
    self.`platform` = `platform`
    self.`appIdentifier` = `appIdentifier`
    self.`name` = `name`
    self.`algorithm` = `algorithm`
    self.`status` = `status`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
    self.`lastUsedAt` = `lastUsedAt`
    self.`revokedAt` = `revokedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`),
      "object": .string(self.`object`),
      "platform": try self.`platform`.encode(),
      "appIdentifier": .string(self.`appIdentifier`),
      "name": try self.`name`.map { value in .string(value) } ?? .null,
      "algorithm": try self.`algorithm`.encode(),
      "status": try self.`status`.encode(),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "lastUsedAt": try self.`lastUsedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "revokedAt": try self.`revokedAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredential {
    let values = try value.object()

    return try BiometricCredential(`id`: try (values["id"] ?? .undefined).string(), `object`: try (values["object"] ?? .undefined).string(), `platform`: try BiometricCredentialPlatform.decode((values["platform"] ?? .undefined), in: runtime), `appIdentifier`: try (values["appIdentifier"] ?? .undefined).string(), `name`: try (values["name"] ?? .undefined).optional { value in try value.string() }, `algorithm`: try BiometricCredentialAlgorithm.decode((values["algorithm"] ?? .undefined), in: runtime), `status`: try BiometricCredentialStatus.decode((values["status"] ?? .undefined), in: runtime), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date(), `lastUsedAt`: try (values["lastUsedAt"] ?? .undefined).optional { value in try value.date() }, `revokedAt`: try (values["revokedAt"] ?? .undefined).optional { value in try value.date() })
  }
}

public indirect enum BiometricCredentialPlatform: Hashable, Sendable {
  case case1(String)
  case case2(String)
  case case3(String)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": .string("ios")])
    case .case2(let value): return .object(["$case": .number(1), "value": .string("android")])
    case .case3(let value): return .object(["$case": .number(2), "value": .string(value)])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialPlatform {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try payload.literal(.string("ios")).string())
    case 1: return .case2(try payload.literal(.string("android")).string())
    case 2: return .case3(try payload.string())
    default: throw CoreError.invalidValue
    }
  }
}

public indirect enum BiometricCredentialAlgorithm: Hashable, Sendable {
  case case1(String)
  case case2(String)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": .string(value)])
    case .case2(let value): return .object(["$case": .number(1), "value": .string("ES256")])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialAlgorithm {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try payload.string())
    case 1: return .case2(try payload.literal(.string("ES256")).string())
    default: throw CoreError.invalidValue
    }
  }
}

public indirect enum BiometricCredentialStatus: Hashable, Sendable {
  case case1(String)
  case case2(String)
  case case3(String)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": .string("active")])
    case .case2(let value): return .object(["$case": .number(1), "value": .string("revoked")])
    case .case3(let value): return .object(["$case": .number(2), "value": .string(value)])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialStatus {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try payload.literal(.string("active")).string())
    case 1: return .case2(try payload.literal(.string("revoked")).string())
    case 2: return .case3(try payload.string())
    default: throw CoreError.invalidValue
    }
  }
}

public struct BiometricCredentialSelectionParams: Hashable, Sendable {
  public let `id`: String?
  public let `identifierHint`: String?
  public let `currentUser`: Bool?
  public init(`id`: String? = nil, `identifierHint`: String? = nil, `currentUser`: Bool? = nil) {
    self.`id` = `id`
    self.`identifierHint` = `identifierHint`
    self.`currentUser` = `currentUser`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": try self.`id`.map { value in .string(value) } ?? .undefined,
      "identifierHint": try self.`identifierHint`.map { value in .string(value) } ?? .undefined,
      "currentUser": try self.`currentUser`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialSelectionParams {
    let values = try value.object()

    return try BiometricCredentialSelectionParams(`id`: try (values["id"] ?? .undefined).optional { value in try value.string() }, `identifierHint`: try (values["identifierHint"] ?? .undefined).optional { value in try value.string() }, `currentUser`: try (values["currentUser"] ?? .undefined).optional { value in try value.bool() })
  }
}

public struct BiometricCredentialAvailability: Hashable, Sendable {
  public let `isAvailable`: Bool
  public let `unavailableReason`: BiometricCredentialUnavailableReason?
  public init(`isAvailable`: Bool, `unavailableReason`: BiometricCredentialUnavailableReason?) {
    self.`isAvailable` = `isAvailable`
    self.`unavailableReason` = `unavailableReason`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "isAvailable": .bool(self.`isAvailable`),
      "unavailableReason": try self.`unavailableReason`.map { value in try value.encode() } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialAvailability {
    let values = try value.object()

    return try BiometricCredentialAvailability(`isAvailable`: try (values["isAvailable"] ?? .undefined).bool(), `unavailableReason`: try (values["unavailableReason"] ?? .undefined).optional { value in try BiometricCredentialUnavailableReason.decode(value, in: runtime) })
  }
}

public enum BiometricCredentialUnavailableReason: Hashable, Sendable {
  case `environmentUnavailable`
  case `nativeAPIDisabled`
  case `featureDisabled`
  case `unsupportedPlatform`
  case `biometricAuthenticationUnavailable`
  case `noLocalCredential`
  case `localKeyMissing`
  case `serverCredentialMissing`
  case `serverCredentialRevoked`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`environmentUnavailable`: return "environmentUnavailable"
    case .`nativeAPIDisabled`: return "nativeAPIDisabled"
    case .`featureDisabled`: return "featureDisabled"
    case .`unsupportedPlatform`: return "unsupportedPlatform"
    case .`biometricAuthenticationUnavailable`: return "biometricAuthenticationUnavailable"
    case .`noLocalCredential`: return "noLocalCredential"
    case .`localKeyMissing`: return "localKeyMissing"
    case .`serverCredentialMissing`: return "serverCredentialMissing"
    case .`serverCredentialRevoked`: return "serverCredentialRevoked"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "environmentUnavailable": self = .`environmentUnavailable`
    case "nativeAPIDisabled": self = .`nativeAPIDisabled`
    case "featureDisabled": self = .`featureDisabled`
    case "unsupportedPlatform": self = .`unsupportedPlatform`
    case "biometricAuthenticationUnavailable": self = .`biometricAuthenticationUnavailable`
    case "noLocalCredential": self = .`noLocalCredential`
    case "localKeyMissing": self = .`localKeyMissing`
    case "serverCredentialMissing": self = .`serverCredentialMissing`
    case "serverCredentialRevoked": self = .`serverCredentialRevoked`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialUnavailableReason { .init(rawValue: try value.string()) }
}

public struct BiometricCredentialValidationResult: Hashable, Sendable {
  public let `status`: BiometricCredentialValidationResultStatus
  public let `reason`: BiometricCredentialUnavailableReason?
  public init(`status`: BiometricCredentialValidationResultStatus, `reason`: BiometricCredentialUnavailableReason?) {
    self.`status` = `status`
    self.`reason` = `reason`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "status": try self.`status`.encode(),
      "reason": try self.`reason`.map { value in try value.encode() } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialValidationResult {
    let values = try value.object()

    return try BiometricCredentialValidationResult(`status`: try BiometricCredentialValidationResultStatus.decode((values["status"] ?? .undefined), in: runtime), `reason`: try (values["reason"] ?? .undefined).optional { value in try BiometricCredentialUnavailableReason.decode(value, in: runtime) })
  }
}

public enum BiometricCredentialValidationResultStatus: Hashable, Sendable {
  case `valid`
  case `invalid`
  case `inconclusive`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`valid`: return "valid"
    case .`invalid`: return "invalid"
    case .`inconclusive`: return "inconclusive"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "valid": self = .`valid`
    case "invalid": self = .`invalid`
    case "inconclusive": self = .`inconclusive`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialValidationResultStatus { .init(rawValue: try value.string()) }
}

public struct BiometricCredentialEnrollmentParams: Hashable, Sendable {
  public let `name`: String?
  public let `identifierHint`: String?
  public let `reason`: String?
  public let `promptSubtitle`: String?
  public let `policy`: BiometricCredentialPolicy?
  public init(`name`: String? = nil, `identifierHint`: String? = nil, `reason`: String? = nil, `promptSubtitle`: String? = nil, `policy`: BiometricCredentialPolicy? = nil) {
    self.`name` = `name`
    self.`identifierHint` = `identifierHint`
    self.`reason` = `reason`
    self.`promptSubtitle` = `promptSubtitle`
    self.`policy` = `policy`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "name": try self.`name`.map { value in .string(value) } ?? .undefined,
      "identifierHint": try self.`identifierHint`.map { value in .string(value) } ?? .undefined,
      "reason": try self.`reason`.map { value in .string(value) } ?? .undefined,
      "promptSubtitle": try self.`promptSubtitle`.map { value in .string(value) } ?? .undefined,
      "policy": try self.`policy`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialEnrollmentParams {
    let values = try value.object()

    return try BiometricCredentialEnrollmentParams(`name`: try (values["name"] ?? .undefined).optional { value in try value.string() }, `identifierHint`: try (values["identifierHint"] ?? .undefined).optional { value in try value.string() }, `reason`: try (values["reason"] ?? .undefined).optional { value in try value.string() }, `promptSubtitle`: try (values["promptSubtitle"] ?? .undefined).optional { value in try value.string() }, `policy`: try (values["policy"] ?? .undefined).optional { value in try BiometricCredentialPolicy.decode(value, in: runtime) })
  }
}

public enum BiometricCredentialPolicy: Hashable, Sendable {
  case `biometryCurrentSet`
  case `biometryAny`
  case `biometryOrDevicePasscode`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`biometryCurrentSet`: return "biometry_current_set"
    case .`biometryAny`: return "biometry_any"
    case .`biometryOrDevicePasscode`: return "biometry_or_device_passcode"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "biometry_current_set": self = .`biometryCurrentSet`
    case "biometry_any": self = .`biometryAny`
    case "biometry_or_device_passcode": self = .`biometryOrDevicePasscode`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialPolicy { .init(rawValue: try value.string()) }
}

public struct BiometricCredentialsRevokeParams: Hashable, Sendable {
  public let `id`: String
  public init(`id`: String) {
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .string(self.`id`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialsRevokeParams {
    let values = try value.object()

    return try BiometricCredentialsRevokeParams(`id`: try (values["id"] ?? .undefined).string())
  }
}

public struct BiometricCredentialsForgetLocalCredentialsParams: Hashable, Sendable {
  public let `userId`: String
  public init(`userId`: String) {
    self.`userId` = `userId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "userId": .string(self.`userId`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> BiometricCredentialsForgetLocalCredentialsParams {
    let values = try value.object()

    return try BiometricCredentialsForgetLocalCredentialsParams(`userId`: try (values["userId"] ?? .undefined).string())
  }
}

public struct MobileAuthCallback: Hashable, Sendable {
  public let `id`: Double
  public let `result`: MobileAuthenticationResult
  public init(`id`: Double, `result`: MobileAuthenticationResult) {
    self.`id` = `id`
    self.`result` = `result`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": .number(self.`id`),
      "result": try self.`result`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileAuthCallback {
    let values = try value.object()

    return try MobileAuthCallback(`id`: try (values["id"] ?? .undefined).number(), `result`: try MobileAuthenticationResult.decode((values["result"] ?? .undefined), in: runtime))
  }
}

public indirect enum MobileAuthenticationResult: Hashable, Sendable {
  case case1(MobileAuthCallbackResultCase1)
  case case2(MobileAuthCallbackResultCase2)
  @MainActor public var `kind`: String {
    switch self {
    case .case1(let value): return value.`kind`
    case .case2(let value): return value.`kind`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileAuthenticationResult {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try MobileAuthCallbackResultCase1.decode(payload, in: runtime))
    case 1: return .case2(try MobileAuthCallbackResultCase2.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct MobileAuthCallbackResultCase1: Hashable, Sendable {
  public var `kind`: String { "signIn" }
  public let `signIn`: SignIn
  public init(`signIn`: SignIn) {
    self.`signIn` = `signIn`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "kind": .string("signIn"),
      "signIn": try self.`signIn`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileAuthCallbackResultCase1 {
    let values = try value.object()
    guard values["kind"] == .string("signIn") else { throw CoreError.invalidValue }
    return try MobileAuthCallbackResultCase1(`signIn`: try SignIn.decode((values["signIn"] ?? .undefined), in: runtime))
  }
}

/// The `SignInFuture` class holds the state of the current sign-in and provides helper methods to navigate and complete the sign-in process. It is used to manage the sign-in lifecycle, including the first and second factor verification, and the creation of a new session.
public struct SignInState: Hashable, Sendable {
  public let `id`: String?
  public let `supportedFirstFactors`: [SignInFirstFactor]
  public let `supportedSecondFactors`: [SignInSecondFactor]
  public let `status`: SignInStatus
  public let `isTransferable`: Bool
  public let `existingSession`: SignInExistingSession?
  public let `firstFactorVerification`: Verification
  public let `secondFactorVerification`: Verification
  public let `identifier`: String?
  public let `createdSessionId`: String?
  public let `userData`: UserData
  public let `protectCheck`: ProtectCheck?
  public let `canBeDiscarded`: Bool
  public let `emailCode`: SignInEmailCode
  public let `emailLink`: SignInEmailLink
  public let `phoneCode`: SignInPhoneCode
  public let `resetPasswordEmailCode`: SignInResetPasswordEmailCode
  public let `resetPasswordPhoneCode`: SignInResetPasswordPhoneCode
  public let `mfa`: SignInMfa
  public init(`id`: String? = nil, `supportedFirstFactors`: [SignInFirstFactor], `supportedSecondFactors`: [SignInSecondFactor], `status`: SignInStatus, `isTransferable`: Bool, `existingSession`: SignInExistingSession? = nil, `firstFactorVerification`: Verification, `secondFactorVerification`: Verification, `identifier`: String?, `createdSessionId`: String?, `userData`: UserData, `protectCheck`: ProtectCheck?, `canBeDiscarded`: Bool, `emailCode`: SignInEmailCode, `emailLink`: SignInEmailLink, `phoneCode`: SignInPhoneCode, `resetPasswordEmailCode`: SignInResetPasswordEmailCode, `resetPasswordPhoneCode`: SignInResetPasswordPhoneCode, `mfa`: SignInMfa) {
    self.`id` = `id`
    self.`supportedFirstFactors` = `supportedFirstFactors`
    self.`supportedSecondFactors` = `supportedSecondFactors`
    self.`status` = `status`
    self.`isTransferable` = `isTransferable`
    self.`existingSession` = `existingSession`
    self.`firstFactorVerification` = `firstFactorVerification`
    self.`secondFactorVerification` = `secondFactorVerification`
    self.`identifier` = `identifier`
    self.`createdSessionId` = `createdSessionId`
    self.`userData` = `userData`
    self.`protectCheck` = `protectCheck`
    self.`canBeDiscarded` = `canBeDiscarded`
    self.`emailCode` = `emailCode`
    self.`emailLink` = `emailLink`
    self.`phoneCode` = `phoneCode`
    self.`resetPasswordEmailCode` = `resetPasswordEmailCode`
    self.`resetPasswordPhoneCode` = `resetPasswordPhoneCode`
    self.`mfa` = `mfa`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": try self.`id`.map { value in .string(value) } ?? .undefined,
      "supportedFirstFactors": .array(try self.`supportedFirstFactors`.map { value in try value.encode() }),
      "supportedSecondFactors": .array(try self.`supportedSecondFactors`.map { value in try value.encode() }),
      "status": try self.`status`.encode(),
      "isTransferable": .bool(self.`isTransferable`),
      "existingSession": try self.`existingSession`.map { value in try value.encode() } ?? .undefined,
      "firstFactorVerification": try self.`firstFactorVerification`.encode(),
      "secondFactorVerification": try self.`secondFactorVerification`.encode(),
      "identifier": try self.`identifier`.map { value in .string(value) } ?? .null,
      "createdSessionId": try self.`createdSessionId`.map { value in .string(value) } ?? .null,
      "userData": try self.`userData`.encode(),
      "protectCheck": try self.`protectCheck`.map { value in try value.encode() } ?? .null,
      "canBeDiscarded": .bool(self.`canBeDiscarded`),
      "emailCode": try self.`emailCode`.encode(),
      "emailLink": try self.`emailLink`.encode(),
      "phoneCode": try self.`phoneCode`.encode(),
      "resetPasswordEmailCode": try self.`resetPasswordEmailCode`.encode(),
      "resetPasswordPhoneCode": try self.`resetPasswordPhoneCode`.encode(),
      "mfa": try self.`mfa`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInState {
    let values = try value.object()

    return try SignInState(`id`: try (values["id"] ?? .undefined).optional { value in try value.string() }, `supportedFirstFactors`: try (values["supportedFirstFactors"] ?? .undefined).array().map { value in try SignInFirstFactor.decode(value, in: runtime) }, `supportedSecondFactors`: try (values["supportedSecondFactors"] ?? .undefined).array().map { value in try SignInSecondFactor.decode(value, in: runtime) }, `status`: try SignInStatus.decode((values["status"] ?? .undefined), in: runtime), `isTransferable`: try (values["isTransferable"] ?? .undefined).bool(), `existingSession`: try (values["existingSession"] ?? .undefined).optional { value in try SignInExistingSession.decode(value, in: runtime) }, `firstFactorVerification`: try Verification.decode((values["firstFactorVerification"] ?? .undefined), in: runtime), `secondFactorVerification`: try Verification.decode((values["secondFactorVerification"] ?? .undefined), in: runtime), `identifier`: try (values["identifier"] ?? .undefined).optional { value in try value.string() }, `createdSessionId`: try (values["createdSessionId"] ?? .undefined).optional { value in try value.string() }, `userData`: try UserData.decode((values["userData"] ?? .undefined), in: runtime), `protectCheck`: try (values["protectCheck"] ?? .undefined).optional { value in try ProtectCheck.decode(value, in: runtime) }, `canBeDiscarded`: try (values["canBeDiscarded"] ?? .undefined).bool(), `emailCode`: try SignInEmailCode.decode((values["emailCode"] ?? .undefined), in: runtime), `emailLink`: try SignInEmailLink.decode((values["emailLink"] ?? .undefined), in: runtime), `phoneCode`: try SignInPhoneCode.decode((values["phoneCode"] ?? .undefined), in: runtime), `resetPasswordEmailCode`: try SignInResetPasswordEmailCode.decode((values["resetPasswordEmailCode"] ?? .undefined), in: runtime), `resetPasswordPhoneCode`: try SignInResetPasswordPhoneCode.decode((values["resetPasswordPhoneCode"] ?? .undefined), in: runtime), `mfa`: try SignInMfa.decode((values["mfa"] ?? .undefined), in: runtime))
  }
}
@MainActor @Observable public final class SignIn: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SignInState { context.state(handle, as: SignInState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String? { state.`id` }
  public var `supportedFirstFactors`: [SignInFirstFactor] { state.`supportedFirstFactors` }
  public var `supportedSecondFactors`: [SignInSecondFactor] { state.`supportedSecondFactors` }
  public var `status`: SignInStatus { state.`status` }
  public var `isTransferable`: Bool { state.`isTransferable` }
  public var `existingSession`: SignInExistingSession? { state.`existingSession` }
  public var `firstFactorVerification`: Verification { state.`firstFactorVerification` }
  public var `secondFactorVerification`: Verification { state.`secondFactorVerification` }
  public var `identifier`: String? { state.`identifier` }
  public var `createdSessionId`: String? { state.`createdSessionId` }
  public var `userData`: UserData { state.`userData` }
  public var `protectCheck`: ProtectCheck? { state.`protectCheck` }
  public var `canBeDiscarded`: Bool { state.`canBeDiscarded` }
  public var `emailCode`: SignInEmailCode { state.`emailCode` }
  public var `emailLink`: SignInEmailLink { state.`emailLink` }
  public var `phoneCode`: SignInPhoneCode { state.`phoneCode` }
  public var `resetPasswordEmailCode`: SignInResetPasswordEmailCode { state.`resetPasswordEmailCode` }
  public var `resetPasswordPhoneCode`: SignInResetPasswordPhoneCode { state.`resetPasswordPhoneCode` }
  public var `mfa`: SignInMfa { state.`mfa` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try SignInState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignIn { try runtime.resource(ResourceHandle.decodeReference(value), as: SignIn.self) }
  /// Creates a new `SignIn` instance initialized with the provided parameters. The instance maintains the sign-in lifecycle state through its `status` property, which updates as the authentication flow progresses. Once the sign-in process is complete, call the `signIn.finalize()` method to set the newly created session as the active session.
  ///
  /// What you must pass to `params` depends on which [sign-in options](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options) you have enabled in your app's settings in the Clerk Dashboard.
  ///
  /// You can complete the sign-in process in one step if you supply the required fields to `create()`. Otherwise, Clerk's sign-in process provides great flexibility and allows users to easily create multi-step sign-in flows.
  ///
  /// > [!IMPORTANT]
  /// > The `signIn.create()` method is intended for advanced use cases. For most use cases, prefer the use of the factor-specific methods such as `signIn.password()`, `signIn.emailCode.sendCode()`, etc.
  public func `create`(_ `params`: SignInCreateParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignIn.create", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Submits a password to sign-in.
  public func `password`(_ `params`: SignInPasswordParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignIn.password", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Authenticate with a locally enrolled, device-held biometric key.
  public func `biometricCredential`(_ `params`: SignInBiometricCredentialParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignIn.biometricCredential", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  public func `sso`(_ `params`: SignInSSOParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignIn.sso", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Performs a ticket-based sign-in.
  public func `ticket`(_ `params`: SignInTicketParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignIn.ticket", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Initiates a passkey-based authentication flow, enabling users to authenticate using a previously registered passkey. When called without parameters, this method requires a prior call to `SignIn.create({ strategy: 'passkey' })` to initialize the sign-in context. This pattern is particularly useful in scenarios where the authentication strategy needs to be determined dynamically at runtime.
  public func `passkey`(_ `params`: SignInPasskeyParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignIn.passkey", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Submits a proof token to resolve a pending protect check challenge. The response may contain another `protectCheck` (a chained challenge) which must be resolved iteratively.
  public func `submitProtectCheck`(_ `params`: SignInSubmitProtectCheckParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignIn.submitProtectCheck", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Converts a sign-in with `status === 'complete'` into an active session. Will cause anything observing the session state (such as the [`useUser()`](https://clerk.com/docs/reference/hooks/use-user) hook) to update automatically.
  public func `finalize`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignIn.finalize", arguments: []) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Resets the current sign-in attempt by clearing all local state back to null. This is useful when you want to allow users to go back to the beginning of the sign-in flow (e.g., to change their identifier during verification).
  ///
  /// Unlike other methods, `reset()` does not trigger the `fetchStatus` to change to `'fetching'` and does not make any API calls - it only clears local state.
  public func `reset`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignIn.reset", arguments: []) { result in
      try runtime.checkErrorResult(result)
    }
  }
}

public indirect enum SignInFirstFactor: Hashable, Sendable {
  case case1(EmailCodeFactor)
  case case2(EmailLinkFactor)
  case case3(PhoneCodeFactor)
  case case4(Web3SignatureFactor)
  case case5(PasswordFactor)
  case case6(PasskeyFactor)
  case case7(OauthFactor)
  case case8(EnterpriseSSOFactor)
  case case9(ResetPasswordPhoneCodeFactor)
  case case10(ResetPasswordEmailCodeFactor)
  case case11(TrustedDeviceFactor)
  @MainActor public var `strategy`: String {
    switch self {
    case .case1(let value): return value.`strategy`
    case .case2(let value): return value.`strategy`
    case .case3(let value): return value.`strategy`
    case .case4(let value): return value.`strategy`.rawValue
    case .case5(let value): return value.`strategy`
    case .case6(let value): return value.`strategy`
    case .case7(let value): return value.`strategy`.rawValue
    case .case8(let value): return value.`strategy`
    case .case9(let value): return value.`strategy`
    case .case10(let value): return value.`strategy`
    case .case11(let value): return value.`strategy`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    case .case4(let value): return .object(["$case": .number(3), "value": try value.encode()])
    case .case5(let value): return .object(["$case": .number(4), "value": try value.encode()])
    case .case6(let value): return .object(["$case": .number(5), "value": try value.encode()])
    case .case7(let value): return .object(["$case": .number(6), "value": try value.encode()])
    case .case8(let value): return .object(["$case": .number(7), "value": try value.encode()])
    case .case9(let value): return .object(["$case": .number(8), "value": try value.encode()])
    case .case10(let value): return .object(["$case": .number(9), "value": try value.encode()])
    case .case11(let value): return .object(["$case": .number(10), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInFirstFactor {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try EmailCodeFactor.decode(payload, in: runtime))
    case 1: return .case2(try EmailLinkFactor.decode(payload, in: runtime))
    case 2: return .case3(try PhoneCodeFactor.decode(payload, in: runtime))
    case 3: return .case4(try Web3SignatureFactor.decode(payload, in: runtime))
    case 4: return .case5(try PasswordFactor.decode(payload, in: runtime))
    case 5: return .case6(try PasskeyFactor.decode(payload, in: runtime))
    case 6: return .case7(try OauthFactor.decode(payload, in: runtime))
    case 7: return .case8(try EnterpriseSSOFactor.decode(payload, in: runtime))
    case 8: return .case9(try ResetPasswordPhoneCodeFactor.decode(payload, in: runtime))
    case 9: return .case10(try ResetPasswordEmailCodeFactor.decode(payload, in: runtime))
    case 10: return .case11(try TrustedDeviceFactor.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct EmailLinkFactor: Hashable, Sendable {
  public var `strategy`: String { "email_link" }
  public let `emailAddressId`: String
  public let `safeIdentifier`: String
  public let `primary`: Bool?
  public init(`emailAddressId`: String, `safeIdentifier`: String, `primary`: Bool? = nil) {
    self.`emailAddressId` = `emailAddressId`
    self.`safeIdentifier` = `safeIdentifier`
    self.`primary` = `primary`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("email_link"),
      "emailAddressId": .string(self.`emailAddressId`),
      "safeIdentifier": .string(self.`safeIdentifier`),
      "primary": try self.`primary`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> EmailLinkFactor {
    let values = try value.object()
    guard values["strategy"] == .string("email_link") else { throw CoreError.invalidValue }
    return try EmailLinkFactor(`emailAddressId`: try (values["emailAddressId"] ?? .undefined).string(), `safeIdentifier`: try (values["safeIdentifier"] ?? .undefined).string(), `primary`: try (values["primary"] ?? .undefined).optional { value in try value.bool() })
  }
}

public struct Web3SignatureFactor: Hashable, Sendable {
  public let `strategy`: PrepareWeb3WalletVerificationParamsStrategy
  public let `web3WalletId`: String
  public let `primary`: Bool?
  public let `walletName`: String?
  public init(`strategy`: PrepareWeb3WalletVerificationParamsStrategy, `web3WalletId`: String, `primary`: Bool? = nil, `walletName`: String? = nil) {
    self.`strategy` = `strategy`
    self.`web3WalletId` = `web3WalletId`
    self.`primary` = `primary`
    self.`walletName` = `walletName`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": try self.`strategy`.encode(),
      "web3WalletId": .string(self.`web3WalletId`),
      "primary": try self.`primary`.map { value in .bool(value) } ?? .undefined,
      "walletName": try self.`walletName`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> Web3SignatureFactor {
    let values = try value.object()

    return try Web3SignatureFactor(`strategy`: try PrepareWeb3WalletVerificationParamsStrategy.decode((values["strategy"] ?? .undefined), in: runtime), `web3WalletId`: try (values["web3WalletId"] ?? .undefined).string(), `primary`: try (values["primary"] ?? .undefined).optional { value in try value.bool() }, `walletName`: try (values["walletName"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct OauthFactor: Hashable, Sendable {
  public let `strategy`: OAuthStrategy
  public init(`strategy`: OAuthStrategy) {
    self.`strategy` = `strategy`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": try self.`strategy`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> OauthFactor {
    let values = try value.object()

    return try OauthFactor(`strategy`: try OAuthStrategy.decode((values["strategy"] ?? .undefined), in: runtime))
  }
}

public struct ResetPasswordPhoneCodeFactor: Hashable, Sendable {
  public var `strategy`: String { "reset_password_phone_code" }
  public let `phoneNumberId`: String
  public let `safeIdentifier`: String
  public let `primary`: Bool?
  public init(`phoneNumberId`: String, `safeIdentifier`: String, `primary`: Bool? = nil) {
    self.`phoneNumberId` = `phoneNumberId`
    self.`safeIdentifier` = `safeIdentifier`
    self.`primary` = `primary`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("reset_password_phone_code"),
      "phoneNumberId": .string(self.`phoneNumberId`),
      "safeIdentifier": .string(self.`safeIdentifier`),
      "primary": try self.`primary`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ResetPasswordPhoneCodeFactor {
    let values = try value.object()
    guard values["strategy"] == .string("reset_password_phone_code") else { throw CoreError.invalidValue }
    return try ResetPasswordPhoneCodeFactor(`phoneNumberId`: try (values["phoneNumberId"] ?? .undefined).string(), `safeIdentifier`: try (values["safeIdentifier"] ?? .undefined).string(), `primary`: try (values["primary"] ?? .undefined).optional { value in try value.bool() })
  }
}

public struct ResetPasswordEmailCodeFactor: Hashable, Sendable {
  public var `strategy`: String { "reset_password_email_code" }
  public let `emailAddressId`: String
  public let `safeIdentifier`: String
  public let `primary`: Bool?
  public init(`emailAddressId`: String, `safeIdentifier`: String, `primary`: Bool? = nil) {
    self.`emailAddressId` = `emailAddressId`
    self.`safeIdentifier` = `safeIdentifier`
    self.`primary` = `primary`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("reset_password_email_code"),
      "emailAddressId": .string(self.`emailAddressId`),
      "safeIdentifier": .string(self.`safeIdentifier`),
      "primary": try self.`primary`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ResetPasswordEmailCodeFactor {
    let values = try value.object()
    guard values["strategy"] == .string("reset_password_email_code") else { throw CoreError.invalidValue }
    return try ResetPasswordEmailCodeFactor(`emailAddressId`: try (values["emailAddressId"] ?? .undefined).string(), `safeIdentifier`: try (values["safeIdentifier"] ?? .undefined).string(), `primary`: try (values["primary"] ?? .undefined).optional { value in try value.bool() })
  }
}

/// A device-bound credential offered by native sign-in.
public struct TrustedDeviceFactor: Hashable, Sendable {
  public var `strategy`: String { "trusted_device" }
  public let `trustedDeviceId`: Field<String>
  public let `safeIdentifier`: Field<String>
  public init(`trustedDeviceId`: Field<String> = .omitted, `safeIdentifier`: Field<String> = .omitted) {
    self.`trustedDeviceId` = `trustedDeviceId`
    self.`safeIdentifier` = `safeIdentifier`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string("trusted_device"),
      "trustedDeviceId": try self.`trustedDeviceId`.encode { value in .string(value) },
      "safeIdentifier": try self.`safeIdentifier`.encode { value in .string(value) }
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> TrustedDeviceFactor {
    let values = try value.object()
    guard values["strategy"] == .string("trusted_device") else { throw CoreError.invalidValue }
    return try TrustedDeviceFactor(`trustedDeviceId`: try Field.decode((values["trustedDeviceId"] ?? .undefined)) { value in try value.string() }, `safeIdentifier`: try Field.decode((values["safeIdentifier"] ?? .undefined)) { value in try value.string() })
  }
}

public indirect enum SignInSecondFactor: Hashable, Sendable {
  case case1(EmailCodeFactor)
  case case2(EmailLinkFactor)
  case case3(PhoneCodeFactor)
  case case4(PasskeyFactor)
  case case5(TOTPFactor)
  case case6(BackupCodeFactor)
  @MainActor public var `strategy`: String {
    switch self {
    case .case1(let value): return value.`strategy`
    case .case2(let value): return value.`strategy`
    case .case3(let value): return value.`strategy`
    case .case4(let value): return value.`strategy`
    case .case5(let value): return value.`strategy`
    case .case6(let value): return value.`strategy`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    case .case4(let value): return .object(["$case": .number(3), "value": try value.encode()])
    case .case5(let value): return .object(["$case": .number(4), "value": try value.encode()])
    case .case6(let value): return .object(["$case": .number(5), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInSecondFactor {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try EmailCodeFactor.decode(payload, in: runtime))
    case 1: return .case2(try EmailLinkFactor.decode(payload, in: runtime))
    case 2: return .case3(try PhoneCodeFactor.decode(payload, in: runtime))
    case 3: return .case4(try PasskeyFactor.decode(payload, in: runtime))
    case 4: return .case5(try TOTPFactor.decode(payload, in: runtime))
    case 5: return .case6(try BackupCodeFactor.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public enum SignInStatus: Hashable, Sendable {
  case `needsIdentifier`
  case `needsFirstFactor`
  case `needsSecondFactor`
  case `needsClientTrust`
  case `needsNewPassword`
  case `needsProtectCheck`
  case `complete`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`needsIdentifier`: return "needs_identifier"
    case .`needsFirstFactor`: return "needs_first_factor"
    case .`needsSecondFactor`: return "needs_second_factor"
    case .`needsClientTrust`: return "needs_client_trust"
    case .`needsNewPassword`: return "needs_new_password"
    case .`needsProtectCheck`: return "needs_protect_check"
    case .`complete`: return "complete"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "needs_identifier": self = .`needsIdentifier`
    case "needs_first_factor": self = .`needsFirstFactor`
    case "needs_second_factor": self = .`needsSecondFactor`
    case "needs_client_trust": self = .`needsClientTrust`
    case "needs_new_password": self = .`needsNewPassword`
    case "needs_protect_check": self = .`needsProtectCheck`
    case "complete": self = .`complete`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInStatus { .init(rawValue: try value.string()) }
}

public struct SignInExistingSession: Hashable, Sendable {
  public let `sessionId`: String
  public init(`sessionId`: String) {
    self.`sessionId` = `sessionId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "sessionId": .string(self.`sessionId`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInExistingSession {
    let values = try value.object()

    return try SignInExistingSession(`sessionId`: try (values["sessionId"] ?? .undefined).string())
  }
}

public struct UserData: Hashable, Sendable {
  public let `firstName`: String?
  public let `lastName`: String?
  public let `imageUrl`: String?
  public let `hasImage`: Bool?
  public init(`firstName`: String? = nil, `lastName`: String? = nil, `imageUrl`: String? = nil, `hasImage`: Bool? = nil) {
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`imageUrl` = `imageUrl`
    self.`hasImage` = `hasImage`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "imageUrl": try self.`imageUrl`.map { value in .string(value) } ?? .undefined,
      "hasImage": try self.`hasImage`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> UserData {
    let values = try value.object()

    return try UserData(`firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `imageUrl`: try (values["imageUrl"] ?? .undefined).optional { value in try value.string() }, `hasImage`: try (values["hasImage"] ?? .undefined).optional { value in try value.bool() })
  }
}

/// A pending Clerk Protect challenge that must be completed before the current sign-in or sign-up attempt can continue.
///
/// This resource is only returned when Protect mid-flow challenges are enabled for the instance. When present, load the challenge SDK from `sdkUrl`, initialize it with `token` and `uiHints`, and submit the proof token returned by the SDK with `submitProtectCheck()`.
public struct ProtectCheck: Hashable, Sendable {
  public var `status`: String { "pending" }
  public let `sdkUrl`: String
  public let `expiresAt`: Double?
  public let `uiHints`: [String: String]?
  public init(`sdkUrl`: String, `expiresAt`: Double? = nil, `uiHints`: [String: String]? = nil) {
    self.`sdkUrl` = `sdkUrl`
    self.`expiresAt` = `expiresAt`
    self.`uiHints` = `uiHints`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "status": .string("pending"),
      "sdkUrl": .string(self.`sdkUrl`),
      "expiresAt": try self.`expiresAt`.map { value in .number(value) } ?? .undefined,
      "uiHints": try self.`uiHints`.map { value in .object(try value.mapValues { value in .string(value) }) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ProtectCheck {
    let values = try value.object()
    guard values["status"] == .string("pending") else { throw CoreError.invalidValue }
    return try ProtectCheck(`sdkUrl`: try (values["sdkUrl"] ?? .undefined).string(), `expiresAt`: try (values["expiresAt"] ?? .undefined).optional { value in try value.number() }, `uiHints`: try (values["uiHints"] ?? .undefined).optional { value in try value.object().mapValues { value in try value.string() } })
  }
}

public struct SignInCreateParams: Hashable, Sendable {
  public let `identifier`: String?
  public let `password`: String?
  public let `strategy`: SignInCreateParamsStrategy?
  public let `trustedDeviceId`: String?
  public let `token`: String?
  public let `redirectUrl`: String?
  public let `actionCompleteRedirectUrl`: String?
  public let `transfer`: Bool?
  public let `ticket`: String?
  public let `signUpIfMissing`: Bool?
  public init(`identifier`: String? = nil, `password`: String? = nil, `strategy`: SignInCreateParamsStrategy? = nil, `trustedDeviceId`: String? = nil, `token`: String? = nil, `redirectUrl`: String? = nil, `actionCompleteRedirectUrl`: String? = nil, `transfer`: Bool? = nil, `ticket`: String? = nil, `signUpIfMissing`: Bool? = nil) {
    self.`identifier` = `identifier`
    self.`password` = `password`
    self.`strategy` = `strategy`
    self.`trustedDeviceId` = `trustedDeviceId`
    self.`token` = `token`
    self.`redirectUrl` = `redirectUrl`
    self.`actionCompleteRedirectUrl` = `actionCompleteRedirectUrl`
    self.`transfer` = `transfer`
    self.`ticket` = `ticket`
    self.`signUpIfMissing` = `signUpIfMissing`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "identifier": try self.`identifier`.map { value in .string(value) } ?? .undefined,
      "password": try self.`password`.map { value in .string(value) } ?? .undefined,
      "strategy": try self.`strategy`.map { value in try value.encode() } ?? .undefined,
      "trustedDeviceId": try self.`trustedDeviceId`.map { value in .string(value) } ?? .undefined,
      "token": try self.`token`.map { value in .string(value) } ?? .undefined,
      "redirectUrl": try self.`redirectUrl`.map { value in .string(value) } ?? .undefined,
      "actionCompleteRedirectUrl": try self.`actionCompleteRedirectUrl`.map { value in .string(value) } ?? .undefined,
      "transfer": try self.`transfer`.map { value in .bool(value) } ?? .undefined,
      "ticket": try self.`ticket`.map { value in .string(value) } ?? .undefined,
      "signUpIfMissing": try self.`signUpIfMissing`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInCreateParams {
    let values = try value.object()

    return try SignInCreateParams(`identifier`: try (values["identifier"] ?? .undefined).optional { value in try value.string() }, `password`: try (values["password"] ?? .undefined).optional { value in try value.string() }, `strategy`: try (values["strategy"] ?? .undefined).optional { value in try SignInCreateParamsStrategy.decode(value, in: runtime) }, `trustedDeviceId`: try (values["trustedDeviceId"] ?? .undefined).optional { value in try value.string() }, `token`: try (values["token"] ?? .undefined).optional { value in try value.string() }, `redirectUrl`: try (values["redirectUrl"] ?? .undefined).optional { value in try value.string() }, `actionCompleteRedirectUrl`: try (values["actionCompleteRedirectUrl"] ?? .undefined).optional { value in try value.string() }, `transfer`: try (values["transfer"] ?? .undefined).optional { value in try value.bool() }, `ticket`: try (values["ticket"] ?? .undefined).optional { value in try value.string() }, `signUpIfMissing`: try (values["signUpIfMissing"] ?? .undefined).optional { value in try value.bool() })
  }
}

public enum SignInCreateParamsStrategy: Hashable, Sendable {
  case `oauthTokenApple`
  case `passkey`
  case `ticket`
  case `enterpriseSso`
  case `oauthFacebook`
  case `oauthGoogle`
  case `oauthHubspot`
  case `oauthGithub`
  case `oauthTiktok`
  case `oauthGitlab`
  case `oauthDiscord`
  case `oauthTwitter`
  case `oauthTwitch`
  case `oauthLinkedin`
  case `oauthLinkedinOidc`
  case `oauthDropbox`
  case `oauthAtlassian`
  case `oauthBitbucket`
  case `oauthMicrosoft`
  case `oauthNotion`
  case `oauthApple`
  case `oauthLine`
  case `oauthInstagram`
  case `oauthCoinbase`
  case `oauthSpotify`
  case `oauthXero`
  case `oauthBox`
  case `oauthSlack`
  case `oauthLinear`
  case `oauthX`
  case `oauthEnstall`
  case `oauthHuggingface`
  case `oauthVercel`
  case `trustedDevice`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`oauthTokenApple`: return "oauth_token_apple"
    case .`passkey`: return "passkey"
    case .`ticket`: return "ticket"
    case .`enterpriseSso`: return "enterprise_sso"
    case .`oauthFacebook`: return "oauth_facebook"
    case .`oauthGoogle`: return "oauth_google"
    case .`oauthHubspot`: return "oauth_hubspot"
    case .`oauthGithub`: return "oauth_github"
    case .`oauthTiktok`: return "oauth_tiktok"
    case .`oauthGitlab`: return "oauth_gitlab"
    case .`oauthDiscord`: return "oauth_discord"
    case .`oauthTwitter`: return "oauth_twitter"
    case .`oauthTwitch`: return "oauth_twitch"
    case .`oauthLinkedin`: return "oauth_linkedin"
    case .`oauthLinkedinOidc`: return "oauth_linkedin_oidc"
    case .`oauthDropbox`: return "oauth_dropbox"
    case .`oauthAtlassian`: return "oauth_atlassian"
    case .`oauthBitbucket`: return "oauth_bitbucket"
    case .`oauthMicrosoft`: return "oauth_microsoft"
    case .`oauthNotion`: return "oauth_notion"
    case .`oauthApple`: return "oauth_apple"
    case .`oauthLine`: return "oauth_line"
    case .`oauthInstagram`: return "oauth_instagram"
    case .`oauthCoinbase`: return "oauth_coinbase"
    case .`oauthSpotify`: return "oauth_spotify"
    case .`oauthXero`: return "oauth_xero"
    case .`oauthBox`: return "oauth_box"
    case .`oauthSlack`: return "oauth_slack"
    case .`oauthLinear`: return "oauth_linear"
    case .`oauthX`: return "oauth_x"
    case .`oauthEnstall`: return "oauth_enstall"
    case .`oauthHuggingface`: return "oauth_huggingface"
    case .`oauthVercel`: return "oauth_vercel"
    case .`trustedDevice`: return "trusted_device"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "oauth_token_apple": self = .`oauthTokenApple`
    case "passkey": self = .`passkey`
    case "ticket": self = .`ticket`
    case "enterprise_sso": self = .`enterpriseSso`
    case "oauth_facebook": self = .`oauthFacebook`
    case "oauth_google": self = .`oauthGoogle`
    case "oauth_hubspot": self = .`oauthHubspot`
    case "oauth_github": self = .`oauthGithub`
    case "oauth_tiktok": self = .`oauthTiktok`
    case "oauth_gitlab": self = .`oauthGitlab`
    case "oauth_discord": self = .`oauthDiscord`
    case "oauth_twitter": self = .`oauthTwitter`
    case "oauth_twitch": self = .`oauthTwitch`
    case "oauth_linkedin": self = .`oauthLinkedin`
    case "oauth_linkedin_oidc": self = .`oauthLinkedinOidc`
    case "oauth_dropbox": self = .`oauthDropbox`
    case "oauth_atlassian": self = .`oauthAtlassian`
    case "oauth_bitbucket": self = .`oauthBitbucket`
    case "oauth_microsoft": self = .`oauthMicrosoft`
    case "oauth_notion": self = .`oauthNotion`
    case "oauth_apple": self = .`oauthApple`
    case "oauth_line": self = .`oauthLine`
    case "oauth_instagram": self = .`oauthInstagram`
    case "oauth_coinbase": self = .`oauthCoinbase`
    case "oauth_spotify": self = .`oauthSpotify`
    case "oauth_xero": self = .`oauthXero`
    case "oauth_box": self = .`oauthBox`
    case "oauth_slack": self = .`oauthSlack`
    case "oauth_linear": self = .`oauthLinear`
    case "oauth_x": self = .`oauthX`
    case "oauth_enstall": self = .`oauthEnstall`
    case "oauth_huggingface": self = .`oauthHuggingface`
    case "oauth_vercel": self = .`oauthVercel`
    case "trusted_device": self = .`trustedDevice`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInCreateParamsStrategy { .init(rawValue: try value.string()) }
}

/// Parameters for submitting a password to sign-in.
public indirect enum SignInPasswordParams: Hashable, Sendable {
  case case1(SignInPasswordParamsCase1)
  case case2(SignInPasswordParamsCase2)
  case case3(SignInPasswordParamsCase3)
  case case4(SignInPasswordParamsCase4)
  @MainActor public var `password`: String {
    switch self {
    case .case1(let value): return value.`password`
    case .case2(let value): return value.`password`
    case .case3(let value): return value.`password`
    case .case4(let value): return value.`password`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    case .case4(let value): return .object(["$case": .number(3), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPasswordParams {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try SignInPasswordParamsCase1.decode(payload, in: runtime))
    case 1: return .case2(try SignInPasswordParamsCase2.decode(payload, in: runtime))
    case 2: return .case3(try SignInPasswordParamsCase3.decode(payload, in: runtime))
    case 3: return .case4(try SignInPasswordParamsCase4.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct SignInPasswordParamsCase1: Hashable, Sendable {
  public let `password`: String
  public let `identifier`: String
  public init(`password`: String, `identifier`: String) {
    self.`password` = `password`
    self.`identifier` = `identifier`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "password": .string(self.`password`),
      "identifier": .string(self.`identifier`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPasswordParamsCase1 {
    let values = try value.object()

    return try SignInPasswordParamsCase1(`password`: try (values["password"] ?? .undefined).string(), `identifier`: try (values["identifier"] ?? .undefined).string())
  }
}

public struct SignInPasswordParamsCase2: Hashable, Sendable {
  public let `password`: String
  public let `emailAddress`: String
  public init(`password`: String, `emailAddress`: String) {
    self.`password` = `password`
    self.`emailAddress` = `emailAddress`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "password": .string(self.`password`),
      "emailAddress": .string(self.`emailAddress`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPasswordParamsCase2 {
    let values = try value.object()

    return try SignInPasswordParamsCase2(`password`: try (values["password"] ?? .undefined).string(), `emailAddress`: try (values["emailAddress"] ?? .undefined).string())
  }
}

public struct SignInPasswordParamsCase3: Hashable, Sendable {
  public let `password`: String
  public let `phoneNumber`: String
  public init(`password`: String, `phoneNumber`: String) {
    self.`password` = `password`
    self.`phoneNumber` = `phoneNumber`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "password": .string(self.`password`),
      "phoneNumber": .string(self.`phoneNumber`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPasswordParamsCase3 {
    let values = try value.object()

    return try SignInPasswordParamsCase3(`password`: try (values["password"] ?? .undefined).string(), `phoneNumber`: try (values["phoneNumber"] ?? .undefined).string())
  }
}

public struct SignInPasswordParamsCase4: Hashable, Sendable {
  public let `password`: String
  public init(`password`: String) {
    self.`password` = `password`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "password": .string(self.`password`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPasswordParamsCase4 {
    let values = try value.object()

    return try SignInPasswordParamsCase4(`password`: try (values["password"] ?? .undefined).string())
  }
}

public struct SignInEmailCodeState: Hashable, Sendable {

  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [:
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailCodeState {
    let values = try value.object()

    return try SignInEmailCodeState()
  }
}
@MainActor @Observable public final class SignInEmailCode: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SignInEmailCodeState { context.state(handle, as: SignInEmailCodeState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }

  public func prepare(_ value: JSONValue) throws -> any Sendable { try SignInEmailCodeState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailCode { try runtime.resource(ResourceHandle.decodeReference(value), as: SignInEmailCode.self) }
  /// Sends an email code to sign-in.
  public func `sendCode`(_ `params`: SignInEmailCodeSendParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInEmailCode.sendCode", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Verifies a code sent with the [`emailCode.sendCode()`](https://clerk.com/docs/reference/objects/sign-in-future#email-code-send-code) method.
  public func `verifyCode`(_ `params`: SignInEmailCodeVerifyParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInEmailCode.verifyCode", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
}

/// Parameters for sending a sign-in email verification code.
public indirect enum SignInEmailCodeSendParams: Hashable, Sendable {
  case case1(SignInEmailCodeSendCodeParamsCase1)
  case case2(SignInEmailCodeSendCodeParamsCase2)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailCodeSendParams {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try SignInEmailCodeSendCodeParamsCase1.decode(payload, in: runtime))
    case 1: return .case2(try SignInEmailCodeSendCodeParamsCase2.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct SignInEmailCodeSendCodeParamsCase1: Hashable, Sendable {
  public let `emailAddress`: String?
  public init(`emailAddress`: String? = nil) {
    self.`emailAddress` = `emailAddress`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddress": try self.`emailAddress`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailCodeSendCodeParamsCase1 {
    let values = try value.object()

    return try SignInEmailCodeSendCodeParamsCase1(`emailAddress`: try (values["emailAddress"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignInEmailCodeSendCodeParamsCase2: Hashable, Sendable {
  public let `emailAddressId`: String?
  public init(`emailAddressId`: String? = nil) {
    self.`emailAddressId` = `emailAddressId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddressId": try self.`emailAddressId`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailCodeSendCodeParamsCase2 {
    let values = try value.object()

    return try SignInEmailCodeSendCodeParamsCase2(`emailAddressId`: try (values["emailAddressId"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignInEmailCodeVerifyParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailCodeVerifyParams {
    let values = try value.object()

    return try SignInEmailCodeVerifyParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct SignInEmailLinkState: Hashable, Sendable {
  public let `verification`: SignInEmailLinkVerification?
  public init(`verification`: SignInEmailLinkVerification?) {
    self.`verification` = `verification`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "verification": try self.`verification`.map { value in try value.encode() } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailLinkState {
    let values = try value.object()

    return try SignInEmailLinkState(`verification`: try (values["verification"] ?? .undefined).optional { value in try SignInEmailLinkVerification.decode(value, in: runtime) })
  }
}
@MainActor @Observable public final class SignInEmailLink: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SignInEmailLinkState { context.state(handle, as: SignInEmailLinkState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `verification`: SignInEmailLinkVerification? { state.`verification` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try SignInEmailLinkState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailLink { try runtime.resource(ResourceHandle.decodeReference(value), as: SignInEmailLink.self) }
  /// Sends an email link to sign in with.
  public func `sendLink`(_ `params`: SignInEmailLinkSendParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInEmailLink.sendLink", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Waits for email link verification to complete or expire.
  public func `waitForVerification`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInEmailLink.waitForVerification", arguments: []) { result in
      try runtime.checkErrorResult(result)
    }
  }
}

/// Parameters for sending a sign-in email link.
public indirect enum SignInEmailLinkSendParams: Hashable, Sendable {
  case case1(SignInEmailLinkSendLinkParamsCase1)
  case case2(SignInEmailLinkSendLinkParamsCase2)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailLinkSendParams {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try SignInEmailLinkSendLinkParamsCase1.decode(payload, in: runtime))
    case 1: return .case2(try SignInEmailLinkSendLinkParamsCase2.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct SignInEmailLinkSendLinkParamsCase1: Hashable, Sendable {
  public let `emailAddress`: String?
  public init(`emailAddress`: String? = nil) {
    self.`emailAddress` = `emailAddress`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddress": try self.`emailAddress`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailLinkSendLinkParamsCase1 {
    let values = try value.object()

    return try SignInEmailLinkSendLinkParamsCase1(`emailAddress`: try (values["emailAddress"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignInEmailLinkSendLinkParamsCase2: Hashable, Sendable {
  public let `emailAddressId`: String?
  public init(`emailAddressId`: String? = nil) {
    self.`emailAddressId` = `emailAddressId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddressId": try self.`emailAddressId`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailLinkSendLinkParamsCase2 {
    let values = try value.object()

    return try SignInEmailLinkSendLinkParamsCase2(`emailAddressId`: try (values["emailAddressId"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignInEmailLinkVerification: Hashable, Sendable {
  public let `status`: SignInEmailLinkVerificationStatus
  public let `createdSessionId`: String
  public let `verifiedFromTheSameClient`: Bool
  public init(`status`: SignInEmailLinkVerificationStatus, `createdSessionId`: String, `verifiedFromTheSameClient`: Bool) {
    self.`status` = `status`
    self.`createdSessionId` = `createdSessionId`
    self.`verifiedFromTheSameClient` = `verifiedFromTheSameClient`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "status": try self.`status`.encode(),
      "createdSessionId": .string(self.`createdSessionId`),
      "verifiedFromTheSameClient": .bool(self.`verifiedFromTheSameClient`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailLinkVerification {
    let values = try value.object()

    return try SignInEmailLinkVerification(`status`: try SignInEmailLinkVerificationStatus.decode((values["status"] ?? .undefined), in: runtime), `createdSessionId`: try (values["createdSessionId"] ?? .undefined).string(), `verifiedFromTheSameClient`: try (values["verifiedFromTheSameClient"] ?? .undefined).bool())
  }
}

public enum SignInEmailLinkVerificationStatus: Hashable, Sendable {
  case `verified`
  case `failed`
  case `expired`
  case `clientMismatch`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`verified`: return "verified"
    case .`failed`: return "failed"
    case .`expired`: return "expired"
    case .`clientMismatch`: return "client_mismatch"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "verified": self = .`verified`
    case "failed": self = .`failed`
    case "expired": self = .`expired`
    case "client_mismatch": self = .`clientMismatch`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInEmailLinkVerificationStatus { .init(rawValue: try value.string()) }
}

public struct SignInPhoneCodeState: Hashable, Sendable {

  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [:
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPhoneCodeState {
    let values = try value.object()

    return try SignInPhoneCodeState()
  }
}
@MainActor @Observable public final class SignInPhoneCode: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SignInPhoneCodeState { context.state(handle, as: SignInPhoneCodeState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }

  public func prepare(_ value: JSONValue) throws -> any Sendable { try SignInPhoneCodeState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPhoneCode { try runtime.resource(ResourceHandle.decodeReference(value), as: SignInPhoneCode.self) }
  /// Sends a phone code to sign in with.
  public func `sendCode`(_ `params`: SignInPhoneCodeSendParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInPhoneCode.sendCode", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Verifies a code sent with the [`phoneCode.sendCode()`](https://clerk.com/docs/reference/objects/sign-in-future#phone-code-send-code) method.
  public func `verifyCode`(_ `params`: SignInPhoneCodeVerifyParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInPhoneCode.verifyCode", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
}

public indirect enum SignInPhoneCodeSendParams: Hashable, Sendable {
  case case1(SignInPhoneCodeSendCodeParamsCase1)
  case case2(SignInPhoneCodeSendCodeParamsCase2)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPhoneCodeSendParams {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try SignInPhoneCodeSendCodeParamsCase1.decode(payload, in: runtime))
    case 1: return .case2(try SignInPhoneCodeSendCodeParamsCase2.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct SignInPhoneCodeSendCodeParamsCase1: Hashable, Sendable {
  public let `channel`: PhoneCodeChannel?
  public let `phoneNumber`: String?
  public init(`channel`: PhoneCodeChannel? = nil, `phoneNumber`: String? = nil) {
    self.`channel` = `channel`
    self.`phoneNumber` = `phoneNumber`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "channel": try self.`channel`.map { value in try value.encode() } ?? .undefined,
      "phoneNumber": try self.`phoneNumber`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPhoneCodeSendCodeParamsCase1 {
    let values = try value.object()

    return try SignInPhoneCodeSendCodeParamsCase1(`channel`: try (values["channel"] ?? .undefined).optional { value in try PhoneCodeChannel.decode(value, in: runtime) }, `phoneNumber`: try (values["phoneNumber"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignInPhoneCodeSendCodeParamsCase2: Hashable, Sendable {
  public let `channel`: PhoneCodeChannel?
  public let `phoneNumberId`: String
  public init(`channel`: PhoneCodeChannel? = nil, `phoneNumberId`: String) {
    self.`channel` = `channel`
    self.`phoneNumberId` = `phoneNumberId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "channel": try self.`channel`.map { value in try value.encode() } ?? .undefined,
      "phoneNumberId": .string(self.`phoneNumberId`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPhoneCodeSendCodeParamsCase2 {
    let values = try value.object()

    return try SignInPhoneCodeSendCodeParamsCase2(`channel`: try (values["channel"] ?? .undefined).optional { value in try PhoneCodeChannel.decode(value, in: runtime) }, `phoneNumberId`: try (values["phoneNumberId"] ?? .undefined).string())
  }
}

public struct SignInPhoneCodeVerifyParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPhoneCodeVerifyParams {
    let values = try value.object()

    return try SignInPhoneCodeVerifyParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct SignInResetPasswordEmailCodeState: Hashable, Sendable {

  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [:
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInResetPasswordEmailCodeState {
    let values = try value.object()

    return try SignInResetPasswordEmailCodeState()
  }
}
@MainActor @Observable public final class SignInResetPasswordEmailCode: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SignInResetPasswordEmailCodeState { context.state(handle, as: SignInResetPasswordEmailCodeState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }

  public func prepare(_ value: JSONValue) throws -> any Sendable { try SignInResetPasswordEmailCodeState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInResetPasswordEmailCode { try runtime.resource(ResourceHandle.decodeReference(value), as: SignInResetPasswordEmailCode.self) }
  /// Sends a password reset code to the selected email address, or the first supported email factor.
  public func `sendCode`(_ `params`: SignInResetPasswordEmailCodeSendParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInResetPasswordEmailCode.sendCode", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Verifies a password reset code sent with the [`resetPasswordEmailCode.sendCode()`](https://clerk.com/docs/reference/objects/sign-in-future#reset-password-email-code-send-code) method. Will cause `signIn.status` to become `'needs_new_password'`. This is when you will call the [`resetPasswordEmailCode.submitPassword()`](https://clerk.com/docs/reference/objects/sign-in-future#reset-password-email-code-submit-password) method to complete the password reset flow.
  public func `verifyCode`(_ `params`: SignInEmailCodeVerifyParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInResetPasswordEmailCode.verifyCode", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Submits a new password and moves the sign-in status to `'complete'`.
  public func `submitPassword`(_ `params`: SignInResetPasswordSubmitParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInResetPasswordEmailCode.submitPassword", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
}

public struct SignInResetPasswordEmailCodeSendParams: Hashable, Sendable {
  public let `emailAddressId`: String?
  public init(`emailAddressId`: String? = nil) {
    self.`emailAddressId` = `emailAddressId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddressId": try self.`emailAddressId`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInResetPasswordEmailCodeSendParams {
    let values = try value.object()

    return try SignInResetPasswordEmailCodeSendParams(`emailAddressId`: try (values["emailAddressId"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignInResetPasswordSubmitParams: Hashable, Sendable {
  public let `password`: String
  public let `signOutOfOtherSessions`: Bool?
  public init(`password`: String, `signOutOfOtherSessions`: Bool? = nil) {
    self.`password` = `password`
    self.`signOutOfOtherSessions` = `signOutOfOtherSessions`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "password": .string(self.`password`),
      "signOutOfOtherSessions": try self.`signOutOfOtherSessions`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInResetPasswordSubmitParams {
    let values = try value.object()

    return try SignInResetPasswordSubmitParams(`password`: try (values["password"] ?? .undefined).string(), `signOutOfOtherSessions`: try (values["signOutOfOtherSessions"] ?? .undefined).optional { value in try value.bool() })
  }
}

public struct SignInResetPasswordPhoneCodeState: Hashable, Sendable {

  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [:
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInResetPasswordPhoneCodeState {
    let values = try value.object()

    return try SignInResetPasswordPhoneCodeState()
  }
}
@MainActor @Observable public final class SignInResetPasswordPhoneCode: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SignInResetPasswordPhoneCodeState { context.state(handle, as: SignInResetPasswordPhoneCodeState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }

  public func prepare(_ value: JSONValue) throws -> any Sendable { try SignInResetPasswordPhoneCodeState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInResetPasswordPhoneCode { try runtime.resource(ResourceHandle.decodeReference(value), as: SignInResetPasswordPhoneCode.self) }
  /// Sends a password reset code to the selected phone number, or the first supported phone factor.
  public func `sendCode`(_ `params`: SignInResetPasswordPhoneCodeSendParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInResetPasswordPhoneCode.sendCode", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Verifies a password reset code sent with the [`resetPasswordPhoneCode.sendCode()`](https://clerk.com/docs/reference/objects/sign-in-future#reset-password-phone-code-send-code) method. Will cause `signIn.status` to become `'needs_new_password'`. This is when you will call the [`resetPasswordPhoneCode.submitPassword()`](https://clerk.com/docs/reference/objects/sign-in-future#reset-password-phone-code-submit-password) method to complete the password reset flow.
  public func `verifyCode`(_ `params`: SignInResetPasswordPhoneCodeVerifyParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInResetPasswordPhoneCode.verifyCode", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Submits a new password and moves the sign-in status to `'complete'`.
  public func `submitPassword`(_ `params`: SignInResetPasswordSubmitParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInResetPasswordPhoneCode.submitPassword", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
}

public struct SignInResetPasswordPhoneCodeSendParams: Hashable, Sendable {
  public let `phoneNumberId`: String?
  public let `phoneNumber`: String?
  public init(`phoneNumberId`: String? = nil, `phoneNumber`: String? = nil) {
    self.`phoneNumberId` = `phoneNumberId`
    self.`phoneNumber` = `phoneNumber`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "phoneNumberId": try self.`phoneNumberId`.map { value in .string(value) } ?? .undefined,
      "phoneNumber": try self.`phoneNumber`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInResetPasswordPhoneCodeSendParams {
    let values = try value.object()

    return try SignInResetPasswordPhoneCodeSendParams(`phoneNumberId`: try (values["phoneNumberId"] ?? .undefined).optional { value in try value.string() }, `phoneNumber`: try (values["phoneNumber"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignInResetPasswordPhoneCodeVerifyParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInResetPasswordPhoneCodeVerifyParams {
    let values = try value.object()

    return try SignInResetPasswordPhoneCodeVerifyParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct SignInBiometricCredentialParams: Hashable, Sendable {
  public let `id`: String?
  public let `identifierHint`: String?
  public let `reason`: String?
  public let `promptSubtitle`: String?
  public init(`id`: String? = nil, `identifierHint`: String? = nil, `reason`: String? = nil, `promptSubtitle`: String? = nil) {
    self.`id` = `id`
    self.`identifierHint` = `identifierHint`
    self.`reason` = `reason`
    self.`promptSubtitle` = `promptSubtitle`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": try self.`id`.map { value in .string(value) } ?? .undefined,
      "identifierHint": try self.`identifierHint`.map { value in .string(value) } ?? .undefined,
      "reason": try self.`reason`.map { value in .string(value) } ?? .undefined,
      "promptSubtitle": try self.`promptSubtitle`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInBiometricCredentialParams {
    let values = try value.object()

    return try SignInBiometricCredentialParams(`id`: try (values["id"] ?? .undefined).optional { value in try value.string() }, `identifierHint`: try (values["identifierHint"] ?? .undefined).optional { value in try value.string() }, `reason`: try (values["reason"] ?? .undefined).optional { value in try value.string() }, `promptSubtitle`: try (values["promptSubtitle"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignInSSOParams: Hashable, Sendable {
  public let `strategy`: SignInSSOParamsStrategy
  public let `oidcPrompt`: String?
  public let `enterpriseConnectionId`: String?
  public let `identifier`: String?
  public init(`strategy`: SignInSSOParamsStrategy, `oidcPrompt`: String? = nil, `enterpriseConnectionId`: String? = nil, `identifier`: String? = nil) {
    self.`strategy` = `strategy`
    self.`oidcPrompt` = `oidcPrompt`
    self.`enterpriseConnectionId` = `enterpriseConnectionId`
    self.`identifier` = `identifier`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": try self.`strategy`.encode(),
      "oidcPrompt": try self.`oidcPrompt`.map { value in .string(value) } ?? .undefined,
      "enterpriseConnectionId": try self.`enterpriseConnectionId`.map { value in .string(value) } ?? .undefined,
      "identifier": try self.`identifier`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInSSOParams {
    let values = try value.object()

    return try SignInSSOParams(`strategy`: try SignInSSOParamsStrategy.decode((values["strategy"] ?? .undefined), in: runtime), `oidcPrompt`: try (values["oidcPrompt"] ?? .undefined).optional { value in try value.string() }, `enterpriseConnectionId`: try (values["enterpriseConnectionId"] ?? .undefined).optional { value in try value.string() }, `identifier`: try (values["identifier"] ?? .undefined).optional { value in try value.string() })
  }
}

public enum SignInSSOParamsStrategy: Hashable, Sendable {
  case `oauthTokenApple`
  case `enterpriseSso`
  case `oauthFacebook`
  case `oauthGoogle`
  case `oauthHubspot`
  case `oauthGithub`
  case `oauthTiktok`
  case `oauthGitlab`
  case `oauthDiscord`
  case `oauthTwitter`
  case `oauthTwitch`
  case `oauthLinkedin`
  case `oauthLinkedinOidc`
  case `oauthDropbox`
  case `oauthAtlassian`
  case `oauthBitbucket`
  case `oauthMicrosoft`
  case `oauthNotion`
  case `oauthApple`
  case `oauthLine`
  case `oauthInstagram`
  case `oauthCoinbase`
  case `oauthSpotify`
  case `oauthXero`
  case `oauthBox`
  case `oauthSlack`
  case `oauthLinear`
  case `oauthX`
  case `oauthEnstall`
  case `oauthHuggingface`
  case `oauthVercel`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`oauthTokenApple`: return "oauth_token_apple"
    case .`enterpriseSso`: return "enterprise_sso"
    case .`oauthFacebook`: return "oauth_facebook"
    case .`oauthGoogle`: return "oauth_google"
    case .`oauthHubspot`: return "oauth_hubspot"
    case .`oauthGithub`: return "oauth_github"
    case .`oauthTiktok`: return "oauth_tiktok"
    case .`oauthGitlab`: return "oauth_gitlab"
    case .`oauthDiscord`: return "oauth_discord"
    case .`oauthTwitter`: return "oauth_twitter"
    case .`oauthTwitch`: return "oauth_twitch"
    case .`oauthLinkedin`: return "oauth_linkedin"
    case .`oauthLinkedinOidc`: return "oauth_linkedin_oidc"
    case .`oauthDropbox`: return "oauth_dropbox"
    case .`oauthAtlassian`: return "oauth_atlassian"
    case .`oauthBitbucket`: return "oauth_bitbucket"
    case .`oauthMicrosoft`: return "oauth_microsoft"
    case .`oauthNotion`: return "oauth_notion"
    case .`oauthApple`: return "oauth_apple"
    case .`oauthLine`: return "oauth_line"
    case .`oauthInstagram`: return "oauth_instagram"
    case .`oauthCoinbase`: return "oauth_coinbase"
    case .`oauthSpotify`: return "oauth_spotify"
    case .`oauthXero`: return "oauth_xero"
    case .`oauthBox`: return "oauth_box"
    case .`oauthSlack`: return "oauth_slack"
    case .`oauthLinear`: return "oauth_linear"
    case .`oauthX`: return "oauth_x"
    case .`oauthEnstall`: return "oauth_enstall"
    case .`oauthHuggingface`: return "oauth_huggingface"
    case .`oauthVercel`: return "oauth_vercel"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "oauth_token_apple": self = .`oauthTokenApple`
    case "enterprise_sso": self = .`enterpriseSso`
    case "oauth_facebook": self = .`oauthFacebook`
    case "oauth_google": self = .`oauthGoogle`
    case "oauth_hubspot": self = .`oauthHubspot`
    case "oauth_github": self = .`oauthGithub`
    case "oauth_tiktok": self = .`oauthTiktok`
    case "oauth_gitlab": self = .`oauthGitlab`
    case "oauth_discord": self = .`oauthDiscord`
    case "oauth_twitter": self = .`oauthTwitter`
    case "oauth_twitch": self = .`oauthTwitch`
    case "oauth_linkedin": self = .`oauthLinkedin`
    case "oauth_linkedin_oidc": self = .`oauthLinkedinOidc`
    case "oauth_dropbox": self = .`oauthDropbox`
    case "oauth_atlassian": self = .`oauthAtlassian`
    case "oauth_bitbucket": self = .`oauthBitbucket`
    case "oauth_microsoft": self = .`oauthMicrosoft`
    case "oauth_notion": self = .`oauthNotion`
    case "oauth_apple": self = .`oauthApple`
    case "oauth_line": self = .`oauthLine`
    case "oauth_instagram": self = .`oauthInstagram`
    case "oauth_coinbase": self = .`oauthCoinbase`
    case "oauth_spotify": self = .`oauthSpotify`
    case "oauth_xero": self = .`oauthXero`
    case "oauth_box": self = .`oauthBox`
    case "oauth_slack": self = .`oauthSlack`
    case "oauth_linear": self = .`oauthLinear`
    case "oauth_x": self = .`oauthX`
    case "oauth_enstall": self = .`oauthEnstall`
    case "oauth_huggingface": self = .`oauthHuggingface`
    case "oauth_vercel": self = .`oauthVercel`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInSSOParamsStrategy { .init(rawValue: try value.string()) }
}

public struct SignInMfaState: Hashable, Sendable {

  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [:
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInMfaState {
    let values = try value.object()

    return try SignInMfaState()
  }
}
@MainActor @Observable public final class SignInMfa: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SignInMfaState { context.state(handle, as: SignInMfaState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }

  public func prepare(_ value: JSONValue) throws -> any Sendable { try SignInMfaState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInMfa { try runtime.resource(ResourceHandle.decodeReference(value), as: SignInMfa.self) }
  /// Sends a phone code to sign in with as a second factor.
  public func `sendPhoneCode`(_ `params`: SignInMFAPhoneCodeSendParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInMfa.sendPhoneCode", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Verifies a phone code sent with the [`mfa.sendPhoneCode()`](https://clerk.com/docs/reference/objects/sign-in-future#mfa-send-phone-code) method.
  public func `verifyPhoneCode`(_ `params`: SignInMFAPhoneCodeVerifyParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInMfa.verifyPhoneCode", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Sends an email code to sign in with as a second factor.
  public func `sendEmailCode`(_ `params`: SignInMFAEmailCodeSendParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInMfa.sendEmailCode", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Verifies an email code sent with the [`mfa.sendEmailCode()`](https://clerk.com/docs/reference/objects/sign-in-future#mfa-send-email-code) method.
  public func `verifyEmailCode`(_ `params`: SignInMFAEmailCodeVerifyParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInMfa.verifyEmailCode", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Verifies an authenticator app (TOTP) code to sign in with as a second factor.
  public func `verifyTOTP`(_ `params`: SignInTOTPVerifyParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInMfa.verifyTOTP", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Verifies a backup code to sign in with as a second factor.
  public func `verifyBackupCode`(_ `params`: SignInBackupCodeVerifyParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignInMfa.verifyBackupCode", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
}

public struct SignInMFAPhoneCodeSendParams: Hashable, Sendable {
  public let `phoneNumberId`: String?
  public init(`phoneNumberId`: String? = nil) {
    self.`phoneNumberId` = `phoneNumberId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "phoneNumberId": try self.`phoneNumberId`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInMFAPhoneCodeSendParams {
    let values = try value.object()

    return try SignInMFAPhoneCodeSendParams(`phoneNumberId`: try (values["phoneNumberId"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignInMFAPhoneCodeVerifyParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInMFAPhoneCodeVerifyParams {
    let values = try value.object()

    return try SignInMFAPhoneCodeVerifyParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct SignInMFAEmailCodeSendParams: Hashable, Sendable {
  public let `emailAddressId`: String?
  public init(`emailAddressId`: String? = nil) {
    self.`emailAddressId` = `emailAddressId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddressId": try self.`emailAddressId`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInMFAEmailCodeSendParams {
    let values = try value.object()

    return try SignInMFAEmailCodeSendParams(`emailAddressId`: try (values["emailAddressId"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignInMFAEmailCodeVerifyParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInMFAEmailCodeVerifyParams {
    let values = try value.object()

    return try SignInMFAEmailCodeVerifyParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct SignInTOTPVerifyParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInTOTPVerifyParams {
    let values = try value.object()

    return try SignInTOTPVerifyParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct SignInBackupCodeVerifyParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInBackupCodeVerifyParams {
    let values = try value.object()

    return try SignInBackupCodeVerifyParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct SignInTicketParams: Hashable, Sendable {
  public let `ticket`: String
  public init(`ticket`: String) {
    self.`ticket` = `ticket`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "ticket": .string(self.`ticket`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInTicketParams {
    let values = try value.object()

    return try SignInTicketParams(`ticket`: try (values["ticket"] ?? .undefined).string())
  }
}

public struct SignInPasskeyParams: Hashable, Sendable {
  public let `flow`: SignInPasskeyParamsFlow?
  public let `preferImmediatelyAvailableCredentials`: Bool?
  public init(`flow`: SignInPasskeyParamsFlow? = nil, `preferImmediatelyAvailableCredentials`: Bool? = nil) {
    self.`flow` = `flow`
    self.`preferImmediatelyAvailableCredentials` = `preferImmediatelyAvailableCredentials`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "flow": try self.`flow`.map { value in try value.encode() } ?? .undefined,
      "preferImmediatelyAvailableCredentials": try self.`preferImmediatelyAvailableCredentials`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPasskeyParams {
    let values = try value.object()

    return try SignInPasskeyParams(`flow`: try (values["flow"] ?? .undefined).optional { value in try SignInPasskeyParamsFlow.decode(value, in: runtime) }, `preferImmediatelyAvailableCredentials`: try (values["preferImmediatelyAvailableCredentials"] ?? .undefined).optional { value in try value.bool() })
  }
}

public enum SignInPasskeyParamsFlow: Hashable, Sendable {
  case `autofill`
  case `discoverable`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`autofill`: return "autofill"
    case .`discoverable`: return "discoverable"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "autofill": self = .`autofill`
    case "discoverable": self = .`discoverable`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInPasskeyParamsFlow { .init(rawValue: try value.string()) }
}

public struct SignInSubmitProtectCheckParams: Hashable, Sendable {
  public let `proofToken`: String
  public init(`proofToken`: String) {
    self.`proofToken` = `proofToken`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "proofToken": .string(self.`proofToken`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignInSubmitProtectCheckParams {
    let values = try value.object()

    return try SignInSubmitProtectCheckParams(`proofToken`: try (values["proofToken"] ?? .undefined).string())
  }
}

public struct MobileAuthCallbackResultCase2: Hashable, Sendable {
  public var `kind`: String { "signUp" }
  public let `signUp`: SignUp
  public init(`signUp`: SignUp) {
    self.`signUp` = `signUp`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "kind": .string("signUp"),
      "signUp": try self.`signUp`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileAuthCallbackResultCase2 {
    let values = try value.object()
    guard values["kind"] == .string("signUp") else { throw CoreError.invalidValue }
    return try MobileAuthCallbackResultCase2(`signUp`: try SignUp.decode((values["signUp"] ?? .undefined), in: runtime))
  }
}

/// The `SignUpFuture` class holds the state of the current sign-up attempt and provides methods to drive custom sign-up flows, including email/phone verification, password, SSO, ticket-based, and Web3-based account creation.
public struct SignUpState: Hashable, Sendable {
  public let `id`: String?
  public let `status`: SignUpStatus
  public let `requiredFields`: [SignUpField]
  public let `optionalFields`: [SignUpField]
  public let `missingFields`: [SignUpField]
  public let `unverifiedFields`: [SignUpIdentificationField]
  public let `isTransferable`: Bool
  public let `existingSession`: SignUpExistingSession?
  public let `username`: String?
  public let `firstName`: String?
  public let `lastName`: String?
  public let `emailAddress`: String?
  public let `phoneNumber`: String?
  public let `web3Wallet`: String?
  public let `hasPassword`: Bool
  public let `unsafeMetadata`: [String: JSONValue]
  public let `createdSessionId`: String?
  public let `createdUserId`: String?
  public let `abandonAt`: Double?
  public let `legalAcceptedAt`: Double?
  public let `locale`: String?
  public let `protectCheck`: ProtectCheck?
  public let `canBeDiscarded`: Bool
  public let `verifications`: SignUpVerifications
  public init(`id`: String? = nil, `status`: SignUpStatus, `requiredFields`: [SignUpField], `optionalFields`: [SignUpField], `missingFields`: [SignUpField], `unverifiedFields`: [SignUpIdentificationField], `isTransferable`: Bool, `existingSession`: SignUpExistingSession? = nil, `username`: String?, `firstName`: String?, `lastName`: String?, `emailAddress`: String?, `phoneNumber`: String?, `web3Wallet`: String?, `hasPassword`: Bool, `unsafeMetadata`: [String: JSONValue], `createdSessionId`: String?, `createdUserId`: String?, `abandonAt`: Double?, `legalAcceptedAt`: Double?, `locale`: String?, `protectCheck`: ProtectCheck?, `canBeDiscarded`: Bool, `verifications`: SignUpVerifications) {
    self.`id` = `id`
    self.`status` = `status`
    self.`requiredFields` = `requiredFields`
    self.`optionalFields` = `optionalFields`
    self.`missingFields` = `missingFields`
    self.`unverifiedFields` = `unverifiedFields`
    self.`isTransferable` = `isTransferable`
    self.`existingSession` = `existingSession`
    self.`username` = `username`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`emailAddress` = `emailAddress`
    self.`phoneNumber` = `phoneNumber`
    self.`web3Wallet` = `web3Wallet`
    self.`hasPassword` = `hasPassword`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`createdSessionId` = `createdSessionId`
    self.`createdUserId` = `createdUserId`
    self.`abandonAt` = `abandonAt`
    self.`legalAcceptedAt` = `legalAcceptedAt`
    self.`locale` = `locale`
    self.`protectCheck` = `protectCheck`
    self.`canBeDiscarded` = `canBeDiscarded`
    self.`verifications` = `verifications`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "id": try self.`id`.map { value in .string(value) } ?? .undefined,
      "status": try self.`status`.encode(),
      "requiredFields": .array(try self.`requiredFields`.map { value in try value.encode() }),
      "optionalFields": .array(try self.`optionalFields`.map { value in try value.encode() }),
      "missingFields": .array(try self.`missingFields`.map { value in try value.encode() }),
      "unverifiedFields": .array(try self.`unverifiedFields`.map { value in try value.encode() }),
      "isTransferable": .bool(self.`isTransferable`),
      "existingSession": try self.`existingSession`.map { value in try value.encode() } ?? .undefined,
      "username": try self.`username`.map { value in .string(value) } ?? .null,
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .null,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .null,
      "emailAddress": try self.`emailAddress`.map { value in .string(value) } ?? .null,
      "phoneNumber": try self.`phoneNumber`.map { value in .string(value) } ?? .null,
      "web3Wallet": try self.`web3Wallet`.map { value in .string(value) } ?? .null,
      "hasPassword": .bool(self.`hasPassword`),
      "unsafeMetadata": .object(self.`unsafeMetadata`),
      "createdSessionId": try self.`createdSessionId`.map { value in .string(value) } ?? .null,
      "createdUserId": try self.`createdUserId`.map { value in .string(value) } ?? .null,
      "abandonAt": try self.`abandonAt`.map { value in .number(value) } ?? .null,
      "legalAcceptedAt": try self.`legalAcceptedAt`.map { value in .number(value) } ?? .null,
      "locale": try self.`locale`.map { value in .string(value) } ?? .null,
      "protectCheck": try self.`protectCheck`.map { value in try value.encode() } ?? .null,
      "canBeDiscarded": .bool(self.`canBeDiscarded`),
      "verifications": try self.`verifications`.encode()
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpState {
    let values = try value.object()

    return try SignUpState(`id`: try (values["id"] ?? .undefined).optional { value in try value.string() }, `status`: try SignUpStatus.decode((values["status"] ?? .undefined), in: runtime), `requiredFields`: try (values["requiredFields"] ?? .undefined).array().map { value in try SignUpField.decode(value, in: runtime) }, `optionalFields`: try (values["optionalFields"] ?? .undefined).array().map { value in try SignUpField.decode(value, in: runtime) }, `missingFields`: try (values["missingFields"] ?? .undefined).array().map { value in try SignUpField.decode(value, in: runtime) }, `unverifiedFields`: try (values["unverifiedFields"] ?? .undefined).array().map { value in try SignUpIdentificationField.decode(value, in: runtime) }, `isTransferable`: try (values["isTransferable"] ?? .undefined).bool(), `existingSession`: try (values["existingSession"] ?? .undefined).optional { value in try SignUpExistingSession.decode(value, in: runtime) }, `username`: try (values["username"] ?? .undefined).optional { value in try value.string() }, `firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `emailAddress`: try (values["emailAddress"] ?? .undefined).optional { value in try value.string() }, `phoneNumber`: try (values["phoneNumber"] ?? .undefined).optional { value in try value.string() }, `web3Wallet`: try (values["web3Wallet"] ?? .undefined).optional { value in try value.string() }, `hasPassword`: try (values["hasPassword"] ?? .undefined).bool(), `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).object(), `createdSessionId`: try (values["createdSessionId"] ?? .undefined).optional { value in try value.string() }, `createdUserId`: try (values["createdUserId"] ?? .undefined).optional { value in try value.string() }, `abandonAt`: try (values["abandonAt"] ?? .undefined).optional { value in try value.number() }, `legalAcceptedAt`: try (values["legalAcceptedAt"] ?? .undefined).optional { value in try value.number() }, `locale`: try (values["locale"] ?? .undefined).optional { value in try value.string() }, `protectCheck`: try (values["protectCheck"] ?? .undefined).optional { value in try ProtectCheck.decode(value, in: runtime) }, `canBeDiscarded`: try (values["canBeDiscarded"] ?? .undefined).bool(), `verifications`: try SignUpVerifications.decode((values["verifications"] ?? .undefined), in: runtime))
  }
}
@MainActor @Observable public final class SignUp: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SignUpState { context.state(handle, as: SignUpState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `id`: String? { state.`id` }
  public var `status`: SignUpStatus { state.`status` }
  public var `requiredFields`: [SignUpField] { state.`requiredFields` }
  public var `optionalFields`: [SignUpField] { state.`optionalFields` }
  public var `missingFields`: [SignUpField] { state.`missingFields` }
  public var `unverifiedFields`: [SignUpIdentificationField] { state.`unverifiedFields` }
  public var `isTransferable`: Bool { state.`isTransferable` }
  public var `existingSession`: SignUpExistingSession? { state.`existingSession` }
  public var `username`: String? { state.`username` }
  public var `firstName`: String? { state.`firstName` }
  public var `lastName`: String? { state.`lastName` }
  public var `emailAddress`: String? { state.`emailAddress` }
  public var `phoneNumber`: String? { state.`phoneNumber` }
  public var `web3Wallet`: String? { state.`web3Wallet` }
  public var `hasPassword`: Bool { state.`hasPassword` }
  public var `unsafeMetadata`: [String: JSONValue] { state.`unsafeMetadata` }
  public var `createdSessionId`: String? { state.`createdSessionId` }
  public var `createdUserId`: String? { state.`createdUserId` }
  public var `abandonAt`: Double? { state.`abandonAt` }
  public var `legalAcceptedAt`: Double? { state.`legalAcceptedAt` }
  public var `locale`: String? { state.`locale` }
  public var `protectCheck`: ProtectCheck? { state.`protectCheck` }
  public var `canBeDiscarded`: Bool { state.`canBeDiscarded` }
  public var `verifications`: SignUpVerifications { state.`verifications` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try SignUpState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUp { try runtime.resource(ResourceHandle.decodeReference(value), as: SignUp.self) }
  /// Creates a new `SignUp` instance initialized with the provided parameters. The instance maintains the sign-up lifecycle state through its `status` property, which updates as the authentication flow progresses. Will also deactivate any existing sign-up process the client may already have in progress. Once the sign-up process is complete, call the [`signUp.finalize()`](https://clerk.com/docs/reference/objects/sign-up-future#finalize) method to set the newly created session as the active session.
  ///
  /// What you must pass to `params` depends on which [sign-up options](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options) you have enabled in your app's settings in the Clerk Dashboard.
  ///
  /// You can complete the sign-up process in one step if you supply the required fields to `create()`. Otherwise, Clerk's sign-up process provides great flexibility and allows users to easily create multi-step sign-up flows.
  ///
  /// > [!IMPORTANT]
  /// > The `signUp.create()` method is intended for advanced use cases. For most use cases, prefer the use of the factor-specific methods such as `signUp.password()`, `signUp.sso()`, etc.
  public func `create`(_ `params`: SignUpCreateParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUp.create", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Updates the current `SignUpFuture` instance with the provided parameters.
  public func `update`(_ `params`: SignUpUpdateParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUp.update", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Performs a password-based sign-up.
  public func `password`(_ `params`: SignUpPasswordParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUp.password", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Performs an SSO-based sign-up ([Social/OAuth](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/overview) or [Enterprise](https://clerk.com/docs/guides/configure/auth-strategies/enterprise-connections/overview)).
  public func `sso`(_ `params`: SignUpSSOParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUp.sso", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Performs a ticket-based sign-up.
  public func `ticket`(_ `params`: SignUpTicketParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUp.ticket", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Submits a proof token to resolve a pending protect check challenge. The response may contain another `protectCheck` (a chained challenge) which must be resolved iteratively.
  public func `submitProtectCheck`(_ `params`: SignUpSubmitProtectCheckParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUp.submitProtectCheck", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Converts a sign-up with `status === 'complete'` into an active session. Will cause anything observing the session state (such as the [`useUser()`](https://clerk.com/docs/reference/hooks/use-user) hook) to update automatically.
  public func `finalize`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUp.finalize", arguments: []) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Resets the current sign-up attempt by clearing all local state back to null. This is useful when you want to allow users to go back to the beginning of the sign-up flow (e.g., to change their email address during verification).
  ///
  /// Unlike other methods, `reset()` does not trigger the `fetchStatus` to change to `'fetching'` and does not make any API calls - it only clears local state.
  public func `reset`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUp.reset", arguments: []) { result in
      try runtime.checkErrorResult(result)
    }
  }
}

public enum SignUpStatus: Hashable, Sendable {
  case `complete`
  case `missingRequirements`
  case `abandoned`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`complete`: return "complete"
    case .`missingRequirements`: return "missing_requirements"
    case .`abandoned`: return "abandoned"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "complete": self = .`complete`
    case "missing_requirements": self = .`missingRequirements`
    case "abandoned": self = .`abandoned`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpStatus { .init(rawValue: try value.string()) }
}

public enum SignUpField: Hashable, Sendable {
  case `password`
  case `enterpriseSso`
  case `oauthFacebook`
  case `oauthGoogle`
  case `oauthHubspot`
  case `oauthGithub`
  case `oauthTiktok`
  case `oauthGitlab`
  case `oauthDiscord`
  case `oauthTwitter`
  case `oauthTwitch`
  case `oauthLinkedin`
  case `oauthLinkedinOidc`
  case `oauthDropbox`
  case `oauthAtlassian`
  case `oauthBitbucket`
  case `oauthMicrosoft`
  case `oauthNotion`
  case `oauthApple`
  case `oauthLine`
  case `oauthInstagram`
  case `oauthCoinbase`
  case `oauthSpotify`
  case `oauthXero`
  case `oauthBox`
  case `oauthSlack`
  case `oauthLinear`
  case `oauthX`
  case `oauthEnstall`
  case `oauthHuggingface`
  case `oauthVercel`
  case `emailAddress`
  case `phoneNumber`
  case `username`
  case `firstName`
  case `lastName`
  case `web3Wallet`
  case `emailAddressOrPhoneNumber`
  case `legalAccepted`
  case `protectCheck`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`password`: return "password"
    case .`enterpriseSso`: return "enterprise_sso"
    case .`oauthFacebook`: return "oauth_facebook"
    case .`oauthGoogle`: return "oauth_google"
    case .`oauthHubspot`: return "oauth_hubspot"
    case .`oauthGithub`: return "oauth_github"
    case .`oauthTiktok`: return "oauth_tiktok"
    case .`oauthGitlab`: return "oauth_gitlab"
    case .`oauthDiscord`: return "oauth_discord"
    case .`oauthTwitter`: return "oauth_twitter"
    case .`oauthTwitch`: return "oauth_twitch"
    case .`oauthLinkedin`: return "oauth_linkedin"
    case .`oauthLinkedinOidc`: return "oauth_linkedin_oidc"
    case .`oauthDropbox`: return "oauth_dropbox"
    case .`oauthAtlassian`: return "oauth_atlassian"
    case .`oauthBitbucket`: return "oauth_bitbucket"
    case .`oauthMicrosoft`: return "oauth_microsoft"
    case .`oauthNotion`: return "oauth_notion"
    case .`oauthApple`: return "oauth_apple"
    case .`oauthLine`: return "oauth_line"
    case .`oauthInstagram`: return "oauth_instagram"
    case .`oauthCoinbase`: return "oauth_coinbase"
    case .`oauthSpotify`: return "oauth_spotify"
    case .`oauthXero`: return "oauth_xero"
    case .`oauthBox`: return "oauth_box"
    case .`oauthSlack`: return "oauth_slack"
    case .`oauthLinear`: return "oauth_linear"
    case .`oauthX`: return "oauth_x"
    case .`oauthEnstall`: return "oauth_enstall"
    case .`oauthHuggingface`: return "oauth_huggingface"
    case .`oauthVercel`: return "oauth_vercel"
    case .`emailAddress`: return "email_address"
    case .`phoneNumber`: return "phone_number"
    case .`username`: return "username"
    case .`firstName`: return "first_name"
    case .`lastName`: return "last_name"
    case .`web3Wallet`: return "web3_wallet"
    case .`emailAddressOrPhoneNumber`: return "email_address_or_phone_number"
    case .`legalAccepted`: return "legal_accepted"
    case .`protectCheck`: return "protect_check"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "password": self = .`password`
    case "enterprise_sso": self = .`enterpriseSso`
    case "oauth_facebook": self = .`oauthFacebook`
    case "oauth_google": self = .`oauthGoogle`
    case "oauth_hubspot": self = .`oauthHubspot`
    case "oauth_github": self = .`oauthGithub`
    case "oauth_tiktok": self = .`oauthTiktok`
    case "oauth_gitlab": self = .`oauthGitlab`
    case "oauth_discord": self = .`oauthDiscord`
    case "oauth_twitter": self = .`oauthTwitter`
    case "oauth_twitch": self = .`oauthTwitch`
    case "oauth_linkedin": self = .`oauthLinkedin`
    case "oauth_linkedin_oidc": self = .`oauthLinkedinOidc`
    case "oauth_dropbox": self = .`oauthDropbox`
    case "oauth_atlassian": self = .`oauthAtlassian`
    case "oauth_bitbucket": self = .`oauthBitbucket`
    case "oauth_microsoft": self = .`oauthMicrosoft`
    case "oauth_notion": self = .`oauthNotion`
    case "oauth_apple": self = .`oauthApple`
    case "oauth_line": self = .`oauthLine`
    case "oauth_instagram": self = .`oauthInstagram`
    case "oauth_coinbase": self = .`oauthCoinbase`
    case "oauth_spotify": self = .`oauthSpotify`
    case "oauth_xero": self = .`oauthXero`
    case "oauth_box": self = .`oauthBox`
    case "oauth_slack": self = .`oauthSlack`
    case "oauth_linear": self = .`oauthLinear`
    case "oauth_x": self = .`oauthX`
    case "oauth_enstall": self = .`oauthEnstall`
    case "oauth_huggingface": self = .`oauthHuggingface`
    case "oauth_vercel": self = .`oauthVercel`
    case "email_address": self = .`emailAddress`
    case "phone_number": self = .`phoneNumber`
    case "username": self = .`username`
    case "first_name": self = .`firstName`
    case "last_name": self = .`lastName`
    case "web3_wallet": self = .`web3Wallet`
    case "email_address_or_phone_number": self = .`emailAddressOrPhoneNumber`
    case "legal_accepted": self = .`legalAccepted`
    case "protect_check": self = .`protectCheck`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpField { .init(rawValue: try value.string()) }
}

public enum SignUpIdentificationField: Hashable, Sendable {
  case `enterpriseSso`
  case `oauthFacebook`
  case `oauthGoogle`
  case `oauthHubspot`
  case `oauthGithub`
  case `oauthTiktok`
  case `oauthGitlab`
  case `oauthDiscord`
  case `oauthTwitter`
  case `oauthTwitch`
  case `oauthLinkedin`
  case `oauthLinkedinOidc`
  case `oauthDropbox`
  case `oauthAtlassian`
  case `oauthBitbucket`
  case `oauthMicrosoft`
  case `oauthNotion`
  case `oauthApple`
  case `oauthLine`
  case `oauthInstagram`
  case `oauthCoinbase`
  case `oauthSpotify`
  case `oauthXero`
  case `oauthBox`
  case `oauthSlack`
  case `oauthLinear`
  case `oauthX`
  case `oauthEnstall`
  case `oauthHuggingface`
  case `oauthVercel`
  case `emailAddress`
  case `phoneNumber`
  case `username`
  case `web3Wallet`
  case `emailAddressOrPhoneNumber`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`enterpriseSso`: return "enterprise_sso"
    case .`oauthFacebook`: return "oauth_facebook"
    case .`oauthGoogle`: return "oauth_google"
    case .`oauthHubspot`: return "oauth_hubspot"
    case .`oauthGithub`: return "oauth_github"
    case .`oauthTiktok`: return "oauth_tiktok"
    case .`oauthGitlab`: return "oauth_gitlab"
    case .`oauthDiscord`: return "oauth_discord"
    case .`oauthTwitter`: return "oauth_twitter"
    case .`oauthTwitch`: return "oauth_twitch"
    case .`oauthLinkedin`: return "oauth_linkedin"
    case .`oauthLinkedinOidc`: return "oauth_linkedin_oidc"
    case .`oauthDropbox`: return "oauth_dropbox"
    case .`oauthAtlassian`: return "oauth_atlassian"
    case .`oauthBitbucket`: return "oauth_bitbucket"
    case .`oauthMicrosoft`: return "oauth_microsoft"
    case .`oauthNotion`: return "oauth_notion"
    case .`oauthApple`: return "oauth_apple"
    case .`oauthLine`: return "oauth_line"
    case .`oauthInstagram`: return "oauth_instagram"
    case .`oauthCoinbase`: return "oauth_coinbase"
    case .`oauthSpotify`: return "oauth_spotify"
    case .`oauthXero`: return "oauth_xero"
    case .`oauthBox`: return "oauth_box"
    case .`oauthSlack`: return "oauth_slack"
    case .`oauthLinear`: return "oauth_linear"
    case .`oauthX`: return "oauth_x"
    case .`oauthEnstall`: return "oauth_enstall"
    case .`oauthHuggingface`: return "oauth_huggingface"
    case .`oauthVercel`: return "oauth_vercel"
    case .`emailAddress`: return "email_address"
    case .`phoneNumber`: return "phone_number"
    case .`username`: return "username"
    case .`web3Wallet`: return "web3_wallet"
    case .`emailAddressOrPhoneNumber`: return "email_address_or_phone_number"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "enterprise_sso": self = .`enterpriseSso`
    case "oauth_facebook": self = .`oauthFacebook`
    case "oauth_google": self = .`oauthGoogle`
    case "oauth_hubspot": self = .`oauthHubspot`
    case "oauth_github": self = .`oauthGithub`
    case "oauth_tiktok": self = .`oauthTiktok`
    case "oauth_gitlab": self = .`oauthGitlab`
    case "oauth_discord": self = .`oauthDiscord`
    case "oauth_twitter": self = .`oauthTwitter`
    case "oauth_twitch": self = .`oauthTwitch`
    case "oauth_linkedin": self = .`oauthLinkedin`
    case "oauth_linkedin_oidc": self = .`oauthLinkedinOidc`
    case "oauth_dropbox": self = .`oauthDropbox`
    case "oauth_atlassian": self = .`oauthAtlassian`
    case "oauth_bitbucket": self = .`oauthBitbucket`
    case "oauth_microsoft": self = .`oauthMicrosoft`
    case "oauth_notion": self = .`oauthNotion`
    case "oauth_apple": self = .`oauthApple`
    case "oauth_line": self = .`oauthLine`
    case "oauth_instagram": self = .`oauthInstagram`
    case "oauth_coinbase": self = .`oauthCoinbase`
    case "oauth_spotify": self = .`oauthSpotify`
    case "oauth_xero": self = .`oauthXero`
    case "oauth_box": self = .`oauthBox`
    case "oauth_slack": self = .`oauthSlack`
    case "oauth_linear": self = .`oauthLinear`
    case "oauth_x": self = .`oauthX`
    case "oauth_enstall": self = .`oauthEnstall`
    case "oauth_huggingface": self = .`oauthHuggingface`
    case "oauth_vercel": self = .`oauthVercel`
    case "email_address": self = .`emailAddress`
    case "phone_number": self = .`phoneNumber`
    case "username": self = .`username`
    case "web3_wallet": self = .`web3Wallet`
    case "email_address_or_phone_number": self = .`emailAddressOrPhoneNumber`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpIdentificationField { .init(rawValue: try value.string()) }
}

public struct SignUpExistingSession: Hashable, Sendable {
  public let `sessionId`: String
  public init(`sessionId`: String) {
    self.`sessionId` = `sessionId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "sessionId": .string(self.`sessionId`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpExistingSession {
    let values = try value.object()

    return try SignUpExistingSession(`sessionId`: try (values["sessionId"] ?? .undefined).string())
  }
}

public struct SignUpCreateParams: Hashable, Sendable {
  public let `strategy`: SignUpCreateParamsStrategy?
  public let `token`: String?
  public let `emailAddress`: String?
  public let `phoneNumber`: String?
  public let `username`: String?
  public let `password`: String?
  public let `transfer`: Bool?
  public let `ticket`: String?
  public let `web3Wallet`: String?
  public let `firstName`: String?
  public let `lastName`: String?
  public let `unsafeMetadata`: [String: JSONValue]?
  public let `legalAccepted`: Bool?
  public let `locale`: String?
  public init(`strategy`: SignUpCreateParamsStrategy? = nil, `token`: String? = nil, `emailAddress`: String? = nil, `phoneNumber`: String? = nil, `username`: String? = nil, `password`: String? = nil, `transfer`: Bool? = nil, `ticket`: String? = nil, `web3Wallet`: String? = nil, `firstName`: String? = nil, `lastName`: String? = nil, `unsafeMetadata`: [String: JSONValue]? = nil, `legalAccepted`: Bool? = nil, `locale`: String? = nil) {
    self.`strategy` = `strategy`
    self.`token` = `token`
    self.`emailAddress` = `emailAddress`
    self.`phoneNumber` = `phoneNumber`
    self.`username` = `username`
    self.`password` = `password`
    self.`transfer` = `transfer`
    self.`ticket` = `ticket`
    self.`web3Wallet` = `web3Wallet`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`legalAccepted` = `legalAccepted`
    self.`locale` = `locale`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": try self.`strategy`.map { value in try value.encode() } ?? .undefined,
      "token": try self.`token`.map { value in .string(value) } ?? .undefined,
      "emailAddress": try self.`emailAddress`.map { value in .string(value) } ?? .undefined,
      "phoneNumber": try self.`phoneNumber`.map { value in .string(value) } ?? .undefined,
      "username": try self.`username`.map { value in .string(value) } ?? .undefined,
      "password": try self.`password`.map { value in .string(value) } ?? .undefined,
      "transfer": try self.`transfer`.map { value in .bool(value) } ?? .undefined,
      "ticket": try self.`ticket`.map { value in .string(value) } ?? .undefined,
      "web3Wallet": try self.`web3Wallet`.map { value in .string(value) } ?? .undefined,
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined,
      "legalAccepted": try self.`legalAccepted`.map { value in .bool(value) } ?? .undefined,
      "locale": try self.`locale`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpCreateParams {
    let values = try value.object()

    return try SignUpCreateParams(`strategy`: try (values["strategy"] ?? .undefined).optional { value in try SignUpCreateParamsStrategy.decode(value, in: runtime) }, `token`: try (values["token"] ?? .undefined).optional { value in try value.string() }, `emailAddress`: try (values["emailAddress"] ?? .undefined).optional { value in try value.string() }, `phoneNumber`: try (values["phoneNumber"] ?? .undefined).optional { value in try value.string() }, `username`: try (values["username"] ?? .undefined).optional { value in try value.string() }, `password`: try (values["password"] ?? .undefined).optional { value in try value.string() }, `transfer`: try (values["transfer"] ?? .undefined).optional { value in try value.bool() }, `ticket`: try (values["ticket"] ?? .undefined).optional { value in try value.string() }, `web3Wallet`: try (values["web3Wallet"] ?? .undefined).optional { value in try value.string() }, `firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() }, `legalAccepted`: try (values["legalAccepted"] ?? .undefined).optional { value in try value.bool() }, `locale`: try (values["locale"] ?? .undefined).optional { value in try value.string() })
  }
}

public enum SignUpCreateParamsStrategy: Hashable, Sendable {
  case `googleOneTap`
  case `oauthTokenApple`
  case `phoneCode`
  case `ticket`
  case `enterpriseSso`
  case `oauthFacebook`
  case `oauthGoogle`
  case `oauthHubspot`
  case `oauthGithub`
  case `oauthTiktok`
  case `oauthGitlab`
  case `oauthDiscord`
  case `oauthTwitter`
  case `oauthTwitch`
  case `oauthLinkedin`
  case `oauthLinkedinOidc`
  case `oauthDropbox`
  case `oauthAtlassian`
  case `oauthBitbucket`
  case `oauthMicrosoft`
  case `oauthNotion`
  case `oauthApple`
  case `oauthLine`
  case `oauthInstagram`
  case `oauthCoinbase`
  case `oauthSpotify`
  case `oauthXero`
  case `oauthBox`
  case `oauthSlack`
  case `oauthLinear`
  case `oauthX`
  case `oauthEnstall`
  case `oauthHuggingface`
  case `oauthVercel`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`googleOneTap`: return "google_one_tap"
    case .`oauthTokenApple`: return "oauth_token_apple"
    case .`phoneCode`: return "phone_code"
    case .`ticket`: return "ticket"
    case .`enterpriseSso`: return "enterprise_sso"
    case .`oauthFacebook`: return "oauth_facebook"
    case .`oauthGoogle`: return "oauth_google"
    case .`oauthHubspot`: return "oauth_hubspot"
    case .`oauthGithub`: return "oauth_github"
    case .`oauthTiktok`: return "oauth_tiktok"
    case .`oauthGitlab`: return "oauth_gitlab"
    case .`oauthDiscord`: return "oauth_discord"
    case .`oauthTwitter`: return "oauth_twitter"
    case .`oauthTwitch`: return "oauth_twitch"
    case .`oauthLinkedin`: return "oauth_linkedin"
    case .`oauthLinkedinOidc`: return "oauth_linkedin_oidc"
    case .`oauthDropbox`: return "oauth_dropbox"
    case .`oauthAtlassian`: return "oauth_atlassian"
    case .`oauthBitbucket`: return "oauth_bitbucket"
    case .`oauthMicrosoft`: return "oauth_microsoft"
    case .`oauthNotion`: return "oauth_notion"
    case .`oauthApple`: return "oauth_apple"
    case .`oauthLine`: return "oauth_line"
    case .`oauthInstagram`: return "oauth_instagram"
    case .`oauthCoinbase`: return "oauth_coinbase"
    case .`oauthSpotify`: return "oauth_spotify"
    case .`oauthXero`: return "oauth_xero"
    case .`oauthBox`: return "oauth_box"
    case .`oauthSlack`: return "oauth_slack"
    case .`oauthLinear`: return "oauth_linear"
    case .`oauthX`: return "oauth_x"
    case .`oauthEnstall`: return "oauth_enstall"
    case .`oauthHuggingface`: return "oauth_huggingface"
    case .`oauthVercel`: return "oauth_vercel"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "google_one_tap": self = .`googleOneTap`
    case "oauth_token_apple": self = .`oauthTokenApple`
    case "phone_code": self = .`phoneCode`
    case "ticket": self = .`ticket`
    case "enterprise_sso": self = .`enterpriseSso`
    case "oauth_facebook": self = .`oauthFacebook`
    case "oauth_google": self = .`oauthGoogle`
    case "oauth_hubspot": self = .`oauthHubspot`
    case "oauth_github": self = .`oauthGithub`
    case "oauth_tiktok": self = .`oauthTiktok`
    case "oauth_gitlab": self = .`oauthGitlab`
    case "oauth_discord": self = .`oauthDiscord`
    case "oauth_twitter": self = .`oauthTwitter`
    case "oauth_twitch": self = .`oauthTwitch`
    case "oauth_linkedin": self = .`oauthLinkedin`
    case "oauth_linkedin_oidc": self = .`oauthLinkedinOidc`
    case "oauth_dropbox": self = .`oauthDropbox`
    case "oauth_atlassian": self = .`oauthAtlassian`
    case "oauth_bitbucket": self = .`oauthBitbucket`
    case "oauth_microsoft": self = .`oauthMicrosoft`
    case "oauth_notion": self = .`oauthNotion`
    case "oauth_apple": self = .`oauthApple`
    case "oauth_line": self = .`oauthLine`
    case "oauth_instagram": self = .`oauthInstagram`
    case "oauth_coinbase": self = .`oauthCoinbase`
    case "oauth_spotify": self = .`oauthSpotify`
    case "oauth_xero": self = .`oauthXero`
    case "oauth_box": self = .`oauthBox`
    case "oauth_slack": self = .`oauthSlack`
    case "oauth_linear": self = .`oauthLinear`
    case "oauth_x": self = .`oauthX`
    case "oauth_enstall": self = .`oauthEnstall`
    case "oauth_huggingface": self = .`oauthHuggingface`
    case "oauth_vercel": self = .`oauthVercel`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpCreateParamsStrategy { .init(rawValue: try value.string()) }
}

public struct SignUpUpdateParams: Hashable, Sendable {
  public let `emailAddress`: String?
  public let `phoneNumber`: String?
  public let `username`: String?
  public let `firstName`: String?
  public let `lastName`: String?
  public let `unsafeMetadata`: [String: JSONValue]?
  public let `legalAccepted`: Bool?
  public let `locale`: String?
  public init(`emailAddress`: String? = nil, `phoneNumber`: String? = nil, `username`: String? = nil, `firstName`: String? = nil, `lastName`: String? = nil, `unsafeMetadata`: [String: JSONValue]? = nil, `legalAccepted`: Bool? = nil, `locale`: String? = nil) {
    self.`emailAddress` = `emailAddress`
    self.`phoneNumber` = `phoneNumber`
    self.`username` = `username`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`legalAccepted` = `legalAccepted`
    self.`locale` = `locale`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddress": try self.`emailAddress`.map { value in .string(value) } ?? .undefined,
      "phoneNumber": try self.`phoneNumber`.map { value in .string(value) } ?? .undefined,
      "username": try self.`username`.map { value in .string(value) } ?? .undefined,
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined,
      "legalAccepted": try self.`legalAccepted`.map { value in .bool(value) } ?? .undefined,
      "locale": try self.`locale`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpUpdateParams {
    let values = try value.object()

    return try SignUpUpdateParams(`emailAddress`: try (values["emailAddress"] ?? .undefined).optional { value in try value.string() }, `phoneNumber`: try (values["phoneNumber"] ?? .undefined).optional { value in try value.string() }, `username`: try (values["username"] ?? .undefined).optional { value in try value.string() }, `firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() }, `legalAccepted`: try (values["legalAccepted"] ?? .undefined).optional { value in try value.bool() }, `locale`: try (values["locale"] ?? .undefined).optional { value in try value.string() })
  }
}

/// Contains information about the available verification strategies for a sign-up attempt.
public struct SignUpVerificationsState: Hashable, Sendable {
  public let `emailAddress`: SignUpVerification
  public let `phoneNumber`: SignUpVerification
  public let `web3Wallet`: Verification
  public let `externalAccount`: Verification
  public let `emailLinkVerification`: SignUpVerificationsEmailLinkVerification?
  public init(`emailAddress`: SignUpVerification, `phoneNumber`: SignUpVerification, `web3Wallet`: Verification, `externalAccount`: Verification, `emailLinkVerification`: SignUpVerificationsEmailLinkVerification?) {
    self.`emailAddress` = `emailAddress`
    self.`phoneNumber` = `phoneNumber`
    self.`web3Wallet` = `web3Wallet`
    self.`externalAccount` = `externalAccount`
    self.`emailLinkVerification` = `emailLinkVerification`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "emailAddress": try self.`emailAddress`.encode(),
      "phoneNumber": try self.`phoneNumber`.encode(),
      "web3Wallet": try self.`web3Wallet`.encode(),
      "externalAccount": try self.`externalAccount`.encode(),
      "emailLinkVerification": try self.`emailLinkVerification`.map { value in try value.encode() } ?? .null
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpVerificationsState {
    let values = try value.object()

    return try SignUpVerificationsState(`emailAddress`: try SignUpVerification.decode((values["emailAddress"] ?? .undefined), in: runtime), `phoneNumber`: try SignUpVerification.decode((values["phoneNumber"] ?? .undefined), in: runtime), `web3Wallet`: try Verification.decode((values["web3Wallet"] ?? .undefined), in: runtime), `externalAccount`: try Verification.decode((values["externalAccount"] ?? .undefined), in: runtime), `emailLinkVerification`: try (values["emailLinkVerification"] ?? .undefined).optional { value in try SignUpVerificationsEmailLinkVerification.decode(value, in: runtime) })
  }
}
@MainActor @Observable public final class SignUpVerifications: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SignUpVerificationsState { context.state(handle, as: SignUpVerificationsState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `emailAddress`: SignUpVerification { state.`emailAddress` }
  public var `phoneNumber`: SignUpVerification { state.`phoneNumber` }
  public var `web3Wallet`: Verification { state.`web3Wallet` }
  public var `externalAccount`: Verification { state.`externalAccount` }
  public var `emailLinkVerification`: SignUpVerificationsEmailLinkVerification? { state.`emailLinkVerification` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try SignUpVerificationsState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpVerifications { try runtime.resource(ResourceHandle.decodeReference(value), as: SignUpVerifications.self) }
  /// Sends an email code to verify an email address.
  public func `sendEmailCode`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUpVerifications.sendEmailCode", arguments: []) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Verifies a code sent with the [`verifications.sendEmailCode()`](https://clerk.com/docs/reference/objects/sign-up-future#verifications-send-email-code) method.
  public func `verifyEmailCode`(_ `params`: SignUpEmailCodeVerifyParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUpVerifications.verifyEmailCode", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Sends an email link to verify an email address.
  public func `sendEmailLink`(_ `params`: SignUpEmailLinkSendParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUpVerifications.sendEmailLink", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Will wait for email link verification to complete or expire after calling [`verifications.sendEmailLink()`](https://clerk.com/docs/reference/objects/sign-up-future#verifications-send-email-link).
  public func `waitForEmailLinkVerification`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUpVerifications.waitForEmailLinkVerification", arguments: []) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Sends a phone code to verify a phone number.
  public func `sendPhoneCode`(_ `params`: SignUpPhoneCodeSendParams? = nil) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUpVerifications.sendPhoneCode", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      try runtime.checkErrorResult(result)
    }
  }
  /// Verifies a code sent with the [`verifications.sendPhoneCode()`](https://clerk.com/docs/reference/objects/sign-up-future#verifications-send-phone-code) method.
  public func `verifyPhoneCode`(_ `params`: SignUpPhoneCodeVerifyParams) async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUpVerifications.verifyPhoneCode", arguments: [try `params`.encode()]) { result in
      try runtime.checkErrorResult(result)
    }
  }
}

public struct SignUpVerificationState: Hashable, Sendable {
  public let `supportedStrategies`: [String]
  public let `nextAction`: String
  public let `attempts`: Double?
  public let `error`: ClerkAPIError?
  public let `expireAt`: Date?
  public let `status`: VerificationStatus?
  public let `strategy`: String?
  public let `verifiedAtClient`: String?
  public let `channel`: PhoneCodeChannel?
  public let `id`: String?
  public init(`supportedStrategies`: [String], `nextAction`: String, `attempts`: Double?, `error`: ClerkAPIError?, `expireAt`: Date?, `status`: VerificationStatus?, `strategy`: String?, `verifiedAtClient`: String?, `channel`: PhoneCodeChannel? = nil, `id`: String? = nil) {
    self.`supportedStrategies` = `supportedStrategies`
    self.`nextAction` = `nextAction`
    self.`attempts` = `attempts`
    self.`error` = `error`
    self.`expireAt` = `expireAt`
    self.`status` = `status`
    self.`strategy` = `strategy`
    self.`verifiedAtClient` = `verifiedAtClient`
    self.`channel` = `channel`
    self.`id` = `id`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "supportedStrategies": .array(try self.`supportedStrategies`.map { value in .string(value) }),
      "nextAction": .string(self.`nextAction`),
      "attempts": try self.`attempts`.map { value in .number(value) } ?? .null,
      "error": try self.`error`.map { value in try value.encode() } ?? .null,
      "expireAt": try self.`expireAt`.map { value in .string(value.ISO8601Format(.init(includingFractionalSeconds: true))) } ?? .null,
      "status": try self.`status`.map { value in try value.encode() } ?? .null,
      "strategy": try self.`strategy`.map { value in .string(value) } ?? .null,
      "verifiedAtClient": try self.`verifiedAtClient`.map { value in .string(value) } ?? .null,
      "channel": try self.`channel`.map { value in try value.encode() } ?? .undefined,
      "id": try self.`id`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpVerificationState {
    let values = try value.object()

    return try SignUpVerificationState(`supportedStrategies`: try (values["supportedStrategies"] ?? .undefined).array().map { value in try value.string() }, `nextAction`: try (values["nextAction"] ?? .undefined).string(), `attempts`: try (values["attempts"] ?? .undefined).optional { value in try value.number() }, `error`: try (values["error"] ?? .undefined).optional { value in try ClerkAPIError.decode(value, in: runtime) }, `expireAt`: try (values["expireAt"] ?? .undefined).optional { value in try value.date() }, `status`: try (values["status"] ?? .undefined).optional { value in try VerificationStatus.decode(value, in: runtime) }, `strategy`: try (values["strategy"] ?? .undefined).optional { value in try value.string() }, `verifiedAtClient`: try (values["verifiedAtClient"] ?? .undefined).optional { value in try value.string() }, `channel`: try (values["channel"] ?? .undefined).optional { value in try PhoneCodeChannel.decode(value, in: runtime) }, `id`: try (values["id"] ?? .undefined).optional { value in try value.string() })
  }
}
@MainActor @Observable public final class SignUpVerification: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: SignUpVerificationState { context.state(handle, as: SignUpVerificationState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `supportedStrategies`: [String] { state.`supportedStrategies` }
  public var `nextAction`: String { state.`nextAction` }
  public var `attempts`: Double? { state.`attempts` }
  public var `error`: ClerkAPIError? { state.`error` }
  public var `expireAt`: Date? { state.`expireAt` }
  public var `status`: VerificationStatus? { state.`status` }
  public var `strategy`: String? { state.`strategy` }
  public var `verifiedAtClient`: String? { state.`verifiedAtClient` }
  public var `channel`: PhoneCodeChannel? { state.`channel` }
  public var `id`: String? { state.`id` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try SignUpVerificationState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpVerification { try runtime.resource(ResourceHandle.decodeReference(value), as: SignUpVerification.self) }
  public func `verifiedFromTheSameClient`() async throws -> Bool {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUpVerification.verifiedFromTheSameClient", arguments: []) { result in
      return try result.bool()
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> SignUpVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "SignUpVerification.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try SignUpVerification.decode(result, in: runtime)
    }
  }
}

public struct SignUpVerificationsEmailLinkVerification: Hashable, Sendable {
  public let `status`: SignInEmailLinkVerificationStatus
  public let `createdSessionId`: String
  public let `verifiedFromTheSameClient`: Bool
  public init(`status`: SignInEmailLinkVerificationStatus, `createdSessionId`: String, `verifiedFromTheSameClient`: Bool) {
    self.`status` = `status`
    self.`createdSessionId` = `createdSessionId`
    self.`verifiedFromTheSameClient` = `verifiedFromTheSameClient`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "status": try self.`status`.encode(),
      "createdSessionId": .string(self.`createdSessionId`),
      "verifiedFromTheSameClient": .bool(self.`verifiedFromTheSameClient`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpVerificationsEmailLinkVerification {
    let values = try value.object()

    return try SignUpVerificationsEmailLinkVerification(`status`: try SignInEmailLinkVerificationStatus.decode((values["status"] ?? .undefined), in: runtime), `createdSessionId`: try (values["createdSessionId"] ?? .undefined).string(), `verifiedFromTheSameClient`: try (values["verifiedFromTheSameClient"] ?? .undefined).bool())
  }
}

public struct SignUpEmailCodeVerifyParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpEmailCodeVerifyParams {
    let values = try value.object()

    return try SignUpEmailCodeVerifyParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public struct SignUpEmailLinkSendParams: Hashable, Sendable {

  public init() {

  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [:
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpEmailLinkSendParams {
    let values = try value.object()

    return try SignUpEmailLinkSendParams()
  }
}

public struct SignUpPhoneCodeSendParams: Hashable, Sendable {
  public let `channel`: PhoneCodeChannel?
  public init(`channel`: PhoneCodeChannel? = nil) {
    self.`channel` = `channel`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "channel": try self.`channel`.map { value in try value.encode() } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpPhoneCodeSendParams {
    let values = try value.object()

    return try SignUpPhoneCodeSendParams(`channel`: try (values["channel"] ?? .undefined).optional { value in try PhoneCodeChannel.decode(value, in: runtime) })
  }
}

public struct SignUpPhoneCodeVerifyParams: Hashable, Sendable {
  public let `code`: String
  public init(`code`: String) {
    self.`code` = `code`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "code": .string(self.`code`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpPhoneCodeVerifyParams {
    let values = try value.object()

    return try SignUpPhoneCodeVerifyParams(`code`: try (values["code"] ?? .undefined).string())
  }
}

public indirect enum SignUpPasswordParams: Hashable, Sendable {
  case case1(SignUpPasswordParamsCase1)
  case case2(SignUpPasswordParamsCase2)
  case case3(SignUpPasswordParamsCase3)
  case case4(SignUpPasswordParamsCase4)
  @MainActor public var `password`: String {
    switch self {
    case .case1(let value): return value.`password`
    case .case2(let value): return value.`password`
    case .case3(let value): return value.`password`
    case .case4(let value): return value.`password`
    }
  }
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": try value.encode()])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    case .case4(let value): return .object(["$case": .number(3), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpPasswordParams {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try SignUpPasswordParamsCase1.decode(payload, in: runtime))
    case 1: return .case2(try SignUpPasswordParamsCase2.decode(payload, in: runtime))
    case 2: return .case3(try SignUpPasswordParamsCase3.decode(payload, in: runtime))
    case 3: return .case4(try SignUpPasswordParamsCase4.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public struct SignUpPasswordParamsCase1: Hashable, Sendable {
  public let `firstName`: String?
  public let `lastName`: String?
  public let `unsafeMetadata`: [String: JSONValue]?
  public let `legalAccepted`: Bool?
  public let `locale`: String?
  public let `password`: String
  public let `emailAddress`: String
  public let `phoneNumber`: String?
  public let `username`: String?
  public init(`firstName`: String? = nil, `lastName`: String? = nil, `unsafeMetadata`: [String: JSONValue]? = nil, `legalAccepted`: Bool? = nil, `locale`: String? = nil, `password`: String, `emailAddress`: String, `phoneNumber`: String? = nil, `username`: String? = nil) {
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`legalAccepted` = `legalAccepted`
    self.`locale` = `locale`
    self.`password` = `password`
    self.`emailAddress` = `emailAddress`
    self.`phoneNumber` = `phoneNumber`
    self.`username` = `username`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined,
      "legalAccepted": try self.`legalAccepted`.map { value in .bool(value) } ?? .undefined,
      "locale": try self.`locale`.map { value in .string(value) } ?? .undefined,
      "password": .string(self.`password`),
      "emailAddress": .string(self.`emailAddress`),
      "phoneNumber": try self.`phoneNumber`.map { value in .string(value) } ?? .undefined,
      "username": try self.`username`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpPasswordParamsCase1 {
    let values = try value.object()

    return try SignUpPasswordParamsCase1(`firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() }, `legalAccepted`: try (values["legalAccepted"] ?? .undefined).optional { value in try value.bool() }, `locale`: try (values["locale"] ?? .undefined).optional { value in try value.string() }, `password`: try (values["password"] ?? .undefined).string(), `emailAddress`: try (values["emailAddress"] ?? .undefined).string(), `phoneNumber`: try (values["phoneNumber"] ?? .undefined).optional { value in try value.string() }, `username`: try (values["username"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignUpPasswordParamsCase2: Hashable, Sendable {
  public let `firstName`: String?
  public let `lastName`: String?
  public let `unsafeMetadata`: [String: JSONValue]?
  public let `legalAccepted`: Bool?
  public let `locale`: String?
  public let `password`: String
  public let `emailAddress`: String?
  public let `phoneNumber`: String
  public let `username`: String?
  public init(`firstName`: String? = nil, `lastName`: String? = nil, `unsafeMetadata`: [String: JSONValue]? = nil, `legalAccepted`: Bool? = nil, `locale`: String? = nil, `password`: String, `emailAddress`: String? = nil, `phoneNumber`: String, `username`: String? = nil) {
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`legalAccepted` = `legalAccepted`
    self.`locale` = `locale`
    self.`password` = `password`
    self.`emailAddress` = `emailAddress`
    self.`phoneNumber` = `phoneNumber`
    self.`username` = `username`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined,
      "legalAccepted": try self.`legalAccepted`.map { value in .bool(value) } ?? .undefined,
      "locale": try self.`locale`.map { value in .string(value) } ?? .undefined,
      "password": .string(self.`password`),
      "emailAddress": try self.`emailAddress`.map { value in .string(value) } ?? .undefined,
      "phoneNumber": .string(self.`phoneNumber`),
      "username": try self.`username`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpPasswordParamsCase2 {
    let values = try value.object()

    return try SignUpPasswordParamsCase2(`firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() }, `legalAccepted`: try (values["legalAccepted"] ?? .undefined).optional { value in try value.bool() }, `locale`: try (values["locale"] ?? .undefined).optional { value in try value.string() }, `password`: try (values["password"] ?? .undefined).string(), `emailAddress`: try (values["emailAddress"] ?? .undefined).optional { value in try value.string() }, `phoneNumber`: try (values["phoneNumber"] ?? .undefined).string(), `username`: try (values["username"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignUpPasswordParamsCase3: Hashable, Sendable {
  public let `firstName`: String?
  public let `lastName`: String?
  public let `unsafeMetadata`: [String: JSONValue]?
  public let `legalAccepted`: Bool?
  public let `locale`: String?
  public let `password`: String
  public let `emailAddress`: String?
  public let `phoneNumber`: String?
  public let `username`: String
  public init(`firstName`: String? = nil, `lastName`: String? = nil, `unsafeMetadata`: [String: JSONValue]? = nil, `legalAccepted`: Bool? = nil, `locale`: String? = nil, `password`: String, `emailAddress`: String? = nil, `phoneNumber`: String? = nil, `username`: String) {
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`legalAccepted` = `legalAccepted`
    self.`locale` = `locale`
    self.`password` = `password`
    self.`emailAddress` = `emailAddress`
    self.`phoneNumber` = `phoneNumber`
    self.`username` = `username`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined,
      "legalAccepted": try self.`legalAccepted`.map { value in .bool(value) } ?? .undefined,
      "locale": try self.`locale`.map { value in .string(value) } ?? .undefined,
      "password": .string(self.`password`),
      "emailAddress": try self.`emailAddress`.map { value in .string(value) } ?? .undefined,
      "phoneNumber": try self.`phoneNumber`.map { value in .string(value) } ?? .undefined,
      "username": .string(self.`username`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpPasswordParamsCase3 {
    let values = try value.object()

    return try SignUpPasswordParamsCase3(`firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() }, `legalAccepted`: try (values["legalAccepted"] ?? .undefined).optional { value in try value.bool() }, `locale`: try (values["locale"] ?? .undefined).optional { value in try value.string() }, `password`: try (values["password"] ?? .undefined).string(), `emailAddress`: try (values["emailAddress"] ?? .undefined).optional { value in try value.string() }, `phoneNumber`: try (values["phoneNumber"] ?? .undefined).optional { value in try value.string() }, `username`: try (values["username"] ?? .undefined).string())
  }
}

public struct SignUpPasswordParamsCase4: Hashable, Sendable {
  public let `firstName`: String?
  public let `lastName`: String?
  public let `unsafeMetadata`: [String: JSONValue]?
  public let `legalAccepted`: Bool?
  public let `locale`: String?
  public let `password`: String
  public let `emailAddress`: String?
  public let `phoneNumber`: String?
  public let `username`: String?
  public init(`firstName`: String? = nil, `lastName`: String? = nil, `unsafeMetadata`: [String: JSONValue]? = nil, `legalAccepted`: Bool? = nil, `locale`: String? = nil, `password`: String, `emailAddress`: String? = nil, `phoneNumber`: String? = nil, `username`: String? = nil) {
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`legalAccepted` = `legalAccepted`
    self.`locale` = `locale`
    self.`password` = `password`
    self.`emailAddress` = `emailAddress`
    self.`phoneNumber` = `phoneNumber`
    self.`username` = `username`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined,
      "legalAccepted": try self.`legalAccepted`.map { value in .bool(value) } ?? .undefined,
      "locale": try self.`locale`.map { value in .string(value) } ?? .undefined,
      "password": .string(self.`password`),
      "emailAddress": try self.`emailAddress`.map { value in .string(value) } ?? .undefined,
      "phoneNumber": try self.`phoneNumber`.map { value in .string(value) } ?? .undefined,
      "username": try self.`username`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpPasswordParamsCase4 {
    let values = try value.object()

    return try SignUpPasswordParamsCase4(`firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() }, `legalAccepted`: try (values["legalAccepted"] ?? .undefined).optional { value in try value.bool() }, `locale`: try (values["locale"] ?? .undefined).optional { value in try value.string() }, `password`: try (values["password"] ?? .undefined).string(), `emailAddress`: try (values["emailAddress"] ?? .undefined).optional { value in try value.string() }, `phoneNumber`: try (values["phoneNumber"] ?? .undefined).optional { value in try value.string() }, `username`: try (values["username"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignUpSSOParams: Hashable, Sendable {
  public let `strategy`: String
  public let `oidcPrompt`: String?
  public let `enterpriseConnectionId`: String?
  public let `emailAddress`: String?
  public let `firstName`: String?
  public let `lastName`: String?
  public let `unsafeMetadata`: [String: JSONValue]?
  public let `legalAccepted`: Bool?
  public let `locale`: String?
  public init(`strategy`: String, `oidcPrompt`: String? = nil, `enterpriseConnectionId`: String? = nil, `emailAddress`: String? = nil, `firstName`: String? = nil, `lastName`: String? = nil, `unsafeMetadata`: [String: JSONValue]? = nil, `legalAccepted`: Bool? = nil, `locale`: String? = nil) {
    self.`strategy` = `strategy`
    self.`oidcPrompt` = `oidcPrompt`
    self.`enterpriseConnectionId` = `enterpriseConnectionId`
    self.`emailAddress` = `emailAddress`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`legalAccepted` = `legalAccepted`
    self.`locale` = `locale`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": .string(self.`strategy`),
      "oidcPrompt": try self.`oidcPrompt`.map { value in .string(value) } ?? .undefined,
      "enterpriseConnectionId": try self.`enterpriseConnectionId`.map { value in .string(value) } ?? .undefined,
      "emailAddress": try self.`emailAddress`.map { value in .string(value) } ?? .undefined,
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined,
      "legalAccepted": try self.`legalAccepted`.map { value in .bool(value) } ?? .undefined,
      "locale": try self.`locale`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpSSOParams {
    let values = try value.object()

    return try SignUpSSOParams(`strategy`: try (values["strategy"] ?? .undefined).string(), `oidcPrompt`: try (values["oidcPrompt"] ?? .undefined).optional { value in try value.string() }, `enterpriseConnectionId`: try (values["enterpriseConnectionId"] ?? .undefined).optional { value in try value.string() }, `emailAddress`: try (values["emailAddress"] ?? .undefined).optional { value in try value.string() }, `firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() }, `legalAccepted`: try (values["legalAccepted"] ?? .undefined).optional { value in try value.bool() }, `locale`: try (values["locale"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignUpTicketParams: Hashable, Sendable {
  public let `ticket`: String
  public let `firstName`: String?
  public let `lastName`: String?
  public let `unsafeMetadata`: [String: JSONValue]?
  public let `legalAccepted`: Bool?
  public let `locale`: String?
  public init(`ticket`: String, `firstName`: String? = nil, `lastName`: String? = nil, `unsafeMetadata`: [String: JSONValue]? = nil, `legalAccepted`: Bool? = nil, `locale`: String? = nil) {
    self.`ticket` = `ticket`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`legalAccepted` = `legalAccepted`
    self.`locale` = `locale`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "ticket": .string(self.`ticket`),
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined,
      "legalAccepted": try self.`legalAccepted`.map { value in .bool(value) } ?? .undefined,
      "locale": try self.`locale`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpTicketParams {
    let values = try value.object()

    return try SignUpTicketParams(`ticket`: try (values["ticket"] ?? .undefined).string(), `firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() }, `legalAccepted`: try (values["legalAccepted"] ?? .undefined).optional { value in try value.bool() }, `locale`: try (values["locale"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SignUpSubmitProtectCheckParams: Hashable, Sendable {
  public let `proofToken`: String
  public init(`proofToken`: String) {
    self.`proofToken` = `proofToken`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "proofToken": .string(self.`proofToken`)
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SignUpSubmitProtectCheckParams {
    let values = try value.object()

    return try SignUpSubmitProtectCheckParams(`proofToken`: try (values["proofToken"] ?? .undefined).string())
  }
}

public struct MobileSSOParams: Hashable, Sendable {
  public let `strategy`: SignInSSOParamsStrategy
  public let `identifier`: String?
  public let `enterpriseConnectionId`: String?
  public let `oidcPrompt`: String?
  public let `legalAccepted`: Bool?
  public let `firstName`: String?
  public let `lastName`: String?
  public let `locale`: String?
  public let `unsafeMetadata`: [String: JSONValue]?
  public let `start`: MobileSSOParamsStart
  public let `transferable`: Bool
  public let `preferGoogleOneTap`: Bool?
  public init(`strategy`: SignInSSOParamsStrategy, `identifier`: String? = nil, `enterpriseConnectionId`: String? = nil, `oidcPrompt`: String? = nil, `legalAccepted`: Bool? = nil, `firstName`: String? = nil, `lastName`: String? = nil, `locale`: String? = nil, `unsafeMetadata`: [String: JSONValue]? = nil, `start`: MobileSSOParamsStart, `transferable`: Bool, `preferGoogleOneTap`: Bool? = nil) {
    self.`strategy` = `strategy`
    self.`identifier` = `identifier`
    self.`enterpriseConnectionId` = `enterpriseConnectionId`
    self.`oidcPrompt` = `oidcPrompt`
    self.`legalAccepted` = `legalAccepted`
    self.`firstName` = `firstName`
    self.`lastName` = `lastName`
    self.`locale` = `locale`
    self.`unsafeMetadata` = `unsafeMetadata`
    self.`start` = `start`
    self.`transferable` = `transferable`
    self.`preferGoogleOneTap` = `preferGoogleOneTap`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "strategy": try self.`strategy`.encode(),
      "identifier": try self.`identifier`.map { value in .string(value) } ?? .undefined,
      "enterpriseConnectionId": try self.`enterpriseConnectionId`.map { value in .string(value) } ?? .undefined,
      "oidcPrompt": try self.`oidcPrompt`.map { value in .string(value) } ?? .undefined,
      "legalAccepted": try self.`legalAccepted`.map { value in .bool(value) } ?? .undefined,
      "firstName": try self.`firstName`.map { value in .string(value) } ?? .undefined,
      "lastName": try self.`lastName`.map { value in .string(value) } ?? .undefined,
      "locale": try self.`locale`.map { value in .string(value) } ?? .undefined,
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined,
      "start": try self.`start`.encode(),
      "transferable": .bool(self.`transferable`),
      "preferGoogleOneTap": try self.`preferGoogleOneTap`.map { value in .bool(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileSSOParams {
    let values = try value.object()

    return try MobileSSOParams(`strategy`: try SignInSSOParamsStrategy.decode((values["strategy"] ?? .undefined), in: runtime), `identifier`: try (values["identifier"] ?? .undefined).optional { value in try value.string() }, `enterpriseConnectionId`: try (values["enterpriseConnectionId"] ?? .undefined).optional { value in try value.string() }, `oidcPrompt`: try (values["oidcPrompt"] ?? .undefined).optional { value in try value.string() }, `legalAccepted`: try (values["legalAccepted"] ?? .undefined).optional { value in try value.bool() }, `firstName`: try (values["firstName"] ?? .undefined).optional { value in try value.string() }, `lastName`: try (values["lastName"] ?? .undefined).optional { value in try value.string() }, `locale`: try (values["locale"] ?? .undefined).optional { value in try value.string() }, `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() }, `start`: try MobileSSOParamsStart.decode((values["start"] ?? .undefined), in: runtime), `transferable`: try (values["transferable"] ?? .undefined).bool(), `preferGoogleOneTap`: try (values["preferGoogleOneTap"] ?? .undefined).optional { value in try value.bool() })
  }
}

public enum MobileSSOParamsStart: Hashable, Sendable {
  case `signIn`
  case `signUp`
  case `auto`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`signIn`: return "signIn"
    case .`signUp`: return "signUp"
    case .`auto`: return "auto"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "signIn": self = .`signIn`
    case "signUp": self = .`signUp`
    case "auto": self = .`auto`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileSSOParamsStart { .init(rawValue: try value.string()) }
}

/// Shared entry behavior for the identifier screen in prebuilt mobile authentication. Does not finalize a session.
public struct MobileIdentifierParams: Hashable, Sendable {
  public let `identifier`: String
  public let `identifierType`: MobileIdentifierParamsIdentifierType
  public let `mode`: MobileIdentifierParamsMode
  public let `unsafeMetadata`: [String: JSONValue]?
  public init(`identifier`: String, `identifierType`: MobileIdentifierParamsIdentifierType, `mode`: MobileIdentifierParamsMode, `unsafeMetadata`: [String: JSONValue]? = nil) {
    self.`identifier` = `identifier`
    self.`identifierType` = `identifierType`
    self.`mode` = `mode`
    self.`unsafeMetadata` = `unsafeMetadata`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "identifier": .string(self.`identifier`),
      "identifierType": try self.`identifierType`.encode(),
      "mode": try self.`mode`.encode(),
      "unsafeMetadata": try self.`unsafeMetadata`.map { value in .object(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileIdentifierParams {
    let values = try value.object()

    return try MobileIdentifierParams(`identifier`: try (values["identifier"] ?? .undefined).string(), `identifierType`: try MobileIdentifierParamsIdentifierType.decode((values["identifierType"] ?? .undefined), in: runtime), `mode`: try MobileIdentifierParamsMode.decode((values["mode"] ?? .undefined), in: runtime), `unsafeMetadata`: try (values["unsafeMetadata"] ?? .undefined).optional { value in try value.object() })
  }
}

public enum MobileIdentifierParamsIdentifierType: Hashable, Sendable {
  case `username`
  case `emailAddress`
  case `phoneNumber`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`username`: return "username"
    case .`emailAddress`: return "emailAddress"
    case .`phoneNumber`: return "phoneNumber"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "username": self = .`username`
    case "emailAddress": self = .`emailAddress`
    case "phoneNumber": self = .`phoneNumber`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileIdentifierParamsIdentifierType { .init(rawValue: try value.string()) }
}

public enum MobileIdentifierParamsMode: Hashable, Sendable {
  case `signIn`
  case `signUp`
  case `signInOrUp`
  case unrecognized(String)
  public var rawValue: String {
    switch self {
    case .`signIn`: return "signIn"
    case .`signUp`: return "signUp"
    case .`signInOrUp`: return "signInOrUp"
    case .unrecognized(let value): return value
    }
  }
  public init(rawValue: String) {
    switch rawValue {
    case "signIn": self = .`signIn`
    case "signUp": self = .`signUp`
    case "signInOrUp": self = .`signInOrUp`
    default: self = .unrecognized(rawValue)
    }
  }
  public func encode() throws -> JSONValue { .string(rawValue) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileIdentifierParamsMode { .init(rawValue: try value.string()) }
}

public struct MobileSetActiveParams: Hashable, Sendable {
  public let `organization`: Field<MobileSetActiveParamsOrganization>
  public let `session`: Field<MobileSetActiveParamsSession>
  public init(`organization`: Field<MobileSetActiveParamsOrganization> = .omitted, `session`: Field<MobileSetActiveParamsSession> = .omitted) {
    self.`organization` = `organization`
    self.`session` = `session`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "organization": try self.`organization`.encode { value in try value.encode() },
      "session": try self.`session`.encode { value in try value.encode() }
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileSetActiveParams {
    let values = try value.object()

    return try MobileSetActiveParams(`organization`: try Field.decode((values["organization"] ?? .undefined)) { value in try MobileSetActiveParamsOrganization.decode(value, in: runtime) }, `session`: try Field.decode((values["session"] ?? .undefined)) { value in try MobileSetActiveParamsSession.decode(value, in: runtime) })
  }
}

public indirect enum MobileSetActiveParamsOrganization: Hashable, Sendable {
  case case1(String)
  case case2(Organization)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": .string(value)])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileSetActiveParamsOrganization {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try payload.string())
    case 1: return .case2(try Organization.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

public indirect enum MobileSetActiveParamsSession: Hashable, Sendable {
  case case1(String)
  case case2(ActiveSession)
  case case3(PendingSession)
  @MainActor public func encode() throws -> JSONValue {
    switch self {
    case .case1(let value): return .object(["$case": .number(0), "value": .string(value)])
    case .case2(let value): return .object(["$case": .number(1), "value": try value.encode()])
    case .case3(let value): return .object(["$case": .number(2), "value": try value.encode()])
    }
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileSetActiveParamsSession {
    let values = try value.object()
    let payload = values["value"] ?? .undefined
    switch try (values["$case"] ?? .undefined).number() {
    case 0: return .case1(try payload.string())
    case 1: return .case2(try ActiveSession.decode(payload, in: runtime))
    case 2: return .case3(try PendingSession.decode(payload, in: runtime))
    default: throw CoreError.invalidValue
    }
  }
}

/// Represents a session resource that has completed all pending tasks
/// and authentication factors
public struct ActiveSessionState: Hashable, Sendable {
  public var `status`: String { "active" }
  public let `user`: User
  public let `id`: String
  public let `expireAt`: Date
  public let `abandonAt`: Date
  public let `factorVerificationAge`: ActiveSessionFactorVerificationAgeValue?
  public let `lastActiveOrganizationId`: String?
  public let `lastActiveAt`: Date
  public let `actor`: [String: JSONValue]?
  public let `agent`: [String: JSONValue]?
  public let `tasks`: [SessionTask]?
  public let `currentTask`: SessionTask?
  public let `publicUserData`: PublicUserData
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`user`: User, `id`: String, `expireAt`: Date, `abandonAt`: Date, `factorVerificationAge`: ActiveSessionFactorVerificationAgeValue?, `lastActiveOrganizationId`: String?, `lastActiveAt`: Date, `actor`: [String: JSONValue]?, `agent`: [String: JSONValue]?, `tasks`: [SessionTask]?, `currentTask`: SessionTask? = nil, `publicUserData`: PublicUserData, `createdAt`: Date, `updatedAt`: Date) {
    self.`user` = `user`
    self.`id` = `id`
    self.`expireAt` = `expireAt`
    self.`abandonAt` = `abandonAt`
    self.`factorVerificationAge` = `factorVerificationAge`
    self.`lastActiveOrganizationId` = `lastActiveOrganizationId`
    self.`lastActiveAt` = `lastActiveAt`
    self.`actor` = `actor`
    self.`agent` = `agent`
    self.`tasks` = `tasks`
    self.`currentTask` = `currentTask`
    self.`publicUserData` = `publicUserData`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "status": .string("active"),
      "user": try self.`user`.encode(),
      "id": .string(self.`id`),
      "expireAt": .string(self.`expireAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "abandonAt": .string(self.`abandonAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "factorVerificationAge": try self.`factorVerificationAge`.map { value in try value.encode() } ?? .null,
      "lastActiveOrganizationId": try self.`lastActiveOrganizationId`.map { value in .string(value) } ?? .null,
      "lastActiveAt": .string(self.`lastActiveAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "actor": try self.`actor`.map { value in .object(value) } ?? .null,
      "agent": try self.`agent`.map { value in .object(value) } ?? .null,
      "tasks": try self.`tasks`.map { value in .array(try value.map { value in try value.encode() }) } ?? .null,
      "currentTask": try self.`currentTask`.map { value in try value.encode() } ?? .undefined,
      "publicUserData": try self.`publicUserData`.encode(),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ActiveSessionState {
    let values = try value.object()
    guard values["status"] == .string("active") else { throw CoreError.invalidValue }
    return try ActiveSessionState(`user`: try User.decode((values["user"] ?? .undefined), in: runtime), `id`: try (values["id"] ?? .undefined).string(), `expireAt`: try (values["expireAt"] ?? .undefined).date(), `abandonAt`: try (values["abandonAt"] ?? .undefined).date(), `factorVerificationAge`: try (values["factorVerificationAge"] ?? .undefined).optional { value in try ActiveSessionFactorVerificationAgeValue.decode(value, in: runtime) }, `lastActiveOrganizationId`: try (values["lastActiveOrganizationId"] ?? .undefined).optional { value in try value.string() }, `lastActiveAt`: try (values["lastActiveAt"] ?? .undefined).date(), `actor`: try (values["actor"] ?? .undefined).optional { value in try value.object() }, `agent`: try (values["agent"] ?? .undefined).optional { value in try value.object() }, `tasks`: try (values["tasks"] ?? .undefined).optional { value in try value.array().map { value in try SessionTask.decode(value, in: runtime) } }, `currentTask`: try (values["currentTask"] ?? .undefined).optional { value in try SessionTask.decode(value, in: runtime) }, `publicUserData`: try PublicUserData.decode((values["publicUserData"] ?? .undefined), in: runtime), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class ActiveSession: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: ActiveSessionState { context.state(handle, as: ActiveSessionState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `status`: String { state.`status` }
  public var `user`: User { state.`user` }
  public var `id`: String { state.`id` }
  public var `expireAt`: Date { state.`expireAt` }
  public var `abandonAt`: Date { state.`abandonAt` }
  public var `factorVerificationAge`: ActiveSessionFactorVerificationAgeValue? { state.`factorVerificationAge` }
  public var `lastActiveOrganizationId`: String? { state.`lastActiveOrganizationId` }
  public var `lastActiveAt`: Date { state.`lastActiveAt` }
  public var `actor`: [String: JSONValue]? { state.`actor` }
  public var `agent`: [String: JSONValue]? { state.`agent` }
  public var `tasks`: [SessionTask]? { state.`tasks` }
  public var `currentTask`: SessionTask? { state.`currentTask` }
  public var `publicUserData`: PublicUserData { state.`publicUserData` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try ActiveSessionState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ActiveSession { try runtime.resource(ResourceHandle.decodeReference(value), as: ActiveSession.self) }
  /// Marks the session as ended. The session will no longer be active for this `Client` and its status will become **ended**.
  public func `end`() async throws -> Session {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.end", arguments: []) { result in
      return try Session.decode(result, in: runtime)
    }
  }
  /// Invalidates the current session by marking it as removed. Once removed, the session will be deactivated for the current Client instance and its `status` will be set to `removed`. This operation cannot be undone.
  public func `remove`() async throws -> Session {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.remove", arguments: []) { result in
      return try Session.decode(result, in: runtime)
    }
  }
  /// Updates the session's last active timestamp to the current time. This method should be called periodically to indicate ongoing user activity and prevent the session from becoming stale. The updated timestamp is used for session management and analytics purposes.
  public func `touch`(_ `params`: SessionTouchParams? = nil) async throws -> Session {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.touch", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try Session.decode(result, in: runtime)
    }
  }
  /// Gets the current user's [session token](https://clerk.com/docs/guides/sessions/session-tokens) or a [custom JWT template](https://clerk.com/docs/guides/sessions/jwt-templates).
  ///
  /// This method uses a cache so a network request will only be made if the token in memory has expired. The TTL for a Clerk token is one minute. It retries on transient failures (e.g., network errors); when the browser is offline and retries are exhausted, it throws `ClerkOfflineError`.
  ///
  /// Tokens can only be generated if the user is signed in.
  public func `getToken`(_ `options`: GetTokenOptions? = nil) async throws -> String? {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.getToken", arguments: [try `options`.map { value in try value.encode() } ?? .undefined]) { result in
      return try result.optional { value in try value.string() }
    }
  }
  /// Checks if the user is [authorized for the specified Role, Permission, Feature, or Plan](https://clerk.com/docs/guides/secure/authorization-checks) or requires the user to [reverify their credentials](https://clerk.com/docs/guides/secure/reverification) if their last verification is older than allowed.
  public func `checkAuthorization`(_ `isAuthorizedParams`: CheckAuthorizationParams) async throws -> Bool {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.checkAuthorization", arguments: [try `isAuthorizedParams`.encode()]) { result in
      return try result.bool()
    }
  }
  /// Clears the cache for the current session. This is useful if the session has been updated and the cache is no longer valid.
  public func `clearCache`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.clearCache", arguments: []) { result in
      _ = result
    }
  }
  /// Initiates the reverification flow.
  public func `startVerification`(_ `params`: SessionVerifyCreateParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.startVerification", arguments: [try `params`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Initiates the [first factor verification](!first-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
  public func `prepareFirstFactorVerification`(_ `factor`: SessionVerifyPrepareFirstFactorParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.prepareFirstFactorVerification", arguments: [try `factor`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Attempts to complete the [first factor verification](!first-factor-verification) process.
  public func `attemptFirstFactorVerification`(_ `attemptFactor`: SessionVerifyAttemptFirstFactorParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.attemptFirstFactorVerification", arguments: [try `attemptFactor`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Initiates the [second factor verification](!second-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
  public func `prepareSecondFactorVerification`(_ `params`: PhoneCodeSecondFactorConfig) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.prepareSecondFactorVerification", arguments: [try `params`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Attempts to complete the [second factor verification](!second-factor-verification) process.
  public func `attemptSecondFactorVerification`(_ `params`: SessionVerifyAttemptSecondFactorParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.attemptSecondFactorVerification", arguments: [try `params`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Initiates a verification flow using passkeys.
  public func `verifyWithPasskey`() async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.verifyWithPasskey", arguments: []) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> ActiveSession {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "ActiveSession.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try ActiveSession.decode(result, in: runtime)
    }
  }
}

/// Represents a session resource that has completed sign-in but has pending tasks
public struct PendingSessionState: Hashable, Sendable {
  public var `status`: String { "pending" }
  public let `user`: User
  public let `currentTask`: SessionTask
  public let `id`: String
  public let `expireAt`: Date
  public let `abandonAt`: Date
  public let `factorVerificationAge`: PendingSessionFactorVerificationAgeValue?
  public let `lastActiveOrganizationId`: String?
  public let `lastActiveAt`: Date
  public let `actor`: [String: JSONValue]?
  public let `agent`: [String: JSONValue]?
  public let `tasks`: [SessionTask]?
  public let `publicUserData`: PublicUserData
  public let `createdAt`: Date
  public let `updatedAt`: Date
  public init(`user`: User, `currentTask`: SessionTask, `id`: String, `expireAt`: Date, `abandonAt`: Date, `factorVerificationAge`: PendingSessionFactorVerificationAgeValue?, `lastActiveOrganizationId`: String?, `lastActiveAt`: Date, `actor`: [String: JSONValue]?, `agent`: [String: JSONValue]?, `tasks`: [SessionTask]?, `publicUserData`: PublicUserData, `createdAt`: Date, `updatedAt`: Date) {
    self.`user` = `user`
    self.`currentTask` = `currentTask`
    self.`id` = `id`
    self.`expireAt` = `expireAt`
    self.`abandonAt` = `abandonAt`
    self.`factorVerificationAge` = `factorVerificationAge`
    self.`lastActiveOrganizationId` = `lastActiveOrganizationId`
    self.`lastActiveAt` = `lastActiveAt`
    self.`actor` = `actor`
    self.`agent` = `agent`
    self.`tasks` = `tasks`
    self.`publicUserData` = `publicUserData`
    self.`createdAt` = `createdAt`
    self.`updatedAt` = `updatedAt`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "status": .string("pending"),
      "user": try self.`user`.encode(),
      "currentTask": try self.`currentTask`.encode(),
      "id": .string(self.`id`),
      "expireAt": .string(self.`expireAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "abandonAt": .string(self.`abandonAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "factorVerificationAge": try self.`factorVerificationAge`.map { value in try value.encode() } ?? .null,
      "lastActiveOrganizationId": try self.`lastActiveOrganizationId`.map { value in .string(value) } ?? .null,
      "lastActiveAt": .string(self.`lastActiveAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "actor": try self.`actor`.map { value in .object(value) } ?? .null,
      "agent": try self.`agent`.map { value in .object(value) } ?? .null,
      "tasks": try self.`tasks`.map { value in .array(try value.map { value in try value.encode() }) } ?? .null,
      "publicUserData": try self.`publicUserData`.encode(),
      "createdAt": .string(self.`createdAt`.ISO8601Format(.init(includingFractionalSeconds: true))),
      "updatedAt": .string(self.`updatedAt`.ISO8601Format(.init(includingFractionalSeconds: true)))
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PendingSessionState {
    let values = try value.object()
    guard values["status"] == .string("pending") else { throw CoreError.invalidValue }
    return try PendingSessionState(`user`: try User.decode((values["user"] ?? .undefined), in: runtime), `currentTask`: try SessionTask.decode((values["currentTask"] ?? .undefined), in: runtime), `id`: try (values["id"] ?? .undefined).string(), `expireAt`: try (values["expireAt"] ?? .undefined).date(), `abandonAt`: try (values["abandonAt"] ?? .undefined).date(), `factorVerificationAge`: try (values["factorVerificationAge"] ?? .undefined).optional { value in try PendingSessionFactorVerificationAgeValue.decode(value, in: runtime) }, `lastActiveOrganizationId`: try (values["lastActiveOrganizationId"] ?? .undefined).optional { value in try value.string() }, `lastActiveAt`: try (values["lastActiveAt"] ?? .undefined).date(), `actor`: try (values["actor"] ?? .undefined).optional { value in try value.object() }, `agent`: try (values["agent"] ?? .undefined).optional { value in try value.object() }, `tasks`: try (values["tasks"] ?? .undefined).optional { value in try value.array().map { value in try SessionTask.decode(value, in: runtime) } }, `publicUserData`: try PublicUserData.decode((values["publicUserData"] ?? .undefined), in: runtime), `createdAt`: try (values["createdAt"] ?? .undefined).date(), `updatedAt`: try (values["updatedAt"] ?? .undefined).date())
  }
}
@MainActor @Observable public final class PendingSession: CoreResource {
  public let handle: ResourceHandle
  public let context: ResourceContext
  public var isInvalidated: Bool { context.isInvalidated(handle) }
  public var state: PendingSessionState { context.state(handle, as: PendingSessionState.self) }
  public init(handle: ResourceHandle, runtime: CoreRuntime) { self.handle = handle; self.context = ResourceContext(runtime: runtime, handle: handle, ownsRuntime: false) }
  public var `status`: String { state.`status` }
  public var `user`: User { state.`user` }
  public var `currentTask`: SessionTask { state.`currentTask` }
  public var `id`: String { state.`id` }
  public var `expireAt`: Date { state.`expireAt` }
  public var `abandonAt`: Date { state.`abandonAt` }
  public var `factorVerificationAge`: PendingSessionFactorVerificationAgeValue? { state.`factorVerificationAge` }
  public var `lastActiveOrganizationId`: String? { state.`lastActiveOrganizationId` }
  public var `lastActiveAt`: Date { state.`lastActiveAt` }
  public var `actor`: [String: JSONValue]? { state.`actor` }
  public var `agent`: [String: JSONValue]? { state.`agent` }
  public var `tasks`: [SessionTask]? { state.`tasks` }
  public var `publicUserData`: PublicUserData { state.`publicUserData` }
  public var `createdAt`: Date { state.`createdAt` }
  public var `updatedAt`: Date { state.`updatedAt` }
  public func prepare(_ value: JSONValue) throws -> any Sendable { try PendingSessionState.decode(value, in: context.requireRuntime()) }
  public func encode() throws -> JSONValue { .object(["$ref": handle.json]) }
  public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PendingSession { try runtime.resource(ResourceHandle.decodeReference(value), as: PendingSession.self) }
  /// Marks the session as ended. The session will no longer be active for this `Client` and its status will become **ended**.
  public func `end`() async throws -> Session {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.end", arguments: []) { result in
      return try Session.decode(result, in: runtime)
    }
  }
  /// Invalidates the current session by marking it as removed. Once removed, the session will be deactivated for the current Client instance and its `status` will be set to `removed`. This operation cannot be undone.
  public func `remove`() async throws -> Session {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.remove", arguments: []) { result in
      return try Session.decode(result, in: runtime)
    }
  }
  /// Updates the session's last active timestamp to the current time. This method should be called periodically to indicate ongoing user activity and prevent the session from becoming stale. The updated timestamp is used for session management and analytics purposes.
  public func `touch`(_ `params`: SessionTouchParams? = nil) async throws -> Session {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.touch", arguments: [try `params`.map { value in try value.encode() } ?? .undefined]) { result in
      return try Session.decode(result, in: runtime)
    }
  }
  /// Gets the current user's [session token](https://clerk.com/docs/guides/sessions/session-tokens) or a [custom JWT template](https://clerk.com/docs/guides/sessions/jwt-templates).
  ///
  /// This method uses a cache so a network request will only be made if the token in memory has expired. The TTL for a Clerk token is one minute. It retries on transient failures (e.g., network errors); when the browser is offline and retries are exhausted, it throws `ClerkOfflineError`.
  ///
  /// Tokens can only be generated if the user is signed in.
  public func `getToken`(_ `options`: GetTokenOptions? = nil) async throws -> String? {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.getToken", arguments: [try `options`.map { value in try value.encode() } ?? .undefined]) { result in
      return try result.optional { value in try value.string() }
    }
  }
  /// Checks if the user is [authorized for the specified Role, Permission, Feature, or Plan](https://clerk.com/docs/guides/secure/authorization-checks) or requires the user to [reverify their credentials](https://clerk.com/docs/guides/secure/reverification) if their last verification is older than allowed.
  public func `checkAuthorization`(_ `isAuthorizedParams`: CheckAuthorizationParams) async throws -> Bool {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.checkAuthorization", arguments: [try `isAuthorizedParams`.encode()]) { result in
      return try result.bool()
    }
  }
  /// Clears the cache for the current session. This is useful if the session has been updated and the cache is no longer valid.
  public func `clearCache`() async throws {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.clearCache", arguments: []) { result in
      _ = result
    }
  }
  /// Initiates the reverification flow.
  public func `startVerification`(_ `params`: SessionVerifyCreateParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.startVerification", arguments: [try `params`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Initiates the [first factor verification](!first-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
  public func `prepareFirstFactorVerification`(_ `factor`: SessionVerifyPrepareFirstFactorParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.prepareFirstFactorVerification", arguments: [try `factor`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Attempts to complete the [first factor verification](!first-factor-verification) process.
  public func `attemptFirstFactorVerification`(_ `attemptFactor`: SessionVerifyAttemptFirstFactorParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.attemptFirstFactorVerification", arguments: [try `attemptFactor`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Initiates the [second factor verification](!second-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
  public func `prepareSecondFactorVerification`(_ `params`: PhoneCodeSecondFactorConfig) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.prepareSecondFactorVerification", arguments: [try `params`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Attempts to complete the [second factor verification](!second-factor-verification) process.
  public func `attemptSecondFactorVerification`(_ `params`: SessionVerifyAttemptSecondFactorParams) async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.attemptSecondFactorVerification", arguments: [try `params`.encode()]) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Initiates a verification flow using passkeys.
  public func `verifyWithPasskey`() async throws -> SessionVerification {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.verifyWithPasskey", arguments: []) { result in
      return try SessionVerification.decode(result, in: runtime)
    }
  }
  /// Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
  public func `reload`(_ `p`: ClerkResourceReloadParams? = nil) async throws -> PendingSession {
    let runtime = try context.requireRuntime()
    return try await runtime.invoke(owner: self, target: handle, operation: "PendingSession.reload", arguments: [try `p`.map { value in try value.encode() } ?? .undefined]) { result in
      return try PendingSession.decode(result, in: runtime)
    }
  }
}

public struct MobileSignOutOptions: Hashable, Sendable {
  public let `sessionId`: String?
  public init(`sessionId`: String? = nil) {
    self.`sessionId` = `sessionId`
  }
  @MainActor public func encode() throws -> JSONValue {
    let values: [String: JSONValue] = [
      "sessionId": try self.`sessionId`.map { value in .string(value) } ?? .undefined
    ]
    return .object(values.filter { !$0.value.isUndefined })
  }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> MobileSignOutOptions {
    let values = try value.object()

    return try MobileSignOutOptions(`sessionId`: try (values["sessionId"] ?? .undefined).optional { value in try value.string() })
  }
}

public struct SessionFactorVerificationAgeValue: Hashable, Sendable {
  public let item0: Double
  public let item1: Double
  public init(item0: Double, item1: Double) { self.item0 = item0; self.item1 = item1 }
  @MainActor public func encode() throws -> JSONValue { .array([.number(item0), .number(item1)]) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> SessionFactorVerificationAgeValue {
    let values = try value.array()
    guard values.count == 2 else { throw CoreError.invalidValue }
    return SessionFactorVerificationAgeValue(item0: try values[0].number(), item1: try values[1].number())
  }
}

public struct ActiveSessionFactorVerificationAgeValue: Hashable, Sendable {
  public let item0: Double
  public let item1: Double
  public init(item0: Double, item1: Double) { self.item0 = item0; self.item1 = item1 }
  @MainActor public func encode() throws -> JSONValue { .array([.number(item0), .number(item1)]) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> ActiveSessionFactorVerificationAgeValue {
    let values = try value.array()
    guard values.count == 2 else { throw CoreError.invalidValue }
    return ActiveSessionFactorVerificationAgeValue(item0: try values[0].number(), item1: try values[1].number())
  }
}

public struct PendingSessionFactorVerificationAgeValue: Hashable, Sendable {
  public let item0: Double
  public let item1: Double
  public init(item0: Double, item1: Double) { self.item0 = item0; self.item1 = item1 }
  @MainActor public func encode() throws -> JSONValue { .array([.number(item0), .number(item1)]) }
  @MainActor public static func decode(_ value: JSONValue, in runtime: CoreRuntime) throws -> PendingSessionFactorVerificationAgeValue {
    let values = try value.array()
    guard values.count == 2 else { throw CoreError.invalidValue }
    return PendingSessionFactorVerificationAgeValue(item0: try values[0].number(), item1: try values[1].number())
  }
}

@MainActor public enum GeneratedBindings {
  public static let contractHash = "fc919ded53c772af190eb2a07f5fdec94a7f1f47fbc2b04b4a3ab76c4d39bf16"
  public static let protocolVersion = 1
  public static func makeResource(_ handle: ResourceHandle, runtime: CoreRuntime) throws -> any CoreResource {
    switch handle.type {
    case "Clerk": return Clerk(handle: handle, runtime: runtime)
    case "TelemetryCollector": return TelemetryCollector(handle: handle, runtime: runtime)
    case "Organization": return Organization(handle: handle, runtime: runtime)
    case "OrganizationMembership": return OrganizationMembership(handle: handle, runtime: runtime)
    case "OrganizationInvitation": return OrganizationInvitation(handle: handle, runtime: runtime)
    case "Role": return Role(handle: handle, runtime: runtime)
    case "Permission": return Permission(handle: handle, runtime: runtime)
    case "OrganizationDomain": return OrganizationDomain(handle: handle, runtime: runtime)
    case "OrganizationMembershipRequest": return OrganizationMembershipRequest(handle: handle, runtime: runtime)
    case "EnterpriseConnection": return EnterpriseConnection(handle: handle, runtime: runtime)
    case "EnterpriseConnectionTestRun": return EnterpriseConnectionTestRun(handle: handle, runtime: runtime)
    case "BillingInitializedPaymentMethod": return BillingInitializedPaymentMethod(handle: handle, runtime: runtime)
    case "BillingPaymentMethod": return BillingPaymentMethod(handle: handle, runtime: runtime)
    case "Session": return Session(handle: handle, runtime: runtime)
    case "User": return User(handle: handle, runtime: runtime)
    case "EmailAddress": return EmailAddress(handle: handle, runtime: runtime)
    case "Verification": return Verification(handle: handle, runtime: runtime)
    case "IdentificationLink": return IdentificationLink(handle: handle, runtime: runtime)
    case "CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress": return CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress(handle: handle, runtime: runtime)
    case "CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress": return CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress(handle: handle, runtime: runtime)
    case "PhoneNumber": return PhoneNumber(handle: handle, runtime: runtime)
    case "Web3Wallet": return Web3Wallet(handle: handle, runtime: runtime)
    case "ExternalAccount": return ExternalAccount(handle: handle, runtime: runtime)
    case "EnterpriseAccount": return EnterpriseAccount(handle: handle, runtime: runtime)
    case "EnterpriseAccountConnection": return EnterpriseAccountConnection(handle: handle, runtime: runtime)
    case "Passkey": return Passkey(handle: handle, runtime: runtime)
    case "PasskeyVerification": return PasskeyVerification(handle: handle, runtime: runtime)
    case "SessionWithActivities": return SessionWithActivities(handle: handle, runtime: runtime)
    case "ImageResource": return ImageResource(handle: handle, runtime: runtime)
    case "UserOrganizationInvitation": return UserOrganizationInvitation(handle: handle, runtime: runtime)
    case "OrganizationSuggestion": return OrganizationSuggestion(handle: handle, runtime: runtime)
    case "OrganizationCreationDefaults": return OrganizationCreationDefaults(handle: handle, runtime: runtime)
    case "SessionVerification": return SessionVerification(handle: handle, runtime: runtime)
    case "EnvironmentResource": return EnvironmentResource(handle: handle, runtime: runtime)
    case "BiometricCredentials": return BiometricCredentials(handle: handle, runtime: runtime)
    case "SignIn": return SignIn(handle: handle, runtime: runtime)
    case "SignInEmailCode": return SignInEmailCode(handle: handle, runtime: runtime)
    case "SignInEmailLink": return SignInEmailLink(handle: handle, runtime: runtime)
    case "SignInPhoneCode": return SignInPhoneCode(handle: handle, runtime: runtime)
    case "SignInResetPasswordEmailCode": return SignInResetPasswordEmailCode(handle: handle, runtime: runtime)
    case "SignInResetPasswordPhoneCode": return SignInResetPasswordPhoneCode(handle: handle, runtime: runtime)
    case "SignInMfa": return SignInMfa(handle: handle, runtime: runtime)
    case "SignUp": return SignUp(handle: handle, runtime: runtime)
    case "SignUpVerifications": return SignUpVerifications(handle: handle, runtime: runtime)
    case "SignUpVerification": return SignUpVerification(handle: handle, runtime: runtime)
    case "ActiveSession": return ActiveSession(handle: handle, runtime: runtime)
    case "PendingSession": return PendingSession(handle: handle, runtime: runtime)
    default: throw CoreError.invalidResource
    }
  }
}
