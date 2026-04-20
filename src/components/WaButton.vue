<template>
  <button class="bg-[#25D366] text-white border-none rounded-[10px] font-body text-sm font-bold py-[14px] px-5 cursor-pointer flex items-center justify-center gap-2 w-full">
    <PhWhatsappLogo :size="20" weight="regular" />
    {{ label }}
  </button>
</template>

<script setup>
import { PhWhatsappLogo } from '@phosphor-icons/vue'

defineProps({
  label: {
    type: String,
    default: 'Chat with us on WhatsApp'
  }
})
</script>
