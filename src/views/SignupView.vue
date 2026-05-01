<template>
  <div class="min-h-screen px-4 py-8" :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'">
    <div class="max-w-md mx-auto">
      <div class="text-center mb-8">
        <div class="flex justify-center mb-6">
          <Logo :dark="dark" :size="60" />
        </div>
        <h1 class="text-2xl lg:text-3xl font-display font-light tracking-tight mb-2" :style="{ color: fg }">
          {{ step === 'claim' ? 'Claim your invite' : 'Verify your phone' }}
        </h1>
        <p class="text-sm lg:text-base" :style="{ color: fg2 }">
          {{ step === 'claim'
            ? 'Paste the invite from your WhatsApp link to set up your host account.'
            : `Enter the 6-digit code we sent to ${phone}.` }}
        </p>
      </div>

      <!-- STEP 1: claim invite -->
      <form
        v-if="step === 'claim'"
        class="rounded-2xl p-6 lg:p-8 mb-6"
        :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
        @submit.prevent="onClaim"
      >
        <div class="space-y-5">
          <div>
            <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">Invite token</label>
            <input
              v-model="inviteToken"
              type="text"
              placeholder="Paste the token from your invite link"
              class="w-full rounded-xl py-3 px-4 text-base font-mono"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            />
            <p class="text-xs mt-2" :style="{ color: fg3 }">
              Look for the long string after <code>?token=</code> in the link.
            </p>
          </div>

          <div>
            <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">Phone number</label>
            <input
              v-model="phone"
              type="tel"
              placeholder="+2348012345678"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            />
          </div>

          <div>
            <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">Email (optional)</label>
            <input
              v-model="email"
              type="email"
              placeholder="you@example.com"
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
          {{ busy ? 'Sending code…' : 'Send verification code' }}
        </button>
      </form>

      <!-- STEP 2: verify OTP -->
      <form
        v-else
        class="rounded-2xl p-6 lg:p-8 mb-6"
        :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
        @submit.prevent="onVerify"
      >
        <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">6-digit code</label>
        <input
          v-model="code"
          inputmode="numeric"
          maxlength="6"
          autocomplete="one-time-code"
          placeholder="123456"
          class="w-full rounded-xl py-3 px-4 text-2xl tracking-[0.5em] text-center font-mono"
          :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
        />

        <button
          type="submit"
          :disabled="busy || code.length !== 6"
          class="mt-6 w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60 transition-colors"
        >
          {{ busy ? 'Verifying…' : 'Verify and continue' }}
        </button>

        <button
          type="button"
          class="mt-3 w-full bg-transparent border-none text-sm font-semibold cursor-pointer hover:opacity-80"
          :style="{ color: fg2 }"
          @click="step = 'claim'"
        >
          Use a different invite
        </button>
      </form>

      <div class="text-center">
        <p class="text-sm" :style="{ color: fg2 }">
          Already onboarded?
          <router-link to="/login" class="font-semibold text-clay-500 hover:text-clay-600">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Logo from '../components/Logo.vue'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()

const step = ref('claim')
// Prefill the token if the host arrived via a tracked invite link
// (`/onboard?invite=...`). The query value comes from the WhatsApp /
// SMS / email blast — pre-filling means the host doesn't have to copy
// + paste a 43-char token from a deep-link they just clicked.
const initialToken =
  typeof route.query.invite === 'string' ? route.query.invite : ''
const inviteToken = ref(initialToken)
const phone = ref('')
const email = ref('')
const code = ref('')
const busy = ref(false)

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const fg3 = computed(() => (props.dark ? '#5E574F' : '#A89F94'))
const cardBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const cardBorder = computed(() => (props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none'))
const cardShadow = computed(() => (props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)'))
const inputBorder = computed(() => (props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0'))
const inputBg = computed(() => (props.dark ? '#1A1815' : '#fff'))

const E164_NG = /^\+234\d{10}$/

async function onClaim() {
  if (inviteToken.value.length < 32) {
    toast.error('That invite token doesn’t look right.')
    return
  }
  if (!E164_NG.test(phone.value)) {
    toast.error('Phone must be in +234XXXXXXXXXX format.')
    return
  }
  busy.value = true
  try {
    await auth.claimInvite({
      inviteToken: inviteToken.value,
      phone: phone.value,
      email: email.value.trim() || undefined,
    })
    toast.success('Verification code sent.')
    step.value = 'otp'
  } catch (err) {
    toast.error(err?.message || 'Could not claim invite.')
  } finally {
    busy.value = false
  }
}

async function onVerify() {
  busy.value = true
  try {
    const session = await auth.verifyOtp({ phone: phone.value, code: code.value })
    // Fresh hosts (post-claim-invite) land here with an unset password +
    // an incomplete profile. Walk them through the onboarding wizard
    // rather than dropping them on a half-empty dashboard.
    const isNew = session?.user?.isNewUser ?? auth.user?.isNewUser ?? true
    router.replace(isNew ? '/onboarding/password' : '/dashboard')
  } catch (err) {
    toast.error(err?.message || 'Invalid or expired code.')
  } finally {
    busy.value = false
  }
}
</script>
