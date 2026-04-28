<template>
  <div
    class="rounded-2xl p-8 text-center"
    :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
  >
    <div
      class="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-moss-500"
    >
      <PhCheck :size="36" weight="bold" class="text-white" />
    </div>

    <h1 class="font-display text-3xl font-light tracking-tight mb-3" :style="{ color: fg }">
      You're set up
    </h1>
    <p class="text-sm leading-relaxed mb-6" :style="{ color: fg2 }">
      Your screen will go live within 24 hours of installation. Earnings
      flow into your dashboard automatically — and we pay them out every
      Friday.
    </p>

    <button
      type="button"
      class="w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 transition-colors"
      @click="goHome"
    >
      Go to dashboard
    </button>

    <p class="text-xs mt-4" :style="{ color: fg3 }">
      Auto-redirecting in {{ secondsLeft }}s…
    </p>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhCheck } from '@phosphor-icons/vue'
import { useProfileStore } from '../../stores/profile'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const router = useRouter()
const profile = useProfileStore()

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const fg3 = computed(() => (props.dark ? '#5E574F' : '#A89F94'))
const cardBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const cardBorder = computed(() => (props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none'))
const cardShadow = computed(() => (props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)'))

const secondsLeft = ref(4)
let timer = null

onMounted(() => {
  // Refresh completion-status so the route guard doesn't bounce them
  // back to onboarding on the way to /dashboard.
  profile.load(true).catch(() => {})

  timer = setInterval(() => {
    secondsLeft.value -= 1
    if (secondsLeft.value <= 0) {
      clearInterval(timer)
      router.replace('/dashboard')
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function goHome() {
  if (timer) clearInterval(timer)
  router.replace('/dashboard')
}
</script>
