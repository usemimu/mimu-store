import { defineStore } from 'pinia'

let nextId = 1

/**
 * Lightweight global toast store. Vue-query mutations and one-off API calls
 * push messages here; a single `<ToastHost>` near the app root renders them.
 */
export const useToastStore = defineStore('toast', {
  state: () => ({ items: [] }),
  actions: {
    push({ message, kind = 'info', duration = 4000 }) {
      const id = nextId++
      this.items.push({ id, message, kind })
      if (duration > 0) {
        setTimeout(() => this.dismiss(id), duration)
      }
      return id
    },
    success(message, opts) {
      return this.push({ ...opts, message, kind: 'success' })
    },
    error(message, opts) {
      return this.push({ ...opts, message, kind: 'error', duration: 6000 })
    },
    dismiss(id) {
      this.items = this.items.filter((t) => t.id !== id)
    },
  },
})
