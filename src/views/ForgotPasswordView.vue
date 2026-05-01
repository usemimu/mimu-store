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
        <h1
          class="text-2xl lg:text-3xl font-display font-light tracking-tight mb-2"
          :style="{ color: fg }"
        >
          {{ headline }}
        </h1>
        <p class="text-sm lg:text-base" :style="{ color: fg2 }">
          {{ subline }}
        </p>
      </div>

      <!-- Step 1: Request a reset code -->
      <form
        v-if="step === 'request'"
        class="rounded-2xl p-6 lg:p-8 mb-6"
        :style="{
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow,
        }"
        @submit.prevent="onRequest"
      >
        <label
          class="text-sm font-semibold mb-2 block"
          :style="{ color: fg }"
          for="phoneOrEmail"
        >
          Phone or email
        </label>
        <input
          id="phoneOrEmail"
          v-model.trim="phoneOrEmail"
          type="text"
          autocomplete="username"
          placeholder="you@example.com or +2348012345678"
          class="w-full rounded-xl py-3 px-4 text-base"
          :style="{
            background: inputBg,
            border: `1.5px solid ${inputBorder}`,
            color: fg,
          }"
          @keyup.enter="onRequest"
        />

        <button
          type="submit"
          :disabled="busy || !phoneOrEmail"
          class="mt-6 w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60 transition-colors"
        >
          {{ busy ? 'Sending…' : 'Send reset code' }}
        </button>

        <p class="text-xs text-center mt-4" :style="{ color: fg2 }">
          We'll send a 6-digit code by email and SMS (if a phone is on file).
        </p>
      </form>

      <!-- Step 2: Confirmation that the code was sent -->
      <div
        v-else-if="step === 'sent'"
        class="rounded-2xl p-6 lg:p-8 mb-6"
        :style="{
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow,
        }"
      >
        <div class="flex flex-col items-center text-center">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            :style="{ background: dark ? 'rgba(160, 200, 140, 0.15)' : '#E8F0DD' }"
          >
            <PhCheck :size="22" weight="bold" :color="dark ? '#A0C88C' : '#5A7C3D'" />
          </div>
          <p class="text-sm mb-4" :style="{ color: fg }">
            If an account exists for
            <span class="font-semibold">{{ sentToMasked }}</span>,
            we just sent a 6-digit reset code.
          </p>
          <p class="text-xs mb-6" :style="{ color: fg2 }">
            The code is valid for {{ expiryMinutes }} minutes. Check your email,
            and your SMS too if you used a phone number.
          </p>
          <button
            type="button"
            class="w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 transition-colors"
            @click="step = 'reset'"
          >
            I have the code
          </button>
          <button
            type="button"
            class="mt-3 text-xs font-semibold text-clay-500 hover:text-clay-600"
            :disabled="busy"
            @click="onResend"
          >
            {{ busy ? 'Resending…' : 'Resend code' }}
          </button>
        </div>
      </div>

      <!-- Step 3: Enter code + new password -->
      <form
        v-else
        class="rounded-2xl p-6 lg:p-8 mb-6"
        :style="{
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow,
        }"
        @submit.prevent="onReset"
      >
        <div class="space-y-4">
          <div>
            <label
              class="text-sm font-semibold mb-2 block"
              :style="{ color: fg }"
              for="token"
            >
              Reset code
            </label>
            <input
              id="token"
              v-model.trim="token"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              placeholder="6-digit code"
              class="w-full rounded-xl py-3 px-4 text-base font-mono tracking-widest text-center"
              :style="{
                background: inputBg,
                border: `1.5px solid ${inputBorder}`,
                color: fg,
              }"
            />
          </div>
          <div>
            <label
              class="text-sm font-semibold mb-2 block"
              :style="{ color: fg }"
              for="newPassword"
            >
              New password
            </label>
            <input
              id="newPassword"
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="At least 8 characters"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="{
                background: inputBg,
                border: `1.5px solid ${inputBorder}`,
                color: fg,
              }"
            />
          </div>
          <div>
            <label
              class="text-sm font-semibold mb-2 block"
              :style="{ color: fg }"
              for="confirmPassword"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Re-enter the new password"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="{
                background: inputBg,
                border: `1.5px solid ${inputBorder}`,
                color: fg,
              }"
            />
            <div class="flex items-center justify-between mt-2">
              <label class="flex items-center gap-2 text-xs cursor-pointer" :style="{ color: fg2 }">
                <input v-model="showPassword" type="checkbox" class="cursor-pointer" />
                Show password
              </label>
              <span
                v-if="confirmPassword && !passwordsMatch"
                class="text-xs font-semibold text-red-500"
              >
                Passwords don't match
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="!canSubmitReset"
          class="mt-6 w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60 transition-colors"
        >
          {{ busy ? 'Updating…' : 'Update password' }}
        </button>

        <button
          v-if="!startedFromLink"
          type="button"
          class="mt-3 w-full text-xs font-semibold text-clay-500 hover:text-clay-600"
          :disabled="busy"
          @click="step = 'request'"
        >
          ← Use a different email or phone
        </button>
      </form>

      <div class="text-center">
        <p class="text-sm" :style="{ color: fg2 }">
          <router-link
            to="/login"
            class="font-semibold text-clay-500 hover:text-clay-600"
          >
            Back to sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PhCheck } from '@phosphor-icons/vue'
import Logo from '../components/Logo.vue'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

// Three steps:
//   request — collect phone/email, fire forgot-password
//   sent    — confirmation screen with "I have the code" + Resend
//   reset   — enter code + new password
// Deep-linking from the email (`/forgot-password?token=…`) jumps
// straight to `reset` with the token pre-filled.
const step = ref('request')
const startedFromLink = ref(false)

const phoneOrEmail = ref('')
const sentTo = ref('')
const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const busy = ref(false)

// Mirrors the backend's RESET_TOKEN_TTL_SECONDS so the copy stays
// in sync with how long the code actually works.
const expiryMinutes = 15

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const cardBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const cardBorder = computed(() =>
  props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none',
)
const cardShadow = computed(() =>
  props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)',
)
const inputBorder = computed(() =>
  props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0',
)
const inputBg = computed(() => (props.dark ? '#1A1815' : '#fff'))

const headline = computed(() => {
  if (step.value === 'request') return 'Reset password'
  if (step.value === 'sent') return 'Check your inbox'
  return startedFromLink.value ? 'Set a new password' : 'Enter the reset code'
})

const subline = computed(() => {
  if (step.value === 'request') {
    return "Enter the email or phone we'll send a reset code to."
  }
  if (step.value === 'sent') {
    return 'Open the message and copy the 6-digit code.'
  }
  return 'Paste the code from your email/SMS and pick a new password.'
})

// Mask the contact for the confirmation screen so a shoulder-surfer
// can't lift the full address from the page, but the user can still
// recognize their own.
const sentToMasked = computed(() => {
  const value = sentTo.value
  if (!value) return ''
  if (value.includes('@')) {
    const [name, domain] = value.split('@')
    if (!name || !domain) return value
    const visible = name.slice(0, 2)
    return `${visible}${'•'.repeat(Math.max(name.length - 2, 1))}@${domain}`
  }
  // Phone: keep country code + last 3 digits
  if (value.length <= 5) return value
  return `${value.slice(0, 4)}${'•'.repeat(value.length - 7)}${value.slice(-3)}`
})

const passwordsMatch = computed(
  () => newPassword.value === confirmPassword.value,
)

const canSubmitReset = computed(() => {
  if (busy.value) return false
  if (!/^\d{6}$/.test(token.value.trim())) return false
  if (newPassword.value.length < 8) return false
  if (!passwordsMatch.value) return false
  return true
})

onMounted(() => {
  // The reset email contains a link in the form
  // `${HOST_APP_URL}/forgot-password?token=NNNNNN`. If it's there,
  // skip straight to the password form with the code pre-filled.
  const linkToken = route.query.token
  if (typeof linkToken === 'string' && linkToken.trim().length > 0) {
    token.value = linkToken.trim()
    step.value = 'reset'
    startedFromLink.value = true
  }
})

async function onRequest() {
  if (!phoneOrEmail.value) {
    toast.error('Enter your phone or email.')
    return
  }
  busy.value = true
  try {
    await auth.forgotPassword(phoneOrEmail.value)
    sentTo.value = phoneOrEmail.value
    step.value = 'sent'
  } catch (err) {
    toast.error(err?.message || 'Could not send reset code.')
  } finally {
    busy.value = false
  }
}

async function onResend() {
  if (!sentTo.value) {
    step.value = 'request'
    return
  }
  busy.value = true
  try {
    await auth.forgotPassword(sentTo.value)
    toast.success('Reset code re-sent.')
  } catch (err) {
    toast.error(err?.message || 'Could not resend.')
  } finally {
    busy.value = false
  }
}

async function onReset() {
  if (!canSubmitReset.value) {
    if (!passwordsMatch.value) {
      toast.error("Passwords don't match.")
    } else {
      toast.error('Enter the code and a password (8+ characters).')
    }
    return
  }
  busy.value = true
  try {
    await auth.resetPassword({
      token: token.value.trim(),
      newPassword: newPassword.value,
    })
    toast.success('Password updated. Sign in with your new password.')
    router.replace('/login')
  } catch (err) {
    toast.error(err?.message || 'Reset code is invalid or expired.')
  } finally {
    busy.value = false
  }
}
</script>
