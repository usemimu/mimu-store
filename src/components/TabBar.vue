<template>
  <div
    class="h-[68px] flex items-start pt-2 flex-shrink-0"
    :class="dark ? 'bg-neutral-900 border-t border-white/[0.06]' : 'bg-white border-t border-[#E8E4DE]'"
  >
    <div
      v-for="tab in tabs"
      :key="tab.id"
      class="flex-1 flex flex-col items-center gap-[2px] p-1 cursor-pointer"
      :class="active === tab.id ? (dark ? 'text-clay-400' : 'text-clay-500') : (dark ? 'text-neutral-700' : 'text-neutral-400')"
      @click="$emit('change', tab.id)"
    >
      <component :is="tab.icon" :size="24" :weight="tab.weight" />
      <span class="text-[10px] font-medium">{{ tab.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { PhHouse, PhCurrencyNgn, PhMonitor, PhShareNetwork, PhUser } from '@phosphor-icons/vue'
import { computed } from 'vue'

const props = defineProps({
  active: {
    type: String,
    default: 'dashboard'
  },
  dark: {
    type: Boolean,
    default: false
  }
})

defineEmits(['change'])

const tabs = computed(() => [
  {
    id: 'dashboard',
    icon: PhHouse,
    weight: props.active === 'dashboard' ? 'fill' : 'regular',
    label: 'Dashboard'
  },
  {
    id: 'earnings',
    icon: PhCurrencyNgn,
    weight: props.active === 'earnings' ? 'bold' : 'regular',
    label: 'Earnings'
  },
  {
    id: 'screen',
    icon: PhMonitor,
    weight: props.active === 'screen' ? 'fill' : 'regular',
    label: 'My Screen'
  },
  {
    id: 'referrals',
    icon: PhShareNetwork,
    weight: props.active === 'referrals' ? 'fill' : 'regular',
    label: 'Referrals'
  },
  {
    id: 'account',
    icon: PhUser,
    weight: props.active === 'account' ? 'fill' : 'regular',
    label: 'Account'
  }
])
</script>
