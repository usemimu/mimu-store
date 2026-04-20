<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <!-- Page Header -->
      <div class="mb-6 lg:mb-10">
        <h1 class="text-3xl lg:text-5xl font-display font-light tracking-tight" :style="{ color: fg }">
          Referrals
        </h1>
        <p class="mt-2 text-sm lg:text-lg" :style="{ color: fg2 }">
          Refer a business to host a mìmú screen. Earn ₦20,000 when they go live.
        </p>
      </div>

      <!-- Referral Link Card -->
      <div class="rounded-2xl p-6 lg:p-8 bg-clay-500 mb-8">
        <div class="text-xs lg:text-sm font-bold tracking-wider uppercase text-white/60 mb-3">
          Your referral link
        </div>
        <div class="font-display text-2xl lg:text-3xl font-normal text-white mb-6">
          mimu.ng/ref/apex-pharmacy
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button class="flex-1 bg-white/20 border-none rounded-lg text-white font-body text-sm font-bold py-3 px-5 cursor-pointer flex items-center justify-center gap-2 hover:bg-white/30 transition-colors">
            <PhCopy :size="18" /> Copy link
          </button>
          <button class="flex-1 bg-[#25D366] border-none rounded-lg text-white font-body text-sm font-bold py-3 px-5 cursor-pointer flex items-center justify-center gap-2 hover:bg-[#22c55e] transition-colors">
            <PhWhatsappLogo :size="18" /> Share via WhatsApp
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-3 gap-4 lg:gap-6 mb-8">
        <div
          v-for="(stat, i) in stats"
          :key="i"
          class="rounded-2xl py-6 px-4 text-center"
          :style="{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow
          }"
        >
          <div class="font-display text-2xl lg:text-3xl font-medium mb-1" :style="{ color: fg }">
            {{ stat.value }}
          </div>
          <div class="text-xs uppercase tracking-wider font-semibold" :style="{ color: fg3 }">
            {{ stat.label }}
          </div>
        </div>
      </div>

      <!-- Referrals List -->
      <div>
        <h2 class="text-sm lg:text-base font-semibold tracking-wider uppercase mb-4" :style="{ color: fg3 }">
          Your referrals
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
            v-for="(ref, i) in referrals"
            :key="i"
            class="flex items-center gap-4 p-5"
            :style="{
              borderBottom: i < referrals.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F2EFE9'}` : 'none'
            }"
          >
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              :style="{ background: dark ? '#232018' : '#EDE9E3' }"
            >
              <PhStorefront :size="24" :style="{ color: fg3 }" />
            </div>
            <div class="flex-1">
              <div class="text-sm lg:text-base font-semibold mb-1" :style="{ color: fg }">{{ ref.name }}</div>
              <div
                class="text-xs lg:text-sm"
                :class="ref.status === 'Active' ? 'text-moss-500 font-semibold' : ''"
                :style="ref.status !== 'Active' ? { color: fg3 } : {}"
              >
                {{ ref.status }}
              </div>
            </div>
            <div
              v-if="ref.earned > 0"
              class="font-display text-xl lg:text-2xl font-medium text-clay-500"
            >
              ₦{{ ref.earned.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PhCopy, PhWhatsappLogo, PhStorefront } from '@phosphor-icons/vue'

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

const stats = [
  { label: 'Referred', value: '2 hosts' },
  { label: 'Active', value: '1 screen' },
  { label: 'Earned', value: '₦20,000' }
]

const referrals = [
  { name: 'Blessed Chemist, Agege', status: 'Active', earned: 20000 },
  { name: 'Favour Salon, Ikeja', status: 'Pending install', earned: 0 }
]
</script>
