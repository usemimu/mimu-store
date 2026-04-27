import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useToastStore } from '../stores/toast'

function patchById(snapshot, id, patch) {
  if (!snapshot) return snapshot
  if (Array.isArray(snapshot)) {
    return snapshot.map((x) => (x.id === id ? { ...x, ...patch } : x))
  }
  for (const key of ['data', 'items', 'promotions', 'payouts', 'transactions', 'campaigns']) {
    if (Array.isArray(snapshot[key])) {
      return {
        ...snapshot,
        [key]: snapshot[key].map((x) => (x.id === id ? { ...x, ...patch } : x)),
      }
    }
  }
  return snapshot
}

/**
 * Optimistic mutation for actions that *toggle* a row's state in place
 * (activate/deactivate, pause/resume) without removing it. Caller supplies
 * an optimistic patch keyed off the variables.
 *
 *   useOptimisticPatchMutation({
 *     queryKey: ['host', 'promotions'],
 *     mutationFn: ({ id }) => promotionsApi.activate(id),
 *     buildPatch: () => ({ status: 'active' }),
 *     successLabel: 'Promotion activated.',
 *   })
 */
export function useOptimisticPatchMutation({
  queryKey,
  mutationFn,
  buildPatch,
  successLabel,
  errorLabel = 'Action failed.',
}) {
  const qc = useQueryClient()
  const toast = useToastStore()

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await qc.cancelQueries({ queryKey })
      const previous = qc.getQueryData(queryKey)
      qc.setQueryData(queryKey, (old) =>
        patchById(old, variables.id, buildPatch(variables)),
      )
      return { previous }
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous !== undefined) qc.setQueryData(queryKey, ctx.previous)
      toast.error(err?.message || errorLabel)
    },
    onSuccess: (_data, variables) => {
      const label =
        typeof successLabel === 'function' ? successLabel(variables) : successLabel
      if (label) toast.success(label)
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  })
}
