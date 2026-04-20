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

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

onMounted(() => {
  setTimeout(() => {
    const isAuthenticated = localStorage.getItem('mimu-authenticated')
    if (isAuthenticated === 'true') {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, 2000)
})
</script>
