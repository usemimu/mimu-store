<template>
  <div
    class="min-h-screen flex items-center justify-center px-4"
    :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-6">
          <Logo :dark="dark" :size="60" />
        </div>
        <h1 class="text-2xl lg:text-3xl font-display font-light tracking-tight mb-2" :style="{ color: fg }">
          Welcome back
        </h1>
        <p class="text-sm lg:text-base" :style="{ color: fg2 }">
          Sign in to your host account
        </p>
      </div>

      <form
        class="rounded-2xl p-6 lg:p-8 mb-4"
        :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
        @submit.prevent="onSubmit"
      >
        <div class="mb-5">
          <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">Phone or email</label>
          <input
            v-model="phoneOrEmail"
            type="text"
            autocomplete="username"
            placeholder=""
            class="w-full rounded-xl py-3 px-4 text-base"
            :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
          />
        </div>

        <div class="mb-2">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold" :style="{ color: fg }">Password</label>
            <router-link to="/forgot-password" class="text-xs font-semibold text-clay-500 hover:text-clay-600">
              Forgot password?
            </router-link>
          </div>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="Your password"
            class="w-full rounded-xl py-3 px-4 text-base"
            :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
          />
        </div>

        <button
          type="submit"
          :disabled="busy"
          class="mt-6 w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60 disabled:cursor-wait transition-colors"
        >
          {{ busy ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <div class="text-center">
        <p class="text-sm" :style="{ color: fg2 }">
          Got an invite link?
          <router-link to="/signup" class="font-semibold text-clay-500 hover:text-clay-600">
            Claim your invite
          </router-link>
        </p>
      </div>

      <div class="mt-8 text-center">
        <button
          class="flex items-center justify-center gap-2 mx-auto bg-[#25D366] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#22c55e] transition-colors border-none cursor-pointer"
        >
          <PhWhatsappLogo :size="18" weight="bold" />
          <span class="text-sm">Need Help?</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Logo from '../components/Logo.vue'
import { PhWhatsappLogo } from '@phosphor-icons/vue'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()

const phoneOrEmail = ref('')
const password = ref('')
const busy = ref(false)

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const cardBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const cardBorder = computed(() => (props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none'))
const cardShadow = computed(() => (props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)'))
const inputBorder = computed(() => (props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0'))
const inputBg = computed(() => (props.dark ? '#1A1815' : '#fff'))

async function onSubmit() {
  if (!phoneOrEmail.value.trim() || password.value.length < 8) {
    toast.error('Enter your phone/email and a password (8+ characters).')
    return
  }
  busy.value = true
  try {
    await auth.loginWithPassword({
      phoneOrEmail: phoneOrEmail.value.trim(),
      password: password.value,
    })
    // Probe completion-status before deciding where to land. If the host
    // signed up earlier and bailed mid-onboarding, drop them at the next
    // unfinished step — not the dashboard, where the cards would render
    // empty and confuse them. Failures here fall back to the dashboard
    // (the route guard re-checks anyway).
    const profile = useProfileStore()
    let nextPath = (route.query.redirect && String(route.query.redirect)) || '/dashboard'
    try {
      await profile.load(true)
      if (profile.completion && profile.completion.isComplete === false) {
        nextPath = '/onboarding/profile'
      }
    } catch {
      /* fall back to nextPath */
    }
    router.replace(nextPath)
  } catch (err) {
    toast.error(err?.message || 'Sign in failed.')
  } finally {
    busy.value = false
  }
}
</script>
