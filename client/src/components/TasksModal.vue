<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-backdrop" @click="close">
        <div class="modal-panel max-w-3xl" @click.stop>
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900">{{ t('tasks.title') }}</h3>
            <button class="modal-close" @click="close">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="p-6">
            <!-- Add Task Form -->
            <div class="flex flex-col gap-4 rounded-card border border-slate-100 bg-slate-50 p-4">
              <div class="flex flex-col gap-1.5">
                <label for="task-title" class="text-sm font-medium text-slate-700">{{ t('tasks.taskTitle') }}</label>
                <input
                  id="task-title"
                  v-model="newTask.title"
                  type="text"
                  :placeholder="t('tasks.taskTitlePlaceholder')"
                  class="input"
                  @keyup.enter="handleAddTask"
                />
              </div>

              <div class="flex flex-wrap items-end gap-4">
                <div class="flex min-w-[8rem] flex-1 flex-col gap-1.5">
                  <label for="task-priority" class="text-sm font-medium text-slate-700">{{ t('tasks.priority') }}</label>
                  <select id="task-priority" v-model="newTask.priority" class="input">
                    <option value="high">{{ t('priority.high') }}</option>
                    <option value="medium">{{ t('priority.medium') }}</option>
                    <option value="low">{{ t('priority.low') }}</option>
                  </select>
                </div>

                <div class="flex min-w-[8rem] flex-1 flex-col gap-1.5">
                  <label for="task-due-date" class="text-sm font-medium text-slate-700">{{ t('tasks.dueDate') }}</label>
                  <input id="task-due-date" v-model="newTask.dueDate" type="date" class="input" />
                </div>

                <button @click="handleAddTask" class="btn-primary" :disabled="!newTask.title.trim() || !newTask.dueDate">
                  {{ t('tasks.addTask') }}
                </button>
              </div>
            </div>

            <div class="my-6 border-t border-slate-100"></div>

            <!-- Tasks List -->
            <div v-if="sortedTasks.length === 0" class="py-10 text-center text-sm text-slate-500">
              {{ t('tasks.noTasks') }}
            </div>

            <div v-else class="flex flex-col gap-3">
              <div
                v-for="task in sortedTasks"
                :key="task.id"
                class="card border-l-4 px-4 py-3 transition-colors hover:border-slate-300"
                :class="[priorityBorder[task.priority], { 'opacity-60': task.status === 'completed' }]"
              >
                <div class="mb-2 flex items-start justify-between gap-4">
                  <div class="flex flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      :checked="task.status === 'completed'"
                      @change="$emit('toggle-task', task.id)"
                      class="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-indigo-600"
                    />
                    <span
                      class="flex-1 cursor-pointer select-none text-sm font-medium"
                      :class="task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'"
                      @click="$emit('toggle-task', task.id)"
                    >{{ task.title }}</span>
                  </div>
                  <button @click="$emit('delete-task', task.id)" class="modal-close text-slate-400 hover:text-red-600" title="Delete task">
                    <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
                      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>

                <div class="flex items-center gap-4">
                  <span :class="priorityBadge[task.priority] || 'badge-neutral'">
                    {{ translatePriority(task.priority) }}
                  </span>
                  <div class="flex items-center gap-1.5 text-xs text-slate-500">
                    <svg class="text-slate-400" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="2" y="3" width="10" height="9" rx="1" stroke="currentColor" stroke-width="1.2"/>
                      <path d="M4.5 1.5V4.5M9.5 1.5V4.5M2 6H12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    </svg>
                    {{ formatDueDate(task.dueDate) }}
                  </div>
                  <span class="ml-auto" :class="statusBadge[getStatusClass(task.dueDate, task.status)]">
                    {{ getStatusText(task.dueDate, task.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
            <button class="btn-secondary" @click="close">{{ t('profileDetails.close') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed } from 'vue'
import { useI18n } from '../composables/useI18n'

export default {
  name: 'TasksModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    tasks: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'add-task', 'delete-task', 'toggle-task'],
  setup(props, { emit }) {
    const { t, currentLocale } = useI18n()
    const newTask = ref({
      title: '',
      priority: 'medium',
      dueDate: ''
    })

    const sortedTasks = computed(() => {
      // Don't sort - just return tasks in their current order (newest first)
      return [...props.tasks]
    })

    const close = () => {
      emit('close')
    }

    const handleAddTask = () => {
      if (newTask.value.title.trim() && newTask.value.dueDate) {
        emit('add-task', {
          title: newTask.value.title.trim(),
          priority: newTask.value.priority,
          dueDate: newTask.value.dueDate
        })
        newTask.value = {
          title: '',
          priority: 'medium',
          dueDate: ''
        }
      }
    }

    const formatDueDate = (dateString) => {
      const date = new Date(dateString)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dueDate = new Date(date)
      dueDate.setHours(0, 0, 0, 0)

      const diffTime = dueDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      const isJapanese = currentLocale.value === 'ja'

      if (diffDays === 0) return isJapanese ? '今日' : 'today'
      if (diffDays === 1) return isJapanese ? '明日' : 'tomorrow'
      if (diffDays === -1) return isJapanese ? '昨日' : 'yesterday'
      if (diffDays < 0) return isJapanese ? `${Math.abs(diffDays)}日前` : `${Math.abs(diffDays)} days ago`
      if (diffDays < 7) return isJapanese ? `${diffDays}日後` : `in ${diffDays} days`

      const locale = isJapanese ? 'ja-JP' : 'en-US'
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }

    const getStatusClass = (dueDate, status) => {
      if (status === 'completed') return 'completed'

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const due = new Date(dueDate)
      due.setHours(0, 0, 0, 0)

      const diffTime = due - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return 'overdue'
      if (diffDays <= 1) return 'urgent'
      return 'upcoming'
    }

    const getStatusText = (dueDate, status) => {
      const isJapanese = currentLocale.value === 'ja'

      if (status === 'completed') return isJapanese ? '完了' : 'Completed'

      const statusClass = getStatusClass(dueDate, status)
      if (statusClass === 'overdue') return isJapanese ? '期限超過' : 'Overdue'
      if (statusClass === 'urgent') return isJapanese ? 'もうすぐ期限' : 'Due Soon'
      return isJapanese ? '予定' : 'Upcoming'
    }

    const priorityBadge = {
      high: 'badge-danger',
      medium: 'badge-warning',
      low: 'badge-info'
    }

    const priorityBorder = {
      high: 'border-l-red-500',
      medium: 'border-l-amber-500',
      low: 'border-l-sky-500'
    }

    const statusBadge = {
      overdue: 'badge-danger',
      urgent: 'badge-warning',
      upcoming: 'badge-info',
      completed: 'badge-success'
    }

    const translatePriority = (priority) => {
      const priorityMap = {
        'high': t('priority.high'),
        'medium': t('priority.medium'),
        'low': t('priority.low')
      }
      return priorityMap[priority] || priority
    }

    return {
      t,
      newTask,
      sortedTasks,
      close,
      handleAddTask,
      formatDueDate,
      getStatusClass,
      getStatusText,
      translatePriority,
      priorityBadge,
      priorityBorder,
      statusBadge
    }
  }
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
