package expo.modules.clerk

import com.clerk.api.network.model.client.Client
import com.clerk.api.session.Session
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SignedInSessionEndedTest {
    private val signedOut = Client(id = "client_1")
    private val one = client(session("sess_1"))
    private val two = client(session("sess_1"), session("sess_2"))

    @Test
    fun `losing a signed-in session ends it`() {
        assertTrue(signedInSessionEnded(one, signedOut))
        assertTrue(signedInSessionEnded(two, one))
        assertTrue(signedInSessionEnded(one, client(session("sess_1", Session.SessionStatus.ENDED))))
        assertTrue(signedInSessionEnded(client(session("sess_1", Session.SessionStatus.PENDING)), signedOut))
    }

    @Test
    fun `keeping, adding or not yet knowing the sessions ends nothing`() {
        assertFalse(signedInSessionEnded(one, one))
        assertFalse(signedInSessionEnded(one, two))
        assertFalse(signedInSessionEnded(signedOut, one))
        assertFalse(signedInSessionEnded(null, signedOut))
        assertFalse(signedInSessionEnded(one, null))
        assertFalse(signedInSessionEnded(client(session("sess_1", Session.SessionStatus.PENDING)), one))
    }

    private fun client(vararg sessions: Session) = Client(id = "client_1", sessions = sessions.toList())

    private fun session(id: String, status: Session.SessionStatus = Session.SessionStatus.ACTIVE) =
        Session(id = id, status = status, expireAt = 0, lastActiveAt = 0, createdAt = 0, updatedAt = 0)
}
