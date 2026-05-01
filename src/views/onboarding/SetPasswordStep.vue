<template>
  <div class="min-h-screen px-4 py-8" :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'">
    <div class="max-w-md mx-auto">
      <div class="text-center mb-8">
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

      <form
        class="rounded-2xl p-6"
        :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
        @submit.prevent="onSubmit"
      >
    <h1 class="font-display text-2xl font-light tracking-tight mb-2" :style="{ color: fg }">
      Set a password
    </h1>
    <p class="text-sm mb-6" :style="{ color: fg2 }">
      So you can sign in next time without waiting for an OTP. Minimum 8 characters.
    </p>

    <Field :dark="dark" label="Password">
      <input
        v-model="password"
        type="password"
        autocomplete="new-password"
        placeholder="At least 8 characters"
        class="w-full rounded-xl py-3 px-4 text-base"
        :style="inputStyle"
      />
    </Field>

    <div class="mt-4">
      <Field :dark="dark" label="Confirm password">
        <input
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          placeholder="Re-enter your password"
          class="w-full rounded-xl py-3 px-4 text-base"
          :style="inputStyle"
        />
      </Field>
    </div>

    <button
      type="submit"
      :disabled="busy || !canSubmit"
      class="mt-6 w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60 transition-colors"
    >
      {{ busy ? 'Saving…' : 'Set password and continue' }}
    </button>

    <button
      type="button"
      class="mt-3 w-full bg-transparent border-none text-sm font-semibold cursor-pointer hover:opacity-80"
      :style="{ color: fg2 }"
      @click="skip"
    >
      Skip for now — I'll use OTP to sign in
    </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToastStore } from '../../stores/toast'
import Field from '../../components/forms/EditField.vue'
import Logo from '../../components/Logo.vue'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const password = ref('')
const confirmPassword = ref('')
const busy = ref(false)

const canSubmit = computed(
  () => password.value.length >= 8 && password.value === confirmPassword.value,
)

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const fg3 = computed(() => (props.dark ? '#5E574F' : '#A89F94'))
const cardBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const cardBorder = computed(() => (props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none'))
const cardShadow = computed(() => (props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)'))
const inputBorder = computed(() => (props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0'))
const inputBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const inputStyle = computed(() => ({
  background: inputBg.value,
  border: `1.5px solid ${inputBorder.value}`,
  color: fg.value,
}))

async function onSubmit() {
  if (!canSubmit.value) {
    if (password.value !== confirmPassword.value) {
      toast.error('Passwords do not match.')
    } else {
      toast.error('Password must be at least 8 characters.')
    }
    return
  }
  busy.value = true
  try {
    await auth.setPassword(password.value)
    toast.success('Password saved.')
    router.replace('/dashboard')
  } catch (err) {
    toast.error(err?.message || 'Could not save password.')
  } finally {
    busy.value = false
  }
}

function skip() {
  // Skipping is fine — set-password is a convenience; OTP sign-in still
  // works. The user can set one later from Account → Change Password.
  router.replace('/dashboard')
}
</script>
