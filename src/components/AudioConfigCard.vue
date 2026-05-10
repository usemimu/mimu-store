<template>
  <div
    class="rounded-2xl p-6 lg:p-8"
    :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
  >
    <div class="flex items-center mb-2">
      <h2 class="text-lg lg:text-xl font-bold flex-1" :style="{ color: fg }">
        Audio
      </h2>
      <span
        class="text-xs font-medium px-2 py-1 rounded-full"
        :style="{
          background: enabled ? '#EEF5F1' : (dark ? 'rgba(255,255,255,0.06)' : '#F7F5F2'),
          color: enabled ? '#2B7244' : fg2,
        }"
      >
        {{ enabled ? 'Sound on' : 'Muted' }}
      </span>
    </div>
    <p class="text-xs lg:text-sm mb-6" :style="{ color: fg2 }">
      Control whether ads play with sound on this screen, and during which
      hours. The screen picks up changes within a few minutes.
    </p>

    <!-- Enabled toggle -->
    <div class="flex items-center mb-6">
      <div class="flex-1">
        <div class="text-sm font-semibold" :style="{ color: fg }">Enable sound</div>
        <div class="text-xs mt-0.5" :style="{ color: fg2 }">
          When off, the screen plays silently regardless of volume.
        </div>
      </div>
      <button
        type="button"
        role="switch"
        :aria-checked="enabled"
        class="toggle"
        :class="{ on: enabled }"
        :disabled="busy"
        @click="onToggleEnabled"
      >
        <span class="toggle-thumb" :class="{ on: enabled }"></span>
      </button>
    </div>

    <!-- Volume slider -->
    <div class="mb-6" :class="{ 'opacity-50': !enabled }">
      <div class="flex items-center mb-2">
        <span class="text-sm font-semibold flex-1" :style="{ color: fg }">
          Volume
        </span>
        <span class="text-sm tabular-nums" :style="{ color: fg2 }">
          {{ volume }}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        :value="volume"
        :disabled="!enabled || busy"
        class="w-full"
        @input="onSlide"
        @change="onSlideCommit"
      />
    </div>

    <!-- Quiet hours -->
    <div :class="{ 'opacity-50': !enabled }">
      <div class="flex items-center mb-2">
        <div class="flex-1">
          <span class="text-sm font-semibold" :style="{ color: fg }">
            Quiet hours
          </span>
          <div class="text-xs mt-0.5" :style="{ color: fg2 }">
            Mute audio during a daily window (e.g. 10pm–7am for residential
            neighbours).
          </div>
        </div>
        <button
          v-if="!quietHoursActive"
          type="button"
          class="text-sm font-medium px-3 py-1.5 rounded-lg"
          :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
          :disabled="!enabled || busy"
          @click="addQuietHours"
        >
          Add window
        </button>
        <button
          v-else
          type="button"
          class="text-sm font-medium px-3 py-1.5 rounded-lg"
          :style="{ color: fg2 }"
          :disabled="!enabled || busy"
          @click="clearQuietHours"
        >
          Clear
        </button>
      </div>

      <div v-if="quietHoursActive" class="flex gap-3 mt-3">
        <label class="flex-1">
          <span class="text-xs font-semibold" :style="{ color: fg2 }">From</span>
          <input
            type="time"
            :value="formatTime(quietHoursStart)"
            :disabled="!enabled || busy"
            class="w-full mt-1 rounded-xl py-2.5 px-3 text-sm"
            :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            @change="onQuietHoursStart"
          />
        </label>
        <label class="flex-1">
          <span class="text-xs font-semibold" :style="{ color: fg2 }">To</span>
          <input
            type="time"
            :value="formatTime(quietHoursEnd)"
            :disabled="!enabled || busy"
            class="w-full mt-1 rounded-xl py-2.5 px-3 text-sm"
            :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            @change="onQuietHoursEnd"
          />
        </label>
      </div>
    </div>

    <div v-if="error" class="text-xs mt-4" style="color: #dc2626;">
      {{ error }}
    </div>
    <div
      v-else-if="lastSavedAt"
      class="text-xs mt-4"
      :style="{ color: fg2 }"
    >
      ✓ Saved {{ relativeTime(lastSavedAt) }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { screensApi } from '../api/screens'

const props = defineProps({
  screenId: { type: String, required: true },
  // Initial config from the parent (loaded via screensApi.detail or
  // a separate query). Treated as a one-shot seed; subsequent
  // updates flow through the local state + PATCH responses.
  initial: {
    type: Object,
    default: () => ({
      enabled: false,
      volume0to100: 50,
      quietHoursStartMinutes: null,
      quietHoursEndMinutes: null,
    }),
  },
  dark: Boolean,
})

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const cardBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const cardBorder = computed(() =>
  props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none',
)
const cardShadow = computed(() =>
  props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)',
)
const inputBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const inputBorder = computed(() =>
  props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0',
)

// Local state — seeded from `initial`, mutated by user input,
// reconciled to the server's authoritative response after each PATCH.
const enabled = ref(props.initial.enabled)
const volume = ref(props.initial.volume0to100)
const quietHoursStart = ref(props.initial.quietHoursStartMinutes)
const quietHoursEnd = ref(props.initial.quietHoursEndMinutes)
const lastSavedAt = ref(null)
const error = ref('')

watch(
  () => props.initial,
  (next) => {
    enabled.value = next.enabled
    volume.value = next.volume0to100
    quietHoursStart.value = next.quietHoursStartMinutes
    quietHoursEnd.value = next.quietHoursEndMinutes
  },
)

const quietHoursActive = computed(
  () => quietHoursStart.value !== null && quietHoursEnd.value !== null,
)

const mutation = useMutation({
  mutationFn: (patch) => screensApi.patchAudioConfig(props.screenId, patch),
  onSuccess: (data) => {
    enabled.value = data.audio.enabled
    volume.value = data.audio.volume0to100
    quietHoursStart.value = data.audio.quietHoursStartMinutes
    quietHoursEnd.value = data.audio.quietHoursEndMinutes
    lastSavedAt.value = Date.now()
    error.value = ''
  },
  onError: (err) => {
    error.value =
      err?.response?.data?.message ||
      err?.message ||
      'Could not save audio settings.'
  },
})

const busy = computed(() => mutation.isPending.value)

function onToggleEnabled() {
  // Optimistic local flip so the toggle feels immediate; the
  // server response will reconcile.
  enabled.value = !enabled.value
  mutation.mutate({ enabled: enabled.value })
}

// Volume slider — `input` events fire on every drag, `change`
// fires when the user lets go. We update the visual immediately
// on `input` for responsiveness and only PATCH on `change` so we
// don't spam the server with every keypress.
function onSlide(event) {
  volume.value = Number(event.target.value)
}
function onSlideCommit(event) {
  const v = Number(event.target.value)
  volume.value = v
  mutation.mutate({ volume0to100: v })
}

function addQuietHours() {
  // Sensible default: 10pm-7am, the most common "no late-night
  // audio" pattern for venues with neighbours.
  quietHoursStart.value = 22 * 60
  quietHoursEnd.value = 7 * 60
  mutation.mutate({
    quietHoursStartMinutes: 22 * 60,
    quietHoursEndMinutes: 7 * 60,
  })
}

function clearQuietHours() {
  quietHoursStart.value = null
  quietHoursEnd.value = null
  mutation.mutate({
    quietHoursStartMinutes: null,
    quietHoursEndMinutes: null,
  })
}

function onQuietHoursStart(event) {
  const minutes = parseTime(event.target.value)
  if (minutes === null) return
  quietHoursStart.value = minutes
  mutation.mutate({ quietHoursStartMinutes: minutes })
}

function onQuietHoursEnd(event) {
  const minutes = parseTime(event.target.value)
  if (minutes === null) return
  quietHoursEnd.value = minutes
  mutation.mutate({ quietHoursEndMinutes: minutes })
}

function formatTime(minutes) {
  if (minutes === null || minutes === undefined) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function parseTime(value) {
  if (!value || typeof value !== 'string') return null
  const [hh, mm] = value.split(':').map((s) => parseInt(s, 10))
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null
  return hh * 60 + mm
}

function relativeTime(ts) {
  const seconds = Math.round((Date.now() - ts) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.toggle {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: #DDD8D0;
  position: relative;
  cursor: pointer;
  transition: background 150ms ease;
  flex-shrink: 0;
  border: none;
  padding: 0;
}
.toggle.on {
  background: #2B7244;
}
.toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  transition: transform 150ms ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.toggle-thumb.on {
  transform: translateX(20px);
}
input[type='range'] {
  accent-color: #2B7244;
  cursor: pointer;
}
input[type='range']:disabled {
  cursor: not-allowed;
}
</style>
