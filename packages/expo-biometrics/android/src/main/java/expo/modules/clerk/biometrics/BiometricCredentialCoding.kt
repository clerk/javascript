package expo.modules.clerk.biometrics

import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.math.BigInteger
import java.security.MessageDigest
import java.security.spec.ECGenParameterSpec
import java.util.UUID

// Mirrors clerk-android's storage contract v2, pinned by its BiometricCredentialStorageContractTest. Any change here must
// stay compatible with clerk-android, which reads and writes the same Keystore aliases and metadata file.

internal enum class BiometricCredentialPolicy(val value: String) {
  BIOMETRY_CURRENT_SET("biometry_current_set"),
  BIOMETRY_ANY("biometry_any"),
  BIOMETRY_OR_DEVICE_PASSCODE("biometry_or_device_passcode");

  companion object {
    fun fromValue(value: String?): BiometricCredentialPolicy? = entries.firstOrNull { it.value == value }
  }
}

internal object BiometricCredentialCoding {
  const val KEY_ALIAS_PREFIX = "com.clerk.trusted_device."
  const val LOCAL_KEY_ID_PREFIX = "tdlk_"
  const val SIGNATURE_ALGORITHM = "SHA256withECDSA"
  const val EC_CURVE = "secp256r1"
  const val MIN_SDK = Build.VERSION_CODES.P

  private const val COORDINATE_SIZE = 32
  private const val HEX = "0123456789abcdef"

  fun makeLocalKeyId(): String = LOCAL_KEY_ID_PREFIX + UUID.randomUUID().toString().replace("-", "").lowercase()

  fun keyAlias(localKeyId: String): String = KEY_ALIAS_PREFIX + localKeyId

  /** Lowercase hex SHA-256 of the trimmed, locale-independently lowercased hint, or `null` when it is empty. */
  fun hashIdentifierHint(hint: String?): String? {
    val normalized = hint?.trim()?.lowercase() ?: return null
    if (normalized.isEmpty()) return null
    val digest = MessageDigest.getInstance("SHA-256").digest(normalized.toByteArray(Charsets.UTF_8))
    return buildString(digest.size * 2) {
      for (byte in digest) {
        val value = byte.toInt() and 0xFF
        append(HEX[value ushr 4])
        append(HEX[value and 0x0F])
      }
    }
  }

  fun keyAuthenticators(policy: BiometricCredentialPolicy): Int =
    if (policy == BiometricCredentialPolicy.BIOMETRY_OR_DEVICE_PASSCODE) {
      KeyProperties.AUTH_BIOMETRIC_STRONG or KeyProperties.AUTH_DEVICE_CREDENTIAL
    } else {
      KeyProperties.AUTH_BIOMETRIC_STRONG
    }

  fun keyGenParameterSpec(localKeyId: String, policy: BiometricCredentialPolicy): KeyGenParameterSpec {
    val builder =
      KeyGenParameterSpec.Builder(keyAlias(localKeyId), KeyProperties.PURPOSE_SIGN)
        .setAlgorithmParameterSpec(ECGenParameterSpec(EC_CURVE))
        .setDigests(KeyProperties.DIGEST_SHA256)
        .setUserAuthenticationRequired(true)
        .setInvalidatedByBiometricEnrollment(policy == BiometricCredentialPolicy.BIOMETRY_CURRENT_SET)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      builder.setUserAuthenticationParameters(0, keyAuthenticators(policy))
    } else {
      @Suppress("DEPRECATION")
      builder.setUserAuthenticationValidityDurationSeconds(-1)
    }
    return builder.build()
  }

  fun base64UrlEncode(bytes: ByteArray): String =
    Base64.encodeToString(bytes, Base64.URL_SAFE or Base64.NO_PADDING or Base64.NO_WRAP)

  fun publicKeyJwk(x: BigInteger, y: BigInteger): String {
    val encodedX = base64UrlEncode(fixedWidthCoordinate(x))
    val encodedY = base64UrlEncode(fixedWidthCoordinate(y))
    return """{"kty":"EC","crv":"P-256","x":"$encodedX","y":"$encodedY","alg":"ES256"}"""
  }

  private fun fixedWidthCoordinate(coordinate: BigInteger): ByteArray {
    val bytes = coordinate.toByteArray()
    return when {
      bytes.size == COORDINATE_SIZE -> bytes
      bytes.size > COORDINATE_SIZE -> bytes.copyOfRange(bytes.size - COORDINATE_SIZE, bytes.size)
      else -> ByteArray(COORDINATE_SIZE - bytes.size) + bytes
    }
  }

  fun rawES256SignatureFromDer(signature: ByteArray): ByteArray {
    val reader = DerReader(signature)
    if (reader.readByte() != 0x30) throw invalidSignature()
    if (reader.readLength() != reader.remaining) throw invalidSignature()
    val r = reader.readInteger()
    val s = reader.readInteger()
    if (reader.remaining != 0) throw invalidSignature()
    return paddedComponent(r) + paddedComponent(s)
  }

  private fun paddedComponent(component: ByteArray): ByteArray {
    if (component.isEmpty() || component[0].toInt() and 0x80 != 0) throw invalidSignature()
    var start = 0
    while (component.size - start > COORDINATE_SIZE && component[start].toInt() == 0) {
      start += 1
    }
    val size = component.size - start
    if (size !in 1..COORDINATE_SIZE) throw invalidSignature()
    return ByteArray(COORDINATE_SIZE).also { component.copyInto(it, COORDINATE_SIZE - size, start) }
  }

  private fun invalidSignature() =
    BiometricsError(BiometricsErrorCode.SIGNING_FAILED, "Android Keystore returned an invalid ES256 signature.")

  private class DerReader(private val bytes: ByteArray) {
    private var offset = 0

    val remaining: Int
      get() = bytes.size - offset

    fun readByte(): Int {
      if (offset >= bytes.size) throw invalidSignature()
      return bytes[offset++].toInt() and 0xFF
    }

    fun readLength(): Int {
      val first = readByte()
      if (first and 0x80 == 0) return first
      val byteCount = first and 0x7F
      if (byteCount == 0 || byteCount > Int.SIZE_BYTES || byteCount > remaining) throw invalidSignature()
      var length = 0
      repeat(byteCount) { length = (length shl 8) or readByte() }
      return length
    }

    fun readInteger(): ByteArray {
      if (readByte() != 0x02) throw invalidSignature()
      val length = readLength()
      if (length <= 0 || length > remaining) throw invalidSignature()
      return bytes.copyOfRange(offset, offset + length).also { offset += length }
    }
  }
}
