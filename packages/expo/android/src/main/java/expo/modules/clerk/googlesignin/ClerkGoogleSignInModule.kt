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
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

// Configuration parameters
class ConfigureParams : Record {
  @Field
  val webClientId: String = ""

  @Field
  val hostedDomain: String? = null

  @Field
  val autoSelectEnabled: Boolean? = null
}

// Sign-in parameters
class SignInParams : Record {
  @Field
  val nonce: String? = null

  @Field
  val filterByAuthorizedAccounts: Boolean? = null
}

// Create account parameters
class CreateAccountParams : Record {
  @Field
  val nonce: String? = null
}

// Explicit sign-in parameters
class ExplicitSignInParams : Record {
  @Field
  val nonce: String? = null
}

// Custom exceptions
class GoogleSignInCancelledException : CodedException("SIGN_IN_CANCELLED", "User cancelled the sign-in flow", null)
class GoogleSignInNoCredentialException : CodedException("NO_SAVED_CREDENTIAL_FOUND", "No saved credential found", null)
class GoogleSignInException(message: String) : CodedException("GOOGLE_SIGN_IN_ERROR", message, null)
class GoogleSignInNotConfiguredException : CodedException("NOT_CONFIGURED", "Google Sign-In is not configured. Call configure() first.", null)

class ClerkGoogleSignInModule : Module() {
  private var webClientId: String? = null
  private var hostedDomain: String? = null
  private var autoSelectEnabled: Boolean = false
  private val mainScope = CoroutineScope(Dispatchers.Main)

  private val context: Context
    get() = requireNotNull(appContext.reactContext)

  private val credentialManager: CredentialManager
    get() = CredentialManager.create(context)

  override fun definition() = ModuleDefinition {
    Name("ClerkGoogleSignIn")

    // Configure the module
    Function("configure") { params: ConfigureParams ->
      webClientId = params.webClientId
      hostedDomain = params.hostedDomain
      autoSelectEnabled = params.autoSelectEnabled ?: false
    }

    // Sign in - attempts automatic sign-in with saved credentials
    AsyncFunction("signIn") { params: SignInParams?, promise: Promise ->
      val clientId = webClientId ?: run {
        promise.reject(GoogleSignInNotConfiguredException())
        return@AsyncFunction
      }

      mainScope.launch {
        try {
          val googleIdOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(params?.filterByAuthorizedAccounts ?: true)
            .setServerClientId(clientId)
            .setAutoSelectEnabled(autoSelectEnabled)
            .apply {
              params?.nonce?.let { setNonce(it) }
            }
            .build()

          val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

          val result = credentialManager.getCredential(
            request = request,
            context = requireNotNull(appContext.currentActivity)
          )

          handleSignInResult(result, promise)
        } catch (e: GetCredentialCancellationException) {
          promise.reject(GoogleSignInCancelledException())
        } catch (e: NoCredentialException) {
          promise.reject(GoogleSignInNoCredentialException())
        } catch (e: GetCredentialException) {
          promise.reject(GoogleSignInException(e.message ?: "Unknown error"))
        } catch (e: Exception) {
          promise.reject(GoogleSignInException(e.message ?: "Unknown error"))
        }
      }
    }

    // Create account - shows account creation UI
    AsyncFunction("createAccount") { params: CreateAccountParams?, promise: Promise ->
      val clientId = webClientId ?: run {
        promise.reject(GoogleSignInNotConfiguredException())
        return@AsyncFunction
      }

      mainScope.launch {
        try {
          val googleIdOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false) // Show all accounts for creation
            .setServerClientId(clientId)
            .apply {
              params?.nonce?.let { setNonce(it) }
            }
            .build()

          val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

          val result = credentialManager.getCredential(
            request = request,
            context = requireNotNull(appContext.currentActivity)
          )

          handleSignInResult(result, promise)
        } catch (e: GetCredentialCancellationException) {
          promise.reject(GoogleSignInCancelledException())
        } catch (e: NoCredentialException) {
          promise.reject(GoogleSignInNoCredentialException())
        } catch (e: GetCredentialException) {
          promise.reject(GoogleSignInException(e.message ?: "Unknown error"))
        } catch (e: Exception) {
          promise.reject(GoogleSignInException(e.message ?: "Unknown error"))
        }
      }
    }

    // Explicit sign-in - uses Sign In With Google button flow
    AsyncFunction("presentExplicitSignIn") { params: ExplicitSignInParams?, promise: Promise ->
      val clientId = webClientId ?: run {
        promise.reject(GoogleSignInNotConfiguredException())
        return@AsyncFunction
      }

      mainScope.launch {
        try {
          val signInWithGoogleOption = GetSignInWithGoogleOption.Builder(clientId)
            .apply {
              params?.nonce?.let { setNonce(it) }
              hostedDomain?.let { setHostedDomainFilter(it) }
            }
            .build()

          val request = GetCredentialRequest.Builder()
            .addCredentialOption(signInWithGoogleOption)
            .build()

          val result = credentialManager.getCredential(
            request = request,
            context = requireNotNull(appContext.currentActivity)
          )

          handleSignInResult(result, promise)
        } catch (e: GetCredentialCancellationException) {
          promise.reject(GoogleSignInCancelledException())
        } catch (e: GetCredentialException) {
          promise.reject(GoogleSignInException(e.message ?: "Unknown error"))
        } catch (e: Exception) {
          promise.reject(GoogleSignInException(e.message ?: "Unknown error"))
        }
      }
    }

    // Sign out - clears credential state
    AsyncFunction("signOut") { promise: Promise ->
      mainScope.launch {
        try {
          credentialManager.clearCredentialState(ClearCredentialStateRequest())
          promise.resolve(null)
        } catch (e: Exception) {
          promise.reject(GoogleSignInException(e.message ?: "Failed to sign out"))
        }
      }
    }
  }

  private fun handleSignInResult(result: GetCredentialResponse, promise: Promise) {
    when (val credential = result.credential) {
      is CustomCredential -> {
        if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
          try {
            val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)

            promise.resolve(mapOf(
              "type" to "success",
              "data" to mapOf(
                "idToken" to googleIdTokenCredential.idToken,
                "user" to mapOf(
                  "id" to googleIdTokenCredential.id,
                  "email" to googleIdTokenCredential.id,
                  "name" to googleIdTokenCredential.displayName,
                  "givenName" to googleIdTokenCredential.givenName,
                  "familyName" to googleIdTokenCredential.familyName,
                  "photo" to googleIdTokenCredential.profilePictureUri?.toString()
                )
              )
            ))
          } catch (e: GoogleIdTokenParsingException) {
            promise.reject(GoogleSignInException("Failed to parse Google ID token: ${e.message}"))
          }
        } else {
          promise.reject(GoogleSignInException("Unexpected credential type: ${credential.type}"))
        }
      }
      else -> {
        promise.reject(GoogleSignInException("Unexpected credential type"))
      }
    }
  }
}
