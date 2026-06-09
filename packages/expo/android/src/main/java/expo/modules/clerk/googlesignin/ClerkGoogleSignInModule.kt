package expo.modules.clerk.googlesignin

import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ClerkGoogleSignInModule : Module() {
  private var webClientId: String? = null
  private var hostedDomain: String? = null
  private var autoSelectEnabled: Boolean = false
  private val mainScope = CoroutineScope(Dispatchers.Main)

  private val credentialManager: CredentialManager
    get() = CredentialManager.create(requireNotNull(appContext.reactContext))

  override fun definition() = ModuleDefinition {
    Name("ClerkGoogleSignIn")

    Function("configure") { params: Map<String, Any?> ->
      configure(params)
    }

    AsyncFunction("signIn") { params: Map<String, Any?>?, promise: Promise ->
      signIn(params, promise)
    }

    AsyncFunction("createAccount") { params: Map<String, Any?>?, promise: Promise ->
      createAccount(params, promise)
    }

    AsyncFunction("presentExplicitSignIn") { params: Map<String, Any?>?, promise: Promise ->
      presentExplicitSignIn(params, promise)
    }

    AsyncFunction("signOut") { promise: Promise ->
      signOut(promise)
    }
  }

  // MARK: - configure

  private fun configure(params: Map<String, Any?>) {
    webClientId = params["webClientId"] as? String
    hostedDomain = params["hostedDomain"] as? String
    autoSelectEnabled = params["autoSelectEnabled"] as? Boolean ?: false
  }

  // MARK: - signIn

  private fun signIn(params: Map<String, Any?>?, promise: Promise) {
    val clientId = webClientId ?: run {
      promise.reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.", null)
      return
    }

    val activity = appContext.currentActivity ?: run {
      promise.reject("E_ACTIVITY_UNAVAILABLE", "Activity is not available", null)
      return
    }

    mainScope.launch {
      try {
        val filterByAuthorized = params?.get("filterByAuthorizedAccounts") as? Boolean ?: true
        val nonce = params?.get("nonce") as? String

        val googleIdOption = GetGoogleIdOption.Builder()
          .setFilterByAuthorizedAccounts(filterByAuthorized)
          .setServerClientId(clientId)
          .setAutoSelectEnabled(autoSelectEnabled)
          .apply {
            nonce?.let { setNonce(it) }
          }
          .build()

        val request = GetCredentialRequest.Builder()
          .addCredentialOption(googleIdOption)
          .build()

        val result = credentialManager.getCredential(
          request = request,
          context = activity
        )

        handleSignInResult(result, promise)
      } catch (e: GetCredentialCancellationException) {
        promise.reject("SIGN_IN_CANCELLED", "User cancelled the sign-in flow", e)
      } catch (e: NoCredentialException) {
        promise.reject("NO_SAVED_CREDENTIAL_FOUND", "No saved credential found", e)
      } catch (e: GetCredentialException) {
        promise.reject("GOOGLE_SIGN_IN_ERROR", e.message ?: "Unknown error", e)
      } catch (e: Exception) {
        promise.reject("GOOGLE_SIGN_IN_ERROR", e.message ?: "Unknown error", e)
      }
    }
  }

  // MARK: - createAccount

  private fun createAccount(params: Map<String, Any?>?, promise: Promise) {
    val clientId = webClientId ?: run {
      promise.reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.", null)
      return
    }

    val activity = appContext.currentActivity ?: run {
      promise.reject("E_ACTIVITY_UNAVAILABLE", "Activity is not available", null)
      return
    }

    mainScope.launch {
      try {
        val nonce = params?.get("nonce") as? String

        val googleIdOption = GetGoogleIdOption.Builder()
          .setFilterByAuthorizedAccounts(false) // Show all accounts for creation
          .setServerClientId(clientId)
          .apply {
            nonce?.let { setNonce(it) }
          }
          .build()

        val request = GetCredentialRequest.Builder()
          .addCredentialOption(googleIdOption)
          .build()

        val result = credentialManager.getCredential(
          request = request,
          context = activity
        )

        handleSignInResult(result, promise)
      } catch (e: GetCredentialCancellationException) {
        promise.reject("SIGN_IN_CANCELLED", "User cancelled the sign-in flow", e)
      } catch (e: NoCredentialException) {
        promise.reject("NO_SAVED_CREDENTIAL_FOUND", "No saved credential found", e)
      } catch (e: GetCredentialException) {
        promise.reject("GOOGLE_SIGN_IN_ERROR", e.message ?: "Unknown error", e)
      } catch (e: Exception) {
        promise.reject("GOOGLE_SIGN_IN_ERROR", e.message ?: "Unknown error", e)
      }
    }
  }

  // MARK: - presentExplicitSignIn

  private fun presentExplicitSignIn(params: Map<String, Any?>?, promise: Promise) {
    val clientId = webClientId ?: run {
      promise.reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.", null)
      return
    }

    val activity = appContext.currentActivity ?: run {
      promise.reject("E_ACTIVITY_UNAVAILABLE", "Activity is not available", null)
      return
    }

    mainScope.launch {
      try {
        val nonce = params?.get("nonce") as? String

        val signInWithGoogleOption = GetSignInWithGoogleOption.Builder(clientId)
          .apply {
            nonce?.let { setNonce(it) }
            hostedDomain?.let { setHostedDomainFilter(it) }
          }
          .build()

        val request = GetCredentialRequest.Builder()
          .addCredentialOption(signInWithGoogleOption)
          .build()

        val result = credentialManager.getCredential(
          request = request,
          context = activity
        )

        handleSignInResult(result, promise)
      } catch (e: GetCredentialCancellationException) {
        promise.reject("SIGN_IN_CANCELLED", "User cancelled the sign-in flow", e)
      } catch (e: GetCredentialException) {
        promise.reject("GOOGLE_SIGN_IN_ERROR", e.message ?: "Unknown error", e)
      } catch (e: Exception) {
        promise.reject("GOOGLE_SIGN_IN_ERROR", e.message ?: "Unknown error", e)
      }
    }
  }

  // MARK: - signOut

  private fun signOut(promise: Promise) {
    mainScope.launch {
      try {
        credentialManager.clearCredentialState(ClearCredentialStateRequest())
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("GOOGLE_SIGN_IN_ERROR", e.message ?: "Failed to sign out", e)
      }
    }
  }

  // MARK: - Helpers

  private fun handleSignInResult(result: GetCredentialResponse, promise: Promise) {
    when (val credential = result.credential) {
      is CustomCredential -> {
        if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
          try {
            val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)

            val user = mapOf(
              "id" to googleIdTokenCredential.id,
              "email" to googleIdTokenCredential.id,
              "name" to googleIdTokenCredential.displayName,
              "givenName" to googleIdTokenCredential.givenName,
              "familyName" to googleIdTokenCredential.familyName,
              "photo" to googleIdTokenCredential.profilePictureUri?.toString()
            )

            val data = mapOf(
              "idToken" to googleIdTokenCredential.idToken,
              "user" to user
            )

            promise.resolve(
              mapOf(
                "type" to "success",
                "data" to data
              )
            )
          } catch (e: GoogleIdTokenParsingException) {
            promise.reject("GOOGLE_SIGN_IN_ERROR", "Failed to parse Google ID token: ${e.message}", e)
          }
        } else {
          promise.reject("GOOGLE_SIGN_IN_ERROR", "Unexpected credential type: ${credential.type}", null)
        }
      }
      else -> {
        promise.reject("GOOGLE_SIGN_IN_ERROR", "Unexpected credential type", null)
      }
    }
  }
}
