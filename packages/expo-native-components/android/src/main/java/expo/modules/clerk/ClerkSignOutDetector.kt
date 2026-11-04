package expo.modules.clerk

import com.clerk.api.network.model.client.Client
import com.clerk.api.session.Session

internal class ClerkSignOutDetector {
    private var lastKnownClient: Client? = null

    fun signedOut(client: Client?, nowMillis: Long): Boolean {
        if (client?.id == null) return false
        val previous = lastKnownClient
        lastKnownClient = client
        val remainingUsers = client.signedInSessions().mapTo(mutableSetOf()) { it.userKey() }
        return previous?.signedInSessions().orEmpty().any {
            it.userKey() !in remainingUsers && !it.hasExpiredBy(nowMillis)
        }
    }
}

private fun Client.signedInSessions(): List<Session> =
    sessions.filter { it.status == Session.SessionStatus.ACTIVE || it.status == Session.SessionStatus.PENDING }

private fun Session.userKey(): String = user?.id ?: publicUserData?.userId ?: id

private fun Session.hasExpiredBy(nowMillis: Long): Boolean = expireAt in 1..nowMillis
