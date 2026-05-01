<template>
  <div
    class="min-h-screen flex items-center justify-center px-6"
    :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'"
  >
    <div class="max-w-sm w-full text-center">
      <div
        class="font-mono text-7xl font-bold leading-none mb-3"
        :class="dark ? 'text-neutral-700' : 'text-neutral-300'"
      >
        404
      </div>
      <h1
        class="text-lg font-semibold mb-2"
        :class="dark ? 'text-neutral-100' : 'text-neutral-900'"
      >
        Page not found
      </h1>
      <p
        class="text-sm mb-1 break-words"
        :class="dark ? 'text-neutral-400' : 'text-neutral-600'"
      >
        We couldn't find <span class="font-mono">{{ attemptedPath }}</span>.
      </p>
      <p
        class="text-xs mb-6"
        :class="dark ? 'text-neutral-500' : 'text-neutral-500'"
      >
        Heading home in {{ countdown }}…
      </p>
      <button
        @click="goHome"
        class="w-full py-3 rounded-lg font-semibold transition-colors"
        :class="dark
          ? 'bg-clay-500 text-white hover:bg-clay-400'
          : 'bg-clay-600 text-white hover:bg-clay-700'"
      >
        Go home now
      </button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineProps({
  dark: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()

const attemptedPath = ref(route.fullPath)
const countdown = ref(4)
let intervalId = null

function goHome() {
  // `/` is the splash, which routes by auth status. So whether the
  // host is signed in or not, they end up where they should.
  router.replace('/')
}

onMounted(() => {
  intervalId = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      clearInterval(intervalId)
      intervalId = null
      goHome()
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>
