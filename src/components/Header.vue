<template>
  <header
    class="sticky top-0 z-40 border-b"
    :class="dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'"
  >
    <div class="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <Logo :dark="dark" />
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3 lg:gap-4">
          <!-- Status Indicator (only when authenticated) -->
          <div v-if="isAuthenticated" class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full" :class="dark ? 'bg-moss-500/10' : 'bg-moss-50'">
            <div class="w-2 h-2 rounded-full bg-moss-500"></div>
            <span class="text-xs font-semibold" :class="dark ? 'text-moss-300' : 'text-moss-600'">
              Screen Online
            </span>
          </div>

          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 rounded-lg transition-colors"
            :class="dark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-neutral-100 text-neutral-600'"
          >
            <PhMoon v-if="!dark" :size="20" />
            <PhSun v-else :size="20" />
          </button>

          <!-- User Menu (only when authenticated) -->
          <router-link
            v-if="isAuthenticated"
            to="/account"
            class="flex items-center gap-2 p-2 rounded-lg transition-colors"
            :class="dark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center"
              :class="dark ? 'bg-clay-500/20 text-clay-400' : 'bg-clay-100 text-clay-600'"
            >
              <PhUser :size="18" weight="bold" />
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import Logo from './Logo.vue'
import { PhMoon, PhSun, PhUser } from '@phosphor-icons/vue'
import { useAppState } from '../composables/useAppState'

defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})

const { toggleDarkMode } = useAppState()

const isAuthenticated = computed(() => {
  return localStorage.getItem('mimu-authenticated') === 'true'
})
</script>
