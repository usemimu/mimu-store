<template>
  <div
    class="h-11 flex items-center justify-between px-6 flex-shrink-0"
    :style="{ background: dark ? '#0E0D0B' : '#F7F5F2' }"
  >
    <span class="text-[13px] font-semibold" :style="{ color: dark ? '#F2EFE9' : '#0E0D0B' }">
      9:41
    </span>
    <div class="flex items-center gap-[5px] text-xs" :style="{ color: dark ? '#F2EFE9' : '#0E0D0B' }">
      <PhWifiHigh :size="14" weight="regular" />
      <PhCellSignalFull :size="14" weight="regular" />
      <span class="text-xs font-semibold">84%</span>
    </div>
  </div>
</template>

<script setup>
import { PhWifiHigh, PhCellSignalFull } from '@phosphor-icons/vue'

defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})
</script>
