<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <button
        class="flex items-center gap-2 mb-6 text-sm font-semibold bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
        :style="{ color: fg2 }"
        @click="$router.back()"
      >
        <PhArrowLeft :size="18" /> Back
      </button>

      <div class="mb-6 lg:mb-10">
        <h1 class="text-3xl lg:text-4xl font-display font-light tracking-tight" :style="{ color: fg }">
          Edit business details
        </h1>
        <p class="mt-2 text-sm lg:text-base" :style="{ color: fg2 }">
          Update your business information.
        </p>
      </div>

      <div
        v-if="profile.loading && !form.businessName"
        class="rounded-2xl p-6 text-center"
        :style="{ background: cardBg, border: cardBorder, color: fg2 }"
      >
        Loading…
      </div>

      <form
        v-else
        class="rounded-2xl p-6 lg:p-8 mb-6"
        :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
        @submit.prevent="onSubmit"
      >
        <div class="space-y-5">
          <Field :dark="dark" label="Business name">
            <input
              v-model="form.businessName"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="inputStyle"
            />
          </Field>

          <Field :dark="dark" label="Category">
            <input
              v-model="form.businessCategory"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="inputStyle"
            />
          </Field>

          <Field :dark="dark" label="LGA">
            <input
              v-model="form.lga"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="inputStyle"
            />
          </Field>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            type="button"
            class="flex-1 bg-transparent rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer transition-colors"
            :style="{ border: `1.5px solid ${inputBorder}`, color: fg }"
            @click="$router.back()"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="busy"
            class="flex-1 bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60 transition-colors"
          >
            {{ busy ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PhArrowLeft } from '@phosphor-icons/vue'
import { useProfileStore } from '../stores/profile'
import { useToastStore } from '../stores/toast'
import Field from '../components/forms/EditField.vue'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const router = useRouter()
const profile = useProfileStore()
const toast = useToastStore()

const form = reactive({
  businessName: '',
  businessCategory: '',
  lga: '',
})
const busy = ref(false)

const fg = computed(() => (props.dark ? '#F2EFE9' : '#0E0D0B'))
const fg2 = computed(() => (props.dark ? '#A89F94' : '#5E574F'))
const cardBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const cardBorder = computed(() => (props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none'))
const cardShadow = computed(() => (props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)'))
const inputBorder = computed(() => (props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0'))
const inputBg = computed(() => (props.dark ? '#1A1815' : '#fff'))
const inputStyle = computed(() => ({
  background: inputBg.value,
  border: `1.5px solid ${inputBorder.value}`,
  color: fg.value,
}))

onMounted(async () => {
  try {
    const p = await profile.load()
    if (p) {
      form.businessName = p.businessName ?? ''
      form.businessCategory = p.businessCategory ?? ''
      form.lga = p.lga ?? ''
    }
  } catch (err) {
    toast.error(err?.message || 'Could not load business profile.')
  }
})

async function onSubmit() {
  // Send only changed fields. Backend treats absent keys as "leave alone".
  const original = profile.profile ?? {}
  const patch = {}
  for (const k of ['businessName', 'businessCategory', 'lga']) {
    if (form[k] !== original[k]) patch[k] = form[k]
  }
  if (Object.keys(patch).length === 0) {
    toast.success('Nothing to update.')
    return
  }
  busy.value = true
  try {
    await profile.update(patch)
    toast.success('Business details updated.')
    router.push('/account')
  } catch (err) {
    toast.error(err?.message || 'Could not save changes.')
  } finally {
    busy.value = false
  }
}
</script>
