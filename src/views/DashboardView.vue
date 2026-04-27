<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <!-- Page Header -->
      <div class="mb-6 lg:mb-10">
        <h1 class="text-3xl lg:text-5xl font-display font-light tracking-tight" :style="{ color: fg }">
          Dashboard
        </h1>
        <p class="mt-2 text-sm lg:text-lg" :style="{ color: fg2 }">
          Welcome back! Here's your screen performance overview.
        </p>
      </div>

      <!-- Period Selector -->
      <div class="mb-6">
        <div
          class="inline-flex rounded-lg p-1"
          :class="dark ? 'bg-neutral-800' : 'bg-neutral-100'"
        >
          <button
            v-for="p in periods"
            :key="p.id"
            @click="period = p.id"
            class="px-4 py-2 rounded-md text-sm font-semibold transition-all"
            :class="period === p.id
              ? (dark ? 'bg-neutral-900 text-neutral-50 shadow-sm' : 'bg-white text-neutral-900 shadow-sm')
              : (dark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-900')
            "
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <!-- Main Earnings Card -->
        <div class="md:col-span-2 bg-clay-500 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
          <div class="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5"></div>
          <div class="relative">
            <div class="text-xs font-bold tracking-wider uppercase opacity-60 mb-2">
              {{ periodLabel }}
            </div>
            <div class="font-display text-5xl lg:text-6xl font-light tracking-tight mb-2">
              {{ currentData.earned }}
            </div>
            <div class="text-sm opacity-75">
              {{ currentData.plays.toLocaleString() }} plays · screen online {{ currentData.since }}
            </div>
          </div>
        </div>

        <!-- Next Payout Card -->
        <div class="rounded-2xl p-6" :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }">
          <PhCalendarBlank :size="24" class="text-clay-500 mb-3" />
          <div class="text-xs font-semibold tracking-wider uppercase mb-2" :style="{ color: fg3 }">
            Next Payout
          </div>
          <div class="font-display text-3xl font-medium mb-1" :style="{ color: fg }">
            ₦12,600
          </div>
          <div class="text-xs" :style="{ color: fg3 }">Friday, Apr 25</div>
        </div>

        <!-- Screen Health Card -->
        <div class="rounded-2xl p-6" :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }">
          <PhHeart :size="24" class="text-moss-500 mb-3" />
          <div class="text-xs font-semibold tracking-wider uppercase mb-2" :style="{ color: fg3 }">
            Screen Health
          </div>
          <div class="font-display text-3xl font-medium mb-1" :style="{ color: fg }">
            100%
          </div>
          <div class="text-xs" :style="{ color: fg3 }">All systems normal</div>
        </div>
      </div>

      <!-- Charts and Details Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Chart -->
        <div class="lg:col-span-2 rounded-2xl p-6" :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }">
          <h3 class="text-sm font-semibold tracking-wider uppercase mb-4" :style="{ color: fg3 }">
            Plays per hour — today
          </h3>
          <div class="flex items-end gap-1 h-32 lg:h-48">
            <div
              v-for="(h, i) in bars"
              :key="i"
              class="flex-1 rounded-t bg-clay-500 transition-all hover:opacity-80"
              :style="{ height: `${h}%`, opacity: i > 17 ? 0.9 : 0.3 }"
            ></div>
          </div>
          <div class="flex justify-between mt-3">
            <span class="text-xs" :style="{ color: fg3 }">12am</span>
            <span class="text-xs" :style="{ color: fg3 }">Now</span>
          </div>
        </div>

        <!-- Milestone -->
        <div
          class="rounded-2xl p-6"
          :style="{
            background: dark ? 'rgba(43,114,68,0.12)' : '#EEF5F1',
            border: `1px solid ${dark ? 'rgba(43,114,68,0.25)' : '#A4D2B4'}`
          }"
        >
          <div class="w-14 h-14 rounded-xl bg-moss-500 flex items-center justify-center mb-4">
            <PhTrophy :size="28" class="text-white" />
          </div>
          <h3 class="text-lg font-bold mb-2" :class="dark ? 'text-moss-300' : 'text-moss-600'">
            First ₦200k earned
          </h3>
          <p class="text-sm" :style="{ color: fg2 }">
            You hit this milestone last week. 6 months on the mìmú network.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { PhCalendarBlank, PhHeart, PhTrophy } from '@phosphor-icons/vue'
import { earningsApi } from '../api/earnings'

const props = defineProps({
  dark: { type: Boolean, default: false }
})

const period = ref('today')
const fg = computed(() => props.dark ? '#F2EFE9' : '#0E0D0B')
const fg2 = computed(() => props.dark ? '#A89F94' : '#5E574F')
const fg3 = computed(() => props.dark ? '#5E574F' : '#A89F94')
const cardBg = computed(() => props.dark ? '#1A1815' : '#fff')
const cardBorder = computed(() => props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none')
const cardShadow = computed(() => props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)')

const periods = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'alltime', label: 'All time' }
]

// Earnings summary — single round-trip; we project per-period KPIs out of
// whatever shape the backend returns.
const summaryQuery = useQuery({
  queryKey: ['host', 'earnings', 'summary'],
  queryFn: () => earningsApi.summary(),
})

// Daily buckets — drives the bar chart at the bottom of the dashboard.
const byDayQuery = useQuery({
  queryKey: ['host', 'earnings', 'by-day'],
  queryFn: () => earningsApi.byDay(),
})

/** Convert kobo or naira value (string|number) → integer naira. */
function toNaira(value) {
  if (value == null) return 0
  if (typeof value === 'object') {
    if (value.kobo != null) return Math.round(Number(value.kobo) / 100)
    if (value.naira != null) return Number(value.naira)
  }
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return 0
  // Heuristic: very large numbers are kobo; otherwise treat as naira.
  return n > 1_000_000 ? Math.round(n / 100) : Math.round(n)
}

function formatNaira(n) {
  return `₦${n.toLocaleString('en-NG')}`
}

/** Pick the right slice from the summary response for the active period. */
function periodSlice(summary, periodId) {
  if (!summary) return null
  // Most likely shapes (best-effort):
  //   { today: {...}, week: {...}, month: {...}, alltime: {...} }
  //   { today: {grossKobo, plays}, ... }
  if (summary[periodId]) return summary[periodId]
  // Flat shape: keys like todayGrossKobo / weekGrossKobo
  return summary
}

const currentData = computed(() => {
  const slice = periodSlice(summaryQuery.data.value, period.value) || {}
  const grossNaira = toNaira(
    slice.grossKobo ?? slice.gross ?? slice.amountKobo ?? slice.amount ?? slice.earned,
  )
  const plays = slice.plays ?? slice.impressions ?? 0
  const lastSeen = slice.lastSeenAt || slice.since || '—'
  return {
    earned: formatNaira(grossNaira),
    plays,
    status: slice.status || 'Online',
    since: typeof lastSeen === 'string' ? lastSeen : '—',
  }
})

const periodLabel = computed(() => {
  switch (period.value) {
    case 'today': return 'Earned today'
    case 'week': return 'This week'
    case 'month': return 'This month'
    case 'alltime': return 'All time'
    default: return 'Earned today'
  }
})

/** Drive the chart from `/earnings/by-day` if available, else placeholder. */
const bars = computed(() => {
  const raw = byDayQuery.data.value
  if (!raw) return [30, 50, 65, 80, 72, 60, 45, 55, 78, 92, 88, 70, 58, 42, 50, 68, 84, 95, 80, 65, 52, 44, 60, 70]
  const series = Array.isArray(raw) ? raw : raw.data || raw.items || raw.days || []
  if (!series.length) return []
  const values = series.map((d) => toNaira(d.grossKobo ?? d.amountKobo ?? d.amount ?? d.value))
  const max = Math.max(...values, 1)
  // Normalise to 0..100 for the bar render.
  return values.map((v) => Math.round((v / max) * 100))
})
</script>
