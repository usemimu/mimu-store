<template>
  <aside
    class="fixed left-0 top-16 bottom-0 w-64 border-r overflow-y-auto"
    :class="dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'"
  >
    <nav class="p-4 space-y-2">
      <router-link
        v-for="item in navigation"
        :key="item.id"
        :to="`/${item.id}`"
        class="flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all"
        :class="active === item.id
          ? (dark ? 'bg-clay-500/10 text-clay-400' : 'bg-clay-50 text-clay-600')
          : (dark ? 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900')
        "
      >
        <component
          :is="item.icon"
          :size="20"
          :weight="active === item.id ? 'fill' : 'regular'"
        />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Help Section -->
    <div class="p-4 mt-8">
      <div
        class="p-4 rounded-lg border"
        :class="dark ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-50 border-neutral-200'"
      >
        <h3 class="font-semibold mb-2" :class="dark ? 'text-neutral-200' : 'text-neutral-900'">
          Need Help?
        </h3>
        <p class="text-sm mb-3" :class="dark ? 'text-neutral-400' : 'text-neutral-600'">
          Chat with us on WhatsApp for instant support
        </p>
        <button
          class="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#22c55e] transition-colors"
        >
          <PhWhatsappLogo :size="18" weight="bold" />
          <span class="text-sm">Contact Support</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { PhHouse, PhCurrencyNgn, PhMonitor, PhShareNetwork, PhUser, PhWhatsappLogo } from '@phosphor-icons/vue'

defineProps({
  dark: {
    type: Boolean,
    default: false
  },
  active: {
    type: String,
    default: 'dashboard'
  }
})

const navigation = [
  { id: 'dashboard', icon: PhHouse, label: 'Dashboard' },
  { id: 'earnings', icon: PhCurrencyNgn, label: 'Earnings' },
  { id: 'screen', icon: PhMonitor, label: 'My Screen' },
  { id: 'referrals', icon: PhShareNetwork, label: 'Referrals' },
  { id: 'account', icon: PhUser, label: 'Account' }
]
</script>
