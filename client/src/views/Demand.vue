<template>
  <div class="space-y-6">
    <div>
      <h2 class="page-title">{{ t('demand.title') }}</h2>
      <p class="page-subtitle">{{ t('demand.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="rounded-control bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>
    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="card p-6">
          <div class="mb-4 flex items-center gap-4 border-b border-slate-100 pb-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-emerald-50 text-xl font-bold text-emerald-600">↑</div>
            <div>
              <div class="text-sm text-slate-500">{{ t('demand.increasingDemand') }}</div>
              <div class="text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ t('demand.itemsCount', { count: getForecastsByTrend('increasing').length }) }}</div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div v-for="item in getForecastsByTrend('increasing').slice(0, 5)" :key="item.id" class="flex items-center justify-between rounded-control bg-slate-50 px-3 py-2 hover:bg-slate-100">
              <span class="mr-4 flex-1 truncate text-sm font-medium text-slate-900">{{ item.item_name }}</span>
              <span class="shrink-0 text-xs font-semibold tabular-nums text-emerald-600">{{ getChangePercent(item) }}%</span>
            </div>
            <div v-if="getForecastsByTrend('increasing').length > 5" class="p-2 text-center text-xs text-slate-500">
              +{{ getForecastsByTrend('increasing').length - 5 }} {{ t('demand.more') }}
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="mb-4 flex items-center gap-4 border-b border-slate-100 pb-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-sky-50 text-xl font-bold text-sky-600">→</div>
            <div>
              <div class="text-sm text-slate-500">{{ t('demand.stableDemand') }}</div>
              <div class="text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ t('demand.itemsCount', { count: getForecastsByTrend('stable').length }) }}</div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div v-for="item in getForecastsByTrend('stable').slice(0, 5)" :key="item.id" class="flex items-center justify-between rounded-control bg-slate-50 px-3 py-2 hover:bg-slate-100">
              <span class="mr-4 flex-1 truncate text-sm font-medium text-slate-900">{{ item.item_name }}</span>
              <span class="shrink-0 text-xs font-semibold tabular-nums text-slate-500">{{ getChangePercent(item) }}%</span>
            </div>
            <div v-if="getForecastsByTrend('stable').length > 5" class="p-2 text-center text-xs text-slate-500">
              +{{ getForecastsByTrend('stable').length - 5 }} {{ t('demand.more') }}
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="mb-4 flex items-center gap-4 border-b border-slate-100 pb-4">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-red-50 text-xl font-bold text-red-600">↓</div>
            <div>
              <div class="text-sm text-slate-500">{{ t('demand.decreasingDemand') }}</div>
              <div class="text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ t('demand.itemsCount', { count: getForecastsByTrend('decreasing').length }) }}</div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <div v-for="item in getForecastsByTrend('decreasing').slice(0, 5)" :key="item.id" class="flex items-center justify-between rounded-control bg-slate-50 px-3 py-2 hover:bg-slate-100">
              <span class="mr-4 flex-1 truncate text-sm font-medium text-slate-900">{{ item.item_name }}</span>
              <span class="shrink-0 text-xs font-semibold tabular-nums text-red-600">{{ getChangePercent(item) }}%</span>
            </div>
            <div v-if="getForecastsByTrend('decreasing').length > 5" class="p-2 text-center text-xs text-slate-500">
              +{{ getForecastsByTrend('decreasing').length - 5 }} {{ t('demand.more') }}
            </div>
          </div>
        </div>
      </div>

      <div class="card overflow-hidden">
        <h3 class="px-6 pb-4 pt-6 text-base font-semibold">{{ t('demand.demandForecasts') }}</h3>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ t('demand.table.sku') }}</th>
                <th>{{ t('demand.table.itemName') }}</th>
                <th>{{ t('demand.table.currentDemand') }}</th>
                <th>{{ t('demand.table.forecastedDemand') }}</th>
                <th>{{ t('demand.table.change') }}</th>
                <th>{{ t('demand.table.trend') }}</th>
                <th>{{ t('demand.table.period') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="forecast in forecasts" :key="forecast.id">
                <td class="font-semibold text-slate-900">{{ forecast.item_sku }}</td>
                <td>{{ forecast.item_name }}</td>
                <td>{{ forecast.current_demand }}</td>
                <td class="font-semibold text-slate-900">{{ forecast.forecasted_demand }}</td>
                <td>
                  <span class="font-medium" :style="{ color: getChangeColor(forecast) }">
                    {{ getChangePercent(forecast) }}%
                  </span>
                </td>
                <td>
                  <span :class="{ increasing: 'badge-success', stable: 'badge-info', decreasing: 'badge-danger' }[forecast.trend] || 'badge-neutral'">
                    {{ t(`trends.${forecast.trend}`) }}
                  </span>
                </td>
                <td>{{ translatePeriod(forecast.period) }}</td>
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
  name: 'Demand',
  setup() {
    const { t } = useI18n()
    const loading = ref(true)
    const error = ref(null)
    const allForecasts = ref([])
    const inventoryItems = ref([])

    // Use shared filters
    const { selectedLocation, selectedCategory, getCurrentFilters } = useFilters()

    // Filter forecasts based on inventory filters
    const forecasts = computed(() => {
      if (selectedLocation.value === 'all' && selectedCategory.value === 'all') {
        return allForecasts.value
      }

      // Get SKUs of items that match the filters
      const validSkus = new Set(inventoryItems.value.map(item => item.sku))
      return allForecasts.value.filter(f => validSkus.has(f.item_sku))
    })

    const loadForecasts = async () => {
      try {
        loading.value = true
        const filters = getCurrentFilters()

        const [forecastsData, inventoryData] = await Promise.all([
          api.getDemandForecasts(),
          api.getInventory({
            warehouse: filters.warehouse,
            category: filters.category
          })
        ])

        allForecasts.value = forecastsData
        inventoryItems.value = inventoryData
      } catch (err) {
        error.value = 'Failed to load demand forecasts: ' + err.message
      } finally {
        loading.value = false
      }
    }

    // Watch for filter changes and reload data
    watch([selectedLocation, selectedCategory], () => {
      loadForecasts()
    })

    const getForecastsByTrend = (trend) => {
      return forecasts.value.filter(f => f.trend === trend)
    }

    const getChangePercent = (forecast) => {
      const change = ((forecast.forecasted_demand - forecast.current_demand) / forecast.current_demand * 100).toFixed(1)
      return change > 0 ? `+${change}` : change
    }

    const getChangeColor = (forecast) => {
      const change = forecast.forecasted_demand - forecast.current_demand
      const changePercent = Math.abs((change / forecast.current_demand) * 100)

      // If change is within ±2%, consider it stable and show blue
      if (changePercent <= 2) {
        return '#3b82f6' // Blue for stable
      }

      if (change > 0) return '#10b981' // Green for increasing
      if (change < 0) return '#ef4444' // Red for decreasing
      return '#3b82f6' // Blue for no change
    }

    const translatePeriod = (period) => {
      // Period values like "Next 3 months", "Q1 2025", "30 days", etc.
      const { currentLocale } = useI18n()
      if (currentLocale.value === 'ja') {
        return period
          .replace(/Next\s+/i, '次の')
          .replace(/\s+months/i, 'か月')
          .replace(/\s+month/i, 'か月')
          .replace(/\s+days/i, '日間')
          .replace(/\s+day/i, '日')
          .replace('Q1', '第1四半期')
          .replace('Q2', '第2四半期')
          .replace('Q3', '第3四半期')
          .replace('Q4', '第4四半期')
      }
      return period
    }

    onMounted(loadForecasts)

    return {
      t,
      loading,
      error,
      forecasts,
      getForecastsByTrend,
      getChangePercent,
      getChangeColor,
      translatePeriod
    }
  }
}
</script>
