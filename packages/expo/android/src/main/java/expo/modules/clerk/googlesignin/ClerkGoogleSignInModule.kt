package expo.modules.clerk.googlesignin

import android.content.Context
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import expo.modules.clerk.NativeClerkGoogleSignInSpec
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class ClerkGoogleSignInModule(reactContext: ReactApplicationContext) :
    NativeClerkGoogleSignInSpec(reactContext) {

  private var webClientId: String? = null
  private var hostedDomain: String? = null
  private var autoSelectEnabled: Boolean = false
  private val mainScope = CoroutineScope(Dispatchers.Main)

  private val credentialManager: CredentialManager
    get() = CredentialManager.create(reactApplicationContext)

  override fun getName(): String = "ClerkGoogleSignIn"

  // MARK: - configure

  @ReactMethod
  override fun configure(params: ReadableMap) {
    webClientId = if (params.hasKey("webClientId")) params.getString("webClientId") else null
    hostedDomain = if (params.hasKey("hostedDomain")) params.getString("hostedDomain") else null
    autoSelectEnabled = if (params.hasKey("autoSelectEnabled")) params.getBoolean("autoSelectEnabled") else false
  }

  // MARK: - signIn

  @ReactMethod
  override fun signIn(params: ReadableMap?, promise: Promise) {
    val clientId = webClientId ?: run {
      promise.reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.")
      return
    }

    val activity = getCurrentActivity() ?: run {
      promise.reject("E_ACTIVITY_UNAVAILABLE", "Activity is not available")
      return
    }

    mainScope.launch {
      try {
        val filterByAuthorized = params?.let {
          if (it.hasKey("filterByAuthorizedAccounts")) it.getBoolean("filterByAuthorizedAccounts") else true
        } ?: true
        val nonce = params?.let {
          if (it.hasKey("nonce")) it.getString("nonce") else null
        }

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

  @ReactMethod
  override fun createAccount(params: ReadableMap?, promise: Promise) {
    val clientId = webClientId ?: run {
      promise.reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.")
      return
    }

    val activity = getCurrentActivity() ?: run {
      promise.reject("E_ACTIVITY_UNAVAILABLE", "Activity is not available")
      return
    }

    mainScope.launch {
      try {
        val nonce = params?.let {
          if (it.hasKey("nonce")) it.getString("nonce") else null
        }

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

  @ReactMethod
  override fun presentExplicitSignIn(params: ReadableMap?, promise: Promise) {
    val clientId = webClientId ?: run {
      promise.reject("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.")
      return
    }

    val activity = getCurrentActivity() ?: run {
      promise.reject("E_ACTIVITY_UNAVAILABLE", "Activity is not available")
      return
    }

    mainScope.launch {
      try {
        val nonce = params?.let {
          if (it.hasKey("nonce")) it.getString("nonce") else null
        }

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

  @ReactMethod
  override fun signOut(promise: Promise) {
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

            val userMap = WritableNativeMap().apply {
              putString("id", googleIdTokenCredential.id)
              putString("email", googleIdTokenCredential.id)
              putString("name", googleIdTokenCredential.displayName)
              putString("givenName", googleIdTokenCredential.givenName)
              putString("familyName", googleIdTokenCredential.familyName)
              putString("photo", googleIdTokenCredential.profilePictureUri?.toString())
            }

            val dataMap = WritableNativeMap().apply {
              putString("idToken", googleIdTokenCredential.idToken)
              putMap("user", userMap)
            }

            val responseMap = WritableNativeMap().apply {
              putString("type", "success")
              putMap("data", dataMap)
            }

            promise.resolve(responseMap)
          } catch (e: GoogleIdTokenParsingException) {
            promise.reject("GOOGLE_SIGN_IN_ERROR", "Failed to parse Google ID token: ${e.message}", e)
          }
        } else {
          promise.reject("GOOGLE_SIGN_IN_ERROR", "Unexpected credential type: ${credential.type}")
        }
      }
      else -> {
        promise.reject("GOOGLE_SIGN_IN_ERROR", "Unexpected credential type")
      }
    }
  }
}
