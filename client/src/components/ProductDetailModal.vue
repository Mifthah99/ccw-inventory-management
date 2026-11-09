<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && product" class="modal-backdrop" @click="close">
        <div class="modal-panel max-w-2xl" @click.stop>
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900">Product Details</h3>
            <button class="modal-close" @click="close">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="p-6">
            <div class="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-accent-tint text-accent">
                <svg class="h-8 w-8" viewBox="0 0 48 48" fill="none">
                  <rect x="8" y="12" width="32" height="28" rx="2" stroke="currentColor" stroke-width="2.5"/>
                  <path d="M16 8V16M32 8V16M8 20H40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-lg font-semibold text-slate-900">{{ product.name }}</h4>
                <span class="font-mono text-xs bg-slate-100 rounded px-1.5 py-0.5">SKU: {{ product.sku }}</span>
              </div>
              <span :class="badgeClass[getStockBadgeClass(product.stockLevel)]">{{ product.stockLevel }}</span>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Category</div>
                <div class="text-sm font-medium text-slate-900">{{ product.category }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Warehouse</div>
                <div class="text-sm font-medium text-slate-900">{{ product.warehouse }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Units Ordered</div>
                <div class="text-sm font-medium text-slate-900">{{ product.unitsOrdered }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Total Revenue</div>
                <div class="text-sm font-medium text-slate-900">{{ currencySymbol }}{{ product.revenue.toLocaleString() }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Current Stock</div>
                <div class="text-sm font-medium text-slate-900">{{ product.quantityOnHand }} units</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Reorder Point</div>
                <div class="text-sm font-medium text-slate-900">{{ product.reorderPoint }} units</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">First Order Date</div>
                <div class="text-sm font-medium text-slate-900">{{ formatDate(product.firstOrderDate) }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Stock Status</div>
                <div class="text-sm font-medium text-slate-900"><span :class="badgeClass[getStockBadgeClass(product.stockLevel)]">{{ product.stockLevel }}</span></div>
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
  product: {
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

const close = () => {
  emit('close')
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStockBadgeClass = (stockLevel) => {
  if (stockLevel === 'In Stock') return 'success'
  if (stockLevel === 'Low Stock') return 'warning'
  if (stockLevel === 'Out of Stock') return 'danger'
  return 'info'
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
