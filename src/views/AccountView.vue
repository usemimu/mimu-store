<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <!-- Page Header -->
      <div class="mb-6 lg:mb-10">
        <h1 class="text-3xl lg:text-5xl font-display font-light tracking-tight" :style="{ color: fg }">
          Account
        </h1>
        <p class="mt-2 text-sm lg:text-lg" :style="{ color: fg2 }">
          Manage your business details and account settings.
        </p>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Business Details -->
          <div
            class="rounded-2xl p-6 lg:p-8"
            :style="{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow
            }"
          >
            <h2 class="text-lg lg:text-xl font-bold mb-6" :style="{ color: fg }">
              Business Details
            </h2>
            <div class="space-y-5">
              <div v-for="(field, i) in businessFields" :key="i">
                <label class="text-xs lg:text-sm font-semibold mb-2 block" :style="{ color: fg }">
                  {{ field.label }}
                </label>
                <input
                  type="text"
                  :value="field.value"
                  readonly
                  class="w-full rounded-xl py-3 px-4 text-sm lg:text-base"
                  :style="{
                    background: inputBg,
                    border: `1.5px solid ${inputBorder}`,
                    color: fg
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Bank account (single, two-step verify-then-confirm flow) -->
          <BankAccountSetup :dark="dark" />

          <!-- Tax Information -->
          <div
            class="rounded-2xl p-6 lg:p-8"
            :style="{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow
            }"
          >
            <h2 class="text-lg lg:text-xl font-bold mb-6" :style="{ color: fg }">
              Tax Information
            </h2>
            <div class="space-y-5">
              <div>
                <label class="text-xs lg:text-sm font-semibold mb-2 block" :style="{ color: fg }">
                  TIN (Tax Identification Number)
                </label>
                <input
                  type="text"
                  value="12345678-0001"
                  readonly
                  class="w-full rounded-xl py-3 px-4 text-sm lg:text-base"
                  :style="{
                    background: inputBg,
                    border: `1.5px solid ${inputBorder}`,
                    color: fg
                  }"
                />
              </div>
              <div
                class="py-4 px-5 rounded-xl flex gap-4 items-start"
                :style="{
                  background: dark ? 'rgba(180,136,28,0.1)' : '#FCF7E8',
                  border: `1px solid ${dark ? 'rgba(180,136,28,0.25)' : '#EDD88A'}`
                }"
              >
                <PhInfo :size="20" class="text-gold-500 flex-shrink-0 mt-1" />
                <div
                  class="text-xs lg:text-sm leading-relaxed"
                  :style="{ color: dark ? '#E0BF50' : '#8D6A15' }"
                >
                  We deduct 5% WHT from all payouts as required by FIRS. Keep your TIN updated for tax compliance.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Contact Support -->
          <div
            class="rounded-2xl p-6"
            :style="{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow
            }"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :style="{ background: dark ? 'rgba(43,114,68,0.15)' : '#EEF5F1' }"
              >
                <PhWhatsappLogo :size="24" class="text-moss-500" />
              </div>
            </div>
            <h3 class="text-base font-bold mb-2" :style="{ color: fg }">
              Need Help?
            </h3>
            <p class="text-sm mb-4" :style="{ color: fg2 }">
              Chat with us on WhatsApp for instant support
            </p>
            <button
              class="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#22c55e] transition-colors border-none cursor-pointer"
            >
              <PhWhatsappLogo :size="18" weight="bold" />
              <span class="text-sm">Contact Support</span>
            </button>
          </div>

          <!-- Account Actions -->
          <div
            class="rounded-2xl p-6"
            :style="{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow
            }"
          >
            <h3 class="text-base font-bold mb-4" :style="{ color: fg }">
              Account Actions
            </h3>
            <div class="space-y-2">
              <router-link
                v-for="(action, i) in actions"
                :key="i"
                :to="action.to"
                @click="action.onClick"
                class="w-full flex items-center gap-3 py-3 px-4 rounded-lg hover:opacity-80 transition-opacity text-left no-underline"
                :style="{
                  background: dark ? 'rgba(255,255,255,0.05)' : '#F7F5F2'
                }"
              >
                <component :is="action.icon" :size="20" :style="{ color: action.color || fg3 }" />
                <span class="text-sm flex-1" :style="{ color: action.color || fg }">
                  {{ action.label }}
                </span>
              </router-link>
            </div>
          </div>

          <!-- App Version -->
          <div class="text-center py-4">
            <div class="text-xs" :style="{ color: fg3 }">
              mìmú for Hosts v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProfileStore } from '../stores/profile'
import { useToastStore } from '../stores/toast'
import BankAccountSetup from '../components/BankAccountSetup.vue'

const auth = useAuthStore()
const profile = useProfileStore()
const toast = useToastStore()

onMounted(() => {
  profile.load().catch((err) => toast.error(err?.message || 'Could not load profile.'))
})
import {
  PhCheckCircle,
  PhInfo,
  PhWhatsappLogo,
  PhPencil,
  PhKey,
  PhBell,
  PhSignOut,
  PhPlus,
  PhBank
} from '@phosphor-icons/vue'

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()


const fg = computed(() => props.dark ? '#F2EFE9' : '#0E0D0B')
const fg2 = computed(() => props.dark ? '#A89F94' : '#5E574F')
const fg3 = computed(() => props.dark ? '#5E574F' : '#A89F94')
const cardBg = computed(() => props.dark ? '#1A1815' : '#fff')
const cardBorder = computed(() => props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none')
const cardShadow = computed(() => props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)')
const inputBorder = computed(() => props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0')
const inputBg = computed(() => props.dark ? '#1A1815' : '#fff')

// Read-only summary card; the full edit lives at /account/edit-business.
const businessFields = computed(() => {
  const p = profile.profile ?? {}
  return [
    { label: 'Business Name', value: p.businessName ?? '—' },
    { label: 'Category', value: p.businessCategory ?? '—' },
    { label: 'LGA', value: p.lga ?? '—' },
    { label: 'Phone Number', value: p.phoneNumber ?? p.phone ?? '—' },
    { label: 'Email', value: p.email ?? '—' },
  ]
})

const handleSignOut = async () => {
  await auth.logout()
  router.push('/login')
}

const actions = [
  { label: 'Edit Business Details', icon: PhPencil, to: '/account/edit-business' },
  { label: 'Change Password', icon: PhKey, to: '/account/change-password' },
  { label: 'Notification Settings', icon: PhBell, to: '/account/notifications' },
  { label: 'Sign Out', icon: PhSignOut, color: '#B55430', to: '#', onClick: handleSignOut }
]
</script>
