// Generated from TypeScript. Do not edit.
@file:Suppress("RedundantVisibilityModifier", "UNUSED_PARAMETER", "UNUSED_VARIABLE")
package com.clerk.api

import java.net.URI
import java.time.Instant
import java.util.Base64
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.*

public data class ClerkState(public val `status`: ClerkStatus, public val `telemetry`: TelemetryCollector? = null, public val `loaded`: Boolean, public val `sessions`: List<Session>, public val `lastAuthenticationStrategy`: LastAuthenticationStrategy?, public val `environment`: EnvironmentResource, public val `session`: Session?, public val `user`: User?, public val `organization`: Organization?, public val `clientId`: String?, public val `biometricCredentials`: BiometricCredentials, public val `authCallback`: MobileAuthCallback?, public val `signIn`: SignIn, public val `signUp`: SignUp) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("status", this@ClerkState.`status`.toJson())
    putPresent("telemetry", this@ClerkState.`telemetry`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("loaded", JsonPrimitive(this@ClerkState.`loaded`))
    putPresent("sessions", JsonArray(this@ClerkState.`sessions`.map { value -> value.toJson() }))
    putPresent("lastAuthenticationStrategy", this@ClerkState.`lastAuthenticationStrategy`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("environment", this@ClerkState.`environment`.toJson())
    putPresent("session", this@ClerkState.`session`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("user", this@ClerkState.`user`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("organization", this@ClerkState.`organization`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("clientId", this@ClerkState.`clientId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("biometricCredentials", this@ClerkState.`biometricCredentials`.toJson())
    putPresent("authCallback", this@ClerkState.`authCallback`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("signIn", this@ClerkState.`signIn`.toJson())
    putPresent("signUp", this@ClerkState.`signUp`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkState {
      val values = value.jsonObject

      return ClerkState(`status` = ClerkStatus.fromJson((values["status"] ?: Undefined), runtime), `telemetry` = (values["telemetry"] ?: Undefined).decodeOptional { value -> TelemetryCollector.fromJson(value, runtime) }, `loaded` = (values["loaded"] ?: Undefined).requireBoolean(), `sessions` = (values["sessions"] ?: Undefined).jsonArray.map { value -> Session.fromJson(value, runtime) }, `lastAuthenticationStrategy` = (values["lastAuthenticationStrategy"] ?: Undefined).decodeOptional { value -> LastAuthenticationStrategy.fromJson(value, runtime) }, `environment` = EnvironmentResource.fromJson((values["environment"] ?: Undefined), runtime), `session` = (values["session"] ?: Undefined).decodeOptional { value -> Session.fromJson(value, runtime) }, `user` = (values["user"] ?: Undefined).decodeOptional { value -> User.fromJson(value, runtime) }, `organization` = (values["organization"] ?: Undefined).decodeOptional { value -> Organization.fromJson(value, runtime) }, `clientId` = (values["clientId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `biometricCredentials` = BiometricCredentials.fromJson((values["biometricCredentials"] ?: Undefined), runtime), `authCallback` = (values["authCallback"] ?: Undefined).decodeOptional { value -> MobileAuthCallback.fromJson(value, runtime) }, `signIn` = SignIn.fromJson((values["signIn"] ?: Undefined), runtime), `signUp` = SignUp.fromJson((values["signUp"] ?: Undefined), runtime))
    }
  }
}
public class Clerk(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, true)
  public val state: ClerkState get() = context.state(handle)
  public val changes: Flow<ClerkState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `status`: ClerkStatus get() = state.`status`
  public val `telemetry`: TelemetryCollector? get() = state.`telemetry`
  public val `loaded`: Boolean get() = state.`loaded`
  public val `sessions`: List<Session> get() = state.`sessions`
  public val `lastAuthenticationStrategy`: LastAuthenticationStrategy? get() = state.`lastAuthenticationStrategy`
  public val `environment`: EnvironmentResource get() = state.`environment`
  public val `session`: Session? get() = state.`session`
  public val `user`: User? get() = state.`user`
  public val `organization`: Organization? get() = state.`organization`
  public val `clientId`: String? get() = state.`clientId`
  public val `biometricCredentials`: BiometricCredentials get() = state.`biometricCredentials`
  public val `authCallback`: MobileAuthCallback? get() = state.`authCallback`
  public val `signIn`: SignIn get() = state.`signIn`
  public val `signUp`: SignUp get() = state.`signUp`
  override fun prepare(value: JsonElement): Any = ClerkState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Clerk = runtime.resource(ResourceHandle.fromReference(value)) as Clerk
  }
  /**
   * Creates an Organization programmatically, adding the current user as admin. Returns an [`Organization`](https://clerk.com/docs/reference/objects/organization) object.
   *
   * > [!NOTE]
   * > For React-based apps, consider using the [`<CreateOrganization />`](https://clerk.com/docs/reference/components/organization/create-organization) component.
   */
  public suspend fun `createOrganization`(`params`: CreateOrganizationParams): Organization {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Clerk.createOrganization", listOf(`params`.toJson())) { result ->
      Organization.fromJson(result, runtime)
    }
  }
  /**
   * Gets a single [Organization](https://clerk.com/docs/reference/objects/organization) by ID.
   */
  public suspend fun `getOrganization`(`organizationId`: String): Organization {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Clerk.getOrganization", listOf(JsonPrimitive(`organizationId`))) { result ->
      Organization.fromJson(result, runtime)
    }
  }
  public suspend fun `handleAuthCallback`(`url`: URI): MobileAuthenticationResult? {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Clerk.handleAuthCallback", listOf(JsonPrimitive(`url`.toString()))) { result ->
      result.decodeOptional { value -> MobileAuthenticationResult.fromJson(value, runtime) }
    }
  }
  public suspend fun `clearAuthCallback`(`id`: Double): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Clerk.clearAuthCallback", listOf(JsonPrimitive(`id`))) { result ->
      Unit
    }
  }
  public suspend fun `authenticateWithSSO`(`params`: MobileSSOParams): MobileAuthenticationResult {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Clerk.authenticateWithSSO", listOf(`params`.toJson())) { result ->
      MobileAuthenticationResult.fromJson(result, runtime)
    }
  }
  public suspend fun `startAuthentication`(`params`: MobileIdentifierParams): MobileAuthenticationResult {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Clerk.startAuthentication", listOf(`params`.toJson())) { result ->
      MobileAuthenticationResult.fromJson(result, runtime)
    }
  }
  public suspend fun `setActive`(`params`: MobileSetActiveParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Clerk.setActive", listOf(`params`.toJson())) { result ->
      Unit
    }
  }
  public suspend fun `signOut`(`options`: MobileSignOutOptions? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Clerk.signOut", listOf(`options`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Unit
    }
  }
}

public sealed class ClerkStatus(public val rawValue: String) {
  public data object Degraded : ClerkStatus("degraded")
  public data object Error : ClerkStatus("error")
  public data object Loading : ClerkStatus("loading")
  public data object Ready : ClerkStatus("ready")
  public data class Unrecognized(val value: String) : ClerkStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkStatus = when (val raw = value.requireString()) {
      "degraded" -> Degraded
      "error" -> Error
      "loading" -> Loading
      "ready" -> Ready
      else -> Unrecognized(raw)
    }
  }
}

public data class TelemetryCollectorState(public val `isEnabled`: Boolean, public val `isDebug`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("isEnabled", JsonPrimitive(this@TelemetryCollectorState.`isEnabled`))
    putPresent("isDebug", JsonPrimitive(this@TelemetryCollectorState.`isDebug`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): TelemetryCollectorState {
      val values = value.jsonObject

      return TelemetryCollectorState(`isEnabled` = (values["isEnabled"] ?: Undefined).requireBoolean(), `isDebug` = (values["isDebug"] ?: Undefined).requireBoolean())
    }
  }
}
public class TelemetryCollector(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: TelemetryCollectorState get() = context.state(handle)
  public val changes: Flow<TelemetryCollectorState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `isEnabled`: Boolean get() = state.`isEnabled`
  public val `isDebug`: Boolean get() = state.`isDebug`
  override fun prepare(value: JsonElement): Any = TelemetryCollectorState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): TelemetryCollector = runtime.resource(ResourceHandle.fromReference(value)) as TelemetryCollector
  }
  /**
   * Records a telemetry event.
   */
  public suspend fun `record`(`event`: TelemetryEventRawRecord): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "TelemetryCollector.record", listOf(`event`.toJson())) { result ->
      Unit
    }
  }
  /**
   * Records a telemetry log entry.
   */
  public suspend fun `recordLog`(`entry`: TelemetryLogEntry): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "TelemetryCollector.recordLog", listOf(`entry`.toJson())) { result ->
      Unit
    }
  }
}

public data class TelemetryEventRawRecord(public val `event`: String, public val `eventSamplingRate`: Double? = null, public val `payload`: JsonObject) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("event", JsonPrimitive(this@TelemetryEventRawRecord.`event`))
    putPresent("eventSamplingRate", this@TelemetryEventRawRecord.`eventSamplingRate`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("payload", this@TelemetryEventRawRecord.`payload`)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): TelemetryEventRawRecord {
      val values = value.jsonObject

      return TelemetryEventRawRecord(`event` = (values["event"] ?: Undefined).requireString(), `eventSamplingRate` = (values["eventSamplingRate"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `payload` = (values["payload"] ?: Undefined).jsonObject)
    }
  }
}

/**
 * Debug log entry interface for telemetry collector
 */
public data class TelemetryLogEntry(public val `context`: JsonObject? = null, public val `level`: TelemetryLogEntryLevel, public val `message`: String, public val `organizationId`: String? = null, public val `sessionId`: String? = null, public val `source`: String? = null, public val `timestamp`: Double, public val `userId`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("context", this@TelemetryLogEntry.`context`?.let { value -> value } ?: Undefined)
    putPresent("level", this@TelemetryLogEntry.`level`.toJson())
    putPresent("message", JsonPrimitive(this@TelemetryLogEntry.`message`))
    putPresent("organizationId", this@TelemetryLogEntry.`organizationId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("sessionId", this@TelemetryLogEntry.`sessionId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("source", this@TelemetryLogEntry.`source`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("timestamp", JsonPrimitive(this@TelemetryLogEntry.`timestamp`))
    putPresent("userId", this@TelemetryLogEntry.`userId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): TelemetryLogEntry {
      val values = value.jsonObject

      return TelemetryLogEntry(`context` = (values["context"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `level` = TelemetryLogEntryLevel.fromJson((values["level"] ?: Undefined), runtime), `message` = (values["message"] ?: Undefined).requireString(), `organizationId` = (values["organizationId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `sessionId` = (values["sessionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `source` = (values["source"] ?: Undefined).decodeOptional { value -> value.requireString() }, `timestamp` = (values["timestamp"] ?: Undefined).requireDouble(), `userId` = (values["userId"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public sealed class TelemetryLogEntryLevel(public val rawValue: String) {
  public data object Info : TelemetryLogEntryLevel("info")
  public data object Error : TelemetryLogEntryLevel("error")
  public data object Warn : TelemetryLogEntryLevel("warn")
  public data object Debug : TelemetryLogEntryLevel("debug")
  public data object Trace : TelemetryLogEntryLevel("trace")
  public data class Unrecognized(val value: String) : TelemetryLogEntryLevel(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): TelemetryLogEntryLevel = when (val raw = value.requireString()) {
      "info" -> Info
      "error" -> Error
      "warn" -> Warn
      "debug" -> Debug
      "trace" -> Trace
      else -> Unrecognized(raw)
    }
  }
}

public data class CreateOrganizationParams(public val `name`: String, public val `slug`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("name", JsonPrimitive(this@CreateOrganizationParams.`name`))
    putPresent("slug", this@CreateOrganizationParams.`slug`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreateOrganizationParams {
      val values = value.jsonObject

      return CreateOrganizationParams(`name` = (values["name"] ?: Undefined).requireString(), `slug` = (values["slug"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

/**
 * The `Organization` object holds information about an Organization, as well as methods for managing it.
 *
 * To use these methods, you must have the **Organizations** feature [enabled in your app's settings in the Clerk Dashboard](https://clerk.com/docs/guides/organizations/configure#enable-organizations).
 */
public data class OrganizationState(public val `id`: String, public val `name`: String, public val `slug`: String?, public val `imageUrl`: String, public val `hasImage`: Boolean, public val `membersCount`: Double, public val `pendingInvitationsCount`: Double, public val `publicMetadata`: JsonObject, public val `adminDeleteEnabled`: Boolean, public val `maxAllowedMemberships`: Double, public val `selfServeSSOEnabled`: Boolean, public val `exclusiveMembership`: Boolean, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@OrganizationState.`id`))
    putPresent("name", JsonPrimitive(this@OrganizationState.`name`))
    putPresent("slug", this@OrganizationState.`slug`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("imageUrl", JsonPrimitive(this@OrganizationState.`imageUrl`))
    putPresent("hasImage", JsonPrimitive(this@OrganizationState.`hasImage`))
    putPresent("membersCount", JsonPrimitive(this@OrganizationState.`membersCount`))
    putPresent("pendingInvitationsCount", JsonPrimitive(this@OrganizationState.`pendingInvitationsCount`))
    putPresent("publicMetadata", this@OrganizationState.`publicMetadata`)
    putPresent("adminDeleteEnabled", JsonPrimitive(this@OrganizationState.`adminDeleteEnabled`))
    putPresent("maxAllowedMemberships", JsonPrimitive(this@OrganizationState.`maxAllowedMemberships`))
    putPresent("selfServeSSOEnabled", JsonPrimitive(this@OrganizationState.`selfServeSSOEnabled`))
    putPresent("exclusiveMembership", JsonPrimitive(this@OrganizationState.`exclusiveMembership`))
    putPresent("createdAt", JsonPrimitive(this@OrganizationState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@OrganizationState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationState {
      val values = value.jsonObject

      return OrganizationState(`id` = (values["id"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).requireString(), `slug` = (values["slug"] ?: Undefined).decodeOptional { value -> value.requireString() }, `imageUrl` = (values["imageUrl"] ?: Undefined).requireString(), `hasImage` = (values["hasImage"] ?: Undefined).requireBoolean(), `membersCount` = (values["membersCount"] ?: Undefined).requireDouble(), `pendingInvitationsCount` = (values["pendingInvitationsCount"] ?: Undefined).requireDouble(), `publicMetadata` = (values["publicMetadata"] ?: Undefined).jsonObject, `adminDeleteEnabled` = (values["adminDeleteEnabled"] ?: Undefined).requireBoolean(), `maxAllowedMemberships` = (values["maxAllowedMemberships"] ?: Undefined).requireDouble(), `selfServeSSOEnabled` = (values["selfServeSSOEnabled"] ?: Undefined).requireBoolean(), `exclusiveMembership` = (values["exclusiveMembership"] ?: Undefined).requireBoolean(), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class Organization(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: OrganizationState get() = context.state(handle)
  public val changes: Flow<OrganizationState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `name`: String get() = state.`name`
  public val `slug`: String? get() = state.`slug`
  public val `imageUrl`: String get() = state.`imageUrl`
  public val `hasImage`: Boolean get() = state.`hasImage`
  public val `membersCount`: Double get() = state.`membersCount`
  public val `pendingInvitationsCount`: Double get() = state.`pendingInvitationsCount`
  public val `publicMetadata`: JsonObject get() = state.`publicMetadata`
  public val `adminDeleteEnabled`: Boolean get() = state.`adminDeleteEnabled`
  public val `maxAllowedMemberships`: Double get() = state.`maxAllowedMemberships`
  public val `selfServeSSOEnabled`: Boolean get() = state.`selfServeSSOEnabled`
  public val `exclusiveMembership`: Boolean get() = state.`exclusiveMembership`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = OrganizationState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Organization = runtime.resource(ResourceHandle.fromReference(value)) as Organization
  }
  /**
   * Updates the current Organization.
   */
  public suspend fun `update`(`params`: UpdateOrganizationParams): Organization {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.update", listOf(`params`.toJson())) { result ->
      Organization.fromJson(result, runtime)
    }
  }
  /**
   * Gets the list of Organization Memberships.
   */
  public suspend fun `getMemberships`(`params`: GetMembersParams? = null): ClerkPaginatedResponseOrganizationMembership {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.getMemberships", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ClerkPaginatedResponseOrganizationMembership.fromJson(result, runtime)
    }
  }
  /**
   * Gets the list of invitations.
   */
  public suspend fun `getInvitations`(`params`: GetInvitationsParams? = null): ClerkPaginatedResponseOrganizationInvitation {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.getInvitations", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ClerkPaginatedResponseOrganizationInvitation.fromJson(result, runtime)
    }
  }
  /**
   * Gets the list of [Roles](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) available.
   */
  public suspend fun `getRoles`(`params`: GetRolesParams? = null): GetRolesResponse {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.getRoles", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      GetRolesResponse.fromJson(result, runtime)
    }
  }
  /**
   * Gets the list of domains.
   */
  public suspend fun `getDomains`(`params`: GetDomainsParams? = null): ClerkPaginatedResponseOrganizationDomain {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.getDomains", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ClerkPaginatedResponseOrganizationDomain.fromJson(result, runtime)
    }
  }
  /**
   * Gets the list of membership requests.
   */
  public suspend fun `getMembershipRequests`(`params`: GetMembershipRequestParams? = null): ClerkPaginatedResponseOrganizationMembershipRequest {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.getMembershipRequests", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ClerkPaginatedResponseOrganizationMembershipRequest.fromJson(result, runtime)
    }
  }
  /**
   * Adds a user as a member to an organization. A user can only be added to an organization if they are not already a member of it and if they already exist in the same instance as the organization. Only administrators can add members to an organization.
   */
  public suspend fun `addMember`(`params`: AddMemberParams): OrganizationMembership {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.addMember", listOf(`params`.toJson())) { result ->
      OrganizationMembership.fromJson(result, runtime)
    }
  }
  /**
   * Creates and sends an invitation to the given email address.
   */
  public suspend fun `inviteMember`(`params`: InviteMemberParams): OrganizationInvitation {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.inviteMember", listOf(`params`.toJson())) { result ->
      OrganizationInvitation.fromJson(result, runtime)
    }
  }
  /**
   * Creates and sends invitations to the given email addresses.
   */
  public suspend fun `inviteMembers`(`params`: InviteMembersParams): List<OrganizationInvitation> {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.inviteMembers", listOf(`params`.toJson())) { result ->
      result.jsonArray.map { value -> OrganizationInvitation.fromJson(value, runtime) }
    }
  }
  /**
   * Updates a given member.
   */
  public suspend fun `updateMember`(`params`: UpdateMembershipParams): OrganizationMembership {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.updateMember", listOf(`params`.toJson())) { result ->
      OrganizationMembership.fromJson(result, runtime)
    }
  }
  /**
   * Removes a member.
   */
  public suspend fun `removeMember`(`userId`: String): OrganizationMembership {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.removeMember", listOf(JsonPrimitive(`userId`))) { result ->
      OrganizationMembership.fromJson(result, runtime)
    }
  }
  /**
   * Creates a new domain.
   */
  public suspend fun `createDomain`(`domainName`: String, `params`: PickCreateOrganizationDomainParamsAndenrollmentMode? = null): OrganizationDomain {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.createDomain", listOf(JsonPrimitive(`domainName`), `params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      OrganizationDomain.fromJson(result, runtime)
    }
  }
  /**
   * Starts the verification process of multiple [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) at once by issuing a fresh TXT challenge for each of the given domains in a single request. Each resolved domain's `ownershipVerification` property carries the `txtRecordName` and `txtRecordValue` the Organization [admin](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) must publish. A single bad domain does not fail the batch; it lands in the returned [`OrganizationDomainsBulkOwnershipVerificationResource`](https://clerk.com/docs/reference/types/organization-domains-bulk-ownership-verification-resource) object's `errors` array.
   */
  public suspend fun `prepareOwnershipVerification`(`domainIds`: List<String>): OrganizationDomainsBulkOwnershipVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.prepareOwnershipVerification", listOf(JsonArray(`domainIds`.map { value -> JsonPrimitive(value) }))) { result ->
      OrganizationDomainsBulkOwnershipVerification.fromJson(result, runtime)
    }
  }
  /**
   * Completes the verification process started by [`prepareOwnershipVerification()`](https://clerk.com/docs/reference/objects/organization#prepare-ownership-verification), by resolving the published TXT record for each of the given domains in a single request. A single bad domain does not fail the batch; it lands in the returned [`OrganizationDomainsBulkOwnershipVerificationResource`](https://clerk.com/docs/reference/types/organization-domains-bulk-ownership-verification-resource) object's `errors` array.
   */
  public suspend fun `attemptOwnershipVerification`(`domainIds`: List<String>): OrganizationDomainsBulkOwnershipVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.attemptOwnershipVerification", listOf(JsonArray(`domainIds`.map { value -> JsonPrimitive(value) }))) { result ->
      OrganizationDomainsBulkOwnershipVerification.fromJson(result, runtime)
    }
  }
  /**
   * Gets a domain for an Organization based on the given domain ID.
   */
  public suspend fun `getDomain`(`value0`: OrganizationGetDomain__0): OrganizationDomain {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.getDomain", listOf(`value0`.toJson())) { result ->
      OrganizationDomain.fromJson(result, runtime)
    }
  }
  public suspend fun `getEnterpriseConnections`(`params`: GetEnterpriseConnectionsParams? = null): List<EnterpriseConnection> {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.getEnterpriseConnections", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      result.jsonArray.map { value -> EnterpriseConnection.fromJson(value, runtime) }
    }
  }
  public suspend fun `createEnterpriseConnection`(`params`: CreateOrganizationEnterpriseConnectionParams): EnterpriseConnection {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.createEnterpriseConnection", listOf(`params`.toJson())) { result ->
      EnterpriseConnection.fromJson(result, runtime)
    }
  }
  public suspend fun `updateEnterpriseConnection`(`enterpriseConnectionId`: String, `params`: UpdateOrganizationEnterpriseConnectionParams): EnterpriseConnection {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.updateEnterpriseConnection", listOf(JsonPrimitive(`enterpriseConnectionId`), `params`.toJson())) { result ->
      EnterpriseConnection.fromJson(result, runtime)
    }
  }
  public suspend fun `deleteEnterpriseConnection`(`enterpriseConnectionId`: String): DeletedObject {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.deleteEnterpriseConnection", listOf(JsonPrimitive(`enterpriseConnectionId`))) { result ->
      DeletedObject.fromJson(result, runtime)
    }
  }
  public suspend fun `createEnterpriseConnectionTestRun`(`enterpriseConnectionId`: String): EnterpriseConnectionTestRunInit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.createEnterpriseConnectionTestRun", listOf(JsonPrimitive(`enterpriseConnectionId`))) { result ->
      EnterpriseConnectionTestRunInit.fromJson(result, runtime)
    }
  }
  public suspend fun `getEnterpriseConnectionTestRuns`(`enterpriseConnectionId`: String, `params`: GetEnterpriseConnectionTestRunsParams? = null): ClerkPaginatedResponseEnterpriseConnectionTestRun {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.getEnterpriseConnectionTestRuns", listOf(JsonPrimitive(`enterpriseConnectionId`), `params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ClerkPaginatedResponseEnterpriseConnectionTestRun.fromJson(result, runtime)
    }
  }
  /**
   * Deletes the Organization. Only administrators can delete an Organization.
   *
   * Deleting an Organization will also delete all memberships and invitations. **This is not reversible.**
   */
  public suspend fun `destroy`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.destroy", listOf()) { result ->
      Unit
    }
  }
  /**
   * Sets or replaces an Organization's logo.
   */
  public suspend fun `setLogo`(`params`: SetOrganizationLogoParams): Organization {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.setLogo", listOf(`params`.toJson())) { result ->
      Organization.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): Organization {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Organization.fromJson(result, runtime)
    }
  }
  /**
   * Initializes a payment method.
   */
  public suspend fun `initializePaymentMethod`(`params`: InitializePaymentMethodParams): BillingInitializedPaymentMethod {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.initializePaymentMethod", listOf(`params`.toJson())) { result ->
      BillingInitializedPaymentMethod.fromJson(result, runtime)
    }
  }
  /**
   * Adds a payment method.
   */
  public suspend fun `addPaymentMethod`(`params`: AddPaymentMethodParams): BillingPaymentMethod {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.addPaymentMethod", listOf(`params`.toJson())) { result ->
      BillingPaymentMethod.fromJson(result, runtime)
    }
  }
  /**
   * Gets a list of payment methods that have been stored.
   */
  public suspend fun `getPaymentMethods`(`params`: GetPaymentMethodsParams? = null): ClerkPaginatedResponseBillingPaymentMethod {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Organization.getPaymentMethods", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ClerkPaginatedResponseBillingPaymentMethod.fromJson(result, runtime)
    }
  }
}

public data class UpdateOrganizationParams(public val `name`: String, public val `slug`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("name", JsonPrimitive(this@UpdateOrganizationParams.`name`))
    putPresent("slug", this@UpdateOrganizationParams.`slug`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UpdateOrganizationParams {
      val values = value.jsonObject

      return UpdateOrganizationParams(`name` = (values["name"] ?: Undefined).requireString(), `slug` = (values["slug"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class GetMembersParams(public val `initialPage`: Double? = null, public val `pageSize`: Double? = null, public val `role`: List<String>? = null, public val `query`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("initialPage", this@GetMembersParams.`initialPage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("pageSize", this@GetMembersParams.`pageSize`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("role", this@GetMembersParams.`role`?.let { value -> JsonArray(value.map { value -> JsonPrimitive(value) }) } ?: Undefined)
    putPresent("query", this@GetMembersParams.`query`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetMembersParams {
      val values = value.jsonObject

      return GetMembersParams(`initialPage` = (values["initialPage"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `pageSize` = (values["pageSize"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `role` = (values["role"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> value.requireString() } }, `query` = (values["query"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

/**
 * An interface that describes the response of a method that returns a paginated list of resources.
 *
 * > [!TIP]
 * > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
 */
public data class ClerkPaginatedResponseOrganizationMembership(public val `data`: List<OrganizationMembership>, public val `totalCount`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("data", JsonArray(this@ClerkPaginatedResponseOrganizationMembership.`data`.map { value -> value.toJson() }))
    putPresent("total_count", JsonPrimitive(this@ClerkPaginatedResponseOrganizationMembership.`totalCount`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkPaginatedResponseOrganizationMembership {
      val values = value.jsonObject

      return ClerkPaginatedResponseOrganizationMembership(`data` = (values["data"] ?: Undefined).jsonArray.map { value -> OrganizationMembership.fromJson(value, runtime) }, `totalCount` = (values["total_count"] ?: Undefined).requireDouble())
    }
  }
}

/**
 * The `OrganizationMembership` object is the model around a user's membership in an Organization.
 */
public data class OrganizationMembershipState(public val `id`: String, public val `organization`: Organization, public val `permissions`: List<String>, public val `publicMetadata`: JsonObject, public val `publicUserData`: PublicUserData? = null, public val `role`: String, public val `roleName`: String, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@OrganizationMembershipState.`id`))
    putPresent("organization", this@OrganizationMembershipState.`organization`.toJson())
    putPresent("permissions", JsonArray(this@OrganizationMembershipState.`permissions`.map { value -> JsonPrimitive(value) }))
    putPresent("publicMetadata", this@OrganizationMembershipState.`publicMetadata`)
    putPresent("publicUserData", this@OrganizationMembershipState.`publicUserData`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("role", JsonPrimitive(this@OrganizationMembershipState.`role`))
    putPresent("roleName", JsonPrimitive(this@OrganizationMembershipState.`roleName`))
    putPresent("createdAt", JsonPrimitive(this@OrganizationMembershipState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@OrganizationMembershipState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationMembershipState {
      val values = value.jsonObject

      return OrganizationMembershipState(`id` = (values["id"] ?: Undefined).requireString(), `organization` = Organization.fromJson((values["organization"] ?: Undefined), runtime), `permissions` = (values["permissions"] ?: Undefined).jsonArray.map { value -> value.requireString() }, `publicMetadata` = (values["publicMetadata"] ?: Undefined).jsonObject, `publicUserData` = (values["publicUserData"] ?: Undefined).decodeOptional { value -> PublicUserData.fromJson(value, runtime) }, `role` = (values["role"] ?: Undefined).requireString(), `roleName` = (values["roleName"] ?: Undefined).requireString(), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class OrganizationMembership(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: OrganizationMembershipState get() = context.state(handle)
  public val changes: Flow<OrganizationMembershipState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `organization`: Organization get() = state.`organization`
  public val `permissions`: List<String> get() = state.`permissions`
  public val `publicMetadata`: JsonObject get() = state.`publicMetadata`
  public val `publicUserData`: PublicUserData? get() = state.`publicUserData`
  public val `role`: String get() = state.`role`
  public val `roleName`: String get() = state.`roleName`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = OrganizationMembershipState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationMembership = runtime.resource(ResourceHandle.fromReference(value)) as OrganizationMembership
  }
  /**
   * Deletes the membership, removing the user from the Organization.
   */
  public suspend fun `destroy`(): OrganizationMembership {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationMembership.destroy", listOf()) { result ->
      OrganizationMembership.fromJson(result, runtime)
    }
  }
  /**
   * Updates the member's [Role](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions) in the Organization.
   */
  public suspend fun `update`(`updateParams`: UpdateOrganizationMembershipParams): OrganizationMembership {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationMembership.update", listOf(`updateParams`.toJson())) { result ->
      OrganizationMembership.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): OrganizationMembership {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationMembership.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      OrganizationMembership.fromJson(result, runtime)
    }
  }
}

/**
 * Information about the user that's publicly available.
 */
public data class PublicUserData(public val `firstName`: String?, public val `lastName`: String?, public val `imageUrl`: String, public val `hasImage`: Boolean, public val `identifier`: String, public val `userId`: String? = null, public val `username`: String? = null, public val `banned`: Boolean? = null, public val `deprovisioned`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("firstName", this@PublicUserData.`firstName`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("lastName", this@PublicUserData.`lastName`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("imageUrl", JsonPrimitive(this@PublicUserData.`imageUrl`))
    putPresent("hasImage", JsonPrimitive(this@PublicUserData.`hasImage`))
    putPresent("identifier", JsonPrimitive(this@PublicUserData.`identifier`))
    putPresent("userId", this@PublicUserData.`userId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("username", this@PublicUserData.`username`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("banned", this@PublicUserData.`banned`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("deprovisioned", this@PublicUserData.`deprovisioned`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PublicUserData {
      val values = value.jsonObject

      return PublicUserData(`firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `imageUrl` = (values["imageUrl"] ?: Undefined).requireString(), `hasImage` = (values["hasImage"] ?: Undefined).requireBoolean(), `identifier` = (values["identifier"] ?: Undefined).requireString(), `userId` = (values["userId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `username` = (values["username"] ?: Undefined).decodeOptional { value -> value.requireString() }, `banned` = (values["banned"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `deprovisioned` = (values["deprovisioned"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public data class UpdateOrganizationMembershipParams(public val `role`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("role", JsonPrimitive(this@UpdateOrganizationMembershipParams.`role`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UpdateOrganizationMembershipParams {
      val values = value.jsonObject

      return UpdateOrganizationMembershipParams(`role` = (values["role"] ?: Undefined).requireString())
    }
  }
}

public data class ClerkResourceReloadParams(public val `rotatingTokenNonce`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("rotatingTokenNonce", this@ClerkResourceReloadParams.`rotatingTokenNonce`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkResourceReloadParams {
      val values = value.jsonObject

      return ClerkResourceReloadParams(`rotatingTokenNonce` = (values["rotatingTokenNonce"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class GetInvitationsParams(public val `initialPage`: Double? = null, public val `pageSize`: Double? = null, public val `status`: List<OrganizationInvitationStatus>? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("initialPage", this@GetInvitationsParams.`initialPage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("pageSize", this@GetInvitationsParams.`pageSize`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("status", this@GetInvitationsParams.`status`?.let { value -> JsonArray(value.map { value -> value.toJson() }) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetInvitationsParams {
      val values = value.jsonObject

      return GetInvitationsParams(`initialPage` = (values["initialPage"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `pageSize` = (values["pageSize"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `status` = (values["status"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> OrganizationInvitationStatus.fromJson(value, runtime) } })
    }
  }
}

public sealed class OrganizationInvitationStatus(public val rawValue: String) {
  public data object Expired : OrganizationInvitationStatus("expired")
  public data object Accepted : OrganizationInvitationStatus("accepted")
  public data object Pending : OrganizationInvitationStatus("pending")
  public data object Revoked : OrganizationInvitationStatus("revoked")
  public data class Unrecognized(val value: String) : OrganizationInvitationStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationInvitationStatus = when (val raw = value.requireString()) {
      "expired" -> Expired
      "accepted" -> Accepted
      "pending" -> Pending
      "revoked" -> Revoked
      else -> Unrecognized(raw)
    }
  }
}

/**
 * An interface that describes the response of a method that returns a paginated list of resources.
 *
 * > [!TIP]
 * > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
 */
public data class ClerkPaginatedResponseOrganizationInvitation(public val `data`: List<OrganizationInvitation>, public val `totalCount`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("data", JsonArray(this@ClerkPaginatedResponseOrganizationInvitation.`data`.map { value -> value.toJson() }))
    putPresent("total_count", JsonPrimitive(this@ClerkPaginatedResponseOrganizationInvitation.`totalCount`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkPaginatedResponseOrganizationInvitation {
      val values = value.jsonObject

      return ClerkPaginatedResponseOrganizationInvitation(`data` = (values["data"] ?: Undefined).jsonArray.map { value -> OrganizationInvitation.fromJson(value, runtime) }, `totalCount` = (values["total_count"] ?: Undefined).requireDouble())
    }
  }
}

/**
 * The `OrganizationInvitation` object is the model around [an invitation to join an Organization](https://clerk.com/docs/guides/organizations/add-members/invitations).
 */
public data class OrganizationInvitationState(public val `id`: String, public val `emailAddress`: String, public val `organizationId`: String, public val `publicMetadata`: JsonObject, public val `role`: String, public val `roleName`: String, public val `status`: OrganizationInvitationStatus, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@OrganizationInvitationState.`id`))
    putPresent("emailAddress", JsonPrimitive(this@OrganizationInvitationState.`emailAddress`))
    putPresent("organizationId", JsonPrimitive(this@OrganizationInvitationState.`organizationId`))
    putPresent("publicMetadata", this@OrganizationInvitationState.`publicMetadata`)
    putPresent("role", JsonPrimitive(this@OrganizationInvitationState.`role`))
    putPresent("roleName", JsonPrimitive(this@OrganizationInvitationState.`roleName`))
    putPresent("status", this@OrganizationInvitationState.`status`.toJson())
    putPresent("createdAt", JsonPrimitive(this@OrganizationInvitationState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@OrganizationInvitationState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationInvitationState {
      val values = value.jsonObject

      return OrganizationInvitationState(`id` = (values["id"] ?: Undefined).requireString(), `emailAddress` = (values["emailAddress"] ?: Undefined).requireString(), `organizationId` = (values["organizationId"] ?: Undefined).requireString(), `publicMetadata` = (values["publicMetadata"] ?: Undefined).jsonObject, `role` = (values["role"] ?: Undefined).requireString(), `roleName` = (values["roleName"] ?: Undefined).requireString(), `status` = OrganizationInvitationStatus.fromJson((values["status"] ?: Undefined), runtime), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class OrganizationInvitation(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: OrganizationInvitationState get() = context.state(handle)
  public val changes: Flow<OrganizationInvitationState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `emailAddress`: String get() = state.`emailAddress`
  public val `organizationId`: String get() = state.`organizationId`
  public val `publicMetadata`: JsonObject get() = state.`publicMetadata`
  public val `role`: String get() = state.`role`
  public val `roleName`: String get() = state.`roleName`
  public val `status`: OrganizationInvitationStatus get() = state.`status`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = OrganizationInvitationState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationInvitation = runtime.resource(ResourceHandle.fromReference(value)) as OrganizationInvitation
  }
  /**
   * Revokes the invitation so it can no longer be accepted.
   */
  public suspend fun `revoke`(): OrganizationInvitation {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationInvitation.revoke", listOf()) { result ->
      OrganizationInvitation.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): OrganizationInvitation {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationInvitation.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      OrganizationInvitation.fromJson(result, runtime)
    }
  }
}

public data class GetRolesParams(public val `initialPage`: Double? = null, public val `pageSize`: Double? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("initialPage", this@GetRolesParams.`initialPage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("pageSize", this@GetRolesParams.`pageSize`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetRolesParams {
      val values = value.jsonObject

      return GetRolesParams(`initialPage` = (values["initialPage"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `pageSize` = (values["pageSize"] ?: Undefined).decodeOptional { value -> value.requireDouble() })
    }
  }
}

public data class GetRolesResponse(public val `hasRoleSetMigration`: Boolean? = null, public val `data`: List<Role>, public val `totalCount`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("has_role_set_migration", this@GetRolesResponse.`hasRoleSetMigration`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("data", JsonArray(this@GetRolesResponse.`data`.map { value -> value.toJson() }))
    putPresent("total_count", JsonPrimitive(this@GetRolesResponse.`totalCount`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetRolesResponse {
      val values = value.jsonObject

      return GetRolesResponse(`hasRoleSetMigration` = (values["has_role_set_migration"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `data` = (values["data"] ?: Undefined).jsonArray.map { value -> Role.fromJson(value, runtime) }, `totalCount` = (values["total_count"] ?: Undefined).requireDouble())
    }
  }
}

public data class RoleState(public val `id`: String, public val `key`: String, public val `name`: String, public val `description`: String, public val `permissions`: List<Permission>, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@RoleState.`id`))
    putPresent("key", JsonPrimitive(this@RoleState.`key`))
    putPresent("name", JsonPrimitive(this@RoleState.`name`))
    putPresent("description", JsonPrimitive(this@RoleState.`description`))
    putPresent("permissions", JsonArray(this@RoleState.`permissions`.map { value -> value.toJson() }))
    putPresent("createdAt", JsonPrimitive(this@RoleState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@RoleState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): RoleState {
      val values = value.jsonObject

      return RoleState(`id` = (values["id"] ?: Undefined).requireString(), `key` = (values["key"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).requireString(), `description` = (values["description"] ?: Undefined).requireString(), `permissions` = (values["permissions"] ?: Undefined).jsonArray.map { value -> Permission.fromJson(value, runtime) }, `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class Role(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: RoleState get() = context.state(handle)
  public val changes: Flow<RoleState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `key`: String get() = state.`key`
  public val `name`: String get() = state.`name`
  public val `description`: String get() = state.`description`
  public val `permissions`: List<Permission> get() = state.`permissions`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = RoleState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Role = runtime.resource(ResourceHandle.fromReference(value)) as Role
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): Role {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Role.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Role.fromJson(result, runtime)
    }
  }
}

public data class PermissionState(public val `id`: String, public val `key`: String, public val `name`: String, public val `type`: PermissionType, public val `description`: String, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@PermissionState.`id`))
    putPresent("key", JsonPrimitive(this@PermissionState.`key`))
    putPresent("name", JsonPrimitive(this@PermissionState.`name`))
    putPresent("type", this@PermissionState.`type`.toJson())
    putPresent("description", JsonPrimitive(this@PermissionState.`description`))
    putPresent("createdAt", JsonPrimitive(this@PermissionState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@PermissionState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PermissionState {
      val values = value.jsonObject

      return PermissionState(`id` = (values["id"] ?: Undefined).requireString(), `key` = (values["key"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).requireString(), `type` = PermissionType.fromJson((values["type"] ?: Undefined), runtime), `description` = (values["description"] ?: Undefined).requireString(), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class Permission(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: PermissionState get() = context.state(handle)
  public val changes: Flow<PermissionState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `key`: String get() = state.`key`
  public val `name`: String get() = state.`name`
  public val `type`: PermissionType get() = state.`type`
  public val `description`: String get() = state.`description`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = PermissionState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Permission = runtime.resource(ResourceHandle.fromReference(value)) as Permission
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): Permission {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Permission.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Permission.fromJson(result, runtime)
    }
  }
}

public sealed class PermissionType(public val rawValue: String) {
  public data object User : PermissionType("user")
  public data object System : PermissionType("system")
  public data class Unrecognized(val value: String) : PermissionType(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PermissionType = when (val raw = value.requireString()) {
      "user" -> User
      "system" -> System
      else -> Unrecognized(raw)
    }
  }
}

public data class GetDomainsParams(public val `initialPage`: Double? = null, public val `pageSize`: Double? = null, public val `enrollmentMode`: OrganizationEnrollmentMode? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("initialPage", this@GetDomainsParams.`initialPage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("pageSize", this@GetDomainsParams.`pageSize`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("enrollmentMode", this@GetDomainsParams.`enrollmentMode`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetDomainsParams {
      val values = value.jsonObject

      return GetDomainsParams(`initialPage` = (values["initialPage"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `pageSize` = (values["pageSize"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `enrollmentMode` = (values["enrollmentMode"] ?: Undefined).decodeOptional { value -> OrganizationEnrollmentMode.fromJson(value, runtime) })
    }
  }
}

public sealed class OrganizationEnrollmentMode(public val rawValue: String) {
  public data object EnterpriseSso : OrganizationEnrollmentMode("enterprise_sso")
  public data object ManualInvitation : OrganizationEnrollmentMode("manual_invitation")
  public data object AutomaticInvitation : OrganizationEnrollmentMode("automatic_invitation")
  public data object AutomaticSuggestion : OrganizationEnrollmentMode("automatic_suggestion")
  public data class Unrecognized(val value: String) : OrganizationEnrollmentMode(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationEnrollmentMode = when (val raw = value.requireString()) {
      "enterprise_sso" -> EnterpriseSso
      "manual_invitation" -> ManualInvitation
      "automatic_invitation" -> AutomaticInvitation
      "automatic_suggestion" -> AutomaticSuggestion
      else -> Unrecognized(raw)
    }
  }
}

/**
 * An interface that describes the response of a method that returns a paginated list of resources.
 *
 * > [!TIP]
 * > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
 */
public data class ClerkPaginatedResponseOrganizationDomain(public val `data`: List<OrganizationDomain>, public val `totalCount`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("data", JsonArray(this@ClerkPaginatedResponseOrganizationDomain.`data`.map { value -> value.toJson() }))
    putPresent("total_count", JsonPrimitive(this@ClerkPaginatedResponseOrganizationDomain.`totalCount`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkPaginatedResponseOrganizationDomain {
      val values = value.jsonObject

      return ClerkPaginatedResponseOrganizationDomain(`data` = (values["data"] ?: Undefined).jsonArray.map { value -> OrganizationDomain.fromJson(value, runtime) }, `totalCount` = (values["total_count"] ?: Undefined).requireDouble())
    }
  }
}

/**
 * The `OrganizationDomain` object is the model around an Organization's [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains).
 */
public data class OrganizationDomainState(public val `id`: String, public val `name`: String, public val `organizationId`: String, public val `enrollmentMode`: OrganizationEnrollmentMode, public val `verification`: OrganizationDomainVerification?, public val `affiliationVerification`: OrganizationDomainVerification?, public val `ownershipVerification`: OrganizationDomainOwnershipVerification?, public val `createdAt`: Instant, public val `updatedAt`: Instant, public val `affiliationEmailAddress`: String?, public val `totalPendingInvitations`: Double, public val `totalPendingSuggestions`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@OrganizationDomainState.`id`))
    putPresent("name", JsonPrimitive(this@OrganizationDomainState.`name`))
    putPresent("organizationId", JsonPrimitive(this@OrganizationDomainState.`organizationId`))
    putPresent("enrollmentMode", this@OrganizationDomainState.`enrollmentMode`.toJson())
    putPresent("verification", this@OrganizationDomainState.`verification`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("affiliationVerification", this@OrganizationDomainState.`affiliationVerification`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("ownershipVerification", this@OrganizationDomainState.`ownershipVerification`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("createdAt", JsonPrimitive(this@OrganizationDomainState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@OrganizationDomainState.`updatedAt`.toString()))
    putPresent("affiliationEmailAddress", this@OrganizationDomainState.`affiliationEmailAddress`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("totalPendingInvitations", JsonPrimitive(this@OrganizationDomainState.`totalPendingInvitations`))
    putPresent("totalPendingSuggestions", JsonPrimitive(this@OrganizationDomainState.`totalPendingSuggestions`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationDomainState {
      val values = value.jsonObject

      return OrganizationDomainState(`id` = (values["id"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).requireString(), `organizationId` = (values["organizationId"] ?: Undefined).requireString(), `enrollmentMode` = OrganizationEnrollmentMode.fromJson((values["enrollmentMode"] ?: Undefined), runtime), `verification` = (values["verification"] ?: Undefined).decodeOptional { value -> OrganizationDomainVerification.fromJson(value, runtime) }, `affiliationVerification` = (values["affiliationVerification"] ?: Undefined).decodeOptional { value -> OrganizationDomainVerification.fromJson(value, runtime) }, `ownershipVerification` = (values["ownershipVerification"] ?: Undefined).decodeOptional { value -> OrganizationDomainOwnershipVerification.fromJson(value, runtime) }, `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()), `affiliationEmailAddress` = (values["affiliationEmailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() }, `totalPendingInvitations` = (values["totalPendingInvitations"] ?: Undefined).requireDouble(), `totalPendingSuggestions` = (values["totalPendingSuggestions"] ?: Undefined).requireDouble())
    }
  }
}
public class OrganizationDomain(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: OrganizationDomainState get() = context.state(handle)
  public val changes: Flow<OrganizationDomainState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `name`: String get() = state.`name`
  public val `organizationId`: String get() = state.`organizationId`
  public val `enrollmentMode`: OrganizationEnrollmentMode get() = state.`enrollmentMode`
  public val `verification`: OrganizationDomainVerification? get() = state.`verification`
  public val `affiliationVerification`: OrganizationDomainVerification? get() = state.`affiliationVerification`
  public val `ownershipVerification`: OrganizationDomainOwnershipVerification? get() = state.`ownershipVerification`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  public val `affiliationEmailAddress`: String? get() = state.`affiliationEmailAddress`
  public val `totalPendingInvitations`: Double get() = state.`totalPendingInvitations`
  public val `totalPendingSuggestions`: Double get() = state.`totalPendingSuggestions`
  override fun prepare(value: JsonElement): Any = OrganizationDomainState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationDomain = runtime.resource(ResourceHandle.fromReference(value)) as OrganizationDomain
  }
  /**
   * Begins the verification process of a created Organization domain by sending a verification code to the provided email address.
   */
  public suspend fun `prepareAffiliationVerification`(`params`: PrepareAffiliationVerificationParams): OrganizationDomain {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationDomain.prepareAffiliationVerification", listOf(`params`.toJson())) { result ->
      OrganizationDomain.fromJson(result, runtime)
    }
  }
  /**
   * Completes the verification process started by [`prepareAffiliationVerification()`](https://clerk.com/docs/reference/types/organization-domain-resource#prepare-affiliation-verification), by validating the provided verification code.
   */
  public suspend fun `attemptAffiliationVerification`(`params`: AttemptAffiliationVerificationParams): OrganizationDomain {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationDomain.attemptAffiliationVerification", listOf(`params`.toJson())) { result ->
      OrganizationDomain.fromJson(result, runtime)
    }
  }
  /**
   * Deletes the Verified Domain.
   */
  public suspend fun `delete`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationDomain.delete", listOf()) { result ->
      Unit
    }
  }
  /**
   * Updates the enrollment mode of the Verified Domain.
   */
  public suspend fun `updateEnrollmentMode`(`params`: UpdateEnrollmentModeParams): OrganizationDomain {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationDomain.updateEnrollmentMode", listOf(`params`.toJson())) { result ->
      OrganizationDomain.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): OrganizationDomain {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationDomain.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      OrganizationDomain.fromJson(result, runtime)
    }
  }
}

/**
 * The `OrganizationDomainVerification` object holds the affiliation verification details of an Organization's [Verified Domain](/docs/guides/organizations/add-members/verified-domains). Affiliation proves that the current user controls an email address that belongs to the domain.
 */
public data class OrganizationDomainVerification(public val `status`: OrganizationDomainVerificationStatus, public val `attempts`: Double, public val `expiresAt`: Instant) {
  public val `strategy`: String get() = "email_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("status", this@OrganizationDomainVerification.`status`.toJson())
    putPresent("strategy", JsonPrimitive("email_code"))
    putPresent("attempts", JsonPrimitive(this@OrganizationDomainVerification.`attempts`))
    putPresent("expiresAt", JsonPrimitive(this@OrganizationDomainVerification.`expiresAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationDomainVerification {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("email_code"))
      return OrganizationDomainVerification(`status` = OrganizationDomainVerificationStatus.fromJson((values["status"] ?: Undefined), runtime), `attempts` = (values["attempts"] ?: Undefined).requireDouble(), `expiresAt` = Instant.parse((values["expiresAt"] ?: Undefined).requireString()))
    }
  }
}

/**
 * The current status of an Organization domain verification.
 *
 * <ul>
 *  <li>`unverified`: Verification has not been completed yet. An attempt may be pending.</li>
 *  <li>`verified`: Verification has been completed.</li>
 *  <li>`failed`: Too many verification attempts were made without success.</li>
 *  <li>`expired`: The pending verification attempt expired before it could be completed.</li>
 * </ul>
 */
public sealed class OrganizationDomainVerificationStatus(public val rawValue: String) {
  public data object Unverified : OrganizationDomainVerificationStatus("unverified")
  public data object Verified : OrganizationDomainVerificationStatus("verified")
  public data object Failed : OrganizationDomainVerificationStatus("failed")
  public data object Expired : OrganizationDomainVerificationStatus("expired")
  public data class Unrecognized(val value: String) : OrganizationDomainVerificationStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationDomainVerificationStatus = when (val raw = value.requireString()) {
      "unverified" -> Unverified
      "verified" -> Verified
      "failed" -> Failed
      "expired" -> Expired
      else -> Unrecognized(raw)
    }
  }
}

/**
 * Holds the ownership verification details of an Organization's [Verified Domain](https://clerk.com/docs/guides/organizations/add-members/verified-domains). Ownership proves control of the underlying DNS domain, typically by publishing a TXT record, and is required before the domain can be used for enterprise SSO.
 */
public data class OrganizationDomainOwnershipVerification(public val `status`: OrganizationDomainOwnershipVerificationStatus, public val `strategy`: OrganizationDomainOwnershipVerificationStrategy, public val `attempts`: Double?, public val `expiresAt`: Instant?, public val `verifiedAt`: Instant?, public val `txtRecordName`: String?, public val `txtRecordValue`: String?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("status", this@OrganizationDomainOwnershipVerification.`status`.toJson())
    putPresent("strategy", this@OrganizationDomainOwnershipVerification.`strategy`.toJson())
    putPresent("attempts", this@OrganizationDomainOwnershipVerification.`attempts`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("expiresAt", this@OrganizationDomainOwnershipVerification.`expiresAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("verifiedAt", this@OrganizationDomainOwnershipVerification.`verifiedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("txtRecordName", this@OrganizationDomainOwnershipVerification.`txtRecordName`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("txtRecordValue", this@OrganizationDomainOwnershipVerification.`txtRecordValue`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationDomainOwnershipVerification {
      val values = value.jsonObject

      return OrganizationDomainOwnershipVerification(`status` = OrganizationDomainOwnershipVerificationStatus.fromJson((values["status"] ?: Undefined), runtime), `strategy` = OrganizationDomainOwnershipVerificationStrategy.fromJson((values["strategy"] ?: Undefined), runtime), `attempts` = (values["attempts"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `expiresAt` = (values["expiresAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `verifiedAt` = (values["verifiedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `txtRecordName` = (values["txtRecordName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `txtRecordValue` = (values["txtRecordValue"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

/**
 * The current status of an Organization domain ownership verification.
 *
 * <ul>
 *  <li>`unverified`: Ownership has not been established yet. A TXT challenge is pending.</li>
 *  <li>`verified`: Ownership has been verified.</li>
 *  <li>`expired`: The pending ownership verification attempt expired before ownership could be confirmed. A new TXT challenge must be issued (via `prepareOwnershipVerification()`) to retry.</li>
 * </ul>
 */
public sealed class OrganizationDomainOwnershipVerificationStatus(public val rawValue: String) {
  public data object Unverified : OrganizationDomainOwnershipVerificationStatus("unverified")
  public data object Verified : OrganizationDomainOwnershipVerificationStatus("verified")
  public data object Expired : OrganizationDomainOwnershipVerificationStatus("expired")
  public data class Unrecognized(val value: String) : OrganizationDomainOwnershipVerificationStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationDomainOwnershipVerificationStatus = when (val raw = value.requireString()) {
      "unverified" -> Unverified
      "verified" -> Verified
      "expired" -> Expired
      else -> Unrecognized(raw)
    }
  }
}

/**
 * The strategy used to verify ownership of an Organization's domain.
 */
public sealed class OrganizationDomainOwnershipVerificationStrategy(public val rawValue: String) {
  public data object Txt : OrganizationDomainOwnershipVerificationStrategy("txt")
  public data object Legacy : OrganizationDomainOwnershipVerificationStrategy("legacy")
  public data object ManualOverride : OrganizationDomainOwnershipVerificationStrategy("manual_override")
  public data object ParentDomain : OrganizationDomainOwnershipVerificationStrategy("parent_domain")
  public data class Unrecognized(val value: String) : OrganizationDomainOwnershipVerificationStrategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationDomainOwnershipVerificationStrategy = when (val raw = value.requireString()) {
      "txt" -> Txt
      "legacy" -> Legacy
      "manual_override" -> ManualOverride
      "parent_domain" -> ParentDomain
      else -> Unrecognized(raw)
    }
  }
}

public data class PrepareAffiliationVerificationParams(public val `affiliationEmailAddress`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("affiliationEmailAddress", JsonPrimitive(this@PrepareAffiliationVerificationParams.`affiliationEmailAddress`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PrepareAffiliationVerificationParams {
      val values = value.jsonObject

      return PrepareAffiliationVerificationParams(`affiliationEmailAddress` = (values["affiliationEmailAddress"] ?: Undefined).requireString())
    }
  }
}

public data class AttemptAffiliationVerificationParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@AttemptAffiliationVerificationParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AttemptAffiliationVerificationParams {
      val values = value.jsonObject

      return AttemptAffiliationVerificationParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class UpdateEnrollmentModeParams(public val `enrollmentMode`: OrganizationEnrollmentMode, public val `deletePending`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enrollmentMode", this@UpdateEnrollmentModeParams.`enrollmentMode`.toJson())
    putPresent("deletePending", this@UpdateEnrollmentModeParams.`deletePending`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UpdateEnrollmentModeParams {
      val values = value.jsonObject

      return UpdateEnrollmentModeParams(`enrollmentMode` = OrganizationEnrollmentMode.fromJson((values["enrollmentMode"] ?: Undefined), runtime), `deletePending` = (values["deletePending"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public data class GetMembershipRequestParams(public val `initialPage`: Double? = null, public val `pageSize`: Double? = null, public val `status`: OrganizationInvitationStatus? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("initialPage", this@GetMembershipRequestParams.`initialPage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("pageSize", this@GetMembershipRequestParams.`pageSize`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("status", this@GetMembershipRequestParams.`status`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetMembershipRequestParams {
      val values = value.jsonObject

      return GetMembershipRequestParams(`initialPage` = (values["initialPage"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `pageSize` = (values["pageSize"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `status` = (values["status"] ?: Undefined).decodeOptional { value -> OrganizationInvitationStatus.fromJson(value, runtime) })
    }
  }
}

/**
 * An interface that describes the response of a method that returns a paginated list of resources.
 *
 * > [!TIP]
 * > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
 */
public data class ClerkPaginatedResponseOrganizationMembershipRequest(public val `data`: List<OrganizationMembershipRequest>, public val `totalCount`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("data", JsonArray(this@ClerkPaginatedResponseOrganizationMembershipRequest.`data`.map { value -> value.toJson() }))
    putPresent("total_count", JsonPrimitive(this@ClerkPaginatedResponseOrganizationMembershipRequest.`totalCount`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkPaginatedResponseOrganizationMembershipRequest {
      val values = value.jsonObject

      return ClerkPaginatedResponseOrganizationMembershipRequest(`data` = (values["data"] ?: Undefined).jsonArray.map { value -> OrganizationMembershipRequest.fromJson(value, runtime) }, `totalCount` = (values["total_count"] ?: Undefined).requireDouble())
    }
  }
}

/**
 * The `OrganizationMembershipRequest` object is the model that describes [the request of a user to join an Organization](https://clerk.com/docs/guides/organizations/add-members/verified-domains#membership-requests).
 */
public data class OrganizationMembershipRequestState(public val `id`: String, public val `organizationId`: String, public val `status`: OrganizationInvitationStatus, public val `publicUserData`: PublicUserData, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@OrganizationMembershipRequestState.`id`))
    putPresent("organizationId", JsonPrimitive(this@OrganizationMembershipRequestState.`organizationId`))
    putPresent("status", this@OrganizationMembershipRequestState.`status`.toJson())
    putPresent("publicUserData", this@OrganizationMembershipRequestState.`publicUserData`.toJson())
    putPresent("createdAt", JsonPrimitive(this@OrganizationMembershipRequestState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@OrganizationMembershipRequestState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationMembershipRequestState {
      val values = value.jsonObject

      return OrganizationMembershipRequestState(`id` = (values["id"] ?: Undefined).requireString(), `organizationId` = (values["organizationId"] ?: Undefined).requireString(), `status` = OrganizationInvitationStatus.fromJson((values["status"] ?: Undefined), runtime), `publicUserData` = PublicUserData.fromJson((values["publicUserData"] ?: Undefined), runtime), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class OrganizationMembershipRequest(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: OrganizationMembershipRequestState get() = context.state(handle)
  public val changes: Flow<OrganizationMembershipRequestState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `organizationId`: String get() = state.`organizationId`
  public val `status`: OrganizationInvitationStatus get() = state.`status`
  public val `publicUserData`: PublicUserData get() = state.`publicUserData`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = OrganizationMembershipRequestState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationMembershipRequest = runtime.resource(ResourceHandle.fromReference(value)) as OrganizationMembershipRequest
  }
  /**
   * Accepts the Membership Request, adding the user to the Organization.
   */
  public suspend fun `accept`(): OrganizationMembershipRequest {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationMembershipRequest.accept", listOf()) { result ->
      OrganizationMembershipRequest.fromJson(result, runtime)
    }
  }
  /**
   * Rejects the Membership Request, declining the user's request to join the Organization.
   */
  public suspend fun `reject`(): OrganizationMembershipRequest {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationMembershipRequest.reject", listOf()) { result ->
      OrganizationMembershipRequest.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): OrganizationMembershipRequest {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationMembershipRequest.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      OrganizationMembershipRequest.fromJson(result, runtime)
    }
  }
}

public data class AddMemberParams(public val `userId`: String, public val `role`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("userId", JsonPrimitive(this@AddMemberParams.`userId`))
    putPresent("role", JsonPrimitive(this@AddMemberParams.`role`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AddMemberParams {
      val values = value.jsonObject

      return AddMemberParams(`userId` = (values["userId"] ?: Undefined).requireString(), `role` = (values["role"] ?: Undefined).requireString())
    }
  }
}

public data class InviteMemberParams(public val `emailAddress`: String, public val `role`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddress", JsonPrimitive(this@InviteMemberParams.`emailAddress`))
    putPresent("role", JsonPrimitive(this@InviteMemberParams.`role`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): InviteMemberParams {
      val values = value.jsonObject

      return InviteMemberParams(`emailAddress` = (values["emailAddress"] ?: Undefined).requireString(), `role` = (values["role"] ?: Undefined).requireString())
    }
  }
}

public data class InviteMembersParams(public val `emailAddresses`: List<String>, public val `role`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddresses", JsonArray(this@InviteMembersParams.`emailAddresses`.map { value -> JsonPrimitive(value) }))
    putPresent("role", JsonPrimitive(this@InviteMembersParams.`role`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): InviteMembersParams {
      val values = value.jsonObject

      return InviteMembersParams(`emailAddresses` = (values["emailAddresses"] ?: Undefined).jsonArray.map { value -> value.requireString() }, `role` = (values["role"] ?: Undefined).requireString())
    }
  }
}

public data class UpdateMembershipParams(public val `userId`: String, public val `role`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("userId", JsonPrimitive(this@UpdateMembershipParams.`userId`))
    putPresent("role", JsonPrimitive(this@UpdateMembershipParams.`role`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UpdateMembershipParams {
      val values = value.jsonObject

      return UpdateMembershipParams(`userId` = (values["userId"] ?: Undefined).requireString(), `role` = (values["role"] ?: Undefined).requireString())
    }
  }
}

/**
 * From T, pick a set of properties whose keys are in the union K
 */
public data class PickCreateOrganizationDomainParamsAndenrollmentMode(public val `enrollmentMode`: OrganizationEnrollmentMode? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enrollmentMode", this@PickCreateOrganizationDomainParamsAndenrollmentMode.`enrollmentMode`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PickCreateOrganizationDomainParamsAndenrollmentMode {
      val values = value.jsonObject

      return PickCreateOrganizationDomainParamsAndenrollmentMode(`enrollmentMode` = (values["enrollmentMode"] ?: Undefined).decodeOptional { value -> OrganizationEnrollmentMode.fromJson(value, runtime) })
    }
  }
}

/**
 * The `OrganizationDomainsBulkOwnershipVerificationResource` object is the result of a bulk ownership verification flow, such as [`prepareOwnershipVerification()`](https://clerk.com/docs/reference/objects/organization#prepare-ownership-verification) or [`attemptOwnershipVerification()`](https://clerk.com/docs/reference/objects/organization#attempt-ownership-verification), where ownership is verified for several of an Organization's [Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains) at once. Because the operation can partially succeed, each requested domain is reported in either `data` or `errors`.
 */
public data class OrganizationDomainsBulkOwnershipVerification(public val `data`: List<OrganizationDomain>, public val `errors`: List<OrganizationDomainBulkOwnershipVerificationError>) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("data", JsonArray(this@OrganizationDomainsBulkOwnershipVerification.`data`.map { value -> value.toJson() }))
    putPresent("errors", JsonArray(this@OrganizationDomainsBulkOwnershipVerification.`errors`.map { value -> value.toJson() }))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationDomainsBulkOwnershipVerification {
      val values = value.jsonObject

      return OrganizationDomainsBulkOwnershipVerification(`data` = (values["data"] ?: Undefined).jsonArray.map { value -> OrganizationDomain.fromJson(value, runtime) }, `errors` = (values["errors"] ?: Undefined).jsonArray.map { value -> OrganizationDomainBulkOwnershipVerificationError.fromJson(value, runtime) })
    }
  }
}

public data class OrganizationDomainBulkOwnershipVerificationError(public val `id`: String, public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@OrganizationDomainBulkOwnershipVerificationError.`id`))
    putPresent("code", JsonPrimitive(this@OrganizationDomainBulkOwnershipVerificationError.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationDomainBulkOwnershipVerificationError {
      val values = value.jsonObject

      return OrganizationDomainBulkOwnershipVerificationError(`id` = (values["id"] ?: Undefined).requireString(), `code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class OrganizationGetDomain__0(public val `domainId`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("domainId", JsonPrimitive(this@OrganizationGetDomain__0.`domainId`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationGetDomain__0 {
      val values = value.jsonObject

      return OrganizationGetDomain__0(`domainId` = (values["domainId"] ?: Undefined).requireString())
    }
  }
}

public data class GetEnterpriseConnectionsParams(public val `withOrganizationAccountLinking`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("withOrganizationAccountLinking", this@GetEnterpriseConnectionsParams.`withOrganizationAccountLinking`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetEnterpriseConnectionsParams {
      val values = value.jsonObject

      return GetEnterpriseConnectionsParams(`withOrganizationAccountLinking` = (values["withOrganizationAccountLinking"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public data class EnterpriseConnectionState(public val `id`: String, public val `name`: String, public val `active`: Boolean, public val `provider`: String, public val `logoPublicUrl`: String?, public val `domains`: List<String>, public val `organizationId`: String?, public val `syncUserAttributes`: Boolean, public val `disableAdditionalIdentifications`: Boolean, public val `allowOrganizationAccountLinking`: Boolean, public val `customAttributes`: List<JsonElement>, public val `oauthConfig`: EnterpriseOAuthConfig?, public val `samlConnection`: EnterpriseSamlConnectionNested?, public val `createdAt`: Instant?, public val `updatedAt`: Instant?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@EnterpriseConnectionState.`id`))
    putPresent("name", JsonPrimitive(this@EnterpriseConnectionState.`name`))
    putPresent("active", JsonPrimitive(this@EnterpriseConnectionState.`active`))
    putPresent("provider", JsonPrimitive(this@EnterpriseConnectionState.`provider`))
    putPresent("logoPublicUrl", this@EnterpriseConnectionState.`logoPublicUrl`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("domains", JsonArray(this@EnterpriseConnectionState.`domains`.map { value -> JsonPrimitive(value) }))
    putPresent("organizationId", this@EnterpriseConnectionState.`organizationId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("syncUserAttributes", JsonPrimitive(this@EnterpriseConnectionState.`syncUserAttributes`))
    putPresent("disableAdditionalIdentifications", JsonPrimitive(this@EnterpriseConnectionState.`disableAdditionalIdentifications`))
    putPresent("allowOrganizationAccountLinking", JsonPrimitive(this@EnterpriseConnectionState.`allowOrganizationAccountLinking`))
    putPresent("customAttributes", JsonArray(this@EnterpriseConnectionState.`customAttributes`.map { value -> value }))
    putPresent("oauthConfig", this@EnterpriseConnectionState.`oauthConfig`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("samlConnection", this@EnterpriseConnectionState.`samlConnection`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("createdAt", this@EnterpriseConnectionState.`createdAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("updatedAt", this@EnterpriseConnectionState.`updatedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnectionState {
      val values = value.jsonObject

      return EnterpriseConnectionState(`id` = (values["id"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).requireString(), `active` = (values["active"] ?: Undefined).requireBoolean(), `provider` = (values["provider"] ?: Undefined).requireString(), `logoPublicUrl` = (values["logoPublicUrl"] ?: Undefined).decodeOptional { value -> value.requireString() }, `domains` = (values["domains"] ?: Undefined).jsonArray.map { value -> value.requireString() }, `organizationId` = (values["organizationId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `syncUserAttributes` = (values["syncUserAttributes"] ?: Undefined).requireBoolean(), `disableAdditionalIdentifications` = (values["disableAdditionalIdentifications"] ?: Undefined).requireBoolean(), `allowOrganizationAccountLinking` = (values["allowOrganizationAccountLinking"] ?: Undefined).requireBoolean(), `customAttributes` = (values["customAttributes"] ?: Undefined).jsonArray.map { value -> value }, `oauthConfig` = (values["oauthConfig"] ?: Undefined).decodeOptional { value -> EnterpriseOAuthConfig.fromJson(value, runtime) }, `samlConnection` = (values["samlConnection"] ?: Undefined).decodeOptional { value -> EnterpriseSamlConnectionNested.fromJson(value, runtime) }, `createdAt` = (values["createdAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `updatedAt` = (values["updatedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) })
    }
  }
}
public class EnterpriseConnection(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: EnterpriseConnectionState get() = context.state(handle)
  public val changes: Flow<EnterpriseConnectionState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `name`: String get() = state.`name`
  public val `active`: Boolean get() = state.`active`
  public val `provider`: String get() = state.`provider`
  public val `logoPublicUrl`: String? get() = state.`logoPublicUrl`
  public val `domains`: List<String> get() = state.`domains`
  public val `organizationId`: String? get() = state.`organizationId`
  public val `syncUserAttributes`: Boolean get() = state.`syncUserAttributes`
  public val `disableAdditionalIdentifications`: Boolean get() = state.`disableAdditionalIdentifications`
  public val `allowOrganizationAccountLinking`: Boolean get() = state.`allowOrganizationAccountLinking`
  public val `customAttributes`: List<JsonElement> get() = state.`customAttributes`
  public val `oauthConfig`: EnterpriseOAuthConfig? get() = state.`oauthConfig`
  public val `samlConnection`: EnterpriseSamlConnectionNested? get() = state.`samlConnection`
  public val `createdAt`: Instant? get() = state.`createdAt`
  public val `updatedAt`: Instant? get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = EnterpriseConnectionState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnection = runtime.resource(ResourceHandle.fromReference(value)) as EnterpriseConnection
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): EnterpriseConnection {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EnterpriseConnection.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      EnterpriseConnection.fromJson(result, runtime)
    }
  }
}

public data class EnterpriseOAuthConfig(public val `id`: String, public val `name`: String, public val `clientId`: String, public val `providerKey`: String? = null, public val `redirectUri`: String? = null, public val `discoveryUrl`: String? = null, public val `authUrl`: String? = null, public val `tokenUrl`: String? = null, public val `userInfoUrl`: String? = null, public val `logoPublicUrl`: Field<String> = Field.Omitted, public val `requiresPkce`: Boolean? = null, public val `createdAt`: Instant?, public val `updatedAt`: Instant?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@EnterpriseOAuthConfig.`id`))
    putPresent("name", JsonPrimitive(this@EnterpriseOAuthConfig.`name`))
    putPresent("clientId", JsonPrimitive(this@EnterpriseOAuthConfig.`clientId`))
    putPresent("providerKey", this@EnterpriseOAuthConfig.`providerKey`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("redirectUri", this@EnterpriseOAuthConfig.`redirectUri`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("discoveryUrl", this@EnterpriseOAuthConfig.`discoveryUrl`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("authUrl", this@EnterpriseOAuthConfig.`authUrl`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("tokenUrl", this@EnterpriseOAuthConfig.`tokenUrl`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("userInfoUrl", this@EnterpriseOAuthConfig.`userInfoUrl`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("logoPublicUrl", this@EnterpriseOAuthConfig.`logoPublicUrl`.toJson { value -> JsonPrimitive(value) })
    putPresent("requiresPkce", this@EnterpriseOAuthConfig.`requiresPkce`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("createdAt", this@EnterpriseOAuthConfig.`createdAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("updatedAt", this@EnterpriseOAuthConfig.`updatedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseOAuthConfig {
      val values = value.jsonObject

      return EnterpriseOAuthConfig(`id` = (values["id"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).requireString(), `clientId` = (values["clientId"] ?: Undefined).requireString(), `providerKey` = (values["providerKey"] ?: Undefined).decodeOptional { value -> value.requireString() }, `redirectUri` = (values["redirectUri"] ?: Undefined).decodeOptional { value -> value.requireString() }, `discoveryUrl` = (values["discoveryUrl"] ?: Undefined).decodeOptional { value -> value.requireString() }, `authUrl` = (values["authUrl"] ?: Undefined).decodeOptional { value -> value.requireString() }, `tokenUrl` = (values["tokenUrl"] ?: Undefined).decodeOptional { value -> value.requireString() }, `userInfoUrl` = (values["userInfoUrl"] ?: Undefined).decodeOptional { value -> value.requireString() }, `logoPublicUrl` = Field.fromJson((values["logoPublicUrl"] ?: Undefined)) { value -> value.requireString() }, `requiresPkce` = (values["requiresPkce"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `createdAt` = (values["createdAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `updatedAt` = (values["updatedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) })
    }
  }
}

public data class EnterpriseSamlConnectionNested(public val `id`: String, public val `name`: String, public val `active`: Boolean, public val `idpEntityId`: String, public val `idpSsoUrl`: String, public val `idpCertificate`: String, public val `idpCertificateIssuedAt`: Double, public val `idpCertificateExpiresAt`: Double, public val `idpMetadataUrl`: String, public val `idpMetadata`: String, public val `acsUrl`: String, public val `spEntityId`: String, public val `spMetadataUrl`: String, public val `allowSubdomains`: Boolean, public val `allowIdpInitiated`: Boolean, public val `forceAuthn`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@EnterpriseSamlConnectionNested.`id`))
    putPresent("name", JsonPrimitive(this@EnterpriseSamlConnectionNested.`name`))
    putPresent("active", JsonPrimitive(this@EnterpriseSamlConnectionNested.`active`))
    putPresent("idpEntityId", JsonPrimitive(this@EnterpriseSamlConnectionNested.`idpEntityId`))
    putPresent("idpSsoUrl", JsonPrimitive(this@EnterpriseSamlConnectionNested.`idpSsoUrl`))
    putPresent("idpCertificate", JsonPrimitive(this@EnterpriseSamlConnectionNested.`idpCertificate`))
    putPresent("idpCertificateIssuedAt", JsonPrimitive(this@EnterpriseSamlConnectionNested.`idpCertificateIssuedAt`))
    putPresent("idpCertificateExpiresAt", JsonPrimitive(this@EnterpriseSamlConnectionNested.`idpCertificateExpiresAt`))
    putPresent("idpMetadataUrl", JsonPrimitive(this@EnterpriseSamlConnectionNested.`idpMetadataUrl`))
    putPresent("idpMetadata", JsonPrimitive(this@EnterpriseSamlConnectionNested.`idpMetadata`))
    putPresent("acsUrl", JsonPrimitive(this@EnterpriseSamlConnectionNested.`acsUrl`))
    putPresent("spEntityId", JsonPrimitive(this@EnterpriseSamlConnectionNested.`spEntityId`))
    putPresent("spMetadataUrl", JsonPrimitive(this@EnterpriseSamlConnectionNested.`spMetadataUrl`))
    putPresent("allowSubdomains", JsonPrimitive(this@EnterpriseSamlConnectionNested.`allowSubdomains`))
    putPresent("allowIdpInitiated", JsonPrimitive(this@EnterpriseSamlConnectionNested.`allowIdpInitiated`))
    putPresent("forceAuthn", JsonPrimitive(this@EnterpriseSamlConnectionNested.`forceAuthn`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseSamlConnectionNested {
      val values = value.jsonObject

      return EnterpriseSamlConnectionNested(`id` = (values["id"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).requireString(), `active` = (values["active"] ?: Undefined).requireBoolean(), `idpEntityId` = (values["idpEntityId"] ?: Undefined).requireString(), `idpSsoUrl` = (values["idpSsoUrl"] ?: Undefined).requireString(), `idpCertificate` = (values["idpCertificate"] ?: Undefined).requireString(), `idpCertificateIssuedAt` = (values["idpCertificateIssuedAt"] ?: Undefined).requireDouble(), `idpCertificateExpiresAt` = (values["idpCertificateExpiresAt"] ?: Undefined).requireDouble(), `idpMetadataUrl` = (values["idpMetadataUrl"] ?: Undefined).requireString(), `idpMetadata` = (values["idpMetadata"] ?: Undefined).requireString(), `acsUrl` = (values["acsUrl"] ?: Undefined).requireString(), `spEntityId` = (values["spEntityId"] ?: Undefined).requireString(), `spMetadataUrl` = (values["spMetadataUrl"] ?: Undefined).requireString(), `allowSubdomains` = (values["allowSubdomains"] ?: Undefined).requireBoolean(), `allowIdpInitiated` = (values["allowIdpInitiated"] ?: Undefined).requireBoolean(), `forceAuthn` = (values["forceAuthn"] ?: Undefined).requireBoolean())
    }
  }
}

public data class CreateOrganizationEnterpriseConnectionParams(public val `provider`: OrganizationEnterpriseConnectionProvider, public val `name`: String? = null, public val `domains`: List<String>? = null, public val `organizationId`: Field<String> = Field.Omitted, public val `saml`: Field<OrganizationEnterpriseConnectionSamlInput> = Field.Omitted, public val `oidc`: Field<OrganizationEnterpriseConnectionOidcInput> = Field.Omitted) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("provider", this@CreateOrganizationEnterpriseConnectionParams.`provider`.toJson())
    putPresent("name", this@CreateOrganizationEnterpriseConnectionParams.`name`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("domains", this@CreateOrganizationEnterpriseConnectionParams.`domains`?.let { value -> JsonArray(value.map { value -> JsonPrimitive(value) }) } ?: Undefined)
    putPresent("organizationId", this@CreateOrganizationEnterpriseConnectionParams.`organizationId`.toJson { value -> JsonPrimitive(value) })
    putPresent("saml", this@CreateOrganizationEnterpriseConnectionParams.`saml`.toJson { value -> value.toJson() })
    putPresent("oidc", this@CreateOrganizationEnterpriseConnectionParams.`oidc`.toJson { value -> value.toJson() })
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreateOrganizationEnterpriseConnectionParams {
      val values = value.jsonObject

      return CreateOrganizationEnterpriseConnectionParams(`provider` = OrganizationEnterpriseConnectionProvider.fromJson((values["provider"] ?: Undefined), runtime), `name` = (values["name"] ?: Undefined).decodeOptional { value -> value.requireString() }, `domains` = (values["domains"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> value.requireString() } }, `organizationId` = Field.fromJson((values["organizationId"] ?: Undefined)) { value -> value.requireString() }, `saml` = Field.fromJson((values["saml"] ?: Undefined)) { value -> OrganizationEnterpriseConnectionSamlInput.fromJson(value, runtime) }, `oidc` = Field.fromJson((values["oidc"] ?: Undefined)) { value -> OrganizationEnterpriseConnectionOidcInput.fromJson(value, runtime) })
    }
  }
}

public sealed class OrganizationEnterpriseConnectionProvider(public val rawValue: String) {
  public data object SamlOkta : OrganizationEnterpriseConnectionProvider("saml_okta")
  public data object SamlGoogle : OrganizationEnterpriseConnectionProvider("saml_google")
  public data object SamlMicrosoft : OrganizationEnterpriseConnectionProvider("saml_microsoft")
  public data object SamlCustom : OrganizationEnterpriseConnectionProvider("saml_custom")
  public data object OidcCustom : OrganizationEnterpriseConnectionProvider("oidc_custom")
  public data object OidcGithubEnterprise : OrganizationEnterpriseConnectionProvider("oidc_github_enterprise")
  public data object OidcGitlab : OrganizationEnterpriseConnectionProvider("oidc_gitlab")
  public data class Unrecognized(val value: String) : OrganizationEnterpriseConnectionProvider(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationEnterpriseConnectionProvider = when (val raw = value.requireString()) {
      "saml_okta" -> SamlOkta
      "saml_google" -> SamlGoogle
      "saml_microsoft" -> SamlMicrosoft
      "saml_custom" -> SamlCustom
      "oidc_custom" -> OidcCustom
      "oidc_github_enterprise" -> OidcGithubEnterprise
      "oidc_gitlab" -> OidcGitlab
      else -> Unrecognized(raw)
    }
  }
}

public data class OrganizationEnterpriseConnectionSamlInput(public val `idpEntityId`: Field<String> = Field.Omitted, public val `idpSsoUrl`: Field<String> = Field.Omitted, public val `idpCertificate`: Field<String> = Field.Omitted, public val `idpMetadataUrl`: Field<String> = Field.Omitted, public val `idpMetadata`: Field<String> = Field.Omitted, public val `attributeMapping`: Field<Map<String, JsonElement>> = Field.Omitted, public val `allowSubdomains`: Field<Boolean> = Field.Omitted, public val `allowIdpInitiated`: Field<Boolean> = Field.Omitted, public val `forceAuthn`: Field<Boolean> = Field.Omitted) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("idpEntityId", this@OrganizationEnterpriseConnectionSamlInput.`idpEntityId`.toJson { value -> JsonPrimitive(value) })
    putPresent("idpSsoUrl", this@OrganizationEnterpriseConnectionSamlInput.`idpSsoUrl`.toJson { value -> JsonPrimitive(value) })
    putPresent("idpCertificate", this@OrganizationEnterpriseConnectionSamlInput.`idpCertificate`.toJson { value -> JsonPrimitive(value) })
    putPresent("idpMetadataUrl", this@OrganizationEnterpriseConnectionSamlInput.`idpMetadataUrl`.toJson { value -> JsonPrimitive(value) })
    putPresent("idpMetadata", this@OrganizationEnterpriseConnectionSamlInput.`idpMetadata`.toJson { value -> JsonPrimitive(value) })
    putPresent("attributeMapping", this@OrganizationEnterpriseConnectionSamlInput.`attributeMapping`.toJson { value -> JsonObject(value.mapValues { (_, value) -> value }) })
    putPresent("allowSubdomains", this@OrganizationEnterpriseConnectionSamlInput.`allowSubdomains`.toJson { value -> JsonPrimitive(value) })
    putPresent("allowIdpInitiated", this@OrganizationEnterpriseConnectionSamlInput.`allowIdpInitiated`.toJson { value -> JsonPrimitive(value) })
    putPresent("forceAuthn", this@OrganizationEnterpriseConnectionSamlInput.`forceAuthn`.toJson { value -> JsonPrimitive(value) })
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationEnterpriseConnectionSamlInput {
      val values = value.jsonObject

      return OrganizationEnterpriseConnectionSamlInput(`idpEntityId` = Field.fromJson((values["idpEntityId"] ?: Undefined)) { value -> value.requireString() }, `idpSsoUrl` = Field.fromJson((values["idpSsoUrl"] ?: Undefined)) { value -> value.requireString() }, `idpCertificate` = Field.fromJson((values["idpCertificate"] ?: Undefined)) { value -> value.requireString() }, `idpMetadataUrl` = Field.fromJson((values["idpMetadataUrl"] ?: Undefined)) { value -> value.requireString() }, `idpMetadata` = Field.fromJson((values["idpMetadata"] ?: Undefined)) { value -> value.requireString() }, `attributeMapping` = Field.fromJson((values["attributeMapping"] ?: Undefined)) { value -> value.jsonObject.mapValues { (_, value) -> value } }, `allowSubdomains` = Field.fromJson((values["allowSubdomains"] ?: Undefined)) { value -> value.requireBoolean() }, `allowIdpInitiated` = Field.fromJson((values["allowIdpInitiated"] ?: Undefined)) { value -> value.requireBoolean() }, `forceAuthn` = Field.fromJson((values["forceAuthn"] ?: Undefined)) { value -> value.requireBoolean() })
    }
  }
}

public data class OrganizationEnterpriseConnectionOidcInput(public val `clientId`: Field<String> = Field.Omitted, public val `clientSecret`: Field<String> = Field.Omitted, public val `discoveryUrl`: Field<String> = Field.Omitted, public val `authUrl`: Field<String> = Field.Omitted, public val `tokenUrl`: Field<String> = Field.Omitted, public val `userInfoUrl`: Field<String> = Field.Omitted, public val `requiresPkce`: Field<Boolean> = Field.Omitted) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("clientId", this@OrganizationEnterpriseConnectionOidcInput.`clientId`.toJson { value -> JsonPrimitive(value) })
    putPresent("clientSecret", this@OrganizationEnterpriseConnectionOidcInput.`clientSecret`.toJson { value -> JsonPrimitive(value) })
    putPresent("discoveryUrl", this@OrganizationEnterpriseConnectionOidcInput.`discoveryUrl`.toJson { value -> JsonPrimitive(value) })
    putPresent("authUrl", this@OrganizationEnterpriseConnectionOidcInput.`authUrl`.toJson { value -> JsonPrimitive(value) })
    putPresent("tokenUrl", this@OrganizationEnterpriseConnectionOidcInput.`tokenUrl`.toJson { value -> JsonPrimitive(value) })
    putPresent("userInfoUrl", this@OrganizationEnterpriseConnectionOidcInput.`userInfoUrl`.toJson { value -> JsonPrimitive(value) })
    putPresent("requiresPkce", this@OrganizationEnterpriseConnectionOidcInput.`requiresPkce`.toJson { value -> JsonPrimitive(value) })
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationEnterpriseConnectionOidcInput {
      val values = value.jsonObject

      return OrganizationEnterpriseConnectionOidcInput(`clientId` = Field.fromJson((values["clientId"] ?: Undefined)) { value -> value.requireString() }, `clientSecret` = Field.fromJson((values["clientSecret"] ?: Undefined)) { value -> value.requireString() }, `discoveryUrl` = Field.fromJson((values["discoveryUrl"] ?: Undefined)) { value -> value.requireString() }, `authUrl` = Field.fromJson((values["authUrl"] ?: Undefined)) { value -> value.requireString() }, `tokenUrl` = Field.fromJson((values["tokenUrl"] ?: Undefined)) { value -> value.requireString() }, `userInfoUrl` = Field.fromJson((values["userInfoUrl"] ?: Undefined)) { value -> value.requireString() }, `requiresPkce` = Field.fromJson((values["requiresPkce"] ?: Undefined)) { value -> value.requireBoolean() })
    }
  }
}

public data class UpdateOrganizationEnterpriseConnectionParams(public val `name`: Field<String> = Field.Omitted, public val `domains`: List<String>? = null, public val `active`: Field<Boolean> = Field.Omitted, public val `syncUserAttributes`: Field<Boolean> = Field.Omitted, public val `disableAdditionalIdentifications`: Field<Boolean> = Field.Omitted, public val `organizationId`: Field<String> = Field.Omitted, public val `customAttributes`: Field<Map<String, JsonElement>> = Field.Omitted, public val `saml`: Field<OrganizationEnterpriseConnectionSamlInput> = Field.Omitted, public val `oidc`: Field<OrganizationEnterpriseConnectionOidcInput> = Field.Omitted) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("name", this@UpdateOrganizationEnterpriseConnectionParams.`name`.toJson { value -> JsonPrimitive(value) })
    putPresent("domains", this@UpdateOrganizationEnterpriseConnectionParams.`domains`?.let { value -> JsonArray(value.map { value -> JsonPrimitive(value) }) } ?: Undefined)
    putPresent("active", this@UpdateOrganizationEnterpriseConnectionParams.`active`.toJson { value -> JsonPrimitive(value) })
    putPresent("syncUserAttributes", this@UpdateOrganizationEnterpriseConnectionParams.`syncUserAttributes`.toJson { value -> JsonPrimitive(value) })
    putPresent("disableAdditionalIdentifications", this@UpdateOrganizationEnterpriseConnectionParams.`disableAdditionalIdentifications`.toJson { value -> JsonPrimitive(value) })
    putPresent("organizationId", this@UpdateOrganizationEnterpriseConnectionParams.`organizationId`.toJson { value -> JsonPrimitive(value) })
    putPresent("customAttributes", this@UpdateOrganizationEnterpriseConnectionParams.`customAttributes`.toJson { value -> JsonObject(value.mapValues { (_, value) -> value }) })
    putPresent("saml", this@UpdateOrganizationEnterpriseConnectionParams.`saml`.toJson { value -> value.toJson() })
    putPresent("oidc", this@UpdateOrganizationEnterpriseConnectionParams.`oidc`.toJson { value -> value.toJson() })
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UpdateOrganizationEnterpriseConnectionParams {
      val values = value.jsonObject

      return UpdateOrganizationEnterpriseConnectionParams(`name` = Field.fromJson((values["name"] ?: Undefined)) { value -> value.requireString() }, `domains` = (values["domains"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> value.requireString() } }, `active` = Field.fromJson((values["active"] ?: Undefined)) { value -> value.requireBoolean() }, `syncUserAttributes` = Field.fromJson((values["syncUserAttributes"] ?: Undefined)) { value -> value.requireBoolean() }, `disableAdditionalIdentifications` = Field.fromJson((values["disableAdditionalIdentifications"] ?: Undefined)) { value -> value.requireBoolean() }, `organizationId` = Field.fromJson((values["organizationId"] ?: Undefined)) { value -> value.requireString() }, `customAttributes` = Field.fromJson((values["customAttributes"] ?: Undefined)) { value -> value.jsonObject.mapValues { (_, value) -> value } }, `saml` = Field.fromJson((values["saml"] ?: Undefined)) { value -> OrganizationEnterpriseConnectionSamlInput.fromJson(value, runtime) }, `oidc` = Field.fromJson((values["oidc"] ?: Undefined)) { value -> OrganizationEnterpriseConnectionOidcInput.fromJson(value, runtime) })
    }
  }
}

/**
 * The `DeletedObjectResource` type represents an item that has been deleted from the database.
 */
public data class DeletedObject(public val `object`: String, public val `id`: String? = null, public val `slug`: String? = null, public val `deleted`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("object", JsonPrimitive(this@DeletedObject.`object`))
    putPresent("id", this@DeletedObject.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("slug", this@DeletedObject.`slug`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("deleted", JsonPrimitive(this@DeletedObject.`deleted`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): DeletedObject {
      val values = value.jsonObject

      return DeletedObject(`object` = (values["object"] ?: Undefined).requireString(), `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() }, `slug` = (values["slug"] ?: Undefined).decodeOptional { value -> value.requireString() }, `deleted` = (values["deleted"] ?: Undefined).requireBoolean())
    }
  }
}

public data class EnterpriseConnectionTestRunInit(public val `url`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("url", JsonPrimitive(this@EnterpriseConnectionTestRunInit.`url`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnectionTestRunInit {
      val values = value.jsonObject

      return EnterpriseConnectionTestRunInit(`url` = (values["url"] ?: Undefined).requireString())
    }
  }
}

public data class GetEnterpriseConnectionTestRunsParams(public val `initialPage`: Double? = null, public val `pageSize`: Double? = null, public val `status`: List<EnterpriseConnectionTestRunStatus>? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("initialPage", this@GetEnterpriseConnectionTestRunsParams.`initialPage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("pageSize", this@GetEnterpriseConnectionTestRunsParams.`pageSize`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("status", this@GetEnterpriseConnectionTestRunsParams.`status`?.let { value -> JsonArray(value.map { value -> value.toJson() }) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetEnterpriseConnectionTestRunsParams {
      val values = value.jsonObject

      return GetEnterpriseConnectionTestRunsParams(`initialPage` = (values["initialPage"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `pageSize` = (values["pageSize"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `status` = (values["status"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> EnterpriseConnectionTestRunStatus.fromJson(value, runtime) } })
    }
  }
}

public sealed class EnterpriseConnectionTestRunStatus(public val rawValue: String) {
  public data object Failed : EnterpriseConnectionTestRunStatus("failed")
  public data object Pending : EnterpriseConnectionTestRunStatus("pending")
  public data object Success : EnterpriseConnectionTestRunStatus("success")
  public data class Unrecognized(val value: String) : EnterpriseConnectionTestRunStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnectionTestRunStatus = when (val raw = value.requireString()) {
      "failed" -> Failed
      "pending" -> Pending
      "success" -> Success
      else -> Unrecognized(raw)
    }
  }
}

/**
 * An interface that describes the response of a method that returns a paginated list of resources.
 *
 * > [!TIP]
 * > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
 */
public data class ClerkPaginatedResponseEnterpriseConnectionTestRun(public val `data`: List<EnterpriseConnectionTestRun>, public val `totalCount`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("data", JsonArray(this@ClerkPaginatedResponseEnterpriseConnectionTestRun.`data`.map { value -> value.toJson() }))
    putPresent("total_count", JsonPrimitive(this@ClerkPaginatedResponseEnterpriseConnectionTestRun.`totalCount`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkPaginatedResponseEnterpriseConnectionTestRun {
      val values = value.jsonObject

      return ClerkPaginatedResponseEnterpriseConnectionTestRun(`data` = (values["data"] ?: Undefined).jsonArray.map { value -> EnterpriseConnectionTestRun.fromJson(value, runtime) }, `totalCount` = (values["total_count"] ?: Undefined).requireDouble())
    }
  }
}

public data class EnterpriseConnectionTestRunState(public val `id`: String, public val `status`: String, public val `connectionType`: EnterpriseConnectionTestRunConnectionType, public val `parsedUserInfo`: EnterpriseConnectionTestRunParsedUserInfo?, public val `logs`: List<EnterpriseConnectionTestRunLog>, public val `saml`: EnterpriseConnectionTestRunSamlPayload?, public val `oauth`: EnterpriseConnectionTestRunOauthPayload?, public val `createdAt`: Instant?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@EnterpriseConnectionTestRunState.`id`))
    putPresent("status", JsonPrimitive(this@EnterpriseConnectionTestRunState.`status`))
    putPresent("connectionType", this@EnterpriseConnectionTestRunState.`connectionType`.toJson())
    putPresent("parsedUserInfo", this@EnterpriseConnectionTestRunState.`parsedUserInfo`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("logs", JsonArray(this@EnterpriseConnectionTestRunState.`logs`.map { value -> value.toJson() }))
    putPresent("saml", this@EnterpriseConnectionTestRunState.`saml`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("oauth", this@EnterpriseConnectionTestRunState.`oauth`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("createdAt", this@EnterpriseConnectionTestRunState.`createdAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnectionTestRunState {
      val values = value.jsonObject

      return EnterpriseConnectionTestRunState(`id` = (values["id"] ?: Undefined).requireString(), `status` = (values["status"] ?: Undefined).requireString(), `connectionType` = EnterpriseConnectionTestRunConnectionType.fromJson((values["connectionType"] ?: Undefined), runtime), `parsedUserInfo` = (values["parsedUserInfo"] ?: Undefined).decodeOptional { value -> EnterpriseConnectionTestRunParsedUserInfo.fromJson(value, runtime) }, `logs` = (values["logs"] ?: Undefined).jsonArray.map { value -> EnterpriseConnectionTestRunLog.fromJson(value, runtime) }, `saml` = (values["saml"] ?: Undefined).decodeOptional { value -> EnterpriseConnectionTestRunSamlPayload.fromJson(value, runtime) }, `oauth` = (values["oauth"] ?: Undefined).decodeOptional { value -> EnterpriseConnectionTestRunOauthPayload.fromJson(value, runtime) }, `createdAt` = (values["createdAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) })
    }
  }
}
public class EnterpriseConnectionTestRun(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: EnterpriseConnectionTestRunState get() = context.state(handle)
  public val changes: Flow<EnterpriseConnectionTestRunState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `status`: String get() = state.`status`
  public val `connectionType`: EnterpriseConnectionTestRunConnectionType get() = state.`connectionType`
  public val `parsedUserInfo`: EnterpriseConnectionTestRunParsedUserInfo? get() = state.`parsedUserInfo`
  public val `logs`: List<EnterpriseConnectionTestRunLog> get() = state.`logs`
  public val `saml`: EnterpriseConnectionTestRunSamlPayload? get() = state.`saml`
  public val `oauth`: EnterpriseConnectionTestRunOauthPayload? get() = state.`oauth`
  public val `createdAt`: Instant? get() = state.`createdAt`
  override fun prepare(value: JsonElement): Any = EnterpriseConnectionTestRunState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnectionTestRun = runtime.resource(ResourceHandle.fromReference(value)) as EnterpriseConnectionTestRun
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): EnterpriseConnectionTestRun {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EnterpriseConnectionTestRun.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      EnterpriseConnectionTestRun.fromJson(result, runtime)
    }
  }
}

public sealed class EnterpriseConnectionTestRunConnectionType(public val rawValue: String) {
  public data object Saml : EnterpriseConnectionTestRunConnectionType("saml")
  public data object Oauth : EnterpriseConnectionTestRunConnectionType("oauth")
  public data class Unrecognized(val value: String) : EnterpriseConnectionTestRunConnectionType(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnectionTestRunConnectionType = when (val raw = value.requireString()) {
      "saml" -> Saml
      "oauth" -> Oauth
      else -> Unrecognized(raw)
    }
  }
}

public data class EnterpriseConnectionTestRunParsedUserInfo(public val `emailAddress`: String? = null, public val `firstName`: String? = null, public val `lastName`: String? = null, public val `userId`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddress", this@EnterpriseConnectionTestRunParsedUserInfo.`emailAddress`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("firstName", this@EnterpriseConnectionTestRunParsedUserInfo.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@EnterpriseConnectionTestRunParsedUserInfo.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("userId", this@EnterpriseConnectionTestRunParsedUserInfo.`userId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnectionTestRunParsedUserInfo {
      val values = value.jsonObject

      return EnterpriseConnectionTestRunParsedUserInfo(`emailAddress` = (values["emailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() }, `firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `userId` = (values["userId"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class EnterpriseConnectionTestRunLog(public val `level`: String? = null, public val `code`: String? = null, public val `shortMessage`: String? = null, public val `message`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("level", this@EnterpriseConnectionTestRunLog.`level`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("code", this@EnterpriseConnectionTestRunLog.`code`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("shortMessage", this@EnterpriseConnectionTestRunLog.`shortMessage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("message", this@EnterpriseConnectionTestRunLog.`message`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnectionTestRunLog {
      val values = value.jsonObject

      return EnterpriseConnectionTestRunLog(`level` = (values["level"] ?: Undefined).decodeOptional { value -> value.requireString() }, `code` = (values["code"] ?: Undefined).decodeOptional { value -> value.requireString() }, `shortMessage` = (values["shortMessage"] ?: Undefined).decodeOptional { value -> value.requireString() }, `message` = (values["message"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class EnterpriseConnectionTestRunSamlPayload(public val `samlRequest`: String? = null, public val `samlResponse`: String? = null, public val `relayState`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("samlRequest", this@EnterpriseConnectionTestRunSamlPayload.`samlRequest`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("samlResponse", this@EnterpriseConnectionTestRunSamlPayload.`samlResponse`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("relayState", this@EnterpriseConnectionTestRunSamlPayload.`relayState`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnectionTestRunSamlPayload {
      val values = value.jsonObject

      return EnterpriseConnectionTestRunSamlPayload(`samlRequest` = (values["samlRequest"] ?: Undefined).decodeOptional { value -> value.requireString() }, `samlResponse` = (values["samlResponse"] ?: Undefined).decodeOptional { value -> value.requireString() }, `relayState` = (values["relayState"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class EnterpriseConnectionTestRunOauthPayload(public val `userInfo`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("userInfo", this@EnterpriseConnectionTestRunOauthPayload.`userInfo`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseConnectionTestRunOauthPayload {
      val values = value.jsonObject

      return EnterpriseConnectionTestRunOauthPayload(`userInfo` = (values["userInfo"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SetOrganizationLogoParams(public val `file`: SetOrganizationLogoParamsFile?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("file", this@SetOrganizationLogoParams.`file`?.let { value -> value.toJson() } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SetOrganizationLogoParams {
      val values = value.jsonObject

      return SetOrganizationLogoParams(`file` = (values["file"] ?: Undefined).decodeOptional { value -> SetOrganizationLogoParamsFile.fromJson(value, runtime) })
    }
  }
}

public sealed interface SetOrganizationLogoParamsFile {
  public data class Case1(val value: String) : SetOrganizationLogoParamsFile
  public data class Case2(val value: UploadFile) : SetOrganizationLogoParamsFile
  public data class Case3(val value: UploadFile) : SetOrganizationLogoParamsFile
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to JsonPrimitive(value)))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SetOrganizationLogoParamsFile {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(payload.requireString())
        1 -> Case2(UploadFile.fromJson(payload))
        2 -> Case3(UploadFile.fromJson(payload))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public class InitializePaymentMethodParams() {
  public val `gateway`: String get() = "stripe"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("gateway", JsonPrimitive("stripe"))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): InitializePaymentMethodParams {
      val values = value.jsonObject
      require(values["gateway"] == JsonPrimitive("stripe"))
      return InitializePaymentMethodParams()
    }
  }
}

/**
 * The `BillingInitializedPaymentMethodResource` type represents a payment method that has been initialized for checkout session.
 */
public data class BillingInitializedPaymentMethodState(public val `externalClientSecret`: String, public val `externalGatewayId`: String, public val `paymentMethodOrder`: List<String>, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("externalClientSecret", JsonPrimitive(this@BillingInitializedPaymentMethodState.`externalClientSecret`))
    putPresent("externalGatewayId", JsonPrimitive(this@BillingInitializedPaymentMethodState.`externalGatewayId`))
    putPresent("paymentMethodOrder", JsonArray(this@BillingInitializedPaymentMethodState.`paymentMethodOrder`.map { value -> JsonPrimitive(value) }))
    putPresent("id", this@BillingInitializedPaymentMethodState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BillingInitializedPaymentMethodState {
      val values = value.jsonObject

      return BillingInitializedPaymentMethodState(`externalClientSecret` = (values["externalClientSecret"] ?: Undefined).requireString(), `externalGatewayId` = (values["externalGatewayId"] ?: Undefined).requireString(), `paymentMethodOrder` = (values["paymentMethodOrder"] ?: Undefined).jsonArray.map { value -> value.requireString() }, `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}
public class BillingInitializedPaymentMethod(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: BillingInitializedPaymentMethodState get() = context.state(handle)
  public val changes: Flow<BillingInitializedPaymentMethodState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `externalClientSecret`: String get() = state.`externalClientSecret`
  public val `externalGatewayId`: String get() = state.`externalGatewayId`
  public val `paymentMethodOrder`: List<String> get() = state.`paymentMethodOrder`
  public val `id`: String? get() = state.`id`
  override fun prepare(value: JsonElement): Any = BillingInitializedPaymentMethodState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BillingInitializedPaymentMethod = runtime.resource(ResourceHandle.fromReference(value)) as BillingInitializedPaymentMethod
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): BillingInitializedPaymentMethod {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BillingInitializedPaymentMethod.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      BillingInitializedPaymentMethod.fromJson(result, runtime)
    }
  }
}

public data class AddPaymentMethodParams(public val `paymentToken`: String) {
  public val `gateway`: String get() = "stripe"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("gateway", JsonPrimitive("stripe"))
    putPresent("paymentToken", JsonPrimitive(this@AddPaymentMethodParams.`paymentToken`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AddPaymentMethodParams {
      val values = value.jsonObject
      require(values["gateway"] == JsonPrimitive("stripe"))
      return AddPaymentMethodParams(`paymentToken` = (values["paymentToken"] ?: Undefined).requireString())
    }
  }
}

/**
 * The `BillingPaymentMethodResource` type represents a payment method for a checkout session.
 */
public data class BillingPaymentMethodState(public val `id`: String, public val `last4`: String?, public val `paymentType`: String? = null, public val `cardType`: String?, public val `isDefault`: Boolean? = null, public val `isRemovable`: Boolean? = null, public val `status`: BillingPaymentMethodStatus, public val `walletType`: Field<String> = Field.Omitted, public val `expiryYear`: Field<Double> = Field.Omitted, public val `expiryMonth`: Field<Double> = Field.Omitted, public val `createdAt`: Field<Instant> = Field.Omitted, public val `updatedAt`: Field<Instant> = Field.Omitted) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@BillingPaymentMethodState.`id`))
    putPresent("last4", this@BillingPaymentMethodState.`last4`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("paymentType", this@BillingPaymentMethodState.`paymentType`?.let { value -> JsonPrimitive("card") } ?: Undefined)
    putPresent("cardType", this@BillingPaymentMethodState.`cardType`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("isDefault", this@BillingPaymentMethodState.`isDefault`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("isRemovable", this@BillingPaymentMethodState.`isRemovable`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("status", this@BillingPaymentMethodState.`status`.toJson())
    putPresent("walletType", this@BillingPaymentMethodState.`walletType`.toJson { value -> JsonPrimitive(value) })
    putPresent("expiryYear", this@BillingPaymentMethodState.`expiryYear`.toJson { value -> JsonPrimitive(value) })
    putPresent("expiryMonth", this@BillingPaymentMethodState.`expiryMonth`.toJson { value -> JsonPrimitive(value) })
    putPresent("createdAt", this@BillingPaymentMethodState.`createdAt`.toJson { value -> JsonPrimitive(value.toString()) })
    putPresent("updatedAt", this@BillingPaymentMethodState.`updatedAt`.toJson { value -> JsonPrimitive(value.toString()) })
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BillingPaymentMethodState {
      val values = value.jsonObject

      return BillingPaymentMethodState(`id` = (values["id"] ?: Undefined).requireString(), `last4` = (values["last4"] ?: Undefined).decodeOptional { value -> value.requireString() }, `paymentType` = (values["paymentType"] ?: Undefined).decodeOptional { value -> value.requireLiteral(JsonPrimitive("card")).requireString() }, `cardType` = (values["cardType"] ?: Undefined).decodeOptional { value -> value.requireString() }, `isDefault` = (values["isDefault"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `isRemovable` = (values["isRemovable"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `status` = BillingPaymentMethodStatus.fromJson((values["status"] ?: Undefined), runtime), `walletType` = Field.fromJson((values["walletType"] ?: Undefined)) { value -> value.requireString() }, `expiryYear` = Field.fromJson((values["expiryYear"] ?: Undefined)) { value -> value.requireDouble() }, `expiryMonth` = Field.fromJson((values["expiryMonth"] ?: Undefined)) { value -> value.requireDouble() }, `createdAt` = Field.fromJson((values["createdAt"] ?: Undefined)) { value -> Instant.parse(value.requireString()) }, `updatedAt` = Field.fromJson((values["updatedAt"] ?: Undefined)) { value -> Instant.parse(value.requireString()) })
    }
  }
}
public class BillingPaymentMethod(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: BillingPaymentMethodState get() = context.state(handle)
  public val changes: Flow<BillingPaymentMethodState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `last4`: String? get() = state.`last4`
  public val `paymentType`: String? get() = state.`paymentType`
  public val `cardType`: String? get() = state.`cardType`
  public val `isDefault`: Boolean? get() = state.`isDefault`
  public val `isRemovable`: Boolean? get() = state.`isRemovable`
  public val `status`: BillingPaymentMethodStatus get() = state.`status`
  public val `walletType`: Field<String> get() = state.`walletType`
  public val `expiryYear`: Field<Double> get() = state.`expiryYear`
  public val `expiryMonth`: Field<Double> get() = state.`expiryMonth`
  public val `createdAt`: Field<Instant> get() = state.`createdAt`
  public val `updatedAt`: Field<Instant> get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = BillingPaymentMethodState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BillingPaymentMethod = runtime.resource(ResourceHandle.fromReference(value)) as BillingPaymentMethod
  }
  /**
   * A function that removes this payment method from the account. Accepts the following parameters:
   * <ul>
   *  <li>`orgId?` (`string`): The ID of the Organization to remove the payment method from.</li>
   * </ul>
   */
  public suspend fun `remove`(`params`: BillingPaymentMethodRemoveParams? = null): DeletedObject {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BillingPaymentMethod.remove", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      DeletedObject.fromJson(result, runtime)
    }
  }
  /**
   * A function that sets this payment method as the default for the account. Accepts the following parameters:
   * <ul>
   *  <li>`orgId?` (`string`): The ID of the Organization to set as the default.</li>
   * </ul>
   */
  public suspend fun `makeDefault`(`params`: BillingPaymentMethodRemoveParams? = null): JsonElement {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BillingPaymentMethod.makeDefault", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      result
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): BillingPaymentMethod {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BillingPaymentMethod.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      BillingPaymentMethod.fromJson(result, runtime)
    }
  }
}

/**
 * The status of a payment method.
 */
public sealed class BillingPaymentMethodStatus(public val rawValue: String) {
  public data object Expired : BillingPaymentMethodStatus("expired")
  public data object Active : BillingPaymentMethodStatus("active")
  public data object Disconnected : BillingPaymentMethodStatus("disconnected")
  public data class Unrecognized(val value: String) : BillingPaymentMethodStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BillingPaymentMethodStatus = when (val raw = value.requireString()) {
      "expired" -> Expired
      "active" -> Active
      "disconnected" -> Disconnected
      else -> Unrecognized(raw)
    }
  }
}

public data class BillingPaymentMethodRemoveParams(public val `orgId`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("orgId", this@BillingPaymentMethodRemoveParams.`orgId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BillingPaymentMethodRemoveParams {
      val values = value.jsonObject

      return BillingPaymentMethodRemoveParams(`orgId` = (values["orgId"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class GetPaymentMethodsParams(public val `initialPage`: Double? = null, public val `pageSize`: Double? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("initialPage", this@GetPaymentMethodsParams.`initialPage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("pageSize", this@GetPaymentMethodsParams.`pageSize`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetPaymentMethodsParams {
      val values = value.jsonObject

      return GetPaymentMethodsParams(`initialPage` = (values["initialPage"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `pageSize` = (values["pageSize"] ?: Undefined).decodeOptional { value -> value.requireDouble() })
    }
  }
}

/**
 * An interface that describes the response of a method that returns a paginated list of resources.
 *
 * > [!TIP]
 * > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
 */
public data class ClerkPaginatedResponseBillingPaymentMethod(public val `data`: List<BillingPaymentMethod>, public val `totalCount`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("data", JsonArray(this@ClerkPaginatedResponseBillingPaymentMethod.`data`.map { value -> value.toJson() }))
    putPresent("total_count", JsonPrimitive(this@ClerkPaginatedResponseBillingPaymentMethod.`totalCount`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkPaginatedResponseBillingPaymentMethod {
      val values = value.jsonObject

      return ClerkPaginatedResponseBillingPaymentMethod(`data` = (values["data"] ?: Undefined).jsonArray.map { value -> BillingPaymentMethod.fromJson(value, runtime) }, `totalCount` = (values["total_count"] ?: Undefined).requireDouble())
    }
  }
}

/**
 * The `Session` object is an abstraction over an HTTP session. It models the period of information exchange between a user and the server.
 *
 * The `Session` object includes methods for recording session activity and ending the session client-side. For security reasons, sessions can also expire server-side.
 *
 * As soon as a [`User`](https://clerk.com/docs/reference/objects/user) signs in, Clerk creates a `Session` for the current [`Client`](https://clerk.com/docs/reference/objects/client). Clients can have more than one sessions at any point in time, but only one of those sessions will be **active**.
 *
 * In certain scenarios, a session might be replaced by another one. This is often the case with [multi-session applications](https://clerk.com/docs/guides/secure/session-options#multi-session-applications).
 *
 * All sessions that are **expired**, **removed**, **replaced**, **ended** or **abandoned** are not considered valid.
 *
 * > [!NOTE]
 * > For more information regarding the different session states, see the [guide on session management](https://clerk.com/docs/guides/secure/session-options).
 */
public data class SessionState(public val `id`: String, public val `status`: SessionStatus, public val `expireAt`: Instant, public val `abandonAt`: Instant, public val `factorVerificationAge`: SessionFactorVerificationAgeValue?, public val `lastActiveOrganizationId`: String?, public val `lastActiveAt`: Instant, public val `actor`: JsonObject?, public val `agent`: JsonObject?, public val `tasks`: List<SessionTask>?, public val `currentTask`: SessionTask? = null, public val `user`: User?, public val `publicUserData`: PublicUserData, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@SessionState.`id`))
    putPresent("status", this@SessionState.`status`.toJson())
    putPresent("expireAt", JsonPrimitive(this@SessionState.`expireAt`.toString()))
    putPresent("abandonAt", JsonPrimitive(this@SessionState.`abandonAt`.toString()))
    putPresent("factorVerificationAge", this@SessionState.`factorVerificationAge`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("lastActiveOrganizationId", this@SessionState.`lastActiveOrganizationId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("lastActiveAt", JsonPrimitive(this@SessionState.`lastActiveAt`.toString()))
    putPresent("actor", this@SessionState.`actor`?.let { value -> value } ?: JsonNull)
    putPresent("agent", this@SessionState.`agent`?.let { value -> value } ?: JsonNull)
    putPresent("tasks", this@SessionState.`tasks`?.let { value -> JsonArray(value.map { value -> value.toJson() }) } ?: JsonNull)
    putPresent("currentTask", this@SessionState.`currentTask`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("user", this@SessionState.`user`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("publicUserData", this@SessionState.`publicUserData`.toJson())
    putPresent("createdAt", JsonPrimitive(this@SessionState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@SessionState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionState {
      val values = value.jsonObject

      return SessionState(`id` = (values["id"] ?: Undefined).requireString(), `status` = SessionStatus.fromJson((values["status"] ?: Undefined), runtime), `expireAt` = Instant.parse((values["expireAt"] ?: Undefined).requireString()), `abandonAt` = Instant.parse((values["abandonAt"] ?: Undefined).requireString()), `factorVerificationAge` = (values["factorVerificationAge"] ?: Undefined).decodeOptional { value -> SessionFactorVerificationAgeValue.fromJson(value, runtime) }, `lastActiveOrganizationId` = (values["lastActiveOrganizationId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastActiveAt` = Instant.parse((values["lastActiveAt"] ?: Undefined).requireString()), `actor` = (values["actor"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `agent` = (values["agent"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `tasks` = (values["tasks"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> SessionTask.fromJson(value, runtime) } }, `currentTask` = (values["currentTask"] ?: Undefined).decodeOptional { value -> SessionTask.fromJson(value, runtime) }, `user` = (values["user"] ?: Undefined).decodeOptional { value -> User.fromJson(value, runtime) }, `publicUserData` = PublicUserData.fromJson((values["publicUserData"] ?: Undefined), runtime), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class Session(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SessionState get() = context.state(handle)
  public val changes: Flow<SessionState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `status`: SessionStatus get() = state.`status`
  public val `expireAt`: Instant get() = state.`expireAt`
  public val `abandonAt`: Instant get() = state.`abandonAt`
  public val `factorVerificationAge`: SessionFactorVerificationAgeValue? get() = state.`factorVerificationAge`
  public val `lastActiveOrganizationId`: String? get() = state.`lastActiveOrganizationId`
  public val `lastActiveAt`: Instant get() = state.`lastActiveAt`
  public val `actor`: JsonObject? get() = state.`actor`
  public val `agent`: JsonObject? get() = state.`agent`
  public val `tasks`: List<SessionTask>? get() = state.`tasks`
  public val `currentTask`: SessionTask? get() = state.`currentTask`
  public val `user`: User? get() = state.`user`
  public val `publicUserData`: PublicUserData get() = state.`publicUserData`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = SessionState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Session = runtime.resource(ResourceHandle.fromReference(value)) as Session
  }
  /**
   * Marks the session as ended. The session will no longer be active for this `Client` and its status will become **ended**.
   */
  public suspend fun `end`(): Session {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.end", listOf()) { result ->
      Session.fromJson(result, runtime)
    }
  }
  /**
   * Invalidates the current session by marking it as removed. Once removed, the session will be deactivated for the current Client instance and its `status` will be set to `removed`. This operation cannot be undone.
   */
  public suspend fun `remove`(): Session {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.remove", listOf()) { result ->
      Session.fromJson(result, runtime)
    }
  }
  /**
   * Updates the session's last active timestamp to the current time. This method should be called periodically to indicate ongoing user activity and prevent the session from becoming stale. The updated timestamp is used for session management and analytics purposes.
   */
  public suspend fun `touch`(`params`: SessionTouchParams? = null): Session {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.touch", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Session.fromJson(result, runtime)
    }
  }
  /**
   * Gets the current user's [session token](https://clerk.com/docs/guides/sessions/session-tokens) or a [custom JWT template](https://clerk.com/docs/guides/sessions/jwt-templates).
   *
   * This method uses a cache so a network request will only be made if the token in memory has expired. The TTL for a Clerk token is one minute. It retries on transient failures (e.g., network errors); when the browser is offline and retries are exhausted, it throws `ClerkOfflineError`.
   *
   * Tokens can only be generated if the user is signed in.
   */
  public suspend fun `getToken`(`options`: GetTokenOptions? = null): String? {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.getToken", listOf(`options`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      result.decodeOptional { value -> value.requireString() }
    }
  }
  /**
   * Checks if the user is [authorized for the specified Role, Permission, Feature, or Plan](https://clerk.com/docs/guides/secure/authorization-checks) or requires the user to [reverify their credentials](https://clerk.com/docs/guides/secure/reverification) if their last verification is older than allowed.
   */
  public suspend fun `checkAuthorization`(`isAuthorizedParams`: CheckAuthorizationParams): Boolean {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.checkAuthorization", listOf(`isAuthorizedParams`.toJson())) { result ->
      result.requireBoolean()
    }
  }
  /**
   * Clears the cache for the current session. This is useful if the session has been updated and the cache is no longer valid.
   */
  public suspend fun `clearCache`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.clearCache", listOf()) { result ->
      Unit
    }
  }
  /**
   * Initiates the reverification flow.
   */
  public suspend fun `startVerification`(`params`: SessionVerifyCreateParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.startVerification", listOf(`params`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Initiates the [first factor verification](!first-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
   */
  public suspend fun `prepareFirstFactorVerification`(`factor`: SessionVerifyPrepareFirstFactorParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.prepareFirstFactorVerification", listOf(`factor`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Attempts to complete the [first factor verification](!first-factor-verification) process.
   */
  public suspend fun `attemptFirstFactorVerification`(`attemptFactor`: SessionVerifyAttemptFirstFactorParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.attemptFirstFactorVerification", listOf(`attemptFactor`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Initiates the [second factor verification](!second-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
   */
  public suspend fun `prepareSecondFactorVerification`(`params`: PhoneCodeSecondFactorConfig): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.prepareSecondFactorVerification", listOf(`params`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Attempts to complete the [second factor verification](!second-factor-verification) process.
   */
  public suspend fun `attemptSecondFactorVerification`(`params`: SessionVerifyAttemptSecondFactorParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.attemptSecondFactorVerification", listOf(`params`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Initiates a verification flow using passkeys.
   */
  public suspend fun `verifyWithPasskey`(): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.verifyWithPasskey", listOf()) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): Session {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Session.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Session.fromJson(result, runtime)
    }
  }
}

/**
 * The current state of the session.
 */
public sealed class SessionStatus(public val rawValue: String) {
  public data object Expired : SessionStatus("expired")
  public data object Abandoned : SessionStatus("abandoned")
  public data object Active : SessionStatus("active")
  public data object Ended : SessionStatus("ended")
  public data object Pending : SessionStatus("pending")
  public data object Revoked : SessionStatus("revoked")
  public data object Removed : SessionStatus("removed")
  public data object Replaced : SessionStatus("replaced")
  public data class Unrecognized(val value: String) : SessionStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionStatus = when (val raw = value.requireString()) {
      "expired" -> Expired
      "abandoned" -> Abandoned
      "active" -> Active
      "ended" -> Ended
      "pending" -> Pending
      "revoked" -> Revoked
      "removed" -> Removed
      "replaced" -> Replaced
      else -> Unrecognized(raw)
    }
  }
}

/**
 * Represents the current pending task of a session.
 */
public data class SessionTask(public val `key`: SessionTaskKey) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("key", this@SessionTask.`key`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionTask {
      val values = value.jsonObject

      return SessionTask(`key` = SessionTaskKey.fromJson((values["key"] ?: Undefined), runtime))
    }
  }
}

public sealed class SessionTaskKey(public val rawValue: String) {
  public data object ChooseOrganization : SessionTaskKey("choose-organization")
  public data object ResetPassword : SessionTaskKey("reset-password")
  public data object SetupMfa : SessionTaskKey("setup-mfa")
  public data class Unrecognized(val value: String) : SessionTaskKey(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionTaskKey = when (val raw = value.requireString()) {
      "choose-organization" -> ChooseOrganization
      "reset-password" -> ResetPassword
      "setup-mfa" -> SetupMfa
      else -> Unrecognized(raw)
    }
  }
}

/**
 * The `User` object holds all of the information for a single user of your application and provides a set of methods to manage their account. Each `User` has at least one authentication identifier, which might be their email address, phone number, or a username.
 *
 * A user can be contacted at their primary email address or primary phone number. They can have more than one registered email address or phone number, but only one of them will be their primary email address (`User.primaryEmailAddress`) or primary phone number (`User.primaryPhoneNumber`). At the same time, a user can also have one or more external accounts by connecting to [social providers](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/overview) such as Google, Apple, Facebook, and many more (`User.externalAccounts`).
 *
 * Finally, a `User` object holds profile data like the user's name, profile picture, and a set of [metadata](https://clerk.com/docs/guides/users/extending) that can be used internally to store arbitrary information. The metadata are split into `publicMetadata` and `privateMetadata`. Both types are set from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}, but public metadata can also be accessed from the [Frontend API](https://clerk.com/docs/reference/frontend-api){{ target: '_blank' }}.
 */
public data class UserState(public val `id`: String, public val `externalId`: String?, public val `primaryEmailAddressId`: String?, public val `primaryEmailAddress`: EmailAddress?, public val `primaryPhoneNumberId`: String?, public val `primaryPhoneNumber`: PhoneNumber?, public val `primaryWeb3WalletId`: String?, public val `primaryWeb3Wallet`: Web3Wallet?, public val `username`: String?, public val `fullName`: String?, public val `firstName`: String?, public val `lastName`: String?, public val `imageUrl`: String, public val `hasImage`: Boolean, public val `emailAddresses`: List<EmailAddress>, public val `phoneNumbers`: List<PhoneNumber>, public val `web3Wallets`: List<Web3Wallet>, public val `externalAccounts`: List<ExternalAccount>, public val `enterpriseAccounts`: List<EnterpriseAccount>, public val `passkeys`: List<Passkey>, public val `organizationMemberships`: List<OrganizationMembership>, public val `passwordEnabled`: Boolean, public val `totpEnabled`: Boolean, public val `backupCodeEnabled`: Boolean, public val `twoFactorEnabled`: Boolean, public val `publicMetadata`: JsonObject, public val `unsafeMetadata`: JsonObject, public val `lastSignInAt`: Instant?, public val `legalAcceptedAt`: Instant?, public val `createOrganizationEnabled`: Boolean, public val `createOrganizationsLimit`: Double?, public val `deleteSelfEnabled`: Boolean, public val `updatedAt`: Instant?, public val `createdAt`: Instant?, public val `verifiedExternalAccounts`: List<ExternalAccount>, public val `unverifiedExternalAccounts`: List<ExternalAccount>, public val `verifiedWeb3Wallets`: List<Web3Wallet>, public val `hasVerifiedEmailAddress`: Boolean, public val `hasVerifiedPhoneNumber`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@UserState.`id`))
    putPresent("externalId", this@UserState.`externalId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("primaryEmailAddressId", this@UserState.`primaryEmailAddressId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("primaryEmailAddress", this@UserState.`primaryEmailAddress`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("primaryPhoneNumberId", this@UserState.`primaryPhoneNumberId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("primaryPhoneNumber", this@UserState.`primaryPhoneNumber`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("primaryWeb3WalletId", this@UserState.`primaryWeb3WalletId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("primaryWeb3Wallet", this@UserState.`primaryWeb3Wallet`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("username", this@UserState.`username`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("fullName", this@UserState.`fullName`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("firstName", this@UserState.`firstName`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("lastName", this@UserState.`lastName`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("imageUrl", JsonPrimitive(this@UserState.`imageUrl`))
    putPresent("hasImage", JsonPrimitive(this@UserState.`hasImage`))
    putPresent("emailAddresses", JsonArray(this@UserState.`emailAddresses`.map { value -> value.toJson() }))
    putPresent("phoneNumbers", JsonArray(this@UserState.`phoneNumbers`.map { value -> value.toJson() }))
    putPresent("web3Wallets", JsonArray(this@UserState.`web3Wallets`.map { value -> value.toJson() }))
    putPresent("externalAccounts", JsonArray(this@UserState.`externalAccounts`.map { value -> value.toJson() }))
    putPresent("enterpriseAccounts", JsonArray(this@UserState.`enterpriseAccounts`.map { value -> value.toJson() }))
    putPresent("passkeys", JsonArray(this@UserState.`passkeys`.map { value -> value.toJson() }))
    putPresent("organizationMemberships", JsonArray(this@UserState.`organizationMemberships`.map { value -> value.toJson() }))
    putPresent("passwordEnabled", JsonPrimitive(this@UserState.`passwordEnabled`))
    putPresent("totpEnabled", JsonPrimitive(this@UserState.`totpEnabled`))
    putPresent("backupCodeEnabled", JsonPrimitive(this@UserState.`backupCodeEnabled`))
    putPresent("twoFactorEnabled", JsonPrimitive(this@UserState.`twoFactorEnabled`))
    putPresent("publicMetadata", this@UserState.`publicMetadata`)
    putPresent("unsafeMetadata", this@UserState.`unsafeMetadata`)
    putPresent("lastSignInAt", this@UserState.`lastSignInAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("legalAcceptedAt", this@UserState.`legalAcceptedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("createOrganizationEnabled", JsonPrimitive(this@UserState.`createOrganizationEnabled`))
    putPresent("createOrganizationsLimit", this@UserState.`createOrganizationsLimit`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("deleteSelfEnabled", JsonPrimitive(this@UserState.`deleteSelfEnabled`))
    putPresent("updatedAt", this@UserState.`updatedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("createdAt", this@UserState.`createdAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("verifiedExternalAccounts", JsonArray(this@UserState.`verifiedExternalAccounts`.map { value -> value.toJson() }))
    putPresent("unverifiedExternalAccounts", JsonArray(this@UserState.`unverifiedExternalAccounts`.map { value -> value.toJson() }))
    putPresent("verifiedWeb3Wallets", JsonArray(this@UserState.`verifiedWeb3Wallets`.map { value -> value.toJson() }))
    putPresent("hasVerifiedEmailAddress", JsonPrimitive(this@UserState.`hasVerifiedEmailAddress`))
    putPresent("hasVerifiedPhoneNumber", JsonPrimitive(this@UserState.`hasVerifiedPhoneNumber`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UserState {
      val values = value.jsonObject

      return UserState(`id` = (values["id"] ?: Undefined).requireString(), `externalId` = (values["externalId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `primaryEmailAddressId` = (values["primaryEmailAddressId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `primaryEmailAddress` = (values["primaryEmailAddress"] ?: Undefined).decodeOptional { value -> EmailAddress.fromJson(value, runtime) }, `primaryPhoneNumberId` = (values["primaryPhoneNumberId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `primaryPhoneNumber` = (values["primaryPhoneNumber"] ?: Undefined).decodeOptional { value -> PhoneNumber.fromJson(value, runtime) }, `primaryWeb3WalletId` = (values["primaryWeb3WalletId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `primaryWeb3Wallet` = (values["primaryWeb3Wallet"] ?: Undefined).decodeOptional { value -> Web3Wallet.fromJson(value, runtime) }, `username` = (values["username"] ?: Undefined).decodeOptional { value -> value.requireString() }, `fullName` = (values["fullName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `imageUrl` = (values["imageUrl"] ?: Undefined).requireString(), `hasImage` = (values["hasImage"] ?: Undefined).requireBoolean(), `emailAddresses` = (values["emailAddresses"] ?: Undefined).jsonArray.map { value -> EmailAddress.fromJson(value, runtime) }, `phoneNumbers` = (values["phoneNumbers"] ?: Undefined).jsonArray.map { value -> PhoneNumber.fromJson(value, runtime) }, `web3Wallets` = (values["web3Wallets"] ?: Undefined).jsonArray.map { value -> Web3Wallet.fromJson(value, runtime) }, `externalAccounts` = (values["externalAccounts"] ?: Undefined).jsonArray.map { value -> ExternalAccount.fromJson(value, runtime) }, `enterpriseAccounts` = (values["enterpriseAccounts"] ?: Undefined).jsonArray.map { value -> EnterpriseAccount.fromJson(value, runtime) }, `passkeys` = (values["passkeys"] ?: Undefined).jsonArray.map { value -> Passkey.fromJson(value, runtime) }, `organizationMemberships` = (values["organizationMemberships"] ?: Undefined).jsonArray.map { value -> OrganizationMembership.fromJson(value, runtime) }, `passwordEnabled` = (values["passwordEnabled"] ?: Undefined).requireBoolean(), `totpEnabled` = (values["totpEnabled"] ?: Undefined).requireBoolean(), `backupCodeEnabled` = (values["backupCodeEnabled"] ?: Undefined).requireBoolean(), `twoFactorEnabled` = (values["twoFactorEnabled"] ?: Undefined).requireBoolean(), `publicMetadata` = (values["publicMetadata"] ?: Undefined).jsonObject, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).jsonObject, `lastSignInAt` = (values["lastSignInAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `legalAcceptedAt` = (values["legalAcceptedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `createOrganizationEnabled` = (values["createOrganizationEnabled"] ?: Undefined).requireBoolean(), `createOrganizationsLimit` = (values["createOrganizationsLimit"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `deleteSelfEnabled` = (values["deleteSelfEnabled"] ?: Undefined).requireBoolean(), `updatedAt` = (values["updatedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `createdAt` = (values["createdAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `verifiedExternalAccounts` = (values["verifiedExternalAccounts"] ?: Undefined).jsonArray.map { value -> ExternalAccount.fromJson(value, runtime) }, `unverifiedExternalAccounts` = (values["unverifiedExternalAccounts"] ?: Undefined).jsonArray.map { value -> ExternalAccount.fromJson(value, runtime) }, `verifiedWeb3Wallets` = (values["verifiedWeb3Wallets"] ?: Undefined).jsonArray.map { value -> Web3Wallet.fromJson(value, runtime) }, `hasVerifiedEmailAddress` = (values["hasVerifiedEmailAddress"] ?: Undefined).requireBoolean(), `hasVerifiedPhoneNumber` = (values["hasVerifiedPhoneNumber"] ?: Undefined).requireBoolean())
    }
  }
}
public class User(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: UserState get() = context.state(handle)
  public val changes: Flow<UserState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `externalId`: String? get() = state.`externalId`
  public val `primaryEmailAddressId`: String? get() = state.`primaryEmailAddressId`
  public val `primaryEmailAddress`: EmailAddress? get() = state.`primaryEmailAddress`
  public val `primaryPhoneNumberId`: String? get() = state.`primaryPhoneNumberId`
  public val `primaryPhoneNumber`: PhoneNumber? get() = state.`primaryPhoneNumber`
  public val `primaryWeb3WalletId`: String? get() = state.`primaryWeb3WalletId`
  public val `primaryWeb3Wallet`: Web3Wallet? get() = state.`primaryWeb3Wallet`
  public val `username`: String? get() = state.`username`
  public val `fullName`: String? get() = state.`fullName`
  public val `firstName`: String? get() = state.`firstName`
  public val `lastName`: String? get() = state.`lastName`
  public val `imageUrl`: String get() = state.`imageUrl`
  public val `hasImage`: Boolean get() = state.`hasImage`
  public val `emailAddresses`: List<EmailAddress> get() = state.`emailAddresses`
  public val `phoneNumbers`: List<PhoneNumber> get() = state.`phoneNumbers`
  public val `web3Wallets`: List<Web3Wallet> get() = state.`web3Wallets`
  public val `externalAccounts`: List<ExternalAccount> get() = state.`externalAccounts`
  public val `enterpriseAccounts`: List<EnterpriseAccount> get() = state.`enterpriseAccounts`
  public val `passkeys`: List<Passkey> get() = state.`passkeys`
  public val `organizationMemberships`: List<OrganizationMembership> get() = state.`organizationMemberships`
  public val `passwordEnabled`: Boolean get() = state.`passwordEnabled`
  public val `totpEnabled`: Boolean get() = state.`totpEnabled`
  public val `backupCodeEnabled`: Boolean get() = state.`backupCodeEnabled`
  public val `twoFactorEnabled`: Boolean get() = state.`twoFactorEnabled`
  public val `publicMetadata`: JsonObject get() = state.`publicMetadata`
  public val `unsafeMetadata`: JsonObject get() = state.`unsafeMetadata`
  public val `lastSignInAt`: Instant? get() = state.`lastSignInAt`
  public val `legalAcceptedAt`: Instant? get() = state.`legalAcceptedAt`
  public val `createOrganizationEnabled`: Boolean get() = state.`createOrganizationEnabled`
  public val `createOrganizationsLimit`: Double? get() = state.`createOrganizationsLimit`
  public val `deleteSelfEnabled`: Boolean get() = state.`deleteSelfEnabled`
  public val `updatedAt`: Instant? get() = state.`updatedAt`
  public val `createdAt`: Instant? get() = state.`createdAt`
  public val `verifiedExternalAccounts`: List<ExternalAccount> get() = state.`verifiedExternalAccounts`
  public val `unverifiedExternalAccounts`: List<ExternalAccount> get() = state.`unverifiedExternalAccounts`
  public val `verifiedWeb3Wallets`: List<Web3Wallet> get() = state.`verifiedWeb3Wallets`
  public val `hasVerifiedEmailAddress`: Boolean get() = state.`hasVerifiedEmailAddress`
  public val `hasVerifiedPhoneNumber`: Boolean get() = state.`hasVerifiedPhoneNumber`
  override fun prepare(value: JsonElement): Any = UserState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): User = runtime.resource(ResourceHandle.fromReference(value)) as User
  }
  /**
   * Updates the user's attributes. Use this method to save information you collected about the user.
   *
   * The appropriate settings must be enabled in the Clerk Dashboard for the user to be able to update their attributes. For example, if you want to use the `update({ firstName })` method, you must enable the **First and last name** setting. It can be found on the [**User & authentication**](https://dashboard.clerk.com/~/user-authentication/user-and-authentication?user_auth_tab=user-profile) page in the Clerk Dashboard.
   */
  public suspend fun `update`(`params`: UpdateUserParams): User {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.update", listOf(`params`.toJson())) { result ->
      User.fromJson(result, runtime)
    }
  }
  /**
   * Updates the user's `unsafeMetadata` using deep-merge semantics. Unlike [`update()`](https://clerk.com/docs/reference/objects/user#update), which fully replaces `unsafeMetadata`, this method merges the provided value with the existing `unsafeMetadata`. Top-level and nested keys are merged, and any key set to `null` is removed. Only `unsafeMetadata` is writable from the frontend; `publicMetadata` and `privateMetadata` can only be set from the [Backend API](https://clerk.com/docs/reference/backend-api){{ target: '_blank' }}.
   */
  public suspend fun `updateMetadata`(`params`: UpdateUserMetadataParams): User {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.updateMetadata", listOf(`params`.toJson())) { result ->
      User.fromJson(result, runtime)
    }
  }
  /**
   * Deletes the current user.
   */
  public suspend fun `delete`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.delete", listOf()) { result ->
      Unit
    }
  }
  /**
   * Updates the user's password.
   */
  public suspend fun `updatePassword`(`params`: UpdateUserPasswordParams): User {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.updatePassword", listOf(`params`.toJson())) { result ->
      User.fromJson(result, runtime)
    }
  }
  /**
   * Removes the user's password.
   */
  public suspend fun `removePassword`(`params`: RemoveUserPasswordParams): User {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.removePassword", listOf(`params`.toJson())) { result ->
      User.fromJson(result, runtime)
    }
  }
  /**
   * Adds an email address for the user. A new [`EmailAddress`](https://clerk.com/docs/reference/types/email-address) will be created and associated with the user.
   *
   * > [!WARNING]
   * > [**Email** must be enabled](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#email) in your app's settings in the Clerk Dashboard.
   */
  public suspend fun `createEmailAddress`(`params`: CreateEmailAddressParams): EmailAddress {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.createEmailAddress", listOf(`params`.toJson())) { result ->
      EmailAddress.fromJson(result, runtime)
    }
  }
  /**
   * Creates a passkey for the signed-in user. For an example, see the [custom flow guide](https://clerk.com/docs/guides/development/custom-flows/authentication/passkeys#create-user-passkeys).
   */
  public suspend fun `createPasskey`(): Passkey {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.createPasskey", listOf()) { result ->
      Passkey.fromJson(result, runtime)
    }
  }
  /**
   * Adds a phone number for the user. A new [`PhoneNumber`](https://clerk.com/docs/reference/types/phone-number) will be created and associated with the user.
   *
   * > [!WARNING]
   * > [**Phone** must be enabled](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#phone) in your app's settings in the Clerk Dashboard.
   */
  public suspend fun `createPhoneNumber`(`params`: CreatePhoneNumberParams): PhoneNumber {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.createPhoneNumber", listOf(`params`.toJson())) { result ->
      PhoneNumber.fromJson(result, runtime)
    }
  }
  /**
   * Adds a Web3 wallet for the user. A new [`Web3WalletResource`](https://clerk.com/docs/reference/types/web3-wallet) will be created and associated with the user.
   */
  public suspend fun `createWeb3Wallet`(`params`: CreateWeb3WalletParams): Web3Wallet {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.createWeb3Wallet", listOf(`params`.toJson())) { result ->
      Web3Wallet.fromJson(result, runtime)
    }
  }
  /**
   * A check whether or not the given resource is the primary identifier for the user.
   */
  public suspend fun `isPrimaryIdentification`(`ident`: UserIsPrimaryIdentificationIdent): Boolean {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.isPrimaryIdentification", listOf(`ident`.toJson())) { result ->
      result.requireBoolean()
    }
  }
  /**
   * Gets all **active** sessions for this user. This method uses a cache so a network request will only be triggered only once.
   */
  public suspend fun `getSessions`(): List<SessionWithActivities> {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.getSessions", listOf()) { result ->
      result.jsonArray.map { value -> SessionWithActivities.fromJson(value, runtime) }
    }
  }
  /**
   * Adds the user's profile image or replaces it if one already exists. This method will upload an image and associate it with the user.
   */
  public suspend fun `setProfileImage`(`params`: SetProfileImageParams): ImageResource {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.setProfileImage", listOf(`params`.toJson())) { result ->
      ImageResource.fromJson(result, runtime)
    }
  }
  /**
   * Adds an external account for the user. A new [`ExternalAccount`](https://clerk.com/docs/reference/types/external-account) will be created and associated with the user. This method is useful if you want to allow an already signed-in user to connect their account with an external provider, such as Facebook, GitHub, etc., so that they can sign in with that provider in the future.
   *
   * > [!WARNING]
   * > The social provider that you want to connect to [must be enabled](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options#sso-connections) in your app's settings in the Clerk Dashboard.
   */
  public suspend fun `createExternalAccount`(`params`: CreateExternalAccountParams): ExternalAccount {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.createExternalAccount", listOf(`params`.toJson())) { result ->
      ExternalAccount.fromJson(result, runtime)
    }
  }
  public suspend fun `getOrganizationMemberships`(`params`: GetUserOrganizationMembershipParams? = null): ClerkPaginatedResponseOrganizationMembership {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.getOrganizationMemberships", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ClerkPaginatedResponseOrganizationMembership.fromJson(result, runtime)
    }
  }
  /**
   * Gets a list of Organization invitations for the user.
   */
  public suspend fun `getOrganizationInvitations`(`params`: GetUserOrganizationInvitationsParams? = null): ClerkPaginatedResponseUserOrganizationInvitation {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.getOrganizationInvitations", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ClerkPaginatedResponseUserOrganizationInvitation.fromJson(result, runtime)
    }
  }
  /**
   * Gets a list of Organization suggestions for the user.
   */
  public suspend fun `getOrganizationSuggestions`(`params`: GetUserOrganizationSuggestionsParams? = null): ClerkPaginatedResponseOrganizationSuggestion {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.getOrganizationSuggestions", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ClerkPaginatedResponseOrganizationSuggestion.fromJson(result, runtime)
    }
  }
  /**
   * Gets organization creation defaults for the current user.
   */
  public suspend fun `getOrganizationCreationDefaults`(): OrganizationCreationDefaults {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.getOrganizationCreationDefaults", listOf()) { result ->
      OrganizationCreationDefaults.fromJson(result, runtime)
    }
  }
  /**
   * Leaves an organization that the user is a member of.
   */
  public suspend fun `leaveOrganization`(`organizationId`: String): DeletedObject {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.leaveOrganization", listOf(JsonPrimitive(`organizationId`))) { result ->
      DeletedObject.fromJson(result, runtime)
    }
  }
  /**
   * Get the enterprise connections for the current user. This method is not intended for public use.
   * Currently some customers use this to get enterprise connections for account linking purposes.
   */
  public suspend fun `getEnterpriseConnections`(`params`: GetEnterpriseConnectionsParams? = null): List<EnterpriseConnection> {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.getEnterpriseConnections", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      result.jsonArray.map { value -> EnterpriseConnection.fromJson(value, runtime) }
    }
  }
  /**
   * Generates a TOTP secret for a user that can be used to register the application on the user's authenticator app of choice. If this method is called again (while still unverified), it replaces the previously generated secret.
   */
  public suspend fun `createTOTP`(): TOTP {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.createTOTP", listOf()) { result ->
      TOTP.fromJson(result, runtime)
    }
  }
  /**
   * Verifies a TOTP secret after a user has created it. The user must provide a code from their authenticator app that has been generated using the previously created secret. This way, correct set up and ownership of the authenticator app can be validated.
   */
  public suspend fun `verifyTOTP`(`params`: VerifyTOTPParams): TOTP {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.verifyTOTP", listOf(`params`.toJson())) { result ->
      TOTP.fromJson(result, runtime)
    }
  }
  /**
   * Disables TOTP by deleting the user's TOTP secret.
   */
  public suspend fun `disableTOTP`(): DeletedObject {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.disableTOTP", listOf()) { result ->
      DeletedObject.fromJson(result, runtime)
    }
  }
  /**
   * Generates a fresh new set of backup codes for the user. Every time the method is called, it will replace the previously generated backup codes.
   */
  public suspend fun `createBackupCode`(): BackupCode {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.createBackupCode", listOf()) { result ->
      BackupCode.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): User {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      User.fromJson(result, runtime)
    }
  }
  /**
   * Initializes a payment method.
   */
  public suspend fun `initializePaymentMethod`(`params`: InitializePaymentMethodParams): BillingInitializedPaymentMethod {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.initializePaymentMethod", listOf(`params`.toJson())) { result ->
      BillingInitializedPaymentMethod.fromJson(result, runtime)
    }
  }
  /**
   * Adds a payment method.
   */
  public suspend fun `addPaymentMethod`(`params`: AddPaymentMethodParams): BillingPaymentMethod {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.addPaymentMethod", listOf(`params`.toJson())) { result ->
      BillingPaymentMethod.fromJson(result, runtime)
    }
  }
  /**
   * Gets a list of payment methods that have been stored.
   */
  public suspend fun `getPaymentMethods`(`params`: GetPaymentMethodsParams? = null): ClerkPaginatedResponseBillingPaymentMethod {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "User.getPaymentMethods", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ClerkPaginatedResponseBillingPaymentMethod.fromJson(result, runtime)
    }
  }
}

public data class EmailAddressState(public val `id`: String, public val `createdAt`: Instant? = null, public val `emailAddress`: String, public val `verification`: Verification, public val `matchesSsoConnection`: Boolean, public val `linkedTo`: List<IdentificationLink>) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@EmailAddressState.`id`))
    putPresent("createdAt", this@EmailAddressState.`createdAt`?.let { value -> JsonPrimitive(value.toString()) } ?: Undefined)
    putPresent("emailAddress", JsonPrimitive(this@EmailAddressState.`emailAddress`))
    putPresent("verification", this@EmailAddressState.`verification`.toJson())
    putPresent("matchesSsoConnection", JsonPrimitive(this@EmailAddressState.`matchesSsoConnection`))
    putPresent("linkedTo", JsonArray(this@EmailAddressState.`linkedTo`.map { value -> value.toJson() }))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EmailAddressState {
      val values = value.jsonObject

      return EmailAddressState(`id` = (values["id"] ?: Undefined).requireString(), `createdAt` = (values["createdAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `emailAddress` = (values["emailAddress"] ?: Undefined).requireString(), `verification` = Verification.fromJson((values["verification"] ?: Undefined), runtime), `matchesSsoConnection` = (values["matchesSsoConnection"] ?: Undefined).requireBoolean(), `linkedTo` = (values["linkedTo"] ?: Undefined).jsonArray.map { value -> IdentificationLink.fromJson(value, runtime) })
    }
  }
}
public class EmailAddress(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: EmailAddressState get() = context.state(handle)
  public val changes: Flow<EmailAddressState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `createdAt`: Instant? get() = state.`createdAt`
  public val `emailAddress`: String get() = state.`emailAddress`
  public val `verification`: Verification get() = state.`verification`
  public val `matchesSsoConnection`: Boolean get() = state.`matchesSsoConnection`
  public val `linkedTo`: List<IdentificationLink> get() = state.`linkedTo`
  override fun prepare(value: JsonElement): Any = EmailAddressState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EmailAddress = runtime.resource(ResourceHandle.fromReference(value)) as EmailAddress
  }
  /**
   * Returns a string representation of an object.
   */
  public suspend fun `stringValue`(): String {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EmailAddress.toString", listOf()) { result ->
      result.requireString()
    }
  }
  public suspend fun `prepareVerification`(`params`: PrepareEmailAddressVerificationParams): EmailAddress {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EmailAddress.prepareVerification", listOf(`params`.toJson())) { result ->
      EmailAddress.fromJson(result, runtime)
    }
  }
  public suspend fun `attemptVerification`(`params`: AttemptEmailAddressVerificationParams): EmailAddress {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EmailAddress.attemptVerification", listOf(`params`.toJson())) { result ->
      EmailAddress.fromJson(result, runtime)
    }
  }
  public suspend fun `createEmailLinkFlow`(): CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EmailAddress.createEmailLinkFlow", listOf()) { result ->
      CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress.fromJson(result, runtime)
    }
  }
  public suspend fun `createEnterpriseSSOLinkFlow`(): CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EmailAddress.createEnterpriseSSOLinkFlow", listOf()) { result ->
      CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress.fromJson(result, runtime)
    }
  }
  public suspend fun `destroy`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EmailAddress.destroy", listOf()) { result ->
      Unit
    }
  }
  public suspend fun `create`(): EmailAddress {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EmailAddress.create", listOf()) { result ->
      EmailAddress.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): EmailAddress {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EmailAddress.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      EmailAddress.fromJson(result, runtime)
    }
  }
}

public data class VerificationState(public val `attempts`: Double?, public val `error`: ClerkAPIError?, public val `expireAt`: Instant?, public val `status`: VerificationStatus?, public val `strategy`: String?, public val `verifiedAtClient`: String?, public val `channel`: PhoneCodeChannel? = null, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("attempts", this@VerificationState.`attempts`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("error", this@VerificationState.`error`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("expireAt", this@VerificationState.`expireAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("status", this@VerificationState.`status`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("strategy", this@VerificationState.`strategy`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("verifiedAtClient", this@VerificationState.`verifiedAtClient`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("channel", this@VerificationState.`channel`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("id", this@VerificationState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): VerificationState {
      val values = value.jsonObject

      return VerificationState(`attempts` = (values["attempts"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `error` = (values["error"] ?: Undefined).decodeOptional { value -> ClerkAPIError.fromJson(value, runtime) }, `expireAt` = (values["expireAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `status` = (values["status"] ?: Undefined).decodeOptional { value -> VerificationStatus.fromJson(value, runtime) }, `strategy` = (values["strategy"] ?: Undefined).decodeOptional { value -> value.requireString() }, `verifiedAtClient` = (values["verifiedAtClient"] ?: Undefined).decodeOptional { value -> value.requireString() }, `channel` = (values["channel"] ?: Undefined).decodeOptional { value -> PhoneCodeChannel.fromJson(value, runtime) }, `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}
public class Verification(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: VerificationState get() = context.state(handle)
  public val changes: Flow<VerificationState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `attempts`: Double? get() = state.`attempts`
  public val `error`: ClerkAPIError? get() = state.`error`
  public val `expireAt`: Instant? get() = state.`expireAt`
  public val `status`: VerificationStatus? get() = state.`status`
  public val `strategy`: String? get() = state.`strategy`
  public val `verifiedAtClient`: String? get() = state.`verifiedAtClient`
  public val `channel`: PhoneCodeChannel? get() = state.`channel`
  public val `id`: String? get() = state.`id`
  override fun prepare(value: JsonElement): Any = VerificationState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Verification = runtime.resource(ResourceHandle.fromReference(value)) as Verification
  }
  public suspend fun `verifiedFromTheSameClient`(): Boolean {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Verification.verifiedFromTheSameClient", listOf()) { result ->
      result.requireBoolean()
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): Verification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Verification.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Verification.fromJson(result, runtime)
    }
  }
}

/**
 * An interface that represents an error returned by the Clerk API.
 */
public data class ClerkAPIError(public val `code`: String, public val `message`: String, public val `longMessage`: String? = null, public val `meta`: ClerkAPIErrorMeta? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@ClerkAPIError.`code`))
    putPresent("message", JsonPrimitive(this@ClerkAPIError.`message`))
    putPresent("longMessage", this@ClerkAPIError.`longMessage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("meta", this@ClerkAPIError.`meta`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkAPIError {
      val values = value.jsonObject

      return ClerkAPIError(`code` = (values["code"] ?: Undefined).requireString(), `message` = (values["message"] ?: Undefined).requireString(), `longMessage` = (values["longMessage"] ?: Undefined).decodeOptional { value -> value.requireString() }, `meta` = (values["meta"] ?: Undefined).decodeOptional { value -> ClerkAPIErrorMeta.fromJson(value, runtime) })
    }
  }
}

public data class ClerkAPIErrorMeta(public val `paramName`: String? = null, public val `sessionId`: String? = null, public val `emailAddresses`: List<String>? = null, public val `identifiers`: List<String>? = null, public val `zxcvbn`: ClerkAPIErrorMetaZxcvbn? = null, public val `permissions`: List<String>? = null, public val `plan`: ClerkAPIErrorMetaPlan? = null, public val `isPlanUpgradePossible`: Boolean? = null, public val `seatsQuantityToAdd`: Double? = null, public val `seatsQuantity`: Double? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("paramName", this@ClerkAPIErrorMeta.`paramName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("sessionId", this@ClerkAPIErrorMeta.`sessionId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("emailAddresses", this@ClerkAPIErrorMeta.`emailAddresses`?.let { value -> JsonArray(value.map { value -> JsonPrimitive(value) }) } ?: Undefined)
    putPresent("identifiers", this@ClerkAPIErrorMeta.`identifiers`?.let { value -> JsonArray(value.map { value -> JsonPrimitive(value) }) } ?: Undefined)
    putPresent("zxcvbn", this@ClerkAPIErrorMeta.`zxcvbn`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("permissions", this@ClerkAPIErrorMeta.`permissions`?.let { value -> JsonArray(value.map { value -> JsonPrimitive(value) }) } ?: Undefined)
    putPresent("plan", this@ClerkAPIErrorMeta.`plan`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("isPlanUpgradePossible", this@ClerkAPIErrorMeta.`isPlanUpgradePossible`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("seatsQuantityToAdd", this@ClerkAPIErrorMeta.`seatsQuantityToAdd`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("seatsQuantity", this@ClerkAPIErrorMeta.`seatsQuantity`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkAPIErrorMeta {
      val values = value.jsonObject

      return ClerkAPIErrorMeta(`paramName` = (values["paramName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `sessionId` = (values["sessionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `emailAddresses` = (values["emailAddresses"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> value.requireString() } }, `identifiers` = (values["identifiers"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> value.requireString() } }, `zxcvbn` = (values["zxcvbn"] ?: Undefined).decodeOptional { value -> ClerkAPIErrorMetaZxcvbn.fromJson(value, runtime) }, `permissions` = (values["permissions"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> value.requireString() } }, `plan` = (values["plan"] ?: Undefined).decodeOptional { value -> ClerkAPIErrorMetaPlan.fromJson(value, runtime) }, `isPlanUpgradePossible` = (values["isPlanUpgradePossible"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `seatsQuantityToAdd` = (values["seatsQuantityToAdd"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `seatsQuantity` = (values["seatsQuantity"] ?: Undefined).decodeOptional { value -> value.requireDouble() })
    }
  }
}

public data class ClerkAPIErrorMetaZxcvbn(public val `suggestions`: List<ClerkAPIErrorMetaZxcvbnSuggestionsElement>) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("suggestions", JsonArray(this@ClerkAPIErrorMetaZxcvbn.`suggestions`.map { value -> value.toJson() }))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkAPIErrorMetaZxcvbn {
      val values = value.jsonObject

      return ClerkAPIErrorMetaZxcvbn(`suggestions` = (values["suggestions"] ?: Undefined).jsonArray.map { value -> ClerkAPIErrorMetaZxcvbnSuggestionsElement.fromJson(value, runtime) })
    }
  }
}

public data class ClerkAPIErrorMetaZxcvbnSuggestionsElement(public val `code`: String, public val `message`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@ClerkAPIErrorMetaZxcvbnSuggestionsElement.`code`))
    putPresent("message", JsonPrimitive(this@ClerkAPIErrorMetaZxcvbnSuggestionsElement.`message`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkAPIErrorMetaZxcvbnSuggestionsElement {
      val values = value.jsonObject

      return ClerkAPIErrorMetaZxcvbnSuggestionsElement(`code` = (values["code"] ?: Undefined).requireString(), `message` = (values["message"] ?: Undefined).requireString())
    }
  }
}

public data class ClerkAPIErrorMetaPlan(public val `amountFormatted`: String, public val `annualMonthlyAmountFormatted`: String, public val `currencySymbol`: String, public val `id`: String, public val `name`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("amount_formatted", JsonPrimitive(this@ClerkAPIErrorMetaPlan.`amountFormatted`))
    putPresent("annual_monthly_amount_formatted", JsonPrimitive(this@ClerkAPIErrorMetaPlan.`annualMonthlyAmountFormatted`))
    putPresent("currency_symbol", JsonPrimitive(this@ClerkAPIErrorMetaPlan.`currencySymbol`))
    putPresent("id", JsonPrimitive(this@ClerkAPIErrorMetaPlan.`id`))
    putPresent("name", JsonPrimitive(this@ClerkAPIErrorMetaPlan.`name`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkAPIErrorMetaPlan {
      val values = value.jsonObject

      return ClerkAPIErrorMetaPlan(`amountFormatted` = (values["amount_formatted"] ?: Undefined).requireString(), `annualMonthlyAmountFormatted` = (values["annual_monthly_amount_formatted"] ?: Undefined).requireString(), `currencySymbol` = (values["currency_symbol"] ?: Undefined).requireString(), `id` = (values["id"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).requireString())
    }
  }
}

public sealed class VerificationStatus(public val rawValue: String) {
  public data object Unverified : VerificationStatus("unverified")
  public data object Verified : VerificationStatus("verified")
  public data object Failed : VerificationStatus("failed")
  public data object Expired : VerificationStatus("expired")
  public data object Transferable : VerificationStatus("transferable")
  public data class Unrecognized(val value: String) : VerificationStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): VerificationStatus = when (val raw = value.requireString()) {
      "unverified" -> Unverified
      "verified" -> Verified
      "failed" -> Failed
      "expired" -> Expired
      "transferable" -> Transferable
      else -> Unrecognized(raw)
    }
  }
}

public sealed class PhoneCodeChannel(public val rawValue: String) {
  public data object Sms : PhoneCodeChannel("sms")
  public data object Whatsapp : PhoneCodeChannel("whatsapp")
  public data class Unrecognized(val value: String) : PhoneCodeChannel(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PhoneCodeChannel = when (val raw = value.requireString()) {
      "sms" -> Sms
      "whatsapp" -> Whatsapp
      else -> Unrecognized(raw)
    }
  }
}

public data class IdentificationLinkState(public val `id`: String, public val `type`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@IdentificationLinkState.`id`))
    putPresent("type", JsonPrimitive(this@IdentificationLinkState.`type`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): IdentificationLinkState {
      val values = value.jsonObject

      return IdentificationLinkState(`id` = (values["id"] ?: Undefined).requireString(), `type` = (values["type"] ?: Undefined).requireString())
    }
  }
}
public class IdentificationLink(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: IdentificationLinkState get() = context.state(handle)
  public val changes: Flow<IdentificationLinkState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `type`: String get() = state.`type`
  override fun prepare(value: JsonElement): Any = IdentificationLinkState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): IdentificationLink = runtime.resource(ResourceHandle.fromReference(value)) as IdentificationLink
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): IdentificationLink {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "IdentificationLink.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      IdentificationLink.fromJson(result, runtime)
    }
  }
}

public sealed interface PrepareEmailAddressVerificationParams {
  public data class Case1(val value: EmailAddressPrepareVerificationParamsCase1) : PrepareEmailAddressVerificationParams
  public data class Case2(val value: EmailAddressPrepareVerificationParamsCase2) : PrepareEmailAddressVerificationParams
  public val `strategy`: String get() = when (this) {
    is Case1 -> value.`strategy`
    is Case2 -> value.`strategy`.rawValue
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PrepareEmailAddressVerificationParams {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(EmailAddressPrepareVerificationParamsCase1.fromJson(payload, runtime))
        1 -> Case2(EmailAddressPrepareVerificationParamsCase2.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public class EmailAddressPrepareVerificationParamsCase1() {
  public val `strategy`: String get() = "email_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("email_code"))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EmailAddressPrepareVerificationParamsCase1 {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("email_code"))
      return EmailAddressPrepareVerificationParamsCase1()
    }
  }
}

public data class EmailAddressPrepareVerificationParamsCase2(public val `strategy`: EmailAddressPrepareVerificationParamsCase2Strategy, public val `redirectUrl`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", this@EmailAddressPrepareVerificationParamsCase2.`strategy`.toJson())
    putPresent("redirectUrl", JsonPrimitive(this@EmailAddressPrepareVerificationParamsCase2.`redirectUrl`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EmailAddressPrepareVerificationParamsCase2 {
      val values = value.jsonObject

      return EmailAddressPrepareVerificationParamsCase2(`strategy` = EmailAddressPrepareVerificationParamsCase2Strategy.fromJson((values["strategy"] ?: Undefined), runtime), `redirectUrl` = (values["redirectUrl"] ?: Undefined).requireString())
    }
  }
}

public sealed class EmailAddressPrepareVerificationParamsCase2Strategy(public val rawValue: String) {
  public data object EmailLink : EmailAddressPrepareVerificationParamsCase2Strategy("email_link")
  public data object EnterpriseSso : EmailAddressPrepareVerificationParamsCase2Strategy("enterprise_sso")
  public data class Unrecognized(val value: String) : EmailAddressPrepareVerificationParamsCase2Strategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EmailAddressPrepareVerificationParamsCase2Strategy = when (val raw = value.requireString()) {
      "email_link" -> EmailLink
      "enterprise_sso" -> EnterpriseSso
      else -> Unrecognized(raw)
    }
  }
}

public data class AttemptEmailAddressVerificationParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@AttemptEmailAddressVerificationParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AttemptEmailAddressVerificationParams {
      val values = value.jsonObject

      return AttemptEmailAddressVerificationParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public class CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState() {
  public fun toJson(): JsonElement = buildJsonObject {

  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState {
      val values = value.jsonObject

      return CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState()
    }
  }
}
public class CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState get() = context.state(handle)
  public val changes: Flow<CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)

  override fun prepare(value: JsonElement): Any = CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddressState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress = runtime.resource(ResourceHandle.fromReference(value)) as CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress
  }
  public suspend fun `startEmailLinkFlow`(`params`: StartEmailLinkFlowParams): EmailAddress {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress.startEmailLinkFlow", listOf(`params`.toJson())) { result ->
      EmailAddress.fromJson(result, runtime)
    }
  }
  public suspend fun `cancelEmailLinkFlow`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress.cancelEmailLinkFlow", listOf()) { result ->
      Unit
    }
  }
}

public data class StartEmailLinkFlowParams(public val `redirectUrl`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("redirectUrl", JsonPrimitive(this@StartEmailLinkFlowParams.`redirectUrl`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): StartEmailLinkFlowParams {
      val values = value.jsonObject

      return StartEmailLinkFlowParams(`redirectUrl` = (values["redirectUrl"] ?: Undefined).requireString())
    }
  }
}

public class CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState() {
  public fun toJson(): JsonElement = buildJsonObject {

  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState {
      val values = value.jsonObject

      return CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState()
    }
  }
}
public class CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState get() = context.state(handle)
  public val changes: Flow<CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)

  override fun prepare(value: JsonElement): Any = CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddressState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress = runtime.resource(ResourceHandle.fromReference(value)) as CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress
  }
  public suspend fun `startEnterpriseSSOLinkFlow`(`params`: StartEnterpriseSSOLinkFlowParams): EmailAddress {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress.startEnterpriseSSOLinkFlow", listOf(`params`.toJson())) { result ->
      EmailAddress.fromJson(result, runtime)
    }
  }
  public suspend fun `cancelEnterpriseSSOLinkFlow`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress.cancelEnterpriseSSOLinkFlow", listOf()) { result ->
      Unit
    }
  }
}

public data class StartEnterpriseSSOLinkFlowParams(public val `redirectUrl`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("redirectUrl", JsonPrimitive(this@StartEnterpriseSSOLinkFlowParams.`redirectUrl`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): StartEnterpriseSSOLinkFlowParams {
      val values = value.jsonObject

      return StartEnterpriseSSOLinkFlowParams(`redirectUrl` = (values["redirectUrl"] ?: Undefined).requireString())
    }
  }
}

public data class PhoneNumberState(public val `id`: String, public val `createdAt`: Instant? = null, public val `phoneNumber`: String, public val `verification`: Verification, public val `reservedForSecondFactor`: Boolean, public val `defaultSecondFactor`: Boolean, public val `linkedTo`: List<IdentificationLink>) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@PhoneNumberState.`id`))
    putPresent("createdAt", this@PhoneNumberState.`createdAt`?.let { value -> JsonPrimitive(value.toString()) } ?: Undefined)
    putPresent("phoneNumber", JsonPrimitive(this@PhoneNumberState.`phoneNumber`))
    putPresent("verification", this@PhoneNumberState.`verification`.toJson())
    putPresent("reservedForSecondFactor", JsonPrimitive(this@PhoneNumberState.`reservedForSecondFactor`))
    putPresent("defaultSecondFactor", JsonPrimitive(this@PhoneNumberState.`defaultSecondFactor`))
    putPresent("linkedTo", JsonArray(this@PhoneNumberState.`linkedTo`.map { value -> value.toJson() }))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PhoneNumberState {
      val values = value.jsonObject

      return PhoneNumberState(`id` = (values["id"] ?: Undefined).requireString(), `createdAt` = (values["createdAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `phoneNumber` = (values["phoneNumber"] ?: Undefined).requireString(), `verification` = Verification.fromJson((values["verification"] ?: Undefined), runtime), `reservedForSecondFactor` = (values["reservedForSecondFactor"] ?: Undefined).requireBoolean(), `defaultSecondFactor` = (values["defaultSecondFactor"] ?: Undefined).requireBoolean(), `linkedTo` = (values["linkedTo"] ?: Undefined).jsonArray.map { value -> IdentificationLink.fromJson(value, runtime) })
    }
  }
}
public class PhoneNumber(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: PhoneNumberState get() = context.state(handle)
  public val changes: Flow<PhoneNumberState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `createdAt`: Instant? get() = state.`createdAt`
  public val `phoneNumber`: String get() = state.`phoneNumber`
  public val `verification`: Verification get() = state.`verification`
  public val `reservedForSecondFactor`: Boolean get() = state.`reservedForSecondFactor`
  public val `defaultSecondFactor`: Boolean get() = state.`defaultSecondFactor`
  public val `linkedTo`: List<IdentificationLink> get() = state.`linkedTo`
  override fun prepare(value: JsonElement): Any = PhoneNumberState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PhoneNumber = runtime.resource(ResourceHandle.fromReference(value)) as PhoneNumber
  }
  public suspend fun `backupCodes`(): List<String>? {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PhoneNumber.backupCodes", listOf()) { result ->
      result.decodeOptional { value -> value.jsonArray.map { value -> value.requireString() } }
    }
  }
  /**
   * Returns a string representation of an object.
   */
  public suspend fun `stringValue`(): String {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PhoneNumber.toString", listOf()) { result ->
      result.requireString()
    }
  }
  public suspend fun `prepareVerification`(): PhoneNumber {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PhoneNumber.prepareVerification", listOf()) { result ->
      PhoneNumber.fromJson(result, runtime)
    }
  }
  public suspend fun `attemptVerification`(`params`: AttemptPhoneNumberVerificationParams): PhoneNumber {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PhoneNumber.attemptVerification", listOf(`params`.toJson())) { result ->
      PhoneNumber.fromJson(result, runtime)
    }
  }
  public suspend fun `makeDefaultSecondFactor`(): PhoneNumber {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PhoneNumber.makeDefaultSecondFactor", listOf()) { result ->
      PhoneNumber.fromJson(result, runtime)
    }
  }
  public suspend fun `setReservedForSecondFactor`(`params`: SetReservedForSecondFactorParams): PhoneNumber {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PhoneNumber.setReservedForSecondFactor", listOf(`params`.toJson())) { result ->
      PhoneNumber.fromJson(result, runtime)
    }
  }
  public suspend fun `destroy`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PhoneNumber.destroy", listOf()) { result ->
      Unit
    }
  }
  public suspend fun `create`(): PhoneNumber {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PhoneNumber.create", listOf()) { result ->
      PhoneNumber.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): PhoneNumber {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PhoneNumber.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      PhoneNumber.fromJson(result, runtime)
    }
  }
}

public data class AttemptPhoneNumberVerificationParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@AttemptPhoneNumberVerificationParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AttemptPhoneNumberVerificationParams {
      val values = value.jsonObject

      return AttemptPhoneNumberVerificationParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class SetReservedForSecondFactorParams(public val `reserved`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("reserved", JsonPrimitive(this@SetReservedForSecondFactorParams.`reserved`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SetReservedForSecondFactorParams {
      val values = value.jsonObject

      return SetReservedForSecondFactorParams(`reserved` = (values["reserved"] ?: Undefined).requireBoolean())
    }
  }
}

public data class Web3WalletState(public val `id`: String, public val `web3Wallet`: String, public val `verification`: Verification) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@Web3WalletState.`id`))
    putPresent("web3Wallet", JsonPrimitive(this@Web3WalletState.`web3Wallet`))
    putPresent("verification", this@Web3WalletState.`verification`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Web3WalletState {
      val values = value.jsonObject

      return Web3WalletState(`id` = (values["id"] ?: Undefined).requireString(), `web3Wallet` = (values["web3Wallet"] ?: Undefined).requireString(), `verification` = Verification.fromJson((values["verification"] ?: Undefined), runtime))
    }
  }
}
public class Web3Wallet(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: Web3WalletState get() = context.state(handle)
  public val changes: Flow<Web3WalletState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `web3Wallet`: String get() = state.`web3Wallet`
  public val `verification`: Verification get() = state.`verification`
  override fun prepare(value: JsonElement): Any = Web3WalletState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Web3Wallet = runtime.resource(ResourceHandle.fromReference(value)) as Web3Wallet
  }
  /**
   * Returns a string representation of an object.
   */
  public suspend fun `stringValue`(): String {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Web3Wallet.toString", listOf()) { result ->
      result.requireString()
    }
  }
  public suspend fun `prepareVerification`(`params`: PrepareWeb3WalletVerificationParams): Web3Wallet {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Web3Wallet.prepareVerification", listOf(`params`.toJson())) { result ->
      Web3Wallet.fromJson(result, runtime)
    }
  }
  public suspend fun `attemptVerification`(`params`: AttemptWeb3WalletVerificationParams): Web3Wallet {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Web3Wallet.attemptVerification", listOf(`params`.toJson())) { result ->
      Web3Wallet.fromJson(result, runtime)
    }
  }
  public suspend fun `destroy`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Web3Wallet.destroy", listOf()) { result ->
      Unit
    }
  }
  public suspend fun `create`(): Web3Wallet {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Web3Wallet.create", listOf()) { result ->
      Web3Wallet.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): Web3Wallet {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Web3Wallet.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Web3Wallet.fromJson(result, runtime)
    }
  }
}

public data class PrepareWeb3WalletVerificationParams(public val `strategy`: PrepareWeb3WalletVerificationParamsStrategy) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", this@PrepareWeb3WalletVerificationParams.`strategy`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PrepareWeb3WalletVerificationParams {
      val values = value.jsonObject

      return PrepareWeb3WalletVerificationParams(`strategy` = PrepareWeb3WalletVerificationParamsStrategy.fromJson((values["strategy"] ?: Undefined), runtime))
    }
  }
}

public sealed class PrepareWeb3WalletVerificationParamsStrategy(public val rawValue: String) {
  public data object Web3SolanaSignature : PrepareWeb3WalletVerificationParamsStrategy("web3_solana_signature")
  public data object Web3MetamaskSignature : PrepareWeb3WalletVerificationParamsStrategy("web3_metamask_signature")
  public data object Web3CoinbaseWalletSignature : PrepareWeb3WalletVerificationParamsStrategy("web3_coinbase_wallet_signature")
  public data object Web3OkxWalletSignature : PrepareWeb3WalletVerificationParamsStrategy("web3_okx_wallet_signature")
  public data object Web3BaseSignature : PrepareWeb3WalletVerificationParamsStrategy("web3_base_signature")
  public data class Unrecognized(val value: String) : PrepareWeb3WalletVerificationParamsStrategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PrepareWeb3WalletVerificationParamsStrategy = when (val raw = value.requireString()) {
      "web3_solana_signature" -> Web3SolanaSignature
      "web3_metamask_signature" -> Web3MetamaskSignature
      "web3_coinbase_wallet_signature" -> Web3CoinbaseWalletSignature
      "web3_okx_wallet_signature" -> Web3OkxWalletSignature
      "web3_base_signature" -> Web3BaseSignature
      else -> Unrecognized(raw)
    }
  }
}

public data class AttemptWeb3WalletVerificationParams(public val `signature`: String, public val `strategy`: PrepareWeb3WalletVerificationParamsStrategy? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("signature", JsonPrimitive(this@AttemptWeb3WalletVerificationParams.`signature`))
    putPresent("strategy", this@AttemptWeb3WalletVerificationParams.`strategy`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AttemptWeb3WalletVerificationParams {
      val values = value.jsonObject

      return AttemptWeb3WalletVerificationParams(`signature` = (values["signature"] ?: Undefined).requireString(), `strategy` = (values["strategy"] ?: Undefined).decodeOptional { value -> PrepareWeb3WalletVerificationParamsStrategy.fromJson(value, runtime) })
    }
  }
}

public data class ExternalAccountState(public val `id`: String, public val `createdAt`: Instant? = null, public val `identificationId`: String, public val `provider`: OAuthProvider, public val `providerUserId`: String, public val `emailAddress`: String, public val `approvedScopes`: String, public val `firstName`: String, public val `lastName`: String, public val `imageUrl`: String, public val `username`: String? = null, public val `phoneNumber`: String? = null, public val `publicMetadata`: Map<String, JsonElement>, public val `label`: String? = null, public val `verification`: Verification?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@ExternalAccountState.`id`))
    putPresent("createdAt", this@ExternalAccountState.`createdAt`?.let { value -> JsonPrimitive(value.toString()) } ?: Undefined)
    putPresent("identificationId", JsonPrimitive(this@ExternalAccountState.`identificationId`))
    putPresent("provider", this@ExternalAccountState.`provider`.toJson())
    putPresent("providerUserId", JsonPrimitive(this@ExternalAccountState.`providerUserId`))
    putPresent("emailAddress", JsonPrimitive(this@ExternalAccountState.`emailAddress`))
    putPresent("approvedScopes", JsonPrimitive(this@ExternalAccountState.`approvedScopes`))
    putPresent("firstName", JsonPrimitive(this@ExternalAccountState.`firstName`))
    putPresent("lastName", JsonPrimitive(this@ExternalAccountState.`lastName`))
    putPresent("imageUrl", JsonPrimitive(this@ExternalAccountState.`imageUrl`))
    putPresent("username", this@ExternalAccountState.`username`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("phoneNumber", this@ExternalAccountState.`phoneNumber`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("publicMetadata", JsonObject(this@ExternalAccountState.`publicMetadata`.mapValues { (_, value) -> value }))
    putPresent("label", this@ExternalAccountState.`label`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("verification", this@ExternalAccountState.`verification`?.let { value -> value.toJson() } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ExternalAccountState {
      val values = value.jsonObject

      return ExternalAccountState(`id` = (values["id"] ?: Undefined).requireString(), `createdAt` = (values["createdAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `identificationId` = (values["identificationId"] ?: Undefined).requireString(), `provider` = OAuthProvider.fromJson((values["provider"] ?: Undefined), runtime), `providerUserId` = (values["providerUserId"] ?: Undefined).requireString(), `emailAddress` = (values["emailAddress"] ?: Undefined).requireString(), `approvedScopes` = (values["approvedScopes"] ?: Undefined).requireString(), `firstName` = (values["firstName"] ?: Undefined).requireString(), `lastName` = (values["lastName"] ?: Undefined).requireString(), `imageUrl` = (values["imageUrl"] ?: Undefined).requireString(), `username` = (values["username"] ?: Undefined).decodeOptional { value -> value.requireString() }, `phoneNumber` = (values["phoneNumber"] ?: Undefined).decodeOptional { value -> value.requireString() }, `publicMetadata` = (values["publicMetadata"] ?: Undefined).jsonObject.mapValues { (_, value) -> value }, `label` = (values["label"] ?: Undefined).decodeOptional { value -> value.requireString() }, `verification` = (values["verification"] ?: Undefined).decodeOptional { value -> Verification.fromJson(value, runtime) })
    }
  }
}
public class ExternalAccount(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: ExternalAccountState get() = context.state(handle)
  public val changes: Flow<ExternalAccountState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `createdAt`: Instant? get() = state.`createdAt`
  public val `identificationId`: String get() = state.`identificationId`
  public val `provider`: OAuthProvider get() = state.`provider`
  public val `providerUserId`: String get() = state.`providerUserId`
  public val `emailAddress`: String get() = state.`emailAddress`
  public val `approvedScopes`: String get() = state.`approvedScopes`
  public val `firstName`: String get() = state.`firstName`
  public val `lastName`: String get() = state.`lastName`
  public val `imageUrl`: String get() = state.`imageUrl`
  public val `username`: String? get() = state.`username`
  public val `phoneNumber`: String? get() = state.`phoneNumber`
  public val `publicMetadata`: Map<String, JsonElement> get() = state.`publicMetadata`
  public val `label`: String? get() = state.`label`
  public val `verification`: Verification? get() = state.`verification`
  override fun prepare(value: JsonElement): Any = ExternalAccountState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ExternalAccount = runtime.resource(ResourceHandle.fromReference(value)) as ExternalAccount
  }
  public suspend fun `reauthorize`(`params`: ReauthorizeExternalAccountParams): ExternalAccount {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ExternalAccount.reauthorize", listOf(`params`.toJson())) { result ->
      ExternalAccount.fromJson(result, runtime)
    }
  }
  public suspend fun `destroy`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ExternalAccount.destroy", listOf()) { result ->
      Unit
    }
  }
  public suspend fun `providerSlug`(): OAuthProvider {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ExternalAccount.providerSlug", listOf()) { result ->
      OAuthProvider.fromJson(result, runtime)
    }
  }
  public suspend fun `providerTitle`(): String {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ExternalAccount.providerTitle", listOf()) { result ->
      result.requireString()
    }
  }
  public suspend fun `accountIdentifier`(): String {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ExternalAccount.accountIdentifier", listOf()) { result ->
      result.requireString()
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): ExternalAccount {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ExternalAccount.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ExternalAccount.fromJson(result, runtime)
    }
  }
}

/**
 * Represents the available OAuth providers.
 */
public sealed class OAuthProvider(public val rawValue: String) {
  public data object Facebook : OAuthProvider("facebook")
  public data object Google : OAuthProvider("google")
  public data object Hubspot : OAuthProvider("hubspot")
  public data object Github : OAuthProvider("github")
  public data object Tiktok : OAuthProvider("tiktok")
  public data object Gitlab : OAuthProvider("gitlab")
  public data object Discord : OAuthProvider("discord")
  public data object Twitter : OAuthProvider("twitter")
  public data object Twitch : OAuthProvider("twitch")
  public data object Linkedin : OAuthProvider("linkedin")
  public data object LinkedinOidc : OAuthProvider("linkedin_oidc")
  public data object Dropbox : OAuthProvider("dropbox")
  public data object Atlassian : OAuthProvider("atlassian")
  public data object Bitbucket : OAuthProvider("bitbucket")
  public data object Microsoft : OAuthProvider("microsoft")
  public data object Notion : OAuthProvider("notion")
  public data object Apple : OAuthProvider("apple")
  public data object Line : OAuthProvider("line")
  public data object Instagram : OAuthProvider("instagram")
  public data object Coinbase : OAuthProvider("coinbase")
  public data object Spotify : OAuthProvider("spotify")
  public data object Xero : OAuthProvider("xero")
  public data object Box : OAuthProvider("box")
  public data object Slack : OAuthProvider("slack")
  public data object Linear : OAuthProvider("linear")
  public data object X : OAuthProvider("x")
  public data object Enstall : OAuthProvider("enstall")
  public data object Huggingface : OAuthProvider("huggingface")
  public data object Vercel : OAuthProvider("vercel")
  public data class Unrecognized(val value: String) : OAuthProvider(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OAuthProvider = when (val raw = value.requireString()) {
      "facebook" -> Facebook
      "google" -> Google
      "hubspot" -> Hubspot
      "github" -> Github
      "tiktok" -> Tiktok
      "gitlab" -> Gitlab
      "discord" -> Discord
      "twitter" -> Twitter
      "twitch" -> Twitch
      "linkedin" -> Linkedin
      "linkedin_oidc" -> LinkedinOidc
      "dropbox" -> Dropbox
      "atlassian" -> Atlassian
      "bitbucket" -> Bitbucket
      "microsoft" -> Microsoft
      "notion" -> Notion
      "apple" -> Apple
      "line" -> Line
      "instagram" -> Instagram
      "coinbase" -> Coinbase
      "spotify" -> Spotify
      "xero" -> Xero
      "box" -> Box
      "slack" -> Slack
      "linear" -> Linear
      "x" -> X
      "enstall" -> Enstall
      "huggingface" -> Huggingface
      "vercel" -> Vercel
      else -> Unrecognized(raw)
    }
  }
}

public data class ReauthorizeExternalAccountParams(public val `additionalScopes`: List<String>? = null, public val `oidcPrompt`: String? = null, public val `oidcLoginHint`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("additionalScopes", this@ReauthorizeExternalAccountParams.`additionalScopes`?.let { value -> JsonArray(value.map { value -> JsonPrimitive(value) }) } ?: Undefined)
    putPresent("oidcPrompt", this@ReauthorizeExternalAccountParams.`oidcPrompt`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("oidcLoginHint", this@ReauthorizeExternalAccountParams.`oidcLoginHint`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ReauthorizeExternalAccountParams {
      val values = value.jsonObject

      return ReauthorizeExternalAccountParams(`additionalScopes` = (values["additionalScopes"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> value.requireString() } }, `oidcPrompt` = (values["oidcPrompt"] ?: Undefined).decodeOptional { value -> value.requireString() }, `oidcLoginHint` = (values["oidcLoginHint"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class EnterpriseAccountState(public val `active`: Boolean, public val `emailAddress`: String, public val `enterpriseConnection`: EnterpriseAccountConnection?, public val `enterpriseConnectionId`: String?, public val `firstName`: String?, public val `lastName`: String?, public val `protocol`: EnterpriseProtocol, public val `provider`: EnterpriseProvider, public val `providerUserId`: String?, public val `publicMetadata`: Map<String, JsonElement>?, public val `verification`: Verification?, public val `lastAuthenticatedAt`: Instant?, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("active", JsonPrimitive(this@EnterpriseAccountState.`active`))
    putPresent("emailAddress", JsonPrimitive(this@EnterpriseAccountState.`emailAddress`))
    putPresent("enterpriseConnection", this@EnterpriseAccountState.`enterpriseConnection`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("enterpriseConnectionId", this@EnterpriseAccountState.`enterpriseConnectionId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("firstName", this@EnterpriseAccountState.`firstName`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("lastName", this@EnterpriseAccountState.`lastName`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("protocol", this@EnterpriseAccountState.`protocol`.toJson())
    putPresent("provider", this@EnterpriseAccountState.`provider`.toJson())
    putPresent("providerUserId", this@EnterpriseAccountState.`providerUserId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("publicMetadata", this@EnterpriseAccountState.`publicMetadata`?.let { value -> JsonObject(value.mapValues { (_, value) -> value }) } ?: JsonNull)
    putPresent("verification", this@EnterpriseAccountState.`verification`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("lastAuthenticatedAt", this@EnterpriseAccountState.`lastAuthenticatedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("id", this@EnterpriseAccountState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseAccountState {
      val values = value.jsonObject

      return EnterpriseAccountState(`active` = (values["active"] ?: Undefined).requireBoolean(), `emailAddress` = (values["emailAddress"] ?: Undefined).requireString(), `enterpriseConnection` = (values["enterpriseConnection"] ?: Undefined).decodeOptional { value -> EnterpriseAccountConnection.fromJson(value, runtime) }, `enterpriseConnectionId` = (values["enterpriseConnectionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `protocol` = EnterpriseProtocol.fromJson((values["protocol"] ?: Undefined), runtime), `provider` = EnterpriseProvider.fromJson((values["provider"] ?: Undefined), runtime), `providerUserId` = (values["providerUserId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `publicMetadata` = (values["publicMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject.mapValues { (_, value) -> value } }, `verification` = (values["verification"] ?: Undefined).decodeOptional { value -> Verification.fromJson(value, runtime) }, `lastAuthenticatedAt` = (values["lastAuthenticatedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}
public class EnterpriseAccount(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: EnterpriseAccountState get() = context.state(handle)
  public val changes: Flow<EnterpriseAccountState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `active`: Boolean get() = state.`active`
  public val `emailAddress`: String get() = state.`emailAddress`
  public val `enterpriseConnection`: EnterpriseAccountConnection? get() = state.`enterpriseConnection`
  public val `enterpriseConnectionId`: String? get() = state.`enterpriseConnectionId`
  public val `firstName`: String? get() = state.`firstName`
  public val `lastName`: String? get() = state.`lastName`
  public val `protocol`: EnterpriseProtocol get() = state.`protocol`
  public val `provider`: EnterpriseProvider get() = state.`provider`
  public val `providerUserId`: String? get() = state.`providerUserId`
  public val `publicMetadata`: Map<String, JsonElement>? get() = state.`publicMetadata`
  public val `verification`: Verification? get() = state.`verification`
  public val `lastAuthenticatedAt`: Instant? get() = state.`lastAuthenticatedAt`
  public val `id`: String? get() = state.`id`
  override fun prepare(value: JsonElement): Any = EnterpriseAccountState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseAccount = runtime.resource(ResourceHandle.fromReference(value)) as EnterpriseAccount
  }
  public suspend fun `destroy`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EnterpriseAccount.destroy", listOf()) { result ->
      Unit
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): EnterpriseAccount {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EnterpriseAccount.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      EnterpriseAccount.fromJson(result, runtime)
    }
  }
}

public data class EnterpriseAccountConnectionState(public val `active`: Boolean, public val `allowIdpInitiated`: Boolean, public val `allowSubdomains`: Boolean, public val `disableAdditionalIdentifications`: Boolean, public val `domain`: String, public val `logoPublicUrl`: String?, public val `name`: String, public val `protocol`: EnterpriseProtocol, public val `provider`: EnterpriseProvider, public val `syncUserAttributes`: Boolean, public val `allowOrganizationAccountLinking`: Boolean, public val `enterpriseConnectionId`: String?, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("active", JsonPrimitive(this@EnterpriseAccountConnectionState.`active`))
    putPresent("allowIdpInitiated", JsonPrimitive(this@EnterpriseAccountConnectionState.`allowIdpInitiated`))
    putPresent("allowSubdomains", JsonPrimitive(this@EnterpriseAccountConnectionState.`allowSubdomains`))
    putPresent("disableAdditionalIdentifications", JsonPrimitive(this@EnterpriseAccountConnectionState.`disableAdditionalIdentifications`))
    putPresent("domain", JsonPrimitive(this@EnterpriseAccountConnectionState.`domain`))
    putPresent("logoPublicUrl", this@EnterpriseAccountConnectionState.`logoPublicUrl`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("name", JsonPrimitive(this@EnterpriseAccountConnectionState.`name`))
    putPresent("protocol", this@EnterpriseAccountConnectionState.`protocol`.toJson())
    putPresent("provider", this@EnterpriseAccountConnectionState.`provider`.toJson())
    putPresent("syncUserAttributes", JsonPrimitive(this@EnterpriseAccountConnectionState.`syncUserAttributes`))
    putPresent("allowOrganizationAccountLinking", JsonPrimitive(this@EnterpriseAccountConnectionState.`allowOrganizationAccountLinking`))
    putPresent("enterpriseConnectionId", this@EnterpriseAccountConnectionState.`enterpriseConnectionId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("id", this@EnterpriseAccountConnectionState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseAccountConnectionState {
      val values = value.jsonObject

      return EnterpriseAccountConnectionState(`active` = (values["active"] ?: Undefined).requireBoolean(), `allowIdpInitiated` = (values["allowIdpInitiated"] ?: Undefined).requireBoolean(), `allowSubdomains` = (values["allowSubdomains"] ?: Undefined).requireBoolean(), `disableAdditionalIdentifications` = (values["disableAdditionalIdentifications"] ?: Undefined).requireBoolean(), `domain` = (values["domain"] ?: Undefined).requireString(), `logoPublicUrl` = (values["logoPublicUrl"] ?: Undefined).decodeOptional { value -> value.requireString() }, `name` = (values["name"] ?: Undefined).requireString(), `protocol` = EnterpriseProtocol.fromJson((values["protocol"] ?: Undefined), runtime), `provider` = EnterpriseProvider.fromJson((values["provider"] ?: Undefined), runtime), `syncUserAttributes` = (values["syncUserAttributes"] ?: Undefined).requireBoolean(), `allowOrganizationAccountLinking` = (values["allowOrganizationAccountLinking"] ?: Undefined).requireBoolean(), `enterpriseConnectionId` = (values["enterpriseConnectionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}
public class EnterpriseAccountConnection(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: EnterpriseAccountConnectionState get() = context.state(handle)
  public val changes: Flow<EnterpriseAccountConnectionState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `active`: Boolean get() = state.`active`
  public val `allowIdpInitiated`: Boolean get() = state.`allowIdpInitiated`
  public val `allowSubdomains`: Boolean get() = state.`allowSubdomains`
  public val `disableAdditionalIdentifications`: Boolean get() = state.`disableAdditionalIdentifications`
  public val `domain`: String get() = state.`domain`
  public val `logoPublicUrl`: String? get() = state.`logoPublicUrl`
  public val `name`: String get() = state.`name`
  public val `protocol`: EnterpriseProtocol get() = state.`protocol`
  public val `provider`: EnterpriseProvider get() = state.`provider`
  public val `syncUserAttributes`: Boolean get() = state.`syncUserAttributes`
  public val `allowOrganizationAccountLinking`: Boolean get() = state.`allowOrganizationAccountLinking`
  public val `enterpriseConnectionId`: String? get() = state.`enterpriseConnectionId`
  public val `id`: String? get() = state.`id`
  override fun prepare(value: JsonElement): Any = EnterpriseAccountConnectionState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseAccountConnection = runtime.resource(ResourceHandle.fromReference(value)) as EnterpriseAccountConnection
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): EnterpriseAccountConnection {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EnterpriseAccountConnection.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      EnterpriseAccountConnection.fromJson(result, runtime)
    }
  }
}

public sealed class EnterpriseProtocol(public val rawValue: String) {
  public data object Saml : EnterpriseProtocol("saml")
  public data object Oauth : EnterpriseProtocol("oauth")
  public data class Unrecognized(val value: String) : EnterpriseProtocol(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseProtocol = when (val raw = value.requireString()) {
      "saml" -> Saml
      "oauth" -> Oauth
      else -> Unrecognized(raw)
    }
  }
}

public sealed class EnterpriseProvider(public val rawValue: String) {
  public data object OauthFacebook : EnterpriseProvider("oauth_facebook")
  public data object OauthGoogle : EnterpriseProvider("oauth_google")
  public data object OauthHubspot : EnterpriseProvider("oauth_hubspot")
  public data object OauthGithub : EnterpriseProvider("oauth_github")
  public data object OauthTiktok : EnterpriseProvider("oauth_tiktok")
  public data object OauthGitlab : EnterpriseProvider("oauth_gitlab")
  public data object OauthDiscord : EnterpriseProvider("oauth_discord")
  public data object OauthTwitter : EnterpriseProvider("oauth_twitter")
  public data object OauthTwitch : EnterpriseProvider("oauth_twitch")
  public data object OauthLinkedin : EnterpriseProvider("oauth_linkedin")
  public data object OauthLinkedinOidc : EnterpriseProvider("oauth_linkedin_oidc")
  public data object OauthDropbox : EnterpriseProvider("oauth_dropbox")
  public data object OauthAtlassian : EnterpriseProvider("oauth_atlassian")
  public data object OauthBitbucket : EnterpriseProvider("oauth_bitbucket")
  public data object OauthMicrosoft : EnterpriseProvider("oauth_microsoft")
  public data object OauthNotion : EnterpriseProvider("oauth_notion")
  public data object OauthApple : EnterpriseProvider("oauth_apple")
  public data object OauthLine : EnterpriseProvider("oauth_line")
  public data object OauthInstagram : EnterpriseProvider("oauth_instagram")
  public data object OauthCoinbase : EnterpriseProvider("oauth_coinbase")
  public data object OauthSpotify : EnterpriseProvider("oauth_spotify")
  public data object OauthXero : EnterpriseProvider("oauth_xero")
  public data object OauthBox : EnterpriseProvider("oauth_box")
  public data object OauthSlack : EnterpriseProvider("oauth_slack")
  public data object OauthLinear : EnterpriseProvider("oauth_linear")
  public data object OauthX : EnterpriseProvider("oauth_x")
  public data object OauthEnstall : EnterpriseProvider("oauth_enstall")
  public data object OauthHuggingface : EnterpriseProvider("oauth_huggingface")
  public data object OauthVercel : EnterpriseProvider("oauth_vercel")
  public data object SamlOkta : EnterpriseProvider("saml_okta")
  public data object SamlGoogle : EnterpriseProvider("saml_google")
  public data object SamlMicrosoft : EnterpriseProvider("saml_microsoft")
  public data object SamlCustom : EnterpriseProvider("saml_custom")
  public data class Unrecognized(val value: String) : EnterpriseProvider(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseProvider = when (val raw = value.requireString()) {
      "oauth_facebook" -> OauthFacebook
      "oauth_google" -> OauthGoogle
      "oauth_hubspot" -> OauthHubspot
      "oauth_github" -> OauthGithub
      "oauth_tiktok" -> OauthTiktok
      "oauth_gitlab" -> OauthGitlab
      "oauth_discord" -> OauthDiscord
      "oauth_twitter" -> OauthTwitter
      "oauth_twitch" -> OauthTwitch
      "oauth_linkedin" -> OauthLinkedin
      "oauth_linkedin_oidc" -> OauthLinkedinOidc
      "oauth_dropbox" -> OauthDropbox
      "oauth_atlassian" -> OauthAtlassian
      "oauth_bitbucket" -> OauthBitbucket
      "oauth_microsoft" -> OauthMicrosoft
      "oauth_notion" -> OauthNotion
      "oauth_apple" -> OauthApple
      "oauth_line" -> OauthLine
      "oauth_instagram" -> OauthInstagram
      "oauth_coinbase" -> OauthCoinbase
      "oauth_spotify" -> OauthSpotify
      "oauth_xero" -> OauthXero
      "oauth_box" -> OauthBox
      "oauth_slack" -> OauthSlack
      "oauth_linear" -> OauthLinear
      "oauth_x" -> OauthX
      "oauth_enstall" -> OauthEnstall
      "oauth_huggingface" -> OauthHuggingface
      "oauth_vercel" -> OauthVercel
      "saml_okta" -> SamlOkta
      "saml_google" -> SamlGoogle
      "saml_microsoft" -> SamlMicrosoft
      "saml_custom" -> SamlCustom
      else -> Unrecognized(raw)
    }
  }
}

public data class PasskeyState(public val `id`: String, public val `name`: String?, public val `verification`: PasskeyVerification?, public val `lastUsedAt`: Instant?, public val `updatedAt`: Instant, public val `createdAt`: Instant) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@PasskeyState.`id`))
    putPresent("name", this@PasskeyState.`name`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("verification", this@PasskeyState.`verification`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("lastUsedAt", this@PasskeyState.`lastUsedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("updatedAt", JsonPrimitive(this@PasskeyState.`updatedAt`.toString()))
    putPresent("createdAt", JsonPrimitive(this@PasskeyState.`createdAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PasskeyState {
      val values = value.jsonObject

      return PasskeyState(`id` = (values["id"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).decodeOptional { value -> value.requireString() }, `verification` = (values["verification"] ?: Undefined).decodeOptional { value -> PasskeyVerification.fromJson(value, runtime) }, `lastUsedAt` = (values["lastUsedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()))
    }
  }
}
public class Passkey(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: PasskeyState get() = context.state(handle)
  public val changes: Flow<PasskeyState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `name`: String? get() = state.`name`
  public val `verification`: PasskeyVerification? get() = state.`verification`
  public val `lastUsedAt`: Instant? get() = state.`lastUsedAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  public val `createdAt`: Instant get() = state.`createdAt`
  override fun prepare(value: JsonElement): Any = PasskeyState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Passkey = runtime.resource(ResourceHandle.fromReference(value)) as Passkey
  }
  public suspend fun `update`(`params`: Partialtype): Passkey {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Passkey.update", listOf(`params`.toJson())) { result ->
      Passkey.fromJson(result, runtime)
    }
  }
  public suspend fun `delete`(): DeletedObject {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Passkey.delete", listOf()) { result ->
      DeletedObject.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): Passkey {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "Passkey.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Passkey.fromJson(result, runtime)
    }
  }
}

public data class PasskeyVerificationState(public val `attempts`: Double?, public val `error`: ClerkAPIError?, public val `expireAt`: Instant?, public val `status`: VerificationStatus?, public val `strategy`: String?, public val `verifiedAtClient`: String?, public val `channel`: PhoneCodeChannel? = null, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("attempts", this@PasskeyVerificationState.`attempts`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("error", this@PasskeyVerificationState.`error`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("expireAt", this@PasskeyVerificationState.`expireAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("status", this@PasskeyVerificationState.`status`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("strategy", this@PasskeyVerificationState.`strategy`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("verifiedAtClient", this@PasskeyVerificationState.`verifiedAtClient`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("channel", this@PasskeyVerificationState.`channel`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("id", this@PasskeyVerificationState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PasskeyVerificationState {
      val values = value.jsonObject

      return PasskeyVerificationState(`attempts` = (values["attempts"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `error` = (values["error"] ?: Undefined).decodeOptional { value -> ClerkAPIError.fromJson(value, runtime) }, `expireAt` = (values["expireAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `status` = (values["status"] ?: Undefined).decodeOptional { value -> VerificationStatus.fromJson(value, runtime) }, `strategy` = (values["strategy"] ?: Undefined).decodeOptional { value -> value.requireString() }, `verifiedAtClient` = (values["verifiedAtClient"] ?: Undefined).decodeOptional { value -> value.requireString() }, `channel` = (values["channel"] ?: Undefined).decodeOptional { value -> PhoneCodeChannel.fromJson(value, runtime) }, `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}
public class PasskeyVerification(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: PasskeyVerificationState get() = context.state(handle)
  public val changes: Flow<PasskeyVerificationState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `attempts`: Double? get() = state.`attempts`
  public val `error`: ClerkAPIError? get() = state.`error`
  public val `expireAt`: Instant? get() = state.`expireAt`
  public val `status`: VerificationStatus? get() = state.`status`
  public val `strategy`: String? get() = state.`strategy`
  public val `verifiedAtClient`: String? get() = state.`verifiedAtClient`
  public val `channel`: PhoneCodeChannel? get() = state.`channel`
  public val `id`: String? get() = state.`id`
  override fun prepare(value: JsonElement): Any = PasskeyVerificationState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PasskeyVerification = runtime.resource(ResourceHandle.fromReference(value)) as PasskeyVerification
  }
  public suspend fun `verifiedFromTheSameClient`(): Boolean {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PasskeyVerification.verifiedFromTheSameClient", listOf()) { result ->
      result.requireBoolean()
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): PasskeyVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PasskeyVerification.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      PasskeyVerification.fromJson(result, runtime)
    }
  }
}

/**
 * Make all properties in T optional
 */
public data class Partialtype(public val `name`: Field<String> = Field.Omitted) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("name", this@Partialtype.`name`.toJson { value -> JsonPrimitive(value) })
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Partialtype {
      val values = value.jsonObject

      return Partialtype(`name` = Field.fromJson((values["name"] ?: Undefined)) { value -> value.requireString() })
    }
  }
}

public data class UpdateUserParams(public val `username`: Field<String> = Field.Omitted, public val `firstName`: Field<String> = Field.Omitted, public val `lastName`: Field<String> = Field.Omitted, public val `primaryEmailAddressId`: Field<String> = Field.Omitted, public val `primaryPhoneNumberId`: Field<String> = Field.Omitted, public val `primaryWeb3WalletId`: Field<String> = Field.Omitted, public val `unsafeMetadata`: JsonObject? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("username", this@UpdateUserParams.`username`.toJson { value -> JsonPrimitive(value) })
    putPresent("firstName", this@UpdateUserParams.`firstName`.toJson { value -> JsonPrimitive(value) })
    putPresent("lastName", this@UpdateUserParams.`lastName`.toJson { value -> JsonPrimitive(value) })
    putPresent("primaryEmailAddressId", this@UpdateUserParams.`primaryEmailAddressId`.toJson { value -> JsonPrimitive(value) })
    putPresent("primaryPhoneNumberId", this@UpdateUserParams.`primaryPhoneNumberId`.toJson { value -> JsonPrimitive(value) })
    putPresent("primaryWeb3WalletId", this@UpdateUserParams.`primaryWeb3WalletId`.toJson { value -> JsonPrimitive(value) })
    putPresent("unsafeMetadata", this@UpdateUserParams.`unsafeMetadata`?.let { value -> value } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UpdateUserParams {
      val values = value.jsonObject

      return UpdateUserParams(`username` = Field.fromJson((values["username"] ?: Undefined)) { value -> value.requireString() }, `firstName` = Field.fromJson((values["firstName"] ?: Undefined)) { value -> value.requireString() }, `lastName` = Field.fromJson((values["lastName"] ?: Undefined)) { value -> value.requireString() }, `primaryEmailAddressId` = Field.fromJson((values["primaryEmailAddressId"] ?: Undefined)) { value -> value.requireString() }, `primaryPhoneNumberId` = Field.fromJson((values["primaryPhoneNumberId"] ?: Undefined)) { value -> value.requireString() }, `primaryWeb3WalletId` = Field.fromJson((values["primaryWeb3WalletId"] ?: Undefined)) { value -> value.requireString() }, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject })
    }
  }
}

public data class UpdateUserMetadataParams(public val `unsafeMetadata`: JsonObject) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("unsafeMetadata", this@UpdateUserMetadataParams.`unsafeMetadata`)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UpdateUserMetadataParams {
      val values = value.jsonObject

      return UpdateUserMetadataParams(`unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).jsonObject)
    }
  }
}

public data class UpdateUserPasswordParams(public val `newPassword`: String, public val `currentPassword`: String? = null, public val `signOutOfOtherSessions`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("newPassword", JsonPrimitive(this@UpdateUserPasswordParams.`newPassword`))
    putPresent("currentPassword", this@UpdateUserPasswordParams.`currentPassword`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("signOutOfOtherSessions", this@UpdateUserPasswordParams.`signOutOfOtherSessions`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UpdateUserPasswordParams {
      val values = value.jsonObject

      return UpdateUserPasswordParams(`newPassword` = (values["newPassword"] ?: Undefined).requireString(), `currentPassword` = (values["currentPassword"] ?: Undefined).decodeOptional { value -> value.requireString() }, `signOutOfOtherSessions` = (values["signOutOfOtherSessions"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public data class RemoveUserPasswordParams(public val `currentPassword`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("currentPassword", this@RemoveUserPasswordParams.`currentPassword`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): RemoveUserPasswordParams {
      val values = value.jsonObject

      return RemoveUserPasswordParams(`currentPassword` = (values["currentPassword"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class CreateEmailAddressParams(public val `email`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("email", JsonPrimitive(this@CreateEmailAddressParams.`email`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreateEmailAddressParams {
      val values = value.jsonObject

      return CreateEmailAddressParams(`email` = (values["email"] ?: Undefined).requireString())
    }
  }
}

public data class CreatePhoneNumberParams(public val `phoneNumber`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("phoneNumber", JsonPrimitive(this@CreatePhoneNumberParams.`phoneNumber`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreatePhoneNumberParams {
      val values = value.jsonObject

      return CreatePhoneNumberParams(`phoneNumber` = (values["phoneNumber"] ?: Undefined).requireString())
    }
  }
}

public data class CreateWeb3WalletParams(public val `web3Wallet`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("web3Wallet", JsonPrimitive(this@CreateWeb3WalletParams.`web3Wallet`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreateWeb3WalletParams {
      val values = value.jsonObject

      return CreateWeb3WalletParams(`web3Wallet` = (values["web3Wallet"] ?: Undefined).requireString())
    }
  }
}

public sealed interface UserIsPrimaryIdentificationIdent {
  public data class Case1(val value: EmailAddress) : UserIsPrimaryIdentificationIdent
  public data class Case2(val value: PhoneNumber) : UserIsPrimaryIdentificationIdent
  public data class Case3(val value: Web3Wallet) : UserIsPrimaryIdentificationIdent
  public val `id`: String get() = when (this) {
    is Case1 -> value.`id`
    is Case2 -> value.`id`
    is Case3 -> value.`id`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UserIsPrimaryIdentificationIdent {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(EmailAddress.fromJson(payload, runtime))
        1 -> Case2(PhoneNumber.fromJson(payload, runtime))
        2 -> Case3(Web3Wallet.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class SessionWithActivitiesState(public val `id`: String, public val `status`: String, public val `expireAt`: Instant, public val `abandonAt`: Instant, public val `lastActiveAt`: Instant, public val `latestActivity`: SessionActivity, public val `actor`: JsonObject?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@SessionWithActivitiesState.`id`))
    putPresent("status", JsonPrimitive(this@SessionWithActivitiesState.`status`))
    putPresent("expireAt", JsonPrimitive(this@SessionWithActivitiesState.`expireAt`.toString()))
    putPresent("abandonAt", JsonPrimitive(this@SessionWithActivitiesState.`abandonAt`.toString()))
    putPresent("lastActiveAt", JsonPrimitive(this@SessionWithActivitiesState.`lastActiveAt`.toString()))
    putPresent("latestActivity", this@SessionWithActivitiesState.`latestActivity`.toJson())
    putPresent("actor", this@SessionWithActivitiesState.`actor`?.let { value -> value } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionWithActivitiesState {
      val values = value.jsonObject

      return SessionWithActivitiesState(`id` = (values["id"] ?: Undefined).requireString(), `status` = (values["status"] ?: Undefined).requireString(), `expireAt` = Instant.parse((values["expireAt"] ?: Undefined).requireString()), `abandonAt` = Instant.parse((values["abandonAt"] ?: Undefined).requireString()), `lastActiveAt` = Instant.parse((values["lastActiveAt"] ?: Undefined).requireString()), `latestActivity` = SessionActivity.fromJson((values["latestActivity"] ?: Undefined), runtime), `actor` = (values["actor"] ?: Undefined).decodeOptional { value -> value.jsonObject })
    }
  }
}
public class SessionWithActivities(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SessionWithActivitiesState get() = context.state(handle)
  public val changes: Flow<SessionWithActivitiesState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `status`: String get() = state.`status`
  public val `expireAt`: Instant get() = state.`expireAt`
  public val `abandonAt`: Instant get() = state.`abandonAt`
  public val `lastActiveAt`: Instant get() = state.`lastActiveAt`
  public val `latestActivity`: SessionActivity get() = state.`latestActivity`
  public val `actor`: JsonObject? get() = state.`actor`
  override fun prepare(value: JsonElement): Any = SessionWithActivitiesState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionWithActivities = runtime.resource(ResourceHandle.fromReference(value)) as SessionWithActivities
  }
  public suspend fun `revoke`(): SessionWithActivities {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SessionWithActivities.revoke", listOf()) { result ->
      SessionWithActivities.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): SessionWithActivities {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SessionWithActivities.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      SessionWithActivities.fromJson(result, runtime)
    }
  }
}

public data class SessionActivity(public val `id`: String, public val `browserName`: String? = null, public val `browserVersion`: String? = null, public val `deviceType`: String? = null, public val `ipAddress`: String? = null, public val `city`: String? = null, public val `country`: String? = null, public val `isMobile`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@SessionActivity.`id`))
    putPresent("browserName", this@SessionActivity.`browserName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("browserVersion", this@SessionActivity.`browserVersion`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("deviceType", this@SessionActivity.`deviceType`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("ipAddress", this@SessionActivity.`ipAddress`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("city", this@SessionActivity.`city`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("country", this@SessionActivity.`country`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("isMobile", this@SessionActivity.`isMobile`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionActivity {
      val values = value.jsonObject

      return SessionActivity(`id` = (values["id"] ?: Undefined).requireString(), `browserName` = (values["browserName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `browserVersion` = (values["browserVersion"] ?: Undefined).decodeOptional { value -> value.requireString() }, `deviceType` = (values["deviceType"] ?: Undefined).decodeOptional { value -> value.requireString() }, `ipAddress` = (values["ipAddress"] ?: Undefined).decodeOptional { value -> value.requireString() }, `city` = (values["city"] ?: Undefined).decodeOptional { value -> value.requireString() }, `country` = (values["country"] ?: Undefined).decodeOptional { value -> value.requireString() }, `isMobile` = (values["isMobile"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public data class SetProfileImageParams(public val `file`: SetOrganizationLogoParamsFile?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("file", this@SetProfileImageParams.`file`?.let { value -> value.toJson() } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SetProfileImageParams {
      val values = value.jsonObject

      return SetProfileImageParams(`file` = (values["file"] ?: Undefined).decodeOptional { value -> SetOrganizationLogoParamsFile.fromJson(value, runtime) })
    }
  }
}

/**
 * Represents information about an image.
 */
public data class ImageResourceState(public val `id`: String? = null, public val `name`: String?, public val `publicUrl`: String?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", this@ImageResourceState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("name", this@ImageResourceState.`name`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("publicUrl", this@ImageResourceState.`publicUrl`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ImageResourceState {
      val values = value.jsonObject

      return ImageResourceState(`id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() }, `name` = (values["name"] ?: Undefined).decodeOptional { value -> value.requireString() }, `publicUrl` = (values["publicUrl"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}
public class ImageResource(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: ImageResourceState get() = context.state(handle)
  public val changes: Flow<ImageResourceState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String? get() = state.`id`
  public val `name`: String? get() = state.`name`
  public val `publicUrl`: String? get() = state.`publicUrl`
  override fun prepare(value: JsonElement): Any = ImageResourceState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ImageResource = runtime.resource(ResourceHandle.fromReference(value)) as ImageResource
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): ImageResource {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ImageResource.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ImageResource.fromJson(result, runtime)
    }
  }
}

public data class CreateExternalAccountParams(public val `strategy`: CreateExternalAccountParamsStrategy? = null, public val `token`: String? = null, public val `enterpriseConnectionId`: String? = null, public val `additionalScopes`: List<String>? = null, public val `oidcPrompt`: String? = null, public val `oidcLoginHint`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", this@CreateExternalAccountParams.`strategy`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("token", this@CreateExternalAccountParams.`token`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("enterpriseConnectionId", this@CreateExternalAccountParams.`enterpriseConnectionId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("additionalScopes", this@CreateExternalAccountParams.`additionalScopes`?.let { value -> JsonArray(value.map { value -> JsonPrimitive(value) }) } ?: Undefined)
    putPresent("oidcPrompt", this@CreateExternalAccountParams.`oidcPrompt`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("oidcLoginHint", this@CreateExternalAccountParams.`oidcLoginHint`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreateExternalAccountParams {
      val values = value.jsonObject

      return CreateExternalAccountParams(`strategy` = (values["strategy"] ?: Undefined).decodeOptional { value -> CreateExternalAccountParamsStrategy.fromJson(value, runtime) }, `token` = (values["token"] ?: Undefined).decodeOptional { value -> value.requireString() }, `enterpriseConnectionId` = (values["enterpriseConnectionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `additionalScopes` = (values["additionalScopes"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> value.requireString() } }, `oidcPrompt` = (values["oidcPrompt"] ?: Undefined).decodeOptional { value -> value.requireString() }, `oidcLoginHint` = (values["oidcLoginHint"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public sealed class CreateExternalAccountParamsStrategy(public val rawValue: String) {
  public data object OauthTokenApple : CreateExternalAccountParamsStrategy("oauth_token_apple")
  public data object OauthFacebook : CreateExternalAccountParamsStrategy("oauth_facebook")
  public data object OauthGoogle : CreateExternalAccountParamsStrategy("oauth_google")
  public data object OauthHubspot : CreateExternalAccountParamsStrategy("oauth_hubspot")
  public data object OauthGithub : CreateExternalAccountParamsStrategy("oauth_github")
  public data object OauthTiktok : CreateExternalAccountParamsStrategy("oauth_tiktok")
  public data object OauthGitlab : CreateExternalAccountParamsStrategy("oauth_gitlab")
  public data object OauthDiscord : CreateExternalAccountParamsStrategy("oauth_discord")
  public data object OauthTwitter : CreateExternalAccountParamsStrategy("oauth_twitter")
  public data object OauthTwitch : CreateExternalAccountParamsStrategy("oauth_twitch")
  public data object OauthLinkedin : CreateExternalAccountParamsStrategy("oauth_linkedin")
  public data object OauthLinkedinOidc : CreateExternalAccountParamsStrategy("oauth_linkedin_oidc")
  public data object OauthDropbox : CreateExternalAccountParamsStrategy("oauth_dropbox")
  public data object OauthAtlassian : CreateExternalAccountParamsStrategy("oauth_atlassian")
  public data object OauthBitbucket : CreateExternalAccountParamsStrategy("oauth_bitbucket")
  public data object OauthMicrosoft : CreateExternalAccountParamsStrategy("oauth_microsoft")
  public data object OauthNotion : CreateExternalAccountParamsStrategy("oauth_notion")
  public data object OauthApple : CreateExternalAccountParamsStrategy("oauth_apple")
  public data object OauthLine : CreateExternalAccountParamsStrategy("oauth_line")
  public data object OauthInstagram : CreateExternalAccountParamsStrategy("oauth_instagram")
  public data object OauthCoinbase : CreateExternalAccountParamsStrategy("oauth_coinbase")
  public data object OauthSpotify : CreateExternalAccountParamsStrategy("oauth_spotify")
  public data object OauthXero : CreateExternalAccountParamsStrategy("oauth_xero")
  public data object OauthBox : CreateExternalAccountParamsStrategy("oauth_box")
  public data object OauthSlack : CreateExternalAccountParamsStrategy("oauth_slack")
  public data object OauthLinear : CreateExternalAccountParamsStrategy("oauth_linear")
  public data object OauthX : CreateExternalAccountParamsStrategy("oauth_x")
  public data object OauthEnstall : CreateExternalAccountParamsStrategy("oauth_enstall")
  public data object OauthHuggingface : CreateExternalAccountParamsStrategy("oauth_huggingface")
  public data object OauthVercel : CreateExternalAccountParamsStrategy("oauth_vercel")
  public data class Unrecognized(val value: String) : CreateExternalAccountParamsStrategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CreateExternalAccountParamsStrategy = when (val raw = value.requireString()) {
      "oauth_token_apple" -> OauthTokenApple
      "oauth_facebook" -> OauthFacebook
      "oauth_google" -> OauthGoogle
      "oauth_hubspot" -> OauthHubspot
      "oauth_github" -> OauthGithub
      "oauth_tiktok" -> OauthTiktok
      "oauth_gitlab" -> OauthGitlab
      "oauth_discord" -> OauthDiscord
      "oauth_twitter" -> OauthTwitter
      "oauth_twitch" -> OauthTwitch
      "oauth_linkedin" -> OauthLinkedin
      "oauth_linkedin_oidc" -> OauthLinkedinOidc
      "oauth_dropbox" -> OauthDropbox
      "oauth_atlassian" -> OauthAtlassian
      "oauth_bitbucket" -> OauthBitbucket
      "oauth_microsoft" -> OauthMicrosoft
      "oauth_notion" -> OauthNotion
      "oauth_apple" -> OauthApple
      "oauth_line" -> OauthLine
      "oauth_instagram" -> OauthInstagram
      "oauth_coinbase" -> OauthCoinbase
      "oauth_spotify" -> OauthSpotify
      "oauth_xero" -> OauthXero
      "oauth_box" -> OauthBox
      "oauth_slack" -> OauthSlack
      "oauth_linear" -> OauthLinear
      "oauth_x" -> OauthX
      "oauth_enstall" -> OauthEnstall
      "oauth_huggingface" -> OauthHuggingface
      "oauth_vercel" -> OauthVercel
      else -> Unrecognized(raw)
    }
  }
}

public data class GetUserOrganizationMembershipParams(public val `initialPage`: Double? = null, public val `pageSize`: Double? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("initialPage", this@GetUserOrganizationMembershipParams.`initialPage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("pageSize", this@GetUserOrganizationMembershipParams.`pageSize`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetUserOrganizationMembershipParams {
      val values = value.jsonObject

      return GetUserOrganizationMembershipParams(`initialPage` = (values["initialPage"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `pageSize` = (values["pageSize"] ?: Undefined).decodeOptional { value -> value.requireDouble() })
    }
  }
}

public data class GetUserOrganizationInvitationsParams(public val `initialPage`: Double? = null, public val `pageSize`: Double? = null, public val `status`: OrganizationInvitationStatus? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("initialPage", this@GetUserOrganizationInvitationsParams.`initialPage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("pageSize", this@GetUserOrganizationInvitationsParams.`pageSize`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("status", this@GetUserOrganizationInvitationsParams.`status`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetUserOrganizationInvitationsParams {
      val values = value.jsonObject

      return GetUserOrganizationInvitationsParams(`initialPage` = (values["initialPage"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `pageSize` = (values["pageSize"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `status` = (values["status"] ?: Undefined).decodeOptional { value -> OrganizationInvitationStatus.fromJson(value, runtime) })
    }
  }
}

/**
 * An interface that describes the response of a method that returns a paginated list of resources.
 *
 * > [!TIP]
 * > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
 */
public data class ClerkPaginatedResponseUserOrganizationInvitation(public val `data`: List<UserOrganizationInvitation>, public val `totalCount`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("data", JsonArray(this@ClerkPaginatedResponseUserOrganizationInvitation.`data`.map { value -> value.toJson() }))
    putPresent("total_count", JsonPrimitive(this@ClerkPaginatedResponseUserOrganizationInvitation.`totalCount`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkPaginatedResponseUserOrganizationInvitation {
      val values = value.jsonObject

      return ClerkPaginatedResponseUserOrganizationInvitation(`data` = (values["data"] ?: Undefined).jsonArray.map { value -> UserOrganizationInvitation.fromJson(value, runtime) }, `totalCount` = (values["total_count"] ?: Undefined).requireDouble())
    }
  }
}

/**
 * The `OrganizationInvitation` object is the model around an organization invitation.
 */
public data class UserOrganizationInvitationState(public val `id`: String, public val `emailAddress`: String, public val `publicOrganizationData`: UserOrganizationInvitationPublicOrganizationData, public val `publicMetadata`: JsonObject, public val `role`: String, public val `status`: OrganizationInvitationStatus, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@UserOrganizationInvitationState.`id`))
    putPresent("emailAddress", JsonPrimitive(this@UserOrganizationInvitationState.`emailAddress`))
    putPresent("publicOrganizationData", this@UserOrganizationInvitationState.`publicOrganizationData`.toJson())
    putPresent("publicMetadata", this@UserOrganizationInvitationState.`publicMetadata`)
    putPresent("role", JsonPrimitive(this@UserOrganizationInvitationState.`role`))
    putPresent("status", this@UserOrganizationInvitationState.`status`.toJson())
    putPresent("createdAt", JsonPrimitive(this@UserOrganizationInvitationState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@UserOrganizationInvitationState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UserOrganizationInvitationState {
      val values = value.jsonObject

      return UserOrganizationInvitationState(`id` = (values["id"] ?: Undefined).requireString(), `emailAddress` = (values["emailAddress"] ?: Undefined).requireString(), `publicOrganizationData` = UserOrganizationInvitationPublicOrganizationData.fromJson((values["publicOrganizationData"] ?: Undefined), runtime), `publicMetadata` = (values["publicMetadata"] ?: Undefined).jsonObject, `role` = (values["role"] ?: Undefined).requireString(), `status` = OrganizationInvitationStatus.fromJson((values["status"] ?: Undefined), runtime), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class UserOrganizationInvitation(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: UserOrganizationInvitationState get() = context.state(handle)
  public val changes: Flow<UserOrganizationInvitationState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `emailAddress`: String get() = state.`emailAddress`
  public val `publicOrganizationData`: UserOrganizationInvitationPublicOrganizationData get() = state.`publicOrganizationData`
  public val `publicMetadata`: JsonObject get() = state.`publicMetadata`
  public val `role`: String get() = state.`role`
  public val `status`: OrganizationInvitationStatus get() = state.`status`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = UserOrganizationInvitationState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UserOrganizationInvitation = runtime.resource(ResourceHandle.fromReference(value)) as UserOrganizationInvitation
  }
  public suspend fun `accept`(): UserOrganizationInvitation {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "UserOrganizationInvitation.accept", listOf()) { result ->
      UserOrganizationInvitation.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): UserOrganizationInvitation {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "UserOrganizationInvitation.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      UserOrganizationInvitation.fromJson(result, runtime)
    }
  }
}

public data class UserOrganizationInvitationPublicOrganizationData(public val `hasImage`: Boolean, public val `imageUrl`: String, public val `name`: String, public val `id`: String, public val `slug`: String?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("hasImage", JsonPrimitive(this@UserOrganizationInvitationPublicOrganizationData.`hasImage`))
    putPresent("imageUrl", JsonPrimitive(this@UserOrganizationInvitationPublicOrganizationData.`imageUrl`))
    putPresent("name", JsonPrimitive(this@UserOrganizationInvitationPublicOrganizationData.`name`))
    putPresent("id", JsonPrimitive(this@UserOrganizationInvitationPublicOrganizationData.`id`))
    putPresent("slug", this@UserOrganizationInvitationPublicOrganizationData.`slug`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UserOrganizationInvitationPublicOrganizationData {
      val values = value.jsonObject

      return UserOrganizationInvitationPublicOrganizationData(`hasImage` = (values["hasImage"] ?: Undefined).requireBoolean(), `imageUrl` = (values["imageUrl"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).requireString(), `id` = (values["id"] ?: Undefined).requireString(), `slug` = (values["slug"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class GetUserOrganizationSuggestionsParams(public val `initialPage`: Double? = null, public val `pageSize`: Double? = null, public val `status`: GetUserOrganizationSuggestionsParamsStatus? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("initialPage", this@GetUserOrganizationSuggestionsParams.`initialPage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("pageSize", this@GetUserOrganizationSuggestionsParams.`pageSize`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("status", this@GetUserOrganizationSuggestionsParams.`status`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetUserOrganizationSuggestionsParams {
      val values = value.jsonObject

      return GetUserOrganizationSuggestionsParams(`initialPage` = (values["initialPage"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `pageSize` = (values["pageSize"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `status` = (values["status"] ?: Undefined).decodeOptional { value -> GetUserOrganizationSuggestionsParamsStatus.fromJson(value, runtime) })
    }
  }
}

public sealed interface GetUserOrganizationSuggestionsParamsStatus {
  public data class Case1(val value: String) : GetUserOrganizationSuggestionsParamsStatus
  public data class Case2(val value: String) : GetUserOrganizationSuggestionsParamsStatus
  public data class Case3(val value: List<OrganizationSuggestionStatus>) : GetUserOrganizationSuggestionsParamsStatus
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to JsonPrimitive("accepted")))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to JsonPrimitive("pending")))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to JsonArray(value.map { value -> value.toJson() })))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetUserOrganizationSuggestionsParamsStatus {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(payload.requireLiteral(JsonPrimitive("accepted")).requireString())
        1 -> Case2(payload.requireLiteral(JsonPrimitive("pending")).requireString())
        2 -> Case3(payload.jsonArray.map { value -> OrganizationSuggestionStatus.fromJson(value, runtime) })
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public sealed class OrganizationSuggestionStatus(public val rawValue: String) {
  public data object Accepted : OrganizationSuggestionStatus("accepted")
  public data object Pending : OrganizationSuggestionStatus("pending")
  public data class Unrecognized(val value: String) : OrganizationSuggestionStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationSuggestionStatus = when (val raw = value.requireString()) {
      "accepted" -> Accepted
      "pending" -> Pending
      else -> Unrecognized(raw)
    }
  }
}

/**
 * An interface that describes the response of a method that returns a paginated list of resources.
 *
 * > [!TIP]
 * > Clerk's SDKs always use `Promise<ClerkPaginatedResponse<T>>`. If the promise resolves, you will get back the properties. If the promise is rejected, you will receive a `ClerkAPIResponseError` or network error.
 */
public data class ClerkPaginatedResponseOrganizationSuggestion(public val `data`: List<OrganizationSuggestion>, public val `totalCount`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("data", JsonArray(this@ClerkPaginatedResponseOrganizationSuggestion.`data`.map { value -> value.toJson() }))
    putPresent("total_count", JsonPrimitive(this@ClerkPaginatedResponseOrganizationSuggestion.`totalCount`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ClerkPaginatedResponseOrganizationSuggestion {
      val values = value.jsonObject

      return ClerkPaginatedResponseOrganizationSuggestion(`data` = (values["data"] ?: Undefined).jsonArray.map { value -> OrganizationSuggestion.fromJson(value, runtime) }, `totalCount` = (values["total_count"] ?: Undefined).requireDouble())
    }
  }
}

/**
 * The `OrganizationSuggestion` object is the model around [a suggestion to join an Organization](https://clerk.com/docs/guides/organizations/add-members/verified-domains#automatic-suggestions).
 */
public data class OrganizationSuggestionState(public val `id`: String, public val `publicOrganizationData`: OrganizationSuggestionPublicOrganizationData, public val `status`: OrganizationSuggestionStatus, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@OrganizationSuggestionState.`id`))
    putPresent("publicOrganizationData", this@OrganizationSuggestionState.`publicOrganizationData`.toJson())
    putPresent("status", this@OrganizationSuggestionState.`status`.toJson())
    putPresent("createdAt", JsonPrimitive(this@OrganizationSuggestionState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@OrganizationSuggestionState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationSuggestionState {
      val values = value.jsonObject

      return OrganizationSuggestionState(`id` = (values["id"] ?: Undefined).requireString(), `publicOrganizationData` = OrganizationSuggestionPublicOrganizationData.fromJson((values["publicOrganizationData"] ?: Undefined), runtime), `status` = OrganizationSuggestionStatus.fromJson((values["status"] ?: Undefined), runtime), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class OrganizationSuggestion(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: OrganizationSuggestionState get() = context.state(handle)
  public val changes: Flow<OrganizationSuggestionState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String get() = state.`id`
  public val `publicOrganizationData`: OrganizationSuggestionPublicOrganizationData get() = state.`publicOrganizationData`
  public val `status`: OrganizationSuggestionStatus get() = state.`status`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = OrganizationSuggestionState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationSuggestion = runtime.resource(ResourceHandle.fromReference(value)) as OrganizationSuggestion
  }
  /**
   * Accepts the suggestion, creating a request to join the Organization.
   */
  public suspend fun `accept`(): OrganizationSuggestion {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationSuggestion.accept", listOf()) { result ->
      OrganizationSuggestion.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): OrganizationSuggestion {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationSuggestion.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      OrganizationSuggestion.fromJson(result, runtime)
    }
  }
}

public data class OrganizationSuggestionPublicOrganizationData(public val `hasImage`: Boolean, public val `imageUrl`: String, public val `name`: String, public val `id`: String, public val `slug`: String?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("hasImage", JsonPrimitive(this@OrganizationSuggestionPublicOrganizationData.`hasImage`))
    putPresent("imageUrl", JsonPrimitive(this@OrganizationSuggestionPublicOrganizationData.`imageUrl`))
    putPresent("name", JsonPrimitive(this@OrganizationSuggestionPublicOrganizationData.`name`))
    putPresent("id", JsonPrimitive(this@OrganizationSuggestionPublicOrganizationData.`id`))
    putPresent("slug", this@OrganizationSuggestionPublicOrganizationData.`slug`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationSuggestionPublicOrganizationData {
      val values = value.jsonObject

      return OrganizationSuggestionPublicOrganizationData(`hasImage` = (values["hasImage"] ?: Undefined).requireBoolean(), `imageUrl` = (values["imageUrl"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).requireString(), `id` = (values["id"] ?: Undefined).requireString(), `slug` = (values["slug"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

/**
 * The `OrganizationCreationDefaults` object holds the suggested default values to use when creating an Organization, along with an advisory surfacing a potential issue with the suggested defaults.
 */
public data class OrganizationCreationDefaultsState(public val `advisory`: OrganizationCreationDefaultsAdvisory?, public val `form`: OrganizationCreationDefaultsForm, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("advisory", this@OrganizationCreationDefaultsState.`advisory`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("form", this@OrganizationCreationDefaultsState.`form`.toJson())
    putPresent("id", this@OrganizationCreationDefaultsState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationCreationDefaultsState {
      val values = value.jsonObject

      return OrganizationCreationDefaultsState(`advisory` = (values["advisory"] ?: Undefined).decodeOptional { value -> OrganizationCreationDefaultsAdvisory.fromJson(value, runtime) }, `form` = OrganizationCreationDefaultsForm.fromJson((values["form"] ?: Undefined), runtime), `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}
public class OrganizationCreationDefaults(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: OrganizationCreationDefaultsState get() = context.state(handle)
  public val changes: Flow<OrganizationCreationDefaultsState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `advisory`: OrganizationCreationDefaultsAdvisory? get() = state.`advisory`
  public val `form`: OrganizationCreationDefaultsForm get() = state.`form`
  public val `id`: String? get() = state.`id`
  override fun prepare(value: JsonElement): Any = OrganizationCreationDefaultsState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationCreationDefaults = runtime.resource(ResourceHandle.fromReference(value)) as OrganizationCreationDefaults
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): OrganizationCreationDefaults {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "OrganizationCreationDefaults.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      OrganizationCreationDefaults.fromJson(result, runtime)
    }
  }
}

public data class OrganizationCreationDefaultsAdvisory(public val `meta`: Map<String, String>) {
  public val `code`: String get() = "organization_already_exists"
  public val `severity`: String get() = "warning"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive("organization_already_exists"))
    putPresent("severity", JsonPrimitive("warning"))
    putPresent("meta", JsonObject(this@OrganizationCreationDefaultsAdvisory.`meta`.mapValues { (_, value) -> JsonPrimitive(value) }))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationCreationDefaultsAdvisory {
      val values = value.jsonObject
      require(values["code"] == JsonPrimitive("organization_already_exists"))
      require(values["severity"] == JsonPrimitive("warning"))
      return OrganizationCreationDefaultsAdvisory(`meta` = (values["meta"] ?: Undefined).jsonObject.mapValues { (_, value) -> value.requireString() })
    }
  }
}

public data class OrganizationCreationDefaultsForm(public val `name`: String, public val `slug`: String, public val `logo`: String?, public val `blurHash`: String?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("name", JsonPrimitive(this@OrganizationCreationDefaultsForm.`name`))
    putPresent("slug", JsonPrimitive(this@OrganizationCreationDefaultsForm.`slug`))
    putPresent("logo", this@OrganizationCreationDefaultsForm.`logo`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("blurHash", this@OrganizationCreationDefaultsForm.`blurHash`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationCreationDefaultsForm {
      val values = value.jsonObject

      return OrganizationCreationDefaultsForm(`name` = (values["name"] ?: Undefined).requireString(), `slug` = (values["slug"] ?: Undefined).requireString(), `logo` = (values["logo"] ?: Undefined).decodeOptional { value -> value.requireString() }, `blurHash` = (values["blurHash"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class TOTP(public val `id`: String, public val `secret`: String? = null, public val `uri`: String? = null, public val `verified`: Boolean, public val `backupCodes`: List<String>? = null, public val `createdAt`: Instant?, public val `updatedAt`: Instant?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@TOTP.`id`))
    putPresent("secret", this@TOTP.`secret`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("uri", this@TOTP.`uri`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("verified", JsonPrimitive(this@TOTP.`verified`))
    putPresent("backupCodes", this@TOTP.`backupCodes`?.let { value -> JsonArray(value.map { value -> JsonPrimitive(value) }) } ?: Undefined)
    putPresent("createdAt", this@TOTP.`createdAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("updatedAt", this@TOTP.`updatedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): TOTP {
      val values = value.jsonObject

      return TOTP(`id` = (values["id"] ?: Undefined).requireString(), `secret` = (values["secret"] ?: Undefined).decodeOptional { value -> value.requireString() }, `uri` = (values["uri"] ?: Undefined).decodeOptional { value -> value.requireString() }, `verified` = (values["verified"] ?: Undefined).requireBoolean(), `backupCodes` = (values["backupCodes"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> value.requireString() } }, `createdAt` = (values["createdAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `updatedAt` = (values["updatedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) })
    }
  }
}

public data class VerifyTOTPParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@VerifyTOTPParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): VerifyTOTPParams {
      val values = value.jsonObject

      return VerifyTOTPParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class BackupCode(public val `id`: String, public val `codes`: List<String>, public val `createdAt`: Instant?, public val `updatedAt`: Instant?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@BackupCode.`id`))
    putPresent("codes", JsonArray(this@BackupCode.`codes`.map { value -> JsonPrimitive(value) }))
    putPresent("createdAt", this@BackupCode.`createdAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("updatedAt", this@BackupCode.`updatedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BackupCode {
      val values = value.jsonObject

      return BackupCode(`id` = (values["id"] ?: Undefined).requireString(), `codes` = (values["codes"] ?: Undefined).jsonArray.map { value -> value.requireString() }, `createdAt` = (values["createdAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `updatedAt` = (values["updatedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) })
    }
  }
}

public data class SessionTouchParams(public val `intent`: SessionTouchIntent? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("intent", this@SessionTouchParams.`intent`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionTouchParams {
      val values = value.jsonObject

      return SessionTouchParams(`intent` = (values["intent"] ?: Undefined).decodeOptional { value -> SessionTouchIntent.fromJson(value, runtime) })
    }
  }
}

public sealed class SessionTouchIntent(public val rawValue: String) {
  public data object Focus : SessionTouchIntent("focus")
  public data object SelectSession : SessionTouchIntent("select_session")
  public data object SelectOrg : SessionTouchIntent("select_org")
  public data class Unrecognized(val value: String) : SessionTouchIntent(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionTouchIntent = when (val raw = value.requireString()) {
      "focus" -> Focus
      "select_session" -> SelectSession
      "select_org" -> SelectOrg
      else -> Unrecognized(raw)
    }
  }
}

public data class GetTokenOptions(public val `organizationId`: String? = null, public val `skipCache`: Boolean? = null, public val `template`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("organizationId", this@GetTokenOptions.`organizationId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("skipCache", this@GetTokenOptions.`skipCache`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("template", this@GetTokenOptions.`template`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): GetTokenOptions {
      val values = value.jsonObject

      return GetTokenOptions(`organizationId` = (values["organizationId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `skipCache` = (values["skipCache"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `template` = (values["template"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public sealed interface CheckAuthorizationParams {
  public data class Case1(val value: SessionCheckAuthorizationIsAuthorizedParamsCase1) : CheckAuthorizationParams
  public data class Case2(val value: SessionCheckAuthorizationIsAuthorizedParamsCase2) : CheckAuthorizationParams
  public data class Case3(val value: SessionCheckAuthorizationIsAuthorizedParamsCase3) : CheckAuthorizationParams
  public data class Case4(val value: SessionCheckAuthorizationIsAuthorizedParamsCase4) : CheckAuthorizationParams
  public data class Case5(val value: SessionCheckAuthorizationIsAuthorizedParamsCase5) : CheckAuthorizationParams
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
    is Case4 -> JsonObject(mapOf("\$case" to JsonPrimitive(3), "value" to value.toJson()))
    is Case5 -> JsonObject(mapOf("\$case" to JsonPrimitive(4), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CheckAuthorizationParams {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(SessionCheckAuthorizationIsAuthorizedParamsCase1.fromJson(payload, runtime))
        1 -> Case2(SessionCheckAuthorizationIsAuthorizedParamsCase2.fromJson(payload, runtime))
        2 -> Case3(SessionCheckAuthorizationIsAuthorizedParamsCase3.fromJson(payload, runtime))
        3 -> Case4(SessionCheckAuthorizationIsAuthorizedParamsCase4.fromJson(payload, runtime))
        4 -> Case5(SessionCheckAuthorizationIsAuthorizedParamsCase5.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class SessionCheckAuthorizationIsAuthorizedParamsCase1(public val `role`: String, public val `reverification`: ReverificationConfig? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("role", JsonPrimitive(this@SessionCheckAuthorizationIsAuthorizedParamsCase1.`role`))
    putPresent("reverification", this@SessionCheckAuthorizationIsAuthorizedParamsCase1.`reverification`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionCheckAuthorizationIsAuthorizedParamsCase1 {
      val values = value.jsonObject

      return SessionCheckAuthorizationIsAuthorizedParamsCase1(`role` = (values["role"] ?: Undefined).requireString(), `reverification` = (values["reverification"] ?: Undefined).decodeOptional { value -> ReverificationConfig.fromJson(value, runtime) })
    }
  }
}

/**
 * The `ReverificationConfig` type has the following properties:
 */
public sealed interface ReverificationConfig {
  public data class Case1(val value: String) : ReverificationConfig
  public data class Case2(val value: String) : ReverificationConfig
  public data class Case3(val value: String) : ReverificationConfig
  public data class Case4(val value: String) : ReverificationConfig
  public data class Case5(val value: SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5) : ReverificationConfig
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to JsonPrimitive("strict_mfa")))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to JsonPrimitive("strict")))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to JsonPrimitive("moderate")))
    is Case4 -> JsonObject(mapOf("\$case" to JsonPrimitive(3), "value" to JsonPrimitive("lax")))
    is Case5 -> JsonObject(mapOf("\$case" to JsonPrimitive(4), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ReverificationConfig {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(payload.requireLiteral(JsonPrimitive("strict_mfa")).requireString())
        1 -> Case2(payload.requireLiteral(JsonPrimitive("strict")).requireString())
        2 -> Case3(payload.requireLiteral(JsonPrimitive("moderate")).requireString())
        3 -> Case4(payload.requireLiteral(JsonPrimitive("lax")).requireString())
        4 -> Case5(SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5(public val `level`: SessionVerificationLevel, public val `afterMinutes`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("level", this@SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5.`level`.toJson())
    putPresent("afterMinutes", JsonPrimitive(this@SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5.`afterMinutes`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5 {
      val values = value.jsonObject

      return SessionCheckAuthorizationIsAuthorizedParamsCase1ReverificationCase5(`level` = SessionVerificationLevel.fromJson((values["level"] ?: Undefined), runtime), `afterMinutes` = (values["afterMinutes"] ?: Undefined).requireDouble())
    }
  }
}

public sealed class SessionVerificationLevel(public val rawValue: String) {
  public data object FirstFactor : SessionVerificationLevel("first_factor")
  public data object SecondFactor : SessionVerificationLevel("second_factor")
  public data object MultiFactor : SessionVerificationLevel("multi_factor")
  public data class Unrecognized(val value: String) : SessionVerificationLevel(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionVerificationLevel = when (val raw = value.requireString()) {
      "first_factor" -> FirstFactor
      "second_factor" -> SecondFactor
      "multi_factor" -> MultiFactor
      else -> Unrecognized(raw)
    }
  }
}

public data class SessionCheckAuthorizationIsAuthorizedParamsCase2(public val `permission`: String, public val `reverification`: ReverificationConfig? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("permission", JsonPrimitive(this@SessionCheckAuthorizationIsAuthorizedParamsCase2.`permission`))
    putPresent("reverification", this@SessionCheckAuthorizationIsAuthorizedParamsCase2.`reverification`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionCheckAuthorizationIsAuthorizedParamsCase2 {
      val values = value.jsonObject

      return SessionCheckAuthorizationIsAuthorizedParamsCase2(`permission` = (values["permission"] ?: Undefined).requireString(), `reverification` = (values["reverification"] ?: Undefined).decodeOptional { value -> ReverificationConfig.fromJson(value, runtime) })
    }
  }
}

public data class SessionCheckAuthorizationIsAuthorizedParamsCase3(public val `feature`: String, public val `reverification`: ReverificationConfig? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("feature", JsonPrimitive(this@SessionCheckAuthorizationIsAuthorizedParamsCase3.`feature`))
    putPresent("reverification", this@SessionCheckAuthorizationIsAuthorizedParamsCase3.`reverification`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionCheckAuthorizationIsAuthorizedParamsCase3 {
      val values = value.jsonObject

      return SessionCheckAuthorizationIsAuthorizedParamsCase3(`feature` = (values["feature"] ?: Undefined).requireString(), `reverification` = (values["reverification"] ?: Undefined).decodeOptional { value -> ReverificationConfig.fromJson(value, runtime) })
    }
  }
}

public data class SessionCheckAuthorizationIsAuthorizedParamsCase4(public val `plan`: String, public val `reverification`: ReverificationConfig? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("plan", JsonPrimitive(this@SessionCheckAuthorizationIsAuthorizedParamsCase4.`plan`))
    putPresent("reverification", this@SessionCheckAuthorizationIsAuthorizedParamsCase4.`reverification`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionCheckAuthorizationIsAuthorizedParamsCase4 {
      val values = value.jsonObject

      return SessionCheckAuthorizationIsAuthorizedParamsCase4(`plan` = (values["plan"] ?: Undefined).requireString(), `reverification` = (values["reverification"] ?: Undefined).decodeOptional { value -> ReverificationConfig.fromJson(value, runtime) })
    }
  }
}

public data class SessionCheckAuthorizationIsAuthorizedParamsCase5(public val `reverification`: ReverificationConfig? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("reverification", this@SessionCheckAuthorizationIsAuthorizedParamsCase5.`reverification`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionCheckAuthorizationIsAuthorizedParamsCase5 {
      val values = value.jsonObject

      return SessionCheckAuthorizationIsAuthorizedParamsCase5(`reverification` = (values["reverification"] ?: Undefined).decodeOptional { value -> ReverificationConfig.fromJson(value, runtime) })
    }
  }
}

public data class SessionVerifyCreateParams(public val `level`: SessionVerificationLevel) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("level", this@SessionVerifyCreateParams.`level`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionVerifyCreateParams {
      val values = value.jsonObject

      return SessionVerifyCreateParams(`level` = SessionVerificationLevel.fromJson((values["level"] ?: Undefined), runtime))
    }
  }
}

public data class SessionVerificationState(public val `status`: SessionVerificationStatus, public val `level`: SessionVerificationLevel, public val `session`: Session, public val `firstFactorVerification`: Verification, public val `secondFactorVerification`: Verification, public val `supportedFirstFactors`: List<SessionVerificationFirstFactor>?, public val `supportedSecondFactors`: List<SessionVerificationSecondFactor>?, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("status", this@SessionVerificationState.`status`.toJson())
    putPresent("level", this@SessionVerificationState.`level`.toJson())
    putPresent("session", this@SessionVerificationState.`session`.toJson())
    putPresent("firstFactorVerification", this@SessionVerificationState.`firstFactorVerification`.toJson())
    putPresent("secondFactorVerification", this@SessionVerificationState.`secondFactorVerification`.toJson())
    putPresent("supportedFirstFactors", this@SessionVerificationState.`supportedFirstFactors`?.let { value -> JsonArray(value.map { value -> value.toJson() }) } ?: JsonNull)
    putPresent("supportedSecondFactors", this@SessionVerificationState.`supportedSecondFactors`?.let { value -> JsonArray(value.map { value -> value.toJson() }) } ?: JsonNull)
    putPresent("id", this@SessionVerificationState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionVerificationState {
      val values = value.jsonObject

      return SessionVerificationState(`status` = SessionVerificationStatus.fromJson((values["status"] ?: Undefined), runtime), `level` = SessionVerificationLevel.fromJson((values["level"] ?: Undefined), runtime), `session` = Session.fromJson((values["session"] ?: Undefined), runtime), `firstFactorVerification` = Verification.fromJson((values["firstFactorVerification"] ?: Undefined), runtime), `secondFactorVerification` = Verification.fromJson((values["secondFactorVerification"] ?: Undefined), runtime), `supportedFirstFactors` = (values["supportedFirstFactors"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> SessionVerificationFirstFactor.fromJson(value, runtime) } }, `supportedSecondFactors` = (values["supportedSecondFactors"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> SessionVerificationSecondFactor.fromJson(value, runtime) } }, `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}
public class SessionVerification(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SessionVerificationState get() = context.state(handle)
  public val changes: Flow<SessionVerificationState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `status`: SessionVerificationStatus get() = state.`status`
  public val `level`: SessionVerificationLevel get() = state.`level`
  public val `session`: Session get() = state.`session`
  public val `firstFactorVerification`: Verification get() = state.`firstFactorVerification`
  public val `secondFactorVerification`: Verification get() = state.`secondFactorVerification`
  public val `supportedFirstFactors`: List<SessionVerificationFirstFactor>? get() = state.`supportedFirstFactors`
  public val `supportedSecondFactors`: List<SessionVerificationSecondFactor>? get() = state.`supportedSecondFactors`
  public val `id`: String? get() = state.`id`
  override fun prepare(value: JsonElement): Any = SessionVerificationState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionVerification = runtime.resource(ResourceHandle.fromReference(value)) as SessionVerification
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SessionVerification.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
}

public sealed class SessionVerificationStatus(public val rawValue: String) {
  public data object NeedsFirstFactor : SessionVerificationStatus("needs_first_factor")
  public data object NeedsSecondFactor : SessionVerificationStatus("needs_second_factor")
  public data object Complete : SessionVerificationStatus("complete")
  public data class Unrecognized(val value: String) : SessionVerificationStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionVerificationStatus = when (val raw = value.requireString()) {
      "needs_first_factor" -> NeedsFirstFactor
      "needs_second_factor" -> NeedsSecondFactor
      "complete" -> Complete
      else -> Unrecognized(raw)
    }
  }
}

public sealed interface SessionVerificationFirstFactor {
  public data class Case1(val value: EmailCodeFactor) : SessionVerificationFirstFactor
  public data class Case2(val value: PhoneCodeFactor) : SessionVerificationFirstFactor
  public data class Case3(val value: PasswordFactor) : SessionVerificationFirstFactor
  public data class Case4(val value: PasskeyFactor) : SessionVerificationFirstFactor
  public data class Case5(val value: EnterpriseSSOFactor) : SessionVerificationFirstFactor
  public val `strategy`: String get() = when (this) {
    is Case1 -> value.`strategy`
    is Case2 -> value.`strategy`
    is Case3 -> value.`strategy`
    is Case4 -> value.`strategy`
    is Case5 -> value.`strategy`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
    is Case4 -> JsonObject(mapOf("\$case" to JsonPrimitive(3), "value" to value.toJson()))
    is Case5 -> JsonObject(mapOf("\$case" to JsonPrimitive(4), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionVerificationFirstFactor {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(EmailCodeFactor.fromJson(payload, runtime))
        1 -> Case2(PhoneCodeFactor.fromJson(payload, runtime))
        2 -> Case3(PasswordFactor.fromJson(payload, runtime))
        3 -> Case4(PasskeyFactor.fromJson(payload, runtime))
        4 -> Case5(EnterpriseSSOFactor.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class EmailCodeFactor(public val `emailAddressId`: String, public val `safeIdentifier`: String, public val `primary`: Boolean? = null) {
  public val `strategy`: String get() = "email_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("email_code"))
    putPresent("emailAddressId", JsonPrimitive(this@EmailCodeFactor.`emailAddressId`))
    putPresent("safeIdentifier", JsonPrimitive(this@EmailCodeFactor.`safeIdentifier`))
    putPresent("primary", this@EmailCodeFactor.`primary`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EmailCodeFactor {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("email_code"))
      return EmailCodeFactor(`emailAddressId` = (values["emailAddressId"] ?: Undefined).requireString(), `safeIdentifier` = (values["safeIdentifier"] ?: Undefined).requireString(), `primary` = (values["primary"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public data class PhoneCodeFactor(public val `phoneNumberId`: String, public val `safeIdentifier`: String, public val `primary`: Boolean? = null, public val `default`: Boolean? = null, public val `channel`: PhoneCodeChannel? = null) {
  public val `strategy`: String get() = "phone_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("phone_code"))
    putPresent("phoneNumberId", JsonPrimitive(this@PhoneCodeFactor.`phoneNumberId`))
    putPresent("safeIdentifier", JsonPrimitive(this@PhoneCodeFactor.`safeIdentifier`))
    putPresent("primary", this@PhoneCodeFactor.`primary`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("default", this@PhoneCodeFactor.`default`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("channel", this@PhoneCodeFactor.`channel`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PhoneCodeFactor {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("phone_code"))
      return PhoneCodeFactor(`phoneNumberId` = (values["phoneNumberId"] ?: Undefined).requireString(), `safeIdentifier` = (values["safeIdentifier"] ?: Undefined).requireString(), `primary` = (values["primary"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `default` = (values["default"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `channel` = (values["channel"] ?: Undefined).decodeOptional { value -> PhoneCodeChannel.fromJson(value, runtime) })
    }
  }
}

public class PasswordFactor() {
  public val `strategy`: String get() = "password"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("password"))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PasswordFactor {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("password"))
      return PasswordFactor()
    }
  }
}

public class PasskeyFactor() {
  public val `strategy`: String get() = "passkey"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("passkey"))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PasskeyFactor {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("passkey"))
      return PasskeyFactor()
    }
  }
}

public data class EnterpriseSSOFactor(public val `enterpriseConnectionId`: String? = null, public val `enterpriseConnectionName`: String? = null) {
  public val `strategy`: String get() = "enterprise_sso"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("enterprise_sso"))
    putPresent("enterpriseConnectionId", this@EnterpriseSSOFactor.`enterpriseConnectionId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("enterpriseConnectionName", this@EnterpriseSSOFactor.`enterpriseConnectionName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseSSOFactor {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("enterprise_sso"))
      return EnterpriseSSOFactor(`enterpriseConnectionId` = (values["enterpriseConnectionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `enterpriseConnectionName` = (values["enterpriseConnectionName"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public sealed interface SessionVerificationSecondFactor {
  public data class Case1(val value: PhoneCodeFactor) : SessionVerificationSecondFactor
  public data class Case2(val value: TOTPFactor) : SessionVerificationSecondFactor
  public data class Case3(val value: BackupCodeFactor) : SessionVerificationSecondFactor
  public val `strategy`: String get() = when (this) {
    is Case1 -> value.`strategy`
    is Case2 -> value.`strategy`
    is Case3 -> value.`strategy`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionVerificationSecondFactor {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(PhoneCodeFactor.fromJson(payload, runtime))
        1 -> Case2(TOTPFactor.fromJson(payload, runtime))
        2 -> Case3(BackupCodeFactor.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public class TOTPFactor() {
  public val `strategy`: String get() = "totp"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("totp"))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): TOTPFactor {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("totp"))
      return TOTPFactor()
    }
  }
}

public class BackupCodeFactor() {
  public val `strategy`: String get() = "backup_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("backup_code"))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BackupCodeFactor {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("backup_code"))
      return BackupCodeFactor()
    }
  }
}

public sealed interface SessionVerifyPrepareFirstFactorParams {
  public data class Case1(val value: PasskeyFactor) : SessionVerifyPrepareFirstFactorParams
  public data class Case2(val value: EmailCodeConfig) : SessionVerifyPrepareFirstFactorParams
  public data class Case3(val value: PhoneCodeConfig) : SessionVerifyPrepareFirstFactorParams
  public data class Case4(val value: OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl) : SessionVerifyPrepareFirstFactorParams
  public val `strategy`: String get() = when (this) {
    is Case1 -> value.`strategy`
    is Case2 -> value.`strategy`
    is Case3 -> value.`strategy`
    is Case4 -> value.`strategy`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
    is Case4 -> JsonObject(mapOf("\$case" to JsonPrimitive(3), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionVerifyPrepareFirstFactorParams {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(PasskeyFactor.fromJson(payload, runtime))
        1 -> Case2(EmailCodeConfig.fromJson(payload, runtime))
        2 -> Case3(PhoneCodeConfig.fromJson(payload, runtime))
        3 -> Case4(OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class EmailCodeConfig(public val `primary`: Boolean? = null, public val `emailAddressId`: String) {
  public val `strategy`: String get() = "email_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("email_code"))
    putPresent("primary", this@EmailCodeConfig.`primary`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("emailAddressId", JsonPrimitive(this@EmailCodeConfig.`emailAddressId`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EmailCodeConfig {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("email_code"))
      return EmailCodeConfig(`primary` = (values["primary"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `emailAddressId` = (values["emailAddressId"] ?: Undefined).requireString())
    }
  }
}

public data class PhoneCodeConfig(public val `phoneNumberId`: String, public val `primary`: Boolean? = null, public val `default`: Boolean? = null, public val `channel`: PhoneCodeChannel? = null) {
  public val `strategy`: String get() = "phone_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("phone_code"))
    putPresent("phoneNumberId", JsonPrimitive(this@PhoneCodeConfig.`phoneNumberId`))
    putPresent("primary", this@PhoneCodeConfig.`primary`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("default", this@PhoneCodeConfig.`default`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("channel", this@PhoneCodeConfig.`channel`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PhoneCodeConfig {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("phone_code"))
      return PhoneCodeConfig(`phoneNumberId` = (values["phoneNumberId"] ?: Undefined).requireString(), `primary` = (values["primary"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `default` = (values["default"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `channel` = (values["channel"] ?: Undefined).decodeOptional { value -> PhoneCodeChannel.fromJson(value, runtime) })
    }
  }
}

/**
 * Construct a type with the properties of T except for those in type K.
 */
public data class OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl(public val `emailAddressId`: String? = null, public val `enterpriseConnectionId`: String? = null, public val `enterpriseConnectionName`: String? = null, public val `redirectUrl`: String, public val `oidcPrompt`: String? = null) {
  public val `strategy`: String get() = "enterprise_sso"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("enterprise_sso"))
    putPresent("emailAddressId", this@OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl.`emailAddressId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("enterpriseConnectionId", this@OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl.`enterpriseConnectionId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("enterpriseConnectionName", this@OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl.`enterpriseConnectionName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("redirectUrl", JsonPrimitive(this@OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl.`redirectUrl`))
    putPresent("oidcPrompt", this@OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl.`oidcPrompt`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("enterprise_sso"))
      return OmitEnterpriseSSOConfigAndactionCompleteRedirectUrl(`emailAddressId` = (values["emailAddressId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `enterpriseConnectionId` = (values["enterpriseConnectionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `enterpriseConnectionName` = (values["enterpriseConnectionName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `redirectUrl` = (values["redirectUrl"] ?: Undefined).requireString(), `oidcPrompt` = (values["oidcPrompt"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public sealed interface SessionVerifyAttemptFirstFactorParams {
  public data class Case1(val value: EmailCodeAttempt) : SessionVerifyAttemptFirstFactorParams
  public data class Case2(val value: PhoneCodeAttempt) : SessionVerifyAttemptFirstFactorParams
  public data class Case3(val value: PasswordAttempt) : SessionVerifyAttemptFirstFactorParams
  public data class Case4(val value: PasskeyAttempt) : SessionVerifyAttemptFirstFactorParams
  public val `strategy`: String get() = when (this) {
    is Case1 -> value.`strategy`
    is Case2 -> value.`strategy`
    is Case3 -> value.`strategy`
    is Case4 -> value.`strategy`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
    is Case4 -> JsonObject(mapOf("\$case" to JsonPrimitive(3), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionVerifyAttemptFirstFactorParams {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(EmailCodeAttempt.fromJson(payload, runtime))
        1 -> Case2(PhoneCodeAttempt.fromJson(payload, runtime))
        2 -> Case3(PasswordAttempt.fromJson(payload, runtime))
        3 -> Case4(PasskeyAttempt.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class EmailCodeAttempt(public val `code`: String) {
  public val `strategy`: String get() = "email_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("email_code"))
    putPresent("code", JsonPrimitive(this@EmailCodeAttempt.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EmailCodeAttempt {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("email_code"))
      return EmailCodeAttempt(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class PhoneCodeAttempt(public val `code`: String) {
  public val `strategy`: String get() = "phone_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("phone_code"))
    putPresent("code", JsonPrimitive(this@PhoneCodeAttempt.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PhoneCodeAttempt {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("phone_code"))
      return PhoneCodeAttempt(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class PasswordAttempt(public val `password`: String) {
  public val `strategy`: String get() = "password"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("password"))
    putPresent("password", JsonPrimitive(this@PasswordAttempt.`password`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PasswordAttempt {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("password"))
      return PasswordAttempt(`password` = (values["password"] ?: Undefined).requireString())
    }
  }
}

public data class PasskeyAttempt(public val `publicKeyCredential`: PublicKeyCredentialWithAuthenticatorAssertionResponse) {
  public val `strategy`: String get() = "passkey"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("passkey"))
    putPresent("publicKeyCredential", this@PasskeyAttempt.`publicKeyCredential`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PasskeyAttempt {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("passkey"))
      return PasskeyAttempt(`publicKeyCredential` = PublicKeyCredentialWithAuthenticatorAssertionResponse.fromJson((values["publicKeyCredential"] ?: Undefined), runtime))
    }
  }
}

public data class PublicKeyCredentialWithAuthenticatorAssertionResponse(public val `authenticatorAttachment`: String?, public val `rawId`: ByteArray, public val `id`: String, public val `type`: String, public val `response`: AuthenticatorAssertionResponse) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("authenticatorAttachment", this@PublicKeyCredentialWithAuthenticatorAssertionResponse.`authenticatorAttachment`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("rawId", buildJsonObject { put("base64", Base64.getEncoder().encodeToString(this@PublicKeyCredentialWithAuthenticatorAssertionResponse.`rawId`)) })
    putPresent("id", JsonPrimitive(this@PublicKeyCredentialWithAuthenticatorAssertionResponse.`id`))
    putPresent("type", JsonPrimitive(this@PublicKeyCredentialWithAuthenticatorAssertionResponse.`type`))
    putPresent("response", this@PublicKeyCredentialWithAuthenticatorAssertionResponse.`response`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PublicKeyCredentialWithAuthenticatorAssertionResponse {
      val values = value.jsonObject

      return PublicKeyCredentialWithAuthenticatorAssertionResponse(`authenticatorAttachment` = (values["authenticatorAttachment"] ?: Undefined).decodeOptional { value -> value.requireString() }, `rawId` = Base64.getDecoder().decode((values["rawId"] ?: Undefined).jsonObject.getValue("base64").requireString()), `id` = (values["id"] ?: Undefined).requireString(), `type` = (values["type"] ?: Undefined).requireString(), `response` = AuthenticatorAssertionResponse.fromJson((values["response"] ?: Undefined), runtime))
    }
  }
}

/**
 * The **`AuthenticatorAssertionResponse`** interface of the Web Authentication API contains a digital signature from the private key of a particular WebAuthn credential. The relying party's server can verify this signature to authenticate a user, for example when they sign in.
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAssertionResponse)
 */
public data class AuthenticatorAssertionResponse(public val `authenticatorData`: ByteArray, public val `signature`: ByteArray, public val `userHandle`: ByteArray?, public val `clientDataJSON`: ByteArray) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("authenticatorData", buildJsonObject { put("base64", Base64.getEncoder().encodeToString(this@AuthenticatorAssertionResponse.`authenticatorData`)) })
    putPresent("signature", buildJsonObject { put("base64", Base64.getEncoder().encodeToString(this@AuthenticatorAssertionResponse.`signature`)) })
    putPresent("userHandle", this@AuthenticatorAssertionResponse.`userHandle`?.let { value -> buildJsonObject { put("base64", Base64.getEncoder().encodeToString(value)) } } ?: JsonNull)
    putPresent("clientDataJSON", buildJsonObject { put("base64", Base64.getEncoder().encodeToString(this@AuthenticatorAssertionResponse.`clientDataJSON`)) })
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AuthenticatorAssertionResponse {
      val values = value.jsonObject

      return AuthenticatorAssertionResponse(`authenticatorData` = Base64.getDecoder().decode((values["authenticatorData"] ?: Undefined).jsonObject.getValue("base64").requireString()), `signature` = Base64.getDecoder().decode((values["signature"] ?: Undefined).jsonObject.getValue("base64").requireString()), `userHandle` = (values["userHandle"] ?: Undefined).decodeOptional { value -> Base64.getDecoder().decode(value.jsonObject.getValue("base64").requireString()) }, `clientDataJSON` = Base64.getDecoder().decode((values["clientDataJSON"] ?: Undefined).jsonObject.getValue("base64").requireString()))
    }
  }
}

public data class PhoneCodeSecondFactorConfig(public val `phoneNumberId`: String? = null) {
  public val `strategy`: String get() = "phone_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("phone_code"))
    putPresent("phoneNumberId", this@PhoneCodeSecondFactorConfig.`phoneNumberId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PhoneCodeSecondFactorConfig {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("phone_code"))
      return PhoneCodeSecondFactorConfig(`phoneNumberId` = (values["phoneNumberId"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public sealed interface SessionVerifyAttemptSecondFactorParams {
  public data class Case1(val value: PhoneCodeAttempt) : SessionVerifyAttemptSecondFactorParams
  public data class Case2(val value: TOTPAttempt) : SessionVerifyAttemptSecondFactorParams
  public data class Case3(val value: BackupCodeAttempt) : SessionVerifyAttemptSecondFactorParams
  public val `strategy`: String get() = when (this) {
    is Case1 -> value.`strategy`
    is Case2 -> value.`strategy`
    is Case3 -> value.`strategy`
  }
  public val `code`: String get() = when (this) {
    is Case1 -> value.`code`
    is Case2 -> value.`code`
    is Case3 -> value.`code`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionVerifyAttemptSecondFactorParams {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(PhoneCodeAttempt.fromJson(payload, runtime))
        1 -> Case2(TOTPAttempt.fromJson(payload, runtime))
        2 -> Case3(BackupCodeAttempt.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class TOTPAttempt(public val `code`: String) {
  public val `strategy`: String get() = "totp"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("totp"))
    putPresent("code", JsonPrimitive(this@TOTPAttempt.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): TOTPAttempt {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("totp"))
      return TOTPAttempt(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class BackupCodeAttempt(public val `code`: String) {
  public val `strategy`: String get() = "backup_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("backup_code"))
    putPresent("code", JsonPrimitive(this@BackupCodeAttempt.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BackupCodeAttempt {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("backup_code"))
      return BackupCodeAttempt(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public sealed class LastAuthenticationStrategy(public val rawValue: String) {
  public data object Password : LastAuthenticationStrategy("password")
  public data object PhoneCode : LastAuthenticationStrategy("phone_code")
  public data object EmailCode : LastAuthenticationStrategy("email_code")
  public data object EmailLink : LastAuthenticationStrategy("email_link")
  public data object OauthFacebook : LastAuthenticationStrategy("oauth_facebook")
  public data object OauthGoogle : LastAuthenticationStrategy("oauth_google")
  public data object OauthHubspot : LastAuthenticationStrategy("oauth_hubspot")
  public data object OauthGithub : LastAuthenticationStrategy("oauth_github")
  public data object OauthTiktok : LastAuthenticationStrategy("oauth_tiktok")
  public data object OauthGitlab : LastAuthenticationStrategy("oauth_gitlab")
  public data object OauthDiscord : LastAuthenticationStrategy("oauth_discord")
  public data object OauthTwitter : LastAuthenticationStrategy("oauth_twitter")
  public data object OauthTwitch : LastAuthenticationStrategy("oauth_twitch")
  public data object OauthLinkedin : LastAuthenticationStrategy("oauth_linkedin")
  public data object OauthLinkedinOidc : LastAuthenticationStrategy("oauth_linkedin_oidc")
  public data object OauthDropbox : LastAuthenticationStrategy("oauth_dropbox")
  public data object OauthAtlassian : LastAuthenticationStrategy("oauth_atlassian")
  public data object OauthBitbucket : LastAuthenticationStrategy("oauth_bitbucket")
  public data object OauthMicrosoft : LastAuthenticationStrategy("oauth_microsoft")
  public data object OauthNotion : LastAuthenticationStrategy("oauth_notion")
  public data object OauthApple : LastAuthenticationStrategy("oauth_apple")
  public data object OauthLine : LastAuthenticationStrategy("oauth_line")
  public data object OauthInstagram : LastAuthenticationStrategy("oauth_instagram")
  public data object OauthCoinbase : LastAuthenticationStrategy("oauth_coinbase")
  public data object OauthSpotify : LastAuthenticationStrategy("oauth_spotify")
  public data object OauthXero : LastAuthenticationStrategy("oauth_xero")
  public data object OauthBox : LastAuthenticationStrategy("oauth_box")
  public data object OauthSlack : LastAuthenticationStrategy("oauth_slack")
  public data object OauthLinear : LastAuthenticationStrategy("oauth_linear")
  public data object OauthX : LastAuthenticationStrategy("oauth_x")
  public data object OauthEnstall : LastAuthenticationStrategy("oauth_enstall")
  public data object OauthHuggingface : LastAuthenticationStrategy("oauth_huggingface")
  public data object OauthVercel : LastAuthenticationStrategy("oauth_vercel")
  public data object Web3SolanaSignature : LastAuthenticationStrategy("web3_solana_signature")
  public data object Web3MetamaskSignature : LastAuthenticationStrategy("web3_metamask_signature")
  public data object Web3CoinbaseWalletSignature : LastAuthenticationStrategy("web3_coinbase_wallet_signature")
  public data object Web3OkxWalletSignature : LastAuthenticationStrategy("web3_okx_wallet_signature")
  public data object Web3BaseSignature : LastAuthenticationStrategy("web3_base_signature")
  public data object EmailAddress : LastAuthenticationStrategy("email_address")
  public data object Username : LastAuthenticationStrategy("username")
  public data class Unrecognized(val value: String) : LastAuthenticationStrategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): LastAuthenticationStrategy = when (val raw = value.requireString()) {
      "password" -> Password
      "phone_code" -> PhoneCode
      "email_code" -> EmailCode
      "email_link" -> EmailLink
      "oauth_facebook" -> OauthFacebook
      "oauth_google" -> OauthGoogle
      "oauth_hubspot" -> OauthHubspot
      "oauth_github" -> OauthGithub
      "oauth_tiktok" -> OauthTiktok
      "oauth_gitlab" -> OauthGitlab
      "oauth_discord" -> OauthDiscord
      "oauth_twitter" -> OauthTwitter
      "oauth_twitch" -> OauthTwitch
      "oauth_linkedin" -> OauthLinkedin
      "oauth_linkedin_oidc" -> OauthLinkedinOidc
      "oauth_dropbox" -> OauthDropbox
      "oauth_atlassian" -> OauthAtlassian
      "oauth_bitbucket" -> OauthBitbucket
      "oauth_microsoft" -> OauthMicrosoft
      "oauth_notion" -> OauthNotion
      "oauth_apple" -> OauthApple
      "oauth_line" -> OauthLine
      "oauth_instagram" -> OauthInstagram
      "oauth_coinbase" -> OauthCoinbase
      "oauth_spotify" -> OauthSpotify
      "oauth_xero" -> OauthXero
      "oauth_box" -> OauthBox
      "oauth_slack" -> OauthSlack
      "oauth_linear" -> OauthLinear
      "oauth_x" -> OauthX
      "oauth_enstall" -> OauthEnstall
      "oauth_huggingface" -> OauthHuggingface
      "oauth_vercel" -> OauthVercel
      "web3_solana_signature" -> Web3SolanaSignature
      "web3_metamask_signature" -> Web3MetamaskSignature
      "web3_coinbase_wallet_signature" -> Web3CoinbaseWalletSignature
      "web3_okx_wallet_signature" -> Web3OkxWalletSignature
      "web3_base_signature" -> Web3BaseSignature
      "email_address" -> EmailAddress
      "username" -> Username
      else -> Unrecognized(raw)
    }
  }
}

public data class EnvironmentResourceState(public val `userSettings`: UserSettings, public val `organizationSettings`: OrganizationSettings, public val `authConfig`: AuthConfig, public val `displayConfig`: DisplayConfig, public val `commerceSettings`: CommerceSettings, public val `apiKeysSettings`: APIKeysSettings, public val `protectConfig`: ProtectConfig, public val `maintenanceMode`: Boolean, public val `clientDebugMode`: Boolean, public val `partitionedCookies`: Boolean, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("userSettings", this@EnvironmentResourceState.`userSettings`.toJson())
    putPresent("organizationSettings", this@EnvironmentResourceState.`organizationSettings`.toJson())
    putPresent("authConfig", this@EnvironmentResourceState.`authConfig`.toJson())
    putPresent("displayConfig", this@EnvironmentResourceState.`displayConfig`.toJson())
    putPresent("commerceSettings", this@EnvironmentResourceState.`commerceSettings`.toJson())
    putPresent("apiKeysSettings", this@EnvironmentResourceState.`apiKeysSettings`.toJson())
    putPresent("protectConfig", this@EnvironmentResourceState.`protectConfig`.toJson())
    putPresent("maintenanceMode", JsonPrimitive(this@EnvironmentResourceState.`maintenanceMode`))
    putPresent("clientDebugMode", JsonPrimitive(this@EnvironmentResourceState.`clientDebugMode`))
    putPresent("partitionedCookies", JsonPrimitive(this@EnvironmentResourceState.`partitionedCookies`))
    putPresent("id", this@EnvironmentResourceState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnvironmentResourceState {
      val values = value.jsonObject

      return EnvironmentResourceState(`userSettings` = UserSettings.fromJson((values["userSettings"] ?: Undefined), runtime), `organizationSettings` = OrganizationSettings.fromJson((values["organizationSettings"] ?: Undefined), runtime), `authConfig` = AuthConfig.fromJson((values["authConfig"] ?: Undefined), runtime), `displayConfig` = DisplayConfig.fromJson((values["displayConfig"] ?: Undefined), runtime), `commerceSettings` = CommerceSettings.fromJson((values["commerceSettings"] ?: Undefined), runtime), `apiKeysSettings` = APIKeysSettings.fromJson((values["apiKeysSettings"] ?: Undefined), runtime), `protectConfig` = ProtectConfig.fromJson((values["protectConfig"] ?: Undefined), runtime), `maintenanceMode` = (values["maintenanceMode"] ?: Undefined).requireBoolean(), `clientDebugMode` = (values["clientDebugMode"] ?: Undefined).requireBoolean(), `partitionedCookies` = (values["partitionedCookies"] ?: Undefined).requireBoolean(), `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}
public class EnvironmentResource(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: EnvironmentResourceState get() = context.state(handle)
  public val changes: Flow<EnvironmentResourceState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `userSettings`: UserSettings get() = state.`userSettings`
  public val `organizationSettings`: OrganizationSettings get() = state.`organizationSettings`
  public val `authConfig`: AuthConfig get() = state.`authConfig`
  public val `displayConfig`: DisplayConfig get() = state.`displayConfig`
  public val `commerceSettings`: CommerceSettings get() = state.`commerceSettings`
  public val `apiKeysSettings`: APIKeysSettings get() = state.`apiKeysSettings`
  public val `protectConfig`: ProtectConfig get() = state.`protectConfig`
  public val `maintenanceMode`: Boolean get() = state.`maintenanceMode`
  public val `clientDebugMode`: Boolean get() = state.`clientDebugMode`
  public val `partitionedCookies`: Boolean get() = state.`partitionedCookies`
  public val `id`: String? get() = state.`id`
  override fun prepare(value: JsonElement): Any = EnvironmentResourceState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnvironmentResource = runtime.resource(ResourceHandle.fromReference(value)) as EnvironmentResource
  }
  public suspend fun `isSingleSession`(): Boolean {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EnvironmentResource.isSingleSession", listOf()) { result ->
      result.requireBoolean()
    }
  }
  public suspend fun `isProduction`(): Boolean {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EnvironmentResource.isProduction", listOf()) { result ->
      result.requireBoolean()
    }
  }
  public suspend fun `isDevelopmentOrStaging`(): Boolean {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EnvironmentResource.isDevelopmentOrStaging", listOf()) { result ->
      result.requireBoolean()
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): EnvironmentResource {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "EnvironmentResource.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      EnvironmentResource.fromJson(result, runtime)
    }
  }
}

public data class UserSettings(public val `social`: Map<String, OAuthProviderSettings>, public val `enterpriseSSO`: EnterpriseSSOSettings, public val `attributes`: Map<String, AttributeData>, public val `actions`: Actions, public val `signIn`: SignInData, public val `signUp`: SignUpData, public val `passwordSettings`: PasswordSettingsData, public val `usernameSettings`: UsernameSettingsData, public val `attackProtection`: AttackProtectionData, public val `passkeySettings`: PasskeySettingsData, public val `socialProviderStrategies`: List<OAuthStrategy>, public val `authenticatableSocialStrategies`: List<OAuthStrategy>, public val `web3FirstFactors`: List<PrepareWeb3WalletVerificationParamsStrategy>, public val `alternativePhoneCodeChannels`: List<PhoneCodeChannel>, public val `enabledFirstFactorIdentifiers`: List<Attribute>, public val `instanceIsPasswordBased`: Boolean, public val `hasValidAuthFactor`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("social", JsonObject(this@UserSettings.`social`.mapValues { (_, value) -> value.toJson() }))
    putPresent("enterpriseSSO", this@UserSettings.`enterpriseSSO`.toJson())
    putPresent("attributes", JsonObject(this@UserSettings.`attributes`.mapValues { (_, value) -> value.toJson() }))
    putPresent("actions", this@UserSettings.`actions`.toJson())
    putPresent("signIn", this@UserSettings.`signIn`.toJson())
    putPresent("signUp", this@UserSettings.`signUp`.toJson())
    putPresent("passwordSettings", this@UserSettings.`passwordSettings`.toJson())
    putPresent("usernameSettings", this@UserSettings.`usernameSettings`.toJson())
    putPresent("attackProtection", this@UserSettings.`attackProtection`.toJson())
    putPresent("passkeySettings", this@UserSettings.`passkeySettings`.toJson())
    putPresent("socialProviderStrategies", JsonArray(this@UserSettings.`socialProviderStrategies`.map { value -> value.toJson() }))
    putPresent("authenticatableSocialStrategies", JsonArray(this@UserSettings.`authenticatableSocialStrategies`.map { value -> value.toJson() }))
    putPresent("web3FirstFactors", JsonArray(this@UserSettings.`web3FirstFactors`.map { value -> value.toJson() }))
    putPresent("alternativePhoneCodeChannels", JsonArray(this@UserSettings.`alternativePhoneCodeChannels`.map { value -> value.toJson() }))
    putPresent("enabledFirstFactorIdentifiers", JsonArray(this@UserSettings.`enabledFirstFactorIdentifiers`.map { value -> value.toJson() }))
    putPresent("instanceIsPasswordBased", JsonPrimitive(this@UserSettings.`instanceIsPasswordBased`))
    putPresent("hasValidAuthFactor", JsonPrimitive(this@UserSettings.`hasValidAuthFactor`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UserSettings {
      val values = value.jsonObject

      return UserSettings(`social` = (values["social"] ?: Undefined).jsonObject.mapValues { (_, value) -> OAuthProviderSettings.fromJson(value, runtime) }, `enterpriseSSO` = EnterpriseSSOSettings.fromJson((values["enterpriseSSO"] ?: Undefined), runtime), `attributes` = (values["attributes"] ?: Undefined).jsonObject.mapValues { (_, value) -> AttributeData.fromJson(value, runtime) }, `actions` = Actions.fromJson((values["actions"] ?: Undefined), runtime), `signIn` = SignInData.fromJson((values["signIn"] ?: Undefined), runtime), `signUp` = SignUpData.fromJson((values["signUp"] ?: Undefined), runtime), `passwordSettings` = PasswordSettingsData.fromJson((values["passwordSettings"] ?: Undefined), runtime), `usernameSettings` = UsernameSettingsData.fromJson((values["usernameSettings"] ?: Undefined), runtime), `attackProtection` = AttackProtectionData.fromJson((values["attackProtection"] ?: Undefined), runtime), `passkeySettings` = PasskeySettingsData.fromJson((values["passkeySettings"] ?: Undefined), runtime), `socialProviderStrategies` = (values["socialProviderStrategies"] ?: Undefined).jsonArray.map { value -> OAuthStrategy.fromJson(value, runtime) }, `authenticatableSocialStrategies` = (values["authenticatableSocialStrategies"] ?: Undefined).jsonArray.map { value -> OAuthStrategy.fromJson(value, runtime) }, `web3FirstFactors` = (values["web3FirstFactors"] ?: Undefined).jsonArray.map { value -> PrepareWeb3WalletVerificationParamsStrategy.fromJson(value, runtime) }, `alternativePhoneCodeChannels` = (values["alternativePhoneCodeChannels"] ?: Undefined).jsonArray.map { value -> PhoneCodeChannel.fromJson(value, runtime) }, `enabledFirstFactorIdentifiers` = (values["enabledFirstFactorIdentifiers"] ?: Undefined).jsonArray.map { value -> Attribute.fromJson(value, runtime) }, `instanceIsPasswordBased` = (values["instanceIsPasswordBased"] ?: Undefined).requireBoolean(), `hasValidAuthFactor` = (values["hasValidAuthFactor"] ?: Undefined).requireBoolean())
    }
  }
}

public data class OAuthProviderSettings(public val `enabled`: Boolean, public val `required`: Boolean, public val `authenticatable`: Boolean, public val `strategy`: OAuthStrategy, public val `name`: String, public val `logoUrl`: String?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enabled", JsonPrimitive(this@OAuthProviderSettings.`enabled`))
    putPresent("required", JsonPrimitive(this@OAuthProviderSettings.`required`))
    putPresent("authenticatable", JsonPrimitive(this@OAuthProviderSettings.`authenticatable`))
    putPresent("strategy", this@OAuthProviderSettings.`strategy`.toJson())
    putPresent("name", JsonPrimitive(this@OAuthProviderSettings.`name`))
    putPresent("logo_url", this@OAuthProviderSettings.`logoUrl`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OAuthProviderSettings {
      val values = value.jsonObject

      return OAuthProviderSettings(`enabled` = (values["enabled"] ?: Undefined).requireBoolean(), `required` = (values["required"] ?: Undefined).requireBoolean(), `authenticatable` = (values["authenticatable"] ?: Undefined).requireBoolean(), `strategy` = OAuthStrategy.fromJson((values["strategy"] ?: Undefined), runtime), `name` = (values["name"] ?: Undefined).requireString(), `logoUrl` = (values["logo_url"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

/**
 * OAuth-related authentication strategies (`oauth_<provider>` and custom OAuth).
 */
public sealed class OAuthStrategy(public val rawValue: String) {
  public data object OauthFacebook : OAuthStrategy("oauth_facebook")
  public data object OauthGoogle : OAuthStrategy("oauth_google")
  public data object OauthHubspot : OAuthStrategy("oauth_hubspot")
  public data object OauthGithub : OAuthStrategy("oauth_github")
  public data object OauthTiktok : OAuthStrategy("oauth_tiktok")
  public data object OauthGitlab : OAuthStrategy("oauth_gitlab")
  public data object OauthDiscord : OAuthStrategy("oauth_discord")
  public data object OauthTwitter : OAuthStrategy("oauth_twitter")
  public data object OauthTwitch : OAuthStrategy("oauth_twitch")
  public data object OauthLinkedin : OAuthStrategy("oauth_linkedin")
  public data object OauthLinkedinOidc : OAuthStrategy("oauth_linkedin_oidc")
  public data object OauthDropbox : OAuthStrategy("oauth_dropbox")
  public data object OauthAtlassian : OAuthStrategy("oauth_atlassian")
  public data object OauthBitbucket : OAuthStrategy("oauth_bitbucket")
  public data object OauthMicrosoft : OAuthStrategy("oauth_microsoft")
  public data object OauthNotion : OAuthStrategy("oauth_notion")
  public data object OauthApple : OAuthStrategy("oauth_apple")
  public data object OauthLine : OAuthStrategy("oauth_line")
  public data object OauthInstagram : OAuthStrategy("oauth_instagram")
  public data object OauthCoinbase : OAuthStrategy("oauth_coinbase")
  public data object OauthSpotify : OAuthStrategy("oauth_spotify")
  public data object OauthXero : OAuthStrategy("oauth_xero")
  public data object OauthBox : OAuthStrategy("oauth_box")
  public data object OauthSlack : OAuthStrategy("oauth_slack")
  public data object OauthLinear : OAuthStrategy("oauth_linear")
  public data object OauthX : OAuthStrategy("oauth_x")
  public data object OauthEnstall : OAuthStrategy("oauth_enstall")
  public data object OauthHuggingface : OAuthStrategy("oauth_huggingface")
  public data object OauthVercel : OAuthStrategy("oauth_vercel")
  public data class Unrecognized(val value: String) : OAuthStrategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OAuthStrategy = when (val raw = value.requireString()) {
      "oauth_facebook" -> OauthFacebook
      "oauth_google" -> OauthGoogle
      "oauth_hubspot" -> OauthHubspot
      "oauth_github" -> OauthGithub
      "oauth_tiktok" -> OauthTiktok
      "oauth_gitlab" -> OauthGitlab
      "oauth_discord" -> OauthDiscord
      "oauth_twitter" -> OauthTwitter
      "oauth_twitch" -> OauthTwitch
      "oauth_linkedin" -> OauthLinkedin
      "oauth_linkedin_oidc" -> OauthLinkedinOidc
      "oauth_dropbox" -> OauthDropbox
      "oauth_atlassian" -> OauthAtlassian
      "oauth_bitbucket" -> OauthBitbucket
      "oauth_microsoft" -> OauthMicrosoft
      "oauth_notion" -> OauthNotion
      "oauth_apple" -> OauthApple
      "oauth_line" -> OauthLine
      "oauth_instagram" -> OauthInstagram
      "oauth_coinbase" -> OauthCoinbase
      "oauth_spotify" -> OauthSpotify
      "oauth_xero" -> OauthXero
      "oauth_box" -> OauthBox
      "oauth_slack" -> OauthSlack
      "oauth_linear" -> OauthLinear
      "oauth_x" -> OauthX
      "oauth_enstall" -> OauthEnstall
      "oauth_huggingface" -> OauthHuggingface
      "oauth_vercel" -> OauthVercel
      else -> Unrecognized(raw)
    }
  }
}

public data class EnterpriseSSOSettings(public val `enabled`: Boolean, public val `selfServeSso`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enabled", JsonPrimitive(this@EnterpriseSSOSettings.`enabled`))
    putPresent("self_serve_sso", JsonPrimitive(this@EnterpriseSSOSettings.`selfServeSso`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EnterpriseSSOSettings {
      val values = value.jsonObject

      return EnterpriseSSOSettings(`enabled` = (values["enabled"] ?: Undefined).requireBoolean(), `selfServeSso` = (values["self_serve_sso"] ?: Undefined).requireBoolean())
    }
  }
}

public data class AttributeData(public val `enabled`: Boolean, public val `required`: Boolean, public val `immutable`: Boolean? = null, public val `verifications`: List<VerificationStrategy>, public val `usedForFirstFactor`: Boolean, public val `firstFactors`: List<VerificationStrategy>, public val `usedForSecondFactor`: Boolean, public val `secondFactors`: List<VerificationStrategy>, public val `verifyAtSignUp`: Boolean, public val `channels`: List<PhoneCodeChannel>? = null, public val `name`: Attribute) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enabled", JsonPrimitive(this@AttributeData.`enabled`))
    putPresent("required", JsonPrimitive(this@AttributeData.`required`))
    putPresent("immutable", this@AttributeData.`immutable`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("verifications", JsonArray(this@AttributeData.`verifications`.map { value -> value.toJson() }))
    putPresent("used_for_first_factor", JsonPrimitive(this@AttributeData.`usedForFirstFactor`))
    putPresent("first_factors", JsonArray(this@AttributeData.`firstFactors`.map { value -> value.toJson() }))
    putPresent("used_for_second_factor", JsonPrimitive(this@AttributeData.`usedForSecondFactor`))
    putPresent("second_factors", JsonArray(this@AttributeData.`secondFactors`.map { value -> value.toJson() }))
    putPresent("verify_at_sign_up", JsonPrimitive(this@AttributeData.`verifyAtSignUp`))
    putPresent("channels", this@AttributeData.`channels`?.let { value -> JsonArray(value.map { value -> value.toJson() }) } ?: Undefined)
    putPresent("name", this@AttributeData.`name`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AttributeData {
      val values = value.jsonObject

      return AttributeData(`enabled` = (values["enabled"] ?: Undefined).requireBoolean(), `required` = (values["required"] ?: Undefined).requireBoolean(), `immutable` = (values["immutable"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `verifications` = (values["verifications"] ?: Undefined).jsonArray.map { value -> VerificationStrategy.fromJson(value, runtime) }, `usedForFirstFactor` = (values["used_for_first_factor"] ?: Undefined).requireBoolean(), `firstFactors` = (values["first_factors"] ?: Undefined).jsonArray.map { value -> VerificationStrategy.fromJson(value, runtime) }, `usedForSecondFactor` = (values["used_for_second_factor"] ?: Undefined).requireBoolean(), `secondFactors` = (values["second_factors"] ?: Undefined).jsonArray.map { value -> VerificationStrategy.fromJson(value, runtime) }, `verifyAtSignUp` = (values["verify_at_sign_up"] ?: Undefined).requireBoolean(), `channels` = (values["channels"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> PhoneCodeChannel.fromJson(value, runtime) } }, `name` = Attribute.fromJson((values["name"] ?: Undefined), runtime))
    }
  }
}

public sealed class VerificationStrategy(public val rawValue: String) {
  public data object PhoneCode : VerificationStrategy("phone_code")
  public data object EmailCode : VerificationStrategy("email_code")
  public data object EmailLink : VerificationStrategy("email_link")
  public data object Totp : VerificationStrategy("totp")
  public data object BackupCode : VerificationStrategy("backup_code")
  public data class Unrecognized(val value: String) : VerificationStrategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): VerificationStrategy = when (val raw = value.requireString()) {
      "phone_code" -> PhoneCode
      "email_code" -> EmailCode
      "email_link" -> EmailLink
      "totp" -> Totp
      "backup_code" -> BackupCode
      else -> Unrecognized(raw)
    }
  }
}

public sealed class Attribute(public val rawValue: String) {
  public data object Passkey : Attribute("passkey")
  public data object Password : Attribute("password")
  public data object BackupCode : Attribute("backup_code")
  public data object EmailAddress : Attribute("email_address")
  public data object PhoneNumber : Attribute("phone_number")
  public data object Username : Attribute("username")
  public data object FirstName : Attribute("first_name")
  public data object LastName : Attribute("last_name")
  public data object Web3Wallet : Attribute("web3_wallet")
  public data object AuthenticatorApp : Attribute("authenticator_app")
  public data class Unrecognized(val value: String) : Attribute(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Attribute = when (val raw = value.requireString()) {
      "passkey" -> Passkey
      "password" -> Password
      "backup_code" -> BackupCode
      "email_address" -> EmailAddress
      "phone_number" -> PhoneNumber
      "username" -> Username
      "first_name" -> FirstName
      "last_name" -> LastName
      "web3_wallet" -> Web3Wallet
      "authenticator_app" -> AuthenticatorApp
      else -> Unrecognized(raw)
    }
  }
}

public data class Actions(public val `deleteSelf`: Boolean, public val `createOrganization`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("delete_self", JsonPrimitive(this@Actions.`deleteSelf`))
    putPresent("create_organization", JsonPrimitive(this@Actions.`createOrganization`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Actions {
      val values = value.jsonObject

      return Actions(`deleteSelf` = (values["delete_self"] ?: Undefined).requireBoolean(), `createOrganization` = (values["create_organization"] ?: Undefined).requireBoolean())
    }
  }
}

public data class SignInData(public val `secondFactor`: SignInDataSecond_factor) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("second_factor", this@SignInData.`secondFactor`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInData {
      val values = value.jsonObject

      return SignInData(`secondFactor` = SignInDataSecond_factor.fromJson((values["second_factor"] ?: Undefined), runtime))
    }
  }
}

public data class SignInDataSecond_factor(public val `required`: Boolean, public val `enabled`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("required", JsonPrimitive(this@SignInDataSecond_factor.`required`))
    putPresent("enabled", JsonPrimitive(this@SignInDataSecond_factor.`enabled`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInDataSecond_factor {
      val values = value.jsonObject

      return SignInDataSecond_factor(`required` = (values["required"] ?: Undefined).requireBoolean(), `enabled` = (values["enabled"] ?: Undefined).requireBoolean())
    }
  }
}

public data class SignUpData(public val `allowlistOnly`: Boolean, public val `progressive`: Boolean, public val `captchaEnabled`: Boolean, public val `mode`: SignUpModes, public val `legalConsentEnabled`: Boolean, public val `mfa`: SignUpDataMfa? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("allowlist_only", JsonPrimitive(this@SignUpData.`allowlistOnly`))
    putPresent("progressive", JsonPrimitive(this@SignUpData.`progressive`))
    putPresent("captcha_enabled", JsonPrimitive(this@SignUpData.`captchaEnabled`))
    putPresent("mode", this@SignUpData.`mode`.toJson())
    putPresent("legal_consent_enabled", JsonPrimitive(this@SignUpData.`legalConsentEnabled`))
    putPresent("mfa", this@SignUpData.`mfa`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpData {
      val values = value.jsonObject

      return SignUpData(`allowlistOnly` = (values["allowlist_only"] ?: Undefined).requireBoolean(), `progressive` = (values["progressive"] ?: Undefined).requireBoolean(), `captchaEnabled` = (values["captcha_enabled"] ?: Undefined).requireBoolean(), `mode` = SignUpModes.fromJson((values["mode"] ?: Undefined), runtime), `legalConsentEnabled` = (values["legal_consent_enabled"] ?: Undefined).requireBoolean(), `mfa` = (values["mfa"] ?: Undefined).decodeOptional { value -> SignUpDataMfa.fromJson(value, runtime) })
    }
  }
}

public sealed class SignUpModes(public val rawValue: String) {
  public data object Public : SignUpModes("public")
  public data object Restricted : SignUpModes("restricted")
  public data object Waitlist : SignUpModes("waitlist")
  public data class Unrecognized(val value: String) : SignUpModes(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpModes = when (val raw = value.requireString()) {
      "public" -> Public
      "restricted" -> Restricted
      "waitlist" -> Waitlist
      else -> Unrecognized(raw)
    }
  }
}

public data class SignUpDataMfa(public val `required`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("required", JsonPrimitive(this@SignUpDataMfa.`required`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpDataMfa {
      val values = value.jsonObject

      return SignUpDataMfa(`required` = (values["required"] ?: Undefined).requireBoolean())
    }
  }
}

public data class PasswordSettingsData(public val `allowedSpecialCharacters`: String, public val `disableHibp`: Boolean, public val `minLength`: Double, public val `maxLength`: Double, public val `requireSpecialChar`: Boolean, public val `requireNumbers`: Boolean, public val `requireUppercase`: Boolean, public val `requireLowercase`: Boolean, public val `showZxcvbn`: Boolean, public val `minZxcvbnStrength`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("allowed_special_characters", JsonPrimitive(this@PasswordSettingsData.`allowedSpecialCharacters`))
    putPresent("disable_hibp", JsonPrimitive(this@PasswordSettingsData.`disableHibp`))
    putPresent("min_length", JsonPrimitive(this@PasswordSettingsData.`minLength`))
    putPresent("max_length", JsonPrimitive(this@PasswordSettingsData.`maxLength`))
    putPresent("require_special_char", JsonPrimitive(this@PasswordSettingsData.`requireSpecialChar`))
    putPresent("require_numbers", JsonPrimitive(this@PasswordSettingsData.`requireNumbers`))
    putPresent("require_uppercase", JsonPrimitive(this@PasswordSettingsData.`requireUppercase`))
    putPresent("require_lowercase", JsonPrimitive(this@PasswordSettingsData.`requireLowercase`))
    putPresent("show_zxcvbn", JsonPrimitive(this@PasswordSettingsData.`showZxcvbn`))
    putPresent("min_zxcvbn_strength", JsonPrimitive(this@PasswordSettingsData.`minZxcvbnStrength`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PasswordSettingsData {
      val values = value.jsonObject

      return PasswordSettingsData(`allowedSpecialCharacters` = (values["allowed_special_characters"] ?: Undefined).requireString(), `disableHibp` = (values["disable_hibp"] ?: Undefined).requireBoolean(), `minLength` = (values["min_length"] ?: Undefined).requireDouble(), `maxLength` = (values["max_length"] ?: Undefined).requireDouble(), `requireSpecialChar` = (values["require_special_char"] ?: Undefined).requireBoolean(), `requireNumbers` = (values["require_numbers"] ?: Undefined).requireBoolean(), `requireUppercase` = (values["require_uppercase"] ?: Undefined).requireBoolean(), `requireLowercase` = (values["require_lowercase"] ?: Undefined).requireBoolean(), `showZxcvbn` = (values["show_zxcvbn"] ?: Undefined).requireBoolean(), `minZxcvbnStrength` = (values["min_zxcvbn_strength"] ?: Undefined).requireDouble())
    }
  }
}

public data class UsernameSettingsData(public val `minLength`: Double, public val `maxLength`: Double) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("min_length", JsonPrimitive(this@UsernameSettingsData.`minLength`))
    putPresent("max_length", JsonPrimitive(this@UsernameSettingsData.`maxLength`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UsernameSettingsData {
      val values = value.jsonObject

      return UsernameSettingsData(`minLength` = (values["min_length"] ?: Undefined).requireDouble(), `maxLength` = (values["max_length"] ?: Undefined).requireDouble())
    }
  }
}

public data class AttackProtectionData(public val `enumerationProtection`: AttackProtectionDataEnumeration_protection) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enumeration_protection", this@AttackProtectionData.`enumerationProtection`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AttackProtectionData {
      val values = value.jsonObject

      return AttackProtectionData(`enumerationProtection` = AttackProtectionDataEnumeration_protection.fromJson((values["enumeration_protection"] ?: Undefined), runtime))
    }
  }
}

public data class AttackProtectionDataEnumeration_protection(public val `enabled`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enabled", JsonPrimitive(this@AttackProtectionDataEnumeration_protection.`enabled`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AttackProtectionDataEnumeration_protection {
      val values = value.jsonObject

      return AttackProtectionDataEnumeration_protection(`enabled` = (values["enabled"] ?: Undefined).requireBoolean())
    }
  }
}

public data class PasskeySettingsData(public val `allowAutofill`: Boolean, public val `showSignInButton`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("allow_autofill", JsonPrimitive(this@PasskeySettingsData.`allowAutofill`))
    putPresent("show_sign_in_button", JsonPrimitive(this@PasskeySettingsData.`showSignInButton`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PasskeySettingsData {
      val values = value.jsonObject

      return PasskeySettingsData(`allowAutofill` = (values["allow_autofill"] ?: Undefined).requireBoolean(), `showSignInButton` = (values["show_sign_in_button"] ?: Undefined).requireBoolean())
    }
  }
}

/**
 * The `OrganizationSettings` object holds the Organization-related settings configured for the instance.
 */
public data class OrganizationSettings(public val `enabled`: Boolean, public val `maxAllowedMemberships`: Double, public val `forceOrganizationSelection`: Boolean, public val `actions`: OrganizationSettingsActions, public val `domains`: OrganizationSettingsDomains, public val `slug`: OrganizationSettingsSlug, public val `organizationCreationDefaults`: OrganizationSettingsOrganizationCreationDefaults, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enabled", JsonPrimitive(this@OrganizationSettings.`enabled`))
    putPresent("maxAllowedMemberships", JsonPrimitive(this@OrganizationSettings.`maxAllowedMemberships`))
    putPresent("forceOrganizationSelection", JsonPrimitive(this@OrganizationSettings.`forceOrganizationSelection`))
    putPresent("actions", this@OrganizationSettings.`actions`.toJson())
    putPresent("domains", this@OrganizationSettings.`domains`.toJson())
    putPresent("slug", this@OrganizationSettings.`slug`.toJson())
    putPresent("organizationCreationDefaults", this@OrganizationSettings.`organizationCreationDefaults`.toJson())
    putPresent("id", this@OrganizationSettings.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationSettings {
      val values = value.jsonObject

      return OrganizationSettings(`enabled` = (values["enabled"] ?: Undefined).requireBoolean(), `maxAllowedMemberships` = (values["maxAllowedMemberships"] ?: Undefined).requireDouble(), `forceOrganizationSelection` = (values["forceOrganizationSelection"] ?: Undefined).requireBoolean(), `actions` = OrganizationSettingsActions.fromJson((values["actions"] ?: Undefined), runtime), `domains` = OrganizationSettingsDomains.fromJson((values["domains"] ?: Undefined), runtime), `slug` = OrganizationSettingsSlug.fromJson((values["slug"] ?: Undefined), runtime), `organizationCreationDefaults` = OrganizationSettingsOrganizationCreationDefaults.fromJson((values["organizationCreationDefaults"] ?: Undefined), runtime), `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class OrganizationSettingsActions(public val `adminDelete`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("adminDelete", JsonPrimitive(this@OrganizationSettingsActions.`adminDelete`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationSettingsActions {
      val values = value.jsonObject

      return OrganizationSettingsActions(`adminDelete` = (values["adminDelete"] ?: Undefined).requireBoolean())
    }
  }
}

public data class OrganizationSettingsDomains(public val `enabled`: Boolean, public val `enrollmentModes`: List<OrganizationEnrollmentMode>, public val `defaultRole`: String?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enabled", JsonPrimitive(this@OrganizationSettingsDomains.`enabled`))
    putPresent("enrollmentModes", JsonArray(this@OrganizationSettingsDomains.`enrollmentModes`.map { value -> value.toJson() }))
    putPresent("defaultRole", this@OrganizationSettingsDomains.`defaultRole`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationSettingsDomains {
      val values = value.jsonObject

      return OrganizationSettingsDomains(`enabled` = (values["enabled"] ?: Undefined).requireBoolean(), `enrollmentModes` = (values["enrollmentModes"] ?: Undefined).jsonArray.map { value -> OrganizationEnrollmentMode.fromJson(value, runtime) }, `defaultRole` = (values["defaultRole"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class OrganizationSettingsSlug(public val `disabled`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("disabled", JsonPrimitive(this@OrganizationSettingsSlug.`disabled`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationSettingsSlug {
      val values = value.jsonObject

      return OrganizationSettingsSlug(`disabled` = (values["disabled"] ?: Undefined).requireBoolean())
    }
  }
}

public data class OrganizationSettingsOrganizationCreationDefaults(public val `enabled`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enabled", JsonPrimitive(this@OrganizationSettingsOrganizationCreationDefaults.`enabled`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OrganizationSettingsOrganizationCreationDefaults {
      val values = value.jsonObject

      return OrganizationSettingsOrganizationCreationDefaults(`enabled` = (values["enabled"] ?: Undefined).requireBoolean())
    }
  }
}

public data class AuthConfig(public val `singleSessionMode`: Boolean, public val `claimedAt`: Instant?, public val `reverification`: Boolean, public val `preferredChannels`: Map<String, PhoneCodeChannel>?, public val `sessionMinter`: Boolean, public val `nativeSettings`: NativeAuthSettings? = null, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("singleSessionMode", JsonPrimitive(this@AuthConfig.`singleSessionMode`))
    putPresent("claimedAt", this@AuthConfig.`claimedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("reverification", JsonPrimitive(this@AuthConfig.`reverification`))
    putPresent("preferredChannels", this@AuthConfig.`preferredChannels`?.let { value -> JsonObject(value.mapValues { (_, value) -> value.toJson() }) } ?: JsonNull)
    putPresent("sessionMinter", JsonPrimitive(this@AuthConfig.`sessionMinter`))
    putPresent("nativeSettings", this@AuthConfig.`nativeSettings`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("id", this@AuthConfig.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): AuthConfig {
      val values = value.jsonObject

      return AuthConfig(`singleSessionMode` = (values["singleSessionMode"] ?: Undefined).requireBoolean(), `claimedAt` = (values["claimedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `reverification` = (values["reverification"] ?: Undefined).requireBoolean(), `preferredChannels` = (values["preferredChannels"] ?: Undefined).decodeOptional { value -> value.jsonObject.mapValues { (_, value) -> PhoneCodeChannel.fromJson(value, runtime) } }, `sessionMinter` = (values["sessionMinter"] ?: Undefined).requireBoolean(), `nativeSettings` = (values["nativeSettings"] ?: Undefined).decodeOptional { value -> NativeAuthSettings.fromJson(value, runtime) }, `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class NativeAuthSettings(public val `apiEnabled`: Boolean, public val `trustedDeviceSignInEnabled`: Boolean, public val `trustedDeviceEnrollmentPromptAfterSignInEnabled`: Boolean, public val `trustedDeviceEnrollmentPromptAfterSignUpEnabled`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("apiEnabled", JsonPrimitive(this@NativeAuthSettings.`apiEnabled`))
    putPresent("trustedDeviceSignInEnabled", JsonPrimitive(this@NativeAuthSettings.`trustedDeviceSignInEnabled`))
    putPresent("trustedDeviceEnrollmentPromptAfterSignInEnabled", JsonPrimitive(this@NativeAuthSettings.`trustedDeviceEnrollmentPromptAfterSignInEnabled`))
    putPresent("trustedDeviceEnrollmentPromptAfterSignUpEnabled", JsonPrimitive(this@NativeAuthSettings.`trustedDeviceEnrollmentPromptAfterSignUpEnabled`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): NativeAuthSettings {
      val values = value.jsonObject

      return NativeAuthSettings(`apiEnabled` = (values["apiEnabled"] ?: Undefined).requireBoolean(), `trustedDeviceSignInEnabled` = (values["trustedDeviceSignInEnabled"] ?: Undefined).requireBoolean(), `trustedDeviceEnrollmentPromptAfterSignInEnabled` = (values["trustedDeviceEnrollmentPromptAfterSignInEnabled"] ?: Undefined).requireBoolean(), `trustedDeviceEnrollmentPromptAfterSignUpEnabled` = (values["trustedDeviceEnrollmentPromptAfterSignUpEnabled"] ?: Undefined).requireBoolean())
    }
  }
}

public data class DisplayConfig(public val `id`: String, public val `afterSignInUrl`: String, public val `afterSignOutAllUrl`: String, public val `afterSignOutOneUrl`: String, public val `afterSignUpUrl`: String, public val `afterSwitchSessionUrl`: String, public val `applicationName`: String, public val `backendHost`: String, public val `branded`: Boolean, public val `captchaPublicKey`: String?, public val `captchaWidgetType`: DisplayConfigCaptchaWidgetType?, public val `captchaPublicKeyInvisible`: String?, public val `captchaOauthBypass`: List<OAuthStrategy>, public val `captchaHeartbeat`: Boolean, public val `captchaHeartbeatIntervalMs`: Double? = null, public val `homeUrl`: String, public val `instanceEnvironmentType`: String, public val `logoImageUrl`: String, public val `faviconImageUrl`: String, public val `preferredSignInStrategy`: PreferredSignInStrategy, public val `signInUrl`: String, public val `signUpUrl`: String, public val `supportEmail`: String, public val `theme`: DisplayThemeJSON, public val `userProfileUrl`: String, public val `clerkJSVersion`: String? = null, public val `organizationProfileUrl`: String, public val `createOrganizationUrl`: String, public val `afterLeaveOrganizationUrl`: String, public val `afterCreateOrganizationUrl`: String, public val `googleOneTapClientId`: String? = null, public val `showDevModeWarning`: Boolean, public val `termsUrl`: String, public val `privacyPolicyUrl`: String, public val `waitlistUrl`: String, public val `afterJoinWaitlistUrl`: String) {
  public val `captchaProvider`: String get() = "turnstile"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@DisplayConfig.`id`))
    putPresent("afterSignInUrl", JsonPrimitive(this@DisplayConfig.`afterSignInUrl`))
    putPresent("afterSignOutAllUrl", JsonPrimitive(this@DisplayConfig.`afterSignOutAllUrl`))
    putPresent("afterSignOutOneUrl", JsonPrimitive(this@DisplayConfig.`afterSignOutOneUrl`))
    putPresent("afterSignUpUrl", JsonPrimitive(this@DisplayConfig.`afterSignUpUrl`))
    putPresent("afterSwitchSessionUrl", JsonPrimitive(this@DisplayConfig.`afterSwitchSessionUrl`))
    putPresent("applicationName", JsonPrimitive(this@DisplayConfig.`applicationName`))
    putPresent("backendHost", JsonPrimitive(this@DisplayConfig.`backendHost`))
    putPresent("branded", JsonPrimitive(this@DisplayConfig.`branded`))
    putPresent("captchaPublicKey", this@DisplayConfig.`captchaPublicKey`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("captchaWidgetType", this@DisplayConfig.`captchaWidgetType`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("captchaProvider", JsonPrimitive("turnstile"))
    putPresent("captchaPublicKeyInvisible", this@DisplayConfig.`captchaPublicKeyInvisible`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("captchaOauthBypass", JsonArray(this@DisplayConfig.`captchaOauthBypass`.map { value -> value.toJson() }))
    putPresent("captchaHeartbeat", JsonPrimitive(this@DisplayConfig.`captchaHeartbeat`))
    putPresent("captchaHeartbeatIntervalMs", this@DisplayConfig.`captchaHeartbeatIntervalMs`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("homeUrl", JsonPrimitive(this@DisplayConfig.`homeUrl`))
    putPresent("instanceEnvironmentType", JsonPrimitive(this@DisplayConfig.`instanceEnvironmentType`))
    putPresent("logoImageUrl", JsonPrimitive(this@DisplayConfig.`logoImageUrl`))
    putPresent("faviconImageUrl", JsonPrimitive(this@DisplayConfig.`faviconImageUrl`))
    putPresent("preferredSignInStrategy", this@DisplayConfig.`preferredSignInStrategy`.toJson())
    putPresent("signInUrl", JsonPrimitive(this@DisplayConfig.`signInUrl`))
    putPresent("signUpUrl", JsonPrimitive(this@DisplayConfig.`signUpUrl`))
    putPresent("supportEmail", JsonPrimitive(this@DisplayConfig.`supportEmail`))
    putPresent("theme", this@DisplayConfig.`theme`.toJson())
    putPresent("userProfileUrl", JsonPrimitive(this@DisplayConfig.`userProfileUrl`))
    putPresent("clerkJSVersion", this@DisplayConfig.`clerkJSVersion`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("organizationProfileUrl", JsonPrimitive(this@DisplayConfig.`organizationProfileUrl`))
    putPresent("createOrganizationUrl", JsonPrimitive(this@DisplayConfig.`createOrganizationUrl`))
    putPresent("afterLeaveOrganizationUrl", JsonPrimitive(this@DisplayConfig.`afterLeaveOrganizationUrl`))
    putPresent("afterCreateOrganizationUrl", JsonPrimitive(this@DisplayConfig.`afterCreateOrganizationUrl`))
    putPresent("googleOneTapClientId", this@DisplayConfig.`googleOneTapClientId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("showDevModeWarning", JsonPrimitive(this@DisplayConfig.`showDevModeWarning`))
    putPresent("termsUrl", JsonPrimitive(this@DisplayConfig.`termsUrl`))
    putPresent("privacyPolicyUrl", JsonPrimitive(this@DisplayConfig.`privacyPolicyUrl`))
    putPresent("waitlistUrl", JsonPrimitive(this@DisplayConfig.`waitlistUrl`))
    putPresent("afterJoinWaitlistUrl", JsonPrimitive(this@DisplayConfig.`afterJoinWaitlistUrl`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): DisplayConfig {
      val values = value.jsonObject
      require(values["captchaProvider"] == JsonPrimitive("turnstile"))
      return DisplayConfig(`id` = (values["id"] ?: Undefined).requireString(), `afterSignInUrl` = (values["afterSignInUrl"] ?: Undefined).requireString(), `afterSignOutAllUrl` = (values["afterSignOutAllUrl"] ?: Undefined).requireString(), `afterSignOutOneUrl` = (values["afterSignOutOneUrl"] ?: Undefined).requireString(), `afterSignUpUrl` = (values["afterSignUpUrl"] ?: Undefined).requireString(), `afterSwitchSessionUrl` = (values["afterSwitchSessionUrl"] ?: Undefined).requireString(), `applicationName` = (values["applicationName"] ?: Undefined).requireString(), `backendHost` = (values["backendHost"] ?: Undefined).requireString(), `branded` = (values["branded"] ?: Undefined).requireBoolean(), `captchaPublicKey` = (values["captchaPublicKey"] ?: Undefined).decodeOptional { value -> value.requireString() }, `captchaWidgetType` = (values["captchaWidgetType"] ?: Undefined).decodeOptional { value -> DisplayConfigCaptchaWidgetType.fromJson(value, runtime) }, `captchaPublicKeyInvisible` = (values["captchaPublicKeyInvisible"] ?: Undefined).decodeOptional { value -> value.requireString() }, `captchaOauthBypass` = (values["captchaOauthBypass"] ?: Undefined).jsonArray.map { value -> OAuthStrategy.fromJson(value, runtime) }, `captchaHeartbeat` = (values["captchaHeartbeat"] ?: Undefined).requireBoolean(), `captchaHeartbeatIntervalMs` = (values["captchaHeartbeatIntervalMs"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `homeUrl` = (values["homeUrl"] ?: Undefined).requireString(), `instanceEnvironmentType` = (values["instanceEnvironmentType"] ?: Undefined).requireString(), `logoImageUrl` = (values["logoImageUrl"] ?: Undefined).requireString(), `faviconImageUrl` = (values["faviconImageUrl"] ?: Undefined).requireString(), `preferredSignInStrategy` = PreferredSignInStrategy.fromJson((values["preferredSignInStrategy"] ?: Undefined), runtime), `signInUrl` = (values["signInUrl"] ?: Undefined).requireString(), `signUpUrl` = (values["signUpUrl"] ?: Undefined).requireString(), `supportEmail` = (values["supportEmail"] ?: Undefined).requireString(), `theme` = DisplayThemeJSON.fromJson((values["theme"] ?: Undefined), runtime), `userProfileUrl` = (values["userProfileUrl"] ?: Undefined).requireString(), `clerkJSVersion` = (values["clerkJSVersion"] ?: Undefined).decodeOptional { value -> value.requireString() }, `organizationProfileUrl` = (values["organizationProfileUrl"] ?: Undefined).requireString(), `createOrganizationUrl` = (values["createOrganizationUrl"] ?: Undefined).requireString(), `afterLeaveOrganizationUrl` = (values["afterLeaveOrganizationUrl"] ?: Undefined).requireString(), `afterCreateOrganizationUrl` = (values["afterCreateOrganizationUrl"] ?: Undefined).requireString(), `googleOneTapClientId` = (values["googleOneTapClientId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `showDevModeWarning` = (values["showDevModeWarning"] ?: Undefined).requireBoolean(), `termsUrl` = (values["termsUrl"] ?: Undefined).requireString(), `privacyPolicyUrl` = (values["privacyPolicyUrl"] ?: Undefined).requireString(), `waitlistUrl` = (values["waitlistUrl"] ?: Undefined).requireString(), `afterJoinWaitlistUrl` = (values["afterJoinWaitlistUrl"] ?: Undefined).requireString())
    }
  }
}

public sealed class DisplayConfigCaptchaWidgetType(public val rawValue: String) {
  public data object Smart : DisplayConfigCaptchaWidgetType("smart")
  public data object Invisible : DisplayConfigCaptchaWidgetType("invisible")
  public data class Unrecognized(val value: String) : DisplayConfigCaptchaWidgetType(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): DisplayConfigCaptchaWidgetType = when (val raw = value.requireString()) {
      "smart" -> Smart
      "invisible" -> Invisible
      else -> Unrecognized(raw)
    }
  }
}

public sealed class PreferredSignInStrategy(public val rawValue: String) {
  public data object Password : PreferredSignInStrategy("password")
  public data object Otp : PreferredSignInStrategy("otp")
  public data class Unrecognized(val value: String) : PreferredSignInStrategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PreferredSignInStrategy = when (val raw = value.requireString()) {
      "password" -> Password
      "otp" -> Otp
      else -> Unrecognized(raw)
    }
  }
}

public data class DisplayThemeJSON(public val `general`: DisplayThemeJSONGeneral, public val `buttons`: DisplayThemeJSONButtons, public val `accounts`: DisplayThemeJSONAccounts) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("general", this@DisplayThemeJSON.`general`.toJson())
    putPresent("buttons", this@DisplayThemeJSON.`buttons`.toJson())
    putPresent("accounts", this@DisplayThemeJSON.`accounts`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): DisplayThemeJSON {
      val values = value.jsonObject

      return DisplayThemeJSON(`general` = DisplayThemeJSONGeneral.fromJson((values["general"] ?: Undefined), runtime), `buttons` = DisplayThemeJSONButtons.fromJson((values["buttons"] ?: Undefined), runtime), `accounts` = DisplayThemeJSONAccounts.fromJson((values["accounts"] ?: Undefined), runtime))
    }
  }
}

public data class DisplayThemeJSONGeneral(public val `color`: String, public val `backgroundColor`: DisplayThemeColor, public val `fontFamily`: String, public val `fontColor`: String, public val `labelFontWeight`: String, public val `padding`: String, public val `borderRadius`: String, public val `boxShadow`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("color", JsonPrimitive(this@DisplayThemeJSONGeneral.`color`))
    putPresent("background_color", this@DisplayThemeJSONGeneral.`backgroundColor`.toJson())
    putPresent("font_family", JsonPrimitive(this@DisplayThemeJSONGeneral.`fontFamily`))
    putPresent("font_color", JsonPrimitive(this@DisplayThemeJSONGeneral.`fontColor`))
    putPresent("label_font_weight", JsonPrimitive(this@DisplayThemeJSONGeneral.`labelFontWeight`))
    putPresent("padding", JsonPrimitive(this@DisplayThemeJSONGeneral.`padding`))
    putPresent("border_radius", JsonPrimitive(this@DisplayThemeJSONGeneral.`borderRadius`))
    putPresent("box_shadow", JsonPrimitive(this@DisplayThemeJSONGeneral.`boxShadow`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): DisplayThemeJSONGeneral {
      val values = value.jsonObject

      return DisplayThemeJSONGeneral(`color` = (values["color"] ?: Undefined).requireString(), `backgroundColor` = DisplayThemeColor.fromJson((values["background_color"] ?: Undefined), runtime), `fontFamily` = (values["font_family"] ?: Undefined).requireString(), `fontColor` = (values["font_color"] ?: Undefined).requireString(), `labelFontWeight` = (values["label_font_weight"] ?: Undefined).requireString(), `padding` = (values["padding"] ?: Undefined).requireString(), `borderRadius` = (values["border_radius"] ?: Undefined).requireString(), `boxShadow` = (values["box_shadow"] ?: Undefined).requireString())
    }
  }
}

public sealed interface DisplayThemeColor {
  public data class Case1(val value: String) : DisplayThemeColor
  public data class Case2(val value: HslaColor) : DisplayThemeColor
  public data class Case3(val value: RgbaColor) : DisplayThemeColor
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to JsonPrimitive(value)))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): DisplayThemeColor {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(payload.requireString())
        1 -> Case2(HslaColor.fromJson(payload, runtime))
        2 -> Case3(RgbaColor.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class HslaColor(public val `h`: Double, public val `s`: Double, public val `l`: Double, public val `a`: Double? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("h", JsonPrimitive(this@HslaColor.`h`))
    putPresent("s", JsonPrimitive(this@HslaColor.`s`))
    putPresent("l", JsonPrimitive(this@HslaColor.`l`))
    putPresent("a", this@HslaColor.`a`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): HslaColor {
      val values = value.jsonObject

      return HslaColor(`h` = (values["h"] ?: Undefined).requireDouble(), `s` = (values["s"] ?: Undefined).requireDouble(), `l` = (values["l"] ?: Undefined).requireDouble(), `a` = (values["a"] ?: Undefined).decodeOptional { value -> value.requireDouble() })
    }
  }
}

public data class RgbaColor(public val `r`: Double, public val `g`: Double, public val `b`: Double, public val `a`: Double? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("r", JsonPrimitive(this@RgbaColor.`r`))
    putPresent("g", JsonPrimitive(this@RgbaColor.`g`))
    putPresent("b", JsonPrimitive(this@RgbaColor.`b`))
    putPresent("a", this@RgbaColor.`a`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): RgbaColor {
      val values = value.jsonObject

      return RgbaColor(`r` = (values["r"] ?: Undefined).requireDouble(), `g` = (values["g"] ?: Undefined).requireDouble(), `b` = (values["b"] ?: Undefined).requireDouble(), `a` = (values["a"] ?: Undefined).decodeOptional { value -> value.requireDouble() })
    }
  }
}

public data class DisplayThemeJSONButtons(public val `fontColor`: String, public val `fontFamily`: String, public val `fontWeight`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("font_color", JsonPrimitive(this@DisplayThemeJSONButtons.`fontColor`))
    putPresent("font_family", JsonPrimitive(this@DisplayThemeJSONButtons.`fontFamily`))
    putPresent("font_weight", JsonPrimitive(this@DisplayThemeJSONButtons.`fontWeight`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): DisplayThemeJSONButtons {
      val values = value.jsonObject

      return DisplayThemeJSONButtons(`fontColor` = (values["font_color"] ?: Undefined).requireString(), `fontFamily` = (values["font_family"] ?: Undefined).requireString(), `fontWeight` = (values["font_weight"] ?: Undefined).requireString())
    }
  }
}

public data class DisplayThemeJSONAccounts(public val `backgroundColor`: DisplayThemeColor) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("background_color", this@DisplayThemeJSONAccounts.`backgroundColor`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): DisplayThemeJSONAccounts {
      val values = value.jsonObject

      return DisplayThemeJSONAccounts(`backgroundColor` = DisplayThemeColor.fromJson((values["background_color"] ?: Undefined), runtime))
    }
  }
}

public data class CommerceSettings(public val `billing`: CommerceSettingsBilling, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("billing", this@CommerceSettings.`billing`.toJson())
    putPresent("id", this@CommerceSettings.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CommerceSettings {
      val values = value.jsonObject

      return CommerceSettings(`billing` = CommerceSettingsBilling.fromJson((values["billing"] ?: Undefined), runtime), `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class CommerceSettingsBilling(public val `stripePublishableKey`: String?, public val `organization`: CommerceSettingsBillingOrganization, public val `user`: CommerceSettingsBillingUser) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("stripePublishableKey", this@CommerceSettingsBilling.`stripePublishableKey`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("organization", this@CommerceSettingsBilling.`organization`.toJson())
    putPresent("user", this@CommerceSettingsBilling.`user`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CommerceSettingsBilling {
      val values = value.jsonObject

      return CommerceSettingsBilling(`stripePublishableKey` = (values["stripePublishableKey"] ?: Undefined).decodeOptional { value -> value.requireString() }, `organization` = CommerceSettingsBillingOrganization.fromJson((values["organization"] ?: Undefined), runtime), `user` = CommerceSettingsBillingUser.fromJson((values["user"] ?: Undefined), runtime))
    }
  }
}

public data class CommerceSettingsBillingOrganization(public val `enabled`: Boolean, public val `hasPaidPlans`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enabled", JsonPrimitive(this@CommerceSettingsBillingOrganization.`enabled`))
    putPresent("hasPaidPlans", JsonPrimitive(this@CommerceSettingsBillingOrganization.`hasPaidPlans`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CommerceSettingsBillingOrganization {
      val values = value.jsonObject

      return CommerceSettingsBillingOrganization(`enabled` = (values["enabled"] ?: Undefined).requireBoolean(), `hasPaidPlans` = (values["hasPaidPlans"] ?: Undefined).requireBoolean())
    }
  }
}

public data class CommerceSettingsBillingUser(public val `enabled`: Boolean, public val `hasPaidPlans`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("enabled", JsonPrimitive(this@CommerceSettingsBillingUser.`enabled`))
    putPresent("hasPaidPlans", JsonPrimitive(this@CommerceSettingsBillingUser.`hasPaidPlans`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): CommerceSettingsBillingUser {
      val values = value.jsonObject

      return CommerceSettingsBillingUser(`enabled` = (values["enabled"] ?: Undefined).requireBoolean(), `hasPaidPlans` = (values["hasPaidPlans"] ?: Undefined).requireBoolean())
    }
  }
}

public data class APIKeysSettings(public val `userApiKeysEnabled`: Boolean, public val `orgsApiKeysEnabled`: Boolean, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("user_api_keys_enabled", JsonPrimitive(this@APIKeysSettings.`userApiKeysEnabled`))
    putPresent("orgs_api_keys_enabled", JsonPrimitive(this@APIKeysSettings.`orgsApiKeysEnabled`))
    putPresent("id", this@APIKeysSettings.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): APIKeysSettings {
      val values = value.jsonObject

      return APIKeysSettings(`userApiKeysEnabled` = (values["user_api_keys_enabled"] ?: Undefined).requireBoolean(), `orgsApiKeysEnabled` = (values["orgs_api_keys_enabled"] ?: Undefined).requireBoolean(), `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class ProtectConfig(public val `id`: String? = null, public val `loaders`: List<ProtectLoader>? = null, public val `tokensInvalidBefore`: Double? = null, public val `challengeLoadTimeoutMs`: Double? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", this@ProtectConfig.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("loaders", this@ProtectConfig.`loaders`?.let { value -> JsonArray(value.map { value -> value.toJson() }) } ?: Undefined)
    putPresent("tokens_invalid_before", this@ProtectConfig.`tokensInvalidBefore`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("challenge_load_timeout_ms", this@ProtectConfig.`challengeLoadTimeoutMs`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ProtectConfig {
      val values = value.jsonObject

      return ProtectConfig(`id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() }, `loaders` = (values["loaders"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> ProtectLoader.fromJson(value, runtime) } }, `tokensInvalidBefore` = (values["tokens_invalid_before"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `challengeLoadTimeoutMs` = (values["challenge_load_timeout_ms"] ?: Undefined).decodeOptional { value -> value.requireDouble() })
    }
  }
}

/**
 * One loader, exactly as the server serves it.
 *
 * **Field names are the wire's, not TypeScript's.** The array is assigned straight out of
 * `/v1/environment` with no case conversion, so a camelCase name here reads a field the server
 * does not send and is silently `undefined` forever. `token_timeout_ms` shipped that way and the
 * per-instance deadline it configures did nothing. Match the Go tag on
 * `antifraud/config.JSLoaderConfig`, and if a field has no tag there yet, name it as that tag
 * would be.
 */
public data class ProtectLoader(public val `rollout`: Double? = null, public val `target`: ProtectLoaderTarget, public val `type`: String, public val `attributes`: Map<String, ProtectLoaderAttributesValue>? = null, public val `textContent`: String? = null, public val `tokenUrl`: String? = null, public val `tokenTimeoutMs`: Double? = null, public val `challengeLoadTimeoutMs`: Double? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("rollout", this@ProtectLoader.`rollout`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("target", this@ProtectLoader.`target`.toJson())
    putPresent("type", JsonPrimitive(this@ProtectLoader.`type`))
    putPresent("attributes", this@ProtectLoader.`attributes`?.let { value -> JsonObject(value.mapValues { (_, value) -> value.toJson() }) } ?: Undefined)
    putPresent("text_content", this@ProtectLoader.`textContent`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("token_url", this@ProtectLoader.`tokenUrl`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("token_timeout_ms", this@ProtectLoader.`tokenTimeoutMs`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("challenge_load_timeout_ms", this@ProtectLoader.`challengeLoadTimeoutMs`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ProtectLoader {
      val values = value.jsonObject

      return ProtectLoader(`rollout` = (values["rollout"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `target` = ProtectLoaderTarget.fromJson((values["target"] ?: Undefined), runtime), `type` = (values["type"] ?: Undefined).requireString(), `attributes` = (values["attributes"] ?: Undefined).decodeOptional { value -> value.jsonObject.mapValues { (_, value) -> ProtectLoaderAttributesValue.fromJson(value, runtime) } }, `textContent` = (values["text_content"] ?: Undefined).decodeOptional { value -> value.requireString() }, `tokenUrl` = (values["token_url"] ?: Undefined).decodeOptional { value -> value.requireString() }, `tokenTimeoutMs` = (values["token_timeout_ms"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `challengeLoadTimeoutMs` = (values["challenge_load_timeout_ms"] ?: Undefined).decodeOptional { value -> value.requireDouble() })
    }
  }
}

public sealed class ProtectLoaderTarget(public val rawValue: String) {
  public data object Head : ProtectLoaderTarget("head")
  public data object Body : ProtectLoaderTarget("body")
  public data class Unrecognized(val value: String) : ProtectLoaderTarget(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ProtectLoaderTarget = when (val raw = value.requireString()) {
      "head" -> Head
      "body" -> Body
      else -> Unrecognized(raw)
    }
  }
}

public sealed interface ProtectLoaderAttributesValue {
  public data class Case1(val value: String) : ProtectLoaderAttributesValue
  public data class Case2(val value: Double) : ProtectLoaderAttributesValue
  public data class Case3(val value: Boolean) : ProtectLoaderAttributesValue
  public data class Case4(val value: Boolean) : ProtectLoaderAttributesValue
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to JsonPrimitive(value)))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to JsonPrimitive(value)))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to JsonPrimitive(false)))
    is Case4 -> JsonObject(mapOf("\$case" to JsonPrimitive(3), "value" to JsonPrimitive(true)))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ProtectLoaderAttributesValue {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(payload.requireString())
        1 -> Case2(payload.requireDouble())
        2 -> Case3(payload.requireLiteral(JsonPrimitive(false)).requireBoolean())
        3 -> Case4(payload.requireLiteral(JsonPrimitive(true)).requireBoolean())
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

/**
 * Native biometric credentials, backed by device-held keys and the Clerk core.
 */
public data class BiometricCredentialsState(public val `canEnroll`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("canEnroll", JsonPrimitive(this@BiometricCredentialsState.`canEnroll`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialsState {
      val values = value.jsonObject

      return BiometricCredentialsState(`canEnroll` = (values["canEnroll"] ?: Undefined).requireBoolean())
    }
  }
}
public class BiometricCredentials(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: BiometricCredentialsState get() = context.state(handle)
  public val changes: Flow<BiometricCredentialsState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `canEnroll`: Boolean get() = state.`canEnroll`
  override fun prepare(value: JsonElement): Any = BiometricCredentialsState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentials = runtime.resource(ResourceHandle.fromReference(value)) as BiometricCredentials
  }
  public suspend fun `list`(): List<BiometricCredential> {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BiometricCredentials.list", listOf()) { result ->
      result.jsonArray.map { value -> BiometricCredential.fromJson(value, runtime) }
    }
  }
  public suspend fun `availability`(`params`: BiometricCredentialSelectionParams? = null): BiometricCredentialAvailability {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BiometricCredentials.availability", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      BiometricCredentialAvailability.fromJson(result, runtime)
    }
  }
  public suspend fun `localAvailability`(`params`: BiometricCredentialSelectionParams? = null): BiometricCredentialAvailability {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BiometricCredentials.localAvailability", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      BiometricCredentialAvailability.fromJson(result, runtime)
    }
  }
  public suspend fun `validateLocalCredential`(`params`: BiometricCredentialSelectionParams? = null): BiometricCredentialValidationResult {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BiometricCredentials.validateLocalCredential", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      BiometricCredentialValidationResult.fromJson(result, runtime)
    }
  }
  public suspend fun `enroll`(`params`: BiometricCredentialEnrollmentParams? = null): BiometricCredential {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BiometricCredentials.enroll", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      BiometricCredential.fromJson(result, runtime)
    }
  }
  public suspend fun `revoke`(`params`: BiometricCredentialsRevokeParams): BiometricCredential {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BiometricCredentials.revoke", listOf(`params`.toJson())) { result ->
      BiometricCredential.fromJson(result, runtime)
    }
  }
  public suspend fun `revokeCurrentDeviceCredential`(): BiometricCredential? {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BiometricCredentials.revokeCurrentDeviceCredential", listOf()) { result ->
      result.decodeOptional { value -> BiometricCredential.fromJson(value, runtime) }
    }
  }
  public suspend fun `forgetLocalCredentials`(`params`: BiometricCredentialsForgetLocalCredentialsParams): Double {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "BiometricCredentials.forgetLocalCredentials", listOf(`params`.toJson())) { result ->
      result.requireDouble()
    }
  }
}

public data class BiometricCredential(public val `id`: String, public val `object`: String, public val `platform`: BiometricCredentialPlatform, public val `appIdentifier`: String, public val `name`: String?, public val `algorithm`: BiometricCredentialAlgorithm, public val `status`: BiometricCredentialStatus, public val `createdAt`: Instant, public val `updatedAt`: Instant, public val `lastUsedAt`: Instant?, public val `revokedAt`: Instant?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@BiometricCredential.`id`))
    putPresent("object", JsonPrimitive(this@BiometricCredential.`object`))
    putPresent("platform", this@BiometricCredential.`platform`.toJson())
    putPresent("appIdentifier", JsonPrimitive(this@BiometricCredential.`appIdentifier`))
    putPresent("name", this@BiometricCredential.`name`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("algorithm", this@BiometricCredential.`algorithm`.toJson())
    putPresent("status", this@BiometricCredential.`status`.toJson())
    putPresent("createdAt", JsonPrimitive(this@BiometricCredential.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@BiometricCredential.`updatedAt`.toString()))
    putPresent("lastUsedAt", this@BiometricCredential.`lastUsedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("revokedAt", this@BiometricCredential.`revokedAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredential {
      val values = value.jsonObject

      return BiometricCredential(`id` = (values["id"] ?: Undefined).requireString(), `object` = (values["object"] ?: Undefined).requireString(), `platform` = BiometricCredentialPlatform.fromJson((values["platform"] ?: Undefined), runtime), `appIdentifier` = (values["appIdentifier"] ?: Undefined).requireString(), `name` = (values["name"] ?: Undefined).decodeOptional { value -> value.requireString() }, `algorithm` = BiometricCredentialAlgorithm.fromJson((values["algorithm"] ?: Undefined), runtime), `status` = BiometricCredentialStatus.fromJson((values["status"] ?: Undefined), runtime), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()), `lastUsedAt` = (values["lastUsedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `revokedAt` = (values["revokedAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) })
    }
  }
}

public sealed interface BiometricCredentialPlatform {
  public data class Case1(val value: String) : BiometricCredentialPlatform
  public data class Case2(val value: String) : BiometricCredentialPlatform
  public data class Case3(val value: String) : BiometricCredentialPlatform
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to JsonPrimitive("ios")))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to JsonPrimitive("android")))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to JsonPrimitive(value)))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialPlatform {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(payload.requireLiteral(JsonPrimitive("ios")).requireString())
        1 -> Case2(payload.requireLiteral(JsonPrimitive("android")).requireString())
        2 -> Case3(payload.requireString())
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public sealed interface BiometricCredentialAlgorithm {
  public data class Case1(val value: String) : BiometricCredentialAlgorithm
  public data class Case2(val value: String) : BiometricCredentialAlgorithm
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to JsonPrimitive(value)))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to JsonPrimitive("ES256")))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialAlgorithm {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(payload.requireString())
        1 -> Case2(payload.requireLiteral(JsonPrimitive("ES256")).requireString())
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public sealed interface BiometricCredentialStatus {
  public data class Case1(val value: String) : BiometricCredentialStatus
  public data class Case2(val value: String) : BiometricCredentialStatus
  public data class Case3(val value: String) : BiometricCredentialStatus
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to JsonPrimitive("active")))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to JsonPrimitive("revoked")))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to JsonPrimitive(value)))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialStatus {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(payload.requireLiteral(JsonPrimitive("active")).requireString())
        1 -> Case2(payload.requireLiteral(JsonPrimitive("revoked")).requireString())
        2 -> Case3(payload.requireString())
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class BiometricCredentialSelectionParams(public val `id`: String? = null, public val `identifierHint`: String? = null, public val `currentUser`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", this@BiometricCredentialSelectionParams.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("identifierHint", this@BiometricCredentialSelectionParams.`identifierHint`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("currentUser", this@BiometricCredentialSelectionParams.`currentUser`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialSelectionParams {
      val values = value.jsonObject

      return BiometricCredentialSelectionParams(`id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() }, `identifierHint` = (values["identifierHint"] ?: Undefined).decodeOptional { value -> value.requireString() }, `currentUser` = (values["currentUser"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public data class BiometricCredentialAvailability(public val `isAvailable`: Boolean, public val `unavailableReason`: BiometricCredentialUnavailableReason?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("isAvailable", JsonPrimitive(this@BiometricCredentialAvailability.`isAvailable`))
    putPresent("unavailableReason", this@BiometricCredentialAvailability.`unavailableReason`?.let { value -> value.toJson() } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialAvailability {
      val values = value.jsonObject

      return BiometricCredentialAvailability(`isAvailable` = (values["isAvailable"] ?: Undefined).requireBoolean(), `unavailableReason` = (values["unavailableReason"] ?: Undefined).decodeOptional { value -> BiometricCredentialUnavailableReason.fromJson(value, runtime) })
    }
  }
}

public sealed class BiometricCredentialUnavailableReason(public val rawValue: String) {
  public data object EnvironmentUnavailable : BiometricCredentialUnavailableReason("environmentUnavailable")
  public data object NativeAPIDisabled : BiometricCredentialUnavailableReason("nativeAPIDisabled")
  public data object FeatureDisabled : BiometricCredentialUnavailableReason("featureDisabled")
  public data object UnsupportedPlatform : BiometricCredentialUnavailableReason("unsupportedPlatform")
  public data object BiometricAuthenticationUnavailable : BiometricCredentialUnavailableReason("biometricAuthenticationUnavailable")
  public data object NoLocalCredential : BiometricCredentialUnavailableReason("noLocalCredential")
  public data object LocalKeyMissing : BiometricCredentialUnavailableReason("localKeyMissing")
  public data object ServerCredentialMissing : BiometricCredentialUnavailableReason("serverCredentialMissing")
  public data object ServerCredentialRevoked : BiometricCredentialUnavailableReason("serverCredentialRevoked")
  public data class Unrecognized(val value: String) : BiometricCredentialUnavailableReason(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialUnavailableReason = when (val raw = value.requireString()) {
      "environmentUnavailable" -> EnvironmentUnavailable
      "nativeAPIDisabled" -> NativeAPIDisabled
      "featureDisabled" -> FeatureDisabled
      "unsupportedPlatform" -> UnsupportedPlatform
      "biometricAuthenticationUnavailable" -> BiometricAuthenticationUnavailable
      "noLocalCredential" -> NoLocalCredential
      "localKeyMissing" -> LocalKeyMissing
      "serverCredentialMissing" -> ServerCredentialMissing
      "serverCredentialRevoked" -> ServerCredentialRevoked
      else -> Unrecognized(raw)
    }
  }
}

public data class BiometricCredentialValidationResult(public val `status`: BiometricCredentialValidationResultStatus, public val `reason`: BiometricCredentialUnavailableReason?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("status", this@BiometricCredentialValidationResult.`status`.toJson())
    putPresent("reason", this@BiometricCredentialValidationResult.`reason`?.let { value -> value.toJson() } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialValidationResult {
      val values = value.jsonObject

      return BiometricCredentialValidationResult(`status` = BiometricCredentialValidationResultStatus.fromJson((values["status"] ?: Undefined), runtime), `reason` = (values["reason"] ?: Undefined).decodeOptional { value -> BiometricCredentialUnavailableReason.fromJson(value, runtime) })
    }
  }
}

public sealed class BiometricCredentialValidationResultStatus(public val rawValue: String) {
  public data object Valid : BiometricCredentialValidationResultStatus("valid")
  public data object Invalid : BiometricCredentialValidationResultStatus("invalid")
  public data object Inconclusive : BiometricCredentialValidationResultStatus("inconclusive")
  public data class Unrecognized(val value: String) : BiometricCredentialValidationResultStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialValidationResultStatus = when (val raw = value.requireString()) {
      "valid" -> Valid
      "invalid" -> Invalid
      "inconclusive" -> Inconclusive
      else -> Unrecognized(raw)
    }
  }
}

public data class BiometricCredentialEnrollmentParams(public val `name`: String? = null, public val `identifierHint`: String? = null, public val `reason`: String? = null, public val `promptSubtitle`: String? = null, public val `policy`: BiometricCredentialPolicy? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("name", this@BiometricCredentialEnrollmentParams.`name`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("identifierHint", this@BiometricCredentialEnrollmentParams.`identifierHint`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("reason", this@BiometricCredentialEnrollmentParams.`reason`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("promptSubtitle", this@BiometricCredentialEnrollmentParams.`promptSubtitle`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("policy", this@BiometricCredentialEnrollmentParams.`policy`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialEnrollmentParams {
      val values = value.jsonObject

      return BiometricCredentialEnrollmentParams(`name` = (values["name"] ?: Undefined).decodeOptional { value -> value.requireString() }, `identifierHint` = (values["identifierHint"] ?: Undefined).decodeOptional { value -> value.requireString() }, `reason` = (values["reason"] ?: Undefined).decodeOptional { value -> value.requireString() }, `promptSubtitle` = (values["promptSubtitle"] ?: Undefined).decodeOptional { value -> value.requireString() }, `policy` = (values["policy"] ?: Undefined).decodeOptional { value -> BiometricCredentialPolicy.fromJson(value, runtime) })
    }
  }
}

public sealed class BiometricCredentialPolicy(public val rawValue: String) {
  public data object BiometryCurrentSet : BiometricCredentialPolicy("biometry_current_set")
  public data object BiometryAny : BiometricCredentialPolicy("biometry_any")
  public data object BiometryOrDevicePasscode : BiometricCredentialPolicy("biometry_or_device_passcode")
  public data class Unrecognized(val value: String) : BiometricCredentialPolicy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialPolicy = when (val raw = value.requireString()) {
      "biometry_current_set" -> BiometryCurrentSet
      "biometry_any" -> BiometryAny
      "biometry_or_device_passcode" -> BiometryOrDevicePasscode
      else -> Unrecognized(raw)
    }
  }
}

public data class BiometricCredentialsRevokeParams(public val `id`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@BiometricCredentialsRevokeParams.`id`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialsRevokeParams {
      val values = value.jsonObject

      return BiometricCredentialsRevokeParams(`id` = (values["id"] ?: Undefined).requireString())
    }
  }
}

public data class BiometricCredentialsForgetLocalCredentialsParams(public val `userId`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("userId", JsonPrimitive(this@BiometricCredentialsForgetLocalCredentialsParams.`userId`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): BiometricCredentialsForgetLocalCredentialsParams {
      val values = value.jsonObject

      return BiometricCredentialsForgetLocalCredentialsParams(`userId` = (values["userId"] ?: Undefined).requireString())
    }
  }
}

public data class MobileAuthCallback(public val `id`: Double, public val `result`: MobileAuthenticationResult) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", JsonPrimitive(this@MobileAuthCallback.`id`))
    putPresent("result", this@MobileAuthCallback.`result`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileAuthCallback {
      val values = value.jsonObject

      return MobileAuthCallback(`id` = (values["id"] ?: Undefined).requireDouble(), `result` = MobileAuthenticationResult.fromJson((values["result"] ?: Undefined), runtime))
    }
  }
}

public sealed interface MobileAuthenticationResult {
  public data class Case1(val value: MobileAuthCallbackResultCase1) : MobileAuthenticationResult
  public data class Case2(val value: MobileAuthCallbackResultCase2) : MobileAuthenticationResult
  public val `kind`: String get() = when (this) {
    is Case1 -> value.`kind`
    is Case2 -> value.`kind`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileAuthenticationResult {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(MobileAuthCallbackResultCase1.fromJson(payload, runtime))
        1 -> Case2(MobileAuthCallbackResultCase2.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class MobileAuthCallbackResultCase1(public val `signIn`: SignIn) {
  public val `kind`: String get() = "signIn"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("kind", JsonPrimitive("signIn"))
    putPresent("signIn", this@MobileAuthCallbackResultCase1.`signIn`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileAuthCallbackResultCase1 {
      val values = value.jsonObject
      require(values["kind"] == JsonPrimitive("signIn"))
      return MobileAuthCallbackResultCase1(`signIn` = SignIn.fromJson((values["signIn"] ?: Undefined), runtime))
    }
  }
}

/**
 * The `SignInFuture` class holds the state of the current sign-in and provides helper methods to navigate and complete the sign-in process. It is used to manage the sign-in lifecycle, including the first and second factor verification, and the creation of a new session.
 */
public data class SignInState(public val `id`: String? = null, public val `supportedFirstFactors`: List<SignInFirstFactor>, public val `supportedSecondFactors`: List<SignInSecondFactor>, public val `status`: SignInStatus, public val `isTransferable`: Boolean, public val `existingSession`: SignInExistingSession? = null, public val `firstFactorVerification`: Verification, public val `secondFactorVerification`: Verification, public val `identifier`: String?, public val `createdSessionId`: String?, public val `userData`: UserData, public val `protectCheck`: ProtectCheck?, public val `canBeDiscarded`: Boolean, public val `emailCode`: SignInEmailCode, public val `emailLink`: SignInEmailLink, public val `phoneCode`: SignInPhoneCode, public val `resetPasswordEmailCode`: SignInResetPasswordEmailCode, public val `resetPasswordPhoneCode`: SignInResetPasswordPhoneCode, public val `mfa`: SignInMfa) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", this@SignInState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("supportedFirstFactors", JsonArray(this@SignInState.`supportedFirstFactors`.map { value -> value.toJson() }))
    putPresent("supportedSecondFactors", JsonArray(this@SignInState.`supportedSecondFactors`.map { value -> value.toJson() }))
    putPresent("status", this@SignInState.`status`.toJson())
    putPresent("isTransferable", JsonPrimitive(this@SignInState.`isTransferable`))
    putPresent("existingSession", this@SignInState.`existingSession`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("firstFactorVerification", this@SignInState.`firstFactorVerification`.toJson())
    putPresent("secondFactorVerification", this@SignInState.`secondFactorVerification`.toJson())
    putPresent("identifier", this@SignInState.`identifier`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("createdSessionId", this@SignInState.`createdSessionId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("userData", this@SignInState.`userData`.toJson())
    putPresent("protectCheck", this@SignInState.`protectCheck`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("canBeDiscarded", JsonPrimitive(this@SignInState.`canBeDiscarded`))
    putPresent("emailCode", this@SignInState.`emailCode`.toJson())
    putPresent("emailLink", this@SignInState.`emailLink`.toJson())
    putPresent("phoneCode", this@SignInState.`phoneCode`.toJson())
    putPresent("resetPasswordEmailCode", this@SignInState.`resetPasswordEmailCode`.toJson())
    putPresent("resetPasswordPhoneCode", this@SignInState.`resetPasswordPhoneCode`.toJson())
    putPresent("mfa", this@SignInState.`mfa`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInState {
      val values = value.jsonObject

      return SignInState(`id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() }, `supportedFirstFactors` = (values["supportedFirstFactors"] ?: Undefined).jsonArray.map { value -> SignInFirstFactor.fromJson(value, runtime) }, `supportedSecondFactors` = (values["supportedSecondFactors"] ?: Undefined).jsonArray.map { value -> SignInSecondFactor.fromJson(value, runtime) }, `status` = SignInStatus.fromJson((values["status"] ?: Undefined), runtime), `isTransferable` = (values["isTransferable"] ?: Undefined).requireBoolean(), `existingSession` = (values["existingSession"] ?: Undefined).decodeOptional { value -> SignInExistingSession.fromJson(value, runtime) }, `firstFactorVerification` = Verification.fromJson((values["firstFactorVerification"] ?: Undefined), runtime), `secondFactorVerification` = Verification.fromJson((values["secondFactorVerification"] ?: Undefined), runtime), `identifier` = (values["identifier"] ?: Undefined).decodeOptional { value -> value.requireString() }, `createdSessionId` = (values["createdSessionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `userData` = UserData.fromJson((values["userData"] ?: Undefined), runtime), `protectCheck` = (values["protectCheck"] ?: Undefined).decodeOptional { value -> ProtectCheck.fromJson(value, runtime) }, `canBeDiscarded` = (values["canBeDiscarded"] ?: Undefined).requireBoolean(), `emailCode` = SignInEmailCode.fromJson((values["emailCode"] ?: Undefined), runtime), `emailLink` = SignInEmailLink.fromJson((values["emailLink"] ?: Undefined), runtime), `phoneCode` = SignInPhoneCode.fromJson((values["phoneCode"] ?: Undefined), runtime), `resetPasswordEmailCode` = SignInResetPasswordEmailCode.fromJson((values["resetPasswordEmailCode"] ?: Undefined), runtime), `resetPasswordPhoneCode` = SignInResetPasswordPhoneCode.fromJson((values["resetPasswordPhoneCode"] ?: Undefined), runtime), `mfa` = SignInMfa.fromJson((values["mfa"] ?: Undefined), runtime))
    }
  }
}
public class SignIn(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SignInState get() = context.state(handle)
  public val changes: Flow<SignInState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String? get() = state.`id`
  public val `supportedFirstFactors`: List<SignInFirstFactor> get() = state.`supportedFirstFactors`
  public val `supportedSecondFactors`: List<SignInSecondFactor> get() = state.`supportedSecondFactors`
  public val `status`: SignInStatus get() = state.`status`
  public val `isTransferable`: Boolean get() = state.`isTransferable`
  public val `existingSession`: SignInExistingSession? get() = state.`existingSession`
  public val `firstFactorVerification`: Verification get() = state.`firstFactorVerification`
  public val `secondFactorVerification`: Verification get() = state.`secondFactorVerification`
  public val `identifier`: String? get() = state.`identifier`
  public val `createdSessionId`: String? get() = state.`createdSessionId`
  public val `userData`: UserData get() = state.`userData`
  public val `protectCheck`: ProtectCheck? get() = state.`protectCheck`
  public val `canBeDiscarded`: Boolean get() = state.`canBeDiscarded`
  public val `emailCode`: SignInEmailCode get() = state.`emailCode`
  public val `emailLink`: SignInEmailLink get() = state.`emailLink`
  public val `phoneCode`: SignInPhoneCode get() = state.`phoneCode`
  public val `resetPasswordEmailCode`: SignInResetPasswordEmailCode get() = state.`resetPasswordEmailCode`
  public val `resetPasswordPhoneCode`: SignInResetPasswordPhoneCode get() = state.`resetPasswordPhoneCode`
  public val `mfa`: SignInMfa get() = state.`mfa`
  override fun prepare(value: JsonElement): Any = SignInState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignIn = runtime.resource(ResourceHandle.fromReference(value)) as SignIn
  }
  /**
   * Creates a new `SignIn` instance initialized with the provided parameters. The instance maintains the sign-in lifecycle state through its `status` property, which updates as the authentication flow progresses. Once the sign-in process is complete, call the `signIn.finalize()` method to set the newly created session as the active session.
   *
   * What you must pass to `params` depends on which [sign-in options](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options) you have enabled in your app's settings in the Clerk Dashboard.
   *
   * You can complete the sign-in process in one step if you supply the required fields to `create()`. Otherwise, Clerk's sign-in process provides great flexibility and allows users to easily create multi-step sign-in flows.
   *
   * > [!IMPORTANT]
   * > The `signIn.create()` method is intended for advanced use cases. For most use cases, prefer the use of the factor-specific methods such as `signIn.password()`, `signIn.emailCode.sendCode()`, etc.
   */
  public suspend fun `create`(`params`: SignInCreateParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignIn.create", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Submits a password to sign-in.
   */
  public suspend fun `password`(`params`: SignInPasswordParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignIn.password", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Authenticate with a locally enrolled, device-held biometric key.
   */
  public suspend fun `biometricCredential`(`params`: SignInBiometricCredentialParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignIn.biometricCredential", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  public suspend fun `sso`(`params`: SignInSSOParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignIn.sso", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Performs a ticket-based sign-in.
   */
  public suspend fun `ticket`(`params`: SignInTicketParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignIn.ticket", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Initiates a passkey-based authentication flow, enabling users to authenticate using a previously registered passkey. When called without parameters, this method requires a prior call to `SignIn.create({ strategy: 'passkey' })` to initialize the sign-in context. This pattern is particularly useful in scenarios where the authentication strategy needs to be determined dynamically at runtime.
   */
  public suspend fun `passkey`(`params`: SignInPasskeyParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignIn.passkey", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Submits a proof token to resolve a pending protect check challenge. The response may contain another `protectCheck` (a chained challenge) which must be resolved iteratively.
   */
  public suspend fun `submitProtectCheck`(`params`: SignInSubmitProtectCheckParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignIn.submitProtectCheck", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Converts a sign-in with `status === 'complete'` into an active session. Will cause anything observing the session state (such as the [`useUser()`](https://clerk.com/docs/reference/hooks/use-user) hook) to update automatically.
   */
  public suspend fun `finalize`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignIn.finalize", listOf()) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Resets the current sign-in attempt by clearing all local state back to null. This is useful when you want to allow users to go back to the beginning of the sign-in flow (e.g., to change their identifier during verification).
   *
   * Unlike other methods, `reset()` does not trigger the `fetchStatus` to change to `'fetching'` and does not make any API calls - it only clears local state.
   */
  public suspend fun `reset`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignIn.reset", listOf()) { result ->
      runtime.checkErrorResult(result)
    }
  }
}

public sealed interface SignInFirstFactor {
  public data class Case1(val value: EmailCodeFactor) : SignInFirstFactor
  public data class Case2(val value: EmailLinkFactor) : SignInFirstFactor
  public data class Case3(val value: PhoneCodeFactor) : SignInFirstFactor
  public data class Case4(val value: Web3SignatureFactor) : SignInFirstFactor
  public data class Case5(val value: PasswordFactor) : SignInFirstFactor
  public data class Case6(val value: PasskeyFactor) : SignInFirstFactor
  public data class Case7(val value: OauthFactor) : SignInFirstFactor
  public data class Case8(val value: EnterpriseSSOFactor) : SignInFirstFactor
  public data class Case9(val value: ResetPasswordPhoneCodeFactor) : SignInFirstFactor
  public data class Case10(val value: ResetPasswordEmailCodeFactor) : SignInFirstFactor
  public val `strategy`: String get() = when (this) {
    is Case1 -> value.`strategy`
    is Case2 -> value.`strategy`
    is Case3 -> value.`strategy`
    is Case4 -> value.`strategy`.rawValue
    is Case5 -> value.`strategy`
    is Case6 -> value.`strategy`
    is Case7 -> value.`strategy`.rawValue
    is Case8 -> value.`strategy`
    is Case9 -> value.`strategy`
    is Case10 -> value.`strategy`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
    is Case4 -> JsonObject(mapOf("\$case" to JsonPrimitive(3), "value" to value.toJson()))
    is Case5 -> JsonObject(mapOf("\$case" to JsonPrimitive(4), "value" to value.toJson()))
    is Case6 -> JsonObject(mapOf("\$case" to JsonPrimitive(5), "value" to value.toJson()))
    is Case7 -> JsonObject(mapOf("\$case" to JsonPrimitive(6), "value" to value.toJson()))
    is Case8 -> JsonObject(mapOf("\$case" to JsonPrimitive(7), "value" to value.toJson()))
    is Case9 -> JsonObject(mapOf("\$case" to JsonPrimitive(8), "value" to value.toJson()))
    is Case10 -> JsonObject(mapOf("\$case" to JsonPrimitive(9), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInFirstFactor {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(EmailCodeFactor.fromJson(payload, runtime))
        1 -> Case2(EmailLinkFactor.fromJson(payload, runtime))
        2 -> Case3(PhoneCodeFactor.fromJson(payload, runtime))
        3 -> Case4(Web3SignatureFactor.fromJson(payload, runtime))
        4 -> Case5(PasswordFactor.fromJson(payload, runtime))
        5 -> Case6(PasskeyFactor.fromJson(payload, runtime))
        6 -> Case7(OauthFactor.fromJson(payload, runtime))
        7 -> Case8(EnterpriseSSOFactor.fromJson(payload, runtime))
        8 -> Case9(ResetPasswordPhoneCodeFactor.fromJson(payload, runtime))
        9 -> Case10(ResetPasswordEmailCodeFactor.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class EmailLinkFactor(public val `emailAddressId`: String, public val `safeIdentifier`: String, public val `primary`: Boolean? = null) {
  public val `strategy`: String get() = "email_link"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("email_link"))
    putPresent("emailAddressId", JsonPrimitive(this@EmailLinkFactor.`emailAddressId`))
    putPresent("safeIdentifier", JsonPrimitive(this@EmailLinkFactor.`safeIdentifier`))
    putPresent("primary", this@EmailLinkFactor.`primary`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): EmailLinkFactor {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("email_link"))
      return EmailLinkFactor(`emailAddressId` = (values["emailAddressId"] ?: Undefined).requireString(), `safeIdentifier` = (values["safeIdentifier"] ?: Undefined).requireString(), `primary` = (values["primary"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public data class Web3SignatureFactor(public val `strategy`: PrepareWeb3WalletVerificationParamsStrategy, public val `web3WalletId`: String, public val `primary`: Boolean? = null, public val `walletName`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", this@Web3SignatureFactor.`strategy`.toJson())
    putPresent("web3WalletId", JsonPrimitive(this@Web3SignatureFactor.`web3WalletId`))
    putPresent("primary", this@Web3SignatureFactor.`primary`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("walletName", this@Web3SignatureFactor.`walletName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): Web3SignatureFactor {
      val values = value.jsonObject

      return Web3SignatureFactor(`strategy` = PrepareWeb3WalletVerificationParamsStrategy.fromJson((values["strategy"] ?: Undefined), runtime), `web3WalletId` = (values["web3WalletId"] ?: Undefined).requireString(), `primary` = (values["primary"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `walletName` = (values["walletName"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class OauthFactor(public val `strategy`: OAuthStrategy) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", this@OauthFactor.`strategy`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): OauthFactor {
      val values = value.jsonObject

      return OauthFactor(`strategy` = OAuthStrategy.fromJson((values["strategy"] ?: Undefined), runtime))
    }
  }
}

public data class ResetPasswordPhoneCodeFactor(public val `phoneNumberId`: String, public val `safeIdentifier`: String, public val `primary`: Boolean? = null) {
  public val `strategy`: String get() = "reset_password_phone_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("reset_password_phone_code"))
    putPresent("phoneNumberId", JsonPrimitive(this@ResetPasswordPhoneCodeFactor.`phoneNumberId`))
    putPresent("safeIdentifier", JsonPrimitive(this@ResetPasswordPhoneCodeFactor.`safeIdentifier`))
    putPresent("primary", this@ResetPasswordPhoneCodeFactor.`primary`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ResetPasswordPhoneCodeFactor {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("reset_password_phone_code"))
      return ResetPasswordPhoneCodeFactor(`phoneNumberId` = (values["phoneNumberId"] ?: Undefined).requireString(), `safeIdentifier` = (values["safeIdentifier"] ?: Undefined).requireString(), `primary` = (values["primary"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public data class ResetPasswordEmailCodeFactor(public val `emailAddressId`: String, public val `safeIdentifier`: String, public val `primary`: Boolean? = null) {
  public val `strategy`: String get() = "reset_password_email_code"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive("reset_password_email_code"))
    putPresent("emailAddressId", JsonPrimitive(this@ResetPasswordEmailCodeFactor.`emailAddressId`))
    putPresent("safeIdentifier", JsonPrimitive(this@ResetPasswordEmailCodeFactor.`safeIdentifier`))
    putPresent("primary", this@ResetPasswordEmailCodeFactor.`primary`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ResetPasswordEmailCodeFactor {
      val values = value.jsonObject
      require(values["strategy"] == JsonPrimitive("reset_password_email_code"))
      return ResetPasswordEmailCodeFactor(`emailAddressId` = (values["emailAddressId"] ?: Undefined).requireString(), `safeIdentifier` = (values["safeIdentifier"] ?: Undefined).requireString(), `primary` = (values["primary"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public sealed interface SignInSecondFactor {
  public data class Case1(val value: EmailCodeFactor) : SignInSecondFactor
  public data class Case2(val value: EmailLinkFactor) : SignInSecondFactor
  public data class Case3(val value: PhoneCodeFactor) : SignInSecondFactor
  public data class Case4(val value: PasskeyFactor) : SignInSecondFactor
  public data class Case5(val value: TOTPFactor) : SignInSecondFactor
  public data class Case6(val value: BackupCodeFactor) : SignInSecondFactor
  public val `strategy`: String get() = when (this) {
    is Case1 -> value.`strategy`
    is Case2 -> value.`strategy`
    is Case3 -> value.`strategy`
    is Case4 -> value.`strategy`
    is Case5 -> value.`strategy`
    is Case6 -> value.`strategy`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
    is Case4 -> JsonObject(mapOf("\$case" to JsonPrimitive(3), "value" to value.toJson()))
    is Case5 -> JsonObject(mapOf("\$case" to JsonPrimitive(4), "value" to value.toJson()))
    is Case6 -> JsonObject(mapOf("\$case" to JsonPrimitive(5), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInSecondFactor {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(EmailCodeFactor.fromJson(payload, runtime))
        1 -> Case2(EmailLinkFactor.fromJson(payload, runtime))
        2 -> Case3(PhoneCodeFactor.fromJson(payload, runtime))
        3 -> Case4(PasskeyFactor.fromJson(payload, runtime))
        4 -> Case5(TOTPFactor.fromJson(payload, runtime))
        5 -> Case6(BackupCodeFactor.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public sealed class SignInStatus(public val rawValue: String) {
  public data object NeedsIdentifier : SignInStatus("needs_identifier")
  public data object NeedsFirstFactor : SignInStatus("needs_first_factor")
  public data object NeedsSecondFactor : SignInStatus("needs_second_factor")
  public data object NeedsClientTrust : SignInStatus("needs_client_trust")
  public data object NeedsNewPassword : SignInStatus("needs_new_password")
  public data object NeedsProtectCheck : SignInStatus("needs_protect_check")
  public data object Complete : SignInStatus("complete")
  public data class Unrecognized(val value: String) : SignInStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInStatus = when (val raw = value.requireString()) {
      "needs_identifier" -> NeedsIdentifier
      "needs_first_factor" -> NeedsFirstFactor
      "needs_second_factor" -> NeedsSecondFactor
      "needs_client_trust" -> NeedsClientTrust
      "needs_new_password" -> NeedsNewPassword
      "needs_protect_check" -> NeedsProtectCheck
      "complete" -> Complete
      else -> Unrecognized(raw)
    }
  }
}

public data class SignInExistingSession(public val `sessionId`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("sessionId", JsonPrimitive(this@SignInExistingSession.`sessionId`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInExistingSession {
      val values = value.jsonObject

      return SignInExistingSession(`sessionId` = (values["sessionId"] ?: Undefined).requireString())
    }
  }
}

public data class UserData(public val `firstName`: String? = null, public val `lastName`: String? = null, public val `imageUrl`: String? = null, public val `hasImage`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("firstName", this@UserData.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@UserData.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("imageUrl", this@UserData.`imageUrl`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("hasImage", this@UserData.`hasImage`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): UserData {
      val values = value.jsonObject

      return UserData(`firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `imageUrl` = (values["imageUrl"] ?: Undefined).decodeOptional { value -> value.requireString() }, `hasImage` = (values["hasImage"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

/**
 * A pending Clerk Protect challenge that must be completed before the current sign-in or sign-up attempt can continue.
 *
 * This resource is only returned when Protect mid-flow challenges are enabled for the instance. When present, load the challenge SDK from `sdkUrl`, initialize it with `token` and `uiHints`, and submit the proof token returned by the SDK with `submitProtectCheck()`.
 */
public data class ProtectCheck(public val `sdkUrl`: String, public val `expiresAt`: Double? = null, public val `uiHints`: Map<String, String>? = null) {
  public val `status`: String get() = "pending"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("status", JsonPrimitive("pending"))
    putPresent("sdkUrl", JsonPrimitive(this@ProtectCheck.`sdkUrl`))
    putPresent("expiresAt", this@ProtectCheck.`expiresAt`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("uiHints", this@ProtectCheck.`uiHints`?.let { value -> JsonObject(value.mapValues { (_, value) -> JsonPrimitive(value) }) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ProtectCheck {
      val values = value.jsonObject
      require(values["status"] == JsonPrimitive("pending"))
      return ProtectCheck(`sdkUrl` = (values["sdkUrl"] ?: Undefined).requireString(), `expiresAt` = (values["expiresAt"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `uiHints` = (values["uiHints"] ?: Undefined).decodeOptional { value -> value.jsonObject.mapValues { (_, value) -> value.requireString() } })
    }
  }
}

public data class SignInCreateParams(public val `identifier`: String? = null, public val `password`: String? = null, public val `strategy`: SignInCreateParamsStrategy? = null, public val `trustedDeviceId`: String? = null, public val `token`: String? = null, public val `redirectUrl`: String? = null, public val `actionCompleteRedirectUrl`: String? = null, public val `transfer`: Boolean? = null, public val `ticket`: String? = null, public val `signUpIfMissing`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("identifier", this@SignInCreateParams.`identifier`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("password", this@SignInCreateParams.`password`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("strategy", this@SignInCreateParams.`strategy`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("trustedDeviceId", this@SignInCreateParams.`trustedDeviceId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("token", this@SignInCreateParams.`token`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("redirectUrl", this@SignInCreateParams.`redirectUrl`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("actionCompleteRedirectUrl", this@SignInCreateParams.`actionCompleteRedirectUrl`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("transfer", this@SignInCreateParams.`transfer`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("ticket", this@SignInCreateParams.`ticket`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("signUpIfMissing", this@SignInCreateParams.`signUpIfMissing`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInCreateParams {
      val values = value.jsonObject

      return SignInCreateParams(`identifier` = (values["identifier"] ?: Undefined).decodeOptional { value -> value.requireString() }, `password` = (values["password"] ?: Undefined).decodeOptional { value -> value.requireString() }, `strategy` = (values["strategy"] ?: Undefined).decodeOptional { value -> SignInCreateParamsStrategy.fromJson(value, runtime) }, `trustedDeviceId` = (values["trustedDeviceId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `token` = (values["token"] ?: Undefined).decodeOptional { value -> value.requireString() }, `redirectUrl` = (values["redirectUrl"] ?: Undefined).decodeOptional { value -> value.requireString() }, `actionCompleteRedirectUrl` = (values["actionCompleteRedirectUrl"] ?: Undefined).decodeOptional { value -> value.requireString() }, `transfer` = (values["transfer"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `ticket` = (values["ticket"] ?: Undefined).decodeOptional { value -> value.requireString() }, `signUpIfMissing` = (values["signUpIfMissing"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public sealed class SignInCreateParamsStrategy(public val rawValue: String) {
  public data object OauthTokenApple : SignInCreateParamsStrategy("oauth_token_apple")
  public data object Passkey : SignInCreateParamsStrategy("passkey")
  public data object Ticket : SignInCreateParamsStrategy("ticket")
  public data object EnterpriseSso : SignInCreateParamsStrategy("enterprise_sso")
  public data object OauthFacebook : SignInCreateParamsStrategy("oauth_facebook")
  public data object OauthGoogle : SignInCreateParamsStrategy("oauth_google")
  public data object OauthHubspot : SignInCreateParamsStrategy("oauth_hubspot")
  public data object OauthGithub : SignInCreateParamsStrategy("oauth_github")
  public data object OauthTiktok : SignInCreateParamsStrategy("oauth_tiktok")
  public data object OauthGitlab : SignInCreateParamsStrategy("oauth_gitlab")
  public data object OauthDiscord : SignInCreateParamsStrategy("oauth_discord")
  public data object OauthTwitter : SignInCreateParamsStrategy("oauth_twitter")
  public data object OauthTwitch : SignInCreateParamsStrategy("oauth_twitch")
  public data object OauthLinkedin : SignInCreateParamsStrategy("oauth_linkedin")
  public data object OauthLinkedinOidc : SignInCreateParamsStrategy("oauth_linkedin_oidc")
  public data object OauthDropbox : SignInCreateParamsStrategy("oauth_dropbox")
  public data object OauthAtlassian : SignInCreateParamsStrategy("oauth_atlassian")
  public data object OauthBitbucket : SignInCreateParamsStrategy("oauth_bitbucket")
  public data object OauthMicrosoft : SignInCreateParamsStrategy("oauth_microsoft")
  public data object OauthNotion : SignInCreateParamsStrategy("oauth_notion")
  public data object OauthApple : SignInCreateParamsStrategy("oauth_apple")
  public data object OauthLine : SignInCreateParamsStrategy("oauth_line")
  public data object OauthInstagram : SignInCreateParamsStrategy("oauth_instagram")
  public data object OauthCoinbase : SignInCreateParamsStrategy("oauth_coinbase")
  public data object OauthSpotify : SignInCreateParamsStrategy("oauth_spotify")
  public data object OauthXero : SignInCreateParamsStrategy("oauth_xero")
  public data object OauthBox : SignInCreateParamsStrategy("oauth_box")
  public data object OauthSlack : SignInCreateParamsStrategy("oauth_slack")
  public data object OauthLinear : SignInCreateParamsStrategy("oauth_linear")
  public data object OauthX : SignInCreateParamsStrategy("oauth_x")
  public data object OauthEnstall : SignInCreateParamsStrategy("oauth_enstall")
  public data object OauthHuggingface : SignInCreateParamsStrategy("oauth_huggingface")
  public data object OauthVercel : SignInCreateParamsStrategy("oauth_vercel")
  public data object TrustedDevice : SignInCreateParamsStrategy("trusted_device")
  public data class Unrecognized(val value: String) : SignInCreateParamsStrategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInCreateParamsStrategy = when (val raw = value.requireString()) {
      "oauth_token_apple" -> OauthTokenApple
      "passkey" -> Passkey
      "ticket" -> Ticket
      "enterprise_sso" -> EnterpriseSso
      "oauth_facebook" -> OauthFacebook
      "oauth_google" -> OauthGoogle
      "oauth_hubspot" -> OauthHubspot
      "oauth_github" -> OauthGithub
      "oauth_tiktok" -> OauthTiktok
      "oauth_gitlab" -> OauthGitlab
      "oauth_discord" -> OauthDiscord
      "oauth_twitter" -> OauthTwitter
      "oauth_twitch" -> OauthTwitch
      "oauth_linkedin" -> OauthLinkedin
      "oauth_linkedin_oidc" -> OauthLinkedinOidc
      "oauth_dropbox" -> OauthDropbox
      "oauth_atlassian" -> OauthAtlassian
      "oauth_bitbucket" -> OauthBitbucket
      "oauth_microsoft" -> OauthMicrosoft
      "oauth_notion" -> OauthNotion
      "oauth_apple" -> OauthApple
      "oauth_line" -> OauthLine
      "oauth_instagram" -> OauthInstagram
      "oauth_coinbase" -> OauthCoinbase
      "oauth_spotify" -> OauthSpotify
      "oauth_xero" -> OauthXero
      "oauth_box" -> OauthBox
      "oauth_slack" -> OauthSlack
      "oauth_linear" -> OauthLinear
      "oauth_x" -> OauthX
      "oauth_enstall" -> OauthEnstall
      "oauth_huggingface" -> OauthHuggingface
      "oauth_vercel" -> OauthVercel
      "trusted_device" -> TrustedDevice
      else -> Unrecognized(raw)
    }
  }
}

/**
 * Parameters for submitting a password to sign-in.
 */
public sealed interface SignInPasswordParams {
  public data class Case1(val value: SignInPasswordParamsCase1) : SignInPasswordParams
  public data class Case2(val value: SignInPasswordParamsCase2) : SignInPasswordParams
  public data class Case3(val value: SignInPasswordParamsCase3) : SignInPasswordParams
  public data class Case4(val value: SignInPasswordParamsCase4) : SignInPasswordParams
  public val `password`: String get() = when (this) {
    is Case1 -> value.`password`
    is Case2 -> value.`password`
    is Case3 -> value.`password`
    is Case4 -> value.`password`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
    is Case4 -> JsonObject(mapOf("\$case" to JsonPrimitive(3), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPasswordParams {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(SignInPasswordParamsCase1.fromJson(payload, runtime))
        1 -> Case2(SignInPasswordParamsCase2.fromJson(payload, runtime))
        2 -> Case3(SignInPasswordParamsCase3.fromJson(payload, runtime))
        3 -> Case4(SignInPasswordParamsCase4.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class SignInPasswordParamsCase1(public val `password`: String, public val `identifier`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("password", JsonPrimitive(this@SignInPasswordParamsCase1.`password`))
    putPresent("identifier", JsonPrimitive(this@SignInPasswordParamsCase1.`identifier`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPasswordParamsCase1 {
      val values = value.jsonObject

      return SignInPasswordParamsCase1(`password` = (values["password"] ?: Undefined).requireString(), `identifier` = (values["identifier"] ?: Undefined).requireString())
    }
  }
}

public data class SignInPasswordParamsCase2(public val `password`: String, public val `emailAddress`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("password", JsonPrimitive(this@SignInPasswordParamsCase2.`password`))
    putPresent("emailAddress", JsonPrimitive(this@SignInPasswordParamsCase2.`emailAddress`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPasswordParamsCase2 {
      val values = value.jsonObject

      return SignInPasswordParamsCase2(`password` = (values["password"] ?: Undefined).requireString(), `emailAddress` = (values["emailAddress"] ?: Undefined).requireString())
    }
  }
}

public data class SignInPasswordParamsCase3(public val `password`: String, public val `phoneNumber`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("password", JsonPrimitive(this@SignInPasswordParamsCase3.`password`))
    putPresent("phoneNumber", JsonPrimitive(this@SignInPasswordParamsCase3.`phoneNumber`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPasswordParamsCase3 {
      val values = value.jsonObject

      return SignInPasswordParamsCase3(`password` = (values["password"] ?: Undefined).requireString(), `phoneNumber` = (values["phoneNumber"] ?: Undefined).requireString())
    }
  }
}

public data class SignInPasswordParamsCase4(public val `password`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("password", JsonPrimitive(this@SignInPasswordParamsCase4.`password`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPasswordParamsCase4 {
      val values = value.jsonObject

      return SignInPasswordParamsCase4(`password` = (values["password"] ?: Undefined).requireString())
    }
  }
}

public class SignInEmailCodeState() {
  public fun toJson(): JsonElement = buildJsonObject {

  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailCodeState {
      val values = value.jsonObject

      return SignInEmailCodeState()
    }
  }
}
public class SignInEmailCode(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SignInEmailCodeState get() = context.state(handle)
  public val changes: Flow<SignInEmailCodeState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)

  override fun prepare(value: JsonElement): Any = SignInEmailCodeState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailCode = runtime.resource(ResourceHandle.fromReference(value)) as SignInEmailCode
  }
  /**
   * Sends an email code to sign-in.
   */
  public suspend fun `sendCode`(`params`: SignInEmailCodeSendParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInEmailCode.sendCode", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Verifies a code sent with the [`emailCode.sendCode()`](https://clerk.com/docs/reference/objects/sign-in-future#email-code-send-code) method.
   */
  public suspend fun `verifyCode`(`params`: SignInEmailCodeVerifyParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInEmailCode.verifyCode", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
}

/**
 * Parameters for sending a sign-in email verification code.
 */
public sealed interface SignInEmailCodeSendParams {
  public data class Case1(val value: SignInEmailCodeSendCodeParamsCase1) : SignInEmailCodeSendParams
  public data class Case2(val value: SignInEmailCodeSendCodeParamsCase2) : SignInEmailCodeSendParams
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailCodeSendParams {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(SignInEmailCodeSendCodeParamsCase1.fromJson(payload, runtime))
        1 -> Case2(SignInEmailCodeSendCodeParamsCase2.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class SignInEmailCodeSendCodeParamsCase1(public val `emailAddress`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddress", this@SignInEmailCodeSendCodeParamsCase1.`emailAddress`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailCodeSendCodeParamsCase1 {
      val values = value.jsonObject

      return SignInEmailCodeSendCodeParamsCase1(`emailAddress` = (values["emailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignInEmailCodeSendCodeParamsCase2(public val `emailAddressId`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddressId", this@SignInEmailCodeSendCodeParamsCase2.`emailAddressId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailCodeSendCodeParamsCase2 {
      val values = value.jsonObject

      return SignInEmailCodeSendCodeParamsCase2(`emailAddressId` = (values["emailAddressId"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignInEmailCodeVerifyParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@SignInEmailCodeVerifyParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailCodeVerifyParams {
      val values = value.jsonObject

      return SignInEmailCodeVerifyParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class SignInEmailLinkState(public val `verification`: SignInEmailLinkVerification?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("verification", this@SignInEmailLinkState.`verification`?.let { value -> value.toJson() } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailLinkState {
      val values = value.jsonObject

      return SignInEmailLinkState(`verification` = (values["verification"] ?: Undefined).decodeOptional { value -> SignInEmailLinkVerification.fromJson(value, runtime) })
    }
  }
}
public class SignInEmailLink(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SignInEmailLinkState get() = context.state(handle)
  public val changes: Flow<SignInEmailLinkState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `verification`: SignInEmailLinkVerification? get() = state.`verification`
  override fun prepare(value: JsonElement): Any = SignInEmailLinkState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailLink = runtime.resource(ResourceHandle.fromReference(value)) as SignInEmailLink
  }
  /**
   * Sends an email link to sign in with.
   */
  public suspend fun `sendLink`(`params`: SignInEmailLinkSendParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInEmailLink.sendLink", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Waits for email link verification to complete or expire.
   */
  public suspend fun `waitForVerification`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInEmailLink.waitForVerification", listOf()) { result ->
      runtime.checkErrorResult(result)
    }
  }
}

/**
 * Parameters for sending a sign-in email link.
 */
public sealed interface SignInEmailLinkSendParams {
  public data class Case1(val value: SignInEmailLinkSendLinkParamsCase1) : SignInEmailLinkSendParams
  public data class Case2(val value: SignInEmailLinkSendLinkParamsCase2) : SignInEmailLinkSendParams
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailLinkSendParams {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(SignInEmailLinkSendLinkParamsCase1.fromJson(payload, runtime))
        1 -> Case2(SignInEmailLinkSendLinkParamsCase2.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class SignInEmailLinkSendLinkParamsCase1(public val `emailAddress`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddress", this@SignInEmailLinkSendLinkParamsCase1.`emailAddress`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailLinkSendLinkParamsCase1 {
      val values = value.jsonObject

      return SignInEmailLinkSendLinkParamsCase1(`emailAddress` = (values["emailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignInEmailLinkSendLinkParamsCase2(public val `emailAddressId`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddressId", this@SignInEmailLinkSendLinkParamsCase2.`emailAddressId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailLinkSendLinkParamsCase2 {
      val values = value.jsonObject

      return SignInEmailLinkSendLinkParamsCase2(`emailAddressId` = (values["emailAddressId"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignInEmailLinkVerification(public val `status`: SignInEmailLinkVerificationStatus, public val `createdSessionId`: String, public val `verifiedFromTheSameClient`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("status", this@SignInEmailLinkVerification.`status`.toJson())
    putPresent("createdSessionId", JsonPrimitive(this@SignInEmailLinkVerification.`createdSessionId`))
    putPresent("verifiedFromTheSameClient", JsonPrimitive(this@SignInEmailLinkVerification.`verifiedFromTheSameClient`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailLinkVerification {
      val values = value.jsonObject

      return SignInEmailLinkVerification(`status` = SignInEmailLinkVerificationStatus.fromJson((values["status"] ?: Undefined), runtime), `createdSessionId` = (values["createdSessionId"] ?: Undefined).requireString(), `verifiedFromTheSameClient` = (values["verifiedFromTheSameClient"] ?: Undefined).requireBoolean())
    }
  }
}

public sealed class SignInEmailLinkVerificationStatus(public val rawValue: String) {
  public data object Verified : SignInEmailLinkVerificationStatus("verified")
  public data object Failed : SignInEmailLinkVerificationStatus("failed")
  public data object Expired : SignInEmailLinkVerificationStatus("expired")
  public data object ClientMismatch : SignInEmailLinkVerificationStatus("client_mismatch")
  public data class Unrecognized(val value: String) : SignInEmailLinkVerificationStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInEmailLinkVerificationStatus = when (val raw = value.requireString()) {
      "verified" -> Verified
      "failed" -> Failed
      "expired" -> Expired
      "client_mismatch" -> ClientMismatch
      else -> Unrecognized(raw)
    }
  }
}

public class SignInPhoneCodeState() {
  public fun toJson(): JsonElement = buildJsonObject {

  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPhoneCodeState {
      val values = value.jsonObject

      return SignInPhoneCodeState()
    }
  }
}
public class SignInPhoneCode(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SignInPhoneCodeState get() = context.state(handle)
  public val changes: Flow<SignInPhoneCodeState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)

  override fun prepare(value: JsonElement): Any = SignInPhoneCodeState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPhoneCode = runtime.resource(ResourceHandle.fromReference(value)) as SignInPhoneCode
  }
  /**
   * Sends a phone code to sign in with.
   */
  public suspend fun `sendCode`(`params`: SignInPhoneCodeSendParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInPhoneCode.sendCode", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Verifies a code sent with the [`phoneCode.sendCode()`](https://clerk.com/docs/reference/objects/sign-in-future#phone-code-send-code) method.
   */
  public suspend fun `verifyCode`(`params`: SignInPhoneCodeVerifyParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInPhoneCode.verifyCode", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
}

public sealed interface SignInPhoneCodeSendParams {
  public data class Case1(val value: SignInPhoneCodeSendCodeParamsCase1) : SignInPhoneCodeSendParams
  public data class Case2(val value: SignInPhoneCodeSendCodeParamsCase2) : SignInPhoneCodeSendParams
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPhoneCodeSendParams {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(SignInPhoneCodeSendCodeParamsCase1.fromJson(payload, runtime))
        1 -> Case2(SignInPhoneCodeSendCodeParamsCase2.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class SignInPhoneCodeSendCodeParamsCase1(public val `channel`: PhoneCodeChannel? = null, public val `phoneNumber`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("channel", this@SignInPhoneCodeSendCodeParamsCase1.`channel`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("phoneNumber", this@SignInPhoneCodeSendCodeParamsCase1.`phoneNumber`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPhoneCodeSendCodeParamsCase1 {
      val values = value.jsonObject

      return SignInPhoneCodeSendCodeParamsCase1(`channel` = (values["channel"] ?: Undefined).decodeOptional { value -> PhoneCodeChannel.fromJson(value, runtime) }, `phoneNumber` = (values["phoneNumber"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignInPhoneCodeSendCodeParamsCase2(public val `channel`: PhoneCodeChannel? = null, public val `phoneNumberId`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("channel", this@SignInPhoneCodeSendCodeParamsCase2.`channel`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("phoneNumberId", JsonPrimitive(this@SignInPhoneCodeSendCodeParamsCase2.`phoneNumberId`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPhoneCodeSendCodeParamsCase2 {
      val values = value.jsonObject

      return SignInPhoneCodeSendCodeParamsCase2(`channel` = (values["channel"] ?: Undefined).decodeOptional { value -> PhoneCodeChannel.fromJson(value, runtime) }, `phoneNumberId` = (values["phoneNumberId"] ?: Undefined).requireString())
    }
  }
}

public data class SignInPhoneCodeVerifyParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@SignInPhoneCodeVerifyParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPhoneCodeVerifyParams {
      val values = value.jsonObject

      return SignInPhoneCodeVerifyParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public class SignInResetPasswordEmailCodeState() {
  public fun toJson(): JsonElement = buildJsonObject {

  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInResetPasswordEmailCodeState {
      val values = value.jsonObject

      return SignInResetPasswordEmailCodeState()
    }
  }
}
public class SignInResetPasswordEmailCode(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SignInResetPasswordEmailCodeState get() = context.state(handle)
  public val changes: Flow<SignInResetPasswordEmailCodeState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)

  override fun prepare(value: JsonElement): Any = SignInResetPasswordEmailCodeState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInResetPasswordEmailCode = runtime.resource(ResourceHandle.fromReference(value)) as SignInResetPasswordEmailCode
  }
  /**
   * Sends a password reset code to the selected email address, or the first supported email factor.
   */
  public suspend fun `sendCode`(`params`: SignInResetPasswordEmailCodeSendParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInResetPasswordEmailCode.sendCode", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Verifies a password reset code sent with the [`resetPasswordEmailCode.sendCode()`](https://clerk.com/docs/reference/objects/sign-in-future#reset-password-email-code-send-code) method. Will cause `signIn.status` to become `'needs_new_password'`. This is when you will call the [`resetPasswordEmailCode.submitPassword()`](https://clerk.com/docs/reference/objects/sign-in-future#reset-password-email-code-submit-password) method to complete the password reset flow.
   */
  public suspend fun `verifyCode`(`params`: SignInEmailCodeVerifyParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInResetPasswordEmailCode.verifyCode", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Submits a new password and moves the sign-in status to `'complete'`.
   */
  public suspend fun `submitPassword`(`params`: SignInResetPasswordSubmitParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInResetPasswordEmailCode.submitPassword", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
}

public data class SignInResetPasswordEmailCodeSendParams(public val `emailAddressId`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddressId", this@SignInResetPasswordEmailCodeSendParams.`emailAddressId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInResetPasswordEmailCodeSendParams {
      val values = value.jsonObject

      return SignInResetPasswordEmailCodeSendParams(`emailAddressId` = (values["emailAddressId"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignInResetPasswordSubmitParams(public val `password`: String, public val `signOutOfOtherSessions`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("password", JsonPrimitive(this@SignInResetPasswordSubmitParams.`password`))
    putPresent("signOutOfOtherSessions", this@SignInResetPasswordSubmitParams.`signOutOfOtherSessions`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInResetPasswordSubmitParams {
      val values = value.jsonObject

      return SignInResetPasswordSubmitParams(`password` = (values["password"] ?: Undefined).requireString(), `signOutOfOtherSessions` = (values["signOutOfOtherSessions"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public class SignInResetPasswordPhoneCodeState() {
  public fun toJson(): JsonElement = buildJsonObject {

  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInResetPasswordPhoneCodeState {
      val values = value.jsonObject

      return SignInResetPasswordPhoneCodeState()
    }
  }
}
public class SignInResetPasswordPhoneCode(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SignInResetPasswordPhoneCodeState get() = context.state(handle)
  public val changes: Flow<SignInResetPasswordPhoneCodeState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)

  override fun prepare(value: JsonElement): Any = SignInResetPasswordPhoneCodeState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInResetPasswordPhoneCode = runtime.resource(ResourceHandle.fromReference(value)) as SignInResetPasswordPhoneCode
  }
  /**
   * Sends a password reset code to the selected phone number, or the first supported phone factor.
   */
  public suspend fun `sendCode`(`params`: SignInResetPasswordPhoneCodeSendParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInResetPasswordPhoneCode.sendCode", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Verifies a password reset code sent with the [`resetPasswordPhoneCode.sendCode()`](https://clerk.com/docs/reference/objects/sign-in-future#reset-password-phone-code-send-code) method. Will cause `signIn.status` to become `'needs_new_password'`. This is when you will call the [`resetPasswordPhoneCode.submitPassword()`](https://clerk.com/docs/reference/objects/sign-in-future#reset-password-phone-code-submit-password) method to complete the password reset flow.
   */
  public suspend fun `verifyCode`(`params`: SignInResetPasswordPhoneCodeVerifyParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInResetPasswordPhoneCode.verifyCode", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Submits a new password and moves the sign-in status to `'complete'`.
   */
  public suspend fun `submitPassword`(`params`: SignInResetPasswordSubmitParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInResetPasswordPhoneCode.submitPassword", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
}

public data class SignInResetPasswordPhoneCodeSendParams(public val `phoneNumberId`: String? = null, public val `phoneNumber`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("phoneNumberId", this@SignInResetPasswordPhoneCodeSendParams.`phoneNumberId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("phoneNumber", this@SignInResetPasswordPhoneCodeSendParams.`phoneNumber`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInResetPasswordPhoneCodeSendParams {
      val values = value.jsonObject

      return SignInResetPasswordPhoneCodeSendParams(`phoneNumberId` = (values["phoneNumberId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `phoneNumber` = (values["phoneNumber"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignInResetPasswordPhoneCodeVerifyParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@SignInResetPasswordPhoneCodeVerifyParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInResetPasswordPhoneCodeVerifyParams {
      val values = value.jsonObject

      return SignInResetPasswordPhoneCodeVerifyParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class SignInBiometricCredentialParams(public val `id`: String? = null, public val `identifierHint`: String? = null, public val `reason`: String? = null, public val `promptSubtitle`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", this@SignInBiometricCredentialParams.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("identifierHint", this@SignInBiometricCredentialParams.`identifierHint`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("reason", this@SignInBiometricCredentialParams.`reason`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("promptSubtitle", this@SignInBiometricCredentialParams.`promptSubtitle`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInBiometricCredentialParams {
      val values = value.jsonObject

      return SignInBiometricCredentialParams(`id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() }, `identifierHint` = (values["identifierHint"] ?: Undefined).decodeOptional { value -> value.requireString() }, `reason` = (values["reason"] ?: Undefined).decodeOptional { value -> value.requireString() }, `promptSubtitle` = (values["promptSubtitle"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignInSSOParams(public val `strategy`: SignInSSOParamsStrategy, public val `oidcPrompt`: String? = null, public val `enterpriseConnectionId`: String? = null, public val `identifier`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", this@SignInSSOParams.`strategy`.toJson())
    putPresent("oidcPrompt", this@SignInSSOParams.`oidcPrompt`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("enterpriseConnectionId", this@SignInSSOParams.`enterpriseConnectionId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("identifier", this@SignInSSOParams.`identifier`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInSSOParams {
      val values = value.jsonObject

      return SignInSSOParams(`strategy` = SignInSSOParamsStrategy.fromJson((values["strategy"] ?: Undefined), runtime), `oidcPrompt` = (values["oidcPrompt"] ?: Undefined).decodeOptional { value -> value.requireString() }, `enterpriseConnectionId` = (values["enterpriseConnectionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `identifier` = (values["identifier"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public sealed class SignInSSOParamsStrategy(public val rawValue: String) {
  public data object OauthTokenApple : SignInSSOParamsStrategy("oauth_token_apple")
  public data object EnterpriseSso : SignInSSOParamsStrategy("enterprise_sso")
  public data object OauthFacebook : SignInSSOParamsStrategy("oauth_facebook")
  public data object OauthGoogle : SignInSSOParamsStrategy("oauth_google")
  public data object OauthHubspot : SignInSSOParamsStrategy("oauth_hubspot")
  public data object OauthGithub : SignInSSOParamsStrategy("oauth_github")
  public data object OauthTiktok : SignInSSOParamsStrategy("oauth_tiktok")
  public data object OauthGitlab : SignInSSOParamsStrategy("oauth_gitlab")
  public data object OauthDiscord : SignInSSOParamsStrategy("oauth_discord")
  public data object OauthTwitter : SignInSSOParamsStrategy("oauth_twitter")
  public data object OauthTwitch : SignInSSOParamsStrategy("oauth_twitch")
  public data object OauthLinkedin : SignInSSOParamsStrategy("oauth_linkedin")
  public data object OauthLinkedinOidc : SignInSSOParamsStrategy("oauth_linkedin_oidc")
  public data object OauthDropbox : SignInSSOParamsStrategy("oauth_dropbox")
  public data object OauthAtlassian : SignInSSOParamsStrategy("oauth_atlassian")
  public data object OauthBitbucket : SignInSSOParamsStrategy("oauth_bitbucket")
  public data object OauthMicrosoft : SignInSSOParamsStrategy("oauth_microsoft")
  public data object OauthNotion : SignInSSOParamsStrategy("oauth_notion")
  public data object OauthApple : SignInSSOParamsStrategy("oauth_apple")
  public data object OauthLine : SignInSSOParamsStrategy("oauth_line")
  public data object OauthInstagram : SignInSSOParamsStrategy("oauth_instagram")
  public data object OauthCoinbase : SignInSSOParamsStrategy("oauth_coinbase")
  public data object OauthSpotify : SignInSSOParamsStrategy("oauth_spotify")
  public data object OauthXero : SignInSSOParamsStrategy("oauth_xero")
  public data object OauthBox : SignInSSOParamsStrategy("oauth_box")
  public data object OauthSlack : SignInSSOParamsStrategy("oauth_slack")
  public data object OauthLinear : SignInSSOParamsStrategy("oauth_linear")
  public data object OauthX : SignInSSOParamsStrategy("oauth_x")
  public data object OauthEnstall : SignInSSOParamsStrategy("oauth_enstall")
  public data object OauthHuggingface : SignInSSOParamsStrategy("oauth_huggingface")
  public data object OauthVercel : SignInSSOParamsStrategy("oauth_vercel")
  public data class Unrecognized(val value: String) : SignInSSOParamsStrategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInSSOParamsStrategy = when (val raw = value.requireString()) {
      "oauth_token_apple" -> OauthTokenApple
      "enterprise_sso" -> EnterpriseSso
      "oauth_facebook" -> OauthFacebook
      "oauth_google" -> OauthGoogle
      "oauth_hubspot" -> OauthHubspot
      "oauth_github" -> OauthGithub
      "oauth_tiktok" -> OauthTiktok
      "oauth_gitlab" -> OauthGitlab
      "oauth_discord" -> OauthDiscord
      "oauth_twitter" -> OauthTwitter
      "oauth_twitch" -> OauthTwitch
      "oauth_linkedin" -> OauthLinkedin
      "oauth_linkedin_oidc" -> OauthLinkedinOidc
      "oauth_dropbox" -> OauthDropbox
      "oauth_atlassian" -> OauthAtlassian
      "oauth_bitbucket" -> OauthBitbucket
      "oauth_microsoft" -> OauthMicrosoft
      "oauth_notion" -> OauthNotion
      "oauth_apple" -> OauthApple
      "oauth_line" -> OauthLine
      "oauth_instagram" -> OauthInstagram
      "oauth_coinbase" -> OauthCoinbase
      "oauth_spotify" -> OauthSpotify
      "oauth_xero" -> OauthXero
      "oauth_box" -> OauthBox
      "oauth_slack" -> OauthSlack
      "oauth_linear" -> OauthLinear
      "oauth_x" -> OauthX
      "oauth_enstall" -> OauthEnstall
      "oauth_huggingface" -> OauthHuggingface
      "oauth_vercel" -> OauthVercel
      else -> Unrecognized(raw)
    }
  }
}

public class SignInMfaState() {
  public fun toJson(): JsonElement = buildJsonObject {

  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInMfaState {
      val values = value.jsonObject

      return SignInMfaState()
    }
  }
}
public class SignInMfa(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SignInMfaState get() = context.state(handle)
  public val changes: Flow<SignInMfaState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)

  override fun prepare(value: JsonElement): Any = SignInMfaState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInMfa = runtime.resource(ResourceHandle.fromReference(value)) as SignInMfa
  }
  /**
   * Sends a phone code to sign in with as a second factor.
   */
  public suspend fun `sendPhoneCode`(`params`: SignInMFAPhoneCodeSendParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInMfa.sendPhoneCode", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Verifies a phone code sent with the [`mfa.sendPhoneCode()`](https://clerk.com/docs/reference/objects/sign-in-future#mfa-send-phone-code) method.
   */
  public suspend fun `verifyPhoneCode`(`params`: SignInMFAPhoneCodeVerifyParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInMfa.verifyPhoneCode", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Sends an email code to sign in with as a second factor.
   */
  public suspend fun `sendEmailCode`(`params`: SignInMFAEmailCodeSendParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInMfa.sendEmailCode", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Verifies an email code sent with the [`mfa.sendEmailCode()`](https://clerk.com/docs/reference/objects/sign-in-future#mfa-send-email-code) method.
   */
  public suspend fun `verifyEmailCode`(`params`: SignInMFAEmailCodeVerifyParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInMfa.verifyEmailCode", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Verifies an authenticator app (TOTP) code to sign in with as a second factor.
   */
  public suspend fun `verifyTOTP`(`params`: SignInTOTPVerifyParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInMfa.verifyTOTP", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Verifies a backup code to sign in with as a second factor.
   */
  public suspend fun `verifyBackupCode`(`params`: SignInBackupCodeVerifyParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignInMfa.verifyBackupCode", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
}

public data class SignInMFAPhoneCodeSendParams(public val `phoneNumberId`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("phoneNumberId", this@SignInMFAPhoneCodeSendParams.`phoneNumberId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInMFAPhoneCodeSendParams {
      val values = value.jsonObject

      return SignInMFAPhoneCodeSendParams(`phoneNumberId` = (values["phoneNumberId"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignInMFAPhoneCodeVerifyParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@SignInMFAPhoneCodeVerifyParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInMFAPhoneCodeVerifyParams {
      val values = value.jsonObject

      return SignInMFAPhoneCodeVerifyParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class SignInMFAEmailCodeSendParams(public val `emailAddressId`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddressId", this@SignInMFAEmailCodeSendParams.`emailAddressId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInMFAEmailCodeSendParams {
      val values = value.jsonObject

      return SignInMFAEmailCodeSendParams(`emailAddressId` = (values["emailAddressId"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignInMFAEmailCodeVerifyParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@SignInMFAEmailCodeVerifyParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInMFAEmailCodeVerifyParams {
      val values = value.jsonObject

      return SignInMFAEmailCodeVerifyParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class SignInTOTPVerifyParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@SignInTOTPVerifyParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInTOTPVerifyParams {
      val values = value.jsonObject

      return SignInTOTPVerifyParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class SignInBackupCodeVerifyParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@SignInBackupCodeVerifyParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInBackupCodeVerifyParams {
      val values = value.jsonObject

      return SignInBackupCodeVerifyParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public data class SignInTicketParams(public val `ticket`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("ticket", JsonPrimitive(this@SignInTicketParams.`ticket`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInTicketParams {
      val values = value.jsonObject

      return SignInTicketParams(`ticket` = (values["ticket"] ?: Undefined).requireString())
    }
  }
}

public data class SignInPasskeyParams(public val `flow`: SignInPasskeyParamsFlow? = null, public val `preferImmediatelyAvailableCredentials`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("flow", this@SignInPasskeyParams.`flow`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("preferImmediatelyAvailableCredentials", this@SignInPasskeyParams.`preferImmediatelyAvailableCredentials`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPasskeyParams {
      val values = value.jsonObject

      return SignInPasskeyParams(`flow` = (values["flow"] ?: Undefined).decodeOptional { value -> SignInPasskeyParamsFlow.fromJson(value, runtime) }, `preferImmediatelyAvailableCredentials` = (values["preferImmediatelyAvailableCredentials"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public sealed class SignInPasskeyParamsFlow(public val rawValue: String) {
  public data object Autofill : SignInPasskeyParamsFlow("autofill")
  public data object Discoverable : SignInPasskeyParamsFlow("discoverable")
  public data class Unrecognized(val value: String) : SignInPasskeyParamsFlow(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInPasskeyParamsFlow = when (val raw = value.requireString()) {
      "autofill" -> Autofill
      "discoverable" -> Discoverable
      else -> Unrecognized(raw)
    }
  }
}

public data class SignInSubmitProtectCheckParams(public val `proofToken`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("proofToken", JsonPrimitive(this@SignInSubmitProtectCheckParams.`proofToken`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignInSubmitProtectCheckParams {
      val values = value.jsonObject

      return SignInSubmitProtectCheckParams(`proofToken` = (values["proofToken"] ?: Undefined).requireString())
    }
  }
}

public data class MobileAuthCallbackResultCase2(public val `signUp`: SignUp) {
  public val `kind`: String get() = "signUp"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("kind", JsonPrimitive("signUp"))
    putPresent("signUp", this@MobileAuthCallbackResultCase2.`signUp`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileAuthCallbackResultCase2 {
      val values = value.jsonObject
      require(values["kind"] == JsonPrimitive("signUp"))
      return MobileAuthCallbackResultCase2(`signUp` = SignUp.fromJson((values["signUp"] ?: Undefined), runtime))
    }
  }
}

/**
 * The `SignUpFuture` class holds the state of the current sign-up attempt and provides methods to drive custom sign-up flows, including email/phone verification, password, SSO, ticket-based, and Web3-based account creation.
 */
public data class SignUpState(public val `id`: String? = null, public val `status`: SignUpStatus, public val `requiredFields`: List<SignUpField>, public val `optionalFields`: List<SignUpField>, public val `missingFields`: List<SignUpField>, public val `unverifiedFields`: List<SignUpIdentificationField>, public val `isTransferable`: Boolean, public val `existingSession`: SignUpExistingSession? = null, public val `username`: String?, public val `firstName`: String?, public val `lastName`: String?, public val `emailAddress`: String?, public val `phoneNumber`: String?, public val `web3Wallet`: String?, public val `hasPassword`: Boolean, public val `unsafeMetadata`: JsonObject, public val `createdSessionId`: String?, public val `createdUserId`: String?, public val `abandonAt`: Double?, public val `legalAcceptedAt`: Double?, public val `locale`: String?, public val `protectCheck`: ProtectCheck?, public val `canBeDiscarded`: Boolean, public val `verifications`: SignUpVerifications) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("id", this@SignUpState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("status", this@SignUpState.`status`.toJson())
    putPresent("requiredFields", JsonArray(this@SignUpState.`requiredFields`.map { value -> value.toJson() }))
    putPresent("optionalFields", JsonArray(this@SignUpState.`optionalFields`.map { value -> value.toJson() }))
    putPresent("missingFields", JsonArray(this@SignUpState.`missingFields`.map { value -> value.toJson() }))
    putPresent("unverifiedFields", JsonArray(this@SignUpState.`unverifiedFields`.map { value -> value.toJson() }))
    putPresent("isTransferable", JsonPrimitive(this@SignUpState.`isTransferable`))
    putPresent("existingSession", this@SignUpState.`existingSession`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("username", this@SignUpState.`username`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("firstName", this@SignUpState.`firstName`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("lastName", this@SignUpState.`lastName`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("emailAddress", this@SignUpState.`emailAddress`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("phoneNumber", this@SignUpState.`phoneNumber`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("web3Wallet", this@SignUpState.`web3Wallet`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("hasPassword", JsonPrimitive(this@SignUpState.`hasPassword`))
    putPresent("unsafeMetadata", this@SignUpState.`unsafeMetadata`)
    putPresent("createdSessionId", this@SignUpState.`createdSessionId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("createdUserId", this@SignUpState.`createdUserId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("abandonAt", this@SignUpState.`abandonAt`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("legalAcceptedAt", this@SignUpState.`legalAcceptedAt`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("locale", this@SignUpState.`locale`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("protectCheck", this@SignUpState.`protectCheck`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("canBeDiscarded", JsonPrimitive(this@SignUpState.`canBeDiscarded`))
    putPresent("verifications", this@SignUpState.`verifications`.toJson())
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpState {
      val values = value.jsonObject

      return SignUpState(`id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() }, `status` = SignUpStatus.fromJson((values["status"] ?: Undefined), runtime), `requiredFields` = (values["requiredFields"] ?: Undefined).jsonArray.map { value -> SignUpField.fromJson(value, runtime) }, `optionalFields` = (values["optionalFields"] ?: Undefined).jsonArray.map { value -> SignUpField.fromJson(value, runtime) }, `missingFields` = (values["missingFields"] ?: Undefined).jsonArray.map { value -> SignUpField.fromJson(value, runtime) }, `unverifiedFields` = (values["unverifiedFields"] ?: Undefined).jsonArray.map { value -> SignUpIdentificationField.fromJson(value, runtime) }, `isTransferable` = (values["isTransferable"] ?: Undefined).requireBoolean(), `existingSession` = (values["existingSession"] ?: Undefined).decodeOptional { value -> SignUpExistingSession.fromJson(value, runtime) }, `username` = (values["username"] ?: Undefined).decodeOptional { value -> value.requireString() }, `firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `emailAddress` = (values["emailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() }, `phoneNumber` = (values["phoneNumber"] ?: Undefined).decodeOptional { value -> value.requireString() }, `web3Wallet` = (values["web3Wallet"] ?: Undefined).decodeOptional { value -> value.requireString() }, `hasPassword` = (values["hasPassword"] ?: Undefined).requireBoolean(), `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).jsonObject, `createdSessionId` = (values["createdSessionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `createdUserId` = (values["createdUserId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `abandonAt` = (values["abandonAt"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `legalAcceptedAt` = (values["legalAcceptedAt"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `locale` = (values["locale"] ?: Undefined).decodeOptional { value -> value.requireString() }, `protectCheck` = (values["protectCheck"] ?: Undefined).decodeOptional { value -> ProtectCheck.fromJson(value, runtime) }, `canBeDiscarded` = (values["canBeDiscarded"] ?: Undefined).requireBoolean(), `verifications` = SignUpVerifications.fromJson((values["verifications"] ?: Undefined), runtime))
    }
  }
}
public class SignUp(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SignUpState get() = context.state(handle)
  public val changes: Flow<SignUpState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `id`: String? get() = state.`id`
  public val `status`: SignUpStatus get() = state.`status`
  public val `requiredFields`: List<SignUpField> get() = state.`requiredFields`
  public val `optionalFields`: List<SignUpField> get() = state.`optionalFields`
  public val `missingFields`: List<SignUpField> get() = state.`missingFields`
  public val `unverifiedFields`: List<SignUpIdentificationField> get() = state.`unverifiedFields`
  public val `isTransferable`: Boolean get() = state.`isTransferable`
  public val `existingSession`: SignUpExistingSession? get() = state.`existingSession`
  public val `username`: String? get() = state.`username`
  public val `firstName`: String? get() = state.`firstName`
  public val `lastName`: String? get() = state.`lastName`
  public val `emailAddress`: String? get() = state.`emailAddress`
  public val `phoneNumber`: String? get() = state.`phoneNumber`
  public val `web3Wallet`: String? get() = state.`web3Wallet`
  public val `hasPassword`: Boolean get() = state.`hasPassword`
  public val `unsafeMetadata`: JsonObject get() = state.`unsafeMetadata`
  public val `createdSessionId`: String? get() = state.`createdSessionId`
  public val `createdUserId`: String? get() = state.`createdUserId`
  public val `abandonAt`: Double? get() = state.`abandonAt`
  public val `legalAcceptedAt`: Double? get() = state.`legalAcceptedAt`
  public val `locale`: String? get() = state.`locale`
  public val `protectCheck`: ProtectCheck? get() = state.`protectCheck`
  public val `canBeDiscarded`: Boolean get() = state.`canBeDiscarded`
  public val `verifications`: SignUpVerifications get() = state.`verifications`
  override fun prepare(value: JsonElement): Any = SignUpState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUp = runtime.resource(ResourceHandle.fromReference(value)) as SignUp
  }
  /**
   * Creates a new `SignUp` instance initialized with the provided parameters. The instance maintains the sign-up lifecycle state through its `status` property, which updates as the authentication flow progresses. Will also deactivate any existing sign-up process the client may already have in progress. Once the sign-up process is complete, call the [`signUp.finalize()`](https://clerk.com/docs/reference/objects/sign-up-future#finalize) method to set the newly created session as the active session.
   *
   * What you must pass to `params` depends on which [sign-up options](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options) you have enabled in your app's settings in the Clerk Dashboard.
   *
   * You can complete the sign-up process in one step if you supply the required fields to `create()`. Otherwise, Clerk's sign-up process provides great flexibility and allows users to easily create multi-step sign-up flows.
   *
   * > [!IMPORTANT]
   * > The `signUp.create()` method is intended for advanced use cases. For most use cases, prefer the use of the factor-specific methods such as `signUp.password()`, `signUp.sso()`, etc.
   */
  public suspend fun `create`(`params`: SignUpCreateParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUp.create", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Updates the current `SignUpFuture` instance with the provided parameters.
   */
  public suspend fun `update`(`params`: SignUpUpdateParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUp.update", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Performs a password-based sign-up.
   */
  public suspend fun `password`(`params`: SignUpPasswordParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUp.password", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Performs an SSO-based sign-up ([Social/OAuth](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/overview) or [Enterprise](https://clerk.com/docs/guides/configure/auth-strategies/enterprise-connections/overview)).
   */
  public suspend fun `sso`(`params`: SignUpSSOParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUp.sso", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Performs a ticket-based sign-up.
   */
  public suspend fun `ticket`(`params`: SignUpTicketParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUp.ticket", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Submits a proof token to resolve a pending protect check challenge. The response may contain another `protectCheck` (a chained challenge) which must be resolved iteratively.
   */
  public suspend fun `submitProtectCheck`(`params`: SignUpSubmitProtectCheckParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUp.submitProtectCheck", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Converts a sign-up with `status === 'complete'` into an active session. Will cause anything observing the session state (such as the [`useUser()`](https://clerk.com/docs/reference/hooks/use-user) hook) to update automatically.
   */
  public suspend fun `finalize`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUp.finalize", listOf()) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Resets the current sign-up attempt by clearing all local state back to null. This is useful when you want to allow users to go back to the beginning of the sign-up flow (e.g., to change their email address during verification).
   *
   * Unlike other methods, `reset()` does not trigger the `fetchStatus` to change to `'fetching'` and does not make any API calls - it only clears local state.
   */
  public suspend fun `reset`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUp.reset", listOf()) { result ->
      runtime.checkErrorResult(result)
    }
  }
}

public sealed class SignUpStatus(public val rawValue: String) {
  public data object Complete : SignUpStatus("complete")
  public data object MissingRequirements : SignUpStatus("missing_requirements")
  public data object Abandoned : SignUpStatus("abandoned")
  public data class Unrecognized(val value: String) : SignUpStatus(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpStatus = when (val raw = value.requireString()) {
      "complete" -> Complete
      "missing_requirements" -> MissingRequirements
      "abandoned" -> Abandoned
      else -> Unrecognized(raw)
    }
  }
}

public sealed class SignUpField(public val rawValue: String) {
  public data object Password : SignUpField("password")
  public data object EnterpriseSso : SignUpField("enterprise_sso")
  public data object OauthFacebook : SignUpField("oauth_facebook")
  public data object OauthGoogle : SignUpField("oauth_google")
  public data object OauthHubspot : SignUpField("oauth_hubspot")
  public data object OauthGithub : SignUpField("oauth_github")
  public data object OauthTiktok : SignUpField("oauth_tiktok")
  public data object OauthGitlab : SignUpField("oauth_gitlab")
  public data object OauthDiscord : SignUpField("oauth_discord")
  public data object OauthTwitter : SignUpField("oauth_twitter")
  public data object OauthTwitch : SignUpField("oauth_twitch")
  public data object OauthLinkedin : SignUpField("oauth_linkedin")
  public data object OauthLinkedinOidc : SignUpField("oauth_linkedin_oidc")
  public data object OauthDropbox : SignUpField("oauth_dropbox")
  public data object OauthAtlassian : SignUpField("oauth_atlassian")
  public data object OauthBitbucket : SignUpField("oauth_bitbucket")
  public data object OauthMicrosoft : SignUpField("oauth_microsoft")
  public data object OauthNotion : SignUpField("oauth_notion")
  public data object OauthApple : SignUpField("oauth_apple")
  public data object OauthLine : SignUpField("oauth_line")
  public data object OauthInstagram : SignUpField("oauth_instagram")
  public data object OauthCoinbase : SignUpField("oauth_coinbase")
  public data object OauthSpotify : SignUpField("oauth_spotify")
  public data object OauthXero : SignUpField("oauth_xero")
  public data object OauthBox : SignUpField("oauth_box")
  public data object OauthSlack : SignUpField("oauth_slack")
  public data object OauthLinear : SignUpField("oauth_linear")
  public data object OauthX : SignUpField("oauth_x")
  public data object OauthEnstall : SignUpField("oauth_enstall")
  public data object OauthHuggingface : SignUpField("oauth_huggingface")
  public data object OauthVercel : SignUpField("oauth_vercel")
  public data object EmailAddress : SignUpField("email_address")
  public data object PhoneNumber : SignUpField("phone_number")
  public data object Username : SignUpField("username")
  public data object FirstName : SignUpField("first_name")
  public data object LastName : SignUpField("last_name")
  public data object Web3Wallet : SignUpField("web3_wallet")
  public data object EmailAddressOrPhoneNumber : SignUpField("email_address_or_phone_number")
  public data object LegalAccepted : SignUpField("legal_accepted")
  public data object ProtectCheck : SignUpField("protect_check")
  public data class Unrecognized(val value: String) : SignUpField(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpField = when (val raw = value.requireString()) {
      "password" -> Password
      "enterprise_sso" -> EnterpriseSso
      "oauth_facebook" -> OauthFacebook
      "oauth_google" -> OauthGoogle
      "oauth_hubspot" -> OauthHubspot
      "oauth_github" -> OauthGithub
      "oauth_tiktok" -> OauthTiktok
      "oauth_gitlab" -> OauthGitlab
      "oauth_discord" -> OauthDiscord
      "oauth_twitter" -> OauthTwitter
      "oauth_twitch" -> OauthTwitch
      "oauth_linkedin" -> OauthLinkedin
      "oauth_linkedin_oidc" -> OauthLinkedinOidc
      "oauth_dropbox" -> OauthDropbox
      "oauth_atlassian" -> OauthAtlassian
      "oauth_bitbucket" -> OauthBitbucket
      "oauth_microsoft" -> OauthMicrosoft
      "oauth_notion" -> OauthNotion
      "oauth_apple" -> OauthApple
      "oauth_line" -> OauthLine
      "oauth_instagram" -> OauthInstagram
      "oauth_coinbase" -> OauthCoinbase
      "oauth_spotify" -> OauthSpotify
      "oauth_xero" -> OauthXero
      "oauth_box" -> OauthBox
      "oauth_slack" -> OauthSlack
      "oauth_linear" -> OauthLinear
      "oauth_x" -> OauthX
      "oauth_enstall" -> OauthEnstall
      "oauth_huggingface" -> OauthHuggingface
      "oauth_vercel" -> OauthVercel
      "email_address" -> EmailAddress
      "phone_number" -> PhoneNumber
      "username" -> Username
      "first_name" -> FirstName
      "last_name" -> LastName
      "web3_wallet" -> Web3Wallet
      "email_address_or_phone_number" -> EmailAddressOrPhoneNumber
      "legal_accepted" -> LegalAccepted
      "protect_check" -> ProtectCheck
      else -> Unrecognized(raw)
    }
  }
}

public sealed class SignUpIdentificationField(public val rawValue: String) {
  public data object EnterpriseSso : SignUpIdentificationField("enterprise_sso")
  public data object OauthFacebook : SignUpIdentificationField("oauth_facebook")
  public data object OauthGoogle : SignUpIdentificationField("oauth_google")
  public data object OauthHubspot : SignUpIdentificationField("oauth_hubspot")
  public data object OauthGithub : SignUpIdentificationField("oauth_github")
  public data object OauthTiktok : SignUpIdentificationField("oauth_tiktok")
  public data object OauthGitlab : SignUpIdentificationField("oauth_gitlab")
  public data object OauthDiscord : SignUpIdentificationField("oauth_discord")
  public data object OauthTwitter : SignUpIdentificationField("oauth_twitter")
  public data object OauthTwitch : SignUpIdentificationField("oauth_twitch")
  public data object OauthLinkedin : SignUpIdentificationField("oauth_linkedin")
  public data object OauthLinkedinOidc : SignUpIdentificationField("oauth_linkedin_oidc")
  public data object OauthDropbox : SignUpIdentificationField("oauth_dropbox")
  public data object OauthAtlassian : SignUpIdentificationField("oauth_atlassian")
  public data object OauthBitbucket : SignUpIdentificationField("oauth_bitbucket")
  public data object OauthMicrosoft : SignUpIdentificationField("oauth_microsoft")
  public data object OauthNotion : SignUpIdentificationField("oauth_notion")
  public data object OauthApple : SignUpIdentificationField("oauth_apple")
  public data object OauthLine : SignUpIdentificationField("oauth_line")
  public data object OauthInstagram : SignUpIdentificationField("oauth_instagram")
  public data object OauthCoinbase : SignUpIdentificationField("oauth_coinbase")
  public data object OauthSpotify : SignUpIdentificationField("oauth_spotify")
  public data object OauthXero : SignUpIdentificationField("oauth_xero")
  public data object OauthBox : SignUpIdentificationField("oauth_box")
  public data object OauthSlack : SignUpIdentificationField("oauth_slack")
  public data object OauthLinear : SignUpIdentificationField("oauth_linear")
  public data object OauthX : SignUpIdentificationField("oauth_x")
  public data object OauthEnstall : SignUpIdentificationField("oauth_enstall")
  public data object OauthHuggingface : SignUpIdentificationField("oauth_huggingface")
  public data object OauthVercel : SignUpIdentificationField("oauth_vercel")
  public data object EmailAddress : SignUpIdentificationField("email_address")
  public data object PhoneNumber : SignUpIdentificationField("phone_number")
  public data object Username : SignUpIdentificationField("username")
  public data object Web3Wallet : SignUpIdentificationField("web3_wallet")
  public data object EmailAddressOrPhoneNumber : SignUpIdentificationField("email_address_or_phone_number")
  public data class Unrecognized(val value: String) : SignUpIdentificationField(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpIdentificationField = when (val raw = value.requireString()) {
      "enterprise_sso" -> EnterpriseSso
      "oauth_facebook" -> OauthFacebook
      "oauth_google" -> OauthGoogle
      "oauth_hubspot" -> OauthHubspot
      "oauth_github" -> OauthGithub
      "oauth_tiktok" -> OauthTiktok
      "oauth_gitlab" -> OauthGitlab
      "oauth_discord" -> OauthDiscord
      "oauth_twitter" -> OauthTwitter
      "oauth_twitch" -> OauthTwitch
      "oauth_linkedin" -> OauthLinkedin
      "oauth_linkedin_oidc" -> OauthLinkedinOidc
      "oauth_dropbox" -> OauthDropbox
      "oauth_atlassian" -> OauthAtlassian
      "oauth_bitbucket" -> OauthBitbucket
      "oauth_microsoft" -> OauthMicrosoft
      "oauth_notion" -> OauthNotion
      "oauth_apple" -> OauthApple
      "oauth_line" -> OauthLine
      "oauth_instagram" -> OauthInstagram
      "oauth_coinbase" -> OauthCoinbase
      "oauth_spotify" -> OauthSpotify
      "oauth_xero" -> OauthXero
      "oauth_box" -> OauthBox
      "oauth_slack" -> OauthSlack
      "oauth_linear" -> OauthLinear
      "oauth_x" -> OauthX
      "oauth_enstall" -> OauthEnstall
      "oauth_huggingface" -> OauthHuggingface
      "oauth_vercel" -> OauthVercel
      "email_address" -> EmailAddress
      "phone_number" -> PhoneNumber
      "username" -> Username
      "web3_wallet" -> Web3Wallet
      "email_address_or_phone_number" -> EmailAddressOrPhoneNumber
      else -> Unrecognized(raw)
    }
  }
}

public data class SignUpExistingSession(public val `sessionId`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("sessionId", JsonPrimitive(this@SignUpExistingSession.`sessionId`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpExistingSession {
      val values = value.jsonObject

      return SignUpExistingSession(`sessionId` = (values["sessionId"] ?: Undefined).requireString())
    }
  }
}

public data class SignUpCreateParams(public val `strategy`: SignUpCreateParamsStrategy? = null, public val `token`: String? = null, public val `emailAddress`: String? = null, public val `phoneNumber`: String? = null, public val `username`: String? = null, public val `password`: String? = null, public val `transfer`: Boolean? = null, public val `ticket`: String? = null, public val `web3Wallet`: String? = null, public val `firstName`: String? = null, public val `lastName`: String? = null, public val `unsafeMetadata`: JsonObject? = null, public val `legalAccepted`: Boolean? = null, public val `locale`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", this@SignUpCreateParams.`strategy`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("token", this@SignUpCreateParams.`token`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("emailAddress", this@SignUpCreateParams.`emailAddress`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("phoneNumber", this@SignUpCreateParams.`phoneNumber`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("username", this@SignUpCreateParams.`username`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("password", this@SignUpCreateParams.`password`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("transfer", this@SignUpCreateParams.`transfer`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("ticket", this@SignUpCreateParams.`ticket`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("web3Wallet", this@SignUpCreateParams.`web3Wallet`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("firstName", this@SignUpCreateParams.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@SignUpCreateParams.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("unsafeMetadata", this@SignUpCreateParams.`unsafeMetadata`?.let { value -> value } ?: Undefined)
    putPresent("legalAccepted", this@SignUpCreateParams.`legalAccepted`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("locale", this@SignUpCreateParams.`locale`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpCreateParams {
      val values = value.jsonObject

      return SignUpCreateParams(`strategy` = (values["strategy"] ?: Undefined).decodeOptional { value -> SignUpCreateParamsStrategy.fromJson(value, runtime) }, `token` = (values["token"] ?: Undefined).decodeOptional { value -> value.requireString() }, `emailAddress` = (values["emailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() }, `phoneNumber` = (values["phoneNumber"] ?: Undefined).decodeOptional { value -> value.requireString() }, `username` = (values["username"] ?: Undefined).decodeOptional { value -> value.requireString() }, `password` = (values["password"] ?: Undefined).decodeOptional { value -> value.requireString() }, `transfer` = (values["transfer"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `ticket` = (values["ticket"] ?: Undefined).decodeOptional { value -> value.requireString() }, `web3Wallet` = (values["web3Wallet"] ?: Undefined).decodeOptional { value -> value.requireString() }, `firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `legalAccepted` = (values["legalAccepted"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `locale` = (values["locale"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public sealed class SignUpCreateParamsStrategy(public val rawValue: String) {
  public data object GoogleOneTap : SignUpCreateParamsStrategy("google_one_tap")
  public data object OauthTokenApple : SignUpCreateParamsStrategy("oauth_token_apple")
  public data object PhoneCode : SignUpCreateParamsStrategy("phone_code")
  public data object Ticket : SignUpCreateParamsStrategy("ticket")
  public data object EnterpriseSso : SignUpCreateParamsStrategy("enterprise_sso")
  public data object OauthFacebook : SignUpCreateParamsStrategy("oauth_facebook")
  public data object OauthGoogle : SignUpCreateParamsStrategy("oauth_google")
  public data object OauthHubspot : SignUpCreateParamsStrategy("oauth_hubspot")
  public data object OauthGithub : SignUpCreateParamsStrategy("oauth_github")
  public data object OauthTiktok : SignUpCreateParamsStrategy("oauth_tiktok")
  public data object OauthGitlab : SignUpCreateParamsStrategy("oauth_gitlab")
  public data object OauthDiscord : SignUpCreateParamsStrategy("oauth_discord")
  public data object OauthTwitter : SignUpCreateParamsStrategy("oauth_twitter")
  public data object OauthTwitch : SignUpCreateParamsStrategy("oauth_twitch")
  public data object OauthLinkedin : SignUpCreateParamsStrategy("oauth_linkedin")
  public data object OauthLinkedinOidc : SignUpCreateParamsStrategy("oauth_linkedin_oidc")
  public data object OauthDropbox : SignUpCreateParamsStrategy("oauth_dropbox")
  public data object OauthAtlassian : SignUpCreateParamsStrategy("oauth_atlassian")
  public data object OauthBitbucket : SignUpCreateParamsStrategy("oauth_bitbucket")
  public data object OauthMicrosoft : SignUpCreateParamsStrategy("oauth_microsoft")
  public data object OauthNotion : SignUpCreateParamsStrategy("oauth_notion")
  public data object OauthApple : SignUpCreateParamsStrategy("oauth_apple")
  public data object OauthLine : SignUpCreateParamsStrategy("oauth_line")
  public data object OauthInstagram : SignUpCreateParamsStrategy("oauth_instagram")
  public data object OauthCoinbase : SignUpCreateParamsStrategy("oauth_coinbase")
  public data object OauthSpotify : SignUpCreateParamsStrategy("oauth_spotify")
  public data object OauthXero : SignUpCreateParamsStrategy("oauth_xero")
  public data object OauthBox : SignUpCreateParamsStrategy("oauth_box")
  public data object OauthSlack : SignUpCreateParamsStrategy("oauth_slack")
  public data object OauthLinear : SignUpCreateParamsStrategy("oauth_linear")
  public data object OauthX : SignUpCreateParamsStrategy("oauth_x")
  public data object OauthEnstall : SignUpCreateParamsStrategy("oauth_enstall")
  public data object OauthHuggingface : SignUpCreateParamsStrategy("oauth_huggingface")
  public data object OauthVercel : SignUpCreateParamsStrategy("oauth_vercel")
  public data class Unrecognized(val value: String) : SignUpCreateParamsStrategy(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpCreateParamsStrategy = when (val raw = value.requireString()) {
      "google_one_tap" -> GoogleOneTap
      "oauth_token_apple" -> OauthTokenApple
      "phone_code" -> PhoneCode
      "ticket" -> Ticket
      "enterprise_sso" -> EnterpriseSso
      "oauth_facebook" -> OauthFacebook
      "oauth_google" -> OauthGoogle
      "oauth_hubspot" -> OauthHubspot
      "oauth_github" -> OauthGithub
      "oauth_tiktok" -> OauthTiktok
      "oauth_gitlab" -> OauthGitlab
      "oauth_discord" -> OauthDiscord
      "oauth_twitter" -> OauthTwitter
      "oauth_twitch" -> OauthTwitch
      "oauth_linkedin" -> OauthLinkedin
      "oauth_linkedin_oidc" -> OauthLinkedinOidc
      "oauth_dropbox" -> OauthDropbox
      "oauth_atlassian" -> OauthAtlassian
      "oauth_bitbucket" -> OauthBitbucket
      "oauth_microsoft" -> OauthMicrosoft
      "oauth_notion" -> OauthNotion
      "oauth_apple" -> OauthApple
      "oauth_line" -> OauthLine
      "oauth_instagram" -> OauthInstagram
      "oauth_coinbase" -> OauthCoinbase
      "oauth_spotify" -> OauthSpotify
      "oauth_xero" -> OauthXero
      "oauth_box" -> OauthBox
      "oauth_slack" -> OauthSlack
      "oauth_linear" -> OauthLinear
      "oauth_x" -> OauthX
      "oauth_enstall" -> OauthEnstall
      "oauth_huggingface" -> OauthHuggingface
      "oauth_vercel" -> OauthVercel
      else -> Unrecognized(raw)
    }
  }
}

public data class SignUpUpdateParams(public val `emailAddress`: String? = null, public val `phoneNumber`: String? = null, public val `username`: String? = null, public val `firstName`: String? = null, public val `lastName`: String? = null, public val `unsafeMetadata`: JsonObject? = null, public val `legalAccepted`: Boolean? = null, public val `locale`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddress", this@SignUpUpdateParams.`emailAddress`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("phoneNumber", this@SignUpUpdateParams.`phoneNumber`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("username", this@SignUpUpdateParams.`username`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("firstName", this@SignUpUpdateParams.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@SignUpUpdateParams.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("unsafeMetadata", this@SignUpUpdateParams.`unsafeMetadata`?.let { value -> value } ?: Undefined)
    putPresent("legalAccepted", this@SignUpUpdateParams.`legalAccepted`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("locale", this@SignUpUpdateParams.`locale`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpUpdateParams {
      val values = value.jsonObject

      return SignUpUpdateParams(`emailAddress` = (values["emailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() }, `phoneNumber` = (values["phoneNumber"] ?: Undefined).decodeOptional { value -> value.requireString() }, `username` = (values["username"] ?: Undefined).decodeOptional { value -> value.requireString() }, `firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `legalAccepted` = (values["legalAccepted"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `locale` = (values["locale"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

/**
 * Contains information about the available verification strategies for a sign-up attempt.
 */
public data class SignUpVerificationsState(public val `emailAddress`: SignUpVerification, public val `phoneNumber`: SignUpVerification, public val `web3Wallet`: Verification, public val `externalAccount`: Verification, public val `emailLinkVerification`: SignUpVerificationsEmailLinkVerification?) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("emailAddress", this@SignUpVerificationsState.`emailAddress`.toJson())
    putPresent("phoneNumber", this@SignUpVerificationsState.`phoneNumber`.toJson())
    putPresent("web3Wallet", this@SignUpVerificationsState.`web3Wallet`.toJson())
    putPresent("externalAccount", this@SignUpVerificationsState.`externalAccount`.toJson())
    putPresent("emailLinkVerification", this@SignUpVerificationsState.`emailLinkVerification`?.let { value -> value.toJson() } ?: JsonNull)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpVerificationsState {
      val values = value.jsonObject

      return SignUpVerificationsState(`emailAddress` = SignUpVerification.fromJson((values["emailAddress"] ?: Undefined), runtime), `phoneNumber` = SignUpVerification.fromJson((values["phoneNumber"] ?: Undefined), runtime), `web3Wallet` = Verification.fromJson((values["web3Wallet"] ?: Undefined), runtime), `externalAccount` = Verification.fromJson((values["externalAccount"] ?: Undefined), runtime), `emailLinkVerification` = (values["emailLinkVerification"] ?: Undefined).decodeOptional { value -> SignUpVerificationsEmailLinkVerification.fromJson(value, runtime) })
    }
  }
}
public class SignUpVerifications(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SignUpVerificationsState get() = context.state(handle)
  public val changes: Flow<SignUpVerificationsState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `emailAddress`: SignUpVerification get() = state.`emailAddress`
  public val `phoneNumber`: SignUpVerification get() = state.`phoneNumber`
  public val `web3Wallet`: Verification get() = state.`web3Wallet`
  public val `externalAccount`: Verification get() = state.`externalAccount`
  public val `emailLinkVerification`: SignUpVerificationsEmailLinkVerification? get() = state.`emailLinkVerification`
  override fun prepare(value: JsonElement): Any = SignUpVerificationsState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpVerifications = runtime.resource(ResourceHandle.fromReference(value)) as SignUpVerifications
  }
  /**
   * Sends an email code to verify an email address.
   */
  public suspend fun `sendEmailCode`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUpVerifications.sendEmailCode", listOf()) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Verifies a code sent with the [`verifications.sendEmailCode()`](https://clerk.com/docs/reference/objects/sign-up-future#verifications-send-email-code) method.
   */
  public suspend fun `verifyEmailCode`(`params`: SignUpEmailCodeVerifyParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUpVerifications.verifyEmailCode", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Sends an email link to verify an email address.
   */
  public suspend fun `sendEmailLink`(`params`: SignUpEmailLinkSendParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUpVerifications.sendEmailLink", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Will wait for email link verification to complete or expire after calling [`verifications.sendEmailLink()`](https://clerk.com/docs/reference/objects/sign-up-future#verifications-send-email-link).
   */
  public suspend fun `waitForEmailLinkVerification`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUpVerifications.waitForEmailLinkVerification", listOf()) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Sends a phone code to verify a phone number.
   */
  public suspend fun `sendPhoneCode`(`params`: SignUpPhoneCodeSendParams? = null): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUpVerifications.sendPhoneCode", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      runtime.checkErrorResult(result)
    }
  }
  /**
   * Verifies a code sent with the [`verifications.sendPhoneCode()`](https://clerk.com/docs/reference/objects/sign-up-future#verifications-send-phone-code) method.
   */
  public suspend fun `verifyPhoneCode`(`params`: SignUpPhoneCodeVerifyParams): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUpVerifications.verifyPhoneCode", listOf(`params`.toJson())) { result ->
      runtime.checkErrorResult(result)
    }
  }
}

public data class SignUpVerificationState(public val `supportedStrategies`: List<String>, public val `nextAction`: String, public val `attempts`: Double?, public val `error`: ClerkAPIError?, public val `expireAt`: Instant?, public val `status`: VerificationStatus?, public val `strategy`: String?, public val `verifiedAtClient`: String?, public val `channel`: PhoneCodeChannel? = null, public val `id`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("supportedStrategies", JsonArray(this@SignUpVerificationState.`supportedStrategies`.map { value -> JsonPrimitive(value) }))
    putPresent("nextAction", JsonPrimitive(this@SignUpVerificationState.`nextAction`))
    putPresent("attempts", this@SignUpVerificationState.`attempts`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("error", this@SignUpVerificationState.`error`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("expireAt", this@SignUpVerificationState.`expireAt`?.let { value -> JsonPrimitive(value.toString()) } ?: JsonNull)
    putPresent("status", this@SignUpVerificationState.`status`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("strategy", this@SignUpVerificationState.`strategy`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("verifiedAtClient", this@SignUpVerificationState.`verifiedAtClient`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("channel", this@SignUpVerificationState.`channel`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("id", this@SignUpVerificationState.`id`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpVerificationState {
      val values = value.jsonObject

      return SignUpVerificationState(`supportedStrategies` = (values["supportedStrategies"] ?: Undefined).jsonArray.map { value -> value.requireString() }, `nextAction` = (values["nextAction"] ?: Undefined).requireString(), `attempts` = (values["attempts"] ?: Undefined).decodeOptional { value -> value.requireDouble() }, `error` = (values["error"] ?: Undefined).decodeOptional { value -> ClerkAPIError.fromJson(value, runtime) }, `expireAt` = (values["expireAt"] ?: Undefined).decodeOptional { value -> Instant.parse(value.requireString()) }, `status` = (values["status"] ?: Undefined).decodeOptional { value -> VerificationStatus.fromJson(value, runtime) }, `strategy` = (values["strategy"] ?: Undefined).decodeOptional { value -> value.requireString() }, `verifiedAtClient` = (values["verifiedAtClient"] ?: Undefined).decodeOptional { value -> value.requireString() }, `channel` = (values["channel"] ?: Undefined).decodeOptional { value -> PhoneCodeChannel.fromJson(value, runtime) }, `id` = (values["id"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}
public class SignUpVerification(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: SignUpVerificationState get() = context.state(handle)
  public val changes: Flow<SignUpVerificationState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `supportedStrategies`: List<String> get() = state.`supportedStrategies`
  public val `nextAction`: String get() = state.`nextAction`
  public val `attempts`: Double? get() = state.`attempts`
  public val `error`: ClerkAPIError? get() = state.`error`
  public val `expireAt`: Instant? get() = state.`expireAt`
  public val `status`: VerificationStatus? get() = state.`status`
  public val `strategy`: String? get() = state.`strategy`
  public val `verifiedAtClient`: String? get() = state.`verifiedAtClient`
  public val `channel`: PhoneCodeChannel? get() = state.`channel`
  public val `id`: String? get() = state.`id`
  override fun prepare(value: JsonElement): Any = SignUpVerificationState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpVerification = runtime.resource(ResourceHandle.fromReference(value)) as SignUpVerification
  }
  public suspend fun `verifiedFromTheSameClient`(): Boolean {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUpVerification.verifiedFromTheSameClient", listOf()) { result ->
      result.requireBoolean()
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): SignUpVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "SignUpVerification.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      SignUpVerification.fromJson(result, runtime)
    }
  }
}

public data class SignUpVerificationsEmailLinkVerification(public val `status`: SignInEmailLinkVerificationStatus, public val `createdSessionId`: String, public val `verifiedFromTheSameClient`: Boolean) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("status", this@SignUpVerificationsEmailLinkVerification.`status`.toJson())
    putPresent("createdSessionId", JsonPrimitive(this@SignUpVerificationsEmailLinkVerification.`createdSessionId`))
    putPresent("verifiedFromTheSameClient", JsonPrimitive(this@SignUpVerificationsEmailLinkVerification.`verifiedFromTheSameClient`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpVerificationsEmailLinkVerification {
      val values = value.jsonObject

      return SignUpVerificationsEmailLinkVerification(`status` = SignInEmailLinkVerificationStatus.fromJson((values["status"] ?: Undefined), runtime), `createdSessionId` = (values["createdSessionId"] ?: Undefined).requireString(), `verifiedFromTheSameClient` = (values["verifiedFromTheSameClient"] ?: Undefined).requireBoolean())
    }
  }
}

public data class SignUpEmailCodeVerifyParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@SignUpEmailCodeVerifyParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpEmailCodeVerifyParams {
      val values = value.jsonObject

      return SignUpEmailCodeVerifyParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public class SignUpEmailLinkSendParams() {
  public fun toJson(): JsonElement = buildJsonObject {

  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpEmailLinkSendParams {
      val values = value.jsonObject

      return SignUpEmailLinkSendParams()
    }
  }
}

public data class SignUpPhoneCodeSendParams(public val `channel`: PhoneCodeChannel? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("channel", this@SignUpPhoneCodeSendParams.`channel`?.let { value -> value.toJson() } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpPhoneCodeSendParams {
      val values = value.jsonObject

      return SignUpPhoneCodeSendParams(`channel` = (values["channel"] ?: Undefined).decodeOptional { value -> PhoneCodeChannel.fromJson(value, runtime) })
    }
  }
}

public data class SignUpPhoneCodeVerifyParams(public val `code`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("code", JsonPrimitive(this@SignUpPhoneCodeVerifyParams.`code`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpPhoneCodeVerifyParams {
      val values = value.jsonObject

      return SignUpPhoneCodeVerifyParams(`code` = (values["code"] ?: Undefined).requireString())
    }
  }
}

public sealed interface SignUpPasswordParams {
  public data class Case1(val value: SignUpPasswordParamsCase1) : SignUpPasswordParams
  public data class Case2(val value: SignUpPasswordParamsCase2) : SignUpPasswordParams
  public data class Case3(val value: SignUpPasswordParamsCase3) : SignUpPasswordParams
  public data class Case4(val value: SignUpPasswordParamsCase4) : SignUpPasswordParams
  public val `password`: String get() = when (this) {
    is Case1 -> value.`password`
    is Case2 -> value.`password`
    is Case3 -> value.`password`
    is Case4 -> value.`password`
  }
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to value.toJson()))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
    is Case4 -> JsonObject(mapOf("\$case" to JsonPrimitive(3), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpPasswordParams {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(SignUpPasswordParamsCase1.fromJson(payload, runtime))
        1 -> Case2(SignUpPasswordParamsCase2.fromJson(payload, runtime))
        2 -> Case3(SignUpPasswordParamsCase3.fromJson(payload, runtime))
        3 -> Case4(SignUpPasswordParamsCase4.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public data class SignUpPasswordParamsCase1(public val `firstName`: String? = null, public val `lastName`: String? = null, public val `unsafeMetadata`: JsonObject? = null, public val `legalAccepted`: Boolean? = null, public val `locale`: String? = null, public val `password`: String, public val `emailAddress`: String, public val `phoneNumber`: String? = null, public val `username`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("firstName", this@SignUpPasswordParamsCase1.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@SignUpPasswordParamsCase1.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("unsafeMetadata", this@SignUpPasswordParamsCase1.`unsafeMetadata`?.let { value -> value } ?: Undefined)
    putPresent("legalAccepted", this@SignUpPasswordParamsCase1.`legalAccepted`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("locale", this@SignUpPasswordParamsCase1.`locale`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("password", JsonPrimitive(this@SignUpPasswordParamsCase1.`password`))
    putPresent("emailAddress", JsonPrimitive(this@SignUpPasswordParamsCase1.`emailAddress`))
    putPresent("phoneNumber", this@SignUpPasswordParamsCase1.`phoneNumber`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("username", this@SignUpPasswordParamsCase1.`username`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpPasswordParamsCase1 {
      val values = value.jsonObject

      return SignUpPasswordParamsCase1(`firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `legalAccepted` = (values["legalAccepted"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `locale` = (values["locale"] ?: Undefined).decodeOptional { value -> value.requireString() }, `password` = (values["password"] ?: Undefined).requireString(), `emailAddress` = (values["emailAddress"] ?: Undefined).requireString(), `phoneNumber` = (values["phoneNumber"] ?: Undefined).decodeOptional { value -> value.requireString() }, `username` = (values["username"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignUpPasswordParamsCase2(public val `firstName`: String? = null, public val `lastName`: String? = null, public val `unsafeMetadata`: JsonObject? = null, public val `legalAccepted`: Boolean? = null, public val `locale`: String? = null, public val `password`: String, public val `emailAddress`: String? = null, public val `phoneNumber`: String, public val `username`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("firstName", this@SignUpPasswordParamsCase2.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@SignUpPasswordParamsCase2.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("unsafeMetadata", this@SignUpPasswordParamsCase2.`unsafeMetadata`?.let { value -> value } ?: Undefined)
    putPresent("legalAccepted", this@SignUpPasswordParamsCase2.`legalAccepted`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("locale", this@SignUpPasswordParamsCase2.`locale`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("password", JsonPrimitive(this@SignUpPasswordParamsCase2.`password`))
    putPresent("emailAddress", this@SignUpPasswordParamsCase2.`emailAddress`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("phoneNumber", JsonPrimitive(this@SignUpPasswordParamsCase2.`phoneNumber`))
    putPresent("username", this@SignUpPasswordParamsCase2.`username`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpPasswordParamsCase2 {
      val values = value.jsonObject

      return SignUpPasswordParamsCase2(`firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `legalAccepted` = (values["legalAccepted"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `locale` = (values["locale"] ?: Undefined).decodeOptional { value -> value.requireString() }, `password` = (values["password"] ?: Undefined).requireString(), `emailAddress` = (values["emailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() }, `phoneNumber` = (values["phoneNumber"] ?: Undefined).requireString(), `username` = (values["username"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignUpPasswordParamsCase3(public val `firstName`: String? = null, public val `lastName`: String? = null, public val `unsafeMetadata`: JsonObject? = null, public val `legalAccepted`: Boolean? = null, public val `locale`: String? = null, public val `password`: String, public val `emailAddress`: String? = null, public val `phoneNumber`: String? = null, public val `username`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("firstName", this@SignUpPasswordParamsCase3.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@SignUpPasswordParamsCase3.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("unsafeMetadata", this@SignUpPasswordParamsCase3.`unsafeMetadata`?.let { value -> value } ?: Undefined)
    putPresent("legalAccepted", this@SignUpPasswordParamsCase3.`legalAccepted`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("locale", this@SignUpPasswordParamsCase3.`locale`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("password", JsonPrimitive(this@SignUpPasswordParamsCase3.`password`))
    putPresent("emailAddress", this@SignUpPasswordParamsCase3.`emailAddress`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("phoneNumber", this@SignUpPasswordParamsCase3.`phoneNumber`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("username", JsonPrimitive(this@SignUpPasswordParamsCase3.`username`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpPasswordParamsCase3 {
      val values = value.jsonObject

      return SignUpPasswordParamsCase3(`firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `legalAccepted` = (values["legalAccepted"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `locale` = (values["locale"] ?: Undefined).decodeOptional { value -> value.requireString() }, `password` = (values["password"] ?: Undefined).requireString(), `emailAddress` = (values["emailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() }, `phoneNumber` = (values["phoneNumber"] ?: Undefined).decodeOptional { value -> value.requireString() }, `username` = (values["username"] ?: Undefined).requireString())
    }
  }
}

public data class SignUpPasswordParamsCase4(public val `firstName`: String? = null, public val `lastName`: String? = null, public val `unsafeMetadata`: JsonObject? = null, public val `legalAccepted`: Boolean? = null, public val `locale`: String? = null, public val `password`: String, public val `emailAddress`: String? = null, public val `phoneNumber`: String? = null, public val `username`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("firstName", this@SignUpPasswordParamsCase4.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@SignUpPasswordParamsCase4.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("unsafeMetadata", this@SignUpPasswordParamsCase4.`unsafeMetadata`?.let { value -> value } ?: Undefined)
    putPresent("legalAccepted", this@SignUpPasswordParamsCase4.`legalAccepted`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("locale", this@SignUpPasswordParamsCase4.`locale`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("password", JsonPrimitive(this@SignUpPasswordParamsCase4.`password`))
    putPresent("emailAddress", this@SignUpPasswordParamsCase4.`emailAddress`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("phoneNumber", this@SignUpPasswordParamsCase4.`phoneNumber`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("username", this@SignUpPasswordParamsCase4.`username`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpPasswordParamsCase4 {
      val values = value.jsonObject

      return SignUpPasswordParamsCase4(`firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `legalAccepted` = (values["legalAccepted"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `locale` = (values["locale"] ?: Undefined).decodeOptional { value -> value.requireString() }, `password` = (values["password"] ?: Undefined).requireString(), `emailAddress` = (values["emailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() }, `phoneNumber` = (values["phoneNumber"] ?: Undefined).decodeOptional { value -> value.requireString() }, `username` = (values["username"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignUpSSOParams(public val `strategy`: String, public val `oidcPrompt`: String? = null, public val `enterpriseConnectionId`: String? = null, public val `emailAddress`: String? = null, public val `firstName`: String? = null, public val `lastName`: String? = null, public val `unsafeMetadata`: JsonObject? = null, public val `legalAccepted`: Boolean? = null, public val `locale`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", JsonPrimitive(this@SignUpSSOParams.`strategy`))
    putPresent("oidcPrompt", this@SignUpSSOParams.`oidcPrompt`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("enterpriseConnectionId", this@SignUpSSOParams.`enterpriseConnectionId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("emailAddress", this@SignUpSSOParams.`emailAddress`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("firstName", this@SignUpSSOParams.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@SignUpSSOParams.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("unsafeMetadata", this@SignUpSSOParams.`unsafeMetadata`?.let { value -> value } ?: Undefined)
    putPresent("legalAccepted", this@SignUpSSOParams.`legalAccepted`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("locale", this@SignUpSSOParams.`locale`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpSSOParams {
      val values = value.jsonObject

      return SignUpSSOParams(`strategy` = (values["strategy"] ?: Undefined).requireString(), `oidcPrompt` = (values["oidcPrompt"] ?: Undefined).decodeOptional { value -> value.requireString() }, `enterpriseConnectionId` = (values["enterpriseConnectionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `emailAddress` = (values["emailAddress"] ?: Undefined).decodeOptional { value -> value.requireString() }, `firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `legalAccepted` = (values["legalAccepted"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `locale` = (values["locale"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignUpTicketParams(public val `ticket`: String, public val `firstName`: String? = null, public val `lastName`: String? = null, public val `unsafeMetadata`: JsonObject? = null, public val `legalAccepted`: Boolean? = null, public val `locale`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("ticket", JsonPrimitive(this@SignUpTicketParams.`ticket`))
    putPresent("firstName", this@SignUpTicketParams.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@SignUpTicketParams.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("unsafeMetadata", this@SignUpTicketParams.`unsafeMetadata`?.let { value -> value } ?: Undefined)
    putPresent("legalAccepted", this@SignUpTicketParams.`legalAccepted`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("locale", this@SignUpTicketParams.`locale`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpTicketParams {
      val values = value.jsonObject

      return SignUpTicketParams(`ticket` = (values["ticket"] ?: Undefined).requireString(), `firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `legalAccepted` = (values["legalAccepted"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `locale` = (values["locale"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SignUpSubmitProtectCheckParams(public val `proofToken`: String) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("proofToken", JsonPrimitive(this@SignUpSubmitProtectCheckParams.`proofToken`))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SignUpSubmitProtectCheckParams {
      val values = value.jsonObject

      return SignUpSubmitProtectCheckParams(`proofToken` = (values["proofToken"] ?: Undefined).requireString())
    }
  }
}

public data class MobileSSOParams(public val `strategy`: SignInSSOParamsStrategy, public val `identifier`: String? = null, public val `enterpriseConnectionId`: String? = null, public val `oidcPrompt`: String? = null, public val `legalAccepted`: Boolean? = null, public val `firstName`: String? = null, public val `lastName`: String? = null, public val `locale`: String? = null, public val `unsafeMetadata`: JsonObject? = null, public val `start`: MobileSSOParamsStart, public val `transferable`: Boolean, public val `preferGoogleOneTap`: Boolean? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("strategy", this@MobileSSOParams.`strategy`.toJson())
    putPresent("identifier", this@MobileSSOParams.`identifier`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("enterpriseConnectionId", this@MobileSSOParams.`enterpriseConnectionId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("oidcPrompt", this@MobileSSOParams.`oidcPrompt`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("legalAccepted", this@MobileSSOParams.`legalAccepted`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("firstName", this@MobileSSOParams.`firstName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("lastName", this@MobileSSOParams.`lastName`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("locale", this@MobileSSOParams.`locale`?.let { value -> JsonPrimitive(value) } ?: Undefined)
    putPresent("unsafeMetadata", this@MobileSSOParams.`unsafeMetadata`?.let { value -> value } ?: Undefined)
    putPresent("start", this@MobileSSOParams.`start`.toJson())
    putPresent("transferable", JsonPrimitive(this@MobileSSOParams.`transferable`))
    putPresent("preferGoogleOneTap", this@MobileSSOParams.`preferGoogleOneTap`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileSSOParams {
      val values = value.jsonObject

      return MobileSSOParams(`strategy` = SignInSSOParamsStrategy.fromJson((values["strategy"] ?: Undefined), runtime), `identifier` = (values["identifier"] ?: Undefined).decodeOptional { value -> value.requireString() }, `enterpriseConnectionId` = (values["enterpriseConnectionId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `oidcPrompt` = (values["oidcPrompt"] ?: Undefined).decodeOptional { value -> value.requireString() }, `legalAccepted` = (values["legalAccepted"] ?: Undefined).decodeOptional { value -> value.requireBoolean() }, `firstName` = (values["firstName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastName` = (values["lastName"] ?: Undefined).decodeOptional { value -> value.requireString() }, `locale` = (values["locale"] ?: Undefined).decodeOptional { value -> value.requireString() }, `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `start` = MobileSSOParamsStart.fromJson((values["start"] ?: Undefined), runtime), `transferable` = (values["transferable"] ?: Undefined).requireBoolean(), `preferGoogleOneTap` = (values["preferGoogleOneTap"] ?: Undefined).decodeOptional { value -> value.requireBoolean() })
    }
  }
}

public sealed class MobileSSOParamsStart(public val rawValue: String) {
  public data object SignUp : MobileSSOParamsStart("signUp")
  public data object SignIn : MobileSSOParamsStart("signIn")
  public data object Auto : MobileSSOParamsStart("auto")
  public data class Unrecognized(val value: String) : MobileSSOParamsStart(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileSSOParamsStart = when (val raw = value.requireString()) {
      "signUp" -> SignUp
      "signIn" -> SignIn
      "auto" -> Auto
      else -> Unrecognized(raw)
    }
  }
}

/**
 * Shared entry behavior for the identifier screen in prebuilt mobile authentication. Does not finalize a session.
 */
public data class MobileIdentifierParams(public val `identifier`: String, public val `identifierType`: MobileIdentifierParamsIdentifierType, public val `mode`: MobileIdentifierParamsMode, public val `unsafeMetadata`: JsonObject? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("identifier", JsonPrimitive(this@MobileIdentifierParams.`identifier`))
    putPresent("identifierType", this@MobileIdentifierParams.`identifierType`.toJson())
    putPresent("mode", this@MobileIdentifierParams.`mode`.toJson())
    putPresent("unsafeMetadata", this@MobileIdentifierParams.`unsafeMetadata`?.let { value -> value } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileIdentifierParams {
      val values = value.jsonObject

      return MobileIdentifierParams(`identifier` = (values["identifier"] ?: Undefined).requireString(), `identifierType` = MobileIdentifierParamsIdentifierType.fromJson((values["identifierType"] ?: Undefined), runtime), `mode` = MobileIdentifierParamsMode.fromJson((values["mode"] ?: Undefined), runtime), `unsafeMetadata` = (values["unsafeMetadata"] ?: Undefined).decodeOptional { value -> value.jsonObject })
    }
  }
}

public sealed class MobileIdentifierParamsIdentifierType(public val rawValue: String) {
  public data object Username : MobileIdentifierParamsIdentifierType("username")
  public data object EmailAddress : MobileIdentifierParamsIdentifierType("emailAddress")
  public data object PhoneNumber : MobileIdentifierParamsIdentifierType("phoneNumber")
  public data class Unrecognized(val value: String) : MobileIdentifierParamsIdentifierType(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileIdentifierParamsIdentifierType = when (val raw = value.requireString()) {
      "username" -> Username
      "emailAddress" -> EmailAddress
      "phoneNumber" -> PhoneNumber
      else -> Unrecognized(raw)
    }
  }
}

public sealed class MobileIdentifierParamsMode(public val rawValue: String) {
  public data object SignUp : MobileIdentifierParamsMode("signUp")
  public data object SignIn : MobileIdentifierParamsMode("signIn")
  public data object SignInOrUp : MobileIdentifierParamsMode("signInOrUp")
  public data class Unrecognized(val value: String) : MobileIdentifierParamsMode(value)
  public fun toJson(): JsonElement = JsonPrimitive(rawValue)
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileIdentifierParamsMode = when (val raw = value.requireString()) {
      "signUp" -> SignUp
      "signIn" -> SignIn
      "signInOrUp" -> SignInOrUp
      else -> Unrecognized(raw)
    }
  }
}

public data class MobileSetActiveParams(public val `organization`: Field<MobileSetActiveParamsOrganization> = Field.Omitted, public val `session`: Field<MobileSetActiveParamsSession> = Field.Omitted) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("organization", this@MobileSetActiveParams.`organization`.toJson { value -> value.toJson() })
    putPresent("session", this@MobileSetActiveParams.`session`.toJson { value -> value.toJson() })
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileSetActiveParams {
      val values = value.jsonObject

      return MobileSetActiveParams(`organization` = Field.fromJson((values["organization"] ?: Undefined)) { value -> MobileSetActiveParamsOrganization.fromJson(value, runtime) }, `session` = Field.fromJson((values["session"] ?: Undefined)) { value -> MobileSetActiveParamsSession.fromJson(value, runtime) })
    }
  }
}

public sealed interface MobileSetActiveParamsOrganization {
  public data class Case1(val value: String) : MobileSetActiveParamsOrganization
  public data class Case2(val value: Organization) : MobileSetActiveParamsOrganization
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to JsonPrimitive(value)))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileSetActiveParamsOrganization {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(payload.requireString())
        1 -> Case2(Organization.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

public sealed interface MobileSetActiveParamsSession {
  public data class Case1(val value: String) : MobileSetActiveParamsSession
  public data class Case2(val value: ActiveSession) : MobileSetActiveParamsSession
  public data class Case3(val value: PendingSession) : MobileSetActiveParamsSession
  public fun toJson(): JsonElement = when (this) {
    is Case1 -> JsonObject(mapOf("\$case" to JsonPrimitive(0), "value" to JsonPrimitive(value)))
    is Case2 -> JsonObject(mapOf("\$case" to JsonPrimitive(1), "value" to value.toJson()))
    is Case3 -> JsonObject(mapOf("\$case" to JsonPrimitive(2), "value" to value.toJson()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileSetActiveParamsSession {
      val values = value.jsonObject
      val payload = values["value"] ?: Undefined
      return when (values.getValue("\$case").jsonPrimitive.int) {
        0 -> Case1(payload.requireString())
        1 -> Case2(ActiveSession.fromJson(payload, runtime))
        2 -> Case3(PendingSession.fromJson(payload, runtime))
        else -> throw CoreException("invalid_value")
      }
    }
  }
}

/**
 * Represents a session resource that has completed all pending tasks
 * and authentication factors
 */
public data class ActiveSessionState(public val `user`: User, public val `id`: String, public val `expireAt`: Instant, public val `abandonAt`: Instant, public val `factorVerificationAge`: ActiveSessionFactorVerificationAgeValue?, public val `lastActiveOrganizationId`: String?, public val `lastActiveAt`: Instant, public val `actor`: JsonObject?, public val `agent`: JsonObject?, public val `tasks`: List<SessionTask>?, public val `currentTask`: SessionTask? = null, public val `publicUserData`: PublicUserData, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public val `status`: String get() = "active"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("status", JsonPrimitive("active"))
    putPresent("user", this@ActiveSessionState.`user`.toJson())
    putPresent("id", JsonPrimitive(this@ActiveSessionState.`id`))
    putPresent("expireAt", JsonPrimitive(this@ActiveSessionState.`expireAt`.toString()))
    putPresent("abandonAt", JsonPrimitive(this@ActiveSessionState.`abandonAt`.toString()))
    putPresent("factorVerificationAge", this@ActiveSessionState.`factorVerificationAge`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("lastActiveOrganizationId", this@ActiveSessionState.`lastActiveOrganizationId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("lastActiveAt", JsonPrimitive(this@ActiveSessionState.`lastActiveAt`.toString()))
    putPresent("actor", this@ActiveSessionState.`actor`?.let { value -> value } ?: JsonNull)
    putPresent("agent", this@ActiveSessionState.`agent`?.let { value -> value } ?: JsonNull)
    putPresent("tasks", this@ActiveSessionState.`tasks`?.let { value -> JsonArray(value.map { value -> value.toJson() }) } ?: JsonNull)
    putPresent("currentTask", this@ActiveSessionState.`currentTask`?.let { value -> value.toJson() } ?: Undefined)
    putPresent("publicUserData", this@ActiveSessionState.`publicUserData`.toJson())
    putPresent("createdAt", JsonPrimitive(this@ActiveSessionState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@ActiveSessionState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ActiveSessionState {
      val values = value.jsonObject
      require(values["status"] == JsonPrimitive("active"))
      return ActiveSessionState(`user` = User.fromJson((values["user"] ?: Undefined), runtime), `id` = (values["id"] ?: Undefined).requireString(), `expireAt` = Instant.parse((values["expireAt"] ?: Undefined).requireString()), `abandonAt` = Instant.parse((values["abandonAt"] ?: Undefined).requireString()), `factorVerificationAge` = (values["factorVerificationAge"] ?: Undefined).decodeOptional { value -> ActiveSessionFactorVerificationAgeValue.fromJson(value, runtime) }, `lastActiveOrganizationId` = (values["lastActiveOrganizationId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastActiveAt` = Instant.parse((values["lastActiveAt"] ?: Undefined).requireString()), `actor` = (values["actor"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `agent` = (values["agent"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `tasks` = (values["tasks"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> SessionTask.fromJson(value, runtime) } }, `currentTask` = (values["currentTask"] ?: Undefined).decodeOptional { value -> SessionTask.fromJson(value, runtime) }, `publicUserData` = PublicUserData.fromJson((values["publicUserData"] ?: Undefined), runtime), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class ActiveSession(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: ActiveSessionState get() = context.state(handle)
  public val changes: Flow<ActiveSessionState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `status`: String get() = state.`status`
  public val `user`: User get() = state.`user`
  public val `id`: String get() = state.`id`
  public val `expireAt`: Instant get() = state.`expireAt`
  public val `abandonAt`: Instant get() = state.`abandonAt`
  public val `factorVerificationAge`: ActiveSessionFactorVerificationAgeValue? get() = state.`factorVerificationAge`
  public val `lastActiveOrganizationId`: String? get() = state.`lastActiveOrganizationId`
  public val `lastActiveAt`: Instant get() = state.`lastActiveAt`
  public val `actor`: JsonObject? get() = state.`actor`
  public val `agent`: JsonObject? get() = state.`agent`
  public val `tasks`: List<SessionTask>? get() = state.`tasks`
  public val `currentTask`: SessionTask? get() = state.`currentTask`
  public val `publicUserData`: PublicUserData get() = state.`publicUserData`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = ActiveSessionState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ActiveSession = runtime.resource(ResourceHandle.fromReference(value)) as ActiveSession
  }
  /**
   * Marks the session as ended. The session will no longer be active for this `Client` and its status will become **ended**.
   */
  public suspend fun `end`(): Session {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.end", listOf()) { result ->
      Session.fromJson(result, runtime)
    }
  }
  /**
   * Invalidates the current session by marking it as removed. Once removed, the session will be deactivated for the current Client instance and its `status` will be set to `removed`. This operation cannot be undone.
   */
  public suspend fun `remove`(): Session {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.remove", listOf()) { result ->
      Session.fromJson(result, runtime)
    }
  }
  /**
   * Updates the session's last active timestamp to the current time. This method should be called periodically to indicate ongoing user activity and prevent the session from becoming stale. The updated timestamp is used for session management and analytics purposes.
   */
  public suspend fun `touch`(`params`: SessionTouchParams? = null): Session {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.touch", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Session.fromJson(result, runtime)
    }
  }
  /**
   * Gets the current user's [session token](https://clerk.com/docs/guides/sessions/session-tokens) or a [custom JWT template](https://clerk.com/docs/guides/sessions/jwt-templates).
   *
   * This method uses a cache so a network request will only be made if the token in memory has expired. The TTL for a Clerk token is one minute. It retries on transient failures (e.g., network errors); when the browser is offline and retries are exhausted, it throws `ClerkOfflineError`.
   *
   * Tokens can only be generated if the user is signed in.
   */
  public suspend fun `getToken`(`options`: GetTokenOptions? = null): String? {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.getToken", listOf(`options`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      result.decodeOptional { value -> value.requireString() }
    }
  }
  /**
   * Checks if the user is [authorized for the specified Role, Permission, Feature, or Plan](https://clerk.com/docs/guides/secure/authorization-checks) or requires the user to [reverify their credentials](https://clerk.com/docs/guides/secure/reverification) if their last verification is older than allowed.
   */
  public suspend fun `checkAuthorization`(`isAuthorizedParams`: CheckAuthorizationParams): Boolean {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.checkAuthorization", listOf(`isAuthorizedParams`.toJson())) { result ->
      result.requireBoolean()
    }
  }
  /**
   * Clears the cache for the current session. This is useful if the session has been updated and the cache is no longer valid.
   */
  public suspend fun `clearCache`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.clearCache", listOf()) { result ->
      Unit
    }
  }
  /**
   * Initiates the reverification flow.
   */
  public suspend fun `startVerification`(`params`: SessionVerifyCreateParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.startVerification", listOf(`params`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Initiates the [first factor verification](!first-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
   */
  public suspend fun `prepareFirstFactorVerification`(`factor`: SessionVerifyPrepareFirstFactorParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.prepareFirstFactorVerification", listOf(`factor`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Attempts to complete the [first factor verification](!first-factor-verification) process.
   */
  public suspend fun `attemptFirstFactorVerification`(`attemptFactor`: SessionVerifyAttemptFirstFactorParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.attemptFirstFactorVerification", listOf(`attemptFactor`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Initiates the [second factor verification](!second-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
   */
  public suspend fun `prepareSecondFactorVerification`(`params`: PhoneCodeSecondFactorConfig): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.prepareSecondFactorVerification", listOf(`params`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Attempts to complete the [second factor verification](!second-factor-verification) process.
   */
  public suspend fun `attemptSecondFactorVerification`(`params`: SessionVerifyAttemptSecondFactorParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.attemptSecondFactorVerification", listOf(`params`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Initiates a verification flow using passkeys.
   */
  public suspend fun `verifyWithPasskey`(): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.verifyWithPasskey", listOf()) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): ActiveSession {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "ActiveSession.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      ActiveSession.fromJson(result, runtime)
    }
  }
}

/**
 * Represents a session resource that has completed sign-in but has pending tasks
 */
public data class PendingSessionState(public val `user`: User, public val `currentTask`: SessionTask, public val `id`: String, public val `expireAt`: Instant, public val `abandonAt`: Instant, public val `factorVerificationAge`: PendingSessionFactorVerificationAgeValue?, public val `lastActiveOrganizationId`: String?, public val `lastActiveAt`: Instant, public val `actor`: JsonObject?, public val `agent`: JsonObject?, public val `tasks`: List<SessionTask>?, public val `publicUserData`: PublicUserData, public val `createdAt`: Instant, public val `updatedAt`: Instant) {
  public val `status`: String get() = "pending"
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("status", JsonPrimitive("pending"))
    putPresent("user", this@PendingSessionState.`user`.toJson())
    putPresent("currentTask", this@PendingSessionState.`currentTask`.toJson())
    putPresent("id", JsonPrimitive(this@PendingSessionState.`id`))
    putPresent("expireAt", JsonPrimitive(this@PendingSessionState.`expireAt`.toString()))
    putPresent("abandonAt", JsonPrimitive(this@PendingSessionState.`abandonAt`.toString()))
    putPresent("factorVerificationAge", this@PendingSessionState.`factorVerificationAge`?.let { value -> value.toJson() } ?: JsonNull)
    putPresent("lastActiveOrganizationId", this@PendingSessionState.`lastActiveOrganizationId`?.let { value -> JsonPrimitive(value) } ?: JsonNull)
    putPresent("lastActiveAt", JsonPrimitive(this@PendingSessionState.`lastActiveAt`.toString()))
    putPresent("actor", this@PendingSessionState.`actor`?.let { value -> value } ?: JsonNull)
    putPresent("agent", this@PendingSessionState.`agent`?.let { value -> value } ?: JsonNull)
    putPresent("tasks", this@PendingSessionState.`tasks`?.let { value -> JsonArray(value.map { value -> value.toJson() }) } ?: JsonNull)
    putPresent("publicUserData", this@PendingSessionState.`publicUserData`.toJson())
    putPresent("createdAt", JsonPrimitive(this@PendingSessionState.`createdAt`.toString()))
    putPresent("updatedAt", JsonPrimitive(this@PendingSessionState.`updatedAt`.toString()))
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PendingSessionState {
      val values = value.jsonObject
      require(values["status"] == JsonPrimitive("pending"))
      return PendingSessionState(`user` = User.fromJson((values["user"] ?: Undefined), runtime), `currentTask` = SessionTask.fromJson((values["currentTask"] ?: Undefined), runtime), `id` = (values["id"] ?: Undefined).requireString(), `expireAt` = Instant.parse((values["expireAt"] ?: Undefined).requireString()), `abandonAt` = Instant.parse((values["abandonAt"] ?: Undefined).requireString()), `factorVerificationAge` = (values["factorVerificationAge"] ?: Undefined).decodeOptional { value -> PendingSessionFactorVerificationAgeValue.fromJson(value, runtime) }, `lastActiveOrganizationId` = (values["lastActiveOrganizationId"] ?: Undefined).decodeOptional { value -> value.requireString() }, `lastActiveAt` = Instant.parse((values["lastActiveAt"] ?: Undefined).requireString()), `actor` = (values["actor"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `agent` = (values["agent"] ?: Undefined).decodeOptional { value -> value.jsonObject }, `tasks` = (values["tasks"] ?: Undefined).decodeOptional { value -> value.jsonArray.map { value -> SessionTask.fromJson(value, runtime) } }, `publicUserData` = PublicUserData.fromJson((values["publicUserData"] ?: Undefined), runtime), `createdAt` = Instant.parse((values["createdAt"] ?: Undefined).requireString()), `updatedAt` = Instant.parse((values["updatedAt"] ?: Undefined).requireString()))
    }
  }
}
public class PendingSession(override val handle: ResourceHandle, runtime: CoreRuntime) : CoreResource {
  override val context: ResourceContext = ResourceContext(runtime, handle, false)
  public val state: PendingSessionState get() = context.state(handle)
  public val changes: Flow<PendingSessionState> = runtime.changes.map { state }
  override val isInvalidated: Boolean get() = context.isInvalidated(handle)
  public val `status`: String get() = state.`status`
  public val `user`: User get() = state.`user`
  public val `currentTask`: SessionTask get() = state.`currentTask`
  public val `id`: String get() = state.`id`
  public val `expireAt`: Instant get() = state.`expireAt`
  public val `abandonAt`: Instant get() = state.`abandonAt`
  public val `factorVerificationAge`: PendingSessionFactorVerificationAgeValue? get() = state.`factorVerificationAge`
  public val `lastActiveOrganizationId`: String? get() = state.`lastActiveOrganizationId`
  public val `lastActiveAt`: Instant get() = state.`lastActiveAt`
  public val `actor`: JsonObject? get() = state.`actor`
  public val `agent`: JsonObject? get() = state.`agent`
  public val `tasks`: List<SessionTask>? get() = state.`tasks`
  public val `publicUserData`: PublicUserData get() = state.`publicUserData`
  public val `createdAt`: Instant get() = state.`createdAt`
  public val `updatedAt`: Instant get() = state.`updatedAt`
  override fun prepare(value: JsonElement): Any = PendingSessionState.fromJson(value, context.requireRuntime())
  public fun toJson(): JsonElement = buildJsonObject { put("\$ref", handle.toJson()) }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PendingSession = runtime.resource(ResourceHandle.fromReference(value)) as PendingSession
  }
  /**
   * Marks the session as ended. The session will no longer be active for this `Client` and its status will become **ended**.
   */
  public suspend fun `end`(): Session {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.end", listOf()) { result ->
      Session.fromJson(result, runtime)
    }
  }
  /**
   * Invalidates the current session by marking it as removed. Once removed, the session will be deactivated for the current Client instance and its `status` will be set to `removed`. This operation cannot be undone.
   */
  public suspend fun `remove`(): Session {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.remove", listOf()) { result ->
      Session.fromJson(result, runtime)
    }
  }
  /**
   * Updates the session's last active timestamp to the current time. This method should be called periodically to indicate ongoing user activity and prevent the session from becoming stale. The updated timestamp is used for session management and analytics purposes.
   */
  public suspend fun `touch`(`params`: SessionTouchParams? = null): Session {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.touch", listOf(`params`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      Session.fromJson(result, runtime)
    }
  }
  /**
   * Gets the current user's [session token](https://clerk.com/docs/guides/sessions/session-tokens) or a [custom JWT template](https://clerk.com/docs/guides/sessions/jwt-templates).
   *
   * This method uses a cache so a network request will only be made if the token in memory has expired. The TTL for a Clerk token is one minute. It retries on transient failures (e.g., network errors); when the browser is offline and retries are exhausted, it throws `ClerkOfflineError`.
   *
   * Tokens can only be generated if the user is signed in.
   */
  public suspend fun `getToken`(`options`: GetTokenOptions? = null): String? {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.getToken", listOf(`options`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      result.decodeOptional { value -> value.requireString() }
    }
  }
  /**
   * Checks if the user is [authorized for the specified Role, Permission, Feature, or Plan](https://clerk.com/docs/guides/secure/authorization-checks) or requires the user to [reverify their credentials](https://clerk.com/docs/guides/secure/reverification) if their last verification is older than allowed.
   */
  public suspend fun `checkAuthorization`(`isAuthorizedParams`: CheckAuthorizationParams): Boolean {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.checkAuthorization", listOf(`isAuthorizedParams`.toJson())) { result ->
      result.requireBoolean()
    }
  }
  /**
   * Clears the cache for the current session. This is useful if the session has been updated and the cache is no longer valid.
   */
  public suspend fun `clearCache`(): Unit {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.clearCache", listOf()) { result ->
      Unit
    }
  }
  /**
   * Initiates the reverification flow.
   */
  public suspend fun `startVerification`(`params`: SessionVerifyCreateParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.startVerification", listOf(`params`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Initiates the [first factor verification](!first-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
   */
  public suspend fun `prepareFirstFactorVerification`(`factor`: SessionVerifyPrepareFirstFactorParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.prepareFirstFactorVerification", listOf(`factor`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Attempts to complete the [first factor verification](!first-factor-verification) process.
   */
  public suspend fun `attemptFirstFactorVerification`(`attemptFactor`: SessionVerifyAttemptFirstFactorParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.attemptFirstFactorVerification", listOf(`attemptFactor`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Initiates the [second factor verification](!second-factor-verification) process. This is a required step to complete a reverification flow when using a preparable factor.
   */
  public suspend fun `prepareSecondFactorVerification`(`params`: PhoneCodeSecondFactorConfig): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.prepareSecondFactorVerification", listOf(`params`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Attempts to complete the [second factor verification](!second-factor-verification) process.
   */
  public suspend fun `attemptSecondFactorVerification`(`params`: SessionVerifyAttemptSecondFactorParams): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.attemptSecondFactorVerification", listOf(`params`.toJson())) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Initiates a verification flow using passkeys.
   */
  public suspend fun `verifyWithPasskey`(): SessionVerification {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.verifyWithPasskey", listOf()) { result ->
      SessionVerification.fromJson(result, runtime)
    }
  }
  /**
   * Reloads the resource, which is useful when you want to access the latest user data after performing a mutation. To make the updated data immediately available, this method forces a session token refresh instead of waiting for the automatic refresh cycle that could temporarily retain stale information. Learn more about [forcing a token refresh](https://clerk.com/docs/guides/sessions/force-token-refresh).
   */
  public suspend fun `reload`(`p`: ClerkResourceReloadParams? = null): PendingSession {
    val runtime = context.requireRuntime()
    return runtime.invoke(this, handle, "PendingSession.reload", listOf(`p`?.let { value -> value.toJson() } ?: Undefined)) { result ->
      PendingSession.fromJson(result, runtime)
    }
  }
}

public data class MobileSignOutOptions(public val `sessionId`: String? = null) {
  public fun toJson(): JsonElement = buildJsonObject {
    putPresent("sessionId", this@MobileSignOutOptions.`sessionId`?.let { value -> JsonPrimitive(value) } ?: Undefined)
  }
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): MobileSignOutOptions {
      val values = value.jsonObject

      return MobileSignOutOptions(`sessionId` = (values["sessionId"] ?: Undefined).decodeOptional { value -> value.requireString() })
    }
  }
}

public data class SessionFactorVerificationAgeValue(public val item0: Double, public val item1: Double) {
  public fun toJson(): JsonElement = JsonArray(listOf(JsonPrimitive(item0), JsonPrimitive(item1)))
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): SessionFactorVerificationAgeValue {
      val values = value.jsonArray
      require(values.size == 2)
      return SessionFactorVerificationAgeValue(item0 = values[0].requireDouble(), item1 = values[1].requireDouble())
    }
  }
}

public data class ActiveSessionFactorVerificationAgeValue(public val item0: Double, public val item1: Double) {
  public fun toJson(): JsonElement = JsonArray(listOf(JsonPrimitive(item0), JsonPrimitive(item1)))
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): ActiveSessionFactorVerificationAgeValue {
      val values = value.jsonArray
      require(values.size == 2)
      return ActiveSessionFactorVerificationAgeValue(item0 = values[0].requireDouble(), item1 = values[1].requireDouble())
    }
  }
}

public data class PendingSessionFactorVerificationAgeValue(public val item0: Double, public val item1: Double) {
  public fun toJson(): JsonElement = JsonArray(listOf(JsonPrimitive(item0), JsonPrimitive(item1)))
  public companion object {
    public fun fromJson(value: JsonElement, runtime: CoreRuntime): PendingSessionFactorVerificationAgeValue {
      val values = value.jsonArray
      require(values.size == 2)
      return PendingSessionFactorVerificationAgeValue(item0 = values[0].requireDouble(), item1 = values[1].requireDouble())
    }
  }
}

public object GeneratedBindings {
  public const val contractHash: String = "6ddbd6b9ae47c552373f1959973d24eeb1e24d979342c240962cf85a68d023bd"
  public const val protocolVersion: Int = 1
  public fun makeResource(handle: ResourceHandle, runtime: CoreRuntime): CoreResource = when (handle.type) {
    "Clerk" -> Clerk(handle, runtime)
    "TelemetryCollector" -> TelemetryCollector(handle, runtime)
    "Organization" -> Organization(handle, runtime)
    "OrganizationMembership" -> OrganizationMembership(handle, runtime)
    "OrganizationInvitation" -> OrganizationInvitation(handle, runtime)
    "Role" -> Role(handle, runtime)
    "Permission" -> Permission(handle, runtime)
    "OrganizationDomain" -> OrganizationDomain(handle, runtime)
    "OrganizationMembershipRequest" -> OrganizationMembershipRequest(handle, runtime)
    "EnterpriseConnection" -> EnterpriseConnection(handle, runtime)
    "EnterpriseConnectionTestRun" -> EnterpriseConnectionTestRun(handle, runtime)
    "BillingInitializedPaymentMethod" -> BillingInitializedPaymentMethod(handle, runtime)
    "BillingPaymentMethod" -> BillingPaymentMethod(handle, runtime)
    "Session" -> Session(handle, runtime)
    "User" -> User(handle, runtime)
    "EmailAddress" -> EmailAddress(handle, runtime)
    "Verification" -> Verification(handle, runtime)
    "IdentificationLink" -> IdentificationLink(handle, runtime)
    "CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress" -> CreateEmailLinkFlowReturnStartEmailLinkFlowParamsAndEmailAddress(handle, runtime)
    "CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress" -> CreateEnterpriseSSOLinkFlowReturnStartEnterpriseSSOLinkFlowParamsAndEmailAddress(handle, runtime)
    "PhoneNumber" -> PhoneNumber(handle, runtime)
    "Web3Wallet" -> Web3Wallet(handle, runtime)
    "ExternalAccount" -> ExternalAccount(handle, runtime)
    "EnterpriseAccount" -> EnterpriseAccount(handle, runtime)
    "EnterpriseAccountConnection" -> EnterpriseAccountConnection(handle, runtime)
    "Passkey" -> Passkey(handle, runtime)
    "PasskeyVerification" -> PasskeyVerification(handle, runtime)
    "SessionWithActivities" -> SessionWithActivities(handle, runtime)
    "ImageResource" -> ImageResource(handle, runtime)
    "UserOrganizationInvitation" -> UserOrganizationInvitation(handle, runtime)
    "OrganizationSuggestion" -> OrganizationSuggestion(handle, runtime)
    "OrganizationCreationDefaults" -> OrganizationCreationDefaults(handle, runtime)
    "SessionVerification" -> SessionVerification(handle, runtime)
    "EnvironmentResource" -> EnvironmentResource(handle, runtime)
    "BiometricCredentials" -> BiometricCredentials(handle, runtime)
    "SignIn" -> SignIn(handle, runtime)
    "SignInEmailCode" -> SignInEmailCode(handle, runtime)
    "SignInEmailLink" -> SignInEmailLink(handle, runtime)
    "SignInPhoneCode" -> SignInPhoneCode(handle, runtime)
    "SignInResetPasswordEmailCode" -> SignInResetPasswordEmailCode(handle, runtime)
    "SignInResetPasswordPhoneCode" -> SignInResetPasswordPhoneCode(handle, runtime)
    "SignInMfa" -> SignInMfa(handle, runtime)
    "SignUp" -> SignUp(handle, runtime)
    "SignUpVerifications" -> SignUpVerifications(handle, runtime)
    "SignUpVerification" -> SignUpVerification(handle, runtime)
    "ActiveSession" -> ActiveSession(handle, runtime)
    "PendingSession" -> PendingSession(handle, runtime)
    else -> throw CoreException("invalid_resource")
  }
}
