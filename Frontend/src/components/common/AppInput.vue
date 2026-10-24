<template>
    <div class="relative">
        <slot name="prefix" />
        <input 
            :type="type"
            :value="modelValue"
            :placeholder="placeholder"
            class="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 outline-none transition focus:border-blue-500"
            @input="onInput" 
        />

        <slot name="suffix" />
    </div>
</template>

<script setup lang="ts">
interface Props {
    modelValue: string
    placeholder?: string
    type?: string
}

withDefaults(defineProps<Props>(), {
    modelValue: '',
    placeholder: '',
    type: 'text',
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

function onInput(event: Event){
    emit('update:modelValue', (event.target as HTMLInputElement).value,)
}
</script>