<template>
  <div class="min-h-screen pb-20 lg:pb-0">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <!-- Page Header -->
      <div class="mb-6 lg:mb-10">
        <h1 class="text-3xl lg:text-5xl font-display font-light tracking-tight" :style="{ color: fg }">
          Account
        </h1>
        <p class="mt-2 text-sm lg:text-lg" :style="{ color: fg2 }">
          Manage your business details and account settings.
        </p>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Business Details -->
          <div
            class="rounded-2xl p-6 lg:p-8"
            :style="{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow
            }"
          >
            <h2 class="text-lg lg:text-xl font-bold mb-6" :style="{ color: fg }">
              Business Details
            </h2>
            <div class="space-y-5">
              <div v-for="(field, i) in businessFields" :key="i">
                <label class="text-xs lg:text-sm font-semibold mb-2 block" :style="{ color: fg }">
                  {{ field.label }}
                </label>
                <input
                  type="text"
                  :value="field.value"
                  readonly
                  class="w-full rounded-xl py-3 px-4 text-sm lg:text-base"
                  :style="{
                    background: inputBg,
                    border: `1.5px solid ${inputBorder}`,
                    color: fg
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Bank Accounts -->
          <div
            class="rounded-2xl p-6 lg:p-8"
            :style="{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow
            }"
          >
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg lg:text-xl font-bold" :style="{ color: fg }">
                Payout Bank Accounts
              </h2>
              <button
                v-if="bankAccounts.length < 3"
                @click="showAddBankModal = true"
                class="flex items-center gap-2 text-sm font-semibold text-clay-500 hover:text-clay-600 transition-colors bg-transparent border-none cursor-pointer"
              >
                <PhPlus :size="18" /> Add Account
              </button>
            </div>

            <div v-if="bankAccounts.length === 0" class="text-center py-8">
              <PhBank :size="48" class="mx-auto mb-4" :style="{ color: fg3 }" />
              <p class="text-sm mb-4" :style="{ color: fg2 }">
                No bank accounts added yet
              </p>
              <button
                @click="showAddBankModal = true"
                class="bg-clay-500 text-white border-none rounded-lg font-body text-sm font-bold py-2 px-4 cursor-pointer hover:bg-clay-600 transition-colors"
              >
                Add Your First Account
              </button>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(account, i) in bankAccounts"
                :key="i"
                class="rounded-xl p-4 flex items-start gap-4"
                :style="{
                  background: dark ? 'rgba(255,255,255,0.03)' : '#F7F5F2',
                  border: account.isPrimary ? `2px solid ${dark ? 'rgba(181,84,48,0.5)' : '#B55430'}` : 'none'
                }"
              >
                <div
                  class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  :style="{ background: dark ? 'rgba(43,114,68,0.15)' : '#EEF5F1' }"
                >
                  <PhBank :size="24" class="text-moss-500" />
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm lg:text-base font-semibold" :style="{ color: fg }">
                      {{ account.bankName }}
                    </span>
                    <span
                      v-if="account.isPrimary"
                      class="text-xs font-bold px-2 py-0.5 rounded-full bg-clay-500 text-white"
                    >
                      PRIMARY
                    </span>
                  </div>
                  <div class="text-sm" :style="{ color: fg2 }">
                    {{ account.accountNumber }} • {{ account.accountName }}
                  </div>
                  <div class="flex items-center gap-3 mt-2">
                    <button
                      v-if="!account.isPrimary"
                      @click="setPrimaryAccount(i)"
                      class="text-xs font-semibold text-clay-500 hover:text-clay-600 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      Set as Primary
                    </button>
                    <button
                      @click="removeAccount(i)"
                      class="text-xs font-semibold hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer"
                      :style="{ color: '#B55430' }"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="bankAccounts.length < 3"
              class="mt-4 text-xs text-center"
              :style="{ color: fg3 }"
            >
              You can add up to {{ 3 - bankAccounts.length }} more account{{ 3 - bankAccounts.length !== 1 ? 's' : '' }}
            </div>
          </div>

          <!-- Tax Information -->
          <div
            class="rounded-2xl p-6 lg:p-8"
            :style="{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow
            }"
          >
            <h2 class="text-lg lg:text-xl font-bold mb-6" :style="{ color: fg }">
              Tax Information
            </h2>
            <div class="space-y-5">
              <div>
                <label class="text-xs lg:text-sm font-semibold mb-2 block" :style="{ color: fg }">
                  TIN (Tax Identification Number)
                </label>
                <input
                  type="text"
                  value="12345678-0001"
                  readonly
                  class="w-full rounded-xl py-3 px-4 text-sm lg:text-base"
                  :style="{
                    background: inputBg,
                    border: `1.5px solid ${inputBorder}`,
                    color: fg
                  }"
                />
              </div>
              <div
                class="py-4 px-5 rounded-xl flex gap-4 items-start"
                :style="{
                  background: dark ? 'rgba(180,136,28,0.1)' : '#FCF7E8',
                  border: `1px solid ${dark ? 'rgba(180,136,28,0.25)' : '#EDD88A'}`
                }"
              >
                <PhInfo :size="20" class="text-gold-500 flex-shrink-0 mt-1" />
                <div
                  class="text-xs lg:text-sm leading-relaxed"
                  :style="{ color: dark ? '#E0BF50' : '#8D6A15' }"
                >
                  We deduct 5% WHT from all payouts as required by FIRS. Keep your TIN updated for tax compliance.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Contact Support -->
          <div
            class="rounded-2xl p-6"
            :style="{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow
            }"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :style="{ background: dark ? 'rgba(43,114,68,0.15)' : '#EEF5F1' }"
              >
                <PhWhatsappLogo :size="24" class="text-moss-500" />
              </div>
            </div>
            <h3 class="text-base font-bold mb-2" :style="{ color: fg }">
              Need Help?
            </h3>
            <p class="text-sm mb-4" :style="{ color: fg2 }">
              Chat with us on WhatsApp for instant support
            </p>
            <button
              class="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#22c55e] transition-colors border-none cursor-pointer"
            >
              <PhWhatsappLogo :size="18" weight="bold" />
              <span class="text-sm">Contact Support</span>
            </button>
          </div>

          <!-- Account Actions -->
          <div
            class="rounded-2xl p-6"
            :style="{
              background: cardBg,
              border: cardBorder,
              boxShadow: cardShadow
            }"
          >
            <h3 class="text-base font-bold mb-4" :style="{ color: fg }">
              Account Actions
            </h3>
            <div class="space-y-2">
              <router-link
                v-for="(action, i) in actions"
                :key="i"
                :to="action.to"
                @click="action.onClick"
                class="w-full flex items-center gap-3 py-3 px-4 rounded-lg hover:opacity-80 transition-opacity text-left no-underline"
                :style="{
                  background: dark ? 'rgba(255,255,255,0.05)' : '#F7F5F2'
                }"
              >
                <component :is="action.icon" :size="20" :style="{ color: action.color || fg3 }" />
                <span class="text-sm flex-1" :style="{ color: action.color || fg }">
                  {{ action.label }}
                </span>
              </router-link>
            </div>
          </div>

          <!-- App Version -->
          <div class="text-center py-4">
            <div class="text-xs" :style="{ color: fg3 }">
              mìmú for Hosts v1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Bank Account Modal -->
    <div
      v-if="showAddBankModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(0, 0, 0, 0.5)"
      @click.self="showAddBankModal = false"
    >
      <div
        class="w-full max-w-md rounded-2xl p-6"
        :style="{
          background: cardBg,
          border: cardBorder,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }"
      >
        <h3 class="text-xl font-bold mb-4" :style="{ color: fg }">
          Add Bank Account
        </h3>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
              Account Number
            </label>
            <input
              v-model="newAccount.accountNumber"
              type="text"
              placeholder="0000000000"
              maxlength="10"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="{
                background: inputBg,
                border: `1.5px solid ${inputBorder}`,
                color: fg
              }"
            />
          </div>
          <div>
            <label class="text-sm font-semibold mb-2 block" :style="{ color: fg }">
              Bank Name
            </label>
            <select
              v-model="newAccount.bankName"
              class="w-full rounded-xl py-3 px-4 text-base"
              :style="{
                background: inputBg,
                border: `1.5px solid ${inputBorder}`,
                color: fg
              }"
            >
              <option value="">Select bank</option>
              <option value="Guaranty Trust Bank">Guaranty Trust Bank</option>
              <option value="Access Bank">Access Bank</option>
              <option value="First Bank">First Bank</option>
              <option value="UBA">UBA</option>
              <option value="Zenith Bank">Zenith Bank</option>
            </select>
          </div>
          <div
            v-if="newAccount.accountNumber.length === 10 && newAccount.bankName"
            class="rounded-lg py-3 px-4 text-sm text-moss-500 flex items-center gap-2"
            :style="{
              background: dark ? 'rgba(43,114,68,0.1)' : '#EEF5F1',
              border: `1px solid ${dark ? 'rgba(43,114,68,0.3)' : '#A4D2B4'}`
            }"
          >
            <PhCheckCircle :size="18" /> Account verified: Obi Apex Ltd
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="showAddBankModal = false"
            class="flex-1 bg-transparent border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer transition-colors"
            :style="{
              border: `1.5px solid ${inputBorder}`,
              color: fg
            }"
          >
            Cancel
          </button>
          <button
            @click="addBankAccount"
            :disabled="!newAccount.accountNumber || !newAccount.bankName"
            class="flex-1 bg-clay-500 text-white border-none rounded-xl font-body text-base font-bold py-3 px-4 cursor-pointer hover:bg-clay-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhCheckCircle,
  PhInfo,
  PhWhatsappLogo,
  PhPencil,
  PhKey,
  PhBell,
  PhSignOut,
  PhPlus,
  PhBank
} from '@phosphor-icons/vue'

const props = defineProps({
  dark: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const showAddBankModal = ref(false)
const newAccount = ref({
  accountNumber: '',
  bankName: ''
})

const bankAccounts = ref([
  {
    accountNumber: '1234563421',
    bankName: 'Guaranty Trust Bank',
    accountName: 'Obi Apex Ltd',
    isPrimary: true
  }
])

const fg = computed(() => props.dark ? '#F2EFE9' : '#0E0D0B')
const fg2 = computed(() => props.dark ? '#A89F94' : '#5E574F')
const fg3 = computed(() => props.dark ? '#5E574F' : '#A89F94')
const cardBg = computed(() => props.dark ? '#1A1815' : '#fff')
const cardBorder = computed(() => props.dark ? '1px solid rgba(255,255,255,0.08)' : 'none')
const cardShadow = computed(() => props.dark ? 'none' : '0 1px 3px rgba(14,13,11,0.08)')
const inputBorder = computed(() => props.dark ? 'rgba(255,255,255,0.12)' : '#DDD8D0')
const inputBg = computed(() => props.dark ? '#1A1815' : '#fff')

const businessFields = [
  { label: 'Business Name', value: 'Apex Pharmacy' },
  { label: 'Category', value: 'Pharmacy' },
  { label: 'Address', value: '14 Ogunlana Drive, Surulere' },
  { label: 'LGA', value: 'Surulere, Lagos' },
  { label: 'Phone Number', value: '+234 803 456 7890' },
  { label: 'Email', value: 'apex.pharmacy@email.com' }
]

const addBankAccount = () => {
  if (bankAccounts.value.length < 3) {
    bankAccounts.value.push({
      accountNumber: newAccount.value.accountNumber,
      bankName: newAccount.value.bankName,
      accountName: 'Obi Apex Ltd', // This would come from verification
      isPrimary: bankAccounts.value.length === 0
    })
    newAccount.value = { accountNumber: '', bankName: '' }
    showAddBankModal.value = false
  }
}

const setPrimaryAccount = (index) => {
  bankAccounts.value.forEach((acc, i) => {
    acc.isPrimary = i === index
  })
}

const removeAccount = (index) => {
  if (bankAccounts.value[index].isPrimary && bankAccounts.value.length > 1) {
    // Set the first remaining account as primary
    bankAccounts.value.splice(index, 1)
    bankAccounts.value[0].isPrimary = true
  } else {
    bankAccounts.value.splice(index, 1)
  }
}

const handleSignOut = () => {
  localStorage.removeItem('mimu-authenticated')
  router.push('/login')
}

const actions = [
  { label: 'Edit Business Details', icon: PhPencil, to: '/account/edit-business' },
  { label: 'Change Password', icon: PhKey, to: '/account/change-password' },
  { label: 'Notification Settings', icon: PhBell, to: '/account/notifications' },
  { label: 'Sign Out', icon: PhSignOut, color: '#B55430', to: '#', onClick: handleSignOut }
]
</script>
