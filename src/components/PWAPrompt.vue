<script setup>
import { usePWA } from '../composables/usePWA'
import { PhArrowClockwise, PhCheckCircle, PhX } from '@phosphor-icons/vue'

defineProps({ dark: { type: Boolean, default: false } })

const {
  needRefresh,
  offlineReady,
  applyUpdate,
  dismissOfflineReady,
  dismissNeedRefresh
} = usePWA()
</script>

<template>
  <div
    v-if="needRefresh || offlineReady"
    class="fixed z-[100] bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:max-w-sm"
    role="status"
    aria-live="polite"
  >
    <div
      class="rounded-xl shadow-lg border px-4 py-3 flex items-start gap-3"
      :class="dark ? 'bg-neutral-800 border-neutral-700 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'"
    >
      <div class="mt-0.5" :class="needRefresh ? 'text-clay-500' : 'text-moss-500'">
        <PhArrowClockwise v-if="needRefresh" :size="20" weight="bold" />
        <PhCheckCircle v-else :size="20" weight="fill" />
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold">
          {{ needRefresh ? 'Update available' : 'Ready to work offline' }}
        </p>
        <p class="text-xs mt-0.5" :class="dark ? 'text-neutral-400' : 'text-neutral-500'">
          {{ needRefresh
            ? 'A new version of Mimuads Hosts is ready.'
            : 'Mimuads Hosts is now installed on this device.' }}
        </p>

        <div v-if="needRefresh" class="mt-2 flex gap-2">
          <button
            class="text-xs font-semibold px-3 py-1.5 rounded-md bg-clay-500 text-white hover:bg-clay-600 transition-colors"
            @click="applyUpdate"
          >
            Reload
          </button>
          <button
            class="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            :class="dark ? 'text-neutral-300 hover:bg-neutral-700' : 'text-neutral-600 hover:bg-neutral-100'"
            @click="dismissNeedRefresh"
          >
            Later
          </button>
        </div>
      </div>

      <button
        v-if="!needRefresh"
        class="shrink-0 p-1 rounded-md transition-colors"
        :class="dark ? 'text-neutral-400 hover:bg-neutral-700' : 'text-neutral-500 hover:bg-neutral-100'"
        :aria-label="'Dismiss'"
        @click="dismissOfflineReady"
      >
        <PhX :size="16" weight="bold" />
      </button>
    </div>
  </div>
</template>
