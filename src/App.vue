<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAppState } from './composables/useAppState'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import PWAPrompt from './components/PWAPrompt.vue'
import ToastHost from './components/ToastHost.vue'

const route = useRoute()
const { dark } = useAppState()

const showNavigation = computed(() => {
  const publicRoutes = ['splash', 'login', 'signup', 'forgot-password', 'onboarding']
  return !publicRoutes.includes(route.name)
})
</script>

<template>
  <div class="min-h-screen" :class="dark ? 'bg-neutral-900' : 'bg-neutral-50'">
    <!-- Header -->
    <Header v-if="showNavigation" :dark="dark" />

    <div class="flex">
      <!-- Sidebar Navigation (Desktop) -->
      <Sidebar v-if="showNavigation" :dark="dark" :active="route.name" class="hidden lg:block" />
      

      <!-- Main Content -->
      <main class="flex-1 min-h-screen" :class="showNavigation ? 'lg:ml-64' : ''">
        <RouterView :dark="dark" />
      </main>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav v-if="showNavigation" class="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div
        class="h-16 flex items-center justify-around border-t"
        :class="dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'"
      >
        <router-link
          v-for="tab in tabs"
          :key="tab.id"
          :to="`/${tab.id}`"
          class="flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors"
          :class="route.name === tab.id ? (dark ? 'text-clay-400' : 'text-clay-500') : (dark ? 'text-neutral-600' : 'text-neutral-400')"
        >
          <component :is="tab.icon" :size="20" :weight="route.name === tab.id ? 'fill' : 'regular'" />
          <span class="text-[10px] font-medium">{{ tab.label }}</span>
        </router-link>
      </div>
    </nav>

    <PWAPrompt :dark="dark" />
    <ToastHost />
  </div>
</template>

<script>
import { PhHouse, PhCurrencyNgn, PhMonitor, PhShareNetwork, PhUser } from '@phosphor-icons/vue'

const tabs = [
  { id: 'dashboard', icon: PhHouse, label: 'Dashboard' },
  { id: 'earnings', icon: PhCurrencyNgn, label: 'Earnings' },
  { id: 'screen', icon: PhMonitor, label: 'Screen' },
  { id: 'referrals', icon: PhShareNetwork, label: 'Referrals' },
  { id: 'account', icon: PhUser, label: 'Account' }
]
</script>
