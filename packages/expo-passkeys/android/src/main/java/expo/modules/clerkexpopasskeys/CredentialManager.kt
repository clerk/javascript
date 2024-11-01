package expo.modules.clerkexpopasskeys

import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import expo.modules.kotlin.AppContext

suspend fun createPasskey(
    request: String,
    appContext: AppContext,
): String? {
    val credentialManager =
        CredentialManager.create(appContext.reactContext?.applicationContext!!)
    val createRequest = CreatePublicKeyCredentialRequest(request)

    var response = appContext.activityProvider?.currentActivity?.let {
        credentialManager.createCredential(it, createRequest)
    }
    return response?.data?.getString("androidx.credentials.BUNDLE_KEY_REGISTRATION_RESPONSE_JSON")
}

suspend fun getPasskey(
    request: String,
    appContext: AppContext,
): String? {
    val credentialManager =
        CredentialManager.create(appContext.reactContext?.applicationContext!!)
    val getCredentialRequest =
        GetCredentialRequest(listOf(GetPublicKeyCredentialOption(request)))

    val result = appContext.activityProvider?.currentActivity?.let {
        credentialManager.getCredential(it, getCredentialRequest)
    }
    return result?.credential?.data?.getString("androidx.credentials.BUNDLE_KEY_AUTHENTICATION_RESPONSE_JSON")
}