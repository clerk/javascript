package expo.modules.clerk.biometrics

import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotImplementedException :
  CodedException("not_implemented", "@clerk/expo-biometrics is not supported on Android yet.", null)

class ClerkExpoBiometricsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ClerkExpoBiometrics")

    Function("getAppIdentifier") { -> notImplemented<String>() }

    AsyncFunction("getAvailability") { promise: Promise -> reject(promise) }
    AsyncFunction("createKey") { _: String, promise: Promise -> reject(promise) }
    AsyncFunction("sign") { _: String, _: String, _: String?, promise: Promise -> reject(promise) }
    AsyncFunction("hasKey") { _: String, promise: Promise -> reject(promise) }
    AsyncFunction("deleteKey") { _: String, promise: Promise -> reject(promise) }
    AsyncFunction("listRecords") { promise: Promise -> reject(promise) }
    AsyncFunction("saveRecord") { _: Map<String, Any?>, _: Map<String, Any?>, promise: Promise -> reject(promise) }
    AsyncFunction("deleteRecord") { _: String, promise: Promise -> reject(promise) }
    AsyncFunction("ensureInstallationMarker") { promise: Promise -> reject(promise) }
  }

  private fun reject(promise: Promise) {
    promise.reject(NotImplementedException())
  }

  private fun <T> notImplemented(): T = throw NotImplementedException()
}
