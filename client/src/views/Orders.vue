<template>
  <div class="space-y-6">
    <div>
      <h2 class="page-title">{{ t('orders.title') }}</h2>
      <p class="page-subtitle">{{ t('orders.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="rounded-control bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>
    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card p-5">
          <div class="flex items-center justify-between">
            <span class="badge-success">{{ t('status.delivered') }}</span>
          </div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ getOrdersByStatus('Delivered').length }}</div>
        </div>
        <div class="card p-5">
          <div class="flex items-center justify-between">
            <span class="badge-info">{{ t('status.shipped') }}</span>
          </div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ getOrdersByStatus('Shipped').length }}</div>
        </div>
        <div class="card p-5">
          <div class="flex items-center justify-between">
            <span class="badge-warning">{{ t('status.processing') }}</span>
          </div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ getOrdersByStatus('Processing').length }}</div>
        </div>
        <div class="card p-5">
          <div class="flex items-center justify-between">
            <span class="badge-danger">{{ t('status.backordered') }}</span>
          </div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ getOrdersByStatus('Backordered').length }}</div>
        </div>
      </div>

      <div class="card">
        <h3 class="px-6 pb-4 pt-6 text-base font-semibold">{{ t('orders.allOrders') }} ({{ orders.length }})</h3>
        <div class="overflow-x-auto rounded-b-card">
          <table class="data-table table-fixed">
            <thead>
              <tr>
                <th class="w-[150px]">{{ t('orders.table.orderNumber') }}</th>
                <th class="w-[180px]">{{ t('orders.table.customer') }}</th>
                <th class="w-[200px]">{{ t('orders.table.items') }}</th>
                <th class="w-[130px]">{{ t('orders.table.status') }}</th>
                <th class="w-[140px]">{{ t('orders.table.orderDate') }}</th>
                <th class="w-[140px]">{{ t('orders.table.expectedDelivery') }}</th>
                <th class="w-[120px]">{{ t('orders.table.totalValue') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(order, orderIdx) in orders" :key="order.id">
                <td class="whitespace-nowrap font-semibold text-slate-900">{{ order.order_number }}</td>
                <td>{{ translateCustomerName(order.customer) }}</td>
                <td>
                  <details class="relative">
                    <summary class="inline-block cursor-pointer select-none font-medium text-accent hover:text-accent-hover hover:underline">
                      {{ t('orders.itemsCount', { count: order.items.length }) }}
                    </summary>
                    <div :class="orders.length > 4 && orderIdx >= orders.length - 3 ? 'bottom-full mb-2' : 'top-full mt-2'" class="absolute left-0 z-10 min-w-[300px] max-w-[400px] rounded-control border border-slate-200 bg-white p-3 shadow-pop">
                      <div v-for="(item, idx) in order.items" :key="item.name + idx" class="flex flex-col gap-1 border-b border-slate-100 p-2 last:border-b-0">
                        <span class="text-sm font-medium text-slate-900">{{ translateProductName(item.name) }}</span>
                        <span class="text-xs text-slate-500">{{ t('orders.quantity') }}: {{ item.quantity }} @ {{ currencySymbol }}{{ item.unit_price }}</span>
                      </div>
                    </div>
                  </details>
                </td>
                <td>
                  <span :class="'badge-' + getOrderStatusClass(order.status)">
                    {{ t(`status.${order.status.toLowerCase()}`) }}
                  </span>
                </td>
                <td>{{ formatDate(order.order_date) }}</td>
                <td>{{ formatDate(order.expected_delivery) }}</td>
                <td class="font-semibold text-slate-900">{{ currencySymbol }}{{ order.total_value.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'

export default {
  name: 'Orders',
  setup() {
    const { t, currentCurrency, translateProductName, translateCustomerName } = useI18n()

    const currencySymbol = computed(() => {
      return currentCurrency.value === 'JPY' ? '¥' : '$'
    })
    const loading = ref(true)
    const error = ref(null)
    const orders = ref([])

    // Use shared filters
    const {
      selectedPeriod,
      selectedLocation,
      selectedCategory,
      selectedStatus,
      getCurrentFilters
    } = useFilters()

    const loadOrders = async () => {
      try {
        loading.value = true
        const filters = getCurrentFilters()
        const fetchedOrders = await api.getOrders(filters)

        // Sort orders by order_date (earliest first)
        orders.value = fetchedOrders.sort((a, b) => {
          const dateA = new Date(a.order_date)
          const dateB = new Date(b.order_date)
          return dateA - dateB
        })
      } catch (err) {
        error.value = 'Failed to load orders: ' + err.message
      } finally {
        loading.value = false
      }
    }

    // Watch for filter changes and reload data
    watch([selectedPeriod, selectedLocation, selectedCategory, selectedStatus], () => {
      loadOrders()
    })

    const getOrdersByStatus = (status) => {
      return orders.value.filter(order => order.status === status)
    }

    const getOrderStatusClass = (status) => {
      const statusMap = {
        'Delivered': 'success',
        'Shipped': 'info',
        'Processing': 'warning',
        'Backordered': 'danger'
      }
      return statusMap[status] || 'info'
    }

    const formatDate = (dateString) => {
      const { currentLocale } = useI18n()
      const locale = currentLocale.value === 'ja' ? 'ja-JP' : 'en-US'
      return new Date(dateString).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    onMounted(loadOrders)

    return {
      t,
      loading,
      error,
      orders,
      getOrdersByStatus,
      getOrderStatusClass,
      formatDate,
      currencySymbol,
      translateProductName,
      translateCustomerName
    }
  }
}
</script>
