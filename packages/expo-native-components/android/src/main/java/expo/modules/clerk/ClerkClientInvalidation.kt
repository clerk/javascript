package expo.modules.clerk

import com.clerk.api.network.model.client.Client

/** The native client state that JS must refetch its own client for when it changes. */
internal data class ClerkClientFingerprint(
    val clientId: String?,
    val lastActiveSessionId: String?,
    val sessions: List<SessionState>,
    val activeUserId: String?,
    val activeUserUpdatedAt: Long?,
    val deviceToken: String?
) {
    data class SessionState(val id: String, val status: String)

    companion object {
        fun from(client: Client?, deviceToken: String?): ClerkClientFingerprint {
            val activeUser = client?.sessions?.firstOrNull { it.id == client.lastActiveSessionId }?.user
            return ClerkClientFingerprint(
                clientId = client?.id,
                lastActiveSessionId = client?.lastActiveSessionId,
                sessions = client?.sessions?.map { SessionState(it.id, it.status.name) }.orEmpty(),
                activeUserId = activeUser?.id,
                activeUserUpdatedAt = activeUser?.updatedAt,
                deviceToken = deviceToken
            )
        }
    }
}

/**
 * Emits one payload-free invalidation per main-loop turn in which the fingerprint moved away from
 * the last state JS was told about. Not thread-safe: call it from the main thread only.
 */
internal class ClerkClientInvalidationTracker(
    private val schedule: (() -> Unit) -> Unit,
    private val emit: () -> Unit
) {
    private var baseline: ClerkClientFingerprint? = null
    private var latest: ClerkClientFingerprint? = null
    private var isFlushScheduled = false

    /** Sets the state JS already knows about without emitting. */
    fun reset(fingerprint: ClerkClientFingerprint?) {
        baseline = fingerprint
        latest = fingerprint
    }

    fun observe(fingerprint: ClerkClientFingerprint) {
        if (baseline == null) return
        latest = fingerprint
        if (fingerprint == baseline || isFlushScheduled) return
        isFlushScheduled = true
        schedule(::flush)
    }

    /** A token JS wrote itself is not news to JS, so it must not echo back as an invalidation. */
    fun acknowledgeDeviceToken(token: String?, current: ClerkClientFingerprint) {
        baseline = baseline?.copy(deviceToken = token)
        observe(current)
    }

    private fun flush() {
        isFlushScheduled = false
        val current = latest ?: return
        if (current == baseline) return
        baseline = current
        emit()
    }
}

internal data class ClerkDeviceTokenBridgeError(val code: String, val message: String)

internal fun clerkSetDeviceTokenBridgeError(throwable: Throwable): ClerkDeviceTokenBridgeError = when (throwable) {
    is IllegalArgumentException -> ClerkDeviceTokenBridgeError(
        "E_INVALID_DEVICE_TOKEN",
        throwable.message ?: "Device token must not be blank"
    )
    is IllegalStateException -> ClerkDeviceTokenBridgeError(
        "E_NOT_CONFIGURED",
        throwable.message ?: "Clerk must be configured with configureNative before syncing client state."
    )
    else -> ClerkDeviceTokenBridgeError(
        "E_SET_DEVICE_TOKEN_FAILED",
        throwable.message ?: "Unable to set the device token"
    )
}
