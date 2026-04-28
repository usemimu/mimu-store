<template>
  <div class="min-h-screen px-4 py-8" :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'">
    <div class="max-w-md mx-auto">
      <!-- Brand -->
      <div class="text-center mb-6">
        <div class="flex justify-center mb-4">
          <Logo :dark="dark" :size="44" />
        </div>
        <div
          class="text-[11px] font-semibold tracking-[0.18em] uppercase"
          :style="{ color: fg3 }"
        >
          Setting up your host account
        </div>
      </div>

      <!-- Stepper -->
      <div class="flex items-center justify-between gap-2 mb-8">
        <template v-for="(s, i) in steps" :key="s.path">
          <div class="flex flex-col items-center text-center flex-1 min-w-0">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2"
              :class="dotClass(i)"
            >
              <PhCheck v-if="i < activeIndex" :size="14" weight="bold" />
              <span v-else>{{ i + 1 }}</span>
            </div>
            <div
              class="text-[11px] font-semibold leading-tight truncate w-full"
              :style="{ color: i === activeIndex ? fg : fg3 }"
            >
              {{ s.label }}
            </div>
          </div>
          <div
            v-if="i < steps.length - 1"
            class="h-px flex-1 mt-[-18px]"
            :style="{ background: i < activeIndex ? '#B55430' : (dark ? 'rgba(255,255,255,0.08)' : '#E8E0D4') }"
          ></div>
        </template>
      </div>

      <!-- Step content rendered by child route -->
      <RouterView :dark="dark" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { PhCheck } from '@phosphor-icons/vue'
import Logo from '../../components/Logo.vue'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const route = useRoute()

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg3 = computed(() => (props.dark ? '#5E574F' : '#A89F94'))

// Order matches the API flow: post-OTP we set a password, then complete
// the business profile (PATCH /host/profile), then verify a bank account
// (two-step). Each step is a child route so the back button + deep links
// behave correctly and we can park resumers at the right step.
const steps = [
  { path: '/onboarding/password', label: 'Password' },
  { path: '/onboarding/profile', label: 'Business' },
  { path: '/onboarding/bank', label: 'Bank' },
]

const activeIndex = computed(() => {
  const i = steps.findIndex((s) => route.path.startsWith(s.path))
  // Final "done" page sits after step 3.
  return i === -1 ? steps.length : i
})

function dotClass(i) {
  if (i < activeIndex.value) {
    return 'bg-clay-500 text-white'
  }
  if (i === activeIndex.value) {
    return 'bg-clay-500 text-white ring-4 ring-clay-500/20'
  }
  return props.dark
    ? 'bg-neutral-800 text-neutral-500'
    : 'bg-neutral-200 text-neutral-500'
}
</script>
