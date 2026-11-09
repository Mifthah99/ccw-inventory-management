<template>
  <div class="space-y-6">
    <div>
      <h2 class="page-title">Performance Reports</h2>
      <p class="page-subtitle">View quarterly performance metrics and monthly trends</p>
    </div>

    <div v-if="loading" class="loading">Loading reports...</div>
    <div v-else-if="error" class="rounded-control bg-red-50 p-4 text-sm text-red-700">{{ error }}</div>
    <div v-else class="space-y-6">
      <!-- Summary Stats -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card p-5">
          <div class="text-sm text-slate-500">Total Revenue (YTD)</div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">${{ formatNumber(totalRevenue) }}</div>
        </div>
        <div class="card p-5">
          <div class="text-sm text-slate-500">Avg Monthly Revenue</div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">${{ formatNumber(avgMonthlyRevenue) }}</div>
        </div>
        <div class="card p-5">
          <div class="text-sm text-slate-500">Total Orders (YTD)</div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ totalOrders }}</div>
        </div>
        <div class="card p-5">
          <div class="text-sm text-slate-500">Best Performing Quarter</div>
          <div class="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">{{ bestQuarter }}</div>
        </div>
      </div>

      <!-- Quarterly Performance -->
      <div class="card overflow-hidden">
        <h3 class="px-6 pb-4 pt-6 text-base font-semibold">Quarterly Performance</h3>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th>Total Orders</th>
                <th>Total Revenue</th>
                <th>Avg Order Value</th>
                <th>Fulfillment Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="q in quarterlyData" :key="q.quarter">
                <td class="font-semibold text-slate-900">{{ q.quarter }}</td>
                <td>{{ q.total_orders }}</td>
                <td>${{ formatNumber(q.total_revenue) }}</td>
                <td>${{ formatNumber(q.avg_order_value) }}</td>
                <td>
                  <span :class="getFulfillmentClass(q.fulfillment_rate)">
                    {{ q.fulfillment_rate }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Monthly Trends Chart -->
      <div class="card p-6">
        <h3 class="mb-4 text-base font-semibold">Monthly Revenue Trend</h3>
        <div class="flex min-h-[300px] items-end justify-around gap-2 px-2 pb-10 pt-6">
          <div v-for="month in monthlyData" :key="month.month" class="flex max-w-[80px] flex-1 flex-col items-center">
            <div class="flex h-[200px] w-full items-end">
              <div
                class="w-full cursor-pointer rounded-t-md bg-indigo-500 transition-colors hover:bg-indigo-600"
                :style="{ height: getBarHeight(month.revenue) + 'px' }"
                :title="'$' + formatNumber(month.revenue)"
              ></div>
            </div>
            <div class="mt-6 -rotate-45 whitespace-nowrap text-center text-xs text-slate-500">{{ formatMonth(month.month) }}</div>
          </div>
        </div>
      </div>

      <!-- Month-over-Month Comparison -->
      <div class="card overflow-hidden">
        <h3 class="px-6 pb-4 pt-6 text-base font-semibold">Month-over-Month Analysis</h3>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Change</th>
                <th>Growth Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(month, index) in monthlyData" :key="month.month">
                <td class="font-semibold text-slate-900">{{ formatMonth(month.month) }}</td>
                <td>{{ month.order_count }}</td>
                <td>${{ formatNumber(month.revenue) }}</td>
                <td>
                  <span v-if="index > 0" :class="getChangeClass(month.revenue, monthlyData[index - 1].revenue)">
                    {{ getChangeValue(month.revenue, monthlyData[index - 1].revenue) }}
                  </span>
                  <span v-else>-</span>
                </td>
                <td>
                  <span v-if="index > 0" :class="getChangeClass(month.revenue, monthlyData[index - 1].revenue)">
                    {{ getGrowthRate(month.revenue, monthlyData[index - 1].revenue) }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Reports',
  data() {
    return {
      loading: true,
      error: null,
      quarterlyData: [],
      monthlyData: [],
      totalRevenue: 0,
      avgMonthlyRevenue: 0,
      totalOrders: 0,
      bestQuarter: ''
    }
  },
  mounted() {
    console.log('Reports component mounted')
    this.loadData()
  },
  methods: {
    async loadData() {
      console.log('Loading reports data...')
      try {
        this.loading = true

        // Fetch quarterly data
        console.log('Fetching quarterly data...')
        const quarterlyResponse = await axios.get('http://localhost:8001/api/reports/quarterly')
        this.quarterlyData = quarterlyResponse.data
        console.log('Quarterly data:', this.quarterlyData)

        // Fetch monthly data
        console.log('Fetching monthly data...')
        const monthlyResponse = await axios.get('http://localhost:8001/api/reports/monthly-trends')
        this.monthlyData = monthlyResponse.data
        console.log('Monthly data:', this.monthlyData)

        // Calculate summary stats
        console.log('Calculating summary stats...')
        this.calculateSummaryStats()
        console.log('Summary stats calculated')

      } catch (err) {
        console.log('Error loading reports:', err)
        this.error = 'Failed to load reports: ' + err.message
      } finally {
        this.loading = false
        console.log('Loading complete')
      }
    },

    calculateSummaryStats() {
      // Calculate total revenue
      var total = 0
      for (var i = 0; i < this.monthlyData.length; i++) {
        total = total + this.monthlyData[i].revenue
      }
      this.totalRevenue = total

      // Calculate average monthly revenue
      if (this.monthlyData.length > 0) {
        this.avgMonthlyRevenue = total / this.monthlyData.length
      } else {
        this.avgMonthlyRevenue = 0
      }

      // Calculate total orders
      var orders = 0
      for (var i = 0; i < this.monthlyData.length; i++) {
        orders = orders + this.monthlyData[i].order_count
      }
      this.totalOrders = orders

      // Find best quarter
      var bestQ = ''
      var bestRevenue = 0
      for (var i = 0; i < this.quarterlyData.length; i++) {
        if (this.quarterlyData[i].total_revenue > bestRevenue) {
          bestRevenue = this.quarterlyData[i].total_revenue
          bestQ = this.quarterlyData[i].quarter
        }
      }
      this.bestQuarter = bestQ
    },

    formatNumber(num) {
      console.log('Formatting number:', num)
      // Format number with commas
      var str = num.toString()
      var parts = str.split('.')
      var intPart = parts[0]
      var decPart = parts.length > 1 ? parts[1] : '00'

      var formatted = ''
      var count = 0
      for (var i = intPart.length - 1; i >= 0; i--) {
        if (count > 0 && count % 3 === 0) {
          formatted = ',' + formatted
        }
        formatted = intPart[i] + formatted
        count++
      }

      if (decPart.length === 1) {
        decPart = decPart + '0'
      }
      if (decPart.length > 2) {
        decPart = decPart.substring(0, 2)
      }

      return formatted + '.' + decPart
    },

    formatMonth(monthStr) {
      console.log('Formatting month:', monthStr)
      // Convert YYYY-MM to readable format
      var parts = monthStr.split('-')
      var year = parts[0]
      var month = parts[1]

      var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      var monthIndex = parseInt(month) - 1

      return monthNames[monthIndex] + ' ' + year
    },

    getBarHeight(revenue) {
      console.log('Calculating bar height for revenue:', revenue)
      // Calculate bar height (max height 200px)
      var maxRevenue = 0
      for (var i = 0; i < this.monthlyData.length; i++) {
        if (this.monthlyData[i].revenue > maxRevenue) {
          maxRevenue = this.monthlyData[i].revenue
        }
      }

      if (maxRevenue === 0) {
        return 0
      }

      var height = (revenue / maxRevenue) * 200
      return height
    },

    getFulfillmentClass(rate) {
      if (rate >= 90) {
        return 'badge-success'
      } else if (rate >= 75) {
        return 'badge-warning'
      } else {
        return 'badge-danger'
      }
    },

    getChangeValue(current, previous) {
      var change = current - previous
      if (change > 0) {
        return '+$' + this.formatNumber(change)
      } else if (change < 0) {
        return '-$' + this.formatNumber(Math.abs(change))
      } else {
        return '$0.00'
      }
    },

    getChangeClass(current, previous) {
      var change = current - previous
      if (change > 0) {
        return 'font-semibold text-emerald-600'
      } else if (change < 0) {
        return 'font-semibold text-red-600'
      } else {
        return ''
      }
    },

    getGrowthRate(current, previous) {
      if (previous === 0) {
        return 'N/A'
      }

      var rate = ((current - previous) / previous) * 100
      var sign = rate > 0 ? '+' : ''

      return sign + rate.toFixed(1) + '%'
    }
  }
}
</script>
