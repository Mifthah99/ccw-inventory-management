<template>
  <div class="min-h-screen lg:flex">
    <aside class="z-30 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:flex-col lg:flex-nowrap lg:items-stretch lg:gap-0 lg:border-b-0 lg:border-r lg:px-3 lg:py-5">
      <div class="lg:mb-6 lg:px-3">
        <h1 class="text-base font-semibold tracking-tight text-slate-900">{{ t('nav.companyName') }}</h1>
        <span class="text-xs text-slate-500">{{ t('nav.subtitle') }}</span>
      </div>
      <nav class="order-last flex w-full gap-1 overflow-x-auto lg:order-none lg:w-auto lg:flex-1 lg:flex-col lg:overflow-visible">
        <router-link v-for="link in links" :key="link.to" :to="link.to"
          class="whitespace-nowrap rounded-control px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          :class="{ 'bg-accent-tint font-medium text-accent hover:bg-accent-tint hover:text-accent': $route.path === link.to }">
          {{ link.label }}
        </router-link>
      </nav>
      <div class="ml-auto flex items-center gap-2 lg:ml-0 lg:flex-col lg:items-stretch lg:border-t lg:border-slate-200 lg:pt-4">
        <LanguageSwitcher />
        <ProfileMenu
          @show-profile-details="showProfileDetails = true"
          @show-tasks="showTasks = true"
        />
      </div>
    </aside>

    <div class="min-w-0 flex-1">
      <div class="border-b border-slate-200 bg-white/80 px-6 py-2.5 backdrop-blur lg:px-8">
        <FilterBar />
      </div>
      <main class="mx-auto w-full max-w-[1400px] px-6 py-6 lg:px-8">
        <router-view />
      </main>
    </div>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />

    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    const links = computed(() => [
      { to: '/', label: t('nav.overview') },
      { to: '/inventory', label: t('nav.inventory') },
      { to: '/orders', label: t('nav.orders') },
      { to: '/spending', label: t('nav.finance') },
      { to: '/demand', label: t('nav.demandForecast') },
      { to: '/reports', label: 'Reports' }
    ])

    onMounted(loadTasks)

    return {
      t,
      links,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask
    }
  }
}
</script>

