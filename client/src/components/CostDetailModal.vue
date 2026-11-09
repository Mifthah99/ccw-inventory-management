<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && costData" class="modal-backdrop" @click="close">
        <div class="modal-panel max-w-xl" @click.stop>
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900">{{ costData.month }} Cost Breakdown</h3>
            <button class="modal-close" @click="close">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="p-6">
            <div class="card mb-6 bg-accent-tint p-5 text-center">
              <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Total Costs</div>
              <div class="mt-1 text-3xl font-semibold text-slate-900">{{ currencySymbol }}{{ totalCosts.toLocaleString() }}</div>
            </div>

            <div class="flex flex-col gap-3">
              <div class="card p-4">
                <div class="flex items-center gap-4">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-sky-50 text-sky-600">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                      <path d="M8 6V4M16 6V4M4 10H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-slate-700">Procurement</div>
                    <div class="text-xl font-semibold text-slate-900">{{ currencySymbol }}{{ costData.procurement.toLocaleString() }}</div>
                  </div>
                  <div class="text-sm text-slate-500">{{ getProcurementPercentage() }}% of total</div>
                </div>
              </div>
              <div class="card p-4">
                <div class="flex items-center gap-4">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-indigo-50 text-indigo-600">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-slate-700">Operational</div>
                    <div class="text-xl font-semibold text-slate-900">{{ currencySymbol }}{{ costData.operational.toLocaleString() }}</div>
                  </div>
                  <div class="text-sm text-slate-500">{{ getOperationalPercentage() }}% of total</div>
                </div>
              </div>
              <div class="card p-4">
                <div class="flex items-center gap-4">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-emerald-50 text-emerald-600">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                      <path d="M6 20C6 16.6863 8.68629 14 12 14C15.3137 14 18 16.6863 18 20" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-slate-700">Labor</div>
                    <div class="text-xl font-semibold text-slate-900">{{ currencySymbol }}{{ costData.labor.toLocaleString() }}</div>
                  </div>
                  <div class="text-sm text-slate-500">{{ getLaborPercentage() }}% of total</div>
                </div>
              </div>
              <div class="card p-4">
                <div class="flex items-center gap-4">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-amber-50 text-amber-600">
                    <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 18 9 16C9 14 10 14 12 14C14 14 15 14 15 16C15 18 15 21 15 21M9 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-slate-700">Overhead</div>
                    <div class="text-xl font-semibold text-slate-900">{{ currencySymbol }}{{ costData.overhead.toLocaleString() }}</div>
                  </div>
                  <div class="text-sm text-slate-500">{{ getOverheadPercentage() }}% of total</div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button class="btn-secondary" @click="close">Close</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from '../composables/useI18n'

const { currentCurrency } = useI18n()

const currencySymbol = computed(() => {
  return currentCurrency.value === 'JPY' ? '¥' : '$'
})

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  costData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const totalCosts = computed(() => {
  if (!props.costData) return 0
  return props.costData.procurement + props.costData.operational +
         props.costData.labor + props.costData.overhead
})

const getProcurementPercentage = () => {
  if (!props.costData || totalCosts.value === 0) return 0
  return ((props.costData.procurement / totalCosts.value) * 100).toFixed(1)
}

const getOperationalPercentage = () => {
  if (!props.costData || totalCosts.value === 0) return 0
  return ((props.costData.operational / totalCosts.value) * 100).toFixed(1)
}

const getLaborPercentage = () => {
  if (!props.costData || totalCosts.value === 0) return 0
  return ((props.costData.labor / totalCosts.value) * 100).toFixed(1)
}

const getOverheadPercentage = () => {
  if (!props.costData || totalCosts.value === 0) return 0
  return ((props.costData.overhead / totalCosts.value) * 100).toFixed(1)
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.2s ease;
}
.modal-enter-from .modal-panel,
.modal-leave-to .modal-panel {
  transform: scale(0.95);
}
</style>
