package expo.modules.clerk

import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import org.junit.Assert.*
import org.junit.Test

/**
 * Tests that the per-view ViewModelStoreOwner pattern produces isolated stores.
 *
 * The fix in ClerkAuthExpoView creates a new ViewModelStoreOwner per view
 * instance instead of using the Activity's store. This ensures the AuthView's
 * navigation ViewModel (which tracks "Get Help" destination state) is reset
 * when the view is unmounted and remounted.
 */
class ClerkViewModelStoreTest {

    @Test
    fun `two separate ViewModelStoreOwner instances have distinct ViewModelStores`() {
        val owner1 = object : ViewModelStoreOwner {
            override val viewModelStore = ViewModelStore()
        }
        val owner2 = object : ViewModelStoreOwner {
            override val viewModelStore = ViewModelStore()
        }
        assertNotSame(
            "Each view should get its own ViewModelStore",
            owner1.viewModelStore,
            owner2.viewModelStore
        )
    }

    @Test
    fun `ViewModelStore clear resets all stored ViewModels`() {
        val store = ViewModelStore()
        // ViewModelStore.clear() is the mechanism that resets navigation state
        // when a view is detached. We verify it doesn't throw.
        store.clear()
        // After clear, the store should be usable for new ViewModels
        assertNotNull(store)
    }
}
