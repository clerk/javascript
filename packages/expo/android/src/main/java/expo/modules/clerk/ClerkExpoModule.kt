package expo.modules.clerk

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.clerk.api.CoreException
import com.clerk.api.Clerk
import com.clerk.ui.theme.ClerkColors
import com.clerk.ui.theme.ClerkDesign
import com.clerk.ui.theme.ClerkTheme
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URI
import kotlinx.coroutines.*
import org.json.JSONObject

private const val TAG = "ClerkExpoModule"
private fun debugLog(tag: String, message: String) { if (BuildConfig.DEBUG) Log.d(tag, message) }

class ClerkExpoModule : Module() {
  private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var connection: ClerkExpoCoreConnection? = null
  private var projectedOwner: Clerk? = null
  private var observer: Job? = null
  private var pendingURL: Uri? = null

  override fun definition() = ModuleDefinition {
    Name("ClerkExpo")
    Events("clerkCoreMessage", "clerkNativeAuthFlowChanged")
    OnCreate {
      scope.launch { ClerkExpoState.authFlow.collect { sendEvent("clerkNativeAuthFlowChanged", it) } }
    }
    OnDestroy { scope.launch { detach(); scope.cancel() } }
    AsyncFunction("prepareCore") { publishableKey: String, promise: Promise ->
      run(promise) {
        detach()
        val context = appContext.reactContext ?: throw CoreException("context_unavailable")
        loadThemeFromAssets(context)
        val next = ClerkExpoCoreConnection(context, publishableKey, { appContext.currentActivity }) { id, message ->
          sendEvent("clerkCoreMessage", mapOf("connectionId" to id, "message" to message))
        }
        connection = next
        next.descriptor
      }
    }
    AsyncFunction("startCore") { id: String, promise: Promise ->
      run(promise) {
        val current = requireConnection(id)
        val owner = current.start()
        if (connection !== current) { current.close(); throw CoreException("native_host_unavailable") }
        projectedOwner = owner
        ClerkExpoState.setOwner(owner)
        observer = scope.launch { current.runtime.changes.collect { if (ClerkExpoState.clerk.value === owner) ClerkExpoState.publish() } }
        (pendingURL ?: appContext.currentActivity?.intent?.data)?.let(::handleCallback)
        pendingURL = null
        null
      }
    }
    Function("receiveCoreMessage") { id: String, message: String ->
      scope.launch { try { requireConnection(id).receive(message) } catch (_: Exception) { detach(id) } }
    }
    Function("detachCore") { id: String -> scope.launch { detach(id) }; Unit }
    AsyncFunction("performCoreCapability") { id: String, requestId: String, capability: String, arguments: String, promise: Promise ->
      run(promise) { requireConnection(id).perform(requestId, capability, arguments) }
    }
    Function("cancelCoreCapabilities") { id: String, requestIds: List<String> ->
      scope.launch { if (connection?.id == id) connection?.cancel(requestIds) }; Unit
    }
    AsyncFunction("getAuthFlowState") { promise: Promise -> promise.resolve(ClerkExpoState.authFlow.value) }
    OnNewIntent { intent -> intent.data?.let(::handleCallback) }
  }

  private fun run(promise: Promise, block: suspend () -> Any?) {
    scope.launch {
      try { promise.resolve(block()) }
      catch (error: Exception) { promise.reject((error as? CoreException)?.code ?: "native_capability_failed", error.localizedMessage, error) }
    }
  }
  private fun requireConnection(id: String): ClerkExpoCoreConnection =
    connection?.takeIf { it.id == id } ?: throw CoreException("native_host_unavailable")
  private fun detach(id: String? = null) {
    if (id != null && connection?.id != id) return
    observer?.cancel(); observer = null
    connection?.close(); connection = null
    if (ClerkExpoState.clerk.value === projectedOwner) ClerkExpoState.setOwner(null)
    projectedOwner = null
  }
  private fun handleCallback(url: Uri) {
    val packageName = appContext.reactContext?.packageName ?: return
    if (url.scheme != "$packageName.clerk" || url.host != "oauth" || url.path != "/callback") return
    val owner = projectedOwner ?: run { pendingURL = url; return }
    scope.launch {
      try { owner.handleAuthCallback(URI(url.toString())) }
      catch (error: CancellationException) { throw error }
      catch (_: Exception) {
        if (ClerkExpoState.clerk.value === owner) {
          appContext.reactContext?.let { android.widget.Toast.makeText(it, "Unable to complete sign-in. Please try again.", android.widget.Toast.LENGTH_LONG).show() }
        }
      }
    }
  }

    // MARK: - Theme Loading

    private fun loadThemeFromAssets(context: Context) {
        try {
            val jsonString = context.assets
                .open("clerk_theme.json")
                .bufferedReader()
                .use { it.readText() }
            val json = JSONObject(jsonString)
            ClerkExpoState.theme = parseClerkTheme(json)
        } catch (e: java.io.FileNotFoundException) {
            // No theme file provided — use defaults
        } catch (e: Exception) {
            debugLog(TAG, "Failed to load clerk_theme.json: ${e.message}")
        }
    }

    private fun parseClerkTheme(json: JSONObject): ClerkTheme {
        val colors = json.optJSONObject("colors")?.let { parseColors(it) }
        val darkColors = json.optJSONObject("darkColors")?.let { parseColors(it) }
        val design = json.optJSONObject("design")?.let { parseDesign(it) }
        return ClerkTheme(
            colors = colors,
            darkColors = darkColors,
            design = design
        )
    }

    private fun parseColors(json: JSONObject): ClerkColors {
        return ClerkColors(
            primary = json.optStringColor("primary"),
            background = json.optStringColor("background"),
            input = json.optStringColor("input"),
            danger = json.optStringColor("danger"),
            success = json.optStringColor("success"),
            warning = json.optStringColor("warning"),
            foreground = json.optStringColor("foreground"),
            mutedForeground = json.optStringColor("mutedForeground"),
            primaryForeground = json.optStringColor("primaryForeground"),
            inputForeground = json.optStringColor("inputForeground"),
            neutral = json.optStringColor("neutral"),
            border = json.optStringColor("border"),
            ring = json.optStringColor("ring"),
            muted = json.optStringColor("muted"),
            shadow = json.optStringColor("shadow"),
            secondaryButtonBackground = json.optStringColor("secondaryButtonBackground"),
            secondaryButtonForeground = json.optStringColor("secondaryButtonForeground")
        )
    }

    private fun parseDesign(json: JSONObject): ClerkDesign {
        return if (json.has("borderRadius")) {
            ClerkDesign(borderRadius = json.getDouble("borderRadius").toFloat().dp)
        } else {
            ClerkDesign()
        }
    }

    private fun parseHexColor(hex: String): Color? {
        val cleaned = hex.removePrefix("#")
        return try {
            when (cleaned.length) {
                6 -> Color(android.graphics.Color.parseColor("#FF$cleaned"))
                // Theme JSON uses RRGGBBAA; Android parseColor expects AARRGGBB
                8 -> {
                    val rrggbb = cleaned.substring(0, 6)
                    val aa = cleaned.substring(6, 8)
                    Color(android.graphics.Color.parseColor("#$aa$rrggbb"))
                }
                else -> null
            }
        } catch (e: Exception) {
            null
        }
    }

    private fun JSONObject.optStringColor(key: String): Color? {
        if (!has(key) || isNull(key)) return null
        val value = optString(key)
        return parseHexColor(value)
    }
}
