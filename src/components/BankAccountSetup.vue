<template>
  <div
    class="rounded-2xl p-6 lg:p-8 mb-6"
    :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
  >
    <div class="mb-4">
      <h2 class="text-lg font-bold" :style="{ color: fg }">Payout bank account</h2>
      <p class="text-sm mt-1" :style="{ color: fg2 }">
        We pay your earnings here every two weeks. Verified once via Paystack.
      </p>
    </div>

    <!-- existing bank, with "change" affordance -->
    <div v-if="!editing && currentAccount" class="rounded-xl p-4 flex items-center justify-between" :style="rowStyle">
      <div>
        <div class="text-sm font-semibold" :style="{ color: fg }">
          {{ currentAccount.accountName }}
        </div>
        <div class="text-xs mt-1 font-mono" :style="{ color: fg2 }">
          {{ currentAccount.bankName }} · ••••{{ tail(currentAccount.accountNumber) }}
        </div>
      </div>
      <button
        class="text-sm font-semibold text-clay-500 bg-transparent border-none cursor-pointer hover:text-clay-600"
        @click="editing = true"
      >
        Change
      </button>
    </div>

    <!-- empty state -->
    <button
      v-else-if="!editing"
      class="w-full rounded-xl py-3 px-4 text-sm font-semibold border border-dashed cursor-pointer hover:opacity-80"
      :style="{ borderColor: inputBorder, color: fg2 }"
      @click="editing = true"
    >
      + Add bank account
    </button>

    <!-- step 1: enter bank + account number -->
    <form
      v-else-if="!profile.pendingBankConfirmation"
      class="space-y-4"
      @submit.prevent="onResolve"
    >
      <div>
        <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">Bank</label>
        <select
          v-model="bankCode"
          class="w-full rounded-xl py-3 px-4 text-base"
          :style="inputStyle"
        >
          <option value="">{{ banksLoading ? 'Loading banks…' : 'Select a bank' }}</option>
          <option v-for="b in banks" :key="b.code" :value="b.code">{{ b.name }}</option>
        </select>
      </div>

      <div>
        <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">Account number</label>
        <input
          v-model="accountNumber"
          inputmode="numeric"
          maxlength="10"
          class="w-full rounded-xl py-3 px-4 text-base font-mono tracking-wider"
          :style="inputStyle"
          placeholder="0123456789"
        />
      </div>

      <div class="flex gap-3 pt-2">
        <button
          type="button"
          class="flex-1 bg-transparent rounded-xl font-body text-sm font-bold py-3 px-4 cursor-pointer"
          :style="{ border: `1.5px solid ${inputBorder}`, color: fg }"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="busy || !bankCode || accountNumber.length < 10"
          class="flex-1 bg-clay-500 text-white border-none rounded-xl font-body text-sm font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60"
        >
          {{ busy ? 'Verifying…' : 'Verify name' }}
        </button>
      </div>
    </form>

    <!-- step 2: confirm name -->
    <div v-else class="space-y-4">
      <div class="rounded-xl p-4" :style="confirmStyle">
        <div class="text-xs uppercase font-semibold tracking-wider mb-1" :style="{ color: fg2 }">
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
        Make sure this matches the name on your bank account exactly. Confirming locks this account in for payouts.
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
import { ref, computed, onMounted } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { profileApi } from '../api/profile'
import { useProfileStore } from '../stores/profile'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const profile = useProfileStore()
const toast = useToastStore()

const editing = ref(false)
const busy = ref(false)
const bankCode = ref('')
const accountNumber = ref('')

// Banks list — vue-query because it's read-only, list-shaped, and worth
// caching aggressively (banks change rarely; sharing the cache across
// remounts of this component is the win).
const { data: banksData, isLoading: banksLoading } = useQuery({
  queryKey: ['host', 'banks'],
  queryFn: () => profileApi.listBanks(),
  staleTime: 24 * 60 * 60 * 1000, // a day
})
const banks = computed(() => {
  const raw = banksData.value
  if (!raw) return []
  // Backend response shape isn't documented; accept either an array or
  // a `{ banks: [...] }` envelope.
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.banks)) return raw.banks
  if (Array.isArray(raw.data)) return raw.data
  return []
})

function bankNameByCode(code) {
  return banks.value.find((b) => b.code === code)?.name ?? code
}

const currentAccount = computed(() => {
  // Profile shape isn't strictly documented; check common slot names.
  const p = profile.profile
  if (!p) return null
  return p.bankAccount || p.bank || null
})

function tail(num) {
  return String(num || '').slice(-4)
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
const rowStyle = computed(() => ({
  background: props.dark ? 'rgba(255,255,255,0.03)' : '#F7F5F2',
  border: `1px solid ${inputBorder.value}`,
}))
const confirmStyle = computed(() => ({
  background: props.dark ? 'rgba(180,84,48,0.08)' : '#FCF7E8',
  border: `1px solid ${props.dark ? 'rgba(180,84,48,0.25)' : '#EDD88A'}`,
}))

onMounted(() => {
  // Make sure profile is loaded so currentAccount renders correctly.
  if (!profile.profile) profile.load().catch(() => {})
})

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
    reset()
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
    toast.success('Cancelled. Try again.')
    // Server clears the pending account; user re-enters from step 1.
  } catch (err) {
    toast.error(err?.message || 'Could not cancel.')
  } finally {
    busy.value = false
  }
}

function cancel() {
  reset()
}

function reset() {
  editing.value = false
  bankCode.value = ''
  accountNumber.value = ''
  if (profile.pendingBankConfirmation) profile.cancelBankConfirmation()
}
</script>
