package expo.modules.clerkexpopasskeys

import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.GetCredentialException
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class GetPasskeyOptionsArgument : Record {
    @Field var preferImmediatelyAvailableCredentials: Boolean = false
}

class ClerkExpoPasskeysModule : Module() {
    private val mCoroutine = CoroutineScope(Dispatchers.Default)

    override fun definition() = ModuleDefinition {
        Name("ClerkExpoPasskeys")

        AsyncFunction("create") { request: String, promise: Promise ->

            mCoroutine.launch {
                try {
                    val response = createPasskey(request, appContext)
                    promise.resolve(response)

                } catch (e: CreateCredentialException) {
                    handleCreationFailure(e, promise)
                }
            }

        }

        AsyncFunction("get") { request: String, promise: Promise ->
            launchGet(request, false, promise)
        }

        AsyncFunction("getWithOptions") { request: String, options: GetPasskeyOptionsArgument, promise: Promise ->
            launchGet(request, options.preferImmediatelyAvailableCredentials, promise)
        }


    }

    private fun launchGet(request: String, preferImmediatelyAvailableCredentials: Boolean, promise: Promise) {
        mCoroutine.launch {
            try {
                val response = getPasskey(request, preferImmediatelyAvailableCredentials, appContext)
                promise.resolve(response)
            } catch (e: GetCredentialException) {
                handleGetFailure(e, promise)
            }
        }
    }
}
