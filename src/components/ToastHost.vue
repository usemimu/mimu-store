<template>
  <div class="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="t in toast.items"
        :key="t.id"
        class="pointer-events-auto rounded-xl shadow-lg px-4 py-3 text-sm font-medium flex items-start gap-3 max-w-sm"
        :class="kindClass(t.kind)"
      >
        <component :is="iconFor(t.kind)" :size="18" weight="fill" class="flex-shrink-0 mt-0.5" />
        <span class="flex-1">{{ t.message }}</span>
        <button
          class="bg-transparent border-none cursor-pointer opacity-60 hover:opacity-100"
          :style="{ color: 'inherit' }"
          @click="toast.dismiss(t.id)"
        >
          <PhX :size="14" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '../stores/toast'
import { PhCheckCircle, PhWarningCircle, PhInfo, PhX } from '@phosphor-icons/vue'

const toast = useToastStore()

function kindClass(kind) {
  switch (kind) {
    case 'success':
      return 'bg-emerald-600 text-white'
    case 'error':
      return 'bg-rose-600 text-white'
    default:
      return 'bg-neutral-900 text-white'
  }
}

function iconFor(kind) {
  switch (kind) {
    case 'success':
      return PhCheckCircle
    case 'error':
      return PhWarningCircle
    default:
      return PhInfo
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
