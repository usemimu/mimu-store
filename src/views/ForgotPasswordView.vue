<template>
  <div class="min-h-screen flex items-center justify-center px-4" :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-6">
          <Logo :dark="dark" :size="60" />
        </div>
        <h1 class="text-2xl lg:text-3xl font-display font-light tracking-tight mb-2" :style="{ color: fg }">
          {{ step === 'request' ? 'Reset password' : 'Set a new password' }}
        </h1>
        <p class="text-sm lg:text-base" :style="{ color: fg2 }">
          {{ step === 'request'
            ? "Enter the email or phone we'll send a reset link to."
            : 'Paste the reset code from your email/SMS and pick a new password.' }}
        </p>
      </div>

      <form
        v-if="step === 'request'"
        class="rounded-2xl p-6 lg:p-8 mb-6"
        :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
        @submit.prevent="onRequest"
      >
        <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">Email or phone</label>
        <input
          v-model="phoneOrEmail"
          type="text"
          placeholder="+2348012345678 or you@example.com"
          class="w-full rounded-xl py-3 px-4 text-base"
          :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
        />

        <button
          type="submit"
          :disabled="busy"
          class="mt-6 w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60 transition-colors"
        >
          {{ busy ? 'Sending…' : 'Send reset link' }}
        </button>
      </form>

      <form
        v-else
        class="rounded-2xl p-6 lg:p-8 mb-6"
        :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
        @submit.prevent="onReset"
      >
        <div class="space-y-4">
          <div>
            <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">Reset code</label>
            <input
              v-model="token"
              type="text"
              placeholder="Paste the code"
              class="w-full rounded-xl py-3 px-4 text-base font-mono"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            />
          </div>
          <div>
            <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">New password</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="At least 8 characters"
              autocomplete="new-password"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="busy"
          class="mt-6 w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60 transition-colors"
        >
          {{ busy ? 'Updating…' : 'Update password' }}
        </button>
      </form>

      <div class="text-center">
        <p class="text-sm" :style="{ color: fg2 }">
          <router-link to="/login" class="font-semibold text-clay-500 hover:text-clay-600">Back to sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '../components/Logo.vue'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const step = ref('request')
const phoneOrEmail = ref('')
const token = ref('')
const newPassword = ref('')
const busy = ref(false)

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const cardBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const cardBorder = computed(() => (props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none'))
const cardShadow = computed(() => (props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)'))
const inputBorder = computed(() => (props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0'))
const inputBg = computed(() => (props.dark ? '#1A1815' : '#fff'))

async function onRequest() {
  if (!phoneOrEmail.value.trim()) {
    toast.error('Enter your phone or email.')
    return
  }
  busy.value = true
  try {
    await auth.forgotPassword(phoneOrEmail.value.trim())
    toast.success("If an account exists, we've sent a reset link.")
    step.value = 'reset'
  } catch (err) {
    toast.error(err?.message || 'Could not send reset link.')
  } finally {
    busy.value = false
  }
}

async function onReset() {
  if (!token.value.trim() || newPassword.value.length < 8) {
    toast.error('Paste the reset code and pick a password (8+ chars).')
    return
  }
  busy.value = true
  try {
    await auth.resetPassword({ token: token.value.trim(), newPassword: newPassword.value })
    toast.success('Password updated. Sign in with your new password.')
    router.replace('/login')
  } catch (err) {
    toast.error(err?.message || 'Reset link is invalid or expired.')
  } finally {
    busy.value = false
  }
}
</script>
