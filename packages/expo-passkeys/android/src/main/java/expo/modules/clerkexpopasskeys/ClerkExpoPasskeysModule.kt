package expo.modules.clerkexpopasskeys

import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.GetCredentialException
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.launch

class ClerkExpoPasskeysModule : Module() {

    override fun definition() = ModuleDefinition {
        Name("ClerkExpoPasskeys")

        AsyncFunction("create") { request: String, promise: Promise ->
            appContext.modulesQueue.launch {
                try {
                    val response = createPasskey(request, appContext)
                    promise.resolve(response)
                } catch (e: CreateCredentialException) {
                    handleCreationFailure(e, promise)
                }
            }
        }

        AsyncFunction("get") { request: String, promise: Promise ->
            appContext.modulesQueue.launch {
                try {
                    val response = getPasskey(request, appContext)
                    promise.resolve(response)
                } catch (e: GetCredentialException) {
                    handleGetFailure(e, promise)
                }
            }
        }
    }
}
