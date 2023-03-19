import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import Clerk from '@clerk/clerk-vue'

createApp(App)
  .use(Clerk, {
    // Replace this
    publishableKey: ''
  })
  .mount('#app')
