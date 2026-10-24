<template>
  <section class="space-y-3">
    <div>
      <h3 class="text-sm font-semibold text-slate-800">
        Asset Information
      </h3>

      <p class="mt-0.5 text-xs text-slate-400">
        Common information about this asset.
      </p>
    </div>

    <div class="grid gap-3">
      <div
        v-if="!props.editMode"
        ref="siteDropdownRef"
        class="relative"
      >
        <FormLabel
          label="Site"
          required
        />

        <!-- Selected site / search input -->
        <div
          class="flex w-full items-center rounded-xl border bg-white transition"
          :class="
            siteDropdownOpen
              ? 'border-slate-400 ring-2 ring-slate-100'
              : 'border-slate-200'
          "
        >
          <Search
            class="ml-3 shrink-0 text-slate-400"
            :size="17"
          />

          <input
            v-model="siteSearch"
            type="text"
            :disabled="loadingSites"
            :placeholder="
              loadingSites
                ? 'Loading sites...'
                : selectedSite
                  ? selectedSite.name
                  : 'Search site by name or code...'
            "
            class="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            @focus="openSiteDropdown"
            @click="openSiteDropdown"
          />

          <button
            type="button"
            :disabled="loadingSites"
            class="mr-1 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed"
            @click.stop="toggleSiteDropdown"
          >
            <ChevronUp
              v-if="siteDropdownOpen"
              :size="18"
            />

            <ChevronDown
              v-else
              :size="18"
            />
          </button>
        </div>

        <!-- Dropdown options -->
        <div
          v-if="siteDropdownOpen"
          class="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
        >
          <button
            type="button"
            class="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-50"
            @click="selectSite(null)"
          >
            Select site
          </button>

          <button
            v-for="site in filteredSites"
            :key="site.id"
            type="button"
            class="w-full rounded-lg px-3 py-2 text-left transition hover:bg-slate-50"
            :class="
              form.siteId === site.id
                ? 'bg-slate-100'
                : ''
            "
            @click="selectSite(site)"
          >
            <span class="block text-sm font-medium text-slate-800">
              {{ site.name }}
            </span>

            <span
              v-if="site.code"
              class="mt-0.5 block text-xs text-slate-400"
            >
              {{ site.code }}
            </span>
          </button>

          <div
            v-if="filteredSites.length === 0"
            class="px-3 py-4 text-center text-sm text-slate-400"
          >
            No sites found.
          </div>
        </div>

        <p
          v-if="siteError"
          class="mt-1.5 text-xs text-red-500"
        >
          {{ siteError }}
        </p>
      </div>

      <div>
        <FormLabel
          label="Status"
          required
        />

        <select
          v-model="form.statusId"
          :disabled="loadingStatuses"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        >
          <option :value="null">
            {{
              loadingStatuses
                ? 'Loading statuses...'
                : 'Select status'
            }}
          </option>

          <option
            v-for="status in statuses"
            :key="status.id"
            :value="status.id"
          >
            {{ status.name }}
          </option>
        </select>

        <p
          v-if="statusError"
          class="mt-1.5 text-xs text-red-500"
        >
          {{ statusError }}
        </p>
      </div>

      <div>
        <FormLabel
          label="Asset Tag"
          optional
        />

        <input
          v-model="form.assetTag"
          type="text"
          placeholder="Enter asset tag"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <div>
        <FormLabel
          label="Name"
          required
        />

        <input
          v-model="form.name"
          type="text"
          placeholder="Enter asset name"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <div>
        <FormLabel
          label="Description"
          optional
        />

        <textarea
          v-model="form.description"
          rows="3"
          placeholder="Enter asset description"
          class="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <div>
        <FormLabel
          label="Installation Date"
          optional
        />

        <input
          v-model="form.installationDate"
          type="date"
          class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        />
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
        <FormLabel
          label="Warranty Start Date"
          optional
        />

          <input
            v-model="form.warrantyStart"
            type="date"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        <div>
        <FormLabel
          label="Warranty End Date"
          optional
        />

          <input
            v-model="form.warrantyEnd"
            type="date"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

import {
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-vue-next'

import type { AssetFormData } from '@/types/asset'
import type { AssetStatus } from '@/types/reference-data'
import { referenceDataApi } from '@/services/api/reference-data.api'
import { sitesApi } from '@/services/api/sites.api'
import FormLabel from '@/components/common/FormLabel.vue'

interface Props {
  assetTypeName?: string
  editMode?: boolean
}

interface Site {
  id: string
  name: string
  code?: string | null
}

const props = defineProps<Props>()

const form = defineModel<AssetFormData>({
  required: true,
})

const sites = ref<Site[]>([])
const loadingSites = ref(false)
const siteError = ref('')

const siteDropdownRef = ref<HTMLElement | null>(null)

const siteDropdownOpen = ref(false)

const siteSearch = ref('')

const statuses = ref<AssetStatus[]>([])
const loadingStatuses = ref(false)
const statusError = ref('')

const loadSites = async () => {
  loadingSites.value = true
  siteError.value = ''

  try {
    const response = await sitesApi.getAllSitesFilter()

    sites.value = response.data
  } catch (error) {
    console.error(
      'Failed to load sites:',
      error,
    )

    siteError.value = 'Failed to load sites.'
  } finally {
    loadingSites.value = false
  }
}

const selectedSite = computed(() =>
  sites.value.find(
    (site) => site.id === form.value.siteId,
  ),
)

const filteredSites = computed(() => {
  const keyword = siteSearch.value
    .trim()
    .toLowerCase()

  if (!keyword) {
    return sites.value
  }

  return sites.value.filter((site) => {
    const name = site.name.toLowerCase()
    const code = site.code?.toLowerCase() ?? ''

    return (
      name.includes(keyword) ||
      code.includes(keyword)
    )
  })
})

const openSiteDropdown = () => {
  if (loadingSites.value) {
    return
  }

  siteDropdownOpen.value = true
}

const toggleSiteDropdown = () => {
  if (loadingSites.value) {
    return
  }

  siteDropdownOpen.value =
    !siteDropdownOpen.value
}

const selectSite = (site: Site | null) => {
  form.value.siteId = site?.id ?? null

  siteSearch.value = ''

  siteDropdownOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  if (
    siteDropdownRef.value &&
    !siteDropdownRef.value.contains(target)
  ) {
    siteDropdownOpen.value = false
  }
}

const loadStatuses = async () => {
  loadingStatuses.value = true
  statusError.value = ''

  try {
    const response =
      await referenceDataApi.getStatuses()

    statuses.value = response.data
  } catch (error) {
    console.error(
      'Failed to load asset statuses:',
      error,
    )

    statusError.value =
      'Failed to load asset statuses.'
  } finally {
    loadingStatuses.value = false
  }
}

onMounted(() => {
  loadSites()
  loadStatuses()

  document.addEventListener(
    'click',
    handleClickOutside,
  )
})

onBeforeUnmount(() => {
  document.removeEventListener(
    'click',
    handleClickOutside,
  )
})
</script>