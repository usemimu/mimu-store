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
            ₦214,700
          </div>
          <div class="text-sm" :style="{ color: fg3 }">
            Since Oct 2024 · 26 payouts
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
            ₦12,600
          </div>
          <div class="text-sm" :style="{ color: fg3 }">Friday, Apr 25</div>
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
                {{ p.date }} · GTBank · ••3421
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
import { computed } from 'vue'
import { PhInfo, PhBank } from '@phosphor-icons/vue'

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

const payouts = [
  { date: 'Apr 18, 2026', amount: 12600, status: 'paid', label: 'This week (estimated)' },
  { date: 'Apr 11, 2026', amount: 11200, status: 'paid', label: 'Last week' },
  { date: 'Apr 4, 2026', amount: 13400, status: 'paid', label: 'Apr 4 week' },
  { date: 'Mar 28, 2026', amount: 10800, status: 'paid', label: 'Mar 28 week' }
]
</script>
