package expo.modules.clerk

import android.app.Activity
import android.content.Context
import com.clerk.api.*
import java.util.UUID
import kotlinx.coroutines.*
import kotlinx.serialization.json.*

internal class ExpoCoreTransport(private var emit: ((String) -> Unit)?) : CoreTransport {
  override var receive: ((JsonElement) -> Unit)? = null
  override fun send(message: JsonElement) {
    val encoded = message.toString()
    if (encoded.length > 16 * 1024 * 1024) throw CoreException("message_too_large")
    (emit ?: throw CoreException("native_host_unavailable"))(encoded)
  }
  override fun close() { emit = null; receive = null }
}

private object NoExpoClientStorage : CredentialStorage {
  override suspend fun read(): String? = throw CoreException("client_owned_by_expo")
  override suspend fun write(value: String): Unit = throw CoreException("client_owned_by_expo")
  override suspend fun remove(): Unit = throw CoreException("client_owned_by_expo")
}

/** Projects Expo's existing owner. No QuickJS transport or Clerk.connect is constructed. */
internal class ClerkExpoCoreConnection(
  context: Context,
  publishableKey: String,
  activity: () -> Activity?,
  emit: (String, String) -> Unit,
) {
  val id = UUID.randomUUID().toString()
  val configuration = ClerkConfiguration(publishableKey, "${context.packageName}.clerk://oauth/callback")
  private val capabilities = AndroidCapabilities(
    publishableKey, configuration.frontendAPI, NoExpoClientStorage,
    activity, BrowserAuthentication(activity),
    AndroidCredentialStorage(context, publishableKey, purpose = AndroidCredentialStorage.Purpose.MAGIC_LINK),
    biometrics = AndroidBiometricCapabilities(
      context, publishableKey,
      AndroidCredentialStorage(context, publishableKey, purpose = AndroidCredentialStorage.Purpose.BIOMETRIC_CREDENTIALS),
      AndroidCredentialStorage(context, publishableKey, purpose = AndroidCredentialStorage.Purpose.BIOMETRIC_CLEANUP),
      activity,
    ),
  )
  private val transport = ExpoCoreTransport { emit(id, it) }
  val runtime = CoreRuntime(transport)
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private val requests = mutableMapOf<String, Deferred<JsonElement>>()
  private var closed = false
  val descriptor: Map<String, Any> get() = mapOf(
    "connectionId" to id, "platform" to "android", "callbackUrl" to configuration.callbackUrl,
    "capabilities" to (capabilities.supported - setOf("http", "storage", "timer", "random")).toList(),
  )

  suspend fun start(): Clerk {
    if (closed) throw CoreException("native_host_unavailable")
    try {
      withTimeout(15_000) { runtime.initialize(configuration.publishableKey, configuration.callbackUrl, "android", emptySet()) }
      if (closed) throw CoreException("native_host_unavailable")
      return runtime.resource(runtime.roots["clerk"] ?: throw CoreException("missing_clerk_root")) as Clerk
    } catch (error: Exception) { close(); throw error }
  }
  fun receive(message: String) {
    if (closed || message.length > 16 * 1024 * 1024) throw CoreException("native_host_unavailable")
    transport.receive?.invoke(Json.parseToJsonElement(message))
  }
  suspend fun perform(id: String, capability: String, arguments: String): String {
    if (closed || id in requests || arguments.length > 16 * 1024 * 1024 ||
      !(capability in setOf("browser", "googleIdentity", "crypto.sha256") || capability.startsWith("passkeys.") || capability.startsWith("authStorage.") || capability.startsWith("biometrics.")))
      throw CoreException("capability_unavailable")
    val args = Json.parseToJsonElement(arguments)
    val task = scope.async { capabilities.perform(capability, args) }
    requests[id] = task
    try { return task.await().toString() } finally { requests.remove(id) }
  }
  fun cancel(ids: List<String>) { ids.forEach { requests.remove(it)?.cancel() } }
  fun close() {
    if (closed) return
    closed = true
    requests.values.forEach { it.cancel() }
    requests.clear()
    scope.cancel()
    runtime.close()
  }
}
