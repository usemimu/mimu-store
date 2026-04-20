<template>
  <div
    class="min-h-screen px-4 py-8"
    :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'"
  >
    <div class="max-w-2xl mx-auto">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-6">
          <Logo :dark="dark" :size="60" />
        </div>
        <h1 class="text-2xl lg:text-3xl font-display font-light tracking-tight mb-2" :style="{ color: fg }">
          Create Your Account
        </h1>
        <p class="text-sm lg:text-base" :style="{ color: fg2 }">
          Set up your mìmú host account
        </p>
      </div>

      <!-- Signup Form -->
      <div
        class="rounded-2xl p-6 lg:p-8 mb-6"
        :style="{
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow
        }"
      >
        <div class="space-y-5">
          <!-- Business Details Section -->
          <div>
            <h2 class="text-lg font-bold mb-4" :style="{ color: fg }">
              Business Details
            </h2>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
                  Business Name <span class="text-clay-500">*</span>
                </label>
                <input
                  v-model="form.businessName"
                  type="text"
                  placeholder="Enter business name"
                  class="w-full rounded-xl py-3 px-4 text-base"
                  :style="{
                    background: inputBg,
                    border: `1.5px solid ${inputBorder}`,
                    color: fg
                  }"
                />
              </div>

              <div>
                <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
                  Category <span class="text-clay-500">*</span>
                </label>
                <select
                  v-model="form.category"
                  class="w-full rounded-xl py-3 px-4 text-base"
                  :style="{
                    background: inputBg,
                    border: `1.5px solid ${inputBorder}`,
                    color: fg
                  }"
                >
                  <option value="">Select category</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="salon">Salon</option>
                  <option value="supermarket">Supermarket</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
                  Address <span class="text-clay-500">*</span>
                </label>
                <input
                  v-model="form.address"
                  type="text"
                  placeholder="Enter business address"
                  class="w-full rounded-xl py-3 px-4 text-base"
                  :style="{
                    background: inputBg,
                    border: `1.5px solid ${inputBorder}`,
                    color: fg
                  }"
                />
              </div>

              <div>
                <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
                  LGA <span class="text-clay-500">*</span>
                </label>
                <input
                  v-model="form.lga"
                  type="text"
                  placeholder="e.g. Surulere, Lagos"
                  class="w-full rounded-xl py-3 px-4 text-base"
                  :style="{
                    background: inputBg,
                    border: `1.5px solid ${inputBorder}`,
                    color: fg
                  }"
                />
              </div>

              <div>
                <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
                  Phone Number <span class="text-clay-500">*</span>
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  class="w-full rounded-xl py-3 px-4 text-base"
                  :style="{
                    background: inputBg,
                    border: `1.5px solid ${inputBorder}`,
                    color: fg
                  }"
                />
              </div>

              <div>
                <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
                  Email <span class="text-clay-500">*</span>
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="your@email.com"
                  class="w-full rounded-xl py-3 px-4 text-base"
                  :style="{
                    background: inputBg,
                    border: `1.5px solid ${inputBorder}`,
                    color: fg
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Note about bank account -->
          <div
            class="rounded-xl p-4 flex gap-3 items-start"
            :style="{
              background: dark ? 'rgba(180,136,28,0.1)' : '#FCF7E8',
              border: `1px solid ${dark ? 'rgba(180,136,28,0.25)' : '#EDD88A'}`
            }"
          >
            <PhInfo :size="20" class="text-gold-500 flex-shrink-0 mt-1" />
            <div class="text-sm" :style="{ color: dark ? '#E0BF50' : '#8D6A15' }">
              You can add your bank account details after creating your account in the Account settings.
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-4">
        <button
          @click="handleSignup"
          class="w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 transition-colors"
        >
          Create Account
        </button>

        <div class="text-center">
          <p class="text-sm" :style="{ color: fg2 }">
            Already have an account?
            <router-link to="/login" class="font-semibold text-clay-500 hover:text-clay-600">
              Sign in
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Logo from '../components/Logo.vue'
import { PhInfo } from '@phosphor-icons/vue'

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const form = ref({
  businessName: '',
  category: '',
  address: '',
  lga: '',
  phone: '',
  email: ''
})

const fg = computed(() => props.dark ? '#F2EFE9' : '#0E0D0B')
const fg2 = computed(() => props.dark ? '#A89F94' : '#5E574F')
const fg3 = computed(() => props.dark ? '#5E574F' : '#A89F94')
const cardBg = computed(() => props.dark ? '#1A1815' : '#fff')
const cardBorder = computed(() => props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none')
const cardShadow = computed(() => props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)')
const inputBorder = computed(() => props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0')
const inputBg = computed(() => props.dark ? '#1A1815' : '#fff')

const handleSignup = () => {
  // Validate and create account
  localStorage.setItem('mimu-authenticated', 'true')
  router.push('/dashboard')
}
</script>
