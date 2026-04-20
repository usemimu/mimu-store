import { ref, computed, watch } from 'vue'
import { useLocalStorage, usePreferredDark } from '@vueuse/core'

const dark = useLocalStorage('mimu-dark-mode', usePreferredDark().value)
const onboarded = useLocalStorage('mimu-onboarded', false)

export function useAppState() {
  const toggleDarkMode = () => {
    dark.value = !dark.value
  }

  const setOnboarded = (value) => {
    onboarded.value = value
  }

  // Watch for changes and update document class
  watch(dark, (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  return {
    dark: computed(() => dark.value),
    onboarded: computed(() => onboarded.value),
    toggleDarkMode,
    setOnboarded
  }
}
