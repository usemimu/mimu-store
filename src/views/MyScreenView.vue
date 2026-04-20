<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <!-- Page Header -->
      <div class="mb-6 lg:mb-10">
        <h1 class="text-3xl lg:text-5xl font-display font-light tracking-tight" :style="{ color: fg }">
          My Screen
        </h1>
        <p class="mt-2 text-sm lg:text-lg" :style="{ color: fg2 }">
          Monitor your screen status and manage your ad slot.
        </p>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Status card -->
        <div
          class="rounded-2xl p-6 lg:p-8"
          :style="{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow
          }"
        >
          <div class="flex justify-between items-start mb-6">
            <div>
              <div class="text-base lg:text-lg font-bold mb-1" :style="{ color: fg }">Apex Pharmacy</div>
              <div class="text-sm" :style="{ color: fg3 }">14 Ogunlana Drive, Surulere</div>
            </div>
            <div
              class="flex items-center gap-2 rounded-full py-2 px-3"
              :style="{ background: dark ? 'rgba(43,114,68,0.15)' : '#EEF5F1' }"
            >
              <div class="w-2 h-2 rounded-full bg-moss-500"></div>
              <span
                class="text-xs font-bold"
                :class="dark ? 'text-moss-300' : 'text-moss-500'"
              >
                Online
              </span>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div v-for="(item, i) in screenInfo" :key="i">
              <div class="text-xs uppercase tracking-wider font-semibold mb-1" :style="{ color: fg3 }">
                {{ item.label }}
              </div>
              <div class="text-sm font-semibold" :style="{ color: fg }">{{ item.value }}</div>
            </div>
          </div>
        </div>

        <!-- Free slot promo -->
        <div
          class="rounded-2xl p-6 lg:p-8"
          :style="{
            background: dark ? 'rgba(181,84,48,0.1)' : '#FBF4F0',
            border: `1px solid ${dark ? 'rgba(181,84,48,0.25)' : '#E8C5AC'}`
          }"
        >
          <div class="text-xs lg:text-sm font-bold tracking-wider uppercase text-clay-500 mb-3">
            Your free slot — 20% of screen time
          </div>
          <div class="text-sm lg:text-base leading-relaxed mb-6" :style="{ color: fg2 }">
            You get roughly 2 hours of free ad time every day. Promote your own business.
          </div>
          <button class="bg-clay-500 text-white border-none rounded-lg font-body text-sm font-bold py-3 px-5 cursor-pointer flex items-center gap-2 hover:bg-clay-600 transition-colors">
            <PhUploadSimple :size="18" /> Upload your ad
          </button>
        </div>
      </div>

      <!-- Screen problems -->
      <div>
        <h2 class="text-sm lg:text-base font-semibold tracking-wider uppercase mb-4" :style="{ color: fg3 }">
          Screen problems?
        </h2>
        <div
          class="rounded-2xl overflow-hidden"
          :style="{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow
          }"
        >
          <button
            v-for="(issue, i) in issues"
            :key="i"
            class="w-full flex items-center gap-4 p-5 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none text-left"
            :style="{
              borderBottom: i < issues.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F2EFE9'}` : 'none'
            }"
          >
            <component :is="issue.icon" :size="24" class="flex-shrink-0" :style="{ color: fg3 }" />
            <span class="text-sm lg:text-base flex-1" :style="{ color: fg }">{{ issue.label }}</span>
            <PhCaretRight :size="18" :style="{ color: fg3 }" />
          </button>
        </div>
        <div class="mt-6">
          <WaButton label="Report via WhatsApp instead" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import WaButton from '../components/WaButton.vue'
import {
  PhUploadSimple,
  PhMonitor,
  PhWarning,
  PhSpeakerSlash,
  PhCamera,
  PhDotsThree,
  PhCaretRight
} from '@phosphor-icons/vue'

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

const screenInfo = [
  { label: 'Last seen', value: '2 min ago' },
  { label: 'Screen', value: '55″ Samsung' },
  { label: 'Brightness', value: 'Auto' }
]

const issues = [
  { label: 'Screen is off or frozen', icon: PhMonitor },
  { label: 'Picture is blurry or distorted', icon: PhWarning },
  { label: 'Sound issues', icon: PhSpeakerSlash },
  { label: 'Screen was damaged', icon: PhCamera },
  { label: 'Other issue', icon: PhDotsThree }
]
</script>
