<template>
  <div
    class="rounded-2xl p-6"
    :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
  >
    <h1 class="font-display text-2xl font-light tracking-tight mb-2" :style="{ color: fg }">
      Add your bank account
    </h1>
    <p class="text-sm mb-6" :style="{ color: fg2 }">
      We pay your earnings here every two weeks. We verify it once via
      Paystack and you'll see the account name before saving.
    </p>

    <!-- STEP A: pick bank + enter account number -->
    <form
      v-if="!profile.pendingBankConfirmation"
      class="space-y-4"
      @submit.prevent="onResolve"
    >
      <Field :dark="dark" label="Bank">
        <select
          v-model="bankCode"
          class="w-full rounded-xl py-3 px-4 text-base"
          :style="inputStyle"
        >
          <option value="" disabled>
            {{ banksLoading ? 'Loading banks…' : 'Select a bank' }}
          </option>
          <option v-for="b in banks" :key="b.code + b.name" :value="b.code">
            {{ b.name }}
          </option>
        </select>
      </Field>

      <Field :dark="dark" label="Account number">
        <input
          v-model="accountNumber"
          inputmode="numeric"
          maxlength="10"
          class="w-full rounded-xl py-3 px-4 text-base font-mono tracking-wider"
          :style="inputStyle"
          placeholder="0123456789"
        />
      </Field>

      <button
        type="submit"
        :disabled="busy || !bankCode || accountNumber.length < 10"
        class="mt-2 w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60 transition-colors"
      >
        {{ busy ? 'Verifying…' : 'Verify name' }}
      </button>

      <button
        type="button"
        class="w-full bg-transparent border-none text-sm font-semibold cursor-pointer hover:opacity-80"
        :style="{ color: fg2 }"
        @click="skipForNow"
      >
        Skip for now — I'll add this later
      </button>
    </form>

    <!-- STEP B: confirm resolved account name -->
    <div v-else class="space-y-4">
      <div
        class="rounded-xl p-4"
        :style="{
          background: dark ? 'rgba(180,84,48,0.08)' : '#FCF7E8',
          border: `1px solid ${dark ? 'rgba(180,84,48,0.25)' : '#EDD88A'}`,
        }"
      >
        <div
          class="text-xs uppercase font-semibold tracking-wider mb-1"
          :style="{ color: fg2 }"
        >
          Account holder
        </div>
        <div class="text-lg font-bold" :style="{ color: fg }">
          {{ profile.pendingBankConfirmation.accountName || '—' }}
        </div>
        <div class="text-xs mt-2 font-mono" :style="{ color: fg2 }">
          {{ bankNameByCode(profile.pendingBankConfirmation.bankCode) }} ·
          {{ profile.pendingBankConfirmation.accountNumber }}
        </div>
      </div>
      <p class="text-xs" :style="{ color: fg2 }">
        Make sure this matches the name on your bank account exactly.
        Confirming locks this account in for payouts.
      </p>
      <div class="flex gap-3">
        <button
          type="button"
          :disabled="busy"
          class="flex-1 bg-transparent rounded-xl text-sm font-bold py-3 px-4 cursor-pointer"
          :style="{ border: `1.5px solid ${inputBorder}`, color: fg }"
          @click="onReject"
        >
          That's not me
        </button>
        <button
          type="button"
          :disabled="busy"
          class="flex-1 bg-clay-500 text-white border-none rounded-xl text-sm font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60"
          @click="onConfirm"
        >
          {{ busy ? 'Saving…' : 'Yes, that\'s my account' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { profileApi } from '../../api/profile'
import { useProfileStore } from '../../stores/profile'
import { useToastStore } from '../../stores/toast'
import Field from '../../components/forms/EditField.vue'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const router = useRouter()
const profile = useProfileStore()
const toast = useToastStore()

const bankCode = ref('')
const accountNumber = ref('')
const busy = ref(false)

// Bank list — vue-query handles caching; banks change rarely so a 24h
// stale-time keeps us from re-fetching this on every onboarding visit.
const banksQuery = useQuery({
  queryKey: ['host', 'banks'],
  queryFn: () => profileApi.listBanks(),
  staleTime: 24 * 60 * 60 * 1000,
})

const banksLoading = computed(() => banksQuery.isLoading.value)
const banks = computed(() => {
  const raw = banksQuery.data.value
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.banks)) return raw.banks
  if (Array.isArray(raw.data)) return raw.data
  return []
})

function bankNameByCode(code) {
  return banks.value.find((b) => b.code === code)?.name ?? code
}

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
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

async function onResolve() {
  busy.value = true
  try {
    await profile.resolveBankAccount({
      bankCode: bankCode.value,
      accountNumber: accountNumber.value,
    })
  } catch (err) {
    toast.error(err?.message || 'Could not verify that account.')
  } finally {
    busy.value = false
  }
}

async function onConfirm() {
  busy.value = true
  try {
    await profile.confirmBankAccount(true)
    toast.success('Bank account saved.')
    router.replace('/onboarding/done')
  } catch (err) {
    toast.error(err?.message || 'Could not save bank account.')
  } finally {
    busy.value = false
  }
}

async function onReject() {
  busy.value = true
  try {
    await profile.confirmBankAccount(false)
    bankCode.value = ''
    accountNumber.value = ''
    toast.success('Cancelled. Try a different account.')
  } catch (err) {
    toast.error(err?.message || 'Could not cancel.')
  } finally {
    busy.value = false
  }
}

function skipForNow() {
  // Leaving the bank account unset is allowed — earnings still accrue,
  // they just can't be paid out. The Account page surfaces this as a
  // missing-step prompt until the host completes it.
  router.replace('/onboarding/done')
}
</script>
