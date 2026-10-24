<template>
  <Transition name="form">
    <div
      v-if="open"
      class="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
      @click.self="close"
    >
      <div
        class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-slate-200 px-5 py-4"
        >
          <div>
            <h2 class="text-base font-semibold text-slate-800">
              Create Temporary Point
            </h2>

            <p class="mt-0.5 text-xs text-slate-500">
              Create a field observation at the selected location.
            </p>
          </div>

          <button
            type="button"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            :disabled="loading"
            @click="close"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Form -->
        <form
          class="space-y-4 p-5"
          @submit.prevent="submit"
        >
          <!-- Name -->
          <div>
            <label
              for="observation-name"
              class="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Name
            </label>

            <input
              id="observation-name"
              v-model="name"
              type="text"
              placeholder="Enter point name"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <label
              for="observation-description"
              class="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="observation-description"
              v-model="description"
              rows="3"
              placeholder="Describe what was observed..."
              class="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <!-- Location -->
          <div>
            <p class="mb-1.5 text-xs font-semibold text-slate-700">
              Location
            </p>

            <div class="grid grid-cols-2 gap-2">
              <!-- Latitude -->
              <div
                class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <p
                  class="text-[10px] font-medium uppercase tracking-wide text-slate-400"
                >
                  Latitude
                </p>

                <p class="mt-0.5 font-mono text-xs text-slate-700">
                  {{ latitude.toFixed(6) }}
                </p>
              </div>

              <!-- Longitude -->
              <div
                class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <p
                  class="text-[10px] font-medium uppercase tracking-wide text-slate-400"
                >
                  Longitude
                </p>

                <p class="mt-0.5 font-mono text-xs text-slate-700">
                  {{ longitude.toFixed(6) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Error -->
          <div
            v-if="error"
            class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600"
          >
            {{ error }}
          </div>

          <!-- Actions -->
          <div
            class="flex justify-end gap-2 pt-4"
          >
            <button
              type="button"
              class="rounded-lg px-4 py-2 text-sm font-medium border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading"
              @click="close"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading || !name.trim()"
            >
              {{ loading ? 'Creating...' : 'Create Point' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'

import { X } from 'lucide-vue-next'

import { storeToRefs } from 'pinia'

import { useMapStore } from '@/stores/map.store'
import { fieldObservationApi } from '@/services/api/field-observation.api'

const mapStore = useMapStore()

const {
  fieldObservationFormOpen,
  draftFieldObservation,
} = storeToRefs(mapStore)

const open = fieldObservationFormOpen

const name = ref('')
const description = ref('')
const loading = ref(false)
const error = ref('')

const latitude = computed(
  () => draftFieldObservation.value.latitude,
)

const longitude = computed(
  () => draftFieldObservation.value.longitude,
)

const emit = defineEmits<{
    (event: 'save'): void
}>()

watch(
  draftFieldObservation,
  (draft) => {
    name.value = draft.name
    description.value = draft.description
    error.value = ''
  },
  {
    immediate: true,
    deep: true,
  },
)

const close = () => {
  if (loading.value) return

  mapStore.closeFieldObservationForm()
}

const submit = async () => {
    if (!name.value.trim()) {
        return
    }

    error.value = ''
    loading.value = true

    try {
        const draft =
            draftFieldObservation.value

        await fieldObservationApi.create({
            name: name.value.trim(),
            description: description.value.trim(),
            geometry: {
                type: 'Point',
                coordinates: [
                    draft.longitude,
                    draft.latitude,
                ],
            },
        })

        emit('save')
    } catch (err) {
        console.error(
            'Failed to create field observation:',
            err,
        )

        error.value =
            'Failed to create the temporary point.'
    } finally {
        loading.value = false
    }
}
</script>