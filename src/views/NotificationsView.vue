<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <!-- Back Button -->
      <button
        @click="$router.back()"
        class="flex items-center gap-2 mb-6 text-sm font-semibold bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
        :style="{ color: fg2 }"
      >
        <PhArrowLeft :size="18" /> Back
      </button>

      <!-- Page Header -->
      <div class="mb-6 lg:mb-10">
        <h1 class="text-3xl lg:text-4xl font-display font-light tracking-tight" :style="{ color: fg }">
          Notification Settings
        </h1>
        <p class="mt-2 text-sm lg:text-base" :style="{ color: fg2 }">
          Manage how you receive notifications
        </p>
      </div>

      <!-- Settings -->
      <div class="space-y-4">
        <!-- Email Notifications -->
        <div
          class="rounded-2xl p-6"
          :style="{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow
          }"
        >
          <h2 class="text-lg font-bold mb-4" :style="{ color: fg }">
            Email Notifications
          </h2>
          <div class="space-y-4">
            <div
              v-for="(item, i) in emailSettings"
              :key="i"
              class="flex items-center justify-between py-3"
              :style="{
                borderBottom: i < emailSettings.length - 1 ? `1px solid ${divLine}` : 'none'
              }"
            >
              <div class="flex-1">
                <div class="text-sm font-semibold mb-1" :style="{ color: fg }">
                  {{ item.title }}
                </div>
                <div class="text-xs" :style="{ color: fg3 }">
                  {{ item.description }}
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="item.enabled"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  :class="item.enabled ? 'bg-clay-500' : (dark ? 'bg-neutral-700' : 'bg-neutral-300')"
                ></div>
              </label>
            </div>
          </div>
        </div>

        <!-- WhatsApp Notifications -->
        <div
          class="rounded-2xl p-6"
          :style="{
            background: cardBg,
            border: cardBorder,
            boxShadow: cardShadow
          }"
        >
          <h2 class="text-lg font-bold mb-4" :style="{ color: fg }">
            WhatsApp Notifications
          </h2>
          <div class="space-y-4">
            <div
              v-for="(item, i) in whatsappSettings"
              :key="i"
              class="flex items-center justify-between py-3"
              :style="{
                borderBottom: i < whatsappSettings.length - 1 ? `1px solid ${divLine}` : 'none'
              }"
            >
              <div class="flex-1">
                <div class="text-sm font-semibold mb-1" :style="{ color: fg }">
                  {{ item.title }}
                </div>
                <div class="text-xs" :style="{ color: fg3 }">
                  {{ item.description }}
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  v-model="item.enabled"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  :class="item.enabled ? 'bg-clay-500' : (dark ? 'bg-neutral-700' : 'bg-neutral-300')"
                ></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="mt-6">
        <button
          @click="handleSave"
          class="w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 transition-colors"
        >
          Save Preferences
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { PhArrowLeft } from '@phosphor-icons/vue'

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const emailSettings = ref([
  { title: 'Weekly Earnings Report', description: 'Get a summary of your weekly earnings', enabled: true },
  { title: 'Payout Notifications', description: 'Receive alerts when payouts are processed', enabled: true },
  { title: 'Screen Status Alerts', description: 'Get notified if your screen goes offline', enabled: true },
  { title: 'Marketing Updates', description: 'Receive news and tips about mìmú', enabled: false }
])

const whatsappSettings = ref([
  { title: 'Screen Alerts', description: 'Critical screen status updates', enabled: true },
  { title: 'Payout Confirmations', description: 'Payment confirmation messages', enabled: true },
  { title: 'Support Messages', description: 'Responses from support team', enabled: true }
])

const fg = computed(() => props.dark ? '#F2EFE9' : '#0E0D0B')
const fg2 = computed(() => props.dark ? '#A89F94' : '#5E574F')
const fg3 = computed(() => props.dark ? '#5E574F' : '#A89F94')
const cardBg = computed(() => props.dark ? '#1A1815' : '#fff')
const cardBorder = computed(() => props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none')
const cardShadow = computed(() => props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)')
const divLine = computed(() => props.dark ? 'rgba(255,255,255,0.06)' : '#F2EFE9')

const handleSave = () => {
  // Save preferences
  router.push('/account')
}
</script>
