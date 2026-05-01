<template>
  <div
    class="rounded-2xl p-6 lg:p-8"
    :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
  >
    <div class="flex items-center justify-between mb-4">
      <div>
        <h2 class="text-lg lg:text-xl font-bold" :style="{ color: fg }">
          Bank accounts
        </h2>
        <p class="text-xs mt-1" :style="{ color: fg2 }">
          Up to 3 verified accounts. Payouts go to the primary.
        </p>
      </div>
      <span
        class="text-xs font-mono"
        :style="{ color: fg3 }"
      >
        {{ accounts.length }}/3
      </span>
    </div>

    <!-- Loading -->
    <div v-if="listQuery.isLoading.value" class="text-sm" :style="{ color: fg2 }">
      Loading…
    </div>

    <!-- Existing accounts -->
    <ul v-else-if="accounts.length" class="space-y-3 mb-4">
      <li
        v-for="acct in accounts"
        :key="acct.id"
        class="rounded-xl p-4"
        :style="{
          background: dark ? 'rgba(255,255,255,0.03)' : '#F7F5F2',
          border: acct.isPrimary
            ? `1.5px solid ${primaryAccent}`
            : `1px solid ${borderColor}`,
        }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-sm" :style="{ color: fg }">
                {{ acct.bankName }}
              </span>
              <span
                v-if="acct.isPrimary"
                class="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded"
                :style="{ background: primaryAccent, color: '#fff' }"
              >
                Primary
              </span>
              <span
                v-else-if="!acct.verified"
                class="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded"
                :style="{ background: '#FCF7E8', color: '#8D6A15' }"
              >
                Pending
              </span>
            </div>
            <div class="font-mono text-sm" :style="{ color: fg2 }">
              ••••{{ acct.accountNumber.slice(-4) }}
            </div>
            <div v-if="acct.accountHolderName" class="text-xs mt-1" :style="{ color: fg3 }">
              {{ acct.accountHolderName }}
            </div>
          </div>
          <div class="flex flex-col gap-2 items-end shrink-0">
            <button
              v-if="!acct.verified"
              class="text-xs font-semibold px-3 py-1.5 rounded-md border-none cursor-pointer"
              :style="{ background: primaryAccent, color: '#fff' }"
              :disabled="busy"
              @click="onConfirm(acct, true)"
            >
              Confirm
            </button>
            <button
              v-else-if="!acct.isPrimary"
              class="text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer"
              :style="{
                background: 'transparent',
                border: `1px solid ${borderColor}`,
                color: fg,
              }"
              :disabled="busy"
              @click="onSetPrimary(acct)"
            >
              Make primary
            </button>
            <button
              v-if="!acct.isPrimary"
              class="text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer"
              :style="{
                background: 'transparent',
                border: 'none',
                color: '#B55430',
              }"
              :disabled="busy"
              @click="onRemove(acct)"
            >
              Remove
            </button>
          </div>
        </div>
      </li>
    </ul>

    <p
      v-else
      class="text-sm mb-4"
      :style="{ color: fg2 }"
    >
      No bank accounts on file yet. Add one so we can pay you.
    </p>

    <!-- Add new (resolve form) -->
    <div v-if="canAddMore && !pendingResolve">
      <button
        v-if="!showAddForm"
        class="w-full text-sm font-semibold py-3 rounded-xl cursor-pointer"
        :style="{
          background: 'transparent',
          border: `1.5px dashed ${borderColor}`,
          color: fg2,
        }"
        @click="showAddForm = true"
      >
        + Add bank account
      </button>

      <form
        v-else
        class="rounded-xl p-4 space-y-3"
        :style="{
          background: dark ? 'rgba(255,255,255,0.03)' : '#F7F5F2',
          border: `1px solid ${borderColor}`,
        }"
        @submit.prevent="onResolve"
      >
        <div>
          <label class="text-xs font-semibold mb-1 block" :style="{ color: fg }">
            Bank
          </label>
          <select
            v-model="form.bankCode"
            class="w-full rounded-lg py-2.5 px-3 text-sm"
            :style="inputStyle"
            required
          >
            <option value="" disabled>Select your bank…</option>
            <option v-for="b in banks" :key="b.code" :value="b.code">
              {{ b.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-xs font-semibold mb-1 block" :style="{ color: fg }">
            Account number
          </label>
          <input
            v-model.trim="form.accountNumber"
            inputmode="numeric"
            maxlength="10"
            class="w-full rounded-lg py-2.5 px-3 text-sm font-mono"
            :style="inputStyle"
            placeholder="0123456789"
            required
          />
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 text-sm font-semibold py-2 rounded-lg cursor-pointer"
            :style="{
              background: 'transparent',
              border: `1px solid ${borderColor}`,
              color: fg,
            }"
            @click="cancelAdd"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="!canResolve || busy"
            class="flex-1 text-sm font-semibold py-2 rounded-lg cursor-pointer disabled:opacity-60"
            :style="{ background: primaryAccent, color: '#fff', border: 'none' }"
          >
            {{ busy ? 'Verifying…' : 'Verify account' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Resolve confirmation prompt -->
    <div
      v-if="pendingResolve"
      class="rounded-xl p-4 space-y-3"
      :style="{
        background: dark ? 'rgba(43,114,68,0.1)' : '#EEF5F1',
        border: `1px solid ${dark ? 'rgba(43,114,68,0.3)' : '#C8DBCC'}`,
      }"
    >
      <p class="text-sm" :style="{ color: fg }">
        Paystack returned the holder name as
        <strong>{{ pendingResolve.accountHolderName }}</strong>
        for {{ pendingResolve.bankName }}
        ••••{{ pendingResolve.accountNumber.slice(-4) }}.
        Confirm only if this matches your records.
      </p>
      <div class="flex gap-2">
        <button
          type="button"
          class="flex-1 text-sm font-semibold py-2 rounded-lg cursor-pointer"
          :style="{
            background: 'transparent',
            border: `1px solid ${borderColor}`,
            color: fg,
          }"
          :disabled="busy"
          @click="onConfirm(pendingResolve, false)"
        >
          That's not me
        </button>
        <button
          type="button"
          class="flex-1 text-sm font-semibold py-2 rounded-lg cursor-pointer"
          :style="{ background: primaryAccent, color: '#fff', border: 'none' }"
          :disabled="busy"
          @click="onConfirm(pendingResolve, true)"
        >
          Confirm
        </button>
      </div>
    </div>

    <p v-if="!canAddMore" class="text-xs mt-3" :style="{ color: fg3 }">
      You've hit the 3-account limit. Remove one to add another.
    </p>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { profileApi } from '../api/profile'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const toast = useToastStore()
const qc = useQueryClient()

// Theme tokens — keep visual consistency with Account/EditBusiness.
const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const fg3 = computed(() => (props.dark ? '#5E574F' : '#A89F94'))
const cardBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const cardBorder = computed(() =>
  props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none',
)
const cardShadow = computed(() =>
  props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)',
)
const borderColor = computed(() => (props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0'))
const inputBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const inputStyle = computed(() => ({
  background: inputBg.value,
  border: `1.5px solid ${borderColor.value}`,
  color: fg.value,
}))
const primaryAccent = '#B55430'

const banksQuery = useQuery({
  queryKey: ['host', 'profile', 'banks'],
  queryFn: () => profileApi.listBanks(),
  staleTime: 60 * 60 * 1000, // banks list is essentially static
})

const banks = computed(() => {
  const raw = banksQuery.data.value
  if (Array.isArray(raw)) return raw
  return raw?.banks ?? raw?.data ?? []
})

const listQuery = useQuery({
  queryKey: ['host', 'profile', 'bank-accounts'],
  queryFn: () => profileApi.listBankAccounts(),
})

const accounts = computed(() => {
  const raw = listQuery.data.value
  return Array.isArray(raw) ? raw : []
})

const canAddMore = computed(() => accounts.value.length < 3)
const showAddForm = ref(false)
const form = reactive({ bankCode: '', accountNumber: '' })
const canResolve = computed(
  () => !!form.bankCode && /^\d{10}$/.test(form.accountNumber),
)

// `pendingResolve` is the freshly-resolved (unverified) row. The user
// either confirms ("Confirm") or rejects ("That's not me") — both
// outcomes invalidate the list query so the row state is the truth.
const pendingResolve = computed(
  () => accounts.value.find((a) => !a.verified) || null,
)

function cancelAdd() {
  showAddForm.value = false
  form.bankCode = ''
  form.accountNumber = ''
}

const addMutation = useMutation({
  mutationFn: (body) => profileApi.addBankAccountV2(body),
  onSuccess: () => {
    cancelAdd()
    qc.invalidateQueries({ queryKey: ['host', 'profile', 'bank-accounts'] })
  },
  onError: (err) => {
    toast.error(err?.message || 'Could not verify account.')
  },
})

const confirmMutation = useMutation({
  mutationFn: ({ id, confirmed }) =>
    profileApi.confirmBankAccountV2(id, confirmed),
  onSuccess: (_data, vars) => {
    qc.invalidateQueries({ queryKey: ['host', 'profile', 'bank-accounts'] })
    qc.invalidateQueries({ queryKey: ['host', 'profile'] }) // host_profiles cache changed
    if (vars.confirmed) toast.success('Bank account verified.')
    else toast.success('Account discarded.')
  },
  onError: (err) => {
    toast.error(err?.message || 'Could not update account.')
  },
})

const setPrimaryMutation = useMutation({
  mutationFn: (id) => profileApi.setPrimaryBankAccount(id),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['host', 'profile', 'bank-accounts'] })
    qc.invalidateQueries({ queryKey: ['host', 'profile'] })
    toast.success('Primary account updated.')
  },
  onError: (err) => {
    toast.error(err?.message || 'Could not change primary.')
  },
})

const removeMutation = useMutation({
  mutationFn: (id) => profileApi.removeBankAccount(id),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['host', 'profile', 'bank-accounts'] })
    qc.invalidateQueries({ queryKey: ['host', 'profile'] })
    toast.success('Account removed.')
  },
  onError: (err) => {
    toast.error(err?.message || 'Could not remove account.')
  },
})

const busy = computed(
  () =>
    addMutation.isPending.value ||
    confirmMutation.isPending.value ||
    setPrimaryMutation.isPending.value ||
    removeMutation.isPending.value,
)

function onResolve() {
  if (!canResolve.value) return
  addMutation.mutate({
    bankCode: form.bankCode,
    accountNumber: form.accountNumber,
  })
}

function onConfirm(acct, confirmed) {
  confirmMutation.mutate({ id: acct.id, confirmed })
}

function onSetPrimary(acct) {
  setPrimaryMutation.mutate(acct.id)
}

function onRemove(acct) {
  if (!confirm(`Remove ${acct.bankName} ••••${acct.accountNumber.slice(-4)}?`)) return
  removeMutation.mutate(acct.id)
}
</script>
