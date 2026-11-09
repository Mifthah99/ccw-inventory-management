<template>
  <div class="relative">
    <button
      class="flex w-full items-center gap-2 rounded-control border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
      @click="toggleDropdown"
      @blur="handleBlur"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        class="shrink-0 text-slate-400"
      >
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" stroke-width="1.5"/>
        <path d="M3 10H17" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 3C10 3 7.5 5.5 7.5 10C7.5 14.5 10 17 10 17" stroke="currentColor" stroke-width="1.5"/>
        <path d="M10 3C10 3 12.5 5.5 12.5 10C12.5 14.5 10 17 10 17" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      <span class="flex-1 text-left font-medium">{{ localeName }}</span>
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

    <div v-if="isDropdownOpen" class="absolute bottom-full left-0 z-50 mb-2 min-w-40 overflow-hidden rounded-card border border-slate-200 bg-white py-1 shadow-pop max-lg:bottom-auto max-lg:left-auto max-lg:right-0 max-lg:mb-0 max-lg:mt-2 max-lg:top-full">
      <button
        v-for="locale in availableLocales"
        :key="locale"
        class="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm font-medium hover:bg-slate-50"
        :class="currentLocale === locale ? 'bg-accent-tint text-accent hover:bg-accent-tint' : 'text-slate-700'"
        @mousedown.prevent="selectLanguage(locale)"
      >
        <span class="flex-1">{{ getLanguageName(locale) }}</span>
        <svg
          v-if="currentLocale === locale"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          class="shrink-0 text-accent"
        >
          <path d="M4 9L7.5 12.5L14 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from '../composables/useI18n'

const { currentLocale, setLocale, availableLocales, localeName } = useI18n()

const isDropdownOpen = ref(false)

const languageNames = {
  en: 'English',
  ja: '日本語'
}

const getLanguageName = (locale) => {
  return languageNames[locale] || locale
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const handleBlur = () => {
  // Delay to allow mousedown events on dropdown items to fire first
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 200)
}

const selectLanguage = (locale) => {
  setLocale(locale)
  isDropdownOpen.value = false
}
</script>
