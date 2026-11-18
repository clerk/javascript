package expo.modules.clerk.biometrics

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt

internal enum class BiometricsErrorCode(val value: String) {
  USER_CANCELED("user_canceled"),
  SYSTEM_CANCELED("system_canceled"),
  AUTHENTICATION_FAILED("authentication_failed"),
  BIOMETRY_NOT_AVAILABLE("biometry_not_available"),
  BIOMETRY_NOT_ENROLLED("biometry_not_enrolled"),
  BIOMETRY_LOCKOUT("biometry_lockout"),
  PASSCODE_NOT_SET("passcode_not_set"),
  SECURE_KEY_STORAGE_UNAVAILABLE("secure_key_storage_unavailable"),
  KEY_NOT_FOUND("key_not_found"),
  KEY_INVALIDATED("key_invalidated"),
  KEY_GENERATION_FAILED("key_generation_failed"),
  SIGNING_FAILED("signing_failed"),
  STORAGE_FAILED("storage_failed"),
  INVALID_ARGUMENT("invalid_argument"),
}

internal class BiometricsError(
  val code: BiometricsErrorCode,
  message: String,
  cause: Throwable? = null,
) : Exception(message, cause) {
  companion object {
    fun forCanAuthenticate(status: Int): BiometricsError =
      when (status) {
        BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED ->
          BiometricsError(BiometricsErrorCode.BIOMETRY_NOT_ENROLLED, "No biometrics are enrolled on this device.")
        else ->
          BiometricsError(
            BiometricsErrorCode.BIOMETRY_NOT_AVAILABLE,
            "Strong biometric authentication is not available on this device (status $status).",
          )
      }

    fun forPromptError(errorCode: Int, message: CharSequence?): BiometricsError {
      val code =
        when (errorCode) {
          BiometricPrompt.ERROR_USER_CANCELED,
          BiometricPrompt.ERROR_NEGATIVE_BUTTON -> BiometricsErrorCode.USER_CANCELED
          BiometricPrompt.ERROR_CANCELED -> BiometricsErrorCode.SYSTEM_CANCELED
          BiometricPrompt.ERROR_LOCKOUT,
          BiometricPrompt.ERROR_LOCKOUT_PERMANENT -> BiometricsErrorCode.BIOMETRY_LOCKOUT
          BiometricPrompt.ERROR_NO_BIOMETRICS -> BiometricsErrorCode.BIOMETRY_NOT_ENROLLED
          BiometricPrompt.ERROR_HW_NOT_PRESENT,
          BiometricPrompt.ERROR_HW_UNAVAILABLE,
          BiometricPrompt.ERROR_SECURITY_UPDATE_REQUIRED -> BiometricsErrorCode.BIOMETRY_NOT_AVAILABLE
          BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL -> BiometricsErrorCode.PASSCODE_NOT_SET
          else -> BiometricsErrorCode.AUTHENTICATION_FAILED
        }
      return BiometricsError(code, message?.toString() ?: "Biometric authentication failed (error $errorCode).")
    }
  }
}
