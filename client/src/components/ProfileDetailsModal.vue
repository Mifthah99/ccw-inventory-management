<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-backdrop" @click="close">
        <div class="modal-panel max-w-xl" @click.stop>
          <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900">{{ t('profileDetails.title') }}</h3>
            <button class="modal-close" @click="close">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="p-6">
            <div class="mb-6 flex flex-col items-center gap-2 border-b border-slate-100 pb-6">
              <div class="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-2xl font-semibold text-white">
                {{ getInitials(currentUser.name) }}
              </div>
              <h4 class="text-lg font-semibold text-slate-900">{{ currentUser.name }}</h4>
              <p class="text-sm text-slate-500">{{ currentUser.jobTitle }}</p>
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ t('profileDetails.email') }}</div>
                <div class="text-sm font-medium text-slate-900">{{ currentUser.email }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ t('profileDetails.department') }}</div>
                <div class="text-sm font-medium text-slate-900">{{ currentUser.department }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ t('profileDetails.location') }}</div>
                <div class="text-sm font-medium text-slate-900">{{ currentUser.location }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ t('profileDetails.phone') }}</div>
                <div class="text-sm font-medium text-slate-900">{{ currentUser.phone }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ t('profileDetails.joinDate') }}</div>
                <div class="text-sm font-medium text-slate-900">{{ formatDate(currentUser.joinDate) }}</div>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ t('profileDetails.employeeId') }}</div>
                <div class="text-sm font-medium text-slate-900"><span class="font-mono text-xs bg-slate-100 rounded px-1.5 py-0.5">CC-{{ currentUser.id.toString().padStart(5, "0") }}</span></div>
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

<script setup>
import { useAuth } from '../composables/useAuth'
import { useI18n } from '../composables/useI18n'

const { currentUser, getInitials } = useAuth()
const { t, currentLocale } = useI18n()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const locale = currentLocale.value === 'ja' ? 'ja-JP' : 'en-US'
  return date.toLocaleDateString(locale, {
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
