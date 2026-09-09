package expo.modules.clerk

import androidx.compose.runtime.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.clerk.api.Clerk
import com.clerk.api.SessionStatus
import com.clerk.ui.core.composition.ClerkProvider
import com.clerk.ui.core.composition.LocalClerk
import com.clerk.ui.theme.ClerkTheme
import java.util.UUID
import kotlinx.coroutines.flow.MutableStateFlow

internal object ClerkExpoState {
  val clerk = MutableStateFlow<Clerk?>(null)
  val authFlow = MutableStateFlow(mapOf("isLoaded" to false, "isAuthFlowComplete" to false))
  var theme: ClerkTheme? = null
  private val presentations = mutableMapOf<String, Boolean>()
  fun setOwner(owner: Clerk?) { presentations.clear(); clerk.value = owner; publish() }
  fun presentation(id: String, complete: Boolean?) {
    if (complete == null) presentations.remove(id) else presentations[id] = complete
    publish()
  }
  fun publish() {
    val owner = clerk.value?.takeUnless { it.isInvalidated }
    val complete = owner?.session?.status == SessionStatus.Active && owner.session?.currentTask == null && owner.user != null
    authFlow.value = mapOf("isLoaded" to (owner?.loaded == true), "isAuthFlowComplete" to (complete && presentations.values.all { it }))
  }
}

@Composable internal fun ExpoClerkContent(content: @Composable () -> Unit) {
  val clerk by ClerkExpoState.clerk.collectAsStateWithLifecycle()
  val owner = clerk ?: return
  if (owner.isInvalidated) return
  key(owner) {
    ClerkProvider(owner, ClerkExpoState.theme) {
      val registration = remember { UUID.randomUUID().toString() }
      val complete = LocalClerk.isAuthFlowComplete
      SideEffect { ClerkExpoState.presentation(registration, complete) }
      DisposableEffect(owner) { onDispose { ClerkExpoState.presentation(registration, null) } }
      content()
    }
  }
}
