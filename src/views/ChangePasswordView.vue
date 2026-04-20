<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
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
          Change Password
        </h1>
        <p class="mt-2 text-sm lg:text-base" :style="{ color: fg2 }">
          Update your account password
        </p>
      </div>

      <!-- Form -->
      <div
        class="rounded-2xl p-6 lg:p-8 mb-6"
        :style="{
          background: cardBg,
          border: cardBorder,
          boxShadow: cardShadow
        }"
      >
        <div class="space-y-5">
          <div>
            <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
              Current Password
            </label>
            <input
              v-model="currentPassword"
              type="password"
              placeholder="Enter current password"
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
              New Password
            </label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="Enter new password"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="{
                background: inputBg,
                border: `1.5px solid ${inputBorder}`,
                color: fg
              }"
            />
            <p class="text-xs mt-2" :style="{ color: fg3 }">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
              Confirm New Password
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm new password"
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

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          @click="$router.back()"
          class="flex-1 bg-transparent border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer transition-colors"
          :style="{
            border: `1.5px solid ${inputBorder}`,
            color: fg
          }"
        >
          Cancel
        </button>
        <button
          @click="handleChangePassword"
          class="flex-1 bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 transition-colors"
        >
          Update Password
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

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const fg = computed(() => props.dark ? '#F2EFE9' : '#0E0D0B')
const fg2 = computed(() => props.dark ? '#A89F94' : '#5E574F')
const fg3 = computed(() => props.dark ? '#5E574F' : '#A89F94')
const cardBg = computed(() => props.dark ? '#1A1815' : '#fff')
const cardBorder = computed(() => props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none')
const cardShadow = computed(() => props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)')
const inputBorder = computed(() => props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0')
const inputBg = computed(() => props.dark ? '#1A1815' : '#fff')

const handleChangePassword = () => {
  // Validate and change password
  if (newPassword.value === confirmPassword.value) {
    router.push('/account')
  }
}
</script>
