<template>
  <div class="relative" :class="widthClass" ref="wrapperRef">
    <Input
      variant="asset"
      v-model="search"
      :placeholder="loading ? 'Loading…' : placeholder"
      class="pr-8"
      :disabled="loading"
      @focus="open = true"
      @input="open = true"
    />

    <button
      v-if="modelValue || search"
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      @click="clear"
    >
      ×
    </button>

    <div
      v-if="open && !loading"
      class="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
    >
      <button
        v-for="item in filteredItems"
        :key="item[valueKey]"
        type="button"
        class="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-slate-50"
        :class="modelValue === item[valueKey] ? 'bg-sky-50 text-sky-700' : 'text-slate-700'"
        @click="select(item)"
      >
        <span class="truncate font-medium">{{ item[labelKey] }}</span>
        <span v-if="secondaryKey && item[secondaryKey]" class="truncate text-xs text-slate-400">
          {{ item[secondaryKey] }}
        </span>
      </button>

      <div v-if="filteredItems.length === 0" class="px-3 py-2 text-sm text-slate-400">
        No result found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import Input from './input.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    items: any[]
    labelKey?: string
    valueKey?: string
    secondaryKey?: string
    searchKeys?: string[]
    placeholder?: string
    loading?: boolean
    widthClass?: string
  }>(),
  {
    labelKey: 'name',
    valueKey: 'id',
    placeholder: 'Search…',
    loading: false,
    widthClass: 'w-56',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [item: any | null]
}>()

const search = ref('')
const open = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const filteredItems = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return props.items

  const keys = props.searchKeys ?? [props.labelKey, props.secondaryKey].filter(Boolean)

  return props.items.filter((item) =>
    keys.some((key) => String(item[key as string] ?? '').toLowerCase().includes(q))
  )
})

watch(
  () => props.modelValue,
  (id) => {
    if (!id) {
      search.value = ''
      return
    }

    const item = props.items.find((i) => i[props.valueKey] === id)
    if (item) {
      search.value =
        props.secondaryKey && item[props.secondaryKey]
          ? `${item[props.labelKey]} (${item[props.secondaryKey]})`
          : item[props.labelKey]
    }
  },
  { immediate: true }
)

function select(item: any) {
  emit('update:modelValue', item[props.valueKey])
  emit('change', item)
  search.value =
    props.secondaryKey && item[props.secondaryKey]
      ? `${item[props.labelKey]} (${item[props.secondaryKey]})`
      : item[props.labelKey]
  open.value = false
}

function clear() {
  emit('update:modelValue', '')
  emit('change', null)
  search.value = ''
  open.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (!wrapperRef.value || wrapperRef.value.contains(target)) return
  open.value = false
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>