package com.clerk.e2ehooks

import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Fixture-only Maestro hook. Never ship this in a real app.
 */
class E2EHooksModule : Module() {
    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    override fun definition() = ModuleDefinition {
        Name("E2EHooks")

        // Reproduces the stale-token foreground refresh from MOBILE-594: replace
        // the native device token with garbage and refresh, so the server hands
        // native a brand-new session-less client whose token is emitted to JS.
        AsyncFunction("corruptNativeDeviceToken") { promise: Promise ->
            coroutineScope.launch {
                try {
                    val result = Clerk.updateDeviceToken("e2e-stale-device-token")
                    promise.resolve(result is ClerkResult.Success)
                } catch (e: Exception) {
                    promise.reject("E_CORRUPT_FAILED", e.message, e)
                }
            }
        }
    }
}
