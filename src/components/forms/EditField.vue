<template>
  <div>
    <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
      {{ label }}
    </label>
    <slot />
    <p v-if="hint" class="text-xs mt-2" :style="{ color: fg3 }">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
  dark: { type: Boolean, default: false },
})

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg3 = computed(() => (props.dark ? '#5E574F' : '#A89F94'))
</script>
