<template>
  <div class="space-y-6">
    <div>
      <h2 class="page-title">{{ t('finance.title') }}</h2>
      <p class="page-subtitle">{{ t('finance.description') }}</p>
    </div>

    <div v-if="loading" class="loading">{{ t('common.loading') }}</div>
    <div v-else-if="error" class="rounded-control bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>
    <div v-else class="space-y-6">
      <!-- Revenue & Financial KPIs -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card p-5">
          <div class="text-sm text-slate-500">{{ t('finance.totalRevenue') }}</div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ formatCurrency(revenueMetrics.totalRevenue) }}</div>
          <div class="mt-3 flex items-center gap-1 text-sm text-emerald-600">
            <span class="font-bold">↑</span>
            {{ t('finance.fromOrders', { count: revenueMetrics.orderCount }) }}
          </div>
        </div>
        <div class="card p-5">
          <div class="text-sm text-slate-500">{{ t('finance.totalCosts') }}</div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ formatCurrency(totalCosts) }}</div>
          <div class="mt-3 text-sm text-slate-500">{{ t('finance.costBreakdown') }}</div>
        </div>
        <div class="card p-5">
          <div class="text-sm text-slate-500">{{ t('finance.netProfit') }}</div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ formatCurrency(netProfit) }}</div>
          <div class="mt-3 text-sm text-slate-500">{{ profitMargin }}% {{ t('finance.margin') }}</div>
        </div>
        <div class="card p-5">
          <div class="text-sm text-slate-500">{{ t('finance.avgOrderValue') }}</div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ formatCurrency(revenueMetrics.avgOrderValue) }}</div>
          <div class="mt-3 text-sm text-slate-500">{{ t('finance.perOrderRevenue') }}</div>
        </div>
      </div>

      <!-- Monthly Revenue vs Cost Chart -->
      <div class="card p-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-base font-semibold">{{ t('finance.revenueVsCosts.title') }}</h3>
          <div class="flex gap-5 text-sm text-slate-500">
            <span class="flex items-center gap-2"><span class="h-3 w-3 rounded-sm bg-indigo-600"></span>{{ t('finance.revenueVsCosts.revenue') }}</span>
            <span class="flex items-center gap-2"><span class="h-3 w-3 rounded-sm bg-slate-300"></span>{{ t('finance.revenueVsCosts.costs') }}</span>
          </div>
        </div>
        <div class="flex h-[350px] gap-4">
          <div class="flex flex-col justify-between border-r border-slate-200 pr-3 text-xs tabular-nums text-slate-400">
            <span>{{ currencySymbol }}{{ maxRevenueValue }}K</span>
            <span>{{ currencySymbol }}{{ Math.round(maxRevenueValue * 0.75) }}K</span>
            <span>{{ currencySymbol }}{{ Math.round(maxRevenueValue * 0.5) }}K</span>
            <span>{{ currencySymbol }}{{ Math.round(maxRevenueValue * 0.25) }}K</span>
            <span>{{ currencySymbol }}0</span>
          </div>
          <div class="flex flex-1 items-end justify-around gap-2">
            <div v-for="month in monthlyRevenue" :key="month.month" class="flex h-full flex-1 flex-col items-center">
              <div class="flex h-full w-full max-w-[80px] items-end justify-center gap-1.5 pb-8">
                <div class="min-h-[4px] w-1/2 max-w-[30px] rounded-t-md bg-indigo-600 transition-opacity hover:opacity-80" :style="{ height: getRevenueBarHeight(month.revenue) + '%' }" :title="`Revenue: ${currencySymbol}${month.revenue.toLocaleString()}`"></div>
                <div class="min-h-[4px] w-1/2 max-w-[30px] rounded-t-md bg-slate-300 transition-opacity hover:opacity-80" :style="{ height: getRevenueBarHeight(month.costs) + '%' }" :title="`Costs: ${currencySymbol}${month.costs.toLocaleString()}`"></div>
              </div>
              <span class="-mt-6 text-xs font-medium text-slate-500">{{ translateMonth(month.month) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Cost Flow Chart -->
      <div class="card p-6">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-base font-semibold">{{ t('finance.monthlyCostFlow.title') }}</h3>
          <div class="flex flex-wrap gap-5 text-sm text-slate-500">
            <span class="flex items-center gap-2"><span class="h-3 w-3 rounded-sm bg-indigo-600"></span>{{ t('finance.monthlyCostFlow.procurement') }}</span>
            <span class="flex items-center gap-2"><span class="h-3 w-3 rounded-sm bg-indigo-400"></span>{{ t('finance.monthlyCostFlow.operational') }}</span>
            <span class="flex items-center gap-2"><span class="h-3 w-3 rounded-sm bg-slate-400"></span>{{ t('finance.monthlyCostFlow.labor') }}</span>
            <span class="flex items-center gap-2"><span class="h-3 w-3 rounded-sm bg-slate-300"></span>{{ t('finance.monthlyCostFlow.overhead') }}</span>
          </div>
        </div>
        <div class="flex h-[350px] gap-4">
          <div class="flex flex-col justify-between border-r border-slate-200 pr-3 text-xs tabular-nums text-slate-400">
            <span>{{ currencySymbol }}25K</span>
            <span>{{ currencySymbol }}20K</span>
            <span>{{ currencySymbol }}15K</span>
            <span>{{ currencySymbol }}10K</span>
            <span>{{ currencySymbol }}5K</span>
            <span>{{ currencySymbol }}0</span>
          </div>
          <div class="flex flex-1 items-end justify-around gap-2">
            <div v-for="month in monthlySpending" :key="month.month" class="flex h-full flex-1 flex-col items-center">
              <div class="flex h-full w-full max-w-[60px] cursor-pointer flex-col-reverse items-stretch pb-8 transition-opacity hover:opacity-85" @click="showCostDetail(month)">
                <div class="block w-full bg-indigo-600 first:rounded-b-md last:rounded-t-md" :style="{ height: getBarHeight(month.procurement) + '%' }" :title="`Procurement: ${currencySymbol}${month.procurement.toLocaleString()}`"></div>
                <div class="block w-full bg-indigo-400 first:rounded-b-md last:rounded-t-md" :style="{ height: getBarHeight(month.operational) + '%' }" :title="`Operational: ${currencySymbol}${month.operational.toLocaleString()}`"></div>
                <div class="block w-full bg-slate-400 first:rounded-b-md last:rounded-t-md" :style="{ height: getBarHeight(month.labor) + '%' }" :title="`Labor: ${currencySymbol}${month.labor.toLocaleString()}`"></div>
                <div class="block w-full bg-slate-300 first:rounded-b-md last:rounded-t-md" :style="{ height: getBarHeight(month.overhead) + '%' }" :title="`Overhead: ${currencySymbol}${month.overhead.toLocaleString()}`"></div>
              </div>
              <span class="-mt-6 text-xs font-medium text-slate-500">{{ translateMonth(month.month) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <!-- Category Spending Breakdown -->
        <div class="card p-6">
          <h3 class="mb-5 text-base font-semibold">{{ t('finance.categorySpending.title') }}</h3>
          <div class="flex flex-col gap-5">
            <div v-for="category in categorySpending" :key="category.category" class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <div class="font-medium text-slate-900">{{ translateCategory(category.category) }}</div>
                <div class="font-semibold tabular-nums text-slate-900">{{ currencySymbol }}{{ category.amount.toLocaleString() }}</div>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div class="h-full rounded-full bg-indigo-500 transition-[width] duration-500" :style="{ width: category.percentage + '%' }"></div>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-500">{{ category.percentage }}% {{ t('finance.categorySpending.ofTotal') }}</span>
                <span class="font-semibold tabular-nums" :class="category.change > 0 ? 'text-emerald-600' : category.change < 0 ? 'text-red-600' : 'text-slate-500'">
                  {{ category.change > 0 ? '+' : '' }}{{ category.change }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card flex flex-col overflow-hidden">
          <h3 class="px-6 pb-4 pt-6 text-base font-semibold">{{ t('finance.transactions.title') }}</h3>
          <div class="max-h-[400px] overflow-auto">
            <table class="data-table">
              <thead class="sticky top-0">
                <tr>
                  <th>{{ t('finance.transactions.id') }}</th>
                  <th>{{ t('finance.transactions.description') }}</th>
                  <th>{{ t('finance.transactions.vendor') }}</th>
                  <th>{{ t('finance.transactions.date') }}</th>
                  <th class="text-right">{{ t('finance.transactions.amount') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="transaction in recentTransactions"
                  :key="transaction.id"
                  class="cursor-pointer"
                  @click="handleTransactionClick(transaction)"
                >
                  <td class="whitespace-nowrap font-mono text-xs text-slate-500">{{ transaction.id.toString().padStart(3, '0') }}</td>
                  <td class="font-medium text-slate-900">{{ transaction.description }}</td>
                  <td class="text-slate-500">{{ transaction.vendor }}</td>
                  <td class="text-xs text-slate-500">{{ formatDateShort(transaction.date) }}</td>
                  <td class="text-right font-semibold text-slate-900">{{ currencySymbol }}{{ transaction.amount.toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <CostDetailModal
      :is-open="showCostModal"
      :cost-data="selectedCostData"
      @close="showCostModal = false"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue'
import { api } from '../api'
import { useFilters } from '../composables/useFilters'
import { useI18n } from '../composables/useI18n'
import { formatCurrency as formatCurrencyUtil } from '../utils/currency'
import CostDetailModal from '../components/CostDetailModal.vue'

export default {
  name: 'Spending',
  components: {
    CostDetailModal
  },
  setup() {
    const { t, currentCurrency } = useI18n()
    const loading = ref(true)
    const error = ref(null)
    const allMonthlySpending = ref([])
    const allCategorySpending = ref([])
    const allTransactions = ref([])
    const summaryData = ref({})
    const allOrders = ref([])

    // Modal state
    const showCostModal = ref(false)
    const selectedCostData = ref(null)

    // Use shared filters
    const { selectedPeriod, getCurrentFilters } = useFilters()

    // Monthly spending chart always shows all months (not filtered)
    const monthlySpending = computed(() => {
      return allMonthlySpending.value
    })

    // Filtered monthly spending for summary calculations only
    const filteredMonthlySpending = computed(() => {
      if (selectedPeriod.value === 'all') {
        return allMonthlySpending.value
      }

      // Extract month name from YYYY-MM format
      const monthMap = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
        '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
      }
      const selectedMonth = monthMap[selectedPeriod.value.split('-')[1]]
      return allMonthlySpending.value.filter(m => m.month === selectedMonth)
    })

    const categorySpending = computed(() => {
      return allCategorySpending.value
    })

    const recentTransactions = computed(() => {
      if (selectedPeriod.value === 'all') {
        return allTransactions.value
      }
      // Filter transactions by selected month
      return allTransactions.value.filter(t => {
        const transactionMonth = new Date(t.date).toISOString().slice(0, 7)
        return transactionMonth === selectedPeriod.value
      })
    })

    const summary = computed(() => {
      // Recalculate summary based on filteredMonthlySpending (not the chart data)
      if (filteredMonthlySpending.value.length === 0) {
        return summaryData.value
      }

      const totals = filteredMonthlySpending.value.reduce((acc, month) => ({
        procurement: acc.procurement + month.procurement,
        operational: acc.operational + month.operational,
        labor: acc.labor + month.labor,
        overhead: acc.overhead + month.overhead
      }), { procurement: 0, operational: 0, labor: 0, overhead: 0 })

      return {
        total_procurement_cost: totals.procurement,
        total_operational_cost: totals.operational,
        total_labor_cost: totals.labor,
        total_overhead: totals.overhead,
        procurement_change: summaryData.value.procurement_change || 0,
        operational_change: summaryData.value.operational_change || 0,
        labor_change: summaryData.value.labor_change || 0,
        overhead_change: summaryData.value.overhead_change || 0
      }
    })

    // Filtered orders based on selected period
    const filteredOrders = computed(() => {
      if (selectedPeriod.value === 'all') {
        return allOrders.value
      }

      // Filter orders by selected month
      return allOrders.value.filter(order => {
        const orderMonth = new Date(order.order_date).toISOString().slice(0, 7)
        return orderMonth === selectedPeriod.value
      })
    })

    // Revenue metrics from filtered orders
    const revenueMetrics = computed(() => {
      const totalRevenue = filteredOrders.value.reduce((sum, order) => sum + (order.total_value || 0), 0)
      const orderCount = filteredOrders.value.length
      const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0

      return {
        totalRevenue,
        orderCount,
        avgOrderValue,
        revenueGrowth: 15.3 // Placeholder - could calculate from historical data
      }
    })

    // Total costs from summary
    const totalCosts = computed(() => {
      return summary.value.total_procurement_cost +
             summary.value.total_operational_cost +
             summary.value.total_labor_cost +
             summary.value.total_overhead
    })

    // Net profit
    const netProfit = computed(() => {
      return revenueMetrics.value.totalRevenue - totalCosts.value
    })

    // Profit margin percentage
    const profitMargin = computed(() => {
      if (revenueMetrics.value.totalRevenue === 0) return 0
      return ((netProfit.value / revenueMetrics.value.totalRevenue) * 100).toFixed(1)
    })

    // Monthly revenue data for chart
    const monthlyRevenue = computed(() => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

      // Initialize all months
      const revenueByMonth = monthNames.map(month => ({
        month,
        revenue: 0,
        costs: 0
      }))

      // Calculate revenue from orders
      allOrders.value.forEach(order => {
        const orderDate = new Date(order.order_date)
        const monthIndex = orderDate.getMonth()
        if (monthIndex >= 0 && monthIndex < 12) {
          revenueByMonth[monthIndex].revenue += order.total_value || 0
        }
      })

      // Add costs from spending data
      allMonthlySpending.value.forEach(spending => {
        const monthIndex = monthNames.indexOf(spending.month)
        if (monthIndex >= 0) {
          revenueByMonth[monthIndex].costs = spending.procurement + spending.operational + spending.labor + spending.overhead
        }
      })

      return revenueByMonth
    })

    // Max value for chart scaling
    const maxRevenueValue = computed(() => {
      const maxRevenue = Math.max(...monthlyRevenue.value.map(m => m.revenue))
      const maxCost = Math.max(...monthlyRevenue.value.map(m => m.costs))
      const max = Math.max(maxRevenue, maxCost)
      return Math.ceil(max / 1000) // Return in K
    })

    const loadData = async () => {
      try {
        loading.value = true
        const [summaryRes, monthlyRes, categoryRes, transactionsRes, ordersRes] = await Promise.all([
          api.getSpendingSummary(),
          api.getMonthlySpending(),
          api.getCategorySpending(),
          api.getTransactions(),
          api.getOrders()
        ])

        summaryData.value = summaryRes
        allMonthlySpending.value = monthlyRes
        allCategorySpending.value = categoryRes
        allTransactions.value = transactionsRes
        allOrders.value = ordersRes
      } catch (err) {
        error.value = 'Failed to load financial data: ' + err.message
      } finally {
        loading.value = false
      }
    }

    // Watch for period filter changes
    watch([selectedPeriod], () => {
      // Data will automatically update via computed properties
    })

    const formatCurrency = (value) => {
      return formatCurrencyUtil(value, currentCurrency.value)
    }

    const currencySymbol = computed(() => {
      return currentCurrency.value === 'JPY' ? '¥' : '$'
    })

    const getBarHeight = (value) => {
      const maxValue = 25000
      return (value / maxValue) * 100
    }

    const getRevenueBarHeight = (value) => {
      const maxValue = maxRevenueValue.value * 1000
      return (value / maxValue) * 100
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }

    const formatDateShort = (dateString) => {
      const date = new Date(dateString)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear().toString().slice(-2)
      return `${month}/${day}/${year}`
    }

    const translateMonth = (month) => {
      const monthMap = {
        'Jan': t('months.jan'),
        'Feb': t('months.feb'),
        'Mar': t('months.mar'),
        'Apr': t('months.apr'),
        'May': t('months.may'),
        'Jun': t('months.jun'),
        'Jul': t('months.jul'),
        'Aug': t('months.aug'),
        'Sep': t('months.sep'),
        'Oct': t('months.oct'),
        'Nov': t('months.nov'),
        'Dec': t('months.dec')
      }
      return monthMap[month] || month
    }

    const translateCategory = (category) => {
      // First try spending categories
      const spendingCategoryMap = {
        'Raw Materials': t('spendingCategories.rawMaterials'),
        'Components': t('spendingCategories.components'),
        'Equipment': t('spendingCategories.equipment'),
        'Consumables': t('spendingCategories.consumables')
      }

      // Then try product categories
      const productCategoryMap = {
        'Circuit Boards': t('categories.circuitBoards'),
        'Sensors': t('categories.sensors'),
        'Actuators': t('categories.actuators'),
        'Controllers': t('categories.controllers'),
        'Power Supplies': t('categories.powerSupplies')
      }

      return spendingCategoryMap[category] || productCategoryMap[category] || category
    }

    const handleTransactionClick = (transaction) => {
      console.log('Transaction clicked:', transaction)
      alert(`Transaction Details:\n\nID: ${transaction.id}\nDescription: ${transaction.description}\nVendor: ${transaction.vendor}\nDate: ${formatDateShort(transaction.date)}\nAmount: $${transaction.amount.toLocaleString()}`)
    }

    const showCostDetail = (monthData) => {
      selectedCostData.value = monthData
      showCostModal.value = true
    }

    onMounted(loadData)

    return {
      t,
      loading,
      error,
      summary,
      monthlySpending,
      categorySpending,
      recentTransactions,
      revenueMetrics,
      totalCosts,
      netProfit,
      profitMargin,
      monthlyRevenue,
      maxRevenueValue,
      formatCurrency,
      currencySymbol,
      getBarHeight,
      getRevenueBarHeight,
      formatDate,
      formatDateShort,
      translateMonth,
      translateCategory,
      handleTransactionClick,
      showCostModal,
      selectedCostData,
      showCostDetail,
      Math
    }
  }
}
</script>
