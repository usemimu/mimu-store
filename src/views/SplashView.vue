<template>
  <div
    class="min-h-screen flex items-center justify-center"
    :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'"
  >
    <Logo :dark="dark" :size="80" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '../components/Logo.vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  // Brief brand-pause so the splash is visible on fast loads.
  setTimeout(() => {
    router.replace(auth.isAuthenticated ? '/dashboard' : '/login')
  }, 800)
})
</script>
