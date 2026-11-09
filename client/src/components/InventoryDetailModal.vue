<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && inventoryItem" class="modal-backdrop" @click="close">
        <div class="modal-panel max-w-2xl" @click.stop>
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900">Inventory Item Details</h3>
            <button class="modal-close" @click="close">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="p-6">
            <div class="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-card" :class="iconClass[getStockStatusClass()]">
                <svg class="h-8 w-8" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="12" width="32" height="28" rx="2" stroke="currentColor" stroke-width="2.5"/>
                  <path d="M16 8V16M32 8V16M8 20H40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                  <path d="M16 28H32M16 34H24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-lg font-semibold text-slate-900">{{ translateProductName(inventoryItem.name) }}</h4>
                <span class="font-mono text-xs bg-slate-100 rounded px-1.5 py-0.5">SKU: {{ inventoryItem.sku }}</span>
              </div>
              <span :class="badgeClass[getStockStatusClass()]">{{ getStockStatus() }}</span>
            </div>

            <div class="mb-6 grid grid-cols-2 gap-4">
              <div class="rounded-card border border-indigo-100 bg-accent-tint p-4">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Quantity on Hand</div>
                <div class="mt-1 text-2xl font-semibold text-slate-900">{{ inventoryItem.quantity_on_hand }} units</div>
              </div>
              <div class="rounded-card border p-4" :class="cardClass[getStockStatusClass()]">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Stock Level</div>
                <div class="mt-1 text-2xl font-semibold text-slate-900">{{ stockPercentage }}%</div>
                <div class="mt-1 text-xs text-slate-500">vs. reorder point</div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Category</div>
                <div class="text-sm font-medium text-slate-900">{{ inventoryItem.category }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Location</div>
                <div class="text-sm font-medium text-slate-900">{{ inventoryItem.location }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Reorder Point</div>
                <div class="text-sm font-medium text-slate-900">{{ inventoryItem.reorder_point }} units</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Units Remaining</div>
                <div class="text-sm font-medium text-slate-900"><span :class="inventoryItem.quantity_on_hand <= inventoryItem.reorder_point ? 'text-red-600' : 'text-emerald-600'">
                    {{ inventoryItem.quantity_on_hand - inventoryItem.reorder_point }} units
                  </span></div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Unit Cost</div>
                <div class="text-sm font-medium text-slate-900">{{ currencySymbol }}{{ inventoryItem.unit_cost.toFixed(2) }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Total Value</div>
                <div class="text-sm font-medium text-slate-900"><span class="text-base font-semibold text-accent">{{ currencySymbol }}{{ totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }}</span></div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Warehouse</div>
                <div class="text-sm font-medium text-slate-900">{{ translateWarehouse(inventoryItem.location) }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Status</div>
                <div class="text-sm font-medium text-slate-900"><span :class="badgeClass[getStockStatusClass()]">{{ getStockStatus() }}</span></div>
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

const { currentCurrency, translateProductName, translateWarehouse } = useI18n()

const currencySymbol = computed(() => {
  return currentCurrency.value === 'JPY' ? '¥' : '$'
})

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  inventoryItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const badgeClass = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info'
}

const iconClass = {
  danger: 'bg-red-50 text-red-600',
  warning: 'bg-amber-50 text-amber-600',
  success: 'bg-emerald-50 text-emerald-600'
}

const cardClass = {
  danger: 'border-red-100 bg-red-50',
  warning: 'border-amber-100 bg-amber-50',
  success: 'border-emerald-100 bg-emerald-50'
}

const totalValue = computed(() => {
  if (!props.inventoryItem) return 0
  return props.inventoryItem.quantity_on_hand * props.inventoryItem.unit_cost
})

const stockPercentage = computed(() => {
  if (!props.inventoryItem || props.inventoryItem.reorder_point === 0) return 0
  return Math.round((props.inventoryItem.quantity_on_hand / props.inventoryItem.reorder_point) * 100)
})

const close = () => {
  emit('close')
}

const getStockStatus = () => {
  if (!props.inventoryItem) return 'Unknown'
  if (props.inventoryItem.quantity_on_hand <= props.inventoryItem.reorder_point) {
    return 'Low Stock'
  } else if (props.inventoryItem.quantity_on_hand <= props.inventoryItem.reorder_point * 1.5) {
    return 'Adequate'
  } else {
    return 'In Stock'
  }
}

const getStockStatusClass = () => {
  const status = getStockStatus()
  if (status === 'Low Stock') return 'danger'
  if (status === 'Adequate') return 'warning'
  return 'success'
}

const getStockIconClass = () => {
  const status = getStockStatus()
  if (status === 'Low Stock') return 'danger-icon'
  if (status === 'Adequate') return 'warning-icon'
  return 'success-icon'
}

const getSummaryCardClass = () => {
  const status = getStockStatus()
  if (status === 'Low Stock') return 'danger-card'
  if (status === 'Adequate') return 'warning-card'
  return 'success-card'
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
