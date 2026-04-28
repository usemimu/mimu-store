<template>
  <div
    class="min-h-screen flex items-center justify-center"
    :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'"
  >
    <Logo :dark="dark" :size="80" />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '../components/Logo.vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  dark: {
    type: Boolean,
    default: false,
  },
})

const router = useRouter()
const auth = useAuthStore()

/**
 * The auth store is one of three states on first paint:
 *   'unknown'         — bootstrap probe in flight; wait
 *   'authenticated'   — token validated → /dashboard
 *   'unauthenticated' — no token, or token rejected → /login
 *
 * We watch the store rather than relying on a fixed timeout: a logged-in
 * user with a valid session sees the dashboard as soon as the probe
 * resolves; a logged-out user sees the login screen the same way. The
 * 600ms minimum keeps the brand-pause from feeling jittery on fast loads.
 */
function decide() {
  if (auth.status === 'unknown') return
  router.replace(auth.isAuthenticated ? '/dashboard' : '/login')
}

let mountedAt = 0

onMounted(() => {
  mountedAt = Date.now()
  // If bootstrap already resolved before SplashView mounted, schedule the
  // decision after the brand-pause; otherwise wait for the watcher.
  if (auth.status !== 'unknown') {
    setTimeout(decide, 600)
  }
})

watch(
  () => auth.status,
  (s) => {
    if (s === 'unknown') return
    const elapsed = Date.now() - mountedAt
    const remaining = Math.max(0, 600 - elapsed)
    setTimeout(decide, remaining)
  },
)
</script>
