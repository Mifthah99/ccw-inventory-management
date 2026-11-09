<template>
  <div class="relative">
    <button
      class="flex w-full items-center gap-2.5 rounded-control border border-slate-200 bg-white px-2.5 py-1.5 text-left transition-colors hover:bg-slate-50"
      @click="toggleDropdown"
      @blur="handleBlur"
    >
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
        {{ getInitials(currentUser.name) }}
      </div>
      <span class="hidden flex-1 truncate text-sm font-medium text-slate-900 sm:inline">{{ currentUser.name }}</span>
      <svg
        class="shrink-0 text-slate-400 transition-transform"
        :class="{ 'rotate-180': isDropdownOpen }"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>

    <div v-if="isDropdownOpen" class="absolute bottom-full left-0 z-50 mb-2 w-72 overflow-hidden rounded-card border border-slate-200 bg-white shadow-pop max-lg:bottom-auto max-lg:left-auto max-lg:right-0 max-lg:mb-0 max-lg:mt-2 max-lg:top-full">
      <div class="flex items-center gap-3 bg-slate-50 p-4">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
          {{ getInitials(currentUser.name) }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-semibold text-slate-900">{{ currentUser.name }}</div>
          <div class="truncate text-xs text-slate-500">{{ currentUser.email }}</div>
        </div>
      </div>

      <div class="my-1 h-px bg-slate-200"></div>

      <button
        class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
        @mousedown.prevent="showProfileDetails"
      >
        <svg class="shrink-0 text-slate-400" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M15 15C15 12.7909 12.3137 11 9 11C5.68629 11 3 12.7909 3 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        {{ t('profile.profileDetails') }}
      </button>

      <button
        class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
        @mousedown.prevent="showTasks"
      >
        <svg class="shrink-0 text-slate-400" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M15 3H3C2.44772 3 2 3.44772 2 4V14C2 14.5523 2.44772 15 3 15H15C15.5523 15 16 14.5523 16 14V4C16 3.44772 15.5523 3 15 3Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M6 7L8 9L12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ t('profile.myTasks') }}
        <span v-if="pendingTaskCount > 0" class="ml-auto min-w-5 rounded-full bg-accent px-2 py-0.5 text-center text-xs font-semibold text-white">{{ pendingTaskCount }}</span>
      </button>

      <div class="my-1 h-px bg-slate-200"></div>

      <button
        class="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
        @mousedown.prevent="handleLogout"
      >
        <svg class="shrink-0" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M7 15H4C3.44772 15 3 14.5523 3 14V4C3 3.44772 3.44772 3 4 3H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M11 12L15 9M15 9L11 6M15 9H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ t('profile.logout') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useI18n } from '../composables/useI18n'

const { currentUser, logout, getInitials } = useAuth()
const { t } = useI18n()

const isDropdownOpen = ref(false)
const emit = defineEmits(['show-profile-details', 'show-tasks'])

const pendingTaskCount = computed(() => {
  return currentUser.value.tasks.filter(task => task.status === 'pending').length
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleBlur = () => {
  // Delay to allow mousedown events on dropdown items to fire first
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 200)
}

const showProfileDetails = () => {
  isDropdownOpen.value = false
  emit('show-profile-details')
}

const showTasks = () => {
  isDropdownOpen.value = false
  emit('show-tasks')
}

const handleLogout = () => {
  isDropdownOpen.value = false
  logout()
}
</script>
