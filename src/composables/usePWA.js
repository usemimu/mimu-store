import { ref } from 'vue'
import { registerSW } from 'virtual:pwa-register'

const needRefresh = ref(false)
const offlineReady = ref(false)

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    needRefresh.value = true
  },
  onOfflineReady() {
    offlineReady.value = true
  }
})

export function usePWA() {
  const applyUpdate = () => updateSW(true)
  const dismissOfflineReady = () => { offlineReady.value = false }
  const dismissNeedRefresh = () => { needRefresh.value = false }

  return {
    needRefresh,
    offlineReady,
    applyUpdate,
    dismissOfflineReady,
    dismissNeedRefresh
  }
}
