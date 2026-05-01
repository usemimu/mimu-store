<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <div class="mb-6 lg:mb-10">
        <h1 class="text-3xl lg:text-5xl font-display font-light tracking-tight" :style="{ color: fg }">
          My Screen
        </h1>
        <p class="mt-2 text-sm lg:text-lg" :style="{ color: fg2 }">
          Monitor your screen status and manage your free ad slot.
        </p>
      </div>

      <div v-if="screensQuery.isLoading.value" class="rounded-2xl p-6" :style="{ background: cardBg, border: cardBorder, color: fg2 }">
        Loading…
      </div>
      <div v-else-if="screensQuery.error.value" class="rounded-2xl p-6 text-sm" :style="{ background: cardBg, border: cardBorder, color: '#dc2626' }">
        {{ screensQuery.error.value?.message || 'Could not load your screens.' }}
      </div>

      <!-- Empty state — host has no screen assigned yet (ops hasn't
           assigned one, hardware not yet installed, or the install was
           done after sign-up). Skip the rest of the page and show a
           single explanation card with a way to reach ops directly. -->
      <div
        v-else-if="!hasScreen"
        class="rounded-2xl p-8 lg:p-10 mb-8 text-center"
        :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
      >
        <div
          class="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center"
          :style="{ background: dark ? 'rgba(181,84,48,0.15)' : '#FBF4F0' }"
        >
          <PhMonitor :size="32" class="text-clay-500" weight="bold" />
        </div>
        <h2 class="text-xl lg:text-2xl font-display font-light mb-3" :style="{ color: fg }">
          Your screen is being prepared
        </h2>
        <p class="text-sm lg:text-base mb-6 max-w-md mx-auto" :style="{ color: fg2 }">
          Our team is installing your screen at the venue. Once it's online,
          this page will show its status, plays, and earnings — usually within
          a few hours of installation.
        </p>

        <div
          class="rounded-xl p-4 mb-6 max-w-md mx-auto text-left"
          :style="{
            background: dark ? 'rgba(255,255,255,0.04)' : '#F7F5F2',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#E8E0D4'}`,
          }"
        >
          <div class="text-[11px] uppercase tracking-wider font-semibold mb-2" :style="{ color: fg3 }">
            On file
          </div>
          <div class="text-sm space-y-1" :style="{ color: fg }">
            <div><strong>{{ profile.profile?.businessName || '—' }}</strong></div>
            <div :style="{ color: fg2 }">
              {{ profile.profile?.businessAddress || profile.profile?.lga || '—' }}
            </div>
          </div>
          <p class="text-xs mt-3" :style="{ color: fg3 }">
            If anything's wrong, update it from
            <router-link to="/account/edit-business" class="text-clay-500 font-semibold no-underline">
              Account → Edit business details
            </router-link>.
          </p>
        </div>

        <button
          class="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#22c55e] transition-colors border-none cursor-pointer"
          @click="onWhatsapp"
        >
          <PhWhatsappLogo :size="20" weight="bold" />
          <span>Talk to our install team</span>
        </button>
      </div>

      <div v-else>
        <!-- Per-screen cards. One card per screen with status pill +
             plays/earnings/last-seen KPIs. Layout grows naturally:
             one screen renders full width, two+ flow into a 2-col
             grid on desktop. -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div
            v-for="s in screensList"
            :key="s.id"
            class="rounded-2xl p-6 lg:p-8"
            :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
          >
            <div class="flex justify-between items-start mb-6 gap-3">
              <div class="min-w-0">
                <div class="text-base lg:text-lg font-bold mb-1 truncate" :style="{ color: fg }">
                  {{ s.name }}
                </div>
                <div class="text-sm truncate" :style="{ color: fg3 }">{{ s.address }}</div>
              </div>
              <div
                class="flex items-center gap-2 rounded-full py-2 px-3 shrink-0"
                :style="{ background: statusBg(s.status) }"
              >
                <div class="w-2 h-2 rounded-full" :class="statusDot(s.status)"></div>
                <span class="text-xs font-bold" :class="statusText(s.status)">
                  {{ s.statusLabel }}
                </span>
              </div>
            </div>

            <!-- Earnings + plays grid. Today / This week. The card's
                 always-visible default; deeper history lives on
                 /earnings. -->
            <div class="grid grid-cols-2 gap-4 mb-5">
              <div
                class="rounded-xl p-4"
                :style="{
                  background: dark ? 'rgba(181,84,48,0.08)' : '#FBF4F0',
                  border: `1px solid ${dark ? 'rgba(181,84,48,0.2)' : '#E8C5AC'}`,
                }"
              >
                <div class="text-[10px] uppercase tracking-wider font-bold mb-1 text-clay-500">
                  Today
                </div>
                <div class="font-display text-2xl font-light" :style="{ color: fg }">
                  {{ formatNaira(s.earnedTodayNaira) }}
                </div>
                <div class="text-xs" :style="{ color: fg3 }">
                  {{ s.playsToday.toLocaleString() }} plays
                </div>
              </div>
              <div
                class="rounded-xl p-4"
                :style="{
                  background: dark ? 'rgba(255,255,255,0.04)' : '#F7F5F2',
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#E8E0D4'}`,
                }"
              >
                <div class="text-[10px] uppercase tracking-wider font-bold mb-1" :style="{ color: fg3 }">
                  This week
                </div>
                <div class="font-display text-2xl font-light" :style="{ color: fg }">
                  {{ formatNaira(s.earnedThisWeekNaira) }}
                </div>
                <div class="text-xs" :style="{ color: fg3 }">
                  {{ s.playsThisWeek.toLocaleString() }} plays
                </div>
              </div>
            </div>

            <!-- Status meta — last seen / device / brightness -->
            <div class="grid grid-cols-3 gap-4 pt-4 border-t" :style="{ borderColor: divLine }">
              <div>
                <div class="text-[10px] uppercase tracking-wider font-semibold mb-1" :style="{ color: fg3 }">
                  Last seen
                </div>
                <div class="text-sm font-semibold" :style="{ color: fg }">
                  {{ s.lastSeenAt ? relTime(s.lastSeenAt) : '—' }}
                </div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wider font-semibold mb-1" :style="{ color: fg3 }">
                  Screen
                </div>
                <div class="text-sm font-semibold" :style="{ color: fg }">{{ s.deviceModel }}</div>
              </div>
              <div>
                <div class="text-[10px] uppercase tracking-wider font-semibold mb-1" :style="{ color: fg3 }">
                  This month
                </div>
                <div class="text-sm font-semibold" :style="{ color: fg }">
                  {{ formatNaira(s.earnedThisMonthNaira) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Free slot promo. Promotions are host-level (uploaded once,
             rotated across all of this host's screens) so this card
             stays out of the per-screen loop. -->
        <div
          class="rounded-2xl p-6 lg:p-8 mb-8"
          :style="{
            background: dark ? 'rgba(181,84,48,0.1)' : '#FBF4F0',
            border: `1px solid ${dark ? 'rgba(181,84,48,0.25)' : '#E8C5AC'}`
          }"
        >
          <div class="text-xs lg:text-sm font-bold tracking-wider uppercase text-clay-500 mb-3">
            Your free slot — 20% of screen time
          </div>
          <div class="text-sm lg:text-base leading-relaxed mb-6" :style="{ color: fg2 }">
            You get roughly 2 hours of free ad time every day. Promote your own business.
          </div>

          <!-- Upload form -->
          <div v-if="screen.id" class="space-y-3">
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,video/mp4"
              class="hidden"
              @change="onFilePicked"
            />
            <input
              v-model="form.name"
              placeholder="Promotion name"
              class="w-full rounded-xl py-2.5 px-3 text-sm"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            />
            <input
              v-model="form.description"
              placeholder="Description (optional)"
              class="w-full rounded-xl py-2.5 px-3 text-sm"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            />
            <button
              type="button"
              :disabled="uploading"
              class="bg-clay-500 text-white border-none rounded-lg font-body text-sm font-bold py-3 px-5 cursor-pointer flex items-center gap-2 hover:bg-clay-600 disabled:opacity-60 transition-colors"
              @click="$refs.fileInput?.click()"
            >
              <PhUploadSimple :size="18" />
              {{ uploadLabel }}
            </button>

            <div
              v-if="uploading && uploadProgress > 0"
              class="mt-3 h-1.5 rounded-full overflow-hidden"
              :style="{ background: dark ? 'rgba(255,255,255,0.08)' : '#E8DFD2' }"
            >
              <div
                class="h-full bg-clay-500 transition-[width] duration-200"
                :style="{ width: Math.round(uploadProgress * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Promotions list -->
      <div v-if="promotionsQuery.data.value" class="mb-8">
        <h2 class="text-sm lg:text-base font-semibold tracking-wider uppercase mb-4" :style="{ color: fg3 }">
          Your promotions
        </h2>
        <div class="rounded-2xl overflow-hidden" :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }">
          <div v-if="!promotions.length" class="p-6 text-sm text-center" :style="{ color: fg2 }">
            No promotions yet.
          </div>
          <div
            v-for="(p, i) in promotions"
            :key="p.id"
            class="flex items-center gap-4 p-5"
            :style="{ borderBottom: i < promotions.length - 1 ? `1px solid ${divLine}` : 'none' }"
          >
            <div class="flex-1">
              <div class="text-sm lg:text-base font-semibold" :style="{ color: fg }">{{ p.name }}</div>
              <div class="text-xs mt-1" :style="{ color: fg3 }">
                Status: {{ p.status }}<span v-if="p.createdAt"> · {{ formatDate(p.createdAt) }}</span>
              </div>
            </div>
            <button
              v-if="p.status === 'approved' || p.status === 'inactive'"
              class="bg-moss-500 text-white border-none rounded-lg font-body text-xs font-bold py-2 px-3 cursor-pointer hover:opacity-90"
              :disabled="busyId(p.id)"
              @click="onActivate(p)"
            >
              Activate
            </button>
            <button
              v-else-if="p.status === 'active'"
              class="bg-transparent rounded-lg font-body text-xs font-bold py-2 px-3 cursor-pointer hover:opacity-80"
              :style="{ border: `1.5px solid ${inputBorder}`, color: fg }"
              :disabled="busyId(p.id)"
              @click="onDeactivate(p)"
            >
              Pause
            </button>
          </div>
        </div>
      </div>

      <!-- Report a screen issue -->
      <div>
        <h2 class="text-sm lg:text-base font-semibold tracking-wider uppercase mb-4" :style="{ color: fg3 }">
          Screen problems?
        </h2>
        <div class="rounded-2xl overflow-hidden" :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }">
          <button
            v-for="(issue, i) in issues"
            :key="issue.category"
            class="w-full flex items-center gap-4 p-5 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none text-left"
            :style="{ borderBottom: i < issues.length - 1 ? `1px solid ${divLine}` : 'none' }"
            @click="reportIssue(issue)"
          >
            <component :is="issue.icon" :size="24" class="flex-shrink-0" :style="{ color: fg3 }" />
            <span class="text-sm lg:text-base flex-1" :style="{ color: fg }">{{ issue.label }}</span>
            <PhCaretRight :size="18" :style="{ color: fg3 }" />
          </button>
        </div>
        <div class="mt-6">
          <WaButton label="Report via WhatsApp instead" @click="onWhatsapp" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import WaButton from '../components/WaButton.vue'
import {
  PhUploadSimple,
  PhMonitor,
  PhWarning,
  PhSpeakerSlash,
  PhCamera,
  PhDotsThree,
  PhCaretRight,
  PhWhatsappLogo,
} from '@phosphor-icons/vue'
import { screensApi } from '../api/screens'
import { promotionsApi } from '../api/promotions'
import { supportApi } from '../api/support'
import { useToastStore } from '../stores/toast'
import { useProfileStore } from '../stores/profile'
import { useOptimisticPatchMutation } from '../composables/useOptimisticRowMutation'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const toast = useToastStore()
const qc = useQueryClient()

const fg = computed(() => props.dark ? '#F2EFE9' : '#0E0D0B')
const fg2 = computed(() => props.dark ? '#A89F94' : '#5E574F')
const fg3 = computed(() => props.dark ? '#5E574F' : '#A89F94')
const cardBg = computed(() => props.dark ? '#1A1815' : '#fff')
const cardBorder = computed(() => props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none')
const cardShadow = computed(() => props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)')
const inputBorder = computed(() => props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0')
const inputBg = computed(() => props.dark ? '#1A1815' : '#fff')
const divLine = computed(() => props.dark ? 'rgba(255,255,255,0.06)' : '#F2EFE9')

const screensQuery = useQuery({
  queryKey: ['host', 'screens'],
  queryFn: () => screensApi.list(),
})

// `hasScreen` decides whether the page renders the rich status / free
// slot / promotions layout, or the empty-state explainer card. We
// only consider screens with an `id` real — the back-end shape can
// be `[]`, `{ screens: [] }`, or any of the legacy fallbacks. The
// `defaultScreen` placeholder used by the rich layout when present.
const profile = useProfileStore()

function rawList() {
  const raw = screensQuery.data.value
  if (!raw) return []
  return Array.isArray(raw) ? raw : raw.data || raw.items || raw.screens || []
}

const hasScreen = computed(() => {
  const list = rawList()
  return list.length > 0 && Boolean(list[0]?.id)
})

// Normalised array used by the per-screen card loop. Every host who
// has any screens at all renders one card per screen with its own
// status pill + plays + earnings KPIs. Today this is usually 1
// screen; the layout grows naturally to a 2-col grid for 2+.
const screensList = computed(() =>
  rawList()
    .filter((s) => s?.id)
    .map((s) => {
      const status = (s.status || 'unknown').toLowerCase()
      return {
        id: s.id,
        name: s.name || s.venueName || 'Your screen',
        address: s.address || s.venueAddress || s.lga || '—',
        status,
        statusLabel:
          status === 'online' || status === 'active' ? 'Online' :
          status === 'offline' ? 'Offline' :
          status,
        deviceModel: s.deviceModel || '—',
        lastSeenAt: s.lastSeenAt,
        playsToday: Number(s.playsToday ?? 0),
        playsThisWeek: Number(s.playsThisWeek ?? 0),
        playsThisMonth: Number(s.playsThisMonth ?? 0),
        earnedTodayNaira: Number(s.earnedTodayNaira ?? 0),
        earnedThisWeekNaira: Number(s.earnedThisWeekNaira ?? 0),
        earnedThisMonthNaira: Number(s.earnedThisMonthNaira ?? 0),
        earnedAllTimeNaira: Number(s.earnedAllTimeNaira ?? 0),
      }
    }),
)

function formatNaira(value) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '₦0'
  return `₦${Math.round(n).toLocaleString('en-NG')}`
}

const screen = computed(() => {
  const raw = screensQuery.data.value
  if (!raw) return defaultScreen
  const list = Array.isArray(raw) ? raw : raw.data || raw.items || raw.screens || []
  const s = list[0] ?? {}
  const status = (s.status || 'unknown').toLowerCase()
  return {
    id: s.id,
    name: s.name || s.venueName || 'Your screen',
    address: s.address || s.venueAddress || s.lga || '—',
    status,
    statusLabel: status === 'online' || status === 'active' ? 'Online' : (status === 'offline' ? 'Offline' : status),
    deviceModel: s.deviceModel || '—',
    brightness: s.brightness || 'Auto',
    lastSeenAt: s.lastSeenAt,
  }
})
const defaultScreen = {
  id: null,
  name: 'No screen assigned yet',
  address: 'Check back after onboarding completes.',
  status: 'unknown',
  statusLabel: '—',
  deviceModel: '—',
  brightness: '—',
  lastSeenAt: null,
}

const screenInfo = computed(() => [
  { label: 'Last seen', value: screen.value.lastSeenAt ? relTime(screen.value.lastSeenAt) : '—' },
  { label: 'Screen', value: screen.value.deviceModel },
  { label: 'Brightness', value: screen.value.brightness },
])

function statusBg(s) {
  if (s === 'online' || s === 'active') return props.dark ? 'rgba(43,114,68,0.15)' : '#EEF5F1'
  if (s === 'offline') return props.dark ? 'rgba(220,38,38,0.15)' : '#FCEAEA'
  return props.dark ? 'rgba(180,136,28,0.15)' : '#FCF7E8'
}
function statusDot(s) {
  if (s === 'online' || s === 'active') return 'bg-moss-500'
  if (s === 'offline') return 'bg-rose-500'
  return 'bg-gold-500'
}
function statusText(s) {
  if (s === 'online' || s === 'active') return props.dark ? 'text-moss-300' : 'text-moss-500'
  if (s === 'offline') return 'text-rose-500'
  return 'text-gold-500'
}

function relTime(iso) {
  try {
    const d = new Date(iso)
    const diff = (Date.now() - d.getTime()) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.round(diff / 60)} min ago`
    if (diff < 86400) return `${Math.round(diff / 3600)} hr ago`
    return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

// --- Promotions ---

const promotionsQuery = useQuery({
  queryKey: ['host', 'promotions'],
  queryFn: () => promotionsApi.list(),
  // Disabled until we know the host has a screen — querying without one
  // would just 404. vue-query reads `enabled` reactively.
  enabled: computed(() => !!screen.value.id),
})

const promotions = computed(() => {
  const raw = promotionsQuery.data.value
  if (!raw) return []
  return Array.isArray(raw) ? raw : raw.data || raw.items || raw.promotions || []
})

const form = ref({ name: '', description: '' })
const uploading = ref(false)
const uploadProgress = ref(0)
const fileInput = ref(null)

const uploadLabel = computed(() => {
  if (!uploading.value) return 'Pick file & upload'
  if (uploadProgress.value <= 0) return 'Preparing…'
  if (uploadProgress.value >= 1) return 'Finalising…'
  return `Uploading ${Math.round(uploadProgress.value * 100)}%`
})

const activateMutation = useOptimisticPatchMutation({
  queryKey: ['host', 'promotions'],
  mutationFn: ({ id }) => promotionsApi.activate(id),
  buildPatch: () => ({ status: 'active' }),
  successLabel: 'Promotion activated.',
  errorLabel: 'Activation failed.',
})

const deactivateMutation = useOptimisticPatchMutation({
  queryKey: ['host', 'promotions'],
  mutationFn: ({ id }) => promotionsApi.deactivate(id),
  buildPatch: () => ({ status: 'inactive' }),
  successLabel: 'Promotion paused.',
  errorLabel: 'Pause failed.',
})

function busyId(id) {
  return (
    (activateMutation.isPending.value && activateMutation.variables.value?.id === id) ||
    (deactivateMutation.isPending.value && deactivateMutation.variables.value?.id === id)
  )
}

async function onFilePicked(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (!form.value.name.trim()) {
    toast.error('Give the promotion a name first.')
    e.target.value = ''
    return
  }
  if (!screen.value.id) {
    toast.error('No screen yet — finish onboarding first.')
    return
  }
  uploading.value = true
  uploadProgress.value = 0
  try {
    const intent = await promotionsApi.uploadIntent({
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      screenId: screen.value.id,
    })
    await promotionsApi.putBytes({
      url: intent.uploadUrl,
      file,
      headers: intent.headers || {},
      onProgress: (frac) => {
        uploadProgress.value = frac
      },
    })
    await promotionsApi.create({
      promotionId: intent.promotionId,
      name: form.value.name.trim(),
      description: form.value.description.trim() || undefined,
      screenId: screen.value.id,
    })
    toast.success('Uploaded — will go live once approved.')
    form.value.name = ''
    form.value.description = ''
    e.target.value = ''
    await qc.invalidateQueries({ queryKey: ['host', 'promotions'] })
  } catch (err) {
    toast.error(err?.message || 'Upload failed.')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

function onActivate(p) {
  activateMutation.mutate({ id: p.id })
}

function onDeactivate(p) {
  deactivateMutation.mutate({ id: p.id })
}

// --- Issues ---

const issues = [
  { category: 'screen_damage', label: 'Screen is off or frozen', icon: PhMonitor },
  { category: 'screen_damage', label: 'Picture is blurry or distorted', icon: PhWarning },
  { category: 'ads_not_playing', label: 'Sound issues', icon: PhSpeakerSlash },
  { category: 'screen_damage', label: 'Screen was damaged', icon: PhCamera },
  { category: 'other', label: 'Other issue', icon: PhDotsThree },
]

async function reportIssue(issue) {
  const description = prompt(`Describe the issue (10+ chars):\n${issue.label}`)
  if (!description || description.length < 10) {
    toast.error('Please describe the issue in at least 10 characters.')
    return
  }
  try {
    await supportApi.createIssue({
      category: issue.category,
      subject: issue.label,
      description,
    })
    toast.success('Issue reported. We\'ll be in touch.')
  } catch (err) {
    toast.error(err?.message || 'Could not submit issue.')
  }
}

async function onWhatsapp() {
  try {
    const res = await supportApi.whatsappLink()
    const url = res?.url || res?.link || res?.whatsappUrl
    if (url) window.open(url, '_blank')
    else toast.error('No WhatsApp link available right now.')
  } catch (err) {
    toast.error(err?.message || 'Could not get WhatsApp link.')
  }
}
</script>
