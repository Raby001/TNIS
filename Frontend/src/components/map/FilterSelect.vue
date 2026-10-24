<template>
    <div class="grid gap-1.5">
        <label
            class="text-[11px] font-semibold text-slate-600"
        >
            {{ label }}
        </label>

        <select
            v-model="model"
            class="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-all duration-150 hover:border-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            @change="handleChange"
        >
            <slot />
        </select>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
} from 'vue'

const props = defineProps<{
    modelValue: string
    label: string
}>()

const emit = defineEmits<{
    (
        event: 'update:modelValue',
        value: string,
    ): void

    (
        event: 'change',
        value: string,
    ): void
}>()

const model = computed({
    get: () => props.modelValue,

    set: (value: string) => {
        emit(
            'update:modelValue',
            value,
        )
    },
})

const handleChange = (
    event: Event,
) => {
    const target =
        event.target as HTMLSelectElement

    emit(
        'change',
        target.value,
    )
}
</script>