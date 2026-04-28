<template>
  <form
    class="rounded-2xl p-6"
    :style="{ background: cardBg, border: cardBorder, boxShadow: cardShadow }"
    @submit.prevent="onSubmit"
  >
    <h1 class="font-display text-2xl font-light tracking-tight mb-2" :style="{ color: fg }">
      Tell us about your business
    </h1>
    <p class="text-sm mb-6" :style="{ color: fg2 }">
      We use this to label your screen on the network, on payouts, and on
      receipts to advertisers.
    </p>

    <Field :dark="dark" label="Business name">
      <input
        v-model="form.businessName"
        class="w-full rounded-xl py-3 px-4 text-base"
        placeholder="e.g. Apex Pharmacy"
        :style="inputStyle"
      />
    </Field>

    <div class="mt-4">
      <Field :dark="dark" label="Category">
        <select
          v-model="form.businessCategory"
          class="w-full rounded-xl py-3 px-4 text-base"
          :style="inputStyle"
        >
          <option value="" disabled>Select a category</option>
          <option v-for="c in categories" :key="c.value" :value="c.value">
            {{ c.label }}
          </option>
        </select>
      </Field>
    </div>

    <div class="mt-4">
      <Field :dark="dark" label="LGA">
        <select
          v-model="form.lga"
          class="w-full rounded-xl py-3 px-4 text-base"
          :style="inputStyle"
        >
          <option value="" disabled>Select your LGA</option>
          <option v-for="l in lagosLgas" :key="l.value" :value="l.value">
            {{ l.label }}
          </option>
        </select>
      </Field>
    </div>

    <button
      type="submit"
      :disabled="busy || !canSubmit"
      class="mt-6 w-full bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 disabled:opacity-60 transition-colors"
    >
      {{ busy ? 'Saving…' : 'Save and continue' }}
    </button>
  </form>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '../../stores/profile'
import { useToastStore } from '../../stores/toast'
import Field from '../../components/forms/EditField.vue'

const props = defineProps({
  dark: { type: Boolean, default: false },
})

const router = useRouter()
const profile = useProfileStore()
const toast = useToastStore()

// Categories that match what advertisers can target. Host's PATCH endpoint
// doesn't enum-constrain the value at the schema level, but using the same
// vocabulary means a host's screen surfaces correctly when an advertiser
// filters the network by venue type.
const categories = [
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'restaurant', label: 'Restaurant / Eatery' },
  { value: 'salon', label: 'Salon / Barber' },
  { value: 'supermarket', label: 'Supermarket / Grocery' },
  { value: 'fashion', label: 'Fashion / Boutique' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'gym', label: 'Gym / Fitness' },
  { value: 'healthcare', label: 'Healthcare / Clinic' },
  { value: 'fmcg', label: 'FMCG / Convenience' },
  { value: 'other', label: 'Other' },
]

// Same LGA list the advertiser business-profile uses (per OpenAPI spec).
const lagosLgas = [
  { value: 'agege', label: 'Agege' },
  { value: 'ajeromi_ifelodun', label: 'Ajeromi-Ifelodun' },
  { value: 'alimosho', label: 'Alimosho' },
  { value: 'amuwo_odofin', label: 'Amuwo-Odofin' },
  { value: 'apapa', label: 'Apapa' },
  { value: 'badagry', label: 'Badagry' },
  { value: 'epe', label: 'Epe' },
  { value: 'eti_osa', label: 'Eti-Osa' },
  { value: 'ibeju_lekki', label: 'Ibeju-Lekki' },
  { value: 'ifako_ijaiye', label: 'Ifako-Ijaiye' },
  { value: 'ikeja', label: 'Ikeja' },
  { value: 'ikorodu', label: 'Ikorodu' },
  { value: 'kosofe', label: 'Kosofe' },
  { value: 'lagos_island', label: 'Lagos Island' },
  { value: 'lagos_mainland', label: 'Lagos Mainland' },
  { value: 'mushin', label: 'Mushin' },
  { value: 'ojo', label: 'Ojo' },
  { value: 'oshodi_isolo', label: 'Oshodi-Isolo' },
  { value: 'shomolu', label: 'Shomolu' },
  { value: 'surulere', label: 'Surulere' },
]

const form = reactive({
  businessName: '',
  businessCategory: '',
  lga: '',
})
const busy = ref(false)

const canSubmit = computed(
  () =>
    form.businessName.trim().length >= 2 &&
    form.businessCategory.length > 0 &&
    form.lga.length > 0,
)

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
  // If ops pre-filled some of these during invite (or the host already
  // updated them on a prior partial visit), surface those values rather
  // than overwriting them with blank submissions.
  try {
    const p = await profile.load()
    if (p) {
      form.businessName = p.businessName ?? ''
      form.businessCategory = p.businessCategory ?? ''
      form.lga = p.lga ?? ''
    }
  } catch {
    // Profile probe failure is handled globally by the http interceptor;
    // we just render an empty form here.
  }
})

async function onSubmit() {
  if (!canSubmit.value) return
  busy.value = true
  try {
    await profile.update({
      businessName: form.businessName.trim(),
      businessCategory: form.businessCategory,
      lga: form.lga,
    })
    router.replace('/onboarding/bank')
  } catch (err) {
    toast.error(err?.message || 'Could not save business details.')
  } finally {
    busy.value = false
  }
}
</script>
