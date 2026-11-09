<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen && backlogItem" class="modal-backdrop" @click="close">
        <div class="modal-panel max-w-2xl" @click.stop>
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900">Inventory Shortage Details</h3>
            <button class="modal-close" @click="close">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="p-6">
            <div class="mb-6 flex items-center gap-4 border-b border-slate-100 pb-6">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-red-50 text-red-600">
                <svg class="h-8 w-8" viewBox="0 0 48 48" fill="none">
                  <path d="M24 8L24 28M24 34L24 36" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                  <circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="3"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-lg font-semibold text-slate-900">{{ translateProductName(backlogItem.item_name) }}</h4>
                <span class="font-mono text-xs bg-slate-100 rounded px-1.5 py-0.5">SKU: {{ backlogItem.item_sku }}</span>
              </div>
              <span :class="priorityBadge[backlogItem.priority] || 'badge-neutral'" class="capitalize">
                {{ backlogItem.priority }} Priority
              </span>
            </div>

            <div class="mb-6 grid grid-cols-2 gap-4">
              <div class="rounded-card border border-red-100 bg-red-50 p-4">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Shortage Amount</div>
                <div class="mt-1 text-2xl font-semibold text-red-600">{{ shortage }} units</div>
              </div>
              <div class="rounded-card border border-amber-100 bg-amber-50 p-4">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Days Delayed</div>
                <div class="mt-1 text-2xl font-semibold text-amber-600">{{ backlogItem.days_delayed }} days</div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Order ID</div>
                <div class="text-sm font-medium text-slate-900"><span class="font-mono text-xs bg-slate-100 rounded px-1.5 py-0.5">{{ backlogItem.order_id }}</span></div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Item SKU</div>
                <div class="text-sm font-medium text-slate-900"><span class="font-mono text-xs bg-slate-100 rounded px-1.5 py-0.5">{{ backlogItem.item_sku }}</span></div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Quantity Needed</div>
                <div class="text-sm font-medium text-slate-900">{{ backlogItem.quantity_needed }} units</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Quantity Available</div>
                <div class="text-sm font-medium text-slate-900">{{ backlogItem.quantity_available }} units</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Expected Date</div>
                <div class="text-sm font-medium text-slate-900">{{ formatDate(backlogItem.expected_date) }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">Status</div>
                <div class="text-sm font-medium text-slate-900"><span class="badge-danger">Backordered</span></div>
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

const { translateProductName } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  backlogItem: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

const priorityBadge = {
  high: 'badge-danger',
  medium: 'badge-warning',
  low: 'badge-info'
}

const shortage = computed(() => {
  if (!props.backlogItem) return 0
  return props.backlogItem.quantity_needed - props.backlogItem.quantity_available
})

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
