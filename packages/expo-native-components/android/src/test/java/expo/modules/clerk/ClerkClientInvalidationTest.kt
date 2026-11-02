package expo.modules.clerk

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class ClerkClientInvalidationTest {
    private val scheduled = mutableListOf<() -> Unit>()
    private var emitCount = 0

    private fun tracker() = ClerkClientInvalidationTracker(
        schedule = { scheduled.add(it) },
        emit = { emitCount += 1 }
    )

    private fun runLoopTurn() {
        val work = scheduled.toList()
        scheduled.clear()
        work.forEach { it() }
    }

    private fun fingerprint(
        clientId: String? = "client_1",
        sessions: List<ClerkClientFingerprint.SessionState> = listOf(ClerkClientFingerprint.SessionState("sess_1", "ACTIVE")),
        userUpdatedAt: Long? = 1,
        deviceToken: String? = "token_1"
    ) = ClerkClientFingerprint(
        clientId = clientId,
        lastActiveSessionId = sessions.firstOrNull()?.id,
        sessions = sessions,
        activeUserId = if (sessions.isEmpty()) null else "user_1",
        activeUserUpdatedAt = if (sessions.isEmpty()) null else userUpdatedAt,
        deviceToken = deviceToken
    )

    @Before
    fun setUp() {
        scheduled.clear()
        emitCount = 0
    }

    @Test
    fun `does not emit before a baseline or for unchanged state`() {
        val tracker = tracker()
        tracker.observe(fingerprint())
        assertTrue(scheduled.isEmpty())

        tracker.reset(fingerprint())
        tracker.observe(fingerprint())
        runLoopTurn()
        assertEquals(0, emitCount)
    }

    @Test
    fun `emits for each fingerprint field`() {
        val changes = listOf(
            fingerprint(clientId = "client_2"),
            fingerprint(sessions = listOf(ClerkClientFingerprint.SessionState("sess_1", "ENDED"))),
            fingerprint(sessions = emptyList()),
            fingerprint(userUpdatedAt = 2),
            fingerprint(deviceToken = "token_2")
        )

        for (change in changes) {
            val tracker = tracker()
            tracker.reset(fingerprint())
            emitCount = 0
            tracker.observe(change)
            runLoopTurn()
            assertEquals(change.toString(), 1, emitCount)
        }
    }

    @Test
    fun `coalesces changes within one loop turn`() {
        val tracker = tracker()
        tracker.reset(fingerprint())

        tracker.observe(fingerprint(deviceToken = "token_2"))
        tracker.observe(fingerprint(clientId = "client_2", deviceToken = "token_2"))
        tracker.observe(fingerprint(clientId = "client_3", deviceToken = "token_3"))
        assertEquals(1, scheduled.size)
        runLoopTurn()
        assertEquals(1, emitCount)

        tracker.observe(fingerprint(clientId = "client_3", deviceToken = "token_3"))
        runLoopTurn()
        assertEquals(1, emitCount)

        tracker.observe(fingerprint(clientId = "client_4", deviceToken = "token_3"))
        runLoopTurn()
        assertEquals(2, emitCount)
    }

    @Test
    fun `a change reverted within one loop turn does not emit`() {
        val tracker = tracker()
        tracker.reset(fingerprint())

        tracker.observe(fingerprint(clientId = "client_2"))
        tracker.observe(fingerprint())
        runLoopTurn()
        assertEquals(0, emitCount)
    }

    @Test
    fun `an acknowledged device token does not echo`() {
        val tracker = tracker()
        tracker.reset(fingerprint())

        tracker.acknowledgeDeviceToken("token_2", fingerprint(deviceToken = "token_2"))
        runLoopTurn()
        assertEquals(0, emitCount)

        tracker.acknowledgeDeviceToken("token_3", fingerprint(clientId = "client_2", deviceToken = "token_3"))
        runLoopTurn()
        assertEquals(1, emitCount)
    }

    @Test
    fun `maps setDeviceToken exceptions to stable codes`() {
        assertEquals("E_INVALID_DEVICE_TOKEN", clerkSetDeviceTokenBridgeError(IllegalArgumentException("blank")).code)
        assertEquals("E_NOT_CONFIGURED", clerkSetDeviceTokenBridgeError(IllegalStateException("not initialized")).code)
        assertEquals("E_SET_DEVICE_TOKEN_FAILED", clerkSetDeviceTokenBridgeError(RuntimeException("boom")).code)
    }
}
