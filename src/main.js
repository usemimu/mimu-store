import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'

import './style.css'
import App from './App.vue'
import router from './router'
import { setUnauthenticatedHandler } from './lib/http'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// vue-query — server-state cache. Sensible defaults: don't refetch on focus
// for an MPA-style host dashboard, retry once on transient failures, hold
// data fresh for 30s so navigating between sibling pages feels instant.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
app.use(VueQueryPlugin, { queryClient })

// Hydrate the auth store before the router runs its guards, then register
// the 401-fallback so the http layer can sign the user out without
// importing the store (avoids a circular dep).
//
// `bootstrap()` is now async because it probes `/profile` to validate the
// stored token. We mount the app immediately (the splash view shows while
// it resolves), and the auth store reactively flips `isAuthenticated` to
// false if the probe rejects — at which point the route guard kicks in.
const auth = useAuthStore()
setUnauthenticatedHandler(() => {
  auth.forceSignOut()
  if (router.currentRoute.value.meta.requiresAuth) {
    router.replace({ name: 'login' })
  }
})

app.use(router)
app.mount('#app')

// Fire-and-forget; SplashView watches the store and routes when it settles.
auth.bootstrap()
