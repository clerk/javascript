package expo.modules.clerk.googlesignin

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ClerkGoogleSignInModuleTest {
  @Test
  fun identifiesExplicitUserCancellation() {
    assertTrue(isExplicitUserCancellation("[16] Cancelled by user."))
    assertTrue(isExplicitUserCancellation("Canceled by user"))
    assertTrue(isExplicitUserCancellation("  cancelled by user  "))
  }

  @Test
  fun preservesProviderFailures() {
    assertFalse(isExplicitUserCancellation("[16] Account reauth failed."))
    assertFalse(isExplicitUserCancellation("Developer console is not set up correctly."))
    assertFalse(isExplicitUserCancellation("Request was not cancelled by user"))
  }
}
