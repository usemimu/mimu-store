<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <!-- Header -->
      <div class="mb-6 lg:mb-10">
        <h1 class="text-3xl lg:text-5xl font-display font-light tracking-tight" :style="{ color: fg }">
          Ad protection
        </h1>
        <p class="mt-2 text-sm lg:text-lg" :style="{ color: fg2 }">
          Choose what your screen shows. Tag what you sell to auto-block
          competitors. Add manual blocks for advertisers or whole categories.
          Allow specific advertisers when you have a partnership.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div class="lg:col-span-2 space-y-6">

          <!-- Subcategories -->
          <div
            class="rounded-2xl p-6 lg:p-8"
            :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
          >
            <div class="flex items-center mb-4">
              <h2 class="text-lg lg:text-xl font-bold flex-1" :style="{ color: fg }">
                What you sell
              </h2>
              <button
                v-if="!editingTags"
                class="text-sm font-medium px-4 py-2 rounded-xl"
                :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
                @click="startEditTags"
              >
                Edit
              </button>
            </div>
            <p class="text-xs lg:text-sm mb-4" :style="{ color: fg2 }">
              Sub-categories drive the auto rule: any advertiser whose tags
              overlap with yours is excluded from your screen.
            </p>

            <div v-if="!editingTags">
              <div v-if="tagsQuery.isLoading.value" class="text-sm" :style="{ color: fg2 }">
                Loading…
              </div>
              <div v-else-if="currentTags.length === 0" class="text-sm" :style="{ color: fg2 }">
                No tags set. Auto competitor exclusion is inert until you
                add at least one.
              </div>
              <div v-else class="flex flex-wrap gap-2">
                <span
                  v-for="t in currentTags"
                  :key="t.id"
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :style="{ background: chipBg, color: chipFg }"
                >
                  {{ t.displayName }}
                </span>
              </div>
            </div>

            <div v-else>
              <div v-for="(group, parent) in catalogByParent" :key="parent" class="mb-4">
                <div class="text-xs font-semibold uppercase tracking-wider mb-2" :style="{ color: fg3 }">
                  {{ parent }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <label
                    v-for="cat in group"
                    :key="cat.id"
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
                    :style="{
                      background: selectedTagIds.has(cat.id) ? chipActiveBg : chipBg,
                      color: selectedTagIds.has(cat.id) ? chipActiveFg : chipFg,
                    }"
                  >
                    <input
                      type="checkbox"
                      :value="cat.id"
                      :checked="selectedTagIds.has(cat.id)"
                      @change="toggleTag(cat.id)"
                    />
                    <span>{{ cat.displayName }}</span>
                  </label>
                </div>
              </div>
              <div class="flex gap-3 mt-4">
                <button
                  class="text-sm font-medium px-4 py-2 rounded-xl"
                  :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
                  @click="cancelEditTags"
                >
                  Cancel
                </button>
                <button
                  class="text-sm font-medium px-4 py-2 rounded-xl text-white"
                  :style="{ background: '#0E0D0B' }"
                  :disabled="putTagsMutation.isPending.value"
                  @click="saveTags"
                >
                  {{ putTagsMutation.isPending.value ? 'Saving…' : 'Save' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Blocks -->
          <div
            class="rounded-2xl p-6 lg:p-8"
            :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
          >
            <div class="flex items-center mb-4">
              <h2 class="text-lg lg:text-xl font-bold flex-1" :style="{ color: fg }">
                Your blocks
              </h2>
              <button
                class="text-sm font-medium px-4 py-2 rounded-xl"
                :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
                @click="openBlockModal"
              >
                Add
              </button>
            </div>
            <p class="text-xs lg:text-sm mb-4" :style="{ color: fg2 }">
              Block a specific advertiser, a sub-category, or an entire
              parent category — adds to the auto rule.
            </p>

            <div v-if="blocksQuery.isLoading.value" class="text-sm" :style="{ color: fg2 }">
              Loading…
            </div>
            <div v-else-if="blocks.length === 0" class="text-sm" :style="{ color: fg2 }">
              No active blocks.
            </div>
            <ul v-else class="divide-y" :style="{ borderColor: inputBorder }">
              <li
                v-for="b in blocks"
                :key="b.id"
                class="flex items-center py-3 first:pt-0 last:pb-0"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium" :style="{ color: fg }">
                    <template v-if="b.blockedAdvertiserName">
                      {{ b.blockedAdvertiserName }}
                    </template>
                    <template v-else-if="b.blockedSubcategoryDisplay">
                      Sub-category: {{ b.blockedSubcategoryDisplay }}
                    </template>
                    <template v-else-if="b.blockedParentCategory">
                      Category: {{ b.blockedParentCategory }}
                    </template>
                  </div>
                  <div v-if="b.reason" class="text-xs mt-0.5" :style="{ color: fg2 }">
                    {{ b.reason }}
                  </div>
                </div>
                <button
                  class="text-xs font-medium px-3 py-1.5 rounded-lg"
                  :style="{ color: fg2 }"
                  :disabled="removeBlockMutation.isPending.value"
                  @click="onRemoveBlock(b.id)"
                >
                  Remove
                </button>
              </li>
            </ul>
          </div>

          <!-- Allows -->
          <div
            class="rounded-2xl p-6 lg:p-8"
            :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
          >
            <div class="flex items-center mb-4">
              <h2 class="text-lg lg:text-xl font-bold flex-1" :style="{ color: fg }">
                Allowed despite blocks
              </h2>
              <button
                class="text-sm font-medium px-4 py-2 rounded-xl"
                :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
                @click="openAllowModal"
              >
                Add
              </button>
            </div>
            <p class="text-xs lg:text-sm mb-4" :style="{ color: fg2 }">
              Whitelist a specific advertiser. Beats both the auto rule and
              any block — useful for partnerships.
            </p>

            <div v-if="allowsQuery.isLoading.value" class="text-sm" :style="{ color: fg2 }">
              Loading…
            </div>
            <div v-else-if="allows.length === 0" class="text-sm" :style="{ color: fg2 }">
              No allows.
            </div>
            <ul v-else class="divide-y" :style="{ borderColor: inputBorder }">
              <li
                v-for="a in allows"
                :key="a.advertiserId"
                class="flex items-center py-3 first:pt-0 last:pb-0"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium" :style="{ color: fg }">
                    {{ a.advertiserName || a.advertiserId }}
                  </div>
                  <div v-if="a.reason" class="text-xs mt-0.5" :style="{ color: fg2 }">
                    {{ a.reason }}
                  </div>
                </div>
                <button
                  class="text-xs font-medium px-3 py-1.5 rounded-lg"
                  :style="{ color: fg2 }"
                  @click="onRemoveAllow(a.advertiserId)"
                >
                  Revoke
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Sidebar — quick help -->
        <div class="space-y-6">
          <div
            class="rounded-2xl p-6"
            :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
          >
            <h3 class="text-base font-bold mb-2" :style="{ color: fg }">How it works</h3>
            <ol class="text-sm space-y-2 list-decimal list-inside" :style="{ color: fg2 }">
              <li>Tag what you sell. Auto rule excludes overlapping advertisers.</li>
              <li>Add blocks for any extra exclusions you want.</li>
              <li>Allow advertisers you've partnered with.</li>
              <li>The screen audit on <em>My Screen</em> shows the result.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Add-block modal -->
    <div
      v-if="blockModalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="blockModalOpen = false"
    >
      <div class="w-full max-w-md rounded-2xl p-6" :style="{ background: cardBg }">
        <h3 class="text-lg font-bold mb-4" :style="{ color: fg }">Add block</h3>
        <form @submit.prevent="onCreateBlock" class="space-y-4">
          <div>
            <label class="text-xs font-semibold mb-2 block" :style="{ color: fg }">Block target</label>
            <select
              v-model="blockForm.targetType"
              class="w-full rounded-xl py-3 px-4 text-sm"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            >
              <option value="advertiser">Specific advertiser</option>
              <option value="subcategory">Sub-category</option>
              <option value="parent">Parent category</option>
            </select>
          </div>

          <div v-if="blockForm.targetType === 'advertiser'">
            <label class="text-xs font-semibold mb-2 block" :style="{ color: fg }">Advertiser ID</label>
            <input
              v-model="blockForm.advertiserId"
              type="text"
              class="w-full rounded-xl py-3 px-4 text-sm"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
              placeholder="e.g. uuid"
            />
          </div>
          <div v-if="blockForm.targetType === 'subcategory'">
            <label class="text-xs font-semibold mb-2 block" :style="{ color: fg }">Sub-category</label>
            <select
              v-model="blockForm.subcategoryId"
              class="w-full rounded-xl py-3 px-4 text-sm"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            >
              <option v-for="s in activeCatalog" :key="s.id" :value="s.id">
                {{ s.displayName }}
              </option>
            </select>
          </div>
          <div v-if="blockForm.targetType === 'parent'">
            <label class="text-xs font-semibold mb-2 block" :style="{ color: fg }">Parent category</label>
            <select
              v-model="blockForm.parentCategory"
              class="w-full rounded-xl py-3 px-4 text-sm"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            >
              <option v-for="p in PARENT_CATEGORIES" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-semibold mb-2 block" :style="{ color: fg }">Reason (optional)</label>
            <input
              v-model="blockForm.reason"
              type="text"
              maxlength="500"
              class="w-full rounded-xl py-3 px-4 text-sm"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            />
          </div>

          <div v-if="blockError" class="text-xs" style="color: #dc2626;">{{ blockError }}</div>

          <div class="flex gap-3 justify-end pt-2">
            <button
              type="button"
              class="text-sm font-medium px-4 py-2 rounded-xl"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
              @click="blockModalOpen = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="text-sm font-medium px-4 py-2 rounded-xl text-white"
              :style="{ background: '#0E0D0B' }"
              :disabled="createBlockMutation.isPending.value"
            >
              {{ createBlockMutation.isPending.value ? 'Adding…' : 'Add block' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add-allow modal -->
    <div
      v-if="allowModalOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="allowModalOpen = false"
    >
      <div class="w-full max-w-md rounded-2xl p-6" :style="{ background: cardBg }">
        <h3 class="text-lg font-bold mb-4" :style="{ color: fg }">Allow advertiser</h3>
        <form @submit.prevent="onCreateAllow" class="space-y-4">
          <div>
            <label class="text-xs font-semibold mb-2 block" :style="{ color: fg }">Advertiser ID</label>
            <input
              v-model="allowForm.advertiserId"
              type="text"
              required
              class="w-full rounded-xl py-3 px-4 text-sm"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
              placeholder="e.g. uuid"
            />
          </div>
          <div>
            <label class="text-xs font-semibold mb-2 block" :style="{ color: fg }">Reason (optional)</label>
            <input
              v-model="allowForm.reason"
              type="text"
              maxlength="500"
              class="w-full rounded-xl py-3 px-4 text-sm"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
            />
          </div>

          <div v-if="allowError" class="text-xs" style="color: #dc2626;">{{ allowError }}</div>

          <div class="flex gap-3 justify-end pt-2">
            <button
              type="button"
              class="text-sm font-medium px-4 py-2 rounded-xl"
              :style="{ background: inputBg, border: `1.5px solid ${inputBorder}`, color: fg }"
              @click="allowModalOpen = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="text-sm font-medium px-4 py-2 rounded-xl text-white"
              :style="{ background: '#0E0D0B' }"
              :disabled="createAllowMutation.isPending.value"
            >
              {{ createAllowMutation.isPending.value ? 'Adding…' : 'Allow' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { eligibilityApi } from '../api/eligibility'

const PARENT_CATEGORIES = [
  'restaurant', 'fashion', 'fintech', 'tech', 'salon', 'pharmacy',
  'education', 'religious', 'political', 'real_estate', 'automotive',
  'healthcare', 'fmcg', 'entertainment', 'other',
]

const props = defineProps({ dark: Boolean })

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const fg3 = computed(() => (props.dark ? '#5E574F' : '#A89F94'))
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
const chipBg = computed(() => (props.dark ? 'rgba(255,255,255,0.06)' : '#F7F5F2'))
const chipFg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const chipActiveBg = computed(() => '#0E0D0B')
const chipActiveFg = computed(() => '#F2EFE9')

const queryClient = useQueryClient()

// ─── Catalog ───────────────────────────────────────────────────
const catalogQuery = useQuery({
  queryKey: ['business-subcategories'],
  queryFn: () => eligibilityApi.catalog(),
})
const activeCatalog = computed(() =>
  (catalogQuery.data.value ?? []).filter((s) => !s.retiredAt),
)
const catalogByParent = computed(() => {
  const out = {}
  for (const s of activeCatalog.value) {
    const p = s.parentCategory || 'other'
    out[p] = out[p] ?? []
    out[p].push(s)
  }
  return out
})

// ─── Tags ──────────────────────────────────────────────────────
const tagsQuery = useQuery({
  queryKey: ['host', 'subcategories'],
  queryFn: () => eligibilityApi.getMine(),
})
const currentTags = computed(() => tagsQuery.data.value?.subcategories ?? [])

const editingTags = ref(false)
const selectedTagIds = ref(new Set())
function startEditTags() {
  selectedTagIds.value = new Set(currentTags.value.map((t) => t.id))
  editingTags.value = true
}
function cancelEditTags() {
  editingTags.value = false
}
function toggleTag(id) {
  const next = new Set(selectedTagIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  selectedTagIds.value = next
}
const putTagsMutation = useMutation({
  mutationFn: () => eligibilityApi.putMine(Array.from(selectedTagIds.value)),
  onSuccess: () => {
    editingTags.value = false
    queryClient.invalidateQueries({ queryKey: ['host', 'subcategories'] })
  },
})
function saveTags() {
  putTagsMutation.mutate()
}

// ─── Blocks ────────────────────────────────────────────────────
const blocksQuery = useQuery({
  queryKey: ['host', 'blocks'],
  queryFn: () => eligibilityApi.listBlocks(),
})
const blocks = computed(() => blocksQuery.data.value ?? [])

const blockModalOpen = ref(false)
const blockError = ref('')
const blockForm = reactive({
  targetType: 'advertiser',
  advertiserId: '',
  subcategoryId: '',
  parentCategory: 'restaurant',
  reason: '',
})
function openBlockModal() {
  blockForm.targetType = 'advertiser'
  blockForm.advertiserId = ''
  blockForm.subcategoryId = ''
  blockForm.parentCategory = 'restaurant'
  blockForm.reason = ''
  blockError.value = ''
  blockModalOpen.value = true
}

const createBlockMutation = useMutation({
  mutationFn: (body) => eligibilityApi.createBlock(body),
  onSuccess: () => {
    blockModalOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['host', 'blocks'] })
  },
  onError: (err) => {
    blockError.value =
      err?.response?.data?.message || err?.message || 'Failed.'
  },
})

function onCreateBlock() {
  blockError.value = ''
  const body = { reason: blockForm.reason || undefined }
  if (blockForm.targetType === 'advertiser') {
    if (!blockForm.advertiserId.trim()) {
      blockError.value = 'Advertiser id is required.'
      return
    }
    body.blockedAdvertiserId = blockForm.advertiserId.trim()
  } else if (blockForm.targetType === 'subcategory') {
    if (!blockForm.subcategoryId) {
      blockError.value = 'Pick a sub-category.'
      return
    }
    body.blockedSubcategoryId = blockForm.subcategoryId
  } else {
    body.blockedParentCategory = blockForm.parentCategory
  }
  createBlockMutation.mutate(body)
}

const removeBlockMutation = useMutation({
  mutationFn: (id) => eligibilityApi.removeBlock(id),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['host', 'blocks'] }),
})
function onRemoveBlock(id) {
  if (!confirm('Remove this block?')) return
  removeBlockMutation.mutate(id)
}

// ─── Allows ────────────────────────────────────────────────────
const allowsQuery = useQuery({
  queryKey: ['host', 'allows'],
  queryFn: () => eligibilityApi.listAllows(),
})
const allows = computed(() => allowsQuery.data.value ?? [])

const allowModalOpen = ref(false)
const allowError = ref('')
const allowForm = reactive({ advertiserId: '', reason: '' })
function openAllowModal() {
  allowForm.advertiserId = ''
  allowForm.reason = ''
  allowError.value = ''
  allowModalOpen.value = true
}
const createAllowMutation = useMutation({
  mutationFn: (body) => eligibilityApi.createAllow(body),
  onSuccess: () => {
    allowModalOpen.value = false
    queryClient.invalidateQueries({ queryKey: ['host', 'allows'] })
  },
  onError: (err) => {
    allowError.value =
      err?.response?.data?.message || err?.message || 'Failed.'
  },
})
function onCreateAllow() {
  allowError.value = ''
  if (!allowForm.advertiserId.trim()) {
    allowError.value = 'Advertiser id is required.'
    return
  }
  createAllowMutation.mutate({
    advertiserId: allowForm.advertiserId.trim(),
    reason: allowForm.reason || undefined,
  })
}
const removeAllowMutation = useMutation({
  mutationFn: (advId) => eligibilityApi.removeAllow(advId),
  onSuccess: () =>
    queryClient.invalidateQueries({ queryKey: ['host', 'allows'] }),
})
function onRemoveAllow(advId) {
  if (!confirm('Revoke this allow?')) return
  removeAllowMutation.mutate(advId)
}
</script>
