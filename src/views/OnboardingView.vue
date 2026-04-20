<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Step 0: Welcome -->
    <div v-if="step === 0" class="flex-1 flex flex-col p-8 px-6">
      <Logo :dark="dark" />

      <div class="flex-1 flex flex-col justify-center">
        <div class="mb-2">
          <span class="text-[11px] font-semibold tracking-[0.07em] uppercase text-clay-500">You're hosting a mìmú screen</span>
        </div>
        <h1 class="font-display text-[34px] font-normal leading-tight tracking-tight mb-4" :style="{ color: fg }">
          Welcome, Pharmacy owner.
        </h1>
        <p class="text-[15px] leading-relaxed mb-3" :style="{ color: fg2 }">
          Your screen is already installed. This app lets you track your earnings, check your screen status, and get paid.
        </p>
        <p class="text-sm leading-normal mb-8" :style="{ color: fg3 }">
          No agency. No middleman. Money goes straight to your bank account every week.
        </p>

        <!-- Trust signals -->
        <div class="flex flex-col gap-[10px] mb-8">
          <div v-for="(item, i) in trustSignals" :key="i" class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
              :style="{ background: dark ? 'rgba(181,84,48,0.15)' : '#FBF4F0' }"
            >
              <component :is="item.icon" :size="18" class="text-clay-500" />
            </div>
            <span class="text-sm font-medium" :style="{ color: fg }">{{ item.text }}</span>
          </div>
        </div>
      </div>

      <button
        @click="step = 1"
        class="bg-clay-500 text-white border-none rounded-[10px] font-body text-base font-bold py-4 px-4 cursor-pointer w-full"
      >
        Set up my account
      </button>
    </div>

    <!-- Step 1: Business confirmation -->
    <div v-else-if="step === 1" class="flex-1 flex flex-col p-6 overflow-hidden">
      <button
        @click="step = 0"
        class="bg-transparent border-none cursor-pointer flex items-center gap-[6px] text-[13px] mb-6 p-0"
        :style="{ color: fg2 }"
      >
        <PhArrowLeft :size="16" /> Back
      </button>

      <h2 class="font-display text-[28px] font-medium mb-[6px]" :style="{ color: fg }">Confirm your business</h2>
      <p class="text-sm mb-7" :style="{ color: fg2 }">Our team pre-filled this from your installation. Check it's correct.</p>

      <div class="flex-1 overflow-y-auto scroller">
        <div class="flex flex-col gap-[14px]">
          <div v-for="(field, i) in businessFields" :key="i">
            <div class="text-xs font-semibold mb-[5px]" :style="{ color: fg }">{{ field.label }}</div>
            <div
              class="rounded-[10px] py-[14px] px-4 text-[15px]"
              :style="{
                background: inputBg,
                border: `1.5px solid ${inputBorder}`,
                color: fg
              }"
            >
              {{ field.value }}
            </div>
          </div>

          <!-- Bank account section -->
          <div
            class="mt-1 p-4 rounded-xl"
            :style="{
              background: dark ? '#232018' : '#F7F5F2',
              border: `1px solid ${borderColor}`
            }"
          >
            <div class="text-[11px] font-semibold tracking-[0.06em] uppercase mb-[10px]" :style="{ color: fg3 }">
              Payout bank account
            </div>
            <div class="flex flex-col gap-[10px]">
              <div
                class="rounded-[10px] py-[13px] px-4 text-sm"
                :style="{
                  background: inputBg,
                  border: `1.5px solid ${inputBorder}`,
                  color: fg3
                }"
              >
                Account number
              </div>
              <div
                class="rounded-[10px] py-[13px] px-4 text-sm"
                :style="{
                  background: inputBg,
                  border: `1.5px solid ${inputBorder}`,
                  color: fg3
                }"
              >
                Select bank
              </div>
              <div
                class="rounded-lg py-[10px] px-3 text-xs text-moss-500 flex items-center gap-[6px]"
                :style="{
                  background: dark ? 'rgba(43,114,68,0.1)' : '#EEF5F1',
                  border: `1px solid ${dark ? 'rgba(43,114,68,0.3)' : '#A4D2B4'}`
                }"
              >
                <PhCheckCircle :size="15" /> Account verified: Obi Apex Ltd
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        @click="handleComplete"
        class="bg-clay-500 text-white border-none rounded-[10px] font-body text-base font-bold py-4 px-4 cursor-pointer w-full mt-5"
      >
        Confirm and start
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '../components/Logo.vue'
import { PhShieldCheck, PhChartLine, PhWhatsappLogo, PhArrowLeft, PhCheckCircle } from '@phosphor-icons/vue'

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const step = ref(0)

const fg = computed(() => props.dark ? '#F2EFE9' : '#0E0D0B')
const fg2 = computed(() => props.dark ? '#A89F94' : '#5E574F')
const fg3 = computed(() => props.dark ? '#5E574F' : '#A89F94')
const inputBorder = computed(() => props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0')
const inputBg = computed(() => props.dark ? '#1A1815' : '#fff')
const borderColor = computed(() => props.dark ? 'rgba(255,255,255,0.08)' : '#E8E4DE')

const trustSignals = [
  { icon: PhShieldCheck, text: 'Payouts every Friday' },
  { icon: PhChartLine, text: 'Real-time earnings tracker' },
  { icon: PhWhatsappLogo, text: 'Support via WhatsApp' }
]

const businessFields = [
  { label: 'Business name', value: 'Apex Pharmacy' },
  { label: 'Category', value: 'Pharmacy' },
  { label: 'Address', value: '14 Ogunlana Drive, Surulere' },
  { label: 'LGA', value: 'Surulere, Lagos' }
]

const handleComplete = () => {
  localStorage.setItem('mimu-onboarded', 'true')
  router.push('/dashboard')
}
</script>
