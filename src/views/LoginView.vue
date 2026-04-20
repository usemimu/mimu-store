<template>
  <div
    class="min-h-screen flex items-center justify-center px-4"
    :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'"
  >
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-6">
          <Logo :dark="dark" :size="60" />
        </div>
        <h1 class="text-2xl lg:text-3xl font-display font-light tracking-tight mb-2" :style="{ color: fg }">
          Welcome to mìmú
        </h1>
        <p class="text-sm lg:text-base" :style="{ color: fg2 }">
          Sign in to your host account
        </p>
      </div>

      <!-- Login Card -->
      <div
        class="rounded-2xl p-6 lg:p-8 mb-4"
        :style="{
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow
        }"
      >
        <!-- Tab Selector -->
        <div class="flex rounded-xl p-1 mb-6" :class="dark ? 'bg-neutral-800' : 'bg-neutral-100'">
          <button
            @click="loginMethod = 'qr'"
            class="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
            :class="loginMethod === 'qr'
              ? (dark ? 'bg-neutral-900 text-neutral-50 shadow-sm' : 'bg-white text-neutral-900 shadow-sm')
              : (dark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-900')
            "
          >
            <PhQrCode :size="18" class="inline mr-2" />
            QR Code
          </button>
          <button
            @click="loginMethod = 'id'"
            class="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
            :class="loginMethod === 'id'
              ? (dark ? 'bg-neutral-900 text-neutral-50 shadow-sm' : 'bg-white text-neutral-900 shadow-sm')
              : (dark ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-600 hover:text-neutral-900')
            "
          >
            <PhIdentificationCard :size="18" class="inline mr-2" />
            Screen ID
          </button>
        </div>

        <!-- QR Code Login -->
        <div v-if="loginMethod === 'qr'" class="text-center">
          <div
            class="w-48 h-48 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            :style="{
              background: dark ? '#1A1815' : '#fff',
              border: `2px solid ${dark ? 'rgba(255,255,255,0.1)' : '#DDD8D0'}`
            }"
          >
            <PhQrCode :size="120" :style="{ color: fg3 }" />
          </div>
          <p class="text-sm mb-6" :style="{ color: fg2 }">
            Scan the QR code on your mìmú screen to sign in
          </p>
          <button
            @click="handleQRLogin"
            class="w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 transition-colors"
          >
            Open Camera
          </button>
        </div>

        <!-- Screen ID Login -->
        <div v-else>
          <div class="mb-6">
            <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
              Screen ID
            </label>
            <input
              v-model="screenId"
              type="text"
              placeholder="Enter your screen ID"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="{
                background: inputBg,
                border: `1.5px solid ${inputBorder}`,
                color: fg
              }"
            />
            <p class="text-xs mt-2" :style="{ color: fg3 }">
              Find your Screen ID on the mìmú screen
            </p>
          </div>
          <button
            @click="handleScreenIdLogin"
            class="w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>

      <!-- Sign Up Link -->
      <div class="text-center">
        <p class="text-sm" :style="{ color: fg2 }">
          Don't have a screen yet?
          <router-link to="/signup" class="font-semibold text-clay-500 hover:text-clay-600">
            Sign up
          </router-link>
        </p>
      </div>

      <!-- Help -->
      <div class="mt-8 text-center">
        <button
          class="flex items-center justify-center gap-2 mx-auto bg-[#25D366] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#22c55e] transition-colors border-none cursor-pointer"
        >
          <PhWhatsappLogo :size="18" weight="bold" />
          <span class="text-sm">Need Help?</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '../components/Logo.vue'
import { PhQrCode, PhIdentificationCard, PhWhatsappLogo } from '@phosphor-icons/vue'

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const loginMethod = ref('qr')
const screenId = ref('')

const fg = computed(() => props.dark ? '#F2EFE9' : '#0E0D0B')
const fg2 = computed(() => props.dark ? '#A89F94' : '#5E574F')
const fg3 = computed(() => props.dark ? '#5E574F' : '#A89F94')
const cardBg = computed(() => props.dark ? '#1A1815' : '#fff')
const cardBorder = computed(() => props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none')
const cardShadow = computed(() => props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)')
const inputBorder = computed(() => props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0')
const inputBg = computed(() => props.dark ? '#1A1815' : '#fff')

const handleQRLogin = () => {
  // Simulate QR login
  localStorage.setItem('mimu-authenticated', 'true')
  router.push('/dashboard')
}

const handleScreenIdLogin = () => {
  if (screenId.value) {
    localStorage.setItem('mimu-authenticated', 'true')
    router.push('/dashboard')
  }
}
</script>
