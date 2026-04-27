<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <!-- Page Header -->
      <div class="mb-6 lg:mb-10">
        <h1 class="text-3xl lg:text-5xl font-display font-light tracking-tight" :style="{ color: fg }">
          Earnings
        </h1>
        <p class="mt-2 text-sm lg:text-lg" :style="{ color: fg2 }">
          Track your payouts and earnings history.
        </p>
      </div>

      <!-- Summary Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Total Earned Card -->
        <div
          class="rounded-2xl p-6 lg:p-8"
          :style="{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow
          }"
        >
          <div class="text-xs lg:text-sm font-semibold tracking-wider uppercase mb-3" :style="{ color: fg3 }">
            Total earned
          </div>
          <div class="font-display text-5xl lg:text-6xl font-light tracking-tight mb-2" :style="{ color: fg }">
            {{ totalEarned }}
          </div>
          <div class="text-sm" :style="{ color: fg3 }">
            {{ sinceLabel }}
          </div>
        </div>

        <!-- Next Payout Card -->
        <div
          class="rounded-2xl p-6 lg:p-8"
          :style="{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow
          }"
        >
          <div class="text-xs lg:text-sm font-semibold tracking-wider uppercase mb-3" :style="{ color: fg3 }">
            Next payout
          </div>
          <div class="font-display text-5xl lg:text-6xl font-light tracking-tight mb-2 text-clay-500">
            {{ upcomingNet }}
          </div>
          <div class="text-sm mb-4" :style="{ color: fg3 }">{{ upcomingDate }}</div>
          <button
            type="button"
            class="text-xs font-semibold text-clay-500 hover:text-clay-600 bg-transparent border-none cursor-pointer"
            @click="showEarlyModal = true"
          >
            Need it sooner? Request early payout →
          </button>
        </div>
      </div>

      <!-- Early payout modal -->
      <div
        v-if="showEarlyModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.5)"
        @click.self="showEarlyModal = false"
      >
        <div class="w-full max-w-md rounded-2xl p-6" :style="{ background: cardBg, border: cardBorder }">
          <h3 class="text-lg font-bold mb-2" :style="{ color: fg }">Request early payout</h3>
          <p class="text-sm mb-4" :style="{ color: fg3 }">
            Pays out your current balance now (subject to ops review). Minimum balance is ₦20,000.
          </p>
          <textarea
            v-model="earlyReason"
            rows="3"
            placeholder="Why do you need this early? (10–500 characters)"
            class="w-full rounded-xl py-2 px-3 text-sm mb-4"
            :style="{ background: cardBg, border: '1.5px solid #DDD8D0', color: fg }"
          />
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-xl text-sm font-bold py-2.5 px-4 cursor-pointer"
              :style="{ border: '1.5px solid #DDD8D0', color: fg, background: 'transparent' }"
              @click="showEarlyModal = false"
            >
              Cancel
            </button>
            <button
              type="button"
              :disabled="earlyBusy || earlyReason.trim().length < 10"
              class="flex-1 bg-clay-500 text-white border-none rounded-xl text-sm font-bold py-2.5 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60"
              @click="onEarlyRequest"
            >
              {{ earlyBusy ? 'Submitting…' : 'Submit request' }}
            </button>
          </div>
        </div>
      </div>

      <!-- WHT notice -->
      <div
        class="py-4 px-5 rounded-xl mb-8 flex gap-4 items-start"
        :style="{
          background: dark ? 'rgba(180,136,28,0.1)' : '#FCF7E8',
          border: `1px solid ${dark ? 'rgba(180,136,28,0.25)' : '#EDD88A'}`
        }"
      >
        <PhInfo :size="20" class="text-gold-500 flex-shrink-0 mt-1" />
        <div
          class="text-sm leading-relaxed"
          :style="{ color: dark ? '#E0BF50' : '#8D6A15' }"
        >
          5% WHT is deducted from each payout as required by FIRS. You receive ₦11,970 from every ₦12,600 earned.
        </div>
      </div>

      <!-- Payout history -->
      <div>
        <h2 class="text-sm lg:text-base font-semibold tracking-wider uppercase mb-4" :style="{ color: fg3 }">
          Payout history
        </h2>
        <div
          class="rounded-2xl overflow-hidden"
          :style="{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow
          }"
        >
          <div
            v-for="(p, i) in payouts"
            :key="i"
            class="flex items-center gap-4 p-5"
            :style="{
              borderBottom: i < payouts.length - 1 ? `1px solid ${divLine}` : 'none'
            }"
          >
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              :style="{ background: dark ? 'rgba(43,114,68,0.15)' : '#EEF5F1' }"
            >
              <PhBank :size="22" class="text-moss-500" />
            </div>
            <div class="flex-1">
              <div class="text-sm lg:text-base font-semibold" :style="{ color: fg }">{{ p.label }}</div>
              <div class="text-xs lg:text-sm mt-1" :style="{ color: fg3 }">
                {{ p.date }}<span v-if="p.bankName"> · {{ p.bankName }}</span><span v-if="p.bankTail"> · ••{{ p.bankTail }}</span>
              </div>
            </div>
            <div>
              <div class="font-display text-xl lg:text-2xl font-medium text-moss-500 text-right">
                ₦{{ p.amount.toLocaleString() }}
              </div>
              <div class="text-xs text-right" :style="{ color: fg3 }">Paid</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { PhInfo, PhBank } from '@phosphor-icons/vue'
import { earningsApi } from '../api/earnings'
import { payoutsApi } from '../api/payouts'
import { useToastStore } from '../stores/toast'

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})

const fg = computed(() => props.dark ? '#F2EFE9' : '#0E0D0B')
const fg2 = computed(() => props.dark ? '#A89F94' : '#5E574F')
const fg3 = computed(() => props.dark ? '#5E574F' : '#A89F94')
const cardBg = computed(() => props.dark ? '#1A1815' : '#fff')
const cardBorder = computed(() => props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none')
const cardShadow = computed(() => props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)')
const divLine = computed(() => props.dark ? 'rgba(255,255,255,0.06)' : '#F2EFE9')

const summaryQuery = useQuery({
  queryKey: ['host', 'earnings', 'summary'],
  queryFn: () => earningsApi.summary(),
})
const upcomingQuery = useQuery({
  queryKey: ['host', 'payouts', 'upcoming'],
  queryFn: () => payoutsApi.upcoming(),
})
const historyQuery = useQuery({
  queryKey: ['host', 'payouts', 'history'],
  queryFn: () => payoutsApi.history(),
})

function toNaira(value) {
  if (value == null) return 0
  if (typeof value === 'object') {
    if (value.kobo != null) return Math.round(Number(value.kobo) / 100)
    if (value.naira != null) return Number(value.naira)
  }
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return 0
  return n > 1_000_000 ? Math.round(n / 100) : Math.round(n)
}

function formatNaira(n) {
  return `₦${n.toLocaleString('en-NG')}`
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

const totalEarned = computed(() => {
  const s = summaryQuery.data.value || {}
  return formatNaira(toNaira(s.totalGrossKobo ?? s.totalGross ?? s.lifetimeKobo ?? s.total))
})

const totalPayoutsCount = computed(() => {
  const list = extractList(historyQuery.data.value)
  return list.length
})

const sinceLabel = computed(() => {
  const list = extractList(historyQuery.data.value)
  const oldest = list[list.length - 1]
  if (!oldest) return '—'
  return `Since ${formatDate(oldest.paidAt || oldest.createdAt)} · ${list.length} payouts`
})

const upcoming = computed(() => upcomingQuery.data.value || {})
const upcomingNet = computed(() =>
  formatNaira(toNaira(upcoming.value.netKobo ?? upcoming.value.net ?? upcoming.value.amountKobo)),
)
const upcomingDate = computed(() =>
  formatDate(upcoming.value.scheduledFor || upcoming.value.payoutDate),
)

function extractList(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  return raw.data || raw.items || raw.payouts || []
}

const payouts = computed(() => {
  const list = extractList(historyQuery.data.value)
  return list.map((p) => ({
    date: formatDate(p.paidAt || p.createdAt),
    amount: toNaira(p.netKobo ?? p.amountKobo ?? p.net ?? p.amount),
    status: p.status || 'paid',
    label: p.label || p.periodLabel || (p.paidAt ? 'Payout' : 'Pending'),
    bankTail: (p.bankAccount?.accountNumber || '').slice(-4),
    bankName: p.bankAccount?.bankName || '',
  }))
})

const toast = useToastStore()
const qc = useQueryClient()
const showEarlyModal = ref(false)
const earlyReason = ref('')
const earlyBusy = ref(false)

async function onEarlyRequest() {
  const reason = earlyReason.value.trim()
  if (reason.length < 10 || reason.length > 500) {
    toast.error('Reason must be 10–500 characters.')
    return
  }
  earlyBusy.value = true
  try {
    await payoutsApi.earlyRequest(reason)
    toast.success('Request submitted. Ops will review shortly.')
    showEarlyModal.value = false
    earlyReason.value = ''
    await qc.invalidateQueries({ queryKey: ['host', 'payouts'] })
  } catch (err) {
    if (err?.status === 402) {
      toast.error('Balance must be at least ₦20,000.')
    } else if (err?.status === 409) {
      toast.error('You already have a pending early-payout request.')
    } else {
      toast.error(err?.message || 'Could not submit request.')
    }
  } finally {
    earlyBusy.value = false
  }
}
</script>
