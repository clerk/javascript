package expo.modules.clerk

import com.clerk.api.network.model.client.Client
import com.clerk.api.session.Session
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ClientSignedOutTest {
    private val signedIn = Client(id = "client_1", sessions = listOf(session("sess_1")))
    private val signedOut = Client(id = "client_1")

    @Test
    fun `a client that loses its last session signed out`() {
        assertTrue(clientSignedOut(signedIn, signedOut))
        assertTrue(clientSignedOut(signedIn, null))
    }

    @Test
    fun `a client that keeps a session or never had one did not sign out`() {
        assertFalse(clientSignedOut(signedIn, signedIn))
        assertFalse(clientSignedOut(signedOut, signedOut))
        assertFalse(clientSignedOut(null, signedOut))
        assertFalse(clientSignedOut(signedOut, signedIn))
    }

    private fun session(id: String) =
        Session(id = id, expireAt = 0, lastActiveAt = 0, createdAt = 0, updatedAt = 0)
}
