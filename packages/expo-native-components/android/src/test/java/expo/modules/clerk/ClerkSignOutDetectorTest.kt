package expo.modules.clerk

import com.clerk.api.network.model.client.Client
import com.clerk.api.network.model.userdata.PublicUserData
import com.clerk.api.session.Session
import org.junit.Assert.assertEquals
import org.junit.Test

class ClerkSignOutDetectorTest {
    private val now = 1_000_000L
    private val signedOut = Client(id = "client_1")
    private val alice = client(session("sess_1", "user_alice"))
    private val aliceAndBob = client(session("sess_1", "user_alice"), session("sess_2", "user_bob"))

    @Test
    fun `a signed-in user leaving the client is a sign-out`() {
        assertEquals(listOf(false, true), detect(alice, signedOut))
        assertEquals(listOf(false, true), detect(aliceAndBob, alice))
        assertEquals(listOf(false, true), detect(alice, client(session("sess_1", "user_alice", Session.SessionStatus.ENDED))))
        assertEquals(listOf(false, true), detect(client(session("sess_1", "user_alice", Session.SessionStatus.PENDING)), signedOut))
        assertEquals(listOf(false, true), detect(client(session("sess_1", user = null)), signedOut))
    }

    @Test
    fun `keeping or adding users is not a sign-out`() {
        assertEquals(listOf(false, false), detect(alice, alice))
        assertEquals(listOf(false, false), detect(alice, aliceAndBob))
        assertEquals(listOf(false, false), detect(signedOut, alice))
        assertEquals(listOf(false, false), detect(client(session("sess_1", "user_alice", Session.SessionStatus.PENDING)), alice))
        assertEquals(listOf(false, false), detect(client(session("sess_1", user = null)), alice))
    }

    @Test
    fun `a sign-in right after a sign-out clears once`() {
        val bob = client(session("sess_2", "user_bob"))
        assertEquals(listOf(false, true, false), detect(alice, signedOut, bob))
        assertEquals(listOf(false, true, false), detect(alice, signedOut, alice))
    }

    @Test
    fun `another user replacing the signed-in user in one update is a sign-out`() {
        assertEquals(listOf(false, true), detect(alice, client(session("sess_2", "user_bob"))))
    }

    @Test
    fun `the same user on a new client after a device token swap is not a sign-out`() {
        val aliceOnNewClient = Client(id = "client_2", sessions = listOf(session("sess_9", "user_alice")))
        assertEquals(listOf(false, false, false), detect(alice, Client(), aliceOnNewClient))
    }

    @Test
    fun `a client that is not known yet is skipped until one is`() {
        assertEquals(listOf(false, false, true), detect(alice, null, signedOut))
        assertEquals(listOf(false, false, true), detect(alice, Client(), signedOut))
        assertEquals(listOf(false, false), detect(null, signedOut))
    }

    @Test
    fun `a session that has passed its expiry is not a sign-out`() {
        assertEquals(listOf(false, false), detect(client(session("sess_1", "user_alice", expireAt = now)), signedOut))
        assertEquals(listOf(false, true), detect(client(session("sess_1", "user_alice", expireAt = now + 1)), signedOut))
    }

    private fun detect(vararg clients: Client?): List<Boolean> {
        val detector = ClerkSignOutDetector()
        return clients.map { detector.signedOut(it, now) }
    }

    private fun client(vararg sessions: Session) = Client(id = "client_1", sessions = sessions.toList())

    private fun session(
        id: String,
        user: String?,
        status: Session.SessionStatus = Session.SessionStatus.ACTIVE,
        expireAt: Long = 0,
    ) = Session(
        id = id,
        status = status,
        expireAt = expireAt,
        lastActiveAt = 0,
        createdAt = 0,
        updatedAt = 0,
        publicUserData = user?.let { PublicUserData(hasImage = false, identifier = it, userId = it) },
    )
}
