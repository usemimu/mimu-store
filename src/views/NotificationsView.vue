<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <button
        class="flex items-center gap-2 mb-6 text-sm font-semibold bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
        :style="{ color: fg2 }"
        @click="$router.back()"
      >
        <PhArrowLeft :size="18" /> Back
      </button>

      <div class="mb-6 lg:mb-10 flex items-start gap-3 flex-wrap">
        <div class="flex-1 min-w-0">
          <h1 class="text-3xl lg:text-4xl font-display font-light tracking-tight" :style="{ color: fg }">
            Notification Settings
          </h1>
          <p class="mt-2 text-sm lg:text-base" :style="{ color: fg2 }">
            Manage how you receive notifications.
          </p>
        </div>
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mt-1 lg:mt-3"
          :style="{
            background: dark ? 'rgba(180,84,48,0.15)' : '#FBF4F0',
            color: '#B55430',
            border: `1px solid ${dark ? 'rgba(180,84,48,0.35)' : '#E8C5AC'}`
          }"
        >
          <PhClock :size="12" weight="bold" />
          Coming soon
        </span>
      </div>

      <!-- Preferences UI lives here once the backend ships a
           `/host/notification-preferences` endpoint. Until then the page
           is honest about what's available rather than rendering toggles
           that don't persist. -->
      <div
        class="rounded-2xl p-8 lg:p-12 text-center"
        :style="{
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow
        }"
      >
        <div
          class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          :style="{ background: dark ? 'rgba(180,84,48,0.15)' : '#FBF4F0' }"
        >
          <PhBell :size="36" weight="duotone" class="text-clay-500" />
        </div>

        <h2 class="font-display text-2xl lg:text-3xl font-light tracking-tight mb-3" :style="{ color: fg }">
          Notification preferences are coming soon
        </h2>

        <p class="text-sm lg:text-base leading-relaxed max-w-md mx-auto mb-8" :style="{ color: fg2 }">
          We're building the controls that let you choose what you hear about
          and where. Until then, we send a small set of default alerts so you
          don't miss anything important.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
          <div
            v-for="(item, i) in defaults"
            :key="i"
            class="rounded-xl p-4"
            :style="{
              background: dark ? 'rgba(255,255,255,0.03)' : '#F7F5F2'
            }"
          >
            <component :is="item.icon" :size="20" class="text-clay-500 mb-2" />
            <div class="text-sm font-semibold mb-1" :style="{ color: fg }">
              {{ item.title }}
            </div>
            <div class="text-xs leading-snug" :style="{ color: fg3 }">
              {{ item.body }}
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t inline-block px-4" :style="{ borderColor: dark ? 'rgba(255,255,255,0.08)' : '#EDE9E3' }">
          <p class="text-xs" :style="{ color: fg3 }">
            Need to opt out of something now? Email
            <a href="mailto:support@usemimu.com" class="font-semibold text-clay-500 hover:text-clay-600">
              support@usemimu.com
            </a>
            and we'll handle it manually.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PhArrowLeft, PhClock, PhBell, PhEnvelopeSimple, PhWhatsappLogo, PhWarning } from '@phosphor-icons/vue'

const props = defineProps({
  dark: {
    type: Boolean,
    default: false,
  },
})

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const fg3 = computed(() => (props.dark ? '#5E574F' : '#A89F94'))
const cardBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const cardBorder = computed(() => (props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none'))
const cardShadow = computed(() => (props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)'))

// What we actually send today, in case the user is wondering. Maps to
// the categories that will be toggleable once the preferences endpoint
// ships.
const defaults = [
  {
    icon: PhEnvelopeSimple,
    title: 'Payout emails',
    body: 'A confirmation each time a payout lands in your account.',
  },
  {
    icon: PhWhatsappLogo,
    title: 'WhatsApp alerts',
    body: 'Critical screen-status pings (offline, payout issues).',
  },
  {
    icon: PhWarning,
    title: 'Account security',
    body: 'Sign-in events and password changes — always on.',
  },
]
</script>
